  <script setup>
  import { computed } from 'vue';
  import majorService from '@/services/majorService';
  import LectureService from '@/services/lectureService';
  import { onMounted, reactive } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/authentication';


  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();

  const state = reactive({
    majorList: [],
    selectedIndex: -1,
    scheduleList: ['월', '화', '수', '목', '금'],
    periodList: Array.from({ length: 9 }, (_, i) => i + 1), // 1~9교시 자동 생성
    buildingList: [],
    roomList: [],
    data: {
      dayOfWeek: '',
      startPeriod: '',
      endPeriod: '',
      building: '',
      roomNumber: '',

      loginUserId: '',
      loginUserName: '',
      majorId: 0,
      majorName: '',
      year: '2026',
      semester: 0,
      lectureName: '',
      credit: '',
      lectureType: '',
      academicYear: '',
      maxStd: '',
      startDate: '',
      endDate: '',
      refBooks: '',
      goal: '',
      weeklyPlan: '',
    },

    relatedSearchList: []
  });

  const isEdit = computed(() => !!route.params.lectureId); //!!: 값을 boolean으로 강제 변환하는 표현
  const pageTitle = computed(() => isEdit.value ? '강의정보 수정' : '강의개설');


  onMounted(async () => {
    if (authStore.isLogin) {
      state.data.loginUserId = authStore.loginUserId;
      state.data.loginUserName = authStore.name;
    } else {
      console.warn("로그인 정보가 없습니다.");
    }
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

    // 수정 모드일 때 기존 강의 정보 불러오기
    if (isEdit.value) {
    try {
      const lectureId = route.params.lectureId;
      const res = await LectureService.editLecture(lectureId); 
      
      if (res) {
        // 서버에서 받아온 데이터를 state.data에 덮어쓰기
        Object.assign(state.data, res);
        
       // 건물 정보가 들어오면 강의실 목록도 미리 로드해야 함
        if (state.data.building) {
          await getBuildings();
        }
         if (state.data.roomNumber) {
          await getRoomNumber();
        }
      }
    } catch (error) {
      console.error("강의 데이터 로드 실패:", error);
      alert("데이터를 불러오는 중 오류가 발생했습니다.");
    }
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
    const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
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


  // 항목 클릭 시 데이터 선택
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

  const submitLecture = async () => {
    try {
      const payload = {
        ...state.data,
        startDate: state.data.startDate || null,
        endDate: state.data.endDate || null,
        startPeriod: Number(state.data.startPeriod) || null,
        endPeriod: Number(state.data.endPeriod) || null,
        dayOfWeek: state.data.dayOfWeek,
        roomNumber: state.data.roomNumber
      };
      console.log("최종 전송 데이터:", payload);

      if (isEdit.value) {
        //수정 모드일 때는 lectureId 추가
        await LectureService.editLecture({ ...payload, lectureId: route.params.lectureId });
        alert('강의정보가 수정되었습니다.');
      } else {
        await LectureService.postLecture(payload);
        alert('강의가 신청되었습니다.');
      }
      router.push('/lectures/my'); // 신청 후 내 강의 목록으로 이동

    } catch (err) {
      console.error("개설 실패:", err);
    }
  }



</script>

  <template>
    <div class="container">
      <h3 class="section-title">{{ pageTitle }}</h3>

      <div class="form-wrap">

        <div class="content-wrap">
          <h3><font-awesome-icon icon="fa-solid fa-circle-info" />교수정보</h3>

          <div class="form-grid" style="--grid-cols:repeat(auto-fill, minmax(300px,1fr))">
            <div class="input-wrap">
              <div class="input-label">교번</div>
              <div class="input-content">
                <label>
                  <input type="text" v-model="state.data.loginUserId" disabled>
                </label>
              </div>
            </div>
            <div class="input-wrap">
              <div class="input-label">교수명</div>
              <div class="input-content">
                <label>
                  <input type="text" v-model="state.data.loginUserName" disabled>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="content-wrap">
          <h3><font-awesome-icon icon="fa-solid fa-circle-info" />개설강의정보</h3>
          <div class="form-grid" style="--grid-cols:repeat(auto-fill, minmax(300px,1fr))">
            <div class="input-wrap">
              <div class="input-label">강의연도</div>
              <div class="input-content">
                <label>
                  <input type="text" v-model="state.data.year" disabled>
                </label>
              </div>
            </div>

            <div class="input-wrap">
              <div class="input-label">학기</div>
              <div class="input-content radio-group">
                <label class="radio-label">
                  <input type="radio" name="semester" :value=1 v-model="state.data.semester">
                  <span>1학기</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="semester" :value=2 v-model="state.data.semester">
                  <span>2학기</span>
                </label>
              </div>
            </div>

            <div class="input-wrap">
              <div class="input-label">교과구분</div>
              <div class="input-content radio-group">
                <label class="radio-label">
                  <input type="radio" name="type" value="전공" v-model="state.data.lectureType">
                  <span>전공</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="type" value="교양" v-model="state.data.lectureType">
                  <span>교양</span>
                </label>
              </div>
            </div>

            <div class="input-wrap">
              <div class="input-label">이수학점</div>
              <div class="input-content radio-group">
                <label class="radio-label">
                  <input type="radio" name="credit" :value=1 v-model="state.data.credit">
                  <span>1학점</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="credit" :value=2 v-model="state.data.credit">
                  <span>2학점</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="credit" :value=3 v-model="state.data.credit">
                  <span>3학점</span>
                </label>
              </div>
            </div>

            <div class="input-wrap input-grid3">
              <div class="input-label">강의명</div>
              <div class="input-content">
                <label>
                  <input type="text" v-model="state.data.lectureName">
                </label>
              </div>
            </div>

            <div class="input-wrap">
              <div class="input-label">수강인원</div>
              <div class="input-content">
                <label>
                  <input type="text" v-model="state.data.maxStd">
                </label>
              </div>
            </div>

            <div class="input-wrap input-grid2">
              <div class="input-label">전공명</div>
              <div class="input-content">
                <label>
                  <input type="search" placeholder="학과명을 입력하세요" @keydown="handleKeydown" v-model="state.data.majorName"
                    @input="searchMajor">
                  <button class="btn in-input" @click="searchMajor"><font-awesome-icon
                      icon="fa-solid fa-magnifying-glass" /></button>
                </label>
                <div class="relate" v-if="state.relatedSearchList.length > 0">
                  <div v-for="item in state.relatedSearchList" :key="item.majorId" class="idx"
                    @click="selectMajor(item)">
                    {{ item.name }}
                  </div>
                </div>
              </div>
            </div>

            <div class="input-wrap input-grid2">
              <div class="input-label">대상학년</div>
              <div class="input-content radio-group">
                <label class="radio-label">
                  <input type="radio" id="1" name="academicYear" :value=1 v-model="state.data.academicYear">
                  <span>1학년</span>
                </label>
                <label class="radio-label">
                  <input type="radio" id="2" name="academicYear" :value=2 v-model="state.data.academicYear">
                  <span>2학년</span>
                </label>
                <label class="radio-label">
                  <input type="radio" id="3" name="academicYear" :value=3 v-model="state.data.academicYear">
                  <span>3학년</span>
                </label>
                <label class="radio-label">
                  <input type="radio" id="4" name="academicYear" :value=4 v-model="state.data.academicYear">
                  <span>4학년</span>
                </label>
              </div>
            </div>

            <div class="input-wrap input-grid2">
              <div class="input-label">강의시간</div>
              <div class="input-content three-input">
                <label>
                  <select name="dayOfWeek" v-model="state.data.dayOfWeek">
                    <option value="">---요일선택---</option>
                    <option v-for="(day, idx) in state.scheduleList" :value="day" :key="idx">{{ day }}요일</option>
                  </select>
                </label>
                <label>
                  <select name="startPeriod" v-model="state.data.startPeriod">
                    <option value="">시작 교시</option>
                    <option v-for="period in state.periodList" :value="period">{{ period }}교시</option>
                  </select>
                </label>
                <label>
                  <select v-model="state.data.endPeriod">
                    <option value="">종료 교시</option>
                    <option v-for="period in state.periodList" :value="period">{{ period }}교시</option>
                  </select>
                </label>
              </div>
            </div>

            <div class="input-wrap input-grid2">
              <div class="input-label">강의실</div>
              <div class="input-content two-input">
                <label>
                  <select name="building" v-model="state.data.building" @change="loadRooms">
                    <option value="">---건물선택---</option>
                    <option v-for="building in state.buildingList" :key="building" :value="building">{{ building }}
                    </option>
                  </select>
                </label>
                <label>
                  <select name="roomNumber" v-model="state.data.roomNumber">
                    <option value="">---강의실선택---</option>
                    <option v-for="item in state.roomList" :key="item.roomNumber" 
                    :value="item.roomNumber">{{item.roomNumber}}</option>
                  </select></label>
              </div>
            </div>

          </div>
        </div>

        <div class="content-wrap">
          <h3><font-awesome-icon icon="fa-solid fa-circle-info" />강의계획서</h3>
          <div class="form-grid">
            <div class="input-wrap">
              <div class="input-label">참고 교재</div>
              <div class="input-content">
                <label>
                  <input type="text" v-model="state.data.refBooks">
                </label>
              </div>
            </div>
            <div class="input-wrap">
              <div class="input-label">강의 목표</div>
              <div class="input-content">
                <label>
                  <textarea v-model="state.data.goal"></textarea>
                </label>
              </div>
            </div>
            <div class="input-wrap">
              <div class="input-label">주차별 강의 계획</div>
              <div class="input-content">
                <label>
                  <textarea v-model="state.data.weeklyPlan"></textarea>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="btn-row">
            <button class="btn btn-submit" @click="submitLecture">
              <font-awesome-icon icon="fa-solid fa-circle-check" /> {{ isEdit ? '수정하기' : '개설신청' }}
            </button>
        </div>
      </div>
    </div>

  </template>

<style scoped></style>
