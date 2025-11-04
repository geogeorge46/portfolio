// Performance monitoring utilities
const perf = {
	marks: {},
	start(label) { this.marks[label] = performance.now(); },
	end(label) { if (this.marks[label]) { const d = performance.now() - this.marks[label]; console.log(`⚡️ ${label}: ${d.toFixed(2)}ms`); delete this.marks[label]; return d; } },
	measure(label, fn) { this.start(label); const r = fn(); this.end(label); return r; }
};

// Theme manager
class ThemeManager {
	constructor() {
		// order used when cycling the single theme toggle button
		this.themes = ['', 'theme-dark', 'theme-sunset', 'theme-purple', 'theme-green', 'theme-multicolor', 'theme-minimal'];
		this.currentTheme = localStorage.getItem('geo_theme') || '';
		this.body = document.body;
		this.toggleBtn = document.getElementById('themeToggle');

		if (this.currentTheme) {
			this.body.classList.add(this.currentTheme);
			this.updateIcon();
		}

		if (this.toggleBtn) this.toggleBtn.addEventListener('click', () => this.cycleTheme());

		// Respect system preference if no saved theme
		if (!localStorage.getItem('geo_theme')) {
			const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
			if (prefersDark) this.setTheme('theme-dark');
		}
	}

	cycleTheme() {
		const idx = this.themes.indexOf(this.currentTheme);
		const next = this.themes[(idx + 1) % this.themes.length];
		this.setTheme(next);
	}

	setTheme(theme) {
		if (this.currentTheme) this.body.classList.remove(this.currentTheme);
		this.currentTheme = theme;
		if (theme) this.body.classList.add(theme);
		localStorage.setItem('geo_theme', theme);
		this.updateIcon();
		// Reset custom accent when switching themes to let theme colors take effect
		if (window.themeCustomizer) {
			window.themeCustomizer.resetAccent();
		}
	}

	updateIcon() {
		if (!this.toggleBtn) return;
		const icons = {
			'': '☀️',
			'theme-dark': '🌙',
			'theme-sunset': '🌇',
			'theme-purple': '🟣',
			'theme-green': '🌿',
			'theme-multicolor': '🎨',
			'theme-minimal': '⚪'
		};
		this.toggleBtn.textContent = icons[this.currentTheme] || '☀️';
	}
}

// Typing effect
class TypingEffect {
	constructor(el, delay = 30) {
		this.el = el;
		this.text = el ? el.textContent : '';
		this.delay = delay;
		if (this.el) { this.el.textContent = ''; this.start(); }
	}
	async start() {
		for (let i = 0; i < this.text.length; i++) {
			this.el.textContent += this.text[i];
			await new Promise(r => setTimeout(r, this.delay));
		}
	}
}

// Scroll & UI handlers
class UI {
	static init() {
		// Back to top and navbar scroll
		const backBtn = document.getElementById('backToTop');
		const navbar = document.getElementById('navbar');
		window.addEventListener('scroll', () => {
			if (window.scrollY > 300) backBtn.style.display = 'block'; else backBtn.style.display = 'none';
			if (window.scrollY > 20) navbar.classList.add('scrolled'); else navbar.classList.remove('scrolled');
		});
		if (backBtn) backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

		// Mobile menu
		const mobileBtn = document.getElementById('mobileMenuBtn');
		const navLinks = document.getElementById('navLinks');
		if (mobileBtn && navLinks) mobileBtn.addEventListener('click', () => {
			navLinks.style.display = navLinks.style.display === 'flex' ? '' : 'flex';
		});
	}
}

// Smooth Scrolling with Lenis
class SmoothScroll {
	static init() {
		if (typeof Lenis === 'undefined') return;

		const lenis = new Lenis({
			duration: 1.2,
			easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			direction: 'vertical',
			gestureDirection: 'vertical',
			smooth: true,
			smoothTouch: false,
			touchMultiplier: 2,
		});

		function raf(time) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}
		requestAnimationFrame(raf);

