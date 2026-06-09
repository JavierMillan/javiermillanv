/* =====================================================================
   JAVIER MILLÁN — "El estudio kinético"  ·  JS (vanilla + Lenis)
   Efectos firma: skew por velocidad de scroll + reveal de imagen al cursor.
   ===================================================================== */

const WHATSAPP_NUMBER = '526221424577'; // 52 + 6221424577  (si no abre chat, probar 521)
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesktop = () => window.innerWidth >= 861;
const lerp = (a, b, n) => a + (b - a) * n;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

let lenis = null;
let scrollVel = 0;

/* ---------- Smooth scroll (Lenis) ---------- */
function initLenis() {
    if (RM || !window.Lenis) {
        document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', anchorJump));
        return;
    }
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', (e) => { scrollVel = e.velocity || 0; });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
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

/* ---------- rAF maestro: skew por velocidad + parallax + cursor ---------- */
function initKinetics() {
    const skewEls = Array.from(document.querySelectorAll('[data-skew]'));
    const speedEls = Array.from(document.querySelectorAll('[data-speed]'));
    const dot = document.querySelector('.cursor-dot');

    let curSkew = 0;
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let dx = mx, dy = my;

    if (dot) window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

    const tick = () => {
        // Skew kinético (suavizado)
        if (skewEls.length && !RM) {
            const target = clamp(scrollVel * 0.35, -7, 7);
            curSkew = lerp(curSkew, target, 0.1);
            const t = `skewY(${curSkew.toFixed(2)}deg)`;
            for (const el of skewEls) el.style.transform = t;
        }
        // Parallax suave de imágenes
        if (speedEls.length && !RM) {
            const vh = window.innerHeight;
            for (const el of speedEls) {
                const r = el.getBoundingClientRect();
                const center = r.top + r.height / 2;
                const off = (center - vh / 2) / vh;
                const sp = parseFloat(el.dataset.speed) || 0;
                el.style.transform = `translateY(${(off * sp * -60).toFixed(1)}px)`;
            }
        }
        // Cursor
        if (dot) {
            dx = lerp(dx, mx, 0.2); dy = lerp(dy, my, 0.2);
            dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
        }
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // Cursor crece/oculta sobre interactivos
    if (dot) {
        document.querySelectorAll('a, button, .project-row, input, textarea').forEach((el) => {
            el.addEventListener('mouseenter', () => dot.classList.add('big'));
            el.addEventListener('mouseleave', () => dot.classList.remove('big'));
        });
    }
}

/* ---------- Reveals de entrada (IntersectionObserver) ---------- */
function initReveals() {
    const els = document.querySelectorAll('.up, .clip');
    if (RM || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
}

/* ---------- Hero: revelado de líneas ---------- */
function initHero() {
    const lines = document.querySelectorAll('.hero-title .l > span');
    if (RM) { lines.forEach((s) => s.classList.add('in')); return; }
    lines.forEach((s, i) => setTimeout(() => s.classList.add('in'), 120 + i * 130));
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
        row.addEventListener('mouseenter', () => {
            if (img) layer.style.backgroundImage = `url("${img}")`;
            layer.classList.add('show');
        });
        row.addEventListener('mouseleave', () => { layer.classList.remove('show'); });
    });
    window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });

    const follow = () => {
        cx = lerp(cx, tx, 0.14); cy = lerp(cy, ty, 0.14);
        layer.style.left = cx + 'px';
        layer.style.top = cy + 'px';
        requestAnimationFrame(follow);
    };
    requestAnimationFrame(follow);
}

/* ---------- Navbar ---------- */
function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    let last = 0;
    const onScroll = () => {
        const y = window.scrollY;
        nav.classList.toggle('scrolled', y > 20);
        nav.classList.toggle('nav-hidden', y > last && y > 320);
        last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/* ---------- Menú móvil ---------- */
function initMenu() {
    const btn = document.getElementById('menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', () => {
        const o = menu.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(o));
    });
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

/* ---------- Año ---------- */
function initYear() { const el = document.getElementById('year'); if (el) el.textContent = new Date().getFullYear(); }

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('ready');
    initLenis();
    initKinetics();
    initReveals();
    initHero();
    initProjectReveal();
    initNav();
    initMenu();
    initMagnetic();
    initLeadForm();
    initYear();
});
