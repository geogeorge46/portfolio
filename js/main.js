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
		this.body = document.body;
		this.themeSelect = document.getElementById('themeSelect');
		this.currentTheme = localStorage.getItem('geo_theme') || '';

		// Apply saved theme or detect system preference
		if (this.currentTheme) {
			this.body.classList.add(this.currentTheme);
			if (this.themeSelect) this.themeSelect.value = this.currentTheme;
		} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			this.setTheme('theme-dark');
		}

		// Set up theme selector
		if (this.themeSelect) {
			this.themeSelect.addEventListener('change', (e) => this.setTheme(e.target.value));
		}

		// Watch for system theme changes
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
			if (!localStorage.getItem('geo_theme')) {
				this.setTheme(e.matches ? 'theme-dark' : '');
			}
		});
	}

	setTheme(theme) {
		// Remove current theme
		if (this.currentTheme) {
			this.body.classList.remove(this.currentTheme);
		}

		// Apply new theme
		this.currentTheme = theme;
		if (theme) {
			this.body.classList.add(theme);
		}

		// Update UI and save preference
		if (this.themeSelect) this.themeSelect.value = theme;
		localStorage.setItem('geo_theme', theme);

		// Dispatch event for other components
		window.dispatchEvent(new CustomEvent('themechange', { detail: { theme }}));
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
		// AOS init
		if (window.AOS) AOS.init({ once: true, duration: 700 });

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

document.addEventListener('DOMContentLoaded', () => {
	try {
		new ThemeManager();
		UI.init();
		new ContactForm('contactForm');
		const t = document.getElementById('typing'); if (t) new TypingEffect(t, 30);
		console.log('Site initialized');
	} catch (err) {
		console.error('Init error', err);
	}
});

