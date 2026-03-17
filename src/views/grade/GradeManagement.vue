<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GradeService from '@/services/gradeService';
import DataTable from '@/components/common/DataTable.vue';
import { useModalStore } from '@/stores/modal';

const modal = useModalStore();
const route = useRoute();
const router = useRouter();
const lectureId = route.params.lectureId;
const isEditMode = ref(false);  // 수정모드 여부
const state = reactive({ 
    gradeList: [],
    isLoading: false
});

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

onMounted(async () => {
    state.isLoading = true;
    try {
        const res = await GradeService.getGradeList(lectureId);
        state.gradeList = res;
    } catch (error) {
        console.error('성적 로드 실패:', error);
        await modal.showAlert('성적 조회에 실패했습니다.', 'error');
    } finally {
        state.isLoading = false;
    }
});

//성적 수정 후 저장
const saveGrades = async () => {

    const confirm = await modal.showConfirm('성적을 저장하시겠습니까?', 'info');
    if (!confirm) return;

    try {
        const req = state.gradeList.map(s => ({
            courseId: s.courseId,
            midScore: s.midScore,
            finScore: s.finScore,
            assignmentScore: s.assignmentScore,
            attendScore: s.attendScore,
        }));
        await GradeService.updateGrades(lectureId, req);
        await modal.showAlert('성적이 저장되었습니다.', 'success');
        router.push(`/lectures/${lectureId}`);
    } catch (error) {
        console.error('저장 실패:', error);
        await modal.showAlert('성적 저장에 실패했습니다.', 'error');
    }
};
</script>

<template>
<div class="container">
    <h2 class="title">성적 관리</h2>

    <DataTable
        :columns="['학번', '성명', '학년', '중간평가', '기말평가', '과제점수', '출석점수', '총점', '최종등급']"
        :rows="state.gradeList"
        :isLoading="state.isLoading"
        gridCols="1fr 1fr 80px 1fr 1fr 1fr 1fr 80px 80px"
        emptyMessage="수강 학생이 없습니다.">

        <article class="tbl-row" v-for="(student, idx) in state.gradeList" :key="student.courseId ?? idx">
            <div>{{ student.code }}</div>
            <div>{{ student.name }}</div>
            <div>{{ student.academicYear }}</div>

            <!-- 성적 조회 모드 -->
            <template v-if="!isEditMode">
                <div>{{ student.midScore }}</div>
                <div>{{ student.finScore }}</div>
                <div>{{ student.assignmentScore }}</div>
                <div>{{ student.attendScore }}</div>
            </template>

            <!-- 성적 수정 모드 -->
            <template v-else>
                <div><input class="score-input" type="number" v-model="student.midScore"
                        @input="calcGrade(student)" /></div>
                <div><input class="score-input" type="number" v-model="student.finScore"
                        @input="calcGrade(student)" /></div>
                <div><input class="score-input" type="number" v-model="student.assignmentScore"
                        @input="calcGrade(student)" /></div>
                <div><input class="score-input" type="number" v-model="student.attendScore"
                        @input="calcGrade(student)" /></div>
            </template>

            <div>{{ student.totalScore }}</div>
            <div>
                <span :class="['grade-badge', student.gradeLetter]">
                    {{ student.gradeLetter || '-' }}
                </span>
            </div>
        </article>
    </DataTable>

    <div class="btn-group">
        <button class="btn btn-outline" @click="router.push(`/lectures/${lectureId}`)">목록</button>
        <!-- 조회 모드일 때 수정 버튼 -->
        <button v-if="!isEditMode" class="btn btn-primary" @click="isEditMode = true">수정</button>
        <!-- 수정 모드일 때 저장 버튼 -->
        <button v-else class="btn btn-primary" @click="saveGrades">저장</button>
    </div>
</div>
</template>

<style scoped>
.container { padding: 24px 32px; font-family: 'Noto Sans KR', sans-serif; }
.title { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
.score-input {
    width: 70px; padding: 4px 6px;
    border: 1px solid #ccc; border-radius: 4px;
    text-align: center; font-size: 14px;
}
.grade-badge {
    display: inline-block;
    width: 32px; height: 32px; line-height: 32px;
    border-radius: 50%; font-size: 14px; font-weight: 700; text-align: center;
}
.grade-badge.A { background: #e8f5e9; color: #2e7d32; }
.grade-badge.B { background: #e3f2fd; color: #1565c0; }
.grade-badge.C { background: #fff8e1; color: #f57f17; }
.grade-badge.D { background: #fce4ec; color: #c62828; }
.grade-badge.F { background: #eeeeee; color: #757575; }

.btn-group { display: flex; justify-content: flex-end; gap: 8px; margin-top: 15px; }
.btn { padding: 8px 20px; border-radius: 6px; font-size: 13px; cursor: pointer; border: none; }
.btn-outline { background: white; color: #555; border: 1px solid #ccc; }
.btn-outline:hover { background: #f5f5f5; }
</style>