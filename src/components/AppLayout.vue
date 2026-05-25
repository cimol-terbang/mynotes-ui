<template>
  <div class="layout">
    <!-- ── Navbar ── -->
    <header class="navbar">
      <div class="container--wide navbar__inner">
        <RouterLink to="/" class="navbar__brand">
          <i class="pi pi-book navbar__logo" style="font-size: 1.1rem; color: var(--mn-accent);" />
          <span class="navbar__title" style="margin-left: 0.25rem;">my Notes</span>
        </RouterLink>

        <nav class="navbar__nav">
          <RouterLink to="/" class="navbar__link" :class="{ active: $route.name === 'home' }">
            Home
          </RouterLink>
          <RouterLink to="/about" class="navbar__link" :class="{ active: $route.name === 'about' }">
            About
          </RouterLink>
        </nav>

        <button class="theme-toggle" @click="toggleDark" :aria-label="isDark ? 'Switch to light' : 'Switch to dark'">
          <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'" />
        </button>
      </div>
    </header>

    <!-- ── Page content ── -->
    <main class="layout__main">
      <slot />
    </main>

    <!-- ── Footer ── -->
    <footer class="footer">
      <div class="container--wide footer__inner">
        <div class="footer__left">
          <span class="footer__brand"><i class="pi pi-book" style="margin-right: 6px; color: var(--mn-accent);" />my Notes</span>
          <span class="footer__domain">note.haotian.my.id</span>
        </div>
        <div class="footer__right">
          <span class="footer__made">Made by</span>
          <a href="https://haotian.my.id" target="_blank" rel="noopener" class="footer__link">
            haotian.my.id
            <i class="pi pi-external-link" style="font-size: 0.7rem; margin-left: 3px;" />
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { RouterLink } from 'vue-router'

const isDark = inject('isDark')
const toggleDark = inject('toggleDark')
</script>

<style scoped>
/* ── Layout ── */
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout__main {
  flex: 1;
}

/* ── Navbar ── */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.82);
  border-bottom: 1px solid var(--mn-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 1px 0 var(--mn-border), 0 2px 12px rgba(59, 130, 196, 0.06);
}

.navbar__inner {
  display: flex;
  align-items: center;
  gap: 1rem;
  height: 56px;
}

.navbar__brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  flex-shrink: 0;
}

.navbar__logo {
  font-size: 1.1rem;
  color: var(--mn-accent);
}

.navbar__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--mn-text);
  letter-spacing: -0.02em;
}

.navbar__nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;
}

.navbar__link {
  padding: 0.35rem 0.75rem;
  border-radius: var(--mn-radius-xs);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--mn-text-muted);
  transition: all var(--mn-transition);
}

.navbar__link:hover,
.navbar__link.active {
  color: var(--mn-text);
  background: var(--mn-surface-2);
}

.navbar__link.active {
  color: var(--mn-accent);
}

.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--mn-border);
  background: var(--mn-surface-2);
  color: var(--mn-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--mn-transition);
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.theme-toggle:hover {
  background: var(--mn-border);
  color: var(--mn-text);
}

.theme-toggle i { font-size: 0.9rem; }

/* ── Footer ── */
.footer {
  border-top: 1px solid var(--mn-border);
  padding: 1.25rem 0;
  background: var(--mn-surface);
}

.footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.footer__left {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.footer__brand {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--mn-text);
}

.footer__domain {
  font-size: 0.75rem;
  color: var(--mn-text-subtle);
}

.footer__right {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--mn-text-muted);
}

.footer__link {
  color: var(--mn-accent);
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: color var(--mn-transition);
}

.footer__link:hover { color: var(--mn-accent-hover); }

@media (max-width: 480px) {
  .footer__inner { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
}
</style>
