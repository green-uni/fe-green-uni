<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(()=> {

});

const coding = () => {
    router.push('/lectures/me/:lectureId')
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