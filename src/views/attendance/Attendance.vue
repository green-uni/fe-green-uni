<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import attendanceService from '@/services/attendanceService';

const router = useRouter();
const route = useRoute();
const lectureId = route.params.lectureId;

// 오늘 날짜로 초기화 (YYYY-MM-DD 형식)
const selectedDate = ref(new Date().toISOString().split('T')[0]);

const state = reactive({
    attendList: []
});

//날짜가 바뀔 때 마다 자동으로 다시 불러오기
const fetchAttendance = async () => {
    try {
        const res = await attendanceService.getAttendList(lectureId, selectedDate.value);
        state.attendList = res;
        console.log('출석 목록:', state.attendList);
    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }
}

onMounted(fetchAttendance);
watch(selectedDate, fetchAttendance); //날짜 변경 시 자동 재조회

const saveAttendance = async () => {
  try {
      // 저장할 데이터 가공(attendId, status, reason만 추출)
      const req = state.attendList.map(student => ({
          attendId: student.attendId,
          status: student.status,
          reason: student.reason,
          attendDate: selectedDate.value
      }));

      await attendanceService.updateAttendList(lectureId, req);
      alert(`${selectedDate.value} 출석 정보가 저장되었습니다.`);
      router.push(`/lectures/${lectureId}`);
  } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
  }
};

</script>

<template>
<h3>출석 디테일</h3>
  <div class="attendance-container">
    <div class="header-section">
      <h2>출석 관리 현황</h2>
      <div class="date-picker">
        <label for="attendance-date">출석 일자 선택: </label>
        <input type="date" id="attendance-date" v-model="selectedDate" />
      </div>
    </div>
    
    <table class="attendance-table">
      <thead>
        <tr>
          <th>날짜</th>
          <th>학번</th>
          <th>이름</th>
          <th>학년</th>
          <th>학과</th>
          <th>출결상태</th>
          <th>비고(사유)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in state.attendList" :key="student.code">
          <td>{{ student.attendDate }}</td>
          <td>{{ student.code }}</td>
          <td>{{ student.name }}</td>
          <td>{{ student.academicYear}}학년</td>
          <td>{{ student.major}}</td>
          <td class="radio-group">
            <label><input type="radio" :name="'status-' + student.code" value="attend"
                    v-model="student.status" /> 출석</label>
            <label><input type="radio" :name="'status-' + student.code" value="late"
                    v-model="student.status" /> 지각</label>
            <label><input type="radio" :name="'status-' + student.code" value="absent"
                    v-model="student.status" /> 결석</label>
          </td>
          <td>
            <input type="text" v-model="student.reason" placeholder="사유 입력" class="note-input" />
          </td>
        </tr>
      </tbody>
    </table>
    
    <div class="save-btn-group">
      <button class="btn btn-submit" @click="router.push(`/lectures/${lectureId}`)">목록</button>
      <button class="btn btn-submit" @click="saveAttendance">저장</button>
    </div>
  </div>
</template>

<style scoped>
.attendance-container { padding: 20px; }

.header-section {
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between; /* 제목과 달력을 양끝으로 배치하거나 조정 가능 */
  align-items: center;
  margin-bottom: 20px;
}

.date-picker input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
}

.attendance-table {
  width: 100%;
  border-collapse: collapse;
}

.attendance-table th, .attendance-table td {
  border: 1px solid #ddd;
  padding: 12px 8px;
  text-align: center;
}

/* 라디오 버튼 정렬 */
.radio-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  font-size: 0.9rem;
}

.radio-group label {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.note-input {
  width: 90%;
  padding: 5px;
  border: 1px solid #eee;
}

/* 저장 버튼 스타일 */
.save-btn-group{
  display: flex;
  justify-content: flex-end; /* 오른쪽 끝으로 밀어넣기 */
  margin-top: 15px;
  gap: 8px;
}

</style>