<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useModalStore } from '@/stores/modal';
import { useAuthStore } from '@/stores/authentication';
import DataTable from '@/components/common/DataTable.vue';
import Pagination from '@/components/common/Pagination.vue';
import SearchInput from '@/components/util/SearchInput.vue';
import GradeService from '@/services/gradeService';
import LectureService from '@/services/lectureService';

const route = useRoute();
const router = useRouter();
const modal = useModalStore();
const authStore = useAuthStore();
const lectureId = route.params.lectureId;

//검색기능 추가
const searchInput = ref('');

// 수정모드 여부
const isEditMode = ref(false);

//페이징 처리 시작
const currentPage = ref(1);
const pageSize = 10;

const lectureInfo = reactive({
    lectureName: '',
    studentCount: 0,
    maxStd: 0
});

const state = reactive({
    gradeList: [],
    isLoading: false
});

//localStorage 키
const GRADE_KEY = `grade_${lectureId}`;

// 검색 필터링
const filteredGradeList = computed(() => {
    if (!searchInput.value) return state.gradeList;
    const keyword = searchInput.value.toLowerCase();
    return state.gradeList.filter(s =>
    s.name?.toLowerCase().includes(keyword) ||
    s.code?.toString().includes(keyword)
);
});

const pagedGradeList = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return filteredGradeList.value.slice(start, start + pageSize);
});

const maxPageGrade = computed(() => {
    return Math.ceil(filteredGradeList.value.length / pageSize) || 1;
});

//출석 점수 자동 계산(지각 -1, 결석 -3), 출석점수 + 등급 계산 함수
const calcAttendScore = (student) => {
    const countAttendScore = 20; //기본 출석 점수
    return Math.max(
        0,
        countAttendScore - (student.lateCount * 1) - (student.absentCount * 3)
    );
};

const calcGradeLetter = (total, attendScore) => {
    if (attendScore <= 0) return 'F';
    if (total >= 90) return 'A';
    if (total >= 80) return 'B';
    if (total >= 70) return 'C';
    if (total >= 60) return 'D';
    return 'F';
};

const goToPage = (page) => {
    currentPage.value = page;
};

// localStorage에 저장
const saveDraft = () => {
    localStorage.setItem(GRADE_KEY, JSON.stringify(state.gradeList));
};


// 점수 변경 시 attendScore, totalScore, gradeLetter 실시간 계산하는 로직
const calcGrade =  async (student) => {
    // 0~100 사이 숫자 제한
    if (student.midScore < 0)        student.midScore = 0;
    if (student.midScore > 100)      student.midScore = 100;
    if (student.finScore < 0)        student.finScore = 0;
    if (student.finScore > 100)      student.finScore = 100;
    if (student.assignmentScore < 0) student.assignmentScore = 0;
    if (student.assignmentScore > 100) student.assignmentScore = 100;

    //출석점수 자동 계산 (지각 -1, 결석 -3)
    student.attendScore = calcAttendScore(student);

    const total = Number(student.midScore) + Number(student.finScore)
                + Number(student.assignmentScore) + Number(student.attendScore);

    student.totalScore = total; //totalScore는 항상 업데이트

    // 총점이 100점 초과시 모달창 표시
    if (total > 100) {
        await modal.showAlert('등록 가능한 점수를 초과하였습니다.', 'error');
        student.gradeLetter = '-';
        return; //등급 계산 중단
    }

    student.gradeLetter = calcGradeLetter(total, student.attendScore);
};

//수정 모드 진입 시 전체 학생 출석점수 기반 등급 재계산
const startEditMode = async () => {
    isEditMode.value = true;
    for (const student of state.gradeList) {
        await calcGrade(student);
    }
};

//성적 수정 후 저장 (저장 완료 시 localStorage 삭제)
const saveGrades = async () => {
    //성적 저장 전 총점이 100점 초과하는지 여부 검사
    const overTotal = state.gradeList.find(s =>
        Number(s.midScore) + Number(s.finScore) +
        Number(s.assignmentScore) + Number(s.attendScore) > 100
    );

    if (overTotal) {
            await modal.showAlert(`${overTotal.name} 학생의 총점이 100점을 초과하였습니다. 점수를 확인해주세요`,
            'error');
            return; //저장 중단
        }

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

        //저장 완료 시 localStorage 삭제
        localStorage.removeItem(GRADE_KEY);

        await modal.showAlert('성적이 저장되었습니다.', 'success');

        //수정모드만 종료하고 화면 유지
        isEditMode.value = false;
    } catch (error) {
        console.error('저장 실패:', error);
        await modal.showAlert('성적 저장에 실패했습니다.', 'error');
    }
};

