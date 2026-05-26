<template>
  <AppLayout>
    <!-- Loading -->
    <div v-if="loading" class="container post-loading">
      <Skeleton height="2rem" width="70%" class="mb-3" />
      <Skeleton height="1rem" width="40%" class="mb-4" />
      <Skeleton v-for="n in 6" :key="n" height="1rem" class="mb-2" />
    </div>

    <!-- Error / Not found -->
    <div v-else-if="error" class="container state-msg">
      <i class="pi pi-exclamation-circle state-msg__icon" />
      <p>{{ error }}</p>
      <Button label="Go Back" icon="pi pi-arrow-left" text @click="$router.back()" />
    </div>

    <!-- Post -->
    <div v-else-if="post" class="container post-page">
      <!-- Back -->
      <button class="back-btn" @click="$router.back()">
        <i class="pi pi-arrow-left" /> Back
      </button>

      <!-- Header -->
      <header class="post-header">
        <div class="post-header__meta">
          <span class="cat-badge" :class="`cat-badge--${post.category}`">
            {{ categoryLabel(post.category) }}
          </span>
          <span class="post-header__date">{{ formatDate(post.createdAt) }}</span>
        </div>

        <h1 class="post-header__title">{{ post.title }}</h1>

        <div class="post-header__tags">
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="tag-pill"
            @click="$router.push({ name: 'tag', params: { tag } })"
            >#{{ tag }}</span
          >
        </div>
      </header>

      <Divider />

      <!-- Content -->
      <div class="post-content" :class="`post-content--${post.category}`" v-html="renderedContent" />

      <Divider />

      <!-- Comments -->
      <section class="comments">
        <h3 class="comments__title">
          <i class="pi pi-comments" />
          Comments
          <span class="comments__count">{{ comments.length }}</span>
        </h3>

        <!-- Comments loading -->
        <div v-if="commentsLoading" class="comments__list">
          <div v-for="n in 3" :key="n" class="comment-skeleton">
            <Skeleton shape="circle" size="2rem" />
            <div style="flex: 1">
              <Skeleton height="0.85rem" width="30%" class="mb-2" />
              <Skeleton height="0.85rem" width="80%" />
            </div>
          </div>
        </div>

        <!-- Comments list -->
        <div v-else-if="comments.length" class="comments__list">
          <div v-for="c in comments" :key="c.id" class="comment">
            <Avatar :label="c.name[0].toUpperCase()" shape="circle" class="comment__avatar" />
            <div class="comment__body">
              <div class="comment__header">
                <strong class="comment__name">{{ c.name }}</strong>
                <span class="comment__date">{{ formatDate(c.createdAt) }}</span>
              </div>
              <p class="comment__text">{{ c.content }}</p>
            </div>
          </div>
        </div>

        <p v-else class="comments__empty">No comments yet. Be the first!</p>

        <!-- Comment form -->
        <div class="comment-form">
          <h4 class="comment-form__title">Leave a comment</h4>
          <form @submit.prevent="submitComment">
            <div class="form-row">
              <div class="form-field">
                <label class="form-label">Name</label>
                <InputText
                  v-model="form.name"
                  placeholder="Anonymous"
                  :disabled="submitting"
                />
              </div>
            </div>
            <div class="form-field" style="margin-top: 0.75rem">
              <label class="form-label">Comment</label>
              <Textarea
                v-model="form.content"
                placeholder="Write a comment..."
                rows="4"
                required
                :disabled="submitting"
                auto-resize
              />
            </div>
            <div class="form-actions">
              <Button
                type="submit"
                :label="submitting ? 'Sending...' : 'Post Comment'"
                icon="pi pi-send"
                :loading="submitting"
                :disabled="submitting"
              />
            </div>
          </form>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { marked, Marked } from 'marked'
import AppLayout from '@/components/AppLayout.vue'
import { postService, commentService } from '@/services/api'

// Rewrite relative /uploads/ image URLs to absolute backend URL
const API_BASE = import.meta.env.VITE_API_URL || 'https://note-api.haotian.my.id'