		// Update ScrollTrigger on Lenis scroll
		lenis.on('scroll', ScrollTrigger.update);

		// Add Lenis to GSAP's ticker
		gsap.ticker.add((time) => {
			lenis.raf(time * 1000);
		});
		gsap.ticker.lagSmoothing(0);

		// Handle anchor links
		document.querySelectorAll('a[href^="#"]').forEach(anchor => {
			anchor.addEventListener('click', function (e) {
				e.preventDefault();
				const target = document.querySelector(this.getAttribute('href'));
				if (target) {
					lenis.scrollTo(target, { offset: -60 }); // Offset for navbar
				}
			});
		});
	}
}

// Contact form
class ContactForm {
	constructor(id) {
		this.form = document.getElementById(id);
		if (!this.form) return;
		this.status = this.form.querySelector('.form-status');
		this.form.addEventListener('submit', e => {
			e.preventDefault();
			const name = this.form.name.value.trim();
			const email = this.form.email.value.trim();
			const message = this.form.message.value.trim();
			if (!name || !email || !message) { this.status.textContent = 'Please fill all fields.'; return; }
			const subject = encodeURIComponent('Portfolio contact from ' + name);
			const body = encodeURIComponent(message + '\n\n' + name + '\n' + email);
			window.location.href = `mailto:geogeorge24680@gmail.com?subject=${subject}&body=${body}`;
			this.status.textContent = 'Opening your email client...';
		});
	}
}

// Vanta, GSAP animations and other effects
class Effects {
	static init() {
		this.initVanta();
		this.initScrollAnimations();
		this.initParallax();
	}

	static initVanta() {
		if (typeof VANTA !== 'undefined') {
			VANTA.NET({
				el: ".hero",
				mouseControls: true,
				touchControls: true,
				gyroControls: false,
				minHeight: 200.00,
				minWidth: 200.00,
				scale: 1.00,
				scaleMobile: 1.00,
				color: 0x38bdf8,
				backgroundColor: 0x0f172a,
				points: 10.00,
				maxDistance: 22.00,
				spacing: 18.00
			});
		}
	}

	static initScrollAnimations() {
		gsap.registerPlugin(ScrollTrigger);

		// Animate project cards with stagger effect
		gsap.utils.toArray('.project-card').forEach((card, i) => {
			gsap.from(card, {
				scrollTrigger: {
					trigger: card,
					start: "top 80%",
					end: "bottom 20%",
					toggleActions: "play none none none",
				},
				opacity: 0,
				y: 50,
				duration: 0.6,
				delay: i * 0.1,
				ease: "power2.out"
			});
		});

		// Animate skill badges
		gsap.utils.toArray('.badge').forEach((badge, i) => {
			gsap.from(badge, {
				scrollTrigger: {
					trigger: badge,
					start: "top 85%",
					toggleActions: "play none none none",
				},
				opacity: 0,
				y: 20,
				duration: 0.4,
				delay: (i % 5) * 0.05,
				ease: "back.out"
			});
		});

		// Animate section titles
		gsap.utils.toArray('.section-title').forEach((title) => {
			gsap.from(title, {
				scrollTrigger: {
					trigger: title,
					start: "top 85%",
					toggleActions: "play none none none",
				},
				opacity: 0,
				x: -30,
				duration: 0.5,
				ease: "power2.out"
			});
		});

		// Animate timeline items
		gsap.utils.toArray('.timeline-item').forEach((item, i) => {
			gsap.from(item, {
				scrollTrigger: {
					trigger: item,
					start: "top 80%",
					toggleActions: "play none none none",
				},
				opacity: 0,
				x: i % 2 === 0 ? -40 : 40,
				duration: 0.5,
				delay: i * 0.08,
				ease: "power2.out"
			});
		});

		// Animate skill groups
		gsap.utils.toArray('.skill-group').forEach((group, i) => {
			gsap.from(group, {
				scrollTrigger: {
					trigger: group,
					start: "top 85%",
					toggleActions: "play none none none",
				},
				opacity: 0,
				y: 30,
				duration: 0.5,
				delay: i * 0.1,
				ease: "power2.out"
			});
		});
	}

