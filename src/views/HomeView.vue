<template>
  <AppLayout>

    <!-- ── Category Tabs ── -->
    <div class="category-bar">
      <div class="category-tabs">
        <button
          v-for="cat in categories"
          :key="cat.value"
          class="cat-tab"
          :class="{ active: activeCategory === cat.value }"
          @click="setCategory(cat.value)"
        >
          <span class="cat-tab__icon">{{ cat.icon }}</span>
          <span class="cat-tab__label">{{ cat.label }}</span>
          <span class="cat-tab__sub">{{ cat.sub }}</span>
        </button>
      </div>
    </div>

    <!-- ── Posts ── -->
    <div class="posts-section">
      <div class="container--wide">
        <!-- Tag filter banner -->
        <div v-if="activeTag" class="tag-banner">
          <i class="pi pi-tag" />
          Posts tagged <strong>#{{ activeTag }}</strong>
          <button class="tag-banner__clear" @click="clearTag">
            <i class="pi pi-times" />
          </button>
        </div>

        <!-- Skeleton loading -->
        <div v-if="loading" class="posts-grid">
          <div v-for="n in 6" :key="n" class="post-skeleton">
            <Skeleton height="1.2rem" width="60%" class="mb-2" />
            <Skeleton height="0.85rem" width="40%" class="mb-3" />
            <Skeleton height="0.85rem" width="100%" class="mb-1" />
            <Skeleton height="0.85rem" width="90%" class="mb-1" />
            <Skeleton height="0.85rem" width="75%" />
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="state-msg">
          <i class="pi pi-exclamation-circle state-msg__icon" />
          <p>{{ error }}</p>
          <Button label="Try again" icon="pi pi-refresh" text @click="fetchPosts" />
        </div>

        <!-- Empty -->
        <div v-else-if="posts.length === 0" class="state-msg">
          <i class="pi pi-inbox state-msg__icon" />
          <p>Nothing here yet.</p>
        </div>

        <!-- Grid -->
        <div v-else class="posts-grid">
          <article
            v-for="post in posts"
            :key="post._id"
            class="post-card"
            :class="`post-card--${post.category}`"
            @click="goToPost(post.slug)"
          >
            <div class="post-card__cat">
              <span class="cat-badge" :class="`cat-badge--${post.category}`">
                {{ categoryLabel(post.category) }}
              </span>
              <span class="post-card__date">{{ formatDate(post.createdAt) }}</span>
            </div>

            <h2 class="post-card__title">{{ post.title }}</h2>
            <p class="post-card__preview">{{ truncate(post.content, 120) }}</p>

            <div class="post-card__footer">
              <div class="post-card__tags">
                <span
                  v-for="tag in post.tags.slice(0, 3)"
                  :key="tag"
                  class="tag-pill"
                  @click.stop="goToTag(tag)"
                  >#{{ tag }}</span
                >
              </div>
              <span class="post-card__read">Read <i class="pi pi-arrow-right" /></span>
            </div>
          </article>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { postService } from '@/services/api'

const router = useRouter()

const posts = ref([])
const loading = ref(true)
const error = ref(null)
const activeCategory = ref('all')
const activeTag = ref('')

const categories = [
  { value: 'all', icon: '✦', label: 'All', sub: 'All Written' },
  { value: 'essay', icon: '🧠', label: 'What I Think', sub: 'Essay' },
  { value: 'poem', icon: '🫀', label: 'What I Feel', sub: 'Poem' },
  { value: 'story', icon: '✨', label: 'What I Imagine', sub: 'Story' },
]

const categoryLabel = (val) => {
  const map = { essay: 'What I Think', poem: 'What I Feel', story: 'What I Imagine' }
  return map[val] || val
}

const fetchPosts = async () => {
  loading.value = true
  error.value = null
  try {
    let res
    if (activeTag.value) {
      res = await postService.getPostsByTag(activeTag.value)
    } else if (activeCategory.value !== 'all') {
      res = await postService.getPostsByCategory(activeCategory.value)
    } else {
      res = await postService.getAllPosts()
    }
    posts.value = res.data
  } catch {
    error.value = 'Failed to load posts. Make sure the server is running.'
  } finally {
    loading.value = false
  }
}

const setCategory = (val) => {
  activeCategory.value = val
  activeTag.value = ''
  fetchPosts()
}

const clearTag = () => {
  activeTag.value = ''
  fetchPosts()
}

const goToPost = (slug) => router.push({ name: 'post', params: { slug } })
const goToTag = (tag) => {
  activeTag.value = tag
  activeCategory.value = 'all'
  fetchPosts()
}

