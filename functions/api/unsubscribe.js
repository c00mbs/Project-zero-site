const sha256 = async value => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))].map(b=>b.toString(16).padStart(2,"0")).join("");
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url); const token = url.searchParams.get("token") || "";
  if (!env.DB || !/^[a-f0-9]{64}$/.test(token)) return new Response("Invalid unsubscribe link.", {status:400});
  const hash = await sha256(token);
  const result = await env.DB.prepare("UPDATE subscribers SET status='unsubscribed', updated_at=? WHERE unsubscribe_token_hash=?").bind(Math.floor(Date.now()/1000), hash).run();
  return new Response(result.meta?.changes ? "You have been unsubscribed from PROJECT ZERO updates." : "This link is invalid or has already been used.", {headers:{"content-type":"text/plain; charset=utf-8"}});
}