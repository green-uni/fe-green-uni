<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted( ()=>{
  
});

const atdMana = () => {
    router.push('/lectures/management/attendance')
};

const gradeMana = () => {
    router.push('/lectures/management/grade')
};

</script>

<template>
  <h3>강의 디테일</h3>
  <div><button class="attendanceButton" @click="atdMana">출석관리</button></div>
  <br>
  <div><button class="gradeButton" @click="gradeMana">성적관리</button></div>
</template>

<style scoped>
.attendanceButton{
  cursor: pointer;
}
</style>