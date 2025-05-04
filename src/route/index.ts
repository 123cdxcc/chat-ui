import { createWebHistory, createRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Login from '../pages/Login.vue'
import ChatHome from '../pages/Chat.vue'
import Chat from '../components/Chat.vue'
import { useAuth } from '../store'

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: Login },
  { path: '/', name: 'home', component: ChatHome, children: [
    {
        path: '/room/:roomID',
        name: 'chat',
        props: true,
        component: Chat
    }
  ] },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _) => {
    if (to.name !== 'login' && !useAuth().logged) {
        return {
            name: 'login'
        }
    }
})

export default router