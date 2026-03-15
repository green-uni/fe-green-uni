export const routes = [
  {
    path: '/',
    component: () => import('../views/Confirm.vue'),
    meta: {
      auth: ['student', 'professor', 'admin'],
    },
  },
  {
    path: '/sample',
    component: () => import('../views/Sample.vue'),
    meta: {
      title: '레이아웃 샘플',
      groupTitle: '샘플',
      auth: ['student', 'professor', 'admin'],
    },
  },

  {
    path: '/login',
    component: () => import('../views/member/LogIn.vue'),
    meta: {
      title: '로그인',
    },
  },

  ///////////////////////////////////////// 계정 생성 및 관리 ////////////////////////////////////////////
  {
    path: '/member/me',
    component: () => import('../views/member/MemberProfile.vue'),
    meta: {
      title: '내 정보 조회',
      groupTitle: '내 정보 조회',
      auth: ['student', 'professor', 'admin'],
    },
  },
  {
    path: '/member/me/mod',
    component: () => import('../views/member/MemberCreateMod.vue'),
    meta: {
      title: '내 정보 수정',
      groupTitle: '내 정보 조회',
      showInNav: false, // 메뉴에는 노출X
      activeMenu: '/member/me', // ['/member/me'] path가 active
      auth: ['student', 'professor', 'admin'],
    },
  },
  {
    path: '/admin/members',
    component: () => import('../views/member/MemberList.vue'),
    meta: {
      title: '인사정보 조회',
      groupTitle: '인사정보',
      auth: ['admin'],
    },
  },
  {
    path: '/admin/members/mod',
    component: () => import('../views/member/MemberListMod.vue'),
    meta: {
      // 관리자가 상태 변경
      groupTitle: '인사정보',
      showInNav: false,
      activeMenu: '/admin/members',
      auth: ['admin'],
    },
  },
  {
    path: '/admin/members/new',
    component: () => import('../views/member/MemberCreateMod.vue'),
    meta: {
      title: '계정 생성',
      groupTitle: '인사정보',
      auth: ['admin'],
    },
  },
  {
    path: '/member/me/pw',
    component: () => import('../views/member/MemberPw.vue'),
    meta: {
      title: '비밀번호 변경',
      groupTitle: '내 정보 조회',
      showInNav: false,
      activeMenu: '/member/me',
      auth: ['student', 'professor', 'admin'],
    },
  },

  ///////////////////////////////////////// 강의 생성 및 관리 ////////////////////////////////////////////
  {
    path: '/lectures/create',
    component: () => import('../views/lecture/LectureCreate.vue'),
    meta: {
      title: '강의개설',
      groupTitle: '강의',
      auth: ['professor'],
    },
  },
  {
    path: '/lectures',
    component: () => import('../views/lecture/LectureList.vue'),
    meta: {
      title: '전체강의조회',
      groupTitle: '강의',
      auth: ['student', 'professor', 'admin'],
    },
  },
  {
    path: '/lectures/my',
    component: () => import('../views/lecture/MyLectureList.vue'),
    meta: {
      title: '내 강의 조회', // 교수 강의 조회
      groupTitle: '강의',
      auth: ['professor'],
    },
  },
  {
    meta: {
      title: '내 강의 조회', // 학생 강의 조회
      groupTitle: '강의',
      auth: ['student'],
    },
  },
  {
    path: '/lectures/:lectureId/statusedit',
    component: () => import('../views/lecture/LectureDetail.vue'),
  },
  {
    path: '/lectures/:lectureId',
    component: () => import('../views/lecture/LectureDetail.vue'),
      title: '강의 상세 조회',
      groupTitle: '강의',
      showInNav: false,
      activeMenu: '/lectures',
  },
  {
    path: '/lectures/:lectureId/attendance',
    component: () => import('../views/attendance/Attendance.vue'),
  },
  {
    path: '/lectures/:lectureId/grades',
    component: () => import('../views/grade/GradeManagement.vue'),
  },

  ///////////////////////////////////////// 학과 생성 및 관리 ////////////////////////////////////////////
  {
    path: '/admin/major',
    component: () => import('../views/major/MajorList.vue'),
    meta: {
      title: '학과 조회',
      groupTitle: '학과',
      auth: ['admin'],
    },
  },
  {
    path: '/admin/major/new',
    component: () => import('../views/major/MajorCreate.vue'),
    meta: {
      title: '학과 생성',
      groupTitle: '학과',
      auth: ['admin'],
    },
  },
  {
    path: '/admin/major/new/:majorId',
    component: () => import('../views/major/MajorCreate.vue'),
    meta: {
      title: '학과 정보수정',
      groupTitle: '학과',
      showInNav: false, // 메뉴에는 노출X
      activeMenu: '/admin/major',
      auth: ['admin'],
    },
  },

  ///////////////////////////////////////// 수강신청 ////////////////////////////////////////////
  {
    path: '/admin/course',
    component: () => import('../views/course/CourseList.vue'),
    meta: {
      title: '수강 신청/취소',
      groupTitle: '수강',
      auth: ['student'],
    },
  },
]
