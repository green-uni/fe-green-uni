  <script setup>
  import { computed,watch,ref } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import majorService from '@/services/majorService';
  import LectureService from '@/services/lectureService';
  import { onMounted, reactive } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/authentication';
  import SearchInput from '@/components/util/SearchInput.vue';
  import { useModalStore } from '@/stores/modal';
  import { validateFields } from '@/utils/validation'

  const modal = useModalStore();
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
      year: 2026,
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
  // const pageTitle = computed(() => isEdit.value ? '강의정보 수정' : '강의개설');

  // ✅ 임시저장 상수
const DRAFT_KEY = 'lecture_draft';

// ✅ 내용 변경 감지용 (나가기 전 경고에 사용)
const isContent = ref(false);

// ✅ 임시저장 함수
const saveDraft = () => {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(state.data));
};

// ✅ 임시저장 삭제 함수
const removeDraft = () => {
  localStorage.removeItem(DRAFT_KEY);
};


// ✅ 초기화 완료 여부 플래그 추가
const isMounted = ref(false);

// ✅ watch로 입력할 때마다 자동저장 (개설 모드일 때만)
watch(
  () => state.data,
  () => {
    if (!isEdit.value && isMounted.value) {
      saveDraft();
      isContent.value = true;  // 내용 변경됨 표시
    }
  },
  { deep: true }
);


