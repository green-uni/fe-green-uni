<script setup>
import { useRoute, useRouter } from 'vue-router';
import { onMounted, reactive, ref, computed } from 'vue';
import LectureService from '@/services/lectureService';
import { useAuthStore } from '@/stores/authentication';
import DataTable from '@/components/common/DataTable.vue';
import { useModalStore } from '@/stores/modal';


const modal = useModalStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
// 강의를 보는 사람이 그 강의를 개설한 교수일때만 수강학생이 노출
const isMyLecture = computed(() => authStore.role === 'professor' && state.data.memberId === authStore.loginUserId)
const activeTab = ref('detail')  // 기본값은 detail
const state = reactive({
  data: {
    status: '',
    memberId: 0,
    proName: '',
    loginUserId: 0,
    lectureName: '',
    lectureId: '',
    year: '',
    semester: 0,
    lectureType: '',
    credit: 0,
    maxStd: 0,
    building: '',
    roomNumber: '',
    dayOfWeek: '',
    startPeriod: 0,
    endPeriod: 0,
    academicYear: 0,

    refBooks: '',
    goal: '',
    weeklyPlan: ''
  },
  studentList: []
});


const id = route.params.lectureId;
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

    // #TODO 강의 정보 데이터 받은 후, 강의 교수와 로그인한 유저가 동일할 때 activeTab 교수 설정
    activeTab.value = (authStore.role === 'professor' &&
      state.data.memberId === authStore.loginUserId) ? 'students' : 'detail'

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

// 승인/반려 공통 함수
const updateStatus = async (newStatus) => {
  const label = newStatus === 'approved' ? '승인' : '반려';
  //버튼 누르기 전까지 다음으로 안넘어가도록 막아주기
  const isConfirmed = await modal.showConfirm(`이 강의를 ${label}하시겠습니까?`, 'warning');

  if (isConfirmed) {
    try {
      await LectureService.updateLectureStatus(id, newStatus);
      state.data.status = newStatus; // 화면 즉시 반영

    } catch (error) {
      console.error(`${label} 실패:`, error);
    }
  }
};

const editLecture = () => {
  router.push(`/lectures/edit/${id}`);
};

</script>

