import { useWebSocket } from '@vueuse/core'
import { watch } from 'vue'

enum MessageType {
    ChatData = 0,
    Heartbeat = 1,
    StreamChatData = 2
}

enum ChatObjectType {
    User = "user",
    Room = "room"
}

interface Message<T> {
    type: MessageType;
    data: T;
}

interface Sender {
    id: number;
    name: string;
}

interface Receiver {
    id: number; 
    name?: string;
    type: ChatObjectType;
}

interface ChatDataInput {
    clientSeqId: string;
    senderId: number;
    receiver: Receiver;
    content: string;
}

interface ChatDataOutput {
    id: string;
    clientSeqId: string;
    sender: Sender;
    receiver: Receiver;
    content: string;
}

const { open, data, status, send, close } = useWebSocket("/ws/chat/channel", {
    immediate: false,
    autoReconnect: true,
})

const subscribeRoomMap = new Map<number, (data: ChatDataOutput) => void>()

watch(data, (data) => {
    const message = JSON.parse(data) as Message<ChatDataOutput>
    if (message.type === MessageType.ChatData) {
        const roomID = message.data.receiver.id
        const callback = subscribeRoomMap.get(roomID)
        if (callback) {
            callback(message.data)
        }
    }
})

function subscribeRoom(roomID: number, callback: (data: ChatDataOutput) => void) {
    subscribeRoomMap.set(roomID, callback)
}

function unsubscribeRoom(roomID: number) {
    subscribeRoomMap.delete(roomID)
}

function sendMessage(data: ChatDataInput) {
    send(JSON.stringify({
        type: MessageType.ChatData,
        data: data
    }))
}

function sendHeartbeat() {
    send(JSON.stringify({
        type: MessageType.Heartbeat,
        data: {}
    }))
}

let heartbeatInterval = 0

function start() {
    open()
    // 每30秒发送一次心跳包
    heartbeatInterval = setInterval(() => {
        if (status.value === 'OPEN') {
            sendHeartbeat()
        }
    }, 30000)
}

function stop() {
    close()
    clearInterval(heartbeatInterval)
}

export {
    subscribeRoom,
    unsubscribeRoom,
    sendMessage,
    start,
    stop,
    status,
    ChatObjectType,
    MessageType,
}

export type {
    // 类型
    ChatDataInput,
    ChatDataOutput,
    Sender,
    Receiver,
    Message
}