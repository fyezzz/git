import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);
document.documentElement.classList.add("js");

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const NEON = new THREE.Color("#02ef7d");
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------------- Loader ---------------- */
const loaderBar = $(".loader-bar span");
const setLoad = (p) => (loaderBar.style.width = `${p}%`);
setLoad(30);

/* ---------------- Smooth scroll ---------------- */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
$$('a[href^="#"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    const target = $(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    const plan = a.dataset.plan;
    if (plan) $("#lead-form select[name=plan]").value = plan;
    lenis ? lenis.scrollTo(target, { offset: 0, duration: 1.6 }) : target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }),
);

/* ---------------- WebGL scene ---------------- */
const canvas = $("#gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
const BG = new THREE.Color("#0b0f17").convertSRGBToLinear();
renderer.setClearColor(BG);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(BG, 0.045);
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0, 0, 9);

const rig = new THREE.Group();
scene.add(rig);

// Core: shader sphere with fresnel glow + noise displacement
const coreUniforms = { uTime: { value: 0 }, uPulse: { value: 0 }, uColor: { value: NEON } };
const core = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.15, 48),
  new THREE.ShaderMaterial({
    uniforms: coreUniforms,
    transparent: true,
    vertexShader: /* glsl */ `
      uniform float uTime; uniform float uPulse;
      varying vec3 vN; varying vec3 vV; varying float vD;
      float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164)))*43758.5453); }
      float n(vec3 p){ vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
                   mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z); }
      void main(){
        float d = n(normal*2.2 + uTime*0.35) * (0.22 + uPulse*0.25);
        vD = d;
        vec3 p = position + normal * d;
        vec4 mv = modelViewMatrix * vec4(p,1.);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying vec3 vN; varying vec3 vV; varying float vD;
      void main(){
        float fr = pow(1. - max(dot(vN, vV), 0.), 2.4);
        vec3 c = mix(vec3(0.004,0.012,0.016), uColor * 0.75, fr*1.05 + vD*0.55);
        gl_FragColor = vec4(c, 0.88);
      }`,
  }),
);
rig.add(core);

// Wireframe shell
const shell = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.75, 1),
  new THREE.MeshBasicMaterial({ color: NEON, wireframe: true, transparent: true, opacity: 0.22 }),
);
rig.add(shell);

// Five orbit rings = five links of the operating chain, each with a node
const rings = [];
for (let i = 0; i < 5; i++) {
  const r = 2.3 + i * 0.42;
  const g = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(r, 0.006 + (i === 2 ? 0.006 : 0), 8, 220),
    new THREE.MeshBasicMaterial({ color: NEON, transparent: true, opacity: 0.55 - i * 0.07 }),
  );
  const node = new THREE.Mesh(new THREE.SphereGeometry(0.055 + (4 - i) * 0.01, 16, 16), new THREE.MeshBasicMaterial({ color: "#d9ffe9" }));
  node.position.x = r;
  g.add(ring, node);
  g.rotation.set(Math.PI / 2 + (i - 2) * 0.32, (i - 2) * 0.22, 0);
  g.userData = { speed: 0.12 + i * 0.045, node, r };
  rings.push(g);
  rig.add(g);
}

