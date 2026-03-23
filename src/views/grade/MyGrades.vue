<script setup>
import { onMounted, reactive, computed } from 'vue';
import DataTable from '@/components/common/DataTable.vue';
import GradeService from '@/services/gradeService';
import { useModalStore } from '@/stores/modal';

const modal = useModalStore();
const state = reactive({ 
    gradeList: [],
    isLoading: false
});

//년도별 데이터 그룹핑 + 총학점 + 평점평균 계산 (년도별 요약 계산)
const yearSummary = computed(() => {
    const yearList = [...new Set(state.gradeList.map(item => item.year))].sort((a,b) => b - a);
    return yearList.map(year => {
        const list = state.gradeList.filter(item => item.year == year);

        // 총 학점
        const totalCredit = list.reduce((sum, item) => sum + Number(item.credit), 0);

        // 평점 평균 (F나 '-' 제외)
        const validList = list.filter(item => item.finalScore && item.finalScore !== '-');
        const avgGpa = validList.length > 0
            ? (validList.reduce((sum, item) => sum + Number(item.finalScore), 0) / validList.length).toFixed(2)
            : '-';
        return { year, list, totalCredit, avgGpa };
    });
});

onMounted(async () => {
    state.isLoading = true;
    try {
        const res = await GradeService.getMyGrades();
        state.gradeList = res || [];
    } catch (error) {
        console.error('성적 조회 실패:', error);
        await modal.showAlert('성적 조회에 실패했습니다.', 'error');
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

        <article class="tbl-row no-hover" v-for="(item, idx) in state.gradeList" :key="idx">
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

    <!-- ✅ 년도별 요약 테이블 (새로 추가) -->
    <h3 class="summary-title">년도별 학점 및 평점 요약</h3>
    <DataTable
        :columns="['년도', '총 학점', '평점 평균']"
        :rows="yearSummary"
        :isLoading="state.isLoading"
        gridCols="1fr 1fr 1fr"
        emptyMessage="데이터가 없습니다.">

        <article class="tbl-row no-hover" v-for="item in yearSummary" :key="item.year">
            <div>{{ item.year }}년</div>
            <div>{{ item.totalCredit }}학점</div>
            <div><strong style="color: var(--main-color)">{{ item.avgGpa }}</strong></div>
        </article>
    </DataTable>

</div>
</template>

<style scoped>
.container { padding: 24px 32px; font-family: 'Noto Sans KR', sans-serif; }

.summary-title {
    font-size: 16px; font-weight: 700;
    margin: 28px 0 12px;
    color: #333;
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

</style>