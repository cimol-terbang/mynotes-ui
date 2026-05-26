<template>
  <AppLayout>
    <main class="about-page">
      <!-- ── Hero Emblem & Intro ── -->
      <section class="about-hero">
        <h1 class="hero-title">A quiet sanctuary for reading, thoughts, and imagination.</h1>
        
        <div class="hero-actions">
          <RouterLink to="/" class="p-button p-button-raised hero-btn">
            <i class="pi pi-compass" />
            <span>Start Reading</span>
          </RouterLink>
          <a
            href="https://haotian.my.id"
            target="_blank"
            rel="noopener"
            class="p-button p-button-outlined hero-btn-secondary"
          >
            <i class="pi pi-user" />
            <span>The Creator</span>
          </a>
        </div>
      </section>

      <!-- ── The Vision & Philosophy ── -->
      <section class="vision-section">
        <Card class="vision-card">
          <template #content>
            <div class="vision-header">
              <span class="vision-chip">Our Vision</span>
              <h2>A Space for Reflection and Meaning</h2>
            </div>
            <p class="vision-text">
              This is a space for reflection, contemplation, and careful thought. Through essays and spiritual writing, it seeks to explore the deeper questions of existence, belief, meaning, and the human experience.
          </template>
        </Card>
      </section>

      <!-- ── Interactive Reading Flows ── -->
      <section class="flows-section">
        <div class="section-header">
          <span class="section-label">Reading Flows</span>
          <h2>Explore Categories</h2>
        </div>

        <div class="flows-list">
          <RouterLink to="/" class="flow-card flow-card--essay">
            <div class="flow-icon">🧠</div>
            <div class="flow-info">
              <h3>What I Think</h3>
              <p>Essays for reflection, analysis, and quiet observation.</p>
            </div>
            <div class="flow-arrow">
              <i class="pi pi-arrow-right" />
            </div>
          </RouterLink>

          <RouterLink to="/" class="flow-card flow-card--poem">
            <div class="flow-icon">🫀</div>
            <div class="flow-info">
              <h3>What I Feel</h3>
              <p>Poetry for emotion, rhythm, and small surprises.</p>
            </div>
            <div class="flow-arrow">
              <i class="pi pi-arrow-right" />
            </div>
          </RouterLink>

          <RouterLink to="/" class="flow-card flow-card--story">
            <div class="flow-icon">✨</div>
            <div class="flow-info">
              <h3>What I Imagine</h3>
              <p>Stories and short journeys from a quiet mind.</p>
            </div>
            <div class="flow-arrow">
              <i class="pi pi-arrow-right" />
            </div>
          </RouterLink>
        </div>
      </section>

      <!-- ── Core Values Bar ── -->
      <section class="values-section">
        <div class="values-bar">
          <span class="value-item">
            <i class="pi pi-check-circle" /> Mindful Reading
          </span>
          <span class="value-item">
            <i class="pi pi-check-circle" /> Creative Focus
          </span>
          <span class="value-item">
            <i class="pi pi-check-circle" /> Distraction-Free
          </span>
        </div>
      </section>
    </main>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/AppLayout.vue'
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.about-page {
  padding: 3rem 1.25rem 4rem;
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* ── Hero Emblem & Intro ── */
.about-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.25rem;
  padding: 1rem 0;
}

.hero-title {
  font-size: clamp(1.85rem, 5vw, 2.35rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--mn-text);
  line-height: 1.3;
  max-width: 24ch;
  margin: 0 auto;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
  justify-content: center;
  margin-top: 0.5rem;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: var(--mn-accent) !important;
  border-color: var(--mn-accent) !important;
  color: #ffffff !important;
}

.hero-btn:hover {
  background: var(--mn-accent-hover) !important;
  border-color: var(--mn-accent-hover) !important;
}

.hero-btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-color: var(--mn-border) !important;
  color: var(--mn-text) !important;
}

.hero-btn-secondary:hover {
  background: var(--mn-surface-2) !important;
  border-color: var(--mn-border) !important;
}

/* ── The Vision & Philosophy ── */
.vision-card {
  border-radius: var(--mn-radius) !important;
  overflow: hidden;
  border: 1px solid var(--mn-border) !important;
  background: var(--mn-surface) !important;
}

.vision-header {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.vision-chip {
  align-self: flex-start;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--mn-accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.vision-header h2 {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--mn-text);
}

.vision-text {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--mn-text-muted);
  margin: 0;
}

/* ── Interactive Reading Flows ── */
.flows-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 0.25rem;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--mn-text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--mn-text);
}

.flows-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.flow-card {
  display: flex;
  align-items: center;
  padding: 1.15rem 1.25rem;
  border-radius: var(--mn-radius);
  border: 1px solid var(--mn-border);
  transition: all var(--mn-transition);
  background: var(--mn-surface);
  cursor: pointer;
  text-decoration: none;
}

.flow-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-right: 1rem;
  flex-shrink: 0;
}

.flow-info {
  flex: 1;
}

.flow-info h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.2rem;
}

.flow-info p {
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.45;
}

.flow-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mn-text-subtle);
  font-size: 0.85rem;
  margin-left: 0.75rem;
  transition: transform var(--mn-transition);
}

.flow-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--mn-shadow);
}

.flow-card:hover .flow-arrow {
  transform: translateX(3px);
  color: var(--mn-text);
}

/* Color thematic styles for each category flow card */
.flow-card--essay {
  border-left: 4px solid var(--mn-essay-text);
}
.flow-card--essay .flow-icon {
  background: var(--mn-essay);
}
.flow-card--essay h3 {
  color: var(--mn-essay-text);
}
.flow-card--essay p {
  color: var(--mn-text-muted);
}

.flow-card--poem {
  border-left: 4px solid var(--mn-poem-text);
}
.flow-card--poem .flow-icon {
  background: var(--mn-poem);
}
.flow-card--poem h3 {
  color: var(--mn-poem-text);
}
.flow-card--poem p {
  color: var(--mn-text-muted);
}

.flow-card--story {
  border-left: 4px solid var(--mn-story-text);
}
.flow-card--story .flow-icon {
  background: var(--mn-story);
}
.flow-card--story h3 {
  color: var(--mn-story-text);
}
.flow-card--story p {
  color: var(--mn-text-muted);
}

/* ── Core Values Bar ── */
.values-section {
  padding: 0.5rem 0;
  border-top: 1px solid var(--mn-border);
  margin-top: 0.5rem;
}

.values-bar {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 1rem;
}

.value-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--mn-text-muted);
  font-weight: 500;
}

.value-item i {
  color: var(--mn-accent);
  font-size: 0.9rem;
}

/* ── Mobile Optimization ── */
@media (max-width: 640px) {
  .about-page {
    padding: 2rem 1rem 3rem;
    gap: 2rem;
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
  }

  .hero-btn,
  .hero-btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .flow-card {
    padding: 1rem;
  }

  .flow-icon {
    width: 42px;
    height: 42px;
    font-size: 1.25rem;
    margin-right: 0.75rem;
    border-radius: 12px;
  }

  .values-bar {
    justify-content: flex-start;
    flex-direction: column;
    gap: 0.75rem;
    padding-left: 0.25rem;
  }
}
</style>