	static initParallax() {
		gsap.to(".parallax-layer-1", {
			y: "-20%",
			scrollTrigger: {
				trigger: "body",
				start: "top top",
				end: "bottom top",
				scrub: true
			}
		});
		gsap.to(".parallax-layer-2", {
			y: "-40%",
			scrollTrigger: {
				trigger: "body",
				start: "top top",
				end: "bottom top",
				scrub: true
			}
		});
		gsap.to(".parallax-layer-3", {
			y: "-60%",
			scrollTrigger: {
				trigger: "body",
				start: "top top",
				end: "bottom top",
				scrub: true
			}
		});
	}
}

// Code Particles Effect
class CodeParticles {
	constructor() {
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');
		this.particles = [];
		this.animationId = null;
		this.isRunning = false;

		// Style canvas
		this.canvas.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			pointer-events: none;
			z-index: -2;
			opacity: 0.15;
		`;

		document.body.insertBefore(this.canvas, document.body.firstChild);
		window.addEventListener('resize', () => this.resize());
		this.resize();
		this.init();
	}

	resize() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	init() {
		const codeSymbols = ['<', '>', '{', '}', '[', ']', '(', ')', '/', '\\', '=', '+', '-', '*', '&', '|', ';', ':', '.', ',', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
		const particleCount = Math.min(15, Math.max(8, Math.floor(window.innerWidth / 150)));

		for (let i = 0; i < particleCount; i++) {
			this.particles.push({
				x: Math.random() * this.canvas.width,
				y: Math.random() * this.canvas.height,
				vx: (Math.random() - 0.5) * 0.5,
				vy: (Math.random() - 0.5) * 0.5,
				symbol: codeSymbols[Math.floor(Math.random() * codeSymbols.length)],
				size: Math.random() * 16 + 8,
				opacity: Math.random() * 0.5 + 0.3,
				rotation: Math.random() * Math.PI * 2,
				rotationSpeed: (Math.random() - 0.5) * 0.05
			});
		}

		this.animate();
		this.isRunning = true;
	}

	animate() {
		this.ctx.fillStyle = 'rgba(0, 0, 0, 0)';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';

		this.particles.forEach((p) => {
			p.x += p.vx;
			p.y += p.vy;
			p.rotation += p.rotationSpeed;

			// Wrap around screen edges
			if (p.x < -20) p.x = this.canvas.width + 20;
			if (p.x > this.canvas.width + 20) p.x = -20;
			if (p.y < -20) p.y = this.canvas.height + 20;
			if (p.y > this.canvas.height + 20) p.y = -20;

			// Get accent color from CSS
			const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();

			this.ctx.save();
			this.ctx.globalAlpha = p.opacity;
			this.ctx.translate(p.x, p.y);
			this.ctx.rotate(p.rotation);
			this.ctx.fillStyle = accentColor || '#004aad';
			this.ctx.font = `bold ${Math.floor(p.size)}px monospace`;
			this.ctx.fillText(p.symbol, 0, 0);
			this.ctx.restore();
		});

		this.animationId = requestAnimationFrame(() => this.animate());
	}

	stop() {
		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
			this.isRunning = false;
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	try {
		new ThemeManager();
		// Theme customizer (color/font/layout)
		window.themeCustomizer = new ThemeCustomizer();
		UI.init();
		SmoothScroll.init();
		Effects.init();
		new CodeParticles(); // Floating code particles background
		new ContactForm('contactForm'); // Initialize contact form handler
		const t = document.getElementById('typing'); if (t) new TypingEffect(t, 30);
		console.log('Site initialized with immersive scroll effects ✨');
	} catch (err) {
		console.error('Init error', err);
	}
});

// Theme Customizer class: handles accent color, font selection, and layout toggles
class ThemeCustomizer {
	constructor() {
		this.toggle = document.getElementById('customizerToggle');
		this.panel = document.getElementById('themeCustomizer');
		this.closeBtn = document.getElementById('customizerClose');
		this.accentInput = document.getElementById('accentColor');
		this.fontSelect = document.getElementById('fontSelect');
		this.layoutBtns = Array.from(document.querySelectorAll('.layout-btn'));
		this.resetBtn = document.getElementById('resetCustomizer');
		this.storageKey = 'geo_customizer';

		this.state = {
			accent: this.accentInput ? this.accentInput.value : '#004aad',
			font: this.fontSelect ? this.fontSelect.value : document.body.style.fontFamily || '',
			layout: localStorage.getItem('geo_layout') || 'comfortable'
		};

		this.load();
		this.attach();
	}

	attach() {
		if (this.toggle) this.toggle.addEventListener('click', () => this.open());
		if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
		if (this.accentInput) this.accentInput.addEventListener('input', (e) => this.onAccentChange(e.target.value));
		if (this.fontSelect) this.fontSelect.addEventListener('change', (e) => this.onFontChange(e.target.value));
		if (this.resetBtn) this.resetBtn.addEventListener('click', () => this.reset());
		this.layoutBtns.forEach(b => b.addEventListener('click', (e) => this.onLayoutSelect(e.currentTarget.dataset.layout)));
		// close on outside click
		document.addEventListener('click', (e) => {
			if (!this.panel || !this.toggle) return;
			if (!this.panel.classList.contains('open')) return;
			if (this.panel.contains(e.target) || this.toggle.contains(e.target)) return;
			this.close();
		});
			// keyboard handlers (Escape to close, Tab trap) - bound methods
			this._onKeyDown = this._onKeyDown.bind(this);
	}

	load() {
		try {
			const saved = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
			if (saved.accent) this.state.accent = saved.accent;
			if (saved.font) this.state.font = saved.font;
			if (saved.layout) this.state.layout = saved.layout;
			// apply
			this.applyAccent(this.state.accent);
			this.applyFont(this.state.font);
			this.applyLayout(this.state.layout);
			// reflect in controls
			if (this.accentInput) this.accentInput.value = this.state.accent;
			if (this.fontSelect) this.fontSelect.value = this.state.font;
			this.updateLayoutButtons();
		} catch (err) {
			console.warn('Customizer load error', err);
		}
	}

	save() {
		const data = { accent: this.state.accent, font: this.state.font, layout: this.state.layout };
		localStorage.setItem(this.storageKey, JSON.stringify(data));
		localStorage.setItem('geo_layout', this.state.layout);
	}

	open() {
		if (!this.panel) return;
		this.panel.classList.add('open');
		this.panel.setAttribute('aria-hidden', 'false');
			// remember previously focused element
			this._prevFocus = document.activeElement;
			// add keydown listener to trap focus and handle Escape
			document.addEventListener('keydown', this._onKeyDown);
			// focus first focusable control inside panel
			const first = this._getFocusable()[0];
			if (first) first.focus();
	}

	close() {
		if (!this.panel) return;
		this.panel.classList.remove('open');
		this.panel.setAttribute('aria-hidden', 'true');
			// remove keydown listener
			document.removeEventListener('keydown', this._onKeyDown);
			// restore focus
			try { if (this._prevFocus && typeof this._prevFocus.focus === 'function') this._prevFocus.focus(); } catch (e) {}
	}

	onAccentChange(hex) {
		this.state.accent = hex;
		this.applyAccent(hex);
		this.save();
	}

	onFontChange(font) {
		this.state.font = font;
		this.applyFont(font);
		this.save();
	}

	onLayoutSelect(layout) {
		this.state.layout = layout;
		this.applyLayout(layout);
		this.updateLayoutButtons();
		this.save();
	}

	reset() {
		// remove stored settings
		localStorage.removeItem(this.storageKey);
		localStorage.removeItem('geo_layout');
		// revert to defaults
		this.state = { accent: '#004aad', font: "Poppins, system-ui, -apple-system, 'Segoe UI', Roboto, Arial", layout: 'comfortable' };
		if (this.accentInput) this.accentInput.value = this.state.accent;
		if (this.fontSelect) this.fontSelect.value = this.state.font;
		this.applyAccent(this.state.accent);
		this.applyFont(this.state.font);
		this.applyLayout(this.state.layout);
		this.updateLayoutButtons();
	}

	resetAccent() {
		// Reset accent to current theme's default
		const themeAccents = {
			'': '#004aad', // default
			'theme-dark': '#38bdf8',
			'theme-sunset': '#ff7a18',
			'theme-purple': '#7c3aed',
			'theme-green': '#059669',
			'theme-multicolor': '#ff7a18',
			'theme-minimal': '#374151'
		};
		const currentTheme = document.body.className.match(/theme-\w+/) ? document.body.className.match(/theme-\w+/)[0] : '';
		const defaultAccent = themeAccents[currentTheme] || '#004aad';
		this.state.accent = defaultAccent;
		if (this.accentInput) this.accentInput.value = defaultAccent;
		this.applyAccent(defaultAccent);
		this.save();
	}

	applyAccent(hex) {
		// set CSS variables --accent and --accent-2 (lighter)
		try {
			document.documentElement.style.setProperty('--accent', hex);
			const rgb = ThemeCustomizer.hexToRgb(hex);
			const lighter = ThemeCustomizer.lightenColor(rgb, 24);
			document.documentElement.style.setProperty('--accent-2', ThemeCustomizer.rgbToHex(lighter));
			document.documentElement.style.setProperty('--accent-rgb', `${lighter.r}, ${lighter.g}, ${lighter.b}`);
		} catch (err) { console.warn('applyAccent', err); }
	}

	applyFont(font) {
		if (!font) return;
		document.body.style.fontFamily = font;
	}

	applyLayout(layout) {
		document.body.classList.remove('layout-compact', 'layout-comfortable');
		if (layout === 'compact') document.body.classList.add('layout-compact'); else document.body.classList.add('layout-comfortable');
	}

	updateLayoutButtons() {
		this.layoutBtns.forEach(b => b.classList.toggle('active', b.dataset.layout === this.state.layout));
	}

		_getFocusable() {
			if (!this.panel) return [];
			const selectors = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
			return Array.from(this.panel.querySelectorAll(selectors)).filter(el => el.offsetParent !== null);
		}

		_onKeyDown(e) {
			if (!this.panel || !this.panel.classList.contains('open')) return;
			if (e.key === 'Escape' || e.key === 'Esc') {
				e.preventDefault();
				this.close();
				return;
			}
			if (e.key === 'Tab') {
				const focusable = this._getFocusable();
				if (!focusable.length) return;
				const first = focusable[0];
				const last = focusable[focusable.length - 1];
				const active = document.activeElement;
				if (e.shiftKey) {
					if (active === first || this.panel === active) {
						e.preventDefault();
						last.focus();
					}
				} else {
					if (active === last) {
						e.preventDefault();
						first.focus();
					}
				}
			}
		}

	static hexToRgb(hex) {
		const hx = hex.replace('#', '');
		const bigint = parseInt(hx, 16);
		return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
	}

	static rgbToHex({ r, g, b }) {
		const toHex = (v) => ('0' + v.toString(16)).slice(-2);
		return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	}

	static lightenColor(rgb, amount) {
		// amount 0-100 add percentage to each channel
		const f = (v) => Math.min(255, Math.round(v + (amount / 100) * 255));
		return { r: f(rgb.r), g: f(rgb.g), b: f(rgb.b) };
	}
}
