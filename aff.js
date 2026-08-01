/* The Crown Report, site.js
   ============================================================
   AFFILIATE LINK, the only line you ever edit:
   Paste your Katalys tracking link between the quotes below.
   While empty, partner buttons show a "coming soon" notice
   instead of a dead or misleading link.
   ============================================================ */
window.AFF_URL = "https://track.revoffers.com/aff_c?offer_id=1389&aff_id=13097";
window.CF_ANALYTICS_TOKEN = "c9b3ba1a374d42c89c7b6598e4dfc4e7"; // Katalys / Happy Head tracking link (live July 2026)

(function () {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---- affiliate buttons ---- */
  const live = typeof AFF_URL === "string" && AFF_URL.startsWith("http");
  $$("a.aff").forEach(a => {
    if (live) { a.href = AFF_URL; a.rel = "sponsored noopener"; a.target = "_blank"; }
    else { a.href = "#"; a.classList.add("aff-pending"); }
  });
  function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2600);
  }
  document.addEventListener("click", e => {
    const a = e.target.closest("a.aff");
    if (a && !live) { e.preventDefault(); toast("Partner link isn't active yet, launching soon."); }
  });

  /* ---- reading progress ---- */
  const pb = document.getElementById("progress");
  if (pb) addEventListener("scroll", () => {
    const d = document.documentElement;
    pb.style.width = (d.scrollTop / (d.scrollHeight - d.clientHeight || 1) * 100) + "%";
  }, { passive: true });

  /* ---- mobile menu ---- */
  const mb = document.getElementById("menuBtn"), mn = document.getElementById("menu");
  if (mb && mn) {
    mb.addEventListener("click", () => {
      const open = mn.classList.toggle("open");
      document.body.classList.toggle("menu-open", open);
      mb.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", mn).forEach(a => a.addEventListener("click", () => {
      mn.classList.remove("open"); document.body.classList.remove("menu-open");
      mb.setAttribute("aria-expanded", "false");
    }));
  }

  /* ---- desktop dropdowns (click support for Safari) ---- */
  $$("nav.links > div").forEach(d => {
    const t = d.querySelector(".top");
    if (!t || t.tagName === "A") return;
    t.setAttribute("aria-haspopup", "true"); t.setAttribute("aria-expanded", "false");
    t.addEventListener("click", () => {
      if (matchMedia("(max-width:820px)").matches) return;
      const was = d.classList.contains("open");
      $$("nav.links > div.open").forEach(x => { x.classList.remove("open");
        const b = x.querySelector(".top"); if (b && b.tagName !== "A") b.setAttribute("aria-expanded", "false"); });
      if (!was) { d.classList.add("open"); t.setAttribute("aria-expanded", "true"); }
    });
  });
  document.addEventListener("click", e => {
    if (!e.target.closest("nav.links"))
      $$("nav.links > div.open").forEach(x => { x.classList.remove("open");
        const b = x.querySelector(".top"); if (b && b.tagName !== "A") b.setAttribute("aria-expanded", "false"); });
  });

  /* ---- active page marker in nav ---- */
  const here = location.pathname.split("/").pop() || "index.html";
  $$("nav.links a").forEach(a => {
    if (a.getAttribute("href") === here) {
      a.classList.add("active"); a.setAttribute("aria-current","page");
      const parent = a.closest("nav.links > div");
      if (parent) parent.querySelector(".top")?.classList.add("active");
    }
  });

  /* ---- homepage chooser ---- */
  $$(".chooser .opts button").forEach(b => b.addEventListener("click", () => {
    $$(".chooser .opts button").forEach(x => x.classList.remove("sel"));
    $$(".cpanel").forEach(x => x.classList.remove("show"));
    b.classList.add("sel");
    document.getElementById("cp-" + b.dataset.p)?.classList.add("show");
  }));

  /* ---- scroll reveal (auto-applied, staggered) ---- */
  $$("main h2, main .card, main .tool, main .rx, main .tbl-scroll, main .pc > div, main .faq details, main .note, main .toc, main .chooser, main .hero-stats").forEach(el => {
    if (!el.classList.contains("reveal")) el.classList.add("reveal");
  });
  let stg = 0, lastTop = -1;
  $$(".reveal").forEach(el => {
    const top = el.getBoundingClientRect().top;
    stg = (Math.abs(top - lastTop) < 40) ? stg + 1 : 0;
    lastTop = top;
    el.style.transitionDelay = Math.min(stg * 70, 280) + "ms";
  });

  /* ---- kinetic hero words ---- */
  const heroH1 = document.querySelector(".hero.center h1");
  if (heroH1 && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const nodes = [...heroH1.childNodes]; heroH1.textContent = "";
    let wi = 0;
    nodes.forEach(n => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { heroH1.appendChild(document.createTextNode(part)); return; }
          const s = document.createElement("span"); s.className = "w"; s.textContent = part;
          s.style.animationDelay = (wi++ * 90) + "ms"; heroH1.appendChild(s);
        });
      } else {
        n.classList && n.classList.add("w");
        n.style && (n.style.animationDelay = (wi++ * 90) + "ms");
        heroH1.appendChild(n);
      }
    });
  }

  /* ---- orb parallax ---- */
  const orbs = document.querySelector(".orbs");
  if (orbs && !matchMedia("(prefers-reduced-motion: reduce)").matches)
    addEventListener("scroll", () => { orbs.style.transform = "translateY(" + scrollY * 0.12 + "px)"; }, { passive: true });

  /* ---- condensing header ---- */
  const hd = document.querySelector("header");
  if (hd) addEventListener("scroll", () => hd.classList.toggle("scrolled", scrollY > 24), { passive: true });

  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" }) : null;
  $$(".reveal").forEach(el => io ? io.observe(el) : el.classList.add("in"));

  /* ---- sticky CTA: fallback padding + hide at footer ---- */
  const sc = document.querySelector(".sticky-cta"), ft = document.querySelector("footer");
  if (sc) document.body.classList.add("has-sticky");
  if (sc && ft && "IntersectionObserver" in window)
    new IntersectionObserver(es => { sc.style.display = es[0].isIntersecting ? "none" : ""; }).observe(ft);
})();

