// Links, email and phone come from config.js
(() => {
  const grid = document.querySelector(".link-grid");
  if (grid && Array.isArray(PROFILE.socials)) grid.innerHTML = PROFILE.socials.filter(s => s.url).map(s => `<a class="link-card" style="--card-color:${s.color || "#2449c6"};--icon-ink:${s.ink || "#fff"}" href="${s.url}" target="_blank" rel="noreferrer"><span class="link-icon">${s.icon || "↗"}</span><span class="link-text"><b>${s.name}</b><small>${s.note || ""}</small></span><span class="link-arrow">↗</span></a>`).join("");
  document.querySelectorAll('a[href^="mailto:"]').forEach(a => a.href = "mailto:" + PROFILE.email);
  if (!PROFILE.showEditNotes) document.querySelectorAll(".edit-note, .contact-edit").forEach(n => n.remove());
})();

const toast = document.getElementById("toast");
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}

document.getElementById("soundToggle").addEventListener("click", () => {
  const button = document.getElementById("soundToggle");
  const pressed = button.getAttribute("aria-pressed") === "true";
  button.setAttribute("aria-pressed", String(!pressed));
  document.getElementById("soundLabel").textContent = `SOUND: ${pressed ? "OFF" : "ON"}`;
  // Sound is intentionally not auto-played. This toggle is a placeholder for optional UI sounds.
  showToast(pressed ? "Quiet mode. As the internet intended." : "Sound setting enabled — add your own click sound if you want.");
});

