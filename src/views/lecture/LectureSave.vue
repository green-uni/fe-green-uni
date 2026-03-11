  <script setup>
  import majorService from '@/services/majorService';
  import { LectureService } from '@/services/lectureService';
  import { onMounted, reactive } from 'vue';


  const state = reactive({
    majorList:[],
    selectedIndex: -1,
    scheduleList: ['월', '화', '수', '목', '금'],
    periodList: Array.from({ length: 9 }, (_, i) => i + 1), // 1~9교시 자동 생성
    buildingList: [],
    roomList:[],
    data: {
      memberId:'',
      memberName:'',
      majorId:'',
      majorName:'',
      year:'2026',
      semester:'', 
      name:'',
      credit:'',
      type:'',
      day_of_week:'',
      start_period:'',
      end_period:'',
      building:'',
      roomNumber:'',
      
      refBooks:'',
      goal:'',
      weeklyPlan:'',
      academicYear:'',
      maxStd:'',
      startDate:'',
      endDate:''},

      relatedSearchList:[]
    });


onMounted(async () => {
  try {
    const res = await majorService.listForCreate();
    state.majorList = res.result || [];
  } catch (error) {
    console.error("전공 목록 로드 실패:", error);
    // 에러나도 아래 계속 실행됨
  }

  try {
    const buildingRes = await LectureService.getBuildings();
    state.buildingList = buildingRes || [];
  } catch (error) {
    console.error("건물 목록 로드 실패:", error);
  }
});

