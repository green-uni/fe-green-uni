<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

// 오늘 날짜로 초기화 (YYYY-MM-DD 형식)
const selectedDate = ref(new Date().toISOString().split('T')[0]);

const saveAttendance = () => {
  alert(`${selectedDate}학생의 ${selectedDate.value} 출석 정보가 저장되었습니다.`);
  router.push('/lectures/me')
};

const router = useRouter();

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
        <tr v-for="n in 10" :key="n">
          <td>{{ selectedDate }}</td>
          <td>2026000{{ n }}</td>
          <td>홍길동 {{ n }}</td>
          <td>{{ (n % 4) + 1 }}학년</td>
          <td>컴퓨터공학과</td>
          <td class="radio-group">
            <label><input type="radio" :name="'status-' + n" value="P" checked /> 출석</label>
            <label><input type="radio" :name="'status-' + n" value="L" /> 지각</label>
            <label><input type="radio" :name="'status-' + n" value="A" /> 결석</label>
          </td>
          <td>
            <input type="text" placeholder="사유 입력" class="note-input" />
          </td>
        </tr>
      </tbody>
    </table>
    
    <div class="save-btn-group">
      <button class="save-btn" @click="saveAttendance">저장</button>
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
}

.save-btn {
  background-color: var(--main-color);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.save-btn:hover {
  background-color: #218838;
}
</style>