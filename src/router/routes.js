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
      groupTitle: '내 정보 관리',
      auth: ['student', 'professor', 'admin'],
    },
  },
  {
    path: '/members/me/mod',
    component: () => import('../views/member/MemberCreateMod.vue'),
    meta: {
      title: '내 정보 수정',
      groupTitle: '내 정보 관리',
      auth: ['student', 'professor', 'admin'],
    },
  },
  {
    path: '/admin/members',
    component: () => import('../views/member/MemberList.vue'),
    meta: {
      title: '인사정보 조회',
      groupTitle: '인사정보 관리',
      auth: ['admin'],
    },
  },
  {
    path: '/admin/members/mod',
    component: () => import('../views/member/MemberListMod.vue'),
    meta: {
      // 관리자가 상태 변경
      auth: ['admin'],
    },
  },
  {
    path: '/admin/members/new',
    component: () => import('../views/member/MemberCreateMod.vue'),
    meta: {
      title: '계정 생성',
      groupTitle: '인사정보 관리',
      auth: ['admin'],
    },
  },

  ///////////////////////////////////////// 강의 생성 및 관리 ////////////////////////////////////////////
  {
    path: '/lectures',
    component: () => import('../views/lecture/LectureList.vue'),
    meta: {
      title: '전체강의조회',
      groupTitle: '강의관리',
      auth: ['student', 'professor', 'admin'],
    },
  },
  {
    path: '/lectures/create',
    component: () => import('../views/lecture/LectureCreate.vue'),
    meta: {
      title: '강의개설',
      groupTitle: '강의관리',
      auth: ['professor'],
    },
  },
  {
    path: '/lectures/my',
    component: () => import('../views/lecture/MyLectureList.vue'),
    meta: {
      title: '강의개설조회',
      groupTitle: '강의관리',
      auth: ['professor'],
    },
  },

  {
    path: '/lectures/me',
    component: () => import('../views/lecture/LectureStudent.vue'),
    meta: {
      title: '강의디테일 학생출력',
      groupTitle: '강의관리',
      auth: ['professor'],
    },
  },
  {
    path: '/lectures/:lectureId/statusedit',
    component: () => import('../views/lecture/LectureDetail.vue'),
  },
    {
    path: '/lectures/:lectureId',
    component: () => import('../views/lecture/LectureDetail.vue'),
  },
  {
    path: '/lectures/attendance/:lectureId',
    component: () => import('../views/attendance/Attendance.vue'),
  },
  {
    path: '/lectures/studentGrade/:gradeId',
    component: () => import('../views/grade/StudentGrade.vue'),
  },

  ///////////////////////////////////////// 학과 생성 및 관리 ////////////////////////////////////////////
  {
    path: '/admin/major',
    component: () => import('../views/major/MajorList.vue'),
    meta: {
      title: '학과 조회',
      groupTitle: '학과 관리',
      auth: ['admin'],
    },
  },
  {
    path: '/admin/major/new',
    component: () => import('../views/major/MajorCreate.vue'),
    meta: {
      title: '학과 생성',
      groupTitle: '학과 관리',
      auth: ['admin'],
    },
  },
  {
    path: '/admin/major/new/:majorId',
    component: () => import('../views/major/MajorCreate.vue'),
    meta: {
      activeMenu: '/admin/major',
    },
  },

  ///////////////////////////////////////// 수강신청 ////////////////////////////////////////////
  {
    path: '/admin/course',
    component: () => import('../views/course/CourseList.vue'),
    meta: {
      title: '수강 신청/취소',
      groupTitle: '수강 관리',
      auth: ['student'],
    },
  }
]
