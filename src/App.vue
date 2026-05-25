<script setup>
import { ref, onMounted, provide } from 'vue'
import { RouterView } from 'vue-router'
import Toast from 'primevue/toast'
import ScrollTop from 'primevue/scrolltop'

const isDark = ref(false)

const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('mn-theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const saved = localStorage.getItem('mn-theme')
  isDark.value = saved ? saved === 'dark' : true
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
})

provide('isDark', isDark)
provide('toggleDark', toggleDark)
</script>

<template>
  <Toast position="bottom-center" />
  <RouterView />
  <ScrollTop :threshold="300" />
</template>

<style>
.p-scrolltop {
  background: var(--mn-accent) !important;
  border-radius: 50% !important;
  width: 2.5rem !important;
  height: 2.5rem !important;
  bottom: 1.5rem !important;
  right: 1.5rem !important;
}
</style>
