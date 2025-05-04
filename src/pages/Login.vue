<template>
    <div class="w-full h-full flex justify-center items-center">
        <NForm @submit="submit" label-placement="left" label-width="auto" require-mark-placement="right-hanging">
            <NFormItem label="用户名" :rule="{ required: true }">
                <NInput v-model:value="userName" placeholder="请输入"></NInput>
            </NFormItem>
            <NFormItem>
                <NButton type="primary" :disabled="!userName" round attr-type="submit">进入系统</NButton>
            </NFormItem>
        </NForm>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios';
import { useAuth } from './../store'
import { NForm, NFormItem, NInput, NButton, useNotification } from 'naive-ui'
import { useRouter } from 'vue-router';

const router = useRouter()

const auth = useAuth()
const notification = useNotification()


const userName = ref("");

function submit(e: Event) {
    e.preventDefault()
    axios.post("/api/auth/login", {
        "user-name": userName.value
    }).then(res => {
        if (res.data.code == 0) {
            axios.get("/api/user/detail").then(res => {
                if (res.data.code == 0) {
                    auth.setUser({
                        id: res.data.data.id,
                        name: res.data.data.username
                    })
                    notification.success({
                        title: '登陆成功',
                        content: '欢迎您！' + res.data.data.username,
                        duration: 3000
                    })
                    router.push({
                        name: 'home'
                    })
                }
            })
            auth.setLogged(true)
        } else {
            alert(res.data.message)
        }
    }).catch(err => {
        console.warn(err)
    })
}

</script>