import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVfm } from 'vue-final-modal'

import App from '@/pages/App.vue'
import router from './router'
import { initBaseUrl, setupAxiosInterceptor } from '@/axios'
import i18n from '@/i18n'

// Google Fonts
import '@fontsource/poppins/300.css'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'

import '@fontsource/mulish/400.css'
import '@fontsource/mulish/600.css'
import '@fontsource/mulish/700.css'

// Styles
import 'vue-final-modal/style.css'
import 'vue-multiselect/dist/vue-multiselect.css'
import 'vue3-toastify/dist/index.css'
import '@vuepic/vue-datepicker/dist/main.css'

// Vue.js
const app = createApp(App)

app.use(i18n)

// Order is important, first pinia then router
// because isLoggedIn state
const pinia = createPinia()
app.use(pinia)

initBaseUrl()

app.use(router)
app.use(createVfm())

setupAxiosInterceptor()

app.mount('#app')