// cursor spotlight coords for cards/steps
document.addEventListener("pointermove", e => {
  const t = e.target.closest(".card,.step");
  if (!t) return;
  const r = t.getBoundingClientRect();
  t.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
  t.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
}, { passive: true });

// ===== v22 premium interactions =====
(function(){
  const fine = matchMedia("(hover:hover)").matches;
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // count-up numbers in hero stats and score when they enter view
  if (!calm && "IntersectionObserver" in window) {
    const els = document.querySelectorAll(".hstat b, .score b");
    const io2 = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; io2.unobserve(e.target);
      const el = e.target, parts = el.textContent.split(/(\d+\.?\d*)/);
      const t0 = performance.now(), D = 900;
      const ease = x => 1 - Math.pow(1 - x, 3);
      (function tick(now){
        const p = Math.min(1,(now - t0)/D), k = ease(p);
        el.textContent = parts.map(s => /^\d/.test(s)
          ? (s.includes(".") ? (parseFloat(s)*k).toFixed(1) : Math.round(parseFloat(s)*k))
          : s).join("");
        if (p < 1) requestAnimationFrame(tick); else el.textContent = parts.join("");
      })(t0);
    }), {threshold:.6});
    els.forEach(el => io2.observe(el));
  }

  // magnetic buttons: drift a few px toward the cursor
  if (fine && !calm) document.querySelectorAll(".btn").forEach(b => {
    b.addEventListener("pointermove", e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.22}px)`;
    });
    b.addEventListener("pointerleave", () => { b.style.transform = ""; });
  });

  // 3D tilt on cards (pairs with the spotlight)
  if (fine && !calm) document.querySelectorAll(".card").forEach(c => {
    c.addEventListener("pointermove", e => {
      const r = c.getBoundingClientRect();
      c.classList.add("tilting");
      c.style.setProperty("--ry", ((e.clientX-r.left)/r.width-.5)*6+"deg");
      c.style.setProperty("--rx", (.5-(e.clientY-r.top)/r.height)*5+"deg");
    });
    c.addEventListener("pointerleave", () => { c.classList.remove("tilting");
      c.style.removeProperty("--rx"); c.style.removeProperty("--ry"); });
  });

  // scroll-to-top with progress ring
  const bt = document.createElement("button");
  bt.id = "toTop"; bt.setAttribute("aria-label","Back to top");
  bt.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 19V6M6 12l6-6 6 6"/></svg>';
  document.body.appendChild(bt);
  addEventListener("scroll", () => {
    const d = document.documentElement, p = d.scrollTop/(d.scrollHeight-d.clientHeight||1)*100;
    bt.style.setProperty("--p", p);
    bt.classList.toggle("show", d.scrollTop > 600);
  }, {passive:true});
  bt.addEventListener("click", () => scrollTo({top:0, behavior: calm ? "auto" : "smooth"}));
})();

// ===== v23: scrollspy + smart header =====
(function(){
  // TOC scrollspy
  const toc = document.querySelector(".toc");
  if (toc && "IntersectionObserver" in window) {
    const links = [...toc.querySelectorAll('a[href^="#"]')];
    const map = new Map(links.map(a => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) {
        links.forEach(a => a.classList.remove("cur"));
        const a = map.get(e.target.id); if (a) a.classList.add("cur");
      }});
    }, { rootMargin: "-20% 0px -70% 0px" });
    map.forEach((_, id) => { const el = document.getElementById(id); if (el) spy.observe(el); });
  }
  // hide header scrolling down, show scrolling up
  const hd = document.querySelector("header");
  if (hd) {
    let last = 0;
    addEventListener("scroll", () => {
      const y = document.documentElement.scrollTop;
      if (Math.abs(y - last) < 8) return;
      hd.classList.toggle("hide", y > last && y > 220 && !document.body.classList.contains("menu-open"));
      last = y;
    }, { passive: true });
  }
})();

// share chip on article pages
(function(){
  const by = document.querySelector("main .byline");
  if (!by || !document.querySelector("main h1")) return;
  const b = document.createElement("button");
  b.type = "button"; b.textContent = "Share";
  b.style.cssText = "margin-left:10px;font:700 .68rem 'IBM Plex Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--pine);background:var(--sage);border:0;border-radius:99px;padding:4px 12px;cursor:pointer";
  b.addEventListener("click", async () => {
    const data = { title: document.title, url: location.href };
    if (navigator.share) { try { await navigator.share(data); } catch {} }
    else { try { await navigator.clipboard.writeText(location.href); b.textContent = "Link copied ✓";
      setTimeout(() => b.textContent = "Share", 1600); } catch {} }
  });
  by.appendChild(b);
})();

// privacy-first analytics (Cloudflare Web Analytics; loads only when token is set)
if (window.CF_ANALYTICS_TOKEN) {
  const s = document.createElement("script");
  s.defer = true;
  s.src = "https://static.cloudflareinsights.com/beacon.min.js";
  s.setAttribute("data-cf-beacon", JSON.stringify({ token: window.CF_ANALYTICS_TOKEN }));
  document.head.appendChild(s);
}

// conversion layer: next-step box + mobile sticky quiz bar on article pages
(function(){
  const skip = /admin|hair-loss-quiz|hair-loss-cost-calculator|share-your-story|reader-results|articles|compare-photos|shed-checker|404/;
  if (skip.test(location.pathname)) return;
  if (location.pathname === "/" || /index\.html$/.test(location.pathname)) return;
  const by = document.querySelector("main .byline");
  if (!by) return;

  // 1) "Your next step" box: injected before the first disclaimer accordion
  const fp = document.querySelector("main details.fp");
  if (fp && !document.getElementById("nextsteps")) {
    const d = document.createElement("div");
    d.id = "nextsteps"; d.className = "note";
    d.innerHTML = '<strong>Your next step:</strong> not sure what fits your case? The <a href="hair-loss-quiz.html">60-second quiz</a> routes you, the <a href="best-hair-loss-treatment-budget.html">budget guide</a> maps every price tier, and the <a href="hair-loss-cost-calculator.html">cost calculator</a> shows what each path totals over the years.';
    fp.parentNode.insertBefore(d, fp);
  }

  // 2) dismissible sticky quiz bar, appears after 35% scroll, once per session
  if (sessionStorage.getItem("cr_bar")) return;
  const bar = document.createElement("div");
  bar.id = "quizbar";
  bar.innerHTML = '<span>Not sure which treatment fits <b>you</b>?</span><a href="hair-loss-quiz.html">60-second quiz →</a><button type="button" aria-label="Dismiss">✕</button>';
  document.body.appendChild(bar);
  bar.querySelector("button").addEventListener("click", () => {
    bar.classList.remove("on");
    sessionStorage.setItem("cr_bar", "1");
  });
  let shown = false;
  addEventListener("scroll", () => {
    if (shown) return;
    const p = scrollY / (document.documentElement.scrollHeight - innerHeight);
    if (p > 0.65) { bar.classList.add("on"); shown = true; }
  }, { passive: true });
})();

// Apple-style scroll-scrub for the hero crown (activates only if the orbit video exists)
(function(){
  const stage = document.getElementById("crownStage");
  const vid = document.getElementById("crownScrub");
  const still = stage && stage.querySelector(".crown-still");
  if (!stage) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let ready = false;
  if (vid) vid.addEventListener("loadedmetadata", () => {
    if (!vid.duration || !isFinite(vid.duration)) return;
    ready = true;
    stage.classList.add("playing");
    tick();
  });
  if (vid) vid.addEventListener("error", () => { /* no video yet: still image stays */ });

  let target = 0, current = 0, raf = null;
  function compute(){
    const r = stage.getBoundingClientRect();
    // progress 0..1 as the stage travels through the viewport
    const p = 1 - (r.top + r.height * 0.5) / (innerHeight + r.height * 0.5);
    return Math.max(0, Math.min(1, p));
  }
  function tick(){
    if (!ready) return;
    target = compute();
    current += (target - current) * 0.12;              // smooth easing
    if (vid.duration) vid.currentTime = current * vid.duration * 0.999;
    // subtle parallax lift on the whole stage
    stage.style.transform = "translateY(" + (current * -18).toFixed(2) + "px) scale(" + (1 + current * 0.05).toFixed(4) + ")";
    raf = requestAnimationFrame(tick);
  }
  addEventListener("scroll", () => { if (ready && !raf) tick(); }, { passive: true });

  // static-image fallback parallax when no video is present
  if (still) {
    addEventListener("scroll", () => {
      if (ready) return;
      const p = compute();
      stage.style.transform = "translateY(" + (p * -14).toFixed(2) + "px) scale(" + (1 + p * 0.04).toFixed(4) + ")";
    }, { passive: true });
  }
})();

// scroll-driven crown rotation via transparent sprite sequence (Apple-style)
(function(){
  const stage = document.getElementById("crownStage");
  const sprite = document.getElementById("crownSprite");
  if (!stage || !sprite) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const COLS = 6, ROWS = 4, TOTAL = COLS * ROWS;
  const img = new Image();
  img.onload = () => { stage.classList.add("seq"); update(); };
  img.src = "img/crown-sprite.png";

  let cur = 0, tgt = 0, raf = null;
  function progress(){
    const r = stage.getBoundingClientRect();
    const p = 1 - (r.top + r.height * 0.5) / (innerHeight + r.height * 0.5);
    return Math.max(0, Math.min(1, p));
  }
  function draw(p){
    const i = Math.min(TOTAL - 1, Math.max(0, Math.round(p * (TOTAL - 1))));
    const cx = i % COLS, cy = Math.floor(i / COLS);
    sprite.style.backgroundPosition = (cx * 100 / (COLS - 1)) + "% " + (cy * 100 / (ROWS - 1)) + "%";
  }
  function update(){
    tgt = progress();
    cur += (tgt - cur) * 0.16;
    draw(cur);
    if (Math.abs(tgt - cur) > 0.001) { raf = requestAnimationFrame(update); }
    else { raf = null; }
  }
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  addEventListener("resize", () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
})();

// ===== CONVERSION + ENGAGEMENT LAYER =====
(function(){
  const isArticle = document.querySelector("main .byline") && !/admin|articles|reader-results|share-your-story|404/.test(location.pathname);

  // 1) Reading progress ring already exists; add estimated read time to byline if absent
  if (isArticle) {
    const by = document.querySelector("main .byline");
    if (by && !/min read/.test(by.textContent)) {
      const words = (document.querySelector("main").innerText || "").split(/\s+/).length;
      const mins = Math.max(2, Math.round(words / 220));
      const s = document.createElement("span");
      s.textContent = mins + " min read · ";
      by.insertBefore(s, by.firstChild);
    }
  }

  // 2) "Keep reading" related-articles strip, auto-built from the nav (zero maintenance)
  if (isArticle && !document.getElementById("keepReading")) {
    const here = location.pathname.split("/").pop();
    const links = [...document.querySelectorAll('nav.links .dd a')]
      .map(a => ({href: a.getAttribute("href"), text: a.textContent.trim()}))
      .filter(x => x.href && x.href.endsWith(".html") && x.href !== here && !/^All articles/.test(x.text));
    // pick 3 pseudo-randomly but stable per page
    let seed = here.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
    const picks = [];
    while (picks.length < 3 && links.length) {
      seed = (seed * 9301 + 49297) % 233280;
      picks.push(links.splice(seed % links.length, 1)[0]);
    }
    if (picks.length) {
      const box = document.createElement("div");
      box.id = "keepReading";
      box.className = "keep-reading";
      box.innerHTML = "<b>Keep reading</b>" + picks.map(p =>
        `<a href="${p.href}">${p.text} <span aria-hidden="true">→</span></a>`).join("");
      const fp = document.querySelector("main details.fp");
      (fp ? fp.parentNode.insertBefore(box, fp) : document.querySelector("main").appendChild(box));
    }
  }

  // 3) Copy-link toast on the Share button (small delight, drives shares)
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("main .byline button");
    if (!b) return;
    setTimeout(() => {
      if (!/copied/i.test(b.textContent)) return;
      const t = document.createElement("div");
      t.className = "toast"; t.textContent = "Link copied";
      document.body.appendChild(t);
      requestAnimationFrame(() => t.classList.add("on"));
      setTimeout(() => { t.classList.remove("on"); setTimeout(()=>t.remove(), 400); }, 1800);
    }, 60);
  });
})();
