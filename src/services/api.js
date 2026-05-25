import axios from 'axios'

// Configure API base URL using environment variable or fallback to production API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://note-api.haotian.my.id'

const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// In-memory password storage for cross-origin auth (cookie fallback)
let _adminPassword = sessionStorage.getItem('admin_pwd') || ''

export const setAdminPassword = (pwd) => {
  _adminPassword = pwd
  sessionStorage.setItem('admin_pwd', pwd)
}

export const clearAdminPassword = () => {
  _adminPassword = ''
  sessionStorage.removeItem('admin_pwd')
}

// Attach password as header on every admin request
// Also clear Content-Type when sending FormData so axios can set
// multipart/form-data with the correct boundary automatically
adminApi.interceptors.request.use((config) => {
  if (_adminPassword) {
    config.headers['x-admin-password'] = _adminPassword
  }
  // If body is FormData, remove the default json Content-Type
  // so axios/browser can set multipart/form-data + boundary correctly
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

// Service untuk posts
export const postService = {
  // Mendapatkan semua posts
  getAllPosts() {
    return publicApi.get('/posts')
  },

  // Mendapatkan post berdasarkan slug
  getPostBySlug(slug) {
    return publicApi.get(`/posts/${slug}`)
  },

  // Mendapatkan posts berdasarkan kategori
  getPostsByCategory(category) {
    return publicApi.get(`/posts/category/${category}`)
  },

  // Mendapatkan posts berdasarkan tag
  getPostsByTag(tag) {
    return publicApi.get(`/posts/tag/${tag}`)
  },
}

// Service untuk comments
export const commentService = {
  // Mendapatkan komentar berdasarkan postId
  getCommentsByPost(postId) {
    return publicApi.get(`/comments/${postId}`)
  },

  // Membuat komentar baru
  createComment(commentData) {
    return publicApi.post('/comments', commentData)
  },
}

export const adminService = {
  login(password) {
    return adminApi.post('/admin/login', { password })
  },

  createPost(postData) {
    return adminApi.post('/admin/posts', postData)
  },

  deletePost(postId) {
    return adminApi.delete(`/admin/posts/${postId}`)
  },

  uploadImage(imageFile) {
    const formData = new FormData()
    formData.append('image', imageFile)
    // Do NOT set Content-Type manually — axios auto-sets multipart/form-data
    // with the correct boundary when FormData is passed
    return adminApi.post('/admin/upload', formData)
  },
}

export default publicApi
