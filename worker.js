/* The Crown Report — Worker entry.
   Serves the static site via ASSETS and implements the submissions API.
   Bindings required: ASSETS (auto from wrangler.jsonc), STORIES (KV), ADMIN_KEY (secret). */

const json = (d, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });

// Hardcoded PBKDF2 hash of the built-in admin password (safe to store publicly; cannot be reversed).
const ADMIN_HASH = "863c0f3c3dccf7a9e2eb9cb1fb14a973:a6d37da439b3eb3d8ec95b0b3792801ce36ca1e7a467707987fb89c6806cd177";
const ADMIN_COMBO_HASH = "9b9e43e27527f93279d6d966da1cb364:024ee4709b336325743d97fad46c1a204e15ebda6352f06445a42e5d7658ad64"; // hash of "username:password"

async function verifyPassword(password, stored) {
  try {
    const [saltHex, hashHex] = stored.split(":");
    const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
    const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password),
      { name: "PBKDF2" }, false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, 256);
    const got = [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, "0")).join("");
    // constant-time-ish compare
    if (got.length !== hashHex.length) return false;
    let diff = 0; for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ hashHex.charCodeAt(i);
    return diff === 0;
  } catch { return false; }
}

async function authed(req, env) {
  const h = req.headers.get("Authorization") || "";
  if (!h.startsWith("Bearer ")) return false;
  const cred = h.slice(7);
  // Method 1: built-in hashed password (works with zero setup)
  if (await verifyPassword(cred, ADMIN_HASH)) return true;
  // Method 1b: built-in username:password combo
  if (await verifyPassword(cred, ADMIN_COMBO_HASH)) return true;
  // Method 2: the ADMIN_KEY secret, if you set one (optional backup)
  const k = env.ADMIN_KEY || "";
  return k.length >= 12 && cred === k;
}

async function allSubs(env) {
  const out = [];
  let cursor;
  do {
    const page = await env.STORIES.list({ prefix: "sub:", cursor });
    for (const k of page.keys) {
      const v = await env.STORIES.get(k.name);
      if (v) { try { out.push({ id: k.name, ...JSON.parse(v) }); } catch {} }
    }
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);
  return out.sort((a, b) => b.ts - a.ts);
}

async function handleSubmit(request, env) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const rlKey = "rl:" + ip;
  const count = parseInt((await env.STORIES.get(rlKey)) || "0", 10);
  if (count >= 5) return json({ ok: false, error: "Too many submissions. Try again in an hour." }, 429);
  await env.STORIES.put(rlKey, String(count + 1), { expirationTtl: 3600 });

  let d;
  try { d = await request.json(); } catch { return json({ ok: false, error: "Bad request" }, 400); }
  if (d.website) return json({ ok: true }); // honeypot
  const name = (d.name || "").trim().slice(0, 60);
  const treatment = (d.treatment || "").trim().slice(0, 120);
  const months = (d.months || "").trim().slice(0, 30);
  const story = (d.story || "").trim().slice(0, 6000);
  const email = (d.email || "").trim().slice(0, 120);
  let photo = "";
  if (typeof d.photo === "string" && d.photo.startsWith("data:image/jpeg;base64,")) {
    if (d.photo.length > 500000) return json({ ok: false, error: "Photo too large. Please use a smaller image." }, 400);
    photo = d.photo;
  }
  if (!name || !treatment || !story || story.length < 80 || !d.consent)
    return json({ ok: false, error: "Please fill name, treatment, a story of at least 80 characters, and the consent box." }, 400);
  const id = "sub:" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  await env.STORIES.put(id, JSON.stringify({ name, treatment, months, story, email, photo, status: "pending", ts: Date.now() }));
  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const m = request.method;
    try {
      if (pathname === "/api/submit" && m === "POST") return await handleSubmit(request, env);

      if (pathname === "/api/stories" && m === "GET") {
        const subs = await allSubs(env);
        const pub = subs.filter(s => s.status === "approved").slice(0, 100)
          .map(({ name, treatment, months, story, photo, ts }) => ({ name, treatment, months, story, photo: photo || "", ts }));
        return json({ ok: true, stories: pub });
      }

      if (pathname === "/api/admin/list" && m === "GET") {
        if (!(await authed(request, env))) return json({ ok: false, error: "Unauthorized" }, 401);
        return json({ ok: true, subs: await allSubs(env) });
      }

      if (pathname === "/api/admin/update" && m === "POST") {
        if (!(await authed(request, env))) return json({ ok: false, error: "Unauthorized" }, 401);
        let d; try { d = await request.json(); } catch { return json({ ok: false }, 400); }
        const { id, action } = d || {};
        if (!id || !id.startsWith("sub:")) return json({ ok: false, error: "Bad id" }, 400);
        if (action === "delete") { await env.STORIES.delete(id); return json({ ok: true }); }
        if (!["approve", "reject"].includes(action)) return json({ ok: false, error: "Bad action" }, 400);
        const v = await env.STORIES.get(id);
        if (!v) return json({ ok: false, error: "Not found" }, 404);
        const s = JSON.parse(v);
        s.status = action === "approve" ? "approved" : "rejected";
        await env.STORIES.put(id, JSON.stringify(s));
        return json({ ok: true });
      }

      if (pathname.startsWith("/api/")) return json({ ok: false, error: "Not found" }, 404);
    } catch (e) {
      return json({ ok: false, error: "Server error" }, 500);
    }
    // static assets, with security headers guaranteed at the worker level
    const res = await env.ASSETS.fetch(request);
    const r = new Response(res.body, res);
    r.headers.set("X-Content-Type-Options", "nosniff");
    r.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    r.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    r.headers.set("Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; connect-src 'self' https://cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
    return r;
  }
};