const markedInstance = new Marked()
markedInstance.use({
  renderer: {
    image({ href, title, text }) {
      const src = href?.startsWith('/uploads/') ? `${API_BASE}${href}` : (href || '')
      const titleAttr = title ? ` title="${title}"` : ''
      return `<img src="${src}" alt="${text || ''}"${titleAttr} style="max-width:100%;border-radius:12px;margin:1rem 0;display:block;" />`
    }
  }
})

function encodeMarkdownImages(content) {
  if (!content) return ''
  return content.replace(/!\[([^\]]*)\]\((.+?\.(?:png|jpg|jpeg|gif|webp|svg|bmp))(\s+["'].*?["'])?\)/gi, (match, alt, url, title) => {
    const encodedUrl = url.replace(/ /g, '%20')
    const titleStr = title || ''
    return `![${alt}](${encodedUrl}${titleStr})`
  })
}

function parseMarkdown(content) {
  const processed = encodeMarkdownImages(content)
  return markedInstance.parse(processed, { async: false })
}

const route = useRoute()
const router = useRouter()
const toast = useToast()

const post = ref(null)
const loading = ref(true)
const error = ref(null)

const comments = ref([])
const commentsLoading = ref(false)

const form = ref({ name: '', content: '' })
const submitting = ref(false)

const renderedContent = computed(() => {
  if (!post.value) return ''
  return parseMarkdown(post.value.content)
})

const categoryLabel = (val) => {
  const map = { essay: 'What I Think', poem: 'What I Feel', story: 'What I Imagine' }
  return map[val] || val
}

const formatDate = (d) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

const fetchPost = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await postService.getPostBySlug(route.params.slug)
    post.value = res.data
    fetchComments()
  } catch (err) {
    error.value =
      err.response?.status === 404 ? 'Post not found.' : 'Failed to load post.'
  } finally {
    loading.value = false
  }
}

const fetchComments = async () => {
  if (!post.value) return
  commentsLoading.value = true
  try {
    const res = await commentService.getCommentsByPost(post.value.id)
    comments.value = res.data
  } catch {
    // silent fail
  } finally {
    commentsLoading.value = false
  }
}

const submitComment = async () => {
  submitting.value = true
  try {
    await commentService.createComment({
      postId: post.value.id,
      name: form.value.name.trim() || 'Anonymous',
      content: form.value.content,
    })
    form.value = { name: '', content: '' }
    toast.add({
      severity: 'success',
      summary: 'Sent!',
      detail: 'Your comment was posted.',
      life: 3000,
    })
    fetchComments()
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Failed',
      detail: 'Could not post your comment.',
      life: 3000,
    })
  } finally {
    submitting.value = false
  }
}

onMounted(fetchPost)
watch(() => route.params.slug, fetchPost)
</script>

<style scoped>
.post-loading {
  padding: 3rem 0;
  display: flex;
  flex-direction: column;
}

.mb-2 {
  margin-bottom: 0.5rem;
}
.mb-3 {
  margin-bottom: 0.75rem;
}
.mb-4 {
  margin-bottom: 1rem;
}

/* ── Back button ── */
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
  margin: 1.5rem 0 1.25rem;
}

.back-btn:hover {
  background: var(--mn-border);
  color: var(--mn-text);
}

/* ── Post header ── */
.post-header {
  margin-bottom: 1.5rem;
}

.post-header__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.cat-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
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

.post-header__date {
  font-size: 0.8rem;
  color: var(--mn-text-subtle);
}

.post-header__title {
  font-size: clamp(1.5rem, 5vw, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--mn-text);
  line-height: 1.25;
  margin-bottom: 1rem;
}

.post-header__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-pill {
  font-size: 0.8rem;
  color: var(--mn-text-subtle);
  cursor: pointer;
  transition: color var(--mn-transition);
}

.tag-pill:hover {
  color: var(--mn-accent);
}

/* ── Post content ── */
.post-content {
  padding: 0.5rem 0 1rem;
}

