import { defineStore } from 'pinia'
import { ref } from 'vue'

type User = {
    id: number
    name: string
}

export default defineStore('auth', () => {
    const logged = ref(false)
    const user = ref<User>()

    const setLogged = (val: boolean) => {
        logged.value = val
    }

    const setUser = (u: User) => {
        user.value = u
    }

    return {logged, user, setLogged, setUser}
}, {
    persist: true
})