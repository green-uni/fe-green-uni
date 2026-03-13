<script setup>
import { useRoute, useRouter } from 'vue-router';
import { onMounted, reactive, ref } from 'vue'; 
import  LectureService  from '@/services/lectureService';
import { useAuthStore } from '@/stores/authentication';
import AttendanceService from '@/services/attendanceService';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const activeTab = ref('students'); //'students' or 'detail'

const state = reactive({
    data: {
        status:'',
        memberId:0,
        loginUserId:0,
        lectureName:'',
        lectureId:'',
        year:'',
        semester:0,
        lectureType:'',
        credit:0,
        maxStd:0,
        building:'',
        roomNumber:'',
        dayOfWeek:'',
        startPeriod:0,
        endPeriod:0,
        academicYear:0,

        refBooks:'',
        goal:'',
        weeklyPlan:''
        },
        studentList: []
});


const id=route.params.lectureId;
onMounted(async () => {
    try {
        const res = await LectureService.findById(id);
        
        // 서버에서 리스트(List)로 내려오고 있다면 첫 번째 요소를 선택
        if (res && Array.isArray(res) && res.length > 0) {
            state.data = res[0]; 
        } else {
            state.data = res; 
        }
        console.log("최종 할당된 데이터:", state.data);
    } catch (error) {
        console.error("데이터 로드 실패:", error);
    }

    try {
        const res = await LectureService.findByStudentInfo(id);
        state.studentList = res;
        console.log("학생목록:", state.studentList);
    } catch (error) {
        console.error("데이터 로드 실패:", error);
    }

});

// ✅ 승인/반려 공통 함수
const updateStatus = async (newStatus) => {
    const label = newStatus === 'approved' ? '승인' : '반려';
    if (!confirm(`이 강의를 ${label}하시겠습니까?`)) return;

    try {
        await LectureService.updateLectureStatus(id, newStatus);
        state.data.status = newStatus; // 화면 즉시 반영
        alert(`${label} 처리되었습니다.`);
    } catch (error) {
        console.error(`${label} 실패:`, error);
        alert(`${label} 처리에 실패했습니다.`);
    }
};

const editLecture = () => {
    router.push(`/lectures/${id}/edit`);
};

</script>

