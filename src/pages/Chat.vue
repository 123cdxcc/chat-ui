<template>
    <NLayout class="h-full" position="absolute">
        <NLayoutHeader position="absolute" bordered style="height: 60px;padding: 10px;" class="flex items-center">
            <NSpace justify="space-between" class="w-full">
                <div>hello {{ auth.user?.name }}</div>
                <div>
                    <NButton @click="logout">退出登录</NButton>
                </div>
            </NSpace>
        </NLayoutHeader>
        <NLayoutContent position="absolute" style="top: 60px;padding: 10px;" content-style="width: 100%;height: 100%;"
            :native-scrollbar="false">
            <div class="flex h-full w-full">
                <div class="w-[30%] h-full overflow-auto">
                    <NSpace>
                        <RoomInputDialog v-model:show="roomCreateDialogConfig.show" title="创建房间" placeholder="请输入房间名"
                            @ok-callback="createRoomDialogSubmitHandler"></RoomInputDialog>
                        <RoomInputDialog v-model:show="roomJoinDialogConfig.show" title="加入房间" placeholder="请输入房间ID"
                            @ok-callback="joinRoomDialogSubmitHandler"></RoomInputDialog>
                        <NButton @click="() => roomInputClickHandler('create')">创建房间</NButton>
                        <NButton @click="() => roomInputClickHandler('join')">加入房间</NButton>
                    </NSpace>
                    <NMenu v-model:value="currentRoom" :options="menuOptions"></NMenu>
                </div>
                <div class="w-[70%] h-full overflow-auto" ref="layoutContentRef">
                    <RouterView v-slot="{ Component }">
                        <transition>
                            <KeepAlive>
                                <component :key="currentRoom" :is="Component" />
                            </KeepAlive>
                        </transition>
                    </RouterView>
                </div>
            </div>
        </NLayoutContent>
    </NLayout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, reactive } from 'vue'
import { useAuth } from './../store'
import type { MenuOption } from 'naive-ui'
import {
    NLayout,
    NLayoutHeader,
    NLayoutContent,
    NSpace,
    NButton,
    NMenu,
    useMessage,
} from 'naive-ui'
import axios from 'axios'
import RoomInputDialog from '../components/RoomInputDialog.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const auth = useAuth()

const nMessage = useMessage()

const rooms = ref<any[]>([])

const currentRoom = ref('')

const menuOptions = computed<MenuOption[]>(() => {
    return rooms.value.map<MenuOption>(val => {
        return {
            label: `${val.name}(id: ${val.id})`,
            key: val.id
        }
    })
})

const roomCreateDialogConfig = reactive({
    show: false
})
const roomJoinDialogConfig = reactive({
    show: false
})

watch(currentRoom, (val) => {
    router.push({
        path: '/room/' + val
    })
})

function getRoomList() {
    axios.get('/api/room').then(res => {
        if (res.data.code == 0) {
            rooms.value = []
            if (res.data.data.list) {
                rooms.value.push(...res.data.data.list)
                if (!currentRoom.value) {
                    currentRoom.value = res.data.data.list[0].id
                }
            }
        }
    }).catch(err => {
        console.warn(err)
    })
}

function createRoomDialogSubmitHandler(name: string) {
    if (name.trim() === '') {
        return
    }
    axios.post('/api/room', {
        name: name
    }).then(res => {
        console.log(res.data)
        if (res.data.code == 0) {
            nMessage.info('创建成功')
            getRoomList()
        } else {
            nMessage.warning(res.data.message)
        }
    }).catch(err => {
        console.warn(err)
    })
}

function joinRoomDialogSubmitHandler(idStr: string) {
    if (idStr.trim() === '') {
        return
    }
    axios.post('/api/room/join', {
        room_id: idStr
    }).then(res => {
        if (res.data.code == 0) {
            nMessage.info('加入成功')
            getRoomList()
        } else {
            nMessage.warning(res.data.message)
        }
    }).catch(err => {
        console.warn(err)
    })
}

function roomInputClickHandler(type: 'create' | 'join') {
    switch (type) {
        case 'create':
            roomCreateDialogConfig.show = true
            break
        case 'join':
            roomJoinDialogConfig.show = true
            break
    }
}

function logout() {
    auth.setLogged(false)
    router.push({
        name: 'login'
    })
}

onMounted(() => {
    getRoomList()
})

</script>