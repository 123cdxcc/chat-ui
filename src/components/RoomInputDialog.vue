<template>
<NModal v-model:show="show" preset="dialog" positive-text="确认" @positive-click="ok" :title="props.title">
    <form @submit="ok">
        <NInput v-model:value="roomName" :placeholder="props.placeholder"></NInput>
    </form>
</NModal>
</template>

<script setup lang="ts">
import {NModal, NInput} from 'naive-ui'
import { ref } from 'vue';

const show = defineModel<boolean>('show', {
    default: false
})

const props = defineProps<{
    title: string,
    placeholder: string
}>()

const emits = defineEmits<{
    okCallback: [name: string]
}>()

const roomName = ref('')

function ok(e?: Event) {
    e?.preventDefault()
    emits('okCallback', roomName.value)
    show.value = false
    roomName.value = ''
}

</script>