<template>
<div class="page-wrapper">
    <div class="page-header">
        <button class="btn btn-outline" @click="$router.go(-1)">← 목록</button>

        <!--  관리자만 보이고, pending 상태일 때만 버튼 표시 -->
        <div v-if="authStore.role === 'admin' && state.data.status === 'pending'" class="action-group">
            <button class="btn btn-success" @click="updateStatus('approved')">승인</button>
            <button class="btn btn-danger" @click="updateStatus('rejected')">반려</button>
        </div>

        <!-- 내 강의일 때만 수정 버튼 -->
        <div v-if="state.data.memberId === authStore.loginUserId && state.data.status === 'rejected'">
            <button class="btn btn-outline" @click="editLecture">강의 수정</button>
        </div>
    </div>

    <div class="content-layout">

        <!-- 좌측 강의정보 카드 -->
        <aside class="lecture-card">
            <h2 class="lecture-title">{{ state.data.lectureName }}</h2>
            <p class="lecture-year">{{ state.data.year }}년 {{ state.data.semester }}학기</p>
            <div class="info-list">
                <div class="info-row">
                    <span class="info-label">교과구분</span>
                    <span class="info-value">{{ state.data.lectureType }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">이수학점</span>
                    <span class="info-value">{{ state.data.credit }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">수강인원</span>
                    <span class="info-value">{{ state.studentList.length }}/{{ state.data.maxStd }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">강의실</span>
                    <span class="info-value">{{ state.data.building }} {{ state.data.roomNumber }}호</span>
                </div>
                <div class="info-row">
                    <span class="info-label">강의시간</span>
                    <span class="info-value">
                        {{ state.data.dayOfWeek }}요일
                        {{ state.data.startPeriod }}교시~ {{ state.data.endPeriod }}교시
                    </span>
                </div>
            </div>
        </aside>

        <!-- 우측 탭 영역 -->
        <main class="main-content">

            <!-- 탭 버튼 + 강의정보수정 버튼 -->
            <div class="tab-bar">
                <button :class="['tab-btn', activeTab === 'students' ? 'active' : '']"
                    @click="activeTab = 'students'">수강학생목록</button>
                <button :class="['tab-btn', activeTab === 'detail' ? 'active' : '']"
                    @click="activeTab = 'detail'">강의상세</button>
                <div class="tab-bar-right">
                    <button class="btn btn-outline"
                        v-if="state.data.memberId === authStore.loginUserId"
                        @click="editLecture">강의 정보 수정</button>
                </div>
            </div>

            <!-- 수강학생목록 탭 -->
            <div v-if="activeTab === 'students'" class="tab-content">
                <div class="tab-toolbar">
                    <span class="student-count">수강인원 : {{ state.studentList.length }}명</span>
                    <div class="toolbar-btns">
                        <button class="btn btn-primary" @click="router.push(`/lectures/${id}/attendance`)">출석관리</button>
                        <button class="btn btn-outline">성적관리</button>
                    </div>
                </div>
                <table class="student-table">
                    <thead>
                        <tr>
                            <th>학과명</th>
                            <th>학번</th>
                            <th>이름</th>
                            <th>학년</th>
                            <th>점수</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="student in state.studentList" :key="student.studentCode">
                            <td>{{ student.majorName }}</td>
                            <td>{{ student.studentCode }}</td>
                            <td>{{ student.studentName }}</td>
                            <td>{{ student.academicYear }}학년</td>
                            <td>{{ student.gradeLetter || '-' }}</td>
                        </tr>
                        <tr v-if="state.studentList.length === 0">
                            <td colspan="5" class="empty">수강 학생이 없습니다.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- 강의상세 탭 -->
            <div v-if="activeTab === 'detail'" class="tab-content">
                <div class="detail-section">
                    <div class="detail-row">
                        <span class="detail-label">참조 교재</span>
                        <span class="detail-value">{{ state.data.refBooks }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">강의 목표</span>
                        <span class="detail-value">{{ state.data.goal }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">주차별 계획</span>
                        <span class="detail-value">{{ state.data.weeklyPlan }}</span>
                    </div>
                </div>
            </div>

        </main>
    </div>
</div>
</template>

<style scoped>
* { box-sizing: border-box; }
.page-wrapper { padding: 24px 32px; font-family: 'Noto Sans KR', sans-serif; color: #333; }
.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.action-group { display: flex; gap: 8px; }

/* 레이아웃 */
.content-layout { display: flex; gap: 24px; align-items: flex-start; }

/* 좌측 카드 */
.lecture-card {
    width: 220px; flex-shrink: 0;
    background: #fff; border: 1px solid #e0e0e0;
    border-radius: 10px; padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.lecture-title { font-size: 18px; font-weight: 700; margin: 0 0 4px; }
.lecture-year { font-size: 13px; color: #888; margin: 0 0 16px; }
.info-list { display: flex; flex-direction: column; gap: 12px; }
.info-row { display: flex; flex-direction: column; gap: 2px; }
.info-label { font-size: 11px; color: #888; }
.info-value { font-size: 13px; font-weight: 500; }

/* 우측 메인 */
.main-content {
    flex: 1; background: #fff;
    border: 1px solid #e0e0e0; border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    min-height: calc(100vh - 500px); /* 화면 최대 높이 고정 */
    overflow-y: auto; /* 내용 넘치면 스크롤 */
}

/* 탭바 */
.tab-bar {
    display: flex; align-items: center;
    border-bottom: 2px solid #e0e0e0;
    padding: 0 4px;
}
.tab-btn {
    padding: 12px 20px; font-size: 14px; font-weight: 500;
    background: none; border: none; cursor: pointer;
    color: #888; border-bottom: 2px solid transparent;
    margin-bottom: -2px; transition: all 0.2s;
}
.tab-btn.active { color: var(--main-color); border-bottom-color: var(--main-color); font-weight: 700; }
.tab-btn:hover { color: var(--main-color); }
.tab-bar-right { margin-left: auto; padding-right: 12px; }

/* 탭 내용 */
.tab-content { padding: 20px; }
.tab-toolbar {
    display: flex; justify-content: space-between;
    align-items: center; margin-bottom: 16px;
}
.student-count { font-size: 14px; color: #555; }
.toolbar-btns { display: flex; gap: 8px; }

/* 테이블 */
.student-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.student-table th {
    background: #f5f5f5; padding: 10px 12px;
    text-align: center; font-weight: 600;
    border-bottom: 2px solid #e0e0e0;
}
.student-table td { padding: 10px 12px; text-align: center; border-bottom: 1px solid #f0f0f0; }
.student-table tr:hover td { background: #f9f9f9; }
.empty { color: #aaa; padding: 30px !important; text-align: center; }

/* 강의상세 */
.detail-section { display: flex; flex-direction: column; gap: 24px; }
.detail-row { display: flex; flex-direction: column; gap: 6px; }
.detail-label { font-size: 12px; color: var(--main-color); font-weight: 700; letter-spacing: 0.3px; }
.detail-value { font-size: 14px; line-height: 1.7; color: #444; }

/* 버튼 */
.btn { padding: 7px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; border: none; transition: all 0.2s; }
.btn-primary { background: var(--main-color); color: white; }
.btn-primary:hover { background: #1b5e20; }
.btn-success { background: var(--main-color); color: white; }
.btn-success:hover { background: #1b5e20; }
.btn-danger { background: #c62828; color: white; }
.btn-danger:hover { background: #b71c1c; }
.btn-outline { background: white; color: #555; border: 1px solid #ccc; }
.btn-outline:hover { background: #f5f5f5; }
</style>