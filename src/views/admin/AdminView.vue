<template>
  <AppLayout>
    <Toast />
    
    <div class="container admin-page">
      <!-- ── Login Popup Overlay ── -->
      <div v-if="!isAuthenticated" class="login-overlay">
        <div class="login-box">
          <div class="login-header">
            <div class="login-icon">
              <i class="pi pi-lock" />
            </div>
            <h2>Admin Portal</h2>
            <p>Enter password to manage your notes.</p>
          </div>

          <div class="login-form">
            <div class="form-field">
              <label for="admin-pwd" class="form-label">Password</label>
              <div class="password-input-wrapper">
                <i class="pi pi-key input-icon" />
                <InputText
                  id="admin-pwd"
                  type="password"
                  v-model="password"
                  placeholder="••••••••"
                  class="pwd-input"
                  :disabled="submitting"
                  @keyup.enter="handleLogin"
                  autofocus
                />
              </div>
            </div>

            <div v-if="loginError" class="login-error">
              <i class="pi pi-exclamation-triangle" />
              <span>{{ loginError }}</span>
            </div>

            <Button
              label="Unlock Panel"
              icon="pi pi-lock-open"
              class="login-btn"
              :loading="submitting"
              @click="handleLogin"
            />
          </div>
        </div>
      </div>

      <!-- ── Authenticated Admin Panel ── -->
      <div v-else class="admin-dashboard">
        <!-- Dashboard Header -->
        <header class="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p class="dashboard-sub">Manage your notes, compose new ideas, and upload media.</p>
          </div>
          <Button
            label="Logout"
            icon="pi pi-power-off"
            severity="danger"
            outlined
            class="logout-btn"
            @click="handleLogout"
          />
        </header>

        <!-- Dashboard Tabs Navigation -->
        <div class="dashboard-tabs">
          <button
            class="dash-tab-btn"
            :class="{ active: currentTab === 'notes' }"
            @click="currentTab = 'notes'"
          >
            <i class="pi pi-file-edit" /> Notes Editor
          </button>
          <button
            class="dash-tab-btn"
            :class="{ active: currentTab === 'images' }"
            @click="currentTab = 'images'"
          >
            <i class="pi pi-images" /> Media Library
          </button>
        </div>

        <div v-if="currentTab === 'notes'" class="dashboard-grid">
          <!-- Left: Compose Post -->
          <div class="dashboard-left">
            <Card class="editor-card">
              <template #content>
                <div class="card-header">
                  <h2>Compose Note</h2>
                  <div class="editor-tabs">
                    <button
                      class="tab-btn"
                      :class="{ active: editorMode === 'edit' }"
                      @click="editorMode = 'edit'"
                    >
                      <i class="pi pi-pencil" /> Write
                    </button>
                    <button
                      class="tab-btn"
                      :class="{ active: editorMode === 'preview' }"
                      @click="editorMode = 'preview'"
                    >
                      <i class="pi pi-eye" /> Preview
                    </button>
                  </div>
                </div>

                <!-- Editor Form -->
                <div v-show="editorMode === 'edit'" class="editor-form">
                  <div class="form-grid-2">
                    <div class="form-field">
                      <label class="form-label">Title</label>
                      <InputText
                        v-model="newPost.title"
                        placeholder="Note title..."
                        @input="handleTitleInput"
                        required
                      />
                    </div>

                    <div class="form-field">
                      <label class="form-label">Slug</label>
                      <InputText
                        v-model="newPost.slug"
                        placeholder="note-slug"
                        required
                      />
                    </div>
                  </div>

                  <div class="form-grid-2">
                    <div class="form-field">
                      <label class="form-label">Category</label>
                      <select v-model="newPost.category" class="custom-select">
                        <option value="essay">🧠 What I Think (Essay)</option>
                        <option value="poem">🫀 What I Feel (Poem)</option>
                        <option value="story">✨ What I Imagine (Story)</option>
                      </select>
                    </div>

                    <div class="form-field">
                      <label class="form-label">Tags (comma-separated)</label>
                      <InputText
                        v-model="newPost.tagsString"
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                  </div>

                  <!-- Image Uploader -->
                  <div class="form-field uploader-field">
                    <label class="form-label">Upload Image</label>
                    <div class="uploader-box" :class="{ uploading: uploading }">
                      <input
                        type="file"
                        accept="image/*"
                        ref="fileInput"
                        style="display: none"
                        @change="handleImageUpload"
                      />
                      <div class="uploader-content" @click="$refs.fileInput.click()">
                        <i :class="uploading ? 'pi pi-spin pi-spinner' : 'pi pi-image'" />
                        <span>{{ uploading ? 'Uploading to API...' : 'Click to upload and embed image' }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="form-field">
                    <label class="form-label">Content (Markdown)</label>
                    <Textarea
                      v-model="newPost.content"
                      placeholder="Write your note here in Markdown..."
                      rows="12"
                      required
                      style="resize: vertical; min-height: 300px;"
                    />
                  </div>

                  <div class="editor-footer">
                    <div class="publish-toggle">
                      <label class="switch-label">
                        <input type="checkbox" v-model="newPost.isPublished" />
                        <span class="switch-custom"></span>
                        <span class="label-text">{{ newPost.isPublished ? 'Publish Live' : 'Save as Draft' }}</span>
                      </label>
                    </div>

                    <Button
                      :label="creating ? 'Saving...' : 'Save Note'"
                      :icon="creating ? 'pi pi-spin pi-spinner' : 'pi pi-check'"
                      class="save-btn"
                      :loading="creating"
                      @click="submitPost"
                    />
                  </div>
                </div>

                <!-- Preview Tab -->
                <div v-show="editorMode === 'preview'" class="editor-preview">
                  <div class="preview-header-meta">
                    <span v-if="newPost.category" class="cat-badge" :class="`cat-badge--${newPost.category}`">
                      {{ newPost.category }}
                    </span>
                    <span class="draft-badge" :class="{ 'badge--published': newPost.isPublished }">
                      {{ newPost.isPublished ? 'Published' : 'Draft' }}
                    </span>
                  </div>
                  <h1 class="preview-title">{{ newPost.title || 'Untitled Note' }}</h1>
                  <div class="preview-tags">
                    <span v-for="tag in parsedTags" :key="tag" class="tag-pill">#{{ tag }}</span>
                  </div>
                  <Divider />
                  <div class="post-preview-content markdown-body" v-html="renderedContent"></div>
                </div>
              </template>
            </Card>
          </div>

          <!-- Right: Manage Posts -->
          <div class="dashboard-right">
            <Card class="manage-card">
              <template #content>
                <div class="card-header">
                  <h2>Manage Notes</h2>
                  <span class="posts-count-badge">{{ posts.length }} total</span>
                </div>

                <div v-if="fetching" class="posts-skeleton-list">
                  <div v-for="n in 4" :key="n" class="skeleton-post-row">
                    <Skeleton width="60%" height="1.1rem" class="mb-2" />
                    <Skeleton width="40%" height="0.8rem" />
                  </div>
                </div>

                <div v-else-if="posts.length === 0" class="empty-posts-state">
                  <i class="pi pi-folder-open" />
                  <p>No notes published yet.</p>
                </div>

                <div v-else class="posts-list">
                  <div v-for="p in posts" :key="p.id" class="post-row">
                    <div class="post-row-info">
                      <div class="post-row-meta">
                        <span class="cat-badge" :class="`cat-badge--${p.category}`">{{ p.category }}</span>
                        <span class="status-badge" :class="p.isPublished ? 'status--live' : 'status--draft'">
                          {{ p.isPublished ? 'live' : 'draft' }}
                        </span>
                        <span class="post-row-date">{{ formatDate(p.createdAt) }}</span>
                      </div>
                      <h3 class="post-row-title">{{ p.title }}</h3>
                      <div class="post-row-tags">
                        <span v-for="tag in p.tags" :key="tag" class="tag-pill">#{{ tag }}</span>
                      </div>
                    </div>

                    <div class="post-row-actions">
                      <Button
                        :icon="togglingId === p.id ? 'pi pi-spin pi-spinner' : (p.isPublished ? 'pi pi-eye-slash' : 'pi pi-eye')"
                        :title="p.isPublished ? 'Unpublish' : 'Publish'"
                        severity="secondary"
                        outlined
                        class="action-btn"
                        :loading="togglingId === p.id"
                        @click="togglePublish(p)"
                      />
                      <Button
                        icon="pi pi-pencil"
                        title="Edit"
                        severity="info"
                        outlined
                        class="action-btn"
                        @click="openEdit(p)"
                      />
                      <Button
                        icon="pi pi-trash"
                        title="Delete"
                        severity="danger"
                        outlined
                        class="action-btn delete-btn"
                        :loading="deletingId === p.id"
                        @click="confirmDelete(p)"
                      />
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>

        <!-- Media Library Tab -->
        <div v-else-if="currentTab === 'images'" class="media-library">
          <Card class="media-card">
            <template #content>
              <div class="card-header">
                <h2>Media Library</h2>
                <span class="posts-count-badge">{{ images.length }} total</span>
              </div>

              <!-- Skeleton loading -->
              <div v-if="fetchingImages" class="images-skeleton-grid">
                <div v-for="n in 8" :key="n" class="skeleton-img-card">
                  <Skeleton width="100%" height="150px" class="mb-2" />
                  <Skeleton width="60%" height="1rem" class="mb-1" />
                  <Skeleton width="40%" height="0.8rem" />
                </div>
              </div>

              <!-- Empty state -->
              <div v-else-if="images.length === 0" class="empty-posts-state">
                <i class="pi pi-images" style="font-size:2.5rem;color:var(--mn-border);margin-bottom:0.5rem;" />
                <p>No images uploaded yet. Upload images while composing notes to see them here.</p>
              </div>

              <!-- Images Grid -->
              <div v-else class="images-grid">
                <div v-for="img in images" :key="img.filename" class="image-card">
                  <div class="image-card__preview" @click="downloadImage(img)" title="Click to download image">
                    <img :src="`${API_BASE_URL}${img.url}`" :alt="img.filename" />
                  </div>

                  <div class="image-card__body">
                    <!-- Filename & Inline Rename form -->
                    <div class="image-card__name-container">
                      <div v-if="editingImageName === img.filename" class="rename-inline-form">
                        <InputText
                          v-model="newImageName"
                          class="rename-input"
                          @keyup.enter="submitRenameImage(img)"
                          @keyup.esc="cancelRenameImage"
                          autofocus
                        />
                        <div class="rename-actions">
                          <Button
                            icon="pi pi-check"
                            severity="success"
                            text
                            rounded
                            size="small"
                            @click="submitRenameImage(img)"
                          />
                          <Button
                            icon="pi pi-times"
                            severity="danger"
                            text
                            rounded
                            size="small"
                            @click="cancelRenameImage"
                          />
                        </div>
                      </div>
                      <div v-else class="filename-row">
                        <span class="image-filename" :title="img.filename">{{ img.filename }}</span>
                        <button class="rename-trigger-btn" title="Rename Image" @click="startRenameImage(img)">
                          <i class="pi pi-pencil" />
                        </button>
                      </div>
                    </div>

                    <div class="image-card__meta">
                      <span class="image-size">{{ formatSize(img.size) }}</span>
                      <span class="image-date">{{ formatDate(img.createdAt) }}</span>
                    </div>

                    <div class="image-card__actions">
                      <Button
                        label="Copy MD"
                        icon="pi pi-copy"
                        outlined
                        severity="secondary"
                        class="action-btn-block"
                        @click="copyMarkdown(img)"
                      />
                      <div class="action-btn-row">
                        <Button
                          icon="pi pi-download"
                          outlined
                          severity="info"
                          title="Download"
                          @click="downloadImage(img)"
                        />
                        <Button
                          icon="pi pi-trash"
                          outlined
                          severity="danger"
                          title="Delete"
                          @click="deleteImage(img)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- ── Edit Modal ── -->
    <div v-if="editingPost" class="modal-overlay" @click.self="closeEdit">
      <div class="modal-box">
        <div class="modal-header">
          <h2>Edit Post</h2>
          <button class="modal-close" @click="closeEdit"><i class="pi pi-times" /></button>
        </div>

        <div class="editor-form">
          <div class="form-grid-2">
            <div class="form-field">
              <label class="form-label">Title</label>
              <InputText v-model="editForm.title" placeholder="Note title..." />
            </div>
            <div class="form-field">
              <label class="form-label">Slug</label>
              <InputText v-model="editForm.slug" placeholder="note-slug" />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-field">
              <label class="form-label">Category</label>
              <select v-model="editForm.category" class="custom-select">
                <option value="essay">🧠 What I Think (Essay)</option>
                <option value="poem">🫀 What I Feel (Poem)</option>
                <option value="story">✨ What I Imagine (Story)</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Tags (comma-separated)</label>
              <InputText v-model="editForm.tagsString" placeholder="tag1, tag2" />
            </div>
          </div>

          <!-- Image Uploader in Edit Modal -->
          <div class="form-field uploader-field">
            <label class="form-label">Upload Image</label>
            <div class="uploader-box" :class="{ uploading: editUploading }">
              <input
                type="file"
                accept="image/*"
                ref="editFileInput"
                style="display: none"
                @change="handleEditImageUpload"
              />
              <div class="uploader-content" @click="$refs.editFileInput.click()">
                <i :class="editUploading ? 'pi pi-spin pi-spinner' : 'pi pi-image'" />
                <span>{{ editUploading ? 'Uploading to API...' : 'Click to upload and embed image' }}</span>
              </div>
            </div>
          </div>

          <div class="form-field">
            <label class="form-label">Content (Markdown)</label>
            <Textarea v-model="editForm.content" rows="12" style="resize: vertical; min-height: 300px;" />
          </div>

          <div class="editor-footer">
            <div class="publish-toggle">
              <label class="switch-label">
                <input type="checkbox" v-model="editForm.isPublished" />
                <span class="switch-custom"></span>
                <span class="label-text">{{ editForm.isPublished ? 'Publish Live' : 'Save as Draft' }}</span>
              </label>
            </div>
            <div style="display:flex;gap:0.5rem">
              <Button label="Cancel" severity="secondary" outlined @click="closeEdit" />
              <Button
                :label="saving ? 'Saving...' : 'Save Changes'"
                :icon="saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'"
                class="save-btn"
                :loading="saving"
                @click="submitEdit"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { adminService, postService, setAdminPassword, clearAdminPassword } from '@/services/api'
import { useToast } from 'primevue/usetoast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://note-api.haotian.my.id'

const toast = useToast()

const isAuthenticated = ref(localStorage.getItem('admin_authenticated') === 'true')
const password = ref('')
const loginError = ref('')
const submitting = ref(false)

const posts = ref([])
const fetching = ref(false)
const deletingId = ref(null)
const togglingId = ref(null)

// Edit modal state
const editingPost = ref(null)
const editForm = ref({})
const saving = ref(false)

const editorMode = ref('edit')
const uploading = ref(false)
const creating = ref(false)

// Image Management refs
const currentTab = ref('notes')
const images = ref([])
const fetchingImages = ref(false)
const editingImageName = ref(null)
const newImageName = ref('')
const editUploading = ref(false)

const newPost = ref({
  title: '',
  slug: '',
  category: 'essay',
  tagsString: '',
  content: '',
  isPublished: true,
})

const handleTitleInput = () => {
  newPost.value.slug = newPost.value.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const parsedTags = computed(() => {
  if (!newPost.value.tagsString) return []
  return newPost.value.tagsString
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t)
})

const renderedContent = computed(() => {
  const text = newPost.value.content
  if (!text) return '<p class="empty-preview">Your rendered content will appear here...</p>'
  
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\((.+?\.(?:png|jpg|jpeg|gif|webp|svg|bmp))(\s+["'].*?["'])?\)/gi, (match, alt, path, title) => {
      const fullUrl = path.startsWith('http') ? path : API_BASE_URL + path
      const encodedUrl = fullUrl.replace(/ /g, "%20")
      return `<img src="${encodedUrl}" alt="${alt}" class="preview-img" />`
    })
    .split('\n\n')
    .map((p) => p.trim() ? `<p>${p.replace(/\n/g, '<br>')}</p>` : '')
    .join('')
  
  return html
})

const handleLogin = async () => {
  if (!password.value) {
    loginError.value = 'Password is required'
    return
  }
  submitting.value = true
  loginError.value = ''
  try {
    await adminService.login(password.value)
    setAdminPassword(password.value)
    isAuthenticated.value = true
    localStorage.setItem('admin_authenticated', 'true')
    toast.add({
      severity: 'success',
      summary: 'Authenticated',
      detail: 'Welcome to the dashboard.',
      life: 3000,
    })
    fetchPosts()
  } catch (err) {
    loginError.value = err.response?.data?.error || 'Authentication failed'
  } finally {
    submitting.value = false
  }
}

const handleLogout = () => {
  isAuthenticated.value = false
  localStorage.removeItem('admin_authenticated')
  clearAdminPassword()
  password.value = ''
  toast.add({
    severity: 'info',
    summary: 'Logged Out',
    detail: 'Session closed successfully.',
    life: 3000,
  })
}

const fetchPosts = async () => {
  fetching.value = true
  try {
    const res = await adminService.getAllPosts()
    posts.value = res.data
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      handleLogout()
    }
  } finally {
    fetching.value = false
  }
}

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  uploading.value = true
  try {
    const res = await adminService.uploadImage(file)
    const url = res.data.url
    const encodedUrl = url.replace(/ /g, "%20")
    const imageMarkdown = `![image](${encodedUrl})`
    newPost.value.content += `\n\n${imageMarkdown}\n`
    toast.add({
      severity: 'success',
      summary: 'Image Uploaded',
      detail: 'Embedded into editor content.',
      life: 3000,
    })
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Upload Failed',
      detail: err.response?.data?.error || 'Failed to upload image.',
      life: 3000,
    })
  } finally {
    uploading.value = false
    event.target.value = '' // Reset input
  }
}

const handleEditImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  editUploading.value = true
  try {
    const res = await adminService.uploadImage(file)
    const url = res.data.url
    const encodedUrl = url.replace(/ /g, "%20")
    const imageMarkdown = `![image](${encodedUrl})`
    editForm.value.content += `\n\n${imageMarkdown}\n`
    toast.add({
      severity: 'success',
      summary: 'Image Uploaded',
      detail: 'Embedded into edit content.',
      life: 3000,
    })
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Upload Failed',
      detail: err.response?.data?.error || 'Failed to upload image.',
      life: 3000,
    })
  } finally {
    editUploading.value = false
    event.target.value = '' // Reset input
  }
}

const fetchImages = async () => {
  fetchingImages.value = true
  try {
    const res = await adminService.getImages()
    images.value = res.data
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load media library.',
      life: 3000,
    })
  } finally {
    fetchingImages.value = false
  }
}

const startRenameImage = (img) => {
  editingImageName.value = img.filename
  newImageName.value = img.filename
}

const cancelRenameImage = () => {
  editingImageName.value = null
  newImageName.value = ''
}

const submitRenameImage = async (img) => {
  if (!newImageName.value || newImageName.value === img.filename) {
    cancelRenameImage()
    return
  }
  try {
    await adminService.renameImage(img.filename, newImageName.value)
    toast.add({
      severity: 'success',
      summary: 'Renamed',
      detail: 'Image renamed and post references updated!',
      life: 3000,
    })
    cancelRenameImage()
    fetchImages()
    fetchPosts() // Refresh posts as their markdown links might have been updated!
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Rename Failed',
      detail: err.response?.data?.error || 'Failed to rename image.',
      life: 3000,
    })
  }
}

