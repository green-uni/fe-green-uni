<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import  LectureService  from '@/services/lectureService';

const router = useRouter();

onMounted(()=> {

});

const coding = () => {
    router.push('/lectures/:lectureId')
};

</script>

<template>
<div><button @click="coding">코딩학개론</button></div>
<div><button @click="love">사랑과전쟁</button></div>
<div><button @click="sports">스포츠역학</button></div>
<div><button @click="inc">인체해부학</button></div>
</template>

<style scoped>

</style>