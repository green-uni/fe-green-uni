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
        day_of_week:'',
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


</script>

<template>
<div>
    <div>
        <button @click="router.push('/lectures')">전체강의목록으로</button>
        <button @click="router.push('/lectures/me')">내강의목록</button>
        <div v-if="state.data.memberId === authStore.loginUserId">
            <button @click="editLecture">강의 수정</button></div>
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
                    <div>{{ state.data.day_of_week }}</div>
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