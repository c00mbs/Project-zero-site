const sha256 = async value => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))].map(b=>b.toString(16).padStart(2,"0")).join("");
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url); const token = url.searchParams.get("token") || "";
  if (!env.DB || !/^[a-f0-9]{64}$/.test(token)) return Response.redirect(`${env.SITE_URL}/thank-you.html?status=invalid`, 302);
  const hash = await sha256(token); const now = Math.floor(Date.now()/1000);
  const result = await env.DB.prepare("UPDATE subscribers SET status='confirmed', confirm_token_hash=NULL, confirm_expires=NULL, updated_at=? WHERE confirm_token_hash=? AND confirm_expires>? AND status='pending'").bind(now, hash, now).run();
  if (result.meta?.changes) return Response.redirect(`${env.SITE_URL}/welcome.html`, 302);
  return Response.redirect(`${env.SITE_URL}/thank-you.html?status=expired`, 302);
}