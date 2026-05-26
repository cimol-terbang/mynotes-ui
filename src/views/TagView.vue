<template>
  <AppLayout>
    <div class="container--wide tag-page">
      <button class="back-btn" @click="$router.back()">
        <i class="pi pi-arrow-left" /> Kembali
      </button>

      <div class="tag-page__header">
        <h1 class="tag-page__title">
          <span class="tag-page__hash">#</span>{{ tag }}
        </h1>
        <p class="tag-page__sub">{{ posts.length }} tulisan ditemukan</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="posts-grid">
        <div v-for="n in 4" :key="n" class="post-skeleton">
          <Skeleton height="1.2rem" width="60%" class="mb-2" />
          <Skeleton height="0.85rem" width="100%" class="mb-1" />
          <Skeleton height="0.85rem" width="80%" />
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="posts.length === 0" class="state-msg">
        <i class="pi pi-inbox state-msg__icon" />
        <p>Tidak ada tulisan dengan tag ini.</p>
      </div>

      <!-- Grid -->
      <div v-else class="posts-grid">
        <article
          v-for="post in posts"
          :key="post._id"
          class="post-card"
          @click="$router.push({ name: 'post', params: { slug: post.slug } })"
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
              <span v-for="t in post.tags.slice(0, 3)" :key="t" class="tag-pill">#{{ t }}</span>
            </div>
            <span class="post-card__read">Baca <i class="pi pi-arrow-right" /></span>
          </div>
        </article>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { postService } from '@/services/api'

const route = useRoute()
const tag = ref(route.params.tag)
const posts = ref([])
const loading = ref(true)

const categoryLabel = (val) => {
  const map = { essay: 'What I Think', poem: 'What I Feel', story: 'What I Imagine' }
  return map[val] || val
}

const formatDate = (d) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

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

const fetchPosts = async () => {
  loading.value = true
  try {
    const res = await postService.getPostsByTag(tag.value)
    posts.value = res.data
  } catch {
    posts.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchPosts)
watch(() => route.params.tag, (val) => { tag.value = val; fetchPosts() })
</script>

<style scoped>
.tag-page { padding: 1.5rem 0 3rem; }

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: var(--mn-radius-xs);
  border: 1px solid var(--mn-border);
  background: var(--mn-surface-2);
  color: var(--mn-text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--mn-transition);
  margin-bottom: 1.5rem;
}

.back-btn:hover { background: var(--mn-border); color: var(--mn-text); }

.tag-page__header { margin-bottom: 1.5rem; }

.tag-page__title {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--mn-text);
}

.tag-page__hash { color: var(--mn-accent); }

.tag-page__sub {
  font-size: 0.875rem;
  color: var(--mn-text-muted);
  margin-top: 0.25rem;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

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
}

.cat-badge--essay { background: var(--mn-essay); color: var(--mn-essay-text); }
.cat-badge--poem  { background: var(--mn-poem);  color: var(--mn-poem-text); }
.cat-badge--story { background: var(--mn-story); color: var(--mn-story-text); }

.post-card__date { font-size: 0.72rem; color: var(--mn-text-subtle); }
.post-card__title { font-size: 1rem; font-weight: 700; color: var(--mn-text); line-height: 1.4; }
.post-card__preview { font-size: 0.85rem; color: var(--mn-text-muted); line-height: 1.6; flex: 1; }

.post-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.post-card__tags { display: flex; flex-wrap: wrap; gap: 0.3rem; }
.tag-pill { font-size: 0.72rem; color: var(--mn-text-subtle); }

.post-card__read {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--mn-accent);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.post-skeleton {
  background: var(--mn-surface);
  border: 1px solid var(--mn-border);
  border-radius: var(--mn-radius);
  padding: 1.25rem;
}

.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }

.state-msg {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--mn-text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.state-msg__icon { font-size: 2.5rem; color: var(--mn-border); }

@media (max-width: 640px) {
  .posts-grid { grid-template-columns: 1fr; }
}
</style>