const downloadImage = (img) => {
  const downloadUrl = `${API_BASE_URL}/admin/images/download/${img.filename}`
  const link = document.createElement('a')
  link.href = downloadUrl
  link.setAttribute('download', img.filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const deleteImage = async (img) => {
  if (!confirm(`Are you sure you want to permanently delete "${img.filename}"?`)) return
  try {
    await adminService.deleteImage(img.filename)
    toast.add({
      severity: 'success',
      summary: 'Deleted',
      detail: 'Image removed from storage.',
      life: 3000,
    })
    fetchImages()
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Delete Failed',
      detail: 'Could not delete the image.',
      life: 3000,
    })
  }
}

const copyMarkdown = (img) => {
  const md = `![image](${img.url.replace(/ /g, '%20')})`
  navigator.clipboard.writeText(md)
  toast.add({
    severity: 'info',
    summary: 'Copied!',
    detail: 'Markdown image syntax copied to clipboard.',
    life: 2000,
  })
}

const formatSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

watch(currentTab, (newTab) => {
  if (newTab === 'images') {
    fetchImages()
  }
})

const submitPost = async () => {
  if (!newPost.value.title || !newPost.value.content || !newPost.value.slug) {
    toast.add({
      severity: 'warn',
      summary: 'Validation',
      detail: 'Title, Slug, and Content are required fields.',
      life: 3000,
    })
    return
  }
  creating.value = true
  try {
    const postData = {
      title: newPost.value.title,
      slug: newPost.value.slug,
      content: newPost.value.content,
      category: newPost.value.category,
      tags: parsedTags.value,
      isPublished: newPost.value.isPublished,
    }
    await adminService.createPost(postData)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Note created successfully!',
      life: 3000,
    })
    // Reset form
    newPost.value = {
      title: '',
      slug: '',
      category: 'essay',
      tagsString: '',
      content: '',
      isPublished: true,
    }
    fetchPosts()
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      handleLogout()
      toast.add({
        severity: 'error',
        summary: 'Unauthorized',
        detail: 'Session expired. Please log in again.',
        life: 3000,
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.error || 'Failed to save note.',
        life: 3000,
      })
    }
  } finally {
    creating.value = false
  }
}

