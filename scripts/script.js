/* =====================================================================
   JAVIER MILLÁN — "El mapa de una luz"  ·  JS
   Lenis + vanilla. Constelación viva, choque de colisiones al entrar,
   mask reveals, líneas de constelación. Efecto firma: imagen al cursor.
   ===================================================================== */

const WHATSAPP_NUMBER = '526221424577'; // 52 + 6221424577 (si no abre chat, probar 521)
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesktop = () => window.innerWidth >= 861;
const lerp = (a, b, n) => a + (b - a) * n;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

let lenis = null;

/* ---------- Lenis + GSAP/ScrollTrigger ---------- */
function initLenis() {
    const hasGSAP = window.gsap && window.ScrollTrigger;
    if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

    if (RM || !window.Lenis) {
        document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', anchorJump));
        return;
    }
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });

    if (hasGSAP) {
        // sincroniza Lenis con el ticker de GSAP (un solo rAF, evita desfases)
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((t) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
    } else {
        const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
    }
    document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', anchorJump));
}
function anchorJump(e) {
    const id = this.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: -76 });
    else target.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
    const mm = document.getElementById('mobile-menu');
    if (mm) mm.classList.remove('open');
    const mb = document.getElementById('menu-btn');
    if (mb) mb.setAttribute('aria-expanded', 'false');
}

/* =====================================================================
   CONSTELACIÓN AMBIENTAL — canvas detrás de todo, el mouse conecta
   ===================================================================== */
function initConstellation() {
    const c = document.getElementById('constellation');
    if (!c) return;
    const x = c.getContext('2d');
    let w, h, stars = [], mx = -999, my = -999, raf = null;
    const inkRGB = '23,21,15';

    const size = () => {
        w = c.width = window.innerWidth;
        h = c.height = window.innerHeight;
        const n = Math.min(110, Math.floor(w * h / 13000));
        stars = [];
        for (let i = 0; i < n; i++) stars.push({
            x: Math.random() * w, y: Math.random() * h,
            r: Math.random() * 1.4 + 0.4, tw: Math.random() * Math.PI * 2,
            vx: (Math.random() - 0.5) * 0.08, vy: (Math.random() - 0.5) * 0.08,
        });
    };

    // Color del trazo según tema (papel vs noche)
    const isNight = () => document.body.classList.contains('night');

    const draw = (t) => {
        x.clearRect(0, 0, w, h);
        const night = isNight();
        const base = night ? '236,230,216' : inkRGB;
        const accent = night ? '255,84,54' : '43,39,240';

        for (const s of stars) {
            s.x += s.vx; s.y += s.vy;
            if (s.x < 0 || s.x > w) s.vx *= -1;
            if (s.y < 0 || s.y > h) s.vy *= -1;
            const tw = 0.5 + 0.5 * Math.sin(t / 900 + s.tw);
            x.beginPath(); x.arc(s.x, s.y, s.r, 0, 7);
            x.fillStyle = `rgba(${base},${(night ? 0.22 : 0.16) + tw * 0.2})`;
            x.fill();
        }
        // vínculos entre estrellas cercanas
        for (let i = 0; i < stars.length; i++) {
            for (let j = i + 1; j < stars.length; j++) {
                const a = stars[i], b = stars[j];
                const d = Math.hypot(a.x - b.x, a.y - b.y);
                if (d < 120) {
                    x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y);
                    x.strokeStyle = `rgba(${base},${(1 - d / 120) * (night ? 0.1 : 0.08)})`;
                    x.lineWidth = 0.5; x.stroke();
                }
            }
        }
        // tu luz conecta con las estrellas cercanas
        if (mx > -900) {
            for (const s of stars) {
                const d = Math.hypot(s.x - mx, s.y - my);
                if (d < 170) {
                    x.beginPath(); x.moveTo(s.x, s.y); x.lineTo(mx, my);
                    x.strokeStyle = `rgba(${accent},${(1 - d / 170) * 0.55})`;
                    x.lineWidth = 0.8; x.stroke();
                }
            }
        }
        raf = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', size, { passive: true });
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    window.addEventListener('mouseout', () => { mx = my = -999; }, { passive: true });
    size();
    if (RM) { draw(0); } else { raf = requestAnimationFrame(draw); }
}