const stripMarkdown = (text) =>
  text
    .replace(/!\[.*?\]\(.*?\)/g, '')   // remove images ![alt](url)
    .replace(/\[.*?\]\(.*?\)/g, '$1')  // remove links, keep text
    .replace(/[#*_`>~\-]+/g, '')       // remove common md symbols
    .replace(/\s+/g, ' ')              // collapse whitespace
    .trim()

const truncate = (text, len) => {
  const plain = stripMarkdown(text)
  return plain.length <= len ? plain : plain.slice(0, len).trimEnd() + '…'
}

const formatDate = (d) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

onMounted(fetchPosts)
</script>

<style scoped>
/* ── Category bar ── */
.category-bar {
  position: sticky;
  top: 56px;
  z-index: 90;
  background: var(--mn-bg);
  border-bottom: 1px solid var(--mn-border);
  padding: 0.75rem 0;
}

.category-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 0 1rem 2px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

@media (max-width: 640px) {
  .category-tabs {
    justify-content: flex-start;
    padding: 0 0.875rem 2px;
    /* Ensure last tab isn't clipped when scrolling */
    padding-right: 0.875rem;
  }

  .cat-tab {
    flex-shrink: 0;
    padding: 0.4rem 0.75rem;
  }
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.cat-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  padding: 0.35rem 0.75rem;
  border-radius: var(--mn-radius-sm);
  border: 1px solid transparent;
  background: transparent;
  color: var(--mn-text-muted);
  cursor: pointer;
  transition: all var(--mn-transition);
  white-space: nowrap;
  flex-shrink: 0;
}

.cat-tab:hover {
  background: var(--mn-surface);
  border-color: var(--mn-border);
  color: var(--mn-text);
}

.cat-tab.active {
  background: var(--mn-surface);
  border-color: var(--mn-accent);
  color: var(--mn-accent);
}

.cat-tab__icon {
  font-size: 1.1rem;
}
.cat-tab__label {
  font-size: 0.8rem;
  font-weight: 600;
}
.cat-tab__sub {
  font-size: 0.65rem;
  color: var(--mn-text-subtle);
}

.cat-tab.active .cat-tab__sub {
  color: var(--mn-accent);
  opacity: 0.7;
}

/* ── Posts section ── */
.posts-section {
  padding: 1.5rem 0 3rem;
}

/* ── Tag banner ── */
.tag-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: var(--mn-surface);
  border: 1px solid var(--mn-border);
  border-radius: var(--mn-radius-sm);
  font-size: 0.875rem;
  color: var(--mn-text-muted);
  margin-bottom: 1.25rem;
}

.tag-banner strong {
  color: var(--mn-accent);
}

.tag-banner__clear {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--mn-text-subtle);
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 4px;
  transition: color var(--mn-transition);
}

.tag-banner__clear:hover {
  color: var(--mn-text);
}

/* ── Grid ── */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

/* ── Post card ── */
.post-card {
  background: var(--mn-surface);
  border: 1px solid var(--mn-border);
  border-radius: var(--mn-radius);
  padding: 1.25rem;
  cursor: pointer;
  transition: all var(--mn-transition);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--mn-shadow);
  border-color: var(--mn-accent);
}

.post-card__cat {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cat-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  letter-spacing: 0.02em;
}

.cat-badge--essay {
  background: var(--mn-essay);
  color: var(--mn-essay-text);
}
.cat-badge--poem {
  background: var(--mn-poem);
  color: var(--mn-poem-text);
}
.cat-badge--story {
  background: var(--mn-story);
  color: var(--mn-story-text);
}

.post-card__date {
  font-size: 0.72rem;
  color: var(--mn-text-subtle);
}

.post-card__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--mn-text);
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.post-card__preview {
  font-size: 0.85rem;
  color: var(--mn-text-muted);
  line-height: 1.6;
  flex: 1;
}

.post-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.25rem;
}

.post-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.tag-pill {
  font-size: 0.72rem;
  color: var(--mn-text-subtle);
  cursor: pointer;
  transition: color var(--mn-transition);
}

.tag-pill:hover {
  color: var(--mn-accent);
}

.post-card__read {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--mn-accent);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  white-space: nowrap;
}

/* ── Skeleton ── */
.post-skeleton {
  background: var(--mn-surface);
  border: 1px solid var(--mn-border);
  border-radius: var(--mn-radius);
  padding: 1.25rem;
}

.mb-1 {
  margin-bottom: 0.25rem;
}
.mb-2 {
  margin-bottom: 0.5rem;
}
.mb-3 {
  margin-bottom: 0.75rem;
}

/* ── State messages ── */
.state-msg {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--mn-text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.state-msg__icon {
  font-size: 2.5rem;
  color: var(--mn-border);
}

/* ── Mobile ── */
@media (max-width: 640px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
  .cat-tab {
    padding: 0.4rem 0.75rem;
  }
}
</style>