const confirmDelete = async (post) => {
  if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return
  deletingId.value = post.id
  try {
    await adminService.deletePost(post.id)
    toast.add({ severity: 'success', summary: 'Deleted', detail: 'Note removed successfully.', life: 3000 })
    fetchPosts()
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      handleLogout()
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete note.', life: 3000 })
    }
  } finally {
    deletingId.value = null
  }
}

const togglePublish = async (post) => {
  togglingId.value = post.id
  try {
    await adminService.updatePost(post.id, { isPublished: !post.isPublished })
    toast.add({
      severity: 'success',
      summary: post.isPublished ? 'Unpublished' : 'Published',
      detail: post.isPublished ? 'Moved to drafts.' : 'Post is now live.',
      life: 2500,
    })
    fetchPosts()
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update status.', life: 3000 })
  } finally {
    togglingId.value = null
  }
}

const openEdit = (post) => {
  editingPost.value = post
  editForm.value = {
    title: post.title,
    slug: post.slug,
    category: post.category,
    tagsString: (post.tags || []).join(', '),
    content: post.content,
    isPublished: post.isPublished,
  }
}

const closeEdit = () => {
  editingPost.value = null
  editForm.value = {}
}

const submitEdit = async () => {
  if (!editForm.value.title || !editForm.value.content || !editForm.value.slug) {
    toast.add({ severity: 'warn', summary: 'Validation', detail: 'Title, Slug, and Content are required.', life: 3000 })
    return
  }
  saving.value = true
  try {
    const tags = editForm.value.tagsString
      ? editForm.value.tagsString.split(',').map(t => t.trim().toLowerCase()).filter(t => t)
      : []
    await adminService.updatePost(editingPost.value.id, {
      title: editForm.value.title,
      slug: editForm.value.slug,
      category: editForm.value.category,
      content: editForm.value.content,
      tags,
      isPublished: editForm.value.isPublished,
    })
    toast.add({ severity: 'success', summary: 'Saved', detail: 'Post updated successfully.', life: 3000 })
    closeEdit()
    fetchPosts()
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.error || 'Failed to update.', life: 3000 })
  } finally {
    saving.value = false
  }
}