// Particle field
const COUNT = innerWidth < 760 ? 1400 : 3200;
const pos = new Float32Array(COUNT * 3);
const seeds = new Float32Array(COUNT);
for (let i = 0; i < COUNT; i++) {
  const rad = 4 + Math.random() * 26;
  const th = Math.random() * Math.PI * 2;
  const ph = Math.acos(2 * Math.random() - 1);
  pos.set([rad * Math.sin(ph) * Math.cos(th), rad * Math.sin(ph) * Math.sin(th) * 0.6, rad * Math.cos(ph) - 6], i * 3);
  seeds[i] = Math.random();
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
pGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
const pUniforms = { uTime: { value: 0 }, uScroll: { value: 0 }, uColor: { value: NEON }, uPR: { value: renderer.getPixelRatio() } };
const particles = new THREE.Points(
  pGeo,
  new THREE.ShaderMaterial({
    uniforms: pUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime; uniform float uScroll; uniform float uPR; attribute float aSeed; varying float vA;
      void main(){
        vec3 p = position;
        p.y += sin(uTime*0.3 + aSeed*6.28) * 0.35;
        p.z += mod(uScroll*14. + aSeed*30., 30.) - 15.;
        vec4 mv = modelViewMatrix * vec4(p,1.);
        gl_PointSize = (1.2 + aSeed*2.6) * uPR * (12. / -mv.z);
        vA = smoothstep(32., 4., -mv.z) * (0.35 + aSeed*0.65);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying float vA;
      void main(){ float d = length(gl_PointCoord-.5); if(d>.5) discard; gl_FragColor = vec4(mix(uColor, vec3(1.), .25), vA*(1.-d*2.)); }`,
  }),
);
scene.add(particles);

// Floor grid for depth
const grid = new THREE.GridHelper(80, 80, NEON, NEON);
grid.material.transparent = true;
grid.material.opacity = 0.06;
grid.position.y = -4;
scene.add(grid);

// Bloom
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.6, 0.45, 0.18);
composer.addPass(bloom);
composer.addPass(new OutputPass());

/* Camera keyframes per section: scroll progress blends between them */
const shots = [
  { x: 3.2, y: 0, z: 9, rx: 0, s: 1 },       // hero: core right of headline
  { x: -2.6, y: 0.4, z: 7, rx: 0.25, s: 1.1 }, // problem
  { x: 0, y: 1.2, z: 11, rx: 0.9, s: 0.85 },   // system: look down onto rings
  { x: 2.8, y: -0.4, z: 6.5, rx: -0.2, s: 1.2 },// economics
  { x: -3.4, y: 0, z: 10, rx: 0.4, s: 0.9 },      // plans
  { x: 3.4, y: -0.8, z: 13, rx: 1.3, s: 0.7 },   // activation
  { x: 2.6, y: 0, z: 9, rx: 0.1, s: 0.9 },     // apply
];
if (innerWidth < 760) shots.forEach((s) => ((s.x = 0), (s.y = -2.2), (s.z += 4), (s.s *= 0.8)));
const shotState = { ...shots[0] };
const sections = $$("main > section");
sections.forEach((sec, i) => {
  const next = shots[Math.min(i, shots.length - 1)];
  ScrollTrigger.create({
    trigger: sec,
    start: "top 75%",
    end: "bottom 25%",
    onToggle: (self) => self.isActive && gsap.to(shotState, { ...next, duration: 2.2, ease: "expo.out", overwrite: true }),
  });
});

// Mouse
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener("pointermove", (e) => {
  mouse.tx = (e.clientX / innerWidth) * 2 - 1;
  mouse.ty = -((e.clientY / innerHeight) * 2 - 1);
});

let scrollP = 0;
let velocity = 0;
ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => ((scrollP = s.progress), (velocity = s.getVelocity())) });

const clock = new THREE.Clock();
let running = true;
document.addEventListener("visibilitychange", () => (running = !document.hidden));

function frame() {
  requestAnimationFrame(frame);
  if (!running) return;
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  mouse.x += (mouse.tx - mouse.x) * 0.06;
  mouse.y += (mouse.ty - mouse.y) * 0.06;
  const vel = Math.min(Math.abs(velocity) / 3000, 1);

  coreUniforms.uTime.value = t;
  coreUniforms.uPulse.value += (vel - coreUniforms.uPulse.value) * 0.08;
  pUniforms.uTime.value = t;
  pUniforms.uScroll.value = scrollP;

  rig.position.set(shotState.x, shotState.y, 0);
  rig.scale.setScalar(shotState.s);
  rig.rotation.y += dt * (0.12 + vel * 1.2);
  rig.rotation.x += (shotState.rx + mouse.y * 0.35 - rig.rotation.x) * 0.05;
  rig.rotation.z += (mouse.x * -0.25 - rig.rotation.z) * 0.05;
  shell.rotation.x -= dt * 0.18;
  shell.rotation.y += dt * 0.1;
  for (const g of rings) {
    const { speed, node, r } = g.userData;
    const a = t * speed * (1 + vel * 3);
    node.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
  }

  camera.position.x += (mouse.x * 0.9 - camera.position.x) * 0.04;
  camera.position.y += (mouse.y * 0.6 - camera.position.y) * 0.04;
  camera.position.z += (shotState.z - camera.position.z) * 0.05;
  camera.lookAt(shotState.x * 0.35, shotState.y * 0.5, 0);
  bloom.strength = 0.6 + vel * 0.8;
  velocity *= 0.92;

  composer.render();
}

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
  ScrollTrigger.refresh();
});

/* ---------------- Text + reveals ---------------- */
function splitWords(el) {
  const walk = (node) => {
    [...node.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(part);
          const w = document.createElement("span");
          w.className = "w";
          const inner = document.createElement("span");
          inner.textContent = part;
          w.append(inner);
          frag.append(w);
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1 && c.tagName !== "BR") walk(c);
    });
  };
  walk(el);
  return $$(".w > span", el);
}

function counters(root) {
  $$("[data-count]", root).forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || "0", 10);
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: reduced ? 0 : 2, ease: "power3.out", onUpdate: () => (el.textContent = o.v.toFixed(dec)) });
  });
}

function intro() {
  $(".loader").classList.add("done");
  if (reduced) {
    $$("[data-count]").forEach((el) => (el.textContent = parseFloat(el.dataset.count).toFixed(parseInt(el.dataset.decimals || "0", 10))));
    return;
  }
  $$(".split").forEach((el) => {
    const words = splitWords(el);
    const inHero = el.closest(".hero");
    gsap.from(words, {
      yPercent: 115,
      rotate: 6,
      duration: 1.3,
      ease: "expo.out",
      stagger: 0.05,
      delay: inHero ? 0.3 : 0,
      scrollTrigger: inHero ? undefined : { trigger: el, start: "top 85%" },
    });
  });
  $$(".reveal").forEach((el) => {
    const inHero = el.closest(".hero");
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "expo.out",
      delay: inHero ? 0.7 : 0,
      scrollTrigger: inHero ? undefined : { trigger: el, start: "top 88%" },
      onStart: () => counters(el),
    });
  });
  gsap.from(canvas, { opacity: 0, duration: 2.4, ease: "power2.out" });
  gsap.from(shotState, { z: 22, s: 0.4, duration: 3, ease: "expo.out" });

  // Hero parallax out
  gsap.to(".hero > *:not(.scroll-hint)", { yPercent: -40, opacity: 0, ease: "none", stagger: 0.03, scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  // Marquee speed follows scroll velocity
  const track = $(".marquee-track");
  ScrollTrigger.create({ trigger: ".marquee", start: "top bottom", end: "bottom top", onUpdate: (s) => gsap.to(track, { skewX: gsap.utils.clamp(-12, 12, s.getVelocity() / -250), duration: 0.4, overwrite: true }) });

  // Pinned horizontal system rail
  const rail = $(".rail");
  const dist = () => rail.scrollWidth - innerWidth + 40;
  gsap.to(rail, {
    x: () => -dist(),
    ease: "none",
    scrollTrigger: {
      trigger: ".system",
      pin: ".system-pin",
      start: "top top",
      end: () => `+=${dist() + innerHeight * 0.3}`,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (s) => gsap.set(".progress span", { scaleX: s.progress }),
    },
  });
  $$(".step").forEach((step, i) => gsap.from(step, { rotateY: -28, z: -200, opacity: 0.2, transformPerspective: 1200, scrollTrigger: { trigger: ".system", start: () => `top+=${i * 120} top`, end: () => `top+=${i * 120 + 500} top`, scrub: true } }));

  gsap.from(".eq-line", { scaleX: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".eq", start: "top 80%" } });
}

/* ---------------- Pointer interactions ---------------- */
if (finePointer && !reduced) {
  const cursor = $(".cursor");
  const cx = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
  const cy = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
  addEventListener("pointermove", (e) => (cx(e.clientX), cy(e.clientY)));
  $$("a, button, input, select, textarea, .tilt").forEach((el) => {
    el.addEventListener("pointerenter", () => cursor.classList.add("hover"));
    el.addEventListener("pointerleave", () => cursor.classList.remove("hover"));
  });

  $$("[data-magnetic]").forEach((el) => {
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.35);
      yTo((e.clientY - r.top - r.height / 2) * 0.45);
    });
    el.addEventListener("pointerleave", () => (xTo(0), yTo(0)));
  });

  $$(".tilt").forEach((el) => {
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3" });
    gsap.set(el, { transformPerspective: 900 });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
      rx((0.5 - py) * 10);
      ry((px - 0.5) * 12);
    });
    el.addEventListener("pointerleave", () => (rx(0), ry(0)));
  });
}

// Nav background
ScrollTrigger.create({ start: 40, end: "max", onToggle: (s) => $(".nav").classList.toggle("scrolled", s.isActive) });

/* ---------------- Economics calculator ---------------- */
const usd = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const ip = $("#i-price"), ic = $("#i-cost"), idl = $("#i-deals");
const fill = (el) => el.style.setProperty("--fill", `${((el.value - el.min) / (el.max - el.min)) * 100}%`);
function calc() {
  const price = +ip.value, cost = +ic.value, deals = +idl.value;
  const gp = price - cost;
  const margin = price > 0 ? (gp / price) * 100 : 0;
  $("#o-price").textContent = usd(price);
  $("#o-cost").textContent = usd(cost);
  $("#o-deals").textContent = deals;
  $("#r-gp").textContent = usd(gp);
  $("#r-margin").textContent = `${margin.toFixed(1)}%`;
  $("#r-month").textContent = usd(gp * deals);
  const meter = $("#r-meter");
  meter.style.width = `${Math.max(0, Math.min(100, margin))}%`;
  const flag = $("#r-flag");
  flag.className = "calc-flag mono";
  if (margin < 0) { flag.textContent = "Losing money on every deal. Re-scope before you sign."; flag.classList.add("bad"); meter.style.background = "#ff5c7a"; }
  else if (margin < 40) { flag.textContent = "Thin margin. Delivery overruns will wipe it out."; flag.classList.add("warn"); meter.style.background = "#f5b84b"; }
  else { flag.textContent = "Healthy margin. This scope is safe to sell."; meter.style.background = ""; }
  [ip, ic, idl].forEach(fill);
}
[ip, ic, idl].forEach((el) => el.addEventListener("input", calc));
calc();

/* ---------------- Billing toggle ---------------- */
$$(".billing button").forEach((b) =>
  b.addEventListener("click", () => {
    $$(".billing button").forEach((x) => x.classList.toggle("on", x === b));
    const k = b.dataset.billing;
    $$(".plan [data-mo]").forEach((el) => {
      if (reduced) return (el.textContent = el.dataset[k]);
      gsap.to(el, { yPercent: -60, opacity: 0, duration: 0.2, onComplete: () => { el.textContent = el.dataset[k]; gsap.fromTo(el, { yPercent: 60 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: "expo.out" }); } });
    });
  }),
);

/* ---------------- Form ---------------- */
const form = $("#lead-form");
const msg = $(".form-msg", form);
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.className = "form-msg full";
  let ok = true;
  $$("[required]", form).forEach((el) => {
    const bad = !el.value.trim() || (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value));
    el.setAttribute("aria-invalid", String(bad));
    if (bad) ok = false;
  });
  if (!ok) { msg.textContent = "Add your name and a valid email."; msg.classList.add("err"); return; }

  const data = Object.fromEntries(new FormData(form));
  const { formEndpoint, contactEmail } = window.SITE_CONFIG;
  if (!formEndpoint) {
    const body = `Name: ${data.name}\nEmail: ${data.email}\nAgency: ${data.company}\nPlan: ${data.plan}\n\n${data.need}`;
    location.href = `mailto:${contactEmail}?subject=${encodeURIComponent("Diagnosis request: " + data.name)}&body=${encodeURIComponent(body)}`;
    msg.textContent = "Opening your email app to send the request…";
    msg.classList.add("ok");
    return;
  }
  const btn = $("button[type=submit]", form);
  btn.disabled = true;
  btn.textContent = "Sending…";
  try {
    const res = await fetch(formEndpoint, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error(`The form service answered ${res.status}`);
    form.reset();
    msg.textContent = "Got it. We'll reply within one business day to schedule your diagnosis.";
    msg.classList.add("ok");
  } catch (err) {
    msg.textContent = `Couldn't send: ${err.message}. Email us at ${contactEmail}.`;
    msg.classList.add("err");
  } finally {
    btn.disabled = false;
    btn.textContent = "Book my diagnosis →";
  }
});

$("#yr").textContent = new Date().getFullYear();

/* ---------------- Boot ---------------- */
setLoad(80);
const boot = () => {
  setLoad(100);
  frame();
  setTimeout(intro, 350);
};
document.fonts ? document.fonts.ready.then(boot) : addEventListener("load", boot);
