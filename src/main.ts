import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import axios from 'axios'
import {useAuth} from './store'
import router from './route'


const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

axios.interceptors.response.use(res => {
    return res
}, err => {
    if (err.status === 401) {
        useAuth().setLogged(false)
    }
    return Promise.reject(err)
})


createApp(App).use(pinia).use(router).mount('#app')