const formatDate = (d) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

onMounted(() => {
  if (isAuthenticated.value) {
    fetchPosts()
  }
})
</script>

<style scoped>
.admin-page {
  padding: 2rem 1.25rem 4rem;
  max-width: 1100px;
  width: min(100%, 1100px);
  margin: 0 auto;
}

/* ── Login Overlay ── */
.login-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 15, 15, 0.75);
  backdrop-filter: blur(16px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.login-box {
  background: var(--mn-surface);
  border: 1px solid var(--mn-border);
  border-radius: var(--mn-radius);
  max-width: 400px;
  width: 100%;
  padding: 2.25rem 2rem;
  box-shadow: var(--mn-shadow-lg);
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.login-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.login-icon {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  background: var(--mn-surface-2);
  border: 1px solid var(--mn-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  color: var(--mn-accent);
  margin-bottom: 0.25rem;
}

.login-header h2 {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
}

.login-header p {
  font-size: 0.85rem;
  color: var(--mn-text-muted);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.password-input-wrapper {
  position: relative;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--mn-text-subtle);
  font-size: 0.9rem;
}

.pwd-input {
  padding-left: 2.25rem !important;
  width: 100%;
}

/* Fix PrimeVue InputText placeholder padding globally in form */
.editor-form :deep(.p-inputtext),
.login-form :deep(.p-inputtext) {
  padding: 0.525rem 0.75rem;
  width: 100%;
}

.login-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.8rem;
  background: rgba(239, 83, 80, 0.1);
  border: 1px solid rgba(239, 83, 80, 0.2);
  border-radius: var(--mn-radius-sm);
  color: #ef5350;
  font-size: 0.825rem;
}

.login-btn {
  width: 100%;
  background: var(--mn-accent) !important;
  border-color: var(--mn-accent) !important;
  color: white !important;
  padding: 0.65rem !important;
  justify-content: center;
}

.login-btn:hover {
  background: var(--mn-accent-hover) !important;
}

/* ── Dashboard Layout ── */
.logout-btn {
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  padding: 0.5rem 1.25rem !important;
  white-space: nowrap;
  min-width: 110px;
}

.logout-label {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;
}



.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--mn-border);
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0 0 0.25rem;
}