onMounted(async () => {
    // 재직 여부 확인
    if (authStore.profStatus !== 'employment') {
        await modal.showAlert('재직 중인 교수만 접근할 수 있습니다.', 'error');
        router.push(`/lectures/${lectureId}`);
        return;
    }

    state.isLoading = true;
    try {
        const res = await GradeService.getGradeList(lectureId);
        // state.gradeList = res;

        //출석점수 + 등급 자동 계산된 리스트
        const attendCalcList = res.map(student => {
            const attendScore = calcAttendScore(student);
            const total = Number(student.midScore) + Number(student.finScore)
                        + Number(student.assignmentScore) + Number(attendScore);
            const gradeLetter = calcGradeLetter(total, attendScore);
            return { ...student, attendScore, totalScore: total, gradeLetter };
        });

        //localStorage에 임시저장 데이터 있으면 덮어쓰기
        const draft = localStorage.getItem(GRADE_KEY);
        if (draft) {
            //임시저장 데이터 있으면 모달로 확인
            const isConfirm = await modal.showConfirm(
                '기존에 수정 중이던 내용을 불러오시겠습니까?', 'info'
            );
            if (isConfirm) {
                //Ok누르면 localStorage데이터 복원
                const draftList = JSON.parse(draft);

                //res(원본) 순서 기준으로 draft 값만 덮어씌우기
                //이거 수정하지않으면 BE에서 가져오는 데이터순서(내가 지정한 ORDER BY m.name ASC(이름순))와
                //localStorage 데이터 순서가 다르기 때문에 내용수정후 다른페이지 다녀오면 row순서가 제각각임
                //수정내용 state.attendList.map => res.map 으로 수정
                state.gradeList = attendCalcList.map(student => {
                    const saved = draftList.find(d => d.courseId === student.courseId);
                    return saved ? { ...student,
                        midScore: saved.midScore,
                        finScore: saved.finScore,
                        assignmentScore: saved.assignmentScore,
                        attendScore: saved.attendScore,
                        totalScore: saved.totalScore,
                        gradeLetter: saved.gradeLetter
                    } : student;
                });
                isEditMode.value = true; //수정 중이던 상태 복원
            } else {
                //Cancel누르면 localStorage 삭제 후 계산된 원본 데이터 사용
                localStorage.removeItem(GRADE_KEY);
                state.gradeList = attendCalcList;
            }
        } else {
            state.gradeList = attendCalcList;
        }
    } catch (error) {
        console.error('성적 로드 실패:', error);
        await modal.showAlert('성적 조회에 실패했습니다.', 'error');
    } finally {
        state.isLoading = false;
    }

    //강의 정보 조회
    try {
        const res = await LectureService.findById(lectureId);
        const data = Array.isArray(res) ? res[0] : res;
        lectureInfo.lectureName = data.lectureName;
        lectureInfo.maxStd = data.maxStd;
        lectureInfo.studentCount = state.gradeList.length; // gradeList 세팅 후에 추가
    } catch (error) {
        console.error('강의 정보 조회 실패:', error);
    }
});
</script>

<template>
    <div class="container">
        <div class="header-section">
            <div class="table-header">
                <span class="lecture-name">{{ lectureInfo.lectureName }}</span>
                <span class="student-count">현재 수강:{{ lectureInfo.studentCount }} 전체 수강:{{ lectureInfo.maxStd }}</span>
            </div>
            <div class="search-area">
                <div class="input-content">
                    <SearchInput v-model="searchInput" :list="state.gradeList"
                                placeholder="이름, 학번 검색"
                                @update:modelValue="currentPage = 1" />
                    <button class="btn in-input">
                    <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
                    </button>
                </div>
            </div>
        </div>

        <DataTable
            :columns="['학번', '성명', '학년', '중간평가', '기말평가', '과제점수', '출석점수', '총점', '최종등급']"
            :rows="pagedGradeList"
            :isLoading="state.isLoading"
            gridCols="1fr 1fr 80px 1fr 1fr 1fr 1fr 80px 80px"
            emptyMessage="수강 학생이 없습니다.">

            <article class="tbl-row no-hover" v-for="(student, idx) in pagedGradeList" :key="student.courseId ?? idx">
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
                            min="0" max="100"
                            @input="calcGrade(student); saveDraft()" /></div>
                    <div><input class="score-input" type="number" v-model="student.finScore"
                            min="0" max="100"
                            @input="calcGrade(student); saveDraft()" /></div>
                    <div><input class="score-input" type="number" v-model="student.assignmentScore"
                            min="0" max="100"
                            @input="calcGrade(student); saveDraft()" /></div>
                    <div>{{ student.attendScore }}</div>
                </template>

                <div>{{ student.totalScore }}</div>
                <div>
                    <span :class="['grade-badge', student.gradeLetter]">
                        {{ student.gradeLetter || '-' }}
                    </span>
                </div>
            </article>
        </DataTable>

        <div class="footer-section">
            <Pagination
                :currentPage="currentPage"
                :maxPage="maxPageGrade"
                :pageGroupSize="10"
                @goToPage="goToPage" />

            <div class="btn-group">
                <button class="btn btn-default" @click="router.push(`/lectures/${lectureId}`)"><font-awesome-icon icon="fa-solid fa-arrow-left-long" /> 강의 정보</button>
                <!-- 조회 모드일 때 수정 버튼 -->
                <button v-if="!isEditMode" class="btn btn-default" @click="startEditMode">수정</button>
                <!-- 수정 모드일 때 저장 버튼 -->
                <button v-else class="btn btn-submit" @click="saveGrades">저장</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {}
.title { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
.score-input {
    width: 70px; padding: 4px 6px;
    border: 1px solid #ccc; border-radius: 4px;
    text-align: center; font-size: 14px;
}

/* 학생들 성적표시 css */
.grade-badge {
    display: inline-block;
    width: 27px; height: 27px; line-height: 27px;
    border-radius: 50%; font-size: 14px; font-weight: 700; text-align: center;
}
.grade-badge.A { background: #e8f5e9; color: #2e7d32; }
.grade-badge.B { background: #e3f2fd; color: #1565c0; }
.grade-badge.C { background: #fff8e1; color: #f57f17; }
.grade-badge.D { background: #fce4ec; color: #c62828; }
.grade-badge.F { background: #eeeeee; color: #757575; }

.btn-group { display: flex; justify-content: flex-end; gap: 8px;}

.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}
.table-header {
    display: flex;
    align-items: end;
    gap: 10px;
}
.lecture-name {
    font-size: 1.5rem;
    font-weight: 700;
}
.student-count {
    padding: 10px;
    color:var(--font-color-light)
}

.search-area {
    display: flex;
    align-items: center;
    gap: 8px;
}
</style>
