<script setup>
import { onMounted, reactive } from 'vue';
import GradeService from '@/services/gradeService';
import DataTable from '@/components/common/DataTable.vue';

const state = reactive({ 
    gradeList: [],
    isLoading: false
});

onMounted(async () => {
    state.isLoading = true;
    try {
        const res = await GradeService.getMyGrades();
        state.gradeList = res || [];
    } catch (error) {
        console.error('성적 조회 실패:', error);
    } finally {
        state.isLoading = false;
    }
});
</script>

<template>
<div class="container">

    <DataTable
        :columns="['년도', '학기', '구분', '교과목명', '학점', '등급', '평점']"
        :rows="state.gradeList"
        :isLoading="state.isLoading"
        gridCols="80px 80px 80px 1fr 80px 80px 80px"
        emptyMessage="성적 데이터가 없습니다.">

        <article class="tbl-row" v-for="(item, idx) in state.gradeList" :key="idx">
            <div>{{ item.year }}</div>
            <div>{{ item.semester }}학기</div>
            <div>{{ item.lectureType }}</div>
            <div>{{ item.lectureName }}</div>
            <div>{{ item.credit }}</div>
            <div>
                <!--클래스명 뜻은 item.gradeLetter가 'A'라면 class="grade-badge A"가 되고
                                    item.gradeLetter가 'B'라면 class="grade-badge B"가 됨
                                    따라서 아래 style에서 css로 각의 효과를 줄 수 있음(이상 AI팀장님의 답변..)-->
                <span :class="['grade-badge', item.gradeLetter]">
                    {{ item.gradeLetter || '-' }}
                </span>
            </div>
            <div>{{ item.finalScore }}</div>
        </article>
    </DataTable>
</div>
</template>

<style scoped>
.container { padding: 24px 32px; font-family: 'Noto Sans KR', sans-serif; }
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

</style>