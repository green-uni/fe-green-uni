<script setup>
import majorService from '@/services/majorService';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

// 상태 관리
const majorList = ref([]);
const activeTab = ref('전체'); // '전체', '정상', '폐지'
const searchKeyword = ref('');
const searchInput = ref('');

const tabs = ['전체', '정상', '폐지'];

const filteredList = computed(() => {
  let list = majorList.value;

  // 탭 필터링
    if (activeTab.value === '정상') {
    list = list.filter(item => item.active === 'running');
  } else if (activeTab.value === '폐지') {
    list = list.filter(item => item.active === 'closed');
  }
//   if (activeTab.value !== '전체') {
//     list = list.filter(item => item.active === activeTab.value);
//   } -> active 값이 running이랑 closed가 아닌 정상, 폐지로 되어 있다면

  // 검색 필터링
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase();
    list = list.filter(item =>
      item.name?.toLowerCase().includes(keyword) ||
      item.college?.toLowerCase().includes(keyword) ||
      item.room?.toLowerCase().includes(keyword) ||
      item.chairProfessor?.toLowerCase().includes(keyword)
    );
  }

  return list;
});

// 학과 목록 불러오기
const fetchMajorList = async () => {
  try {
    const res = await majorService.majorList();
    // 백엔드 응답에 status 필드가 없을 경우 임시로 매핑 (실제 API에 맞게 수정)
    majorList.value = res.result ?? res ?? [];
  } catch (e) {
    console.error('학과 목록 조회 실패', e);
  }
};

// 검색 실행
const search = () => {
  searchKeyword.value = searchInput.value;
};

// 엔터 검색
const keydown = (e) => {
  if (e.key === 'Enter') search();
};

onMounted(() => {
  fetchMajorList();
});

const goToEdit = (majorId) => {
  router.push(`/admin/major/new/${majorId}`);
};
</script>

<template>
  <div class="major-list-container">

    <!-- 탭 + 검색 바 -->
    <div class="toolbar">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          :class="['tab-btn', { active: activeTab === tab }]"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>

      <div class="search-area">
        <input
          v-model="searchInput"
          type="text"
          placeholder="검색어를 입력하세요"
          class="search-input"
          @keydown="keydown"
        />
        <button class="search-btn" @click="handleSearch">
          <span class="search-icon">🔍</span> 검색
        </button>
      </div>
    </div>

    <!-- 테이블 -->
    <!-- <table class="major-table">
      <thead>
        <tr>
          <th>학과명</th>
          <th>소속대학</th>
          <th>사무실</th>
          <th>전화번호</th>
          <th>학과장</th>
          <th>전임교수</th>
          <th>입학정원</th>
          <th>상태</th>
        </tr>
      </thead>
      <tbody>
        <tr
            v-for="(item, idx) in filteredList"
            :key="item.majorId ?? idx"
            :class="{ 'row-disabled': item.active === 'closed' }"
            @click="goToEdit(item.majorId)"
            style="cursor: pointer;"
        >
          <td>{{ item.name }}</td>
          <td>{{ item.college }}</td>
          <td>{{ item.room }}</td>
          <td>{{ item.tel }}</td>
          <td>{{ item.chairProfessor }}</td>
          <td>{{ item.professorCount }}</td>
          <td>{{ item.capacity }}</td>
          <td>
            <span :class="['status-badge', item.active === 'closed' ? 'badge-closed' : 'badge-normal']">
              {{ item.active ?? 'running' }}
            </span>
          </td>
        </tr>
        <tr v-if="filteredList.length === 0">
          <td colspan="8" class="empty-row">조회된 학과가 없습니다.</td>
        </tr>
      </tbody>
    </table> -->
    <div class="contianer">
        <section class="table">
            <article class="head">
                <div>학과명</div>
                <div>소속대학</div>
                <div>사무실</div>
                <div>전화번호</div>
                <div>학과장</div>
                <div>전임교수</div>
                <div>입학정원</div>
                <div>상태</div>
            </article>
            <article
                class="row"
                v-for="(item, idx) in filteredList"
                :key="item.majorId ?? idx"
                :class="{ 'row-disabled': item.active === 'closed' }"
                @click="goToEdit(item.majorId)"
                style="cursor: pointer;"
            >
                <div>{{ item.name }}</div>
                <div>{{ item.college }}</div>
                <div>{{ item.room }}</div>
                <div>{{ item.tel }}</div>
                <div>{{ item.chairProfessor }}</div>
                <div>{{ item.professorCount }}</div>
                <div>{{ item.capacity }}</div>
                <div>
                    <span :class="['status-badge', item.active === 'closed' ? 'badge-closed' : 'badge-normal']">
                    {{ item.active ?? 'running' }}
                    </span>
                </div>
            </article>
            <article v-if="filteredList.length === 0">
                <div colspan="8" class="empty-row">조회된 학과가 없습니다.</div>
            </article>
        </section>
    </div>

  </div>
</template>

<style scoped>
.major-list-container {
  padding: 24px;
  font-family: 'Noto Sans KR', sans-serif;
  background: #fff;
}

/* 툴바 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

/* 탭 */
.tabs {
  display: flex;
  gap: 4px;
}

.tab-btn {
  padding: 8px 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  color: #555;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #3d9970;
  color: #fff;
  border-color: #3d9970;
}

.tab-btn:hover:not(.active) {
  background: #f5f5f5;
}

/* 검색 */
.search-area {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 200px;
  outline: none;
  transition: border 0.2s;
}

.search-input:focus {
  border-color: #3d9970;
}

.search-btn {
  padding: 8px 16px;
  background: #3d9970;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.2s;
}

.search-btn:hover {
  background: #2e7d58;
}

.table{
  --grid-cols: 250px 150px 200px 200px 100px 1fr 1fr 1fr
  }
.table article:hover {
  background: #f9fdf9;
}
.row-disabled div {
  color: #aaa;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
}
.badge-normal {
  border: 1px solid #3d9970;
  color: #3d9970;
  background: #fff;
}
.badge-closed {
  border: 1px solid #aaa;
  color: #aaa;
  background: #fff;
}

/* 테이블
.major-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.major-table thead tr {
  border-top: 2px solid #ddd;
  border-bottom: 2px solid #ddd;
}

.major-table th {
  padding: 12px 8px;
  text-align: center;
  color: #333;
  font-weight: 600;
  background: #fafafa;
}

.major-table td {
  padding: 14px 8px;
  text-align: center;
  color: #333;
  border-bottom: 1px solid #eee;
}

.major-table tbody tr:hover {
  background: #f9fdf9;
}

/* 빈 행 */
.empty-row {
  text-align: center;
  color: #aaa;
  padding: 40px 0;
}

/* 저장 버튼 */
.footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.save-btn {
  padding: 12px 32px;
  background: #3d9970;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.save-btn:hover {
  background: #2e7d58;
}
</style>