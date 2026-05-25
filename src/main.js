import './assets/main.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import App from './App.vue'
import router from './router'

// PrimeVue components
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Chip from 'primevue/chip'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Divider from 'primevue/divider'
import Avatar from 'primevue/avatar'
import Badge from 'primevue/badge'
import ProgressSpinner from 'primevue/progressspinner'
import Skeleton from 'primevue/skeleton'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import TabMenu from 'primevue/tabmenu'
import ScrollTop from 'primevue/scrolltop'

const app = createApp(App)

app.use(PrimeVue, { ripple: true })
app.use(ToastService)
app.use(router)

app.component('Button', Button)
app.component('Card', Card)
app.component('Tag', Tag)
app.component('Chip', Chip)
app.component('InputText', InputText)
app.component('Textarea', Textarea)
app.component('Divider', Divider)
app.component('Avatar', Avatar)
app.component('Badge', Badge)
app.component('ProgressSpinner', ProgressSpinner)
app.component('Skeleton', Skeleton)
app.component('Toast', Toast)
app.component('TabMenu', TabMenu)
app.component('ScrollTop', ScrollTop)

app.mount('#app')
