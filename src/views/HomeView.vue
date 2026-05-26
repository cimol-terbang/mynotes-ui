<template>
  <AppLayout>

    <!-- ── Category Tabs ── -->
    <div class="category-bar">
      <div class="category-tabs">
        <div class="seg-control">
          <button
            v-for="cat in categories"
            :key="cat.value"
            class="seg-btn"
            :class="[{ active: activeCategory === cat.value }, `seg-btn--${cat.value}`]"
            @click="setCategory(cat.value)"
          >
            <span class="seg-btn__dot" aria-hidden="true"></span>
            {{ cat.label }}
          </button>
        </div>
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
  { value: 'all',   label: 'All' },
  { value: 'essay', label: 'Essay' },
  { value: 'poem',  label: 'Poem' },
  { value: 'story', label: 'Story' },
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
    .replace(/!\[[^\]]*\]\((.+?\.(?:png|jpg|jpeg|gif|webp|svg|bmp))(\s+["'].*?["'])?\)/gi, '')   // remove images robustly
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
  background: rgba(238, 244, 251, 0.88);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--mn-border);
  padding: 0.65rem 0;
}

[data-theme='dark'] .category-bar {
  background: rgba(13, 21, 32, 0.88);
}

.category-tabs {
  display: flex;
  justify-content: center;
  padding: 0 1rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.category-tabs::-webkit-scrollbar { display: none; }

/* ── Segmented control ── */
.seg-control {
  display: inline-flex;
  align-items: center;
  background: var(--mn-surface-2);
  border: 1px solid var(--mn-border);
  border-radius: 24px;
  padding: 3px;
  gap: 2px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.06);
}

.seg-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.85rem;
  border-radius: 20px;
  border: none;
  background: transparent;
  color: var(--mn-text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--mn-transition);
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.seg-btn:hover {
  color: var(--mn-text);
  background: rgba(255,255,255,0.5);
}

/* active — filled pill */
.seg-btn--all.active {
  background: var(--mn-accent);
  color: #fff;
  box-shadow: 0 2px 8px rgba(59,130,196,0.3);
}
.seg-btn--essay.active {
  background: var(--mn-essay);
  color: var(--mn-essay-text);
  box-shadow: 0 2px 8px rgba(29,78,216,0.15);
}
.seg-btn--poem.active {
  background: var(--mn-poem);
  color: var(--mn-poem-text);
  box-shadow: 0 2px 8px rgba(190,24,93,0.15);
}
.seg-btn--story.active {
  background: var(--mn-story);
  color: var(--mn-story-text);
  box-shadow: 0 2px 8px rgba(21,128,61,0.15);
}

/* colored dot decor */
.seg-btn__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: all var(--mn-transition);
}

.seg-btn--all    .seg-btn__dot { background: var(--mn-accent); opacity: 0.5; }
.seg-btn--essay  .seg-btn__dot { background: var(--mn-essay-text); opacity: 0.4; }
.seg-btn--poem   .seg-btn__dot { background: var(--mn-poem-text);  opacity: 0.4; }
.seg-btn--story  .seg-btn__dot { background: var(--mn-story-text); opacity: 0.4; }

.seg-btn.active .seg-btn__dot { opacity: 1; transform: scale(1.15); }
.seg-btn--all.active .seg-btn__dot { background: rgba(255,255,255,0.75); }

/* ── Posts section ── */
.posts-section {
  padding: 1.25rem 0 3rem;
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
  box-shadow: var(--mn-shadow-sm);
}

.tag-banner strong { color: var(--mn-accent); }

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

.tag-banner__clear:hover { color: var(--mn-text); }

/* ── Grid ── */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

/* ── Post card ── */
.post-card {
  position: relative;
  background: var(--mn-surface);
  border: 1px solid var(--mn-border);
  border-radius: var(--mn-radius);
  padding: 1.1rem 1.1rem 1rem;
  cursor: pointer;
  transition: all var(--mn-transition);
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  box-shadow: var(--mn-shadow-sm);
  overflow: hidden;
}

/* colored top border per category */
.post-card--essay { border-top: 2.5px solid #3b82f6; }
.post-card--poem  { border-top: 2.5px solid #ec4899; }
.post-card--story { border-top: 2.5px solid #22c55e; }

/* subtle gradient wash from top */
.post-card::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  opacity: 0.045;
  transition: opacity var(--mn-transition);
}

.post-card--essay::before { background: linear-gradient(160deg, #3b82f6 0%, transparent 55%); }
.post-card--poem::before  { background: linear-gradient(160deg, #ec4899 0%, transparent 55%); }
.post-card--story::before { background: linear-gradient(160deg, #22c55e 0%, transparent 55%); }

/* remove old circle blobs */
.post-card::after { display: none; }

.post-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--mn-shadow);
  border-color: var(--mn-accent);
}

.post-card:hover::before { opacity: 0.08; }

.post-card__cat {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cat-badge {
  font-size: 0.67rem;
  font-weight: 700;
  padding: 0.18rem 0.55rem;
  border-radius: 20px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.cat-badge--essay { background: var(--mn-essay); color: var(--mn-essay-text); }
.cat-badge--poem  { background: var(--mn-poem);  color: var(--mn-poem-text); }
.cat-badge--story { background: var(--mn-story); color: var(--mn-story-text); }

.post-card__date {
  font-size: 0.7rem;
  color: var(--mn-text-subtle);
}

.post-card__title {
  font-size: 0.975rem;
  font-weight: 700;
  color: var(--mn-text);
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.post-card__preview {
  font-size: 0.83rem;
  color: var(--mn-text-muted);
  line-height: 1.6;
  flex: 1;
}

.post-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.15rem;
}

.post-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.tag-pill {
  font-size: 0.7rem;
  color: var(--mn-text-subtle);
  cursor: pointer;
  transition: color var(--mn-transition);
  background: var(--mn-surface-2);
  padding: 0.08rem 0.4rem;
  border-radius: 20px;
  border: 1px solid var(--mn-border);
}

.tag-pill:hover {
  color: var(--mn-accent);
  border-color: var(--mn-accent);
}

.post-card__read {
  font-size: 0.73rem;
  font-weight: 600;
  color: var(--mn-accent);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
}

/* ── Skeleton ── */
.post-skeleton {
  background: var(--mn-surface);
  border: 1px solid var(--mn-border);
  border-radius: var(--mn-radius);
  padding: 1.1rem;
}

.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }

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
  .category-tabs {
    justify-content: center;
    padding: 0 0.875rem;
  }
  .seg-btn {
    padding: 0.28rem 0.7rem;
    font-size: 0.75rem;
  }
}
</style>