.post-content :deep(p) {
  font-size: 1.05rem;
  line-height: 1.85;
  color: var(--mn-text);
  margin-bottom: 1.25rem;
}

.post-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--mn-radius);
  margin: 1rem 0;
  display: block;
}

.post-content :deep(h1),
.post-content :deep(h2),
.post-content :deep(h3),
.post-content :deep(h4) {
  color: var(--mn-text);
  font-weight: 700;
  margin: 1.5rem 0 0.75rem;
  line-height: 1.3;
}

.post-content :deep(h2) { font-size: 1.4rem; }
.post-content :deep(h3) { font-size: 1.2rem; }

.post-content :deep(ul),
.post-content :deep(ol) {
  padding-left: 1.5rem;
  margin-bottom: 1.25rem;
  color: var(--mn-text);
  line-height: 1.85;
}

.post-content :deep(blockquote) {
  border-left: 3px solid var(--mn-accent);
  padding: 0.5rem 1rem;
  margin: 1rem 0;
  color: var(--mn-text-muted);
  font-style: italic;
  background: var(--mn-surface-2);
  border-radius: 0 var(--mn-radius-xs) var(--mn-radius-xs) 0;
}

.post-content :deep(code) {
  background: var(--mn-surface-2);
  padding: 0.15rem 0.4rem;
  border-radius: var(--mn-radius-xs);
  font-size: 0.9em;
  font-family: monospace;
}

.post-content :deep(pre) {
  background: var(--mn-surface-2);
  padding: 1rem;
  border-radius: var(--mn-radius);
  overflow-x: auto;
  margin-bottom: 1.25rem;
}

.post-content :deep(pre code) {
  background: none;
  padding: 0;
}

.post-content :deep(a) {
  color: var(--mn-accent);
  text-decoration: underline;
}

/* Poem: centered, italic */
.post-content--poem :deep(p) {
  text-align: center;
  font-style: italic;
  font-size: 1.1rem;
  line-height: 2;
  color: var(--mn-text-muted);
}

/* ── Comments ── */
.comments {
  padding-bottom: 3rem;
}

.comments__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--mn-text);
  margin-bottom: 1.25rem;
}

.comments__count {
  background: var(--mn-surface-2);
  color: var(--mn-text-muted);
  font-size: 0.75rem;
  padding: 0.1rem 0.5rem;
  border-radius: 20px;
  font-weight: 500;
}

.comments__list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.comment {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.comment-skeleton {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.comment__avatar {
  background: var(--mn-accent) !important;
  color: white !important;
  font-size: 0.8rem !important;
  width: 2rem !important;
  height: 2rem !important;
  flex-shrink: 0;
}

.comment__body {
  flex: 1;
}

.comment__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
}

.comment__name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--mn-text);
}

.comment__date {
  font-size: 0.75rem;
  color: var(--mn-text-subtle);
}

.comment__text {
  font-size: 0.875rem;
  color: var(--mn-text-muted);
  line-height: 1.6;
}

.comments__empty {
  font-size: 0.875rem;
  color: var(--mn-text-subtle);
  text-align: center;
  padding: 1.5rem;
  background: var(--mn-surface-2);
  border-radius: var(--mn-radius-sm);
  margin-bottom: 1.5rem;
}

/* ── Comment form ── */
.comment-form {
  background: var(--mn-surface-2);
  border: 1px solid var(--mn-border);
  border-radius: var(--mn-radius);
  padding: 1.25rem;
}

.comment-form__title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--mn-text);
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--mn-text-muted);
  margin-bottom: 0.4rem;
}

.comment-form :deep(.p-inputtext),
.comment-form :deep(.p-textarea) {
  padding: 0.525rem 0.75rem;
  width: 100%;
}

.form-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.comment-form :deep(.p-button) {
  padding: 0.55rem 1.25rem !important;
}

/* ── State ── */
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

@media (max-width: 640px) {
  .post-header__title {
    font-size: 1.5rem;
  }
  .post-content__para {
    font-size: 1rem;
  }
}
</style>