document.getElementById("saveContact").addEventListener("click", () => {
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${PROFILE.name}`,
    `N:Gupta;Adhyan;;;`,
    `EMAIL:${PROFILE.email}`,
    ...(PROFILE.phone ? [`TEL:${PROFILE.phone}`] : []),
    `URL:${PROFILE.website}`,
    "NOTE:Found via ADHYAN.EXE",
    "END:VCARD"
  ].join("\r\n");
  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "adhyan-gupta.vcf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast("Contact card downloaded. You're officially in the contacts era.");
});

// Small pixel bursts on deliberate taps/clicks; no libraries needed.
document.addEventListener("click", (event) => {
  const target = event.target.closest("a, button");
  if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const rect = target.getBoundingClientRect();
  const symbols = ["✦", "✳", "▪", "★"];
  for (let i = 0; i < 4; i++) {
    const bit = document.createElement("span");
    bit.className = "pixel-burst";
    bit.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    bit.style.left = `${Math.min(window.innerWidth - 20, Math.max(10, rect.left + rect.width / 2))}px`;
    bit.style.top = `${Math.min(window.innerHeight - 20, Math.max(10, rect.top + rect.height / 2))}px`;
    bit.style.setProperty("--dx", `${(Math.random() - .5) * 80}px`);
    bit.style.setProperty("--dy", `${(Math.random() - .5) * 70 - 15}px`);
    document.body.appendChild(bit);
    setTimeout(() => bit.remove(), 700);
  }
});

// Keep the nav state simple and keyboard-friendly.
document.querySelectorAll('.mobile-dock a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.mobile-dock a').forEach(item => item.removeAttribute('aria-current'));
    link.setAttribute('aria-current', 'page');
  });
});


// ---- v2: sound, modes, day/night, jukebox, draggable window, small details ----
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  let ac, soundOn = false;
  const ctx = () => ac || (ac = new (window.AudioContext || window.webkitAudioContext)());
  const tone = (f, t = .08, type = "square", v = .03, to) => {
    const a = ctx(), o = a.createOscillator(), g = a.createGain(), n = a.currentTime;
    o.type = type; o.frequency.setValueAtTime(f, n); if (to) o.frequency.exponentialRampToValueAtTime(to, n + t);
    g.gain.setValueAtTime(v, n); g.gain.exponentialRampToValueAtTime(.0001, n + t);
    o.connect(g); g.connect(a.destination); o.start(n); o.stop(n + t + .02);
  };
  // real sound toggle (only after the visitor turns it on)
  $("#soundToggle").addEventListener("click", () => {
    soundOn = $("#soundToggle").getAttribute("aria-pressed") === "true";
    if (soundOn) { tone(660, .1); showToast("Sound on. Buttons go blip, the cat goes mrrp."); }
  });
  document.addEventListener("click", e => { if (soundOn && e.target.closest("a, button") && !e.target.closest("#exitCat")) tone(440 + Math.random() * 440, .05); });

  // sun <-> moon, cat sleeps at night
  const night = () => {
    const n = document.body.classList.toggle("night");
    $("#exitCat").classList.toggle("sleep", n);
    $("#exitBubble").textContent = n ? "zzz…" : "byeee 👋";
    showToast(n ? "Night mode. The cat is asleep. Shh." : "Good morning. She's awake.");
  };
  $("#sun").addEventListener("click", night);
  $("#sun").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); night(); } });

  // tiny jukebox (generated with WebAudio, starts only on press)
  const N = [261.6, 311.1, 392, 466.2, 523.3, 392, 311.1, 349.2];
  let pt, step = 0;
  const stop = () => { clearInterval(pt); document.body.classList.remove("playing"); };
  $("#playBtn").addEventListener("click", () => {
    const on = !document.body.classList.contains("playing");
    if (on) {
      ctx().resume && ctx().resume(); step = 0;
      pt = setInterval(() => { const f = N[(step * 3 + (step >> 3)) % 8] * (step % 16 < 8 ? 1 : .75); tone(f, .22, "triangle", .05); if (step % 4 === 0) tone(f / 4, .3, "sine", .08); step++; }, 230);
      document.body.classList.add("playing");
    } else stop();
    $("#playBtn").textContent = on ? "❚❚ PAUSE" : "▶ PLAY";
    $("#playBtn").setAttribute("aria-pressed", on);
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden && document.body.classList.contains("playing")) $("#playBtn").click(); });

  // draggable + minimisable interests window
  const w = $(".interest-window"), tb = $(".window-title");
  let dx = 0, dy = 0, sx = 0, sy = 0, drag = false;
  tb.style.touchAction = "none"; tb.style.cursor = "grab";
  tb.addEventListener("pointerdown", e => { if (e.target.closest(".window-controls")) return; drag = true; sx = e.clientX - dx; sy = e.clientY - dy; tb.setPointerCapture(e.pointerId); });
  tb.addEventListener("pointermove", e => { if (!drag) return; dx = Math.max(-280, Math.min(280, e.clientX - sx)); dy = Math.max(-200, Math.min(200, e.clientY - sy)); w.style.translate = `${dx}px ${dy}px`; });
  tb.addEventListener("pointerup", () => drag = false);
  tb.addEventListener("dblclick", () => { dx = dy = 0; w.style.translate = "0 0"; });
  $(".window-controls").addEventListener("click", () => showToast(w.classList.toggle("mini") ? "Minimized. Click again to bring it back." : "Restored."));

  // scroll progress bar
  const prog = $("#prog");
  const upd = () => { const m = document.documentElement; prog.style.width = Math.min(100, scrollY / ((m.scrollHeight - innerHeight) || 1) * 100) + "%"; };
  addEventListener("scroll", upd, { passive: true }); upd();

  // copy email, visit counter (this device only)
  $("#copyEmail").addEventListener("click", () => (navigator.clipboard ? navigator.clipboard.writeText(PROFILE.email) : Promise.reject()).then(() => showToast("Email copied."), () => showToast(PROFILE.email)));
  try { const n = (+localStorage.getItem("visits") || 0) + 1; localStorage.setItem("visits", n); $("#visits").textContent = n === 1 ? "first visit on this device. welcome." : `visit #${n} on this device`; } catch (e) {}
  // meow: sawtooth through a sweeping band-pass filter (plays only when she is clicked)
  const meow = () => {
    const a = ctx(); a.resume && a.resume();
    const n = a.currentTime, o = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain(), l = a.createOscillator(), lg = a.createGain();
    o.type = "sawtooth"; f.type = "bandpass"; f.Q.value = 4;
    o.frequency.setValueAtTime(420, n); o.frequency.linearRampToValueAtTime(760, n + .18); o.frequency.linearRampToValueAtTime(640, n + .45); o.frequency.exponentialRampToValueAtTime(330, n + .95);
    f.frequency.setValueAtTime(700, n); f.frequency.linearRampToValueAtTime(1800, n + .22); f.frequency.exponentialRampToValueAtTime(600, n + .95);
    l.frequency.value = 6; lg.gain.value = 14; l.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(.0001, n); g.gain.exponentialRampToValueAtTime(.16, n + .08); g.gain.setValueAtTime(.16, n + .5); g.gain.exponentialRampToValueAtTime(.0001, n + 1);
    o.connect(f); f.connect(g); g.connect(a.destination); o.start(n); l.start(n); o.stop(n + 1.05); l.stop(n + 1.05);
  };
  // exit cat: pops out of the bottom of the screen when you reach the end
  const ec = $("#exitCat"), bye = ["byeee!", "go touch grass. byeee", "see ya. save the contact first", "byeee, come back soon"];
  new IntersectionObserver(([e]) => ec.classList.toggle("up", e.isIntersecting), { threshold: .4 }).observe($(".contact-section"));
  let meowT;
  ec.addEventListener("click", () => {
    ec.classList.remove("hop"); void ec.offsetWidth; ec.classList.add("hop");
    meow();
    const b = $("#exitBubble"); b.textContent = "meowww 🐾"; clearTimeout(meowT);
    meowT = setTimeout(() => b.textContent = document.body.classList.contains("night") ? "zzz…" : "byeee!! ", 1600);
    showToast(document.body.classList.contains("night") ? "zzz… mrrp." : "meowww");
    if (navigator.vibrate) navigator.vibrate(15);
  });
  // email joke also shows as a toast on touch screens (the mail app still opens)
  $(".tip").addEventListener("click", e => { if (matchMedia("(hover:none)").matches) showToast(e.currentTarget.dataset.tip); });
})();