onMounted(async () => {
    console.log(authStore.profStatus);
    // 재직 여부 확인 - 맨 위에서 먼저 체크
  if (authStore.profStatus !== 'employment') {
    await modal.showAlert('재직 중인 교수가 아닙니다.', 'error');
    router.replace('/lectures/my');
    return;  // 이후 로직 실행 안 함
  }

    if (authStore.isLogin) {
        state.data.loginUserId = authStore.loginUserId;
        state.data.loginUserName = authStore.name;
    }

    // 전공 목록은 개설/수정 둘 다 필요
    try {
        const majorRes = await majorService.majorList();
        state.majorList = majorRes.result || [];
    } catch (error) {
        console.error("전공 목록 로드 실패:", error);
    }

    if (isEdit.value) {
        // ✅ 수정 모드: 강의정보 + 건물목록 + 강의실목록 한방에
        try {
            const lectureId = route.params.lectureId;
            console.log("lectureId 타입:", typeof lectureId, "값:", lectureId);
            const res = await LectureService.findByIdForEdit(route.params.lectureId);
            Object.assign(state.data, res);
            state.buildingList = res.buildingList || [];
            state.roomList = res.roomList || [];
        } catch (error) {
            console.error("강의 데이터 로드 실패:", error);
            modal.showAlert("데이터를 불러오는 중 오류가 발생했습니다.", 'error');
        }
    } else {
        // ✅ 개설 모드: 건물목록만
        try {
            const buildingRes = await LectureService.getBuildings();
            state.buildingList = buildingRes || [];
        } catch (error) {
            console.error("건물 목록 로드 실패:", error);
        }
           // ✅ draft 복원 로직
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      const isConfirm = await modal.showConfirm(
        '기존에 작성 중이던 내용을 불러오시겠습니까?', 'info'
      );
      if (isConfirm) {
        const draftData = JSON.parse(draft);
        Object.assign(state.data, draftData);

        // ✅ 건물 복원 시 강의실 목록도 다시 로드
        if (state.data.building) {
          await loadRooms();
          state.data.roomNumber = draftData.roomNumber;  // loadRooms가 roomNumber 초기화하므로 재복원
        }
        isContent.value = true;
      } else {
        removeDraft();
      }
    }
  }
  isMounted.value = true;  // 초기화 완료 플래그 true로 설정
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



  const submitLecture = async () => {
// 유효성 검사
    const required = [
        { value: state.data.lectureName, label: '강의명' },
        { value: state.data.semester, label: '학기' },
        { value: state.data.lectureType, label: '이수구분' },
        { value: state.data.credit, label: '이수학점' },
        { value: state.data.majorId, label: '전공명' },
        { value: state.data.academicYear, label: '대상학년' },
        { value: state.data.dayOfWeek, label: '강의 요일' },
        { value: state.data.startPeriod, label: '시작 교시' },
        { value: state.data.endPeriod, label: '종료 교시' },
        { value: state.data.building, label: '건물' },
        { value: state.data.roomNumber, label: '강의실' },
        { value: state.data.maxStd, label: '수강인원' },
    ];
    if (!validateFields(required)) return; // 하나라도 비면 여기서 중단

    // 추가 로직 검사
    if (Number(state.data.startPeriod) > Number(state.data.endPeriod)) {
        await modal.showAlert('시작 교시는 종료 교시보다 작아야 합니다.', 'error');
        return;
    }

    // 정보가져오기(교수번호, 교수명, 전공, 건물, 강의실등 ) -> API 호출하기
    
      const payload = {
        ...state.data,
        year: Number(state.data.year),
        maxStd: Number(state.data.maxStd),
        lectureId: route.params.lectureId || null, // 수정 모드일 때는 lectureId 포함
        startDate: state.data.startDate || null,
        endDate: state.data.endDate || null,
        startPeriod: Number(state.data.startPeriod) || null,
        endPeriod: Number(state.data.endPeriod) || null,
        dayOfWeek: state.data.dayOfWeek,
        roomNumber: state.data.roomNumber
      };
    console.log("최종 전송 데이터:", payload);
    try {
      if (isEdit.value) {
        const lectureId = route.params.lectureId;
        const result = await LectureService.editLecture({ ...payload, lectureId });
        if (result.result === 0) {
          await modal.showAlert(result.message, 'error');
          return;
        }
        modal.showAlert('강의정보가 수정되었습니다.', 'success');
        router.push('/lectures/my'); // 성공할 때만 이동
      } else {
          const result = await LectureService.postLecture(payload);
          if (result.result === 0) {
            await modal.showAlert(result.message, 'error');
            return;
          }
          removeDraft();        // ✅ 제출 성공 시 draft 삭제
          isContent.value = false;  // ✅ 나가기 경고 비활성화
          modal.showAlert('강의가 신청되었습니다.', 'success');
          router.push('/lectures/my'); // 성공할 때만 이동
        }
      } catch (err) {
        console.error("저장 실패:", err);
        modal.showAlert("저장 중 오류가 발생했습니다.", 'error');
      }
  };


  const syncMajorId = () => {
  // 사용자가 입력한 이름과 일치하는 전공 객체를 찾음
  const found = state.majorList.find(m => m.name === state.data.majorName);
  if (found) {
    state.data.majorId = found.majorId;
    console.log("선택된 전공 ID:", state.data.majorId);
  } else {
    state.data.majorId = 0; // 일치하는 게 없으면 초기화
  }
};



// 변경 (임시저장 후 그냥 이동) ✅
onBeforeRouteLeave(async (to, from, next) => {
  if (isContent.value) {
    saveDraft();  // 임시저장
    await modal.showAlert('임시저장 되었습니다.', 'info');
    next();  // 그냥 이동
  } else {
    next();
  }
});

</script>

  <template>
    <div class="container">
      <!-- <h3 class="section-title">{{ pageTitle }}</h3> -->

      <div class="form-wrap">

        <div class="content-wrap" v-if="!isEdit">
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
              <div class="input-label">이수구분</div>
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
                <SearchInput :showOnFocus="true" v-model="state.data.majorName" :list="state.majorList" placeholder="전공명을 입력하세요"
                  @select="(major) => state.data.majorId = major.majorId" 
                  @input="syncMajorId" @focus="state.data.majorName = ''"/>
                  <!-- 리스트보기 -->
                <datalist id="major-options">
                  <option v-for="major in state.majorList" :key="major.majorId" :value="major.name">
                    {{ major.name }}
                  </option>
                </datalist>
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
