<script setup>
import { useRoute, useRouter } from 'vue-router';
import { onMounted, reactive } from 'vue'; 
import  LectureService  from '@/services/lectureService';
import { useAuthStore } from '@/stores/authentication';


const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const state = reactive({
    data: {
        status:'',
        memberId:0,
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
        }
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
<div>
    <div>
        <button @click="router.push('/lectures')">전체강의목록으로</button>
        <button @click="router.push('/lectures/me')">내강의목록</button>

    <!--  관리자만 보이고, pending 상태일 때만 버튼 표시 -->
      <div v-if="authStore.role === 'admin' && state.data.status === 'pending'">
        <button @click="updateStatus('approved')">승인</button>
        <button @click="updateStatus('rejected')">반려</button>
      </div>

      <!-- 내 강의일 때만 수정 버튼 -->
        <div v-if="state.data.memberId === authStore.loginUserId && state.data.status === 'rejected'">
            <button @click="editLecture">강의 수정</button>
        </div>
            <div>
            <section>
                <div>{{state.data.lectureName }}</div>
                <div>{{ state.data.year }}년 {{ state.data.semester }}학기</div>
                <div>
                    <div>교과구분</div>
                    <div>{{ state.data.lectureType }}</div>
                </div>
                <div>
                    <div>이수학점</div>
                    <div>{{ state.data.credit }}</div>
                </div>
                <div>
                    <div>수강인원</div>
                    <div>count해야함../{{ state.data.maxStd }}</div>
                </div>
                <div>
                    <div>강의시간</div>
                    <div>{{ state.data.dayOfWeek }}요일 {{ state.data.startPeriod }} 교시~ {{ state.data.endPeriod }}교시</div>
                </div>
            </section>
            <section>
                <div>
                    <div>참조교재</div>
                    <div>{{ state.data.refBooks }}</div>
                </div>
                <div>
                    <div>강의목표</div>
                    <div>{{ state.data.goal }}</div>
                </div>
                <div>
                    <div>주차별강의계획</div>
                    <div>{{ state.data.weeklyPlan }}</div>
                </div>
            </section>
        </div> 
    </div>
</div>
<div><button @click="router.push('/lectures/attendance/:lectureId')">출석관리</button></div>
<div><button>성적관리</button></div>
</template>

<style scoped>

</style>