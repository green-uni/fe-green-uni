<script setup>
import { onMounted, reactive } from 'vue'; 
import StudentInfo from '@/services/studentInfo';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const state = reactive({
    studentList: []
});


const id=route.params.lectureId;
onMounted(async () => {
    try {
        const res = await StudentInfo.findByStudentInfo(id);
        state.studentList = res;
        console.log("학생목록:", state.studentList);
    } catch (error) {
        console.error("데이터 로드 실패:", error);
    }
});

</script>

<template>

<div v-for="student in state.studentList" :key="student.studentCode">
  <div>{{ student.majorName }}</div>
  <div>{{ student.studentCode }}</div>
  <div>{{ student.studentName }}</div>
  <div>{{ student.academicYear }}</div>
  <div>{{ student.gradeLetter }}</div>
</div>
</template>

<style scoped>

</style>