/* =====================================================================
   COLISIONES — pin + scrub (GSAP). Cada cruce entra y sale con el scroll.
   ===================================================================== */
function initCollisions() {
    const pin = document.getElementById('col-pin');
    const track = document.getElementById('col-track');
    if (!pin || !track) return;
    const slides = Array.from(track.children);
    const dots = Array.from(pin.querySelectorAll('.col-dot'));
    const barFill = document.getElementById('col-bar-fill');
    const n = slides.length;

    // Sin GSAP o reduced-motion: apila las slides en vertical (legible, sin pin)
    if (RM || !(window.gsap && window.ScrollTrigger)) {
        pin.classList.add('col-stacked');
        return;
    }

    pin.classList.add('col-horizontal');

    const setProgress = (p) => {
        const idx = Math.min(n - 1, Math.floor(p * n + 0.0001));
        dots.forEach((d, i) => d.classList.toggle('is-on', i <= idx));
        if (barFill) barFill.style.transform = `scaleX(${p.toFixed(3)})`;
    };
    setProgress(0);

    // mueve el track horizontalmente mientras la sección está pineada
    gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
            trigger: pin,
            start: 'top top',
            end: () => '+=' + (track.scrollWidth - window.innerWidth + window.innerHeight),
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => setProgress(self.progress),
        },
    });
}

/* =====================================================================
   NOCHE — body.night cuando una sección [data-night] domina la vista
   ===================================================================== */
function initNightSwitch() {
    const sections = document.querySelectorAll('[data-night]');
    if (!sections.length || !('IntersectionObserver' in window)) return;
    const state = new Map();
    const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => state.set(en.target, en.intersectionRatio));
        let any = false;
        state.forEach((r) => { if (r > 0.5) any = true; });
        document.body.classList.toggle('night', any);
    }, { threshold: [0, 0.5, 1], rootMargin: '-30% 0px -30% 0px' });
    sections.forEach((s) => io.observe(s));
}

/* =====================================================================
   MASK REVEALS + reveals de entrada (.up / [data-mask])
   ===================================================================== */
function initReveals() {
    const els = document.querySelectorAll('.up, [data-mask]');
    if (RM || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
}

/* ---------- Hero: revelado de líneas ---------- */
function initHero() {
    const lines = document.querySelectorAll('.hero-title .l > span');
    if (RM) { lines.forEach((s) => s.classList.add('in')); return; }
    lines.forEach((s, i) => setTimeout(() => s.classList.add('in'), 150 + i * 115));
}

/* =====================================================================
   LA CONSTELACIÓN — dibuja líneas SVG conectando los nodos
   ===================================================================== */
function initConstelMap() {
    const map = document.getElementById('constel-map');
    const svg = document.getElementById('constel-lines');
    const nodes = Array.from(document.querySelectorAll('.cnode'));
    if (!map || !svg || nodes.length < 2) return;

    const drawLines = () => {
        if (window.innerWidth <= 760) { svg.innerHTML = ''; return; }
        const box = map.getBoundingClientRect();
        svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
        let html = '';
        for (let i = 0; i < nodes.length - 1; i++) {
            const a = nodes[i].getBoundingClientRect();
            const b = nodes[i + 1].getBoundingClientRect();
            // punto del "nodo" (el círculo arriba-izquierda de cada tarjeta)
            const ax = a.left - box.left + 28, ay = a.top - box.top - 1;
            const bx = b.left - box.left + 28, by = b.top - box.top - 1;
            html += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" class="cline" />`;
        }
        svg.innerHTML = html;
    };

    drawLines();
    window.addEventListener('resize', drawLines, { passive: true });

    // anima el trazo cuando el mapa entra en vista (IntersectionObserver, CSS dash)
    if (!RM && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                if (!en.isIntersecting) return;
                map.querySelectorAll('.cline').forEach((ln, i) => {
                    const len = ln.getTotalLength ? ln.getTotalLength() : 220;
                    ln.style.strokeDasharray = len;
                    ln.style.strokeDashoffset = len;
                    ln.style.transition = `stroke-dashoffset 0.9s ${0.2 + i * 0.2}s var(--ease, ease)`;
                    requestAnimationFrame(() => { ln.style.strokeDashoffset = '0'; });
                });
                io.unobserve(en.target);
            });
        }, { threshold: 0.25 });
        io.observe(map);
    }
}

