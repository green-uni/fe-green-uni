<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GradeService from '@/services/gradeService';

const route = useRoute();
const router = useRouter();
const lectureId = route.params.lectureId;

const isEditMode = ref(false); // 수정모드 여부
const state = reactive({ gradeList: [] });

onMounted(async () => {
    try {
        const res = await GradeService.getGradeList(lectureId);
        state.gradeList = res;
    } catch (error) {
        console.error('성적 로드 실패:', error);
    }
});

//성적 수정 후 저장
const saveGrades = async () => {
    try {
        const req = state.gradeList.map(s => ({
            courseId: s.courseId,
            midScore: s.midScore,
            finScore: s.finScore,
            assignmentScore: s.assignmentScore,
            attendScore: s.attendScore,
        }));
        await GradeService.updateGrades(lectureId, req);
        alert('성적이 저장되었습니다.');
        router.push(`/lectures/${lectureId}`);
    } catch (error) {
        console.error('저장 실패:', error);
        alert('저장에 실패했습니다.');
    }
};

// 점수 변경 시 totalScore, gradeLetter 실시간 계산하는 로직
const calcGrade = (student) => {
    const total = Number(student.midScore) + Number(student.finScore)
                + Number(student.assignmentScore) + Number(student.attendScore);
    student.totalScore = total;
    if      (total >= 90) student.gradeLetter = 'A';
    else if (total >= 80) student.gradeLetter = 'B';
    else if (total >= 70) student.gradeLetter = 'C';
    else if (total >= 60) student.gradeLetter = 'D';
    else                  student.gradeLetter = 'F';
};

</script>

<template>
<div class="grade-container">
    <h2 class="title">성적 관리</h2>

    <table class="grade-table">
        <thead>
            <tr>
                <th>학번</th>
                <th>성명</th>
                <th>학년</th>
                <th>중간평가</th>
                <th>기말평가</th>
                <th>과제점수</th>
                <th>출석점수</th>
                <th>총점</th>
                <th>최종 등급</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="student in state.gradeList" :key="student.courseId">
                <td>{{ student.code }}</td>
                <td>{{ student.name }}</td>
                <td>{{ student.academicYear }}</td>

                <!--  성적 조회 모드 -->
                <template v-if="!isEditMode">
                    <td>{{ student.midScore }}</td>
                    <td>{{ student.finScore }}</td>
                    <td>{{ student.assignmentScore }}</td>
                    <td>{{ student.attendScore }}</td>
                </template>

                <!-- 성적 수정 모드 -->
                <template v-else>
                    <td><input class="score-input" type="number" v-model="student.midScore" @input="calcGrade(student)" /></td>
                    <td><input class="score-input" type="number" v-model="student.finScore" @input="calcGrade(student)" /></td>
                    <td><input class="score-input" type="number" v-model="student.assignmentScore" @input="calcGrade(student)" /></td>
                    <td><input class="score-input" type="number" v-model="student.attendScore" @input="calcGrade(student)" /></td>
                </template>

                <td>{{ student.totalScore }}</td>
                <td>{{ student.gradeLetter || '-' }}</td>
            </tr>
        </tbody>
    </table>

    <div class="btn-group">
        <button class="btn btn-submit" @click="router.push(`lectures/${lectureId}`)">목록</button>
        <!-- 조회 모드일 때 수정 버튼 -->
        <button v-if="!isEditMode" class="btn btn-submit" @click="isEditMode = true">수정</button>
        <!-- 수정 모드일 때 저장 버튼 -->
        <button v-else class="btn btn-submit" @click="saveGrades">저장</button>
    </div>
</div>
</template>

<style scoped>
.grade-container { padding: 24px 32px; font-family: 'Noto Sans KR', sans-serif; }
.title { font-size: 18px; font-weight: 700; margin-bottom: 20px; }

.grade-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.grade-table th {
    background: #f5f5f5; padding: 10px 12px;
    text-align: center; font-weight: 600;
    border-bottom: 2px solid #e0e0e0;
    border: 1px solid #ddd;
}
.grade-table td {
    padding: 10px 12px; text-align: center;
    border: 1px solid #ddd;
}
.grade-table tr:hover td { background: #f9f9f9; }

.score-input {
    width: 70px; padding: 4px 6px;
    border: 1px solid #ccc; border-radius: 4px;
    text-align: center; font-size: 14px;
}

.btn-group { 
    display: flex;
    justify-content: flex-end;
    margin-top: 15px;
    gap: 8px;
}
</style>