<template>
  <div class="container">

    <div class="page-header">
      <button class="btn btn-default" @click="$router.go(-1)"><font-awesome-icon icon="fa-solid fa-list" /> 목록</button>

      <!--  관리자만 보이고, pending 상태일 때만 버튼 표시 -->
      <div v-if="authStore.role === 'admin' && (state.data.status === 'pending' || state.data.status === 'rejected')"
        class="action-group">
        <button class="btn btn-success" @click="updateStatus('approved')">승인</button>
        <button class="btn btn-danger" @click="updateStatus('rejected')">반려</button>
      </div>

      <!-- 내 강의일 때만 수정 버튼 -->
      <div v-if="authStore.role === 'professor'
        && state.data.memberId === authStore.loginUserId
        && (state.data.status === 'rejected' || state.data.status === 'pending')" class="action-group">
        <button class="btn btn-outline" @click="editLecture"><font-awesome-icon icon="fa-solid fa-pen-to-square" /> 강의 정보 수정</button>
      </div>
    </div>


    <div class="info-container g20">
      <!-- 좌측 강의정보 카드 -->
      <div class="content-wrap info-wrap info-card g30" style="--flex-width:350px;">
        <div class="info-title">
          <h2>{{ state.data.lectureName }}</h2>
            <div v-if="state.data.status === 'pending'">
              <span :class="['status-badge', state.data.status]">승인대기</span>
            </div>
            <div v-else-if="state.data.status === 'rejected'" class="tooltip-wrap">
              <span :class="['status-badge', state.data.status]">
                반려
              </span>
              <div class="tooltip">
                {{ state.data.rejectReason }}
              </div>
            </div>
          <span>{{ state.data.year }}년 {{ state.data.semester }}학기
          </span>
        </div>

        <div class="info-list">
          <dl class="info-row">
            <dt>교수명</dt>
            <dd>{{ state.data.proName }}</dd>
          </dl>
          <dl class="info-row">
            <dt>이수구분</dt>
            <dd>{{ state.data.lectureType }}</dd>
          </dl>
          <dl class="info-row">
            <dt>이수학점</dt>
            <dd>{{ state.data.credit }}</dd>
          </dl>
          <dl class="info-row">
            <dt>수강인원</dt>
            <dd>{{ state.studentList.length }}/{{ state.data.maxStd }}</dd>
          </dl>
          <dl class="info-row">
            <dt>강의실</dt>
            <dd>{{ state.data.building }} {{ state.data.roomNumber }}</dd>
          </dl>
          <dl class="info-row">
            <dt>강의시간</dt>
            <dd>
              {{ state.data.dayOfWeek }}요일
              {{ state.data.startPeriod }}교시~ {{ state.data.endPeriod }}교시
            </dd>
          </dl>
        </div>
      </div>

      <!-- 우측 탭 영역 -->
      <div class="info-wrap content-wrap info-content">

        <!-- 탭 버튼 -->
        <!-- 로그인한 교수가 개설한 강의여야지만 탭버튼 노출-->
        <div class="tab-bar" v-if="isMyLecture">
          <!--교수 탭-->
          <button :class="['tab-btn', activeTab === 'students' ? 'active' : '']"
            @click="activeTab = 'students'">수강학생목록</button>

          <!--강의상세(공통)-->
          <button :class="['tab-btn', activeTab === 'detail' ? 'active' : '']"
            @click="activeTab = 'detail'">강의상세</button>
        </div>

        <!-- 수강학생목록 탭 -->
        <!-- #로그인한 교수가 개설한 강의여야지만 탭 노출-->
        <div v-if="isMyLecture && activeTab === 'students'" class="tab-content">
          <div class="tab-toolbar">
            <span class="student-count">수강인원 : {{ state.studentList.length }}명</span>
            <div class="toolbar-btns">
              <button class="btn btn-default" @click="router.push(`/lectures/${id}/attendance`)">출석관리</button>
              <button class="btn btn-default" @click="router.push(`/lectures/${id}/grades`)">성적관리</button>
            </div>
          </div>

          <DataTable :columns="['학과', '학번', '이름', '학년', '점수']" :rows="state.studentList" gridCols="1fr 1fr 1fr 1fr 1fr"
            emptyMessage="수강 학생이 없습니다">
            <article class="tbl-row" v-for="student in state.studentList" :key="student.studentCode">
              <div>{{ student.majorName }}</div>
              <div>{{ student.studentCode }}</div>
              <div>{{ student.studentName }}</div>
              <div>{{ student.academicYear }}학년</div>
              <div>{{ student.gradeLetter || '-' }}</div>
            </article>
          </DataTable>

        </div>

        <!-- 강의상세 탭 -->
        <div v-if="activeTab === 'detail'" class="tab-content d-flex direct-col g30">
          <dl>
            <dt>참조 교재</dt>
            <dd>{{ state.data.refBooks }}</dd>
          </dl>
          <dl>
            <dt>강의 목표</dt>
            <dd>{{ state.data.goal }}</dd>
          </dl>
          <dl>
            <dt>주차별 계획</dt>
            <dd>{{ state.data.weeklyPlan }}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>
.page-header { display: flex; align-items: center;justify-content: space-between; gap: 12px;}
.action-group { display: flex; gap: 8px; }

/* 좌측 카드 */
.info-list { display: flex; flex-direction: column; gap:10px; }
.info-row{flex-direction:row;gap:15px;}
.info-row:not(:first-child){border-top: 1px solid var(--line-color);padding-top:10px;}
.info-row dt{width: 55px;text-align: right;}

/* 탭 바 */
.tab-bar { display: flex; align-items: center;  border-bottom: 1px solid var(--line-color);}
.tab-btn{ padding:var(--size-sm) var(--size-lg); font-weight: 500;  background: none; border: none; cursor: pointer; color: var(--font-color-light); border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s;}
.tab-btn.active { color: var(--main-color); border-bottom-color: var(--main-color); font-weight: 700; }
.tab-btn:hover { color: var(--main-color); }

/* 탭 내용 */
.tab-content { padding: var(--size-df); }
.tab-toolbar { display: flex; justify-content: space-between;  align-items: center; margin-bottom: var(--size-sm);}
.student-count { font-size: var(--text-sm); color: #555; }

.tab-content dl{padding: 5px;}
.tab-content dl:not(:first-child){border-top: 1px solid var(--line-color);padding-top:20px;}

.toolbar-btns { display: flex; gap: 8px; }

/* 버튼 */
.btn-success { background: var(--main-color); color: white; }
.btn-success:hover { background: #1b5e20; }
.btn-danger { background: #c62828; color: white; }
.btn-danger:hover { background: #b71c1c; }
.btn-outline { background: white; color: #555; border: 1px solid #ccc; }
.btn-outline:hover { background: #f5f5f5; }

/* 상태 배지 */
.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: var(--text-xs);
  font-weight: 500;
}
.status-badge.pending {  background: #fff3e0;  color: #ef6c00;}
.status-badge.rejected {  background: #ffebee;  color: #c62828;}
</style>