/* =====================================================================
   INVITACIÓN — nodos de luz: solitarios que buscan brillar y se conectan
   ===================================================================== */
function initInviteCanvas() {
    const c = document.getElementById('invite-canvas');
    if (!c) return;
    const x = c.getContext('2d');
    let w, h, nodes = [], t0 = performance.now();

    const size = () => {
        const r = c.parentElement.getBoundingClientRect();
        w = c.width = r.width; h = c.height = r.height;
        const n = Math.min(60, Math.floor(w * h / 20000));
        nodes = [];
        for (let i = 0; i < n; i++) nodes.push({
            x: Math.random() * w, y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
            r: Math.random() * 1.6 + 0.8,
            // "conexión": 0 = solo (tenue), 1 = conectado a la red (brilla)
            conn: 0, joinAt: t0 + Math.random() * 6000 + 800,
        });
    };

    const draw = (now) => {
        x.clearRect(0, 0, w, h);
        for (const p of nodes) {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
            if (!RM && now > p.joinAt && p.conn < 1) p.conn = Math.min(1, p.conn + 0.012);
            if (RM) p.conn = 1;
        }
        // vínculos: sólo entre nodos ya conectados a la red
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const a = nodes[i], b = nodes[j];
                const d = Math.hypot(a.x - b.x, a.y - b.y);
                if (d < 130) {
                    const link = Math.min(a.conn, b.conn) * (1 - d / 130);
                    if (link > 0.02) {
                        x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y);
                        x.strokeStyle = `rgba(120,116,255,${link * 0.5})`;
                        x.lineWidth = 0.6; x.stroke();
                    }
                }
            }
        }
        // nodos: solos = tenues y fríos; conectados = brillan cobalto→coral
        for (const p of nodes) {
            const glow = p.conn;
            if (glow > 0.05) {
                const g = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
                g.addColorStop(0, `rgba(255,84,54,${glow * 0.6})`);
                g.addColorStop(1, 'rgba(255,84,54,0)');
                x.beginPath(); x.arc(p.x, p.y, p.r * 6, 0, 7); x.fillStyle = g; x.fill();
            }
            x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7);
            x.fillStyle = glow > 0.5
                ? `rgba(255,140,110,${0.6 + glow * 0.4})`
                : `rgba(155,148,132,${0.3 + glow * 0.3})`;
            x.fill();
        }
        requestAnimationFrame(draw);
    };

    window.addEventListener('resize', size, { passive: true });
    size();
    requestAnimationFrame(draw);
}

/* =====================================================================
   EFECTO FIRMA — La obra: imagen que sigue el cursor
   ===================================================================== */
function initProjectReveal() {
    const layer = document.querySelector('.reveal-img');
    const rows = document.querySelectorAll('.project-row');
    if (!layer || !rows.length || !isDesktop()) return;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    rows.forEach((row) => {
        const img = row.dataset.img;
        row.addEventListener('mouseenter', () => { if (img) layer.style.backgroundImage = `url("${img}")`; layer.classList.add('show'); });
        row.addEventListener('mouseleave', () => layer.classList.remove('show'));
    });
    window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    const follow = () => { cx = lerp(cx, tx, 0.14); cy = lerp(cy, ty, 0.14); layer.style.left = cx + 'px'; layer.style.top = cy + 'px'; requestAnimationFrame(follow); };
    requestAnimationFrame(follow);
}