// 건물을 바꿀 때마다 호실 목록 불러오기
const loadRooms = async () => {
  state.data.roomNumber = ''; // 건물 바뀌면 호실 초기화
  if (!state.data.building) {
    state.roomList = [];
    return;
  }
  try {
    // 백엔드 API: GET /api/rooms?building=공학관
    const res = await LectureService.getRoomNumber({ building: state.data.building });
    state.roomList = res || [];
    console.log("강의실 목록:", state.roomList)
  } catch (err) {
    console.error("강의실 로드 실패:", err);
  }
};



  // 키보드 이벤트 핸들러
  const handleKeydown = (event) => {
    if (state.relatedSearchList.length === 0) return;

    if (event.key === 'ArrowDown') {
      // 아래 화살표: 인덱스 증가
      state.selectedIndex = (state.selectedIndex + 1) % state.relatedSearchList.length;
    } else if (event.key === 'ArrowUp') {
      // 위 화살표: 인덱스 감소
      state.selectedIndex = (state.selectedIndex - 1 + state.relatedSearchList.length) % state.relatedSearchList.length;
    } else if (event.key === 'Enter') {
      // 엔터키: 현재 선택된 항목 확정
      event.preventDefault(); // 폼 제출 방지
      if (state.selectedIndex >= 0) {
        selectMajor(state.relatedSearchList[state.selectedIndex]);
      }
    }
  };

  // ✅ 한글 초성 추출 함수
  const getChosung = (str) => {
    const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
    return [...str].map(ch => {
      const code = ch.charCodeAt(0) - 0xAC00;
      if (code < 0 || code > 11171) return ch;
      return CHO[Math.floor(code / 28 / 21)];
    }).join('');
  };

  const isChosung = (str) => /^[ㄱ-ㅎ]+$/.test(str);

  const searchMajor = () => {
    if (!state.data.majorName) {
      state.relatedSearchList = [];
      return;
    }
    const query = state.data.majorName;

    state.relatedSearchList = state.majorList.filter(item => {
      if (isChosung(query)) {
        return getChosung(item.name).includes(query);  // 초성 검색
      }
      return item.name.toLowerCase().includes(query.toLowerCase()); // 일반 검색
    });
  };


  // 2. 항목 클릭 시 데이터 선택
  const selectMajor = (major) => {
    state.data.majorName = major.name; // 입력창에 이름 표시
    state.data.majorId = major.majorId; // 서버로 보낼 ID 저장
    state.relatedSearchList = []; // 목록 닫기
  };

  let timer;
  const typing = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      searchMajor();
    }, 200); // 0.2초마다 실행하여 즉각적인 반응을 줌
  };
  </script>

  <template>
  <div>
    <h3>교수정보</h3>
      <div>
          <div>
              <label>
                  교번<input type="text" v-model="state.data.memberId" disabled>
              </label>
              <label>    
                  교수명<input type="text" v-model="state.data.memberName" disabled>
              </label>
          </div>
      </div>


    <h3>개설강의정보</h3>
    <div>
      <div>
        <label>
          <span>강의연도</span>
          <input type="text" v-model="state.data.year" disabled>
        </label>
      </div>

      <div>
        <span>학기</span>
        <label>
          <input type="radio" id="1" name="semester" value="1" v-model="state.data.semester">
            <span>1학기</span>
        </label>
        
        <label>
          <input type="radio" id="2" name="semester" value="2" v-model="state.data.semester">
          <span>2학기</span>
        </label>
      </div>

      <div>
        <label>
          <span>강의명</span>
          <input type="text" v-model="state.data.name">
        </label>
      </div>

      <div>
        <span>대상학년</span>
        <label>
          <input type="radio" id="1" name="academicYear" value="1" v-model="state.data.academicYear">
          <span>1학년</span>
        </label>
        <label>
          <input type="radio" id="2" name="academicYear" value="2" v-model="state.data.academicYear">
          <span>2학년</span>
        </label>
        <label>
          <input type="radio" id="3" name="academicYear" value="3" v-model="state.data.academicYear">
          <span>3학년</span>
        </label>
        <label>
          <input type="radio" id="4" name="academicYear" value="4" v-model="state.data.academicYear">        <span>4학년</span>
        </label>
      </div>

      <div>
        <span>수강인원</span>
        <input type="text" v-model="state.data.maxStd">
      </div>

      <div>
        <span>교과구분</span>
          <input type="radio" id="major" name="type" value="전공" v-model="state.data.type">
          <span>전공</span>
          <input type="radio" id="general" name="type" value="교양" v-model="state.data.type">
          <span>교양</span>
      </div>

      <div>
        <span>전공명</span>
          <span>
            <input type="search" placeholder="학과명을 입력하세요" @keydown="handleKeydown" v-model="state.data.majorName" @input="searchMajor">
            <button @click="searchMajor">검색</button>
                  
            <div class="relate" v-if="state.relatedSearchList.length > 0">
              <div v-for="item in state.relatedSearchList" 
                      :key="item.majorId" 
                      class="idx" 
                      @click="selectMajor(item)">
                      {{ item.name }}
              </div>
            </div>
          </span>
        </div>

      <div>
        <span>이수학점</span>
          <span>
            <input type="radio" id=1 name="credit" value=1 v-model="state.data.credit">
            <span>1학점</span>
            <input type="radio" id=2 name="credit" value=2 v-model="state.data.credit">
            <span>2학점</span>
            <input type="radio" id=3 name="credit" value=3 v-model="state.data.credit">          <span>3학점</span>
          </span>
      </div>

      <div>
        <span>강의시간</span>
          <span>
            <select name="day_of_week" v-model="state.data.day_of_week">
              <option value="">---요일선택---</option>
              <option v-for="day_of_week in state.scheduleList" :value="day_of_week">{{ day_of_week }}요일</option>
            </select>
            <select name="start_period" v-model="state.data.start_period">
              <option value="">시작 교시</option>
              <option v-for="start_period in state.periodList" :value="start_period">{{ start_period }}교시</option>
            </select>
          </span>
      </div>

      <div>
        <span>강의실</span>
          <span>
            <select name="building" v-model="state.data.building" @change="loadRooms">
              <option>---건물선택---</option>
              <option v-for="building in state.buildingList"  :key="building" :value="building">{{ building }}</option>
            </select>
          </span>
          <span>
            <select name="roomNumber" v-model="state.data.roomNumber">
              <option value="">---강의실선택---</option>
              <option v-for="item in state.roomList" :key="item.roomId" :value="item.roomNumber">{{ item.roomNumber }}</option>
            </select>
          </span>
      </div>
    </div>

    <h3>강의계획서</h3>
    <div>
      <span>참고 교재</span>
      <input type="text" v-model="state.data.refBooks">
    </div>

    <div>
      <span>강의 목표</span>
      <input type="text" v-model="state.data.goal">
    </div>

    <div>
      <span>주차별 강의 계획</span>
      <input type="text" v-model="state.data.weeklyPlan">
    </div>

    <button @click="submitLecture">개설신청</button>

  </div>

  </template>

  <style scoped>

  </style>