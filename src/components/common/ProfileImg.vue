<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/authentication';

const authStore = useAuthStore()

const props = defineProps({
    memberId: String,
    clsValue: String,
    size: Number,
    pic: String
});

const pic = computed( () => props.pic
                            ? `/file/member/${props.memberId}/${props.pic}` : '' );

const handleImgError = e => {
    // e.target.src = defaultProfileImg;
    e.target.onError = null; // 무한 루트 방지용 에러이벤트 제거
}

</script>

<template>
    <div class="circleimg" :class="`${props.clsValue} w${props.size} h${props.size}`">
        <img :src="pic" @error="handleImgError" />
    </div>
</template>

<style scoped>
.w24 { width: 24px; }
.w30 { width: 30px; }
.w100 { width: 100px; }
.w250 { width: 250px; }
.w300 { width: 300px; }

.w800 { width: 800px; }
</style>