/* ---------- Cursor dot ---------- */
function initCursor() {
    const dot = document.querySelector('.cursor-dot');
    if (!dot || !isDesktop()) return;
    let mx = innerWidth / 2, my = innerHeight / 2, dx = mx, dy = my;
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    const tick = () => { dx = lerp(dx, mx, 0.2); dy = lerp(dy, my, 0.2); dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    document.querySelectorAll('a, button, .project-row, .cnode, input, textarea').forEach((el) => {
        el.addEventListener('mouseenter', () => dot.classList.add('big'));
        el.addEventListener('mouseleave', () => dot.classList.remove('big'));
    });
}

/* ---------- skew kinético (la obra y el footer) ---------- */
function initSkew() {
    const els = Array.from(document.querySelectorAll('[data-skew]'));
    if (!els.length || RM || !lenis) return;
    let cur = 0;
    lenis.on('scroll', (e) => {
        const target = clamp((e.velocity || 0) * 0.3, -6, 6);
        cur = lerp(cur, target, 0.2);
        const t = `skewY(${cur.toFixed(2)}deg)`;
        for (const el of els) el.style.transform = t;
    });
}

/* ---------- Navbar ---------- */
function initNav() {
    const nav = document.getElementById('nav');
    const prog = document.getElementById('scroll-progress-fill');
    if (!nav) return;
    let last = 0;
    const onScroll = () => {
        const y = window.scrollY;
        nav.classList.toggle('scrolled', y > 20);
        nav.classList.toggle('nav-hidden', y > last && y > 320);
        last = y;
        if (prog) {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            prog.style.width = (max > 0 ? clamp(y / max, 0, 1) * 100 : 0).toFixed(2) + '%';
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/* ---------- Menú móvil ---------- */
function initMenu() {
    const btn = document.getElementById('menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', () => { const o = menu.classList.toggle('open'); btn.setAttribute('aria-expanded', String(o)); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') menu.classList.remove('open'); });
}

/* ---------- Botón magnético ---------- */
function initMagnetic() {
    if (RM || !isDesktop() || 'ontouchstart' in window) return;
    document.querySelectorAll('.magnetic').forEach((wrap) => {
        const el = wrap.querySelector('.btn') || wrap.firstElementChild;
        if (!el) return;
        wrap.addEventListener('mousemove', (e) => {
            const r = wrap.getBoundingClientRect();
            el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
        });
        wrap.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
}

/* ---------- Form -> WhatsApp ---------- */
function initLeadForm() {
    const form = document.getElementById('lead-form');
    if (!form) return;
    const statusEl = form.querySelector('.form-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitLabel = submitBtn ? submitBtn.querySelector('.btn-label') : null;

    const setStatus = (msg, type) => { if (statusEl) { statusEl.textContent = msg; statusEl.className = `form-status show ${type}`; } };
    const fieldErr = (name, msg) => {
        const input = form.elements[name];
        const errEl = form.querySelector(`[data-error-for="${name}"]`);
        if (input) input.classList.toggle('invalid', !!msg);
        if (errEl) errEl.textContent = msg || '';
    };
    ['nombre', 'mensaje', 'ayuda'].forEach((n) => { const i = form.elements[n]; if (i) i.addEventListener('input', () => fieldErr(n, '')); });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (form.elements['website'] && form.elements['website'].value) { setStatus('Gracias, recibí tu mensaje.', 'success'); form.reset(); return; }
        const nombre = form.elements['nombre'].value.trim();
        const mensaje = form.elements['mensaje'].value.trim();
        const ayuda = form.elements['ayuda'] ? form.elements['ayuda'].value.trim() : '';
        let ok = true;
        if (nombre.length < 2) { fieldErr('nombre', 'Dime cómo te llamas.'); ok = false; } else fieldErr('nombre', '');
        if (mensaje.length < 5) { fieldErr('mensaje', 'Cuéntame un poco más.'); ok = false; } else fieldErr('mensaje', '');
        if (!ok) { setStatus('Revisa los campos marcados.', 'error'); return; }

        if (submitBtn) submitBtn.classList.add('loading');
        if (submitLabel) submitLabel.innerHTML = '<span class="spinner"></span>&nbsp; Abriendo WhatsApp…';

        const lines = ['Hola Javier, vi tu sitio y quiero platicar contigo.', '', `Nombre: ${nombre}`, `Sobre mí / mi idea: ${mensaje}`];
        if (ayuda) lines.push(`Me interesa: ${ayuda}`);
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;

        setTimeout(() => {
            const win = window.open(url, '_blank');
            if (submitBtn) submitBtn.classList.remove('loading');
            if (submitLabel) submitLabel.textContent = 'Enviar por WhatsApp';
            if (win) { setStatus('Listo. Sigamos en WhatsApp.', 'success'); form.reset(); }
            else { setStatus('Tu navegador bloqueó la ventana. Toca para abrir WhatsApp.', 'error'); if (statusEl) { statusEl.style.cursor = 'pointer'; statusEl.onclick = () => { window.location.href = url; }; } }
        }, 420);
    });
}

/* ---------- Ebook "La Quebradita" -> WhatsApp ---------- */
function initEbookForm() {
    const form = document.getElementById('ebook-form');
    if (!form) return;
    const statusEl = form.parentElement.querySelector('.ebook-status');
    const btn = form.querySelector('button[type="submit"]');
    const label = btn ? btn.querySelector('.btn-label') : null;
    const setStatus = (msg, type) => { if (statusEl) { statusEl.textContent = msg; statusEl.className = `ebook-status show ${type}`; } };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (form.elements['website'] && form.elements['website'].value) { setStatus('Gracias, ya lo recibí.', 'success'); form.reset(); return; }
        const nombre = form.elements['nombre'].value.trim();
        if (nombre.length < 2) { setStatus('Dime tu nombre y te lo mando.', 'error'); return; }

        if (btn) btn.classList.add('loading');
        if (label) label.innerHTML = '<span class="spinner"></span>&nbsp; Abriendo WhatsApp…';

        const text = `Hola Javier, soy ${nombre}. Vi tu sitio y quiero el ebook "La Quebradita".`;
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
        setTimeout(() => {
            const win = window.open(url, '_blank');
            if (btn) btn.classList.remove('loading');
            if (label) label.textContent = 'Quiero el libro';
            if (win) { setStatus('Listo. Te lo mando por WhatsApp.', 'success'); form.reset(); }
            else { setStatus('Tu navegador bloqueó la ventana. Toca para abrir WhatsApp.', 'error'); if (statusEl) { statusEl.style.cursor = 'pointer'; statusEl.onclick = () => { window.location.href = url; }; } }
        }, 420);
    });
}

/* ---------- Año ---------- */
function initYear() { const el = document.getElementById('year'); if (el) el.textContent = new Date().getFullYear(); }

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('ready');
    initLenis();
    initConstellation();
    initHero();
    initReveals();
    initNightSwitch();
    initCollisions();
    initConstelMap();
    initInviteCanvas();
    initProjectReveal();
    initCursor();
    initSkew();
    initNav();
    initMenu();
    initMagnetic();
    initLeadForm();
    initEbookForm();
    initYear();
    // Recalcular medidas cuando cargan fuentes/imágenes (el pin horizontal depende del ancho)
    const refresh = () => {
        if (lenis && lenis.resize) lenis.resize();
        if (window.ScrollTrigger) ScrollTrigger.refresh();
    };
    window.addEventListener('load', refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    document.querySelectorAll('img').forEach((img) => {
        if (!img.complete) { img.addEventListener('load', refresh, { once: true }); img.addEventListener('error', refresh, { once: true }); }
    });
});