.dashboard-sub {
  font-size: 0.95rem;
  color: var(--mn-text-muted);
  margin: 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.4fr 0.9fr;
  gap: 1.75rem;
  align-items: start;
}

/* Cards & Form elements */
.editor-card,
.manage-card {
  border-radius: var(--mn-radius) !important;
  background: var(--mn-surface) !important;
  border: 1px solid var(--mn-border) !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--mn-border);
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.editor-tabs {
  display: flex;
  gap: 0.35rem;
  background: var(--mn-surface-2);
  padding: 0.2rem;
  border-radius: var(--mn-radius-sm);
  border: 1px solid var(--mn-border);
}

.tab-btn {
  background: transparent;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: var(--mn-radius-xs);
  color: var(--mn-text-muted);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: all var(--mn-transition);
}

.tab-btn.active {
  background: var(--mn-surface);
  color: var(--mn-accent);
  box-shadow: var(--mn-shadow-sm);
}

.editor-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--mn-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.custom-select {
  background: var(--mn-surface);
  border: 1px solid var(--mn-border);
  border-radius: var(--mn-radius-sm);
  color: var(--mn-text);
  padding: 0.525rem 0.75rem;
  font-family: inherit;
  font-size: 0.95rem;
  width: 100%;
  outline: none;
  transition: border-color var(--mn-transition);
}

.custom-select:focus {
  border-color: var(--mn-accent);
}

/* Image Uploader styling */
.uploader-box {
  border: 2px dashed var(--mn-border);
  border-radius: var(--mn-radius-sm);
  background: var(--mn-surface-2);
  padding: 0.75rem;
  text-align: center;
  transition: all var(--mn-transition);
}

.uploader-box:hover {
  border-color: var(--mn-accent);
  background: var(--mn-surface);
}

.uploader-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--mn-text-muted);
  font-size: 0.875rem;
  font-weight: 600;
}

.uploader-content i {
  font-size: 1.1rem;
}

.uploader-box.uploading {
  border-color: var(--mn-accent);
  opacity: 0.7;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--mn-border);
}

/* Switch styling */
.publish-toggle {
  display: inline-block;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.switch-label input {
  display: none;
}

.switch-custom {
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: var(--mn-border);
  position: relative;
  transition: background var(--mn-transition);
}

.switch-custom::after {
  content: '';
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--mn-surface);
  position: absolute;
  left: 2px;
  top: 2px;
  transition: transform var(--mn-transition);
}

.switch-label input:checked + .switch-custom {
  background: var(--mn-accent);
}

.switch-label input:checked + .switch-custom::after {
  transform: translateX(16px);
}

.label-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--mn-text-muted);
}

.save-btn {
  background: var(--mn-accent) !important;
  border-color: var(--mn-accent) !important;
  color: white !important;
  padding: 0.55rem 1.25rem !important;
}

.save-btn:hover {
  background: var(--mn-accent-hover) !important;
}

/* Preview Area */
.editor-preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 400px;
}

.preview-header-meta {
  display: flex;
  gap: 0.5rem;
}

.draft-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
  background: var(--mn-surface-2);
  color: var(--mn-text-muted);
  border: 1px solid var(--mn-border);
}

.badge--published {
  background: rgba(46, 125, 50, 0.1);
  color: #2e7d32;
  border-color: rgba(46, 125, 50, 0.2);
}

.preview-title {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--mn-text);
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tag-pill {
  font-size: 0.75rem;
  color: var(--mn-text-subtle);
}

.empty-preview {
  font-style: italic;
  color: var(--mn-text-subtle);
  padding: 2rem 0;
  text-align: center;
}

/* Markdown preview classes */
.post-preview-content {
  line-height: 1.8;
  color: var(--mn-text);
}

.post-preview-content :deep(p) {
  margin-bottom: 1.25rem;
  font-size: 1rem;
}

.post-preview-content :deep(h1),
.post-preview-content :deep(h2),
.post-preview-content :deep(h3) {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 700;
}

.post-preview-content :deep(h1) { font-size: 1.5rem; }
.post-preview-content :deep(h2) { font-size: 1.3rem; }
.post-preview-content :deep(h3) { font-size: 1.1rem; }

.post-preview-content :deep(img.preview-img) {
  max-width: 100%;
  border-radius: var(--mn-radius-sm);
  border: 1px solid var(--mn-border);
  margin: 1rem 0;
  display: block;
}

/* Category Badges */
.cat-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
  text-transform: uppercase;
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

/* Right Side: Manage list */
.posts-count-badge {
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--mn-surface-2);
  color: var(--mn-text-muted);
  padding: 0.2rem 0.5rem;
  border-radius: 20px;
  border: 1px solid var(--mn-border);
}

.posts-skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-post-row {
  border-bottom: 1px solid var(--mn-border);
  padding-bottom: 0.75rem;
}

.empty-posts-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--mn-text-subtle);
  gap: 0.75rem;
}

.empty-posts-state i {
  font-size: 2.25rem;
  color: var(--mn-border);
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 520px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.post-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--mn-border);
}

.post-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.post-row-info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}

.post-row-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.post-row-date {
  font-size: 0.72rem;
  color: var(--mn-text-subtle);
}

.post-row-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
  color: var(--mn-text);
  line-height: 1.35;
}

.post-row-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.delete-btn {
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-color: rgba(239, 83, 80, 0.3) !important;
  color: #ef5350 !important;
}

.delete-btn:hover {
  background: rgba(239, 83, 80, 0.1) !important;
  border-color: #ef5350 !important;
}

/* ── Post row actions ── */
.post-row-actions {
  display: flex;
  gap: 0.35rem;
  flex-shrink: 0;
}

.action-btn {
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.status--live {
  background: rgba(34,197,94,0.12);
  color: #16a34a;
  border: 1px solid rgba(34,197,94,0.25);
}

.status--draft {
  background: var(--mn-surface-2);
  color: var(--mn-text-subtle);
  border: 1px solid var(--mn-border);
}

/* ── Edit Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(6px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-box {
  background: var(--mn-surface);
  border: 1px solid var(--mn-border);
  border-radius: var(--mn-radius);
  width: min(100%, 720px);
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.75rem;
  box-shadow: var(--mn-shadow-lg);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--mn-border);
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: var(--mn-text-muted);
  font-size: 1rem;
  padding: 0.25rem;
  border-radius: var(--mn-radius-xs);
  transition: color var(--mn-transition);
}

.modal-close:hover { color: var(--mn-text); }

/* ── Dashboard Tab Navigation ── */
.dashboard-tabs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--mn-border);
  padding-bottom: 0.5rem;
}

.dash-tab-btn {
  background: transparent;
  border: none;
  font-size: 0.95rem;
  font-weight: 700;
  padding: 0.5rem 1rem;
  color: var(--mn-text-muted);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-bottom: 2px solid transparent;
  transition: all var(--mn-transition);
}

.dash-tab-btn:hover {
  color: var(--mn-text);
}

.dash-tab-btn.active {
  color: var(--mn-accent);
  border-bottom-color: var(--mn-accent);
}

/* ── Media Library Grid ── */
.media-card {
  border-radius: var(--mn-radius) !important;
  background: var(--mn-surface) !important;
  border: 1px solid var(--mn-border) !important;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.image-card {
  background: var(--mn-surface-2);
  border: 1px solid var(--mn-border);
  border-radius: var(--mn-radius-sm);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--mn-shadow-sm);
  transition: all var(--mn-transition);
}

.image-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--mn-shadow);
  border-color: var(--mn-accent);
}

.image-card__preview {
  height: 140px;
  background: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.image-card__preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform var(--mn-transition);
}

.image-card:hover .image-card__preview img {
  transform: scale(1.05);
}

.image-card__body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.image-card__name-container {
  min-height: 38px;
  display: flex;
  align-items: center;
}

.filename-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.5rem;
}

.image-filename {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--mn-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.rename-trigger-btn {
  background: none;
  border: none;
  color: var(--mn-text-subtle);
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 4px;
  transition: color var(--mn-transition);
}

.rename-trigger-btn:hover {
  color: var(--mn-accent);
}

.rename-inline-form {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
}

.rename-input {
  font-size: 0.8rem !important;
  padding: 0.35rem 0.5rem !important;
  flex: 1;
}

.rename-actions {
  display: flex;
  gap: 0.1rem;
}

.image-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: var(--mn-text-subtle);
  border-bottom: 1px solid var(--mn-border);
  padding-bottom: 0.5rem;
}

.image-card__actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-btn-block {
  width: 100%;
  font-size: 0.8rem !important;
  padding: 0.4rem !important;
  justify-content: center;
}

.action-btn-row {
  display: flex;
  gap: 0.5rem;
}

.action-btn-row :deep(.p-button) {
  flex: 1;
  font-size: 0.8rem !important;
  padding: 0.4rem !important;
  justify-content: center;
}

/* ── Image Skeletons Grid ── */
.images-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.skeleton-img-card {
  background: var(--mn-surface-2);
  border: 1px solid var(--mn-border);
  border-radius: var(--mn-radius-sm);
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
}

/* ── Responsive dashboard ── */
@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .admin-page {
    padding: 1.5rem 0.875rem 3rem;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .logout-btn {
    width: 100% !important;
    justify-content: center !important;
    display: flex !important;
  }

  .logout-btn :deep(.p-button-label) {
    display: inline !important;
  }

  .form-grid-2 {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .editor-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .save-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
