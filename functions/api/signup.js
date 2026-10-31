const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const hex = bytes => [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2,"0")).join("");
const sha256 = async value => hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
export async function onRequestPost({ request, env }) {
  if (!env.DB || !env.RESEND_API_KEY || !env.FROM_EMAIL || !env.SITE_URL) return json({ error: "Signup is not configured yet. Please try again later." }, 503);
  const origin = request.headers.get("Origin"); const siteOrigin = new URL(env.SITE_URL).origin;
  if (origin && origin !== siteOrigin) return json({ error: "Invalid request origin." }, 403);
  let body; try { body = await request.json(); } catch { return json({ error: "Invalid request." }, 400); }
  if (body.company) return json({ ok: true });
  const email = String(body.email || "").trim().toLowerCase();
  if (!body.consent || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Please enter a valid email and agree to receive updates." }, 400);
  const ip = request.headers.get("CF-Connecting-IP") || "unknown"; const ipHash = await sha256(`${env.RATE_LIMIT_SALT || env.SITE_URL}:${ip}`);
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare("DELETE FROM signup_attempts WHERE created_at < ?").bind(now - 3600).run();
  const attempts = await env.DB.prepare("SELECT COUNT(*) AS total FROM signup_attempts WHERE ip_hash = ? AND created_at > ?").bind(ipHash, now - 3600).first();
  if ((attempts?.total || 0) >= 5) return json({ error: "Too many attempts. Please try again later." }, 429);
  await env.DB.prepare("INSERT INTO signup_attempts (ip_hash, created_at) VALUES (?, ?)").bind(ipHash, now).run();
  const existing = await env.DB.prepare("SELECT status FROM subscribers WHERE email = ?").bind(email).first();
  if (existing?.status === "confirmed") return json({ ok: true });
  const token = hex(crypto.getRandomValues(new Uint8Array(32))); const tokenHash = await sha256(token);
  const unsubscribeToken = hex(crypto.getRandomValues(new Uint8Array(32))); const unsubscribeHash = await sha256(unsubscribeToken); const expires = now + 86400;
  await env.DB.prepare(`INSERT INTO subscribers (email, status, confirm_token_hash, confirm_expires, unsubscribe_token_hash, consent_at, created_at, updated_at) VALUES (?, 'pending', ?, ?, ?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET status='pending', confirm_token_hash=excluded.confirm_token_hash, confirm_expires=excluded.confirm_expires, unsubscribe_token_hash=excluded.unsubscribe_token_hash, consent_at=excluded.consent_at, updated_at=excluded.updated_at`).bind(email, tokenHash, expires, unsubscribeHash, now, now, now).run();
  const confirmUrl = `${siteOrigin}/api/verify?token=${token}`; const unsubscribeUrl = `${siteOrigin}/api/unsubscribe?token=${unsubscribeToken}`;
  const mail = await fetch("https://api.resend.com/emails", { method:"POST", headers:{"Authorization":`Bearer ${env.RESEND_API_KEY}`,"Content-Type":"application/json"}, body:JSON.stringify({from:env.FROM_EMAIL,to:[email],subject:"Confirm your PROJECT ZERO transmission",html:`<div style="background:#10150f;color:#e7eadf;padding:36px;font-family:Arial,sans-serif"><p style="color:#bdcf9d;letter-spacing:3px">PROJECT ZERO / SUBJECT ZERO</p><h1 style="font-size:32px">ONE LAST STEP.</h1><p>Your request to receive PROJECT ZERO development updates has been received.</p><p>Confirm your email address to complete registration.</p><p style="margin:32px 0"><a href="${confirmUrl}" style="background:#bdcf9d;color:#10150f;padding:15px 22px;text-decoration:none;font-weight:bold">CONFIRM MY EMAIL</a></p><p style="color:#9aa493;font-size:12px">This link expires in 24 hours. If you did not request these updates, you can ignore this message. <a href="${unsubscribeUrl}" style="color:#bdcf9d">Unsubscribe</a>.</p></div>`}) });
  if (!mail.ok) { await env.DB.prepare("UPDATE subscribers SET status='pending', confirm_token_hash=NULL, confirm_expires=NULL WHERE email=?").bind(email).run(); return json({ error: "We couldn't send the confirmation email. Please try again shortly." }, 502); }
  return json({ ok: true });
}