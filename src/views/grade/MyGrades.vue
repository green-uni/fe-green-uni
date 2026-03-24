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

//전체 총 학점 계산
const totalCreditAll = computed(() => {
    return state.gradeList.reduce((sum,item) => sum + Number(item.credit), 0);
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
    <div class="info-container g20">

        <!-- 좌측 년도별 요약 카드 -->
        <div class="content-wrap info-wrap info-card g20" style="--flex-width:300px;">
            <div class="info-title">
                <h2>학점 및 평점 요약</h2>
            </div>

            <div v-for="item in yearSummary" :key="item.year" class="year-summary-block">
                <div class="year-label">{{ item.year }}년</div>
                <div class="info-list">
                    <dl class="info-row">
                        <dt>총 학점</dt>
                        <dd>{{ item.totalCredit }}학점</dd>
                    </dl>
                    <dl class="info-row grade-avg">
                        <dt>평점 평균</dt>
                        <dd>{{ item.avgGpa }}</dd>
                    </dl>
                </div>
            </div>
            
            <div v-if="yearSummary.length === 0" class="empty-summary">
                성적 데이터가 없습니다.
            </div>

            <!--전체 총 학점-->
            <div class="totalAll-credit-block">
                <dl class="info-row">
                    <dt>전체 총 학점</dt>
                    <dd><strong>{{ totalCreditAll }}학점</strong></dd>
                </dl>
            </div>
        </div>

        <!-- 우측 성적 테이블 -->
        <div class="info-wrap info-content d-flex-grow1">
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
        </div>
    </div>
</div>
</template>

<style scoped>

/* 년도별 요약 블록 */
.year-label { font-weight: 700; font-size: var(--text-sm);color:var(--main-color)}

/* 좌측 카드 (LectureDetail과 동일 구조) */
.info-title h2{font-size: var(--text-xl);}
.info-list { display: flex; flex-direction: column; gap: 5px;padding: 8px 0; border-top: 1px solid var(--line-color);border-bottom: 1px solid var(--line-color);}
.info-row { flex-direction: row; gap: 15px;}
.info-row:not(:first-child) {}
.info-row dt { width: 60px; text-align: right; }
.info-card dl { align-items: center; }

.empty-summary { color: #aaa; font-size: 14px; text-align: center; padding: 20px 0; }

/* 등급 뱃지 */
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
