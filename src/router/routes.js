export const routes = [
  // {
  //   path: '/sample',
  //   component: () => import('../views/Sample.vue'),
  //   meta: {
  //     title: '레이아웃 샘플',
  //     groupTitle: '샘플',
  //     auth: ['student', 'professor', 'admin'],
  //   },
  // },

  {
    path: '/',
    component: () => import('../views/intro/LogIn.vue'),
    meta: {
      title: '로그인',
    },
  },
  {
    path: '/pw',
    component: () => import('../views/intro/PwReset.vue'),
    meta: {
      title: '비밀번호 변경',
    },
  },
  // {
  //   path: '/pw/code',
  //   component: () => import('../views/mail/EmailCode.vue'),
  //   meta: {
  //     title: '코드 입력',
  //   },
  // },
  // {
  //   path: '/pw/reset',
  //   component: () => import('../views/mail/EmailPw.vue'),
  //   meta: {
  //     title: '비밀번호 변경',
  //   },
  // },

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
    path: '/member/me/mod',
    component: () => import('../views/member/MemberCreateMod.vue'),
    meta: {
      title: '내 정보 수정',
      groupTitle: '내 정보 관리',
      showInNav: false, // 메뉴에는 노출X
      activeMenu: '/member/me', // ['/member/me'] path가 active
      auth: ['student', 'professor', 'admin'],
    },
  },
  {
    path: '/member/me/pw',
    component: () => import('../views/member/MemberPw.vue'),
    meta: {
      title: '비밀번호 변경',
      groupTitle: '내 정보 관리',
      showInNav: false,
      activeMenu: '/member/me',
      auth: ['student', 'professor', 'admin'],
    },
  },
  {
    path: '/member/me/status',
    component: () => import('../views/OnGoing.vue'),
    meta: {
      title: '상태 변경 신청',
      groupTitle: '내 정보 관리',
      auth: ['student'],
      planTitle: '학생의 휴/복학 신청',
      planContent :'학생의 휴학, 복학 신청 승인 여부 조회. 학생의 휴/복학 신청서 작성'
    },
  },
  {
    path: '/admin/members',
    component: () => import('../views/member/admin/MemberList.vue'),
    meta: {
      title: '인사정보 조회',
      groupTitle: '인사정보 관리',
      auth: ['admin'],
    },
  },
  {
    // 관리자가 상태 변경
    path: '/admin/members/mod',
    component: () => import('../views/member/admin/MemberList.vue'),
    meta: {
      title: '인사정보 조회',
      groupTitle: '인사정보 관리',
      showInNav: false,
      activeMenu: '/admin/members',
      auth: ['admin'],
    },
  },
  // {
  //   path: '/admin/members/:memberId/mod',
  //   component: () => import('../views/member/MemberCreateMod.vue'),
  //   meta: {
  //     // 관리자가 계정정보 변경
  //     title: '인사정보 수정',
  //     groupTitle: '인사정보',
  //     showInNav: false,
  //     activeMenu: '/admin/members',
  //     auth: ['admin'],
  //   },
  // },
  {
    path: '/admin/members/new',
    component: () => import('../views/member/MemberCreateMod.vue'),
    meta: {
      title: '계정 생성',
      groupTitle: '인사정보 관리',
      auth: ['admin'],
    },
  },
  {
    path: '/admin/members/status',
    component: () => import('../views/OnGoing.vue'),
    meta: {
      title: '상태 관리',
      groupTitle: '인사정보 관리',
      auth: ['admin'],
      planTitle: '관리자의 인사 정보 관리',
      planContent :'학생의 휴학, 복학 신청서 목록 조회. 관리자는 학생의 신청서를 확인하고 승인 및 상태 변경'
    },
  },

  ///////////////////////////////////////// 강의 생성 및 관리 ////////////////////////////////////////////
  {
    path: '/lectures/create',
    component: () => import('../views/lecture/LectureCreate.vue'),
    meta: {
      title: '강의 개설',
      groupTitle: '강의 관리',
      auth: ['professor'],
    },
  },
  {
    path: '/lectures',
    component: () => import('../views/lecture/LectureList.vue'),
    meta: {
      title: '전체 강의 조회',
      groupTitle: '강의 관리',
      auth: ['student', 'professor', 'admin'],
    },
  },
  {
    path: '/lectures/my',
    component: () => import('../views/lecture/MyLectureList.vue'),
    meta: {
      title: '내 강의 조회', // 내 강의 조회
      groupTitle: '강의 관리',
      auth: ['professor','student'],
    },
  },
    {
    path: '/lectures/approve',
    component: () => import('../views/lecture/LectureApproveList.vue'),
    meta: {
      title: '강의 승인 관리',
      groupTitle: '강의 관리',
      auth: ['admin'],
    },
  },
    {
    path: '/lectures/:lectureId',
    component: () => import('../views/lecture/LectureDetail.vue'),
    meta: {
      title: '강의 상세 조회',
      subTitle: '전체 강의 조회',
      groupTitle: '강의',
      showInNav: false,
      activeMenu: '/lectures',
      auth: ['student', 'professor', 'admin'],
      }
  },
  {
    path: '/lectures/my/:lectureId',
    component: () => import('../views/lecture/LectureDetail.vue'),
    meta: {
      title: '강의 상세 조회',
      subTitle: '내 강의 관리',
      groupTitle: '강의',
      showInNav: false,
      activeMenu: '/lectures/my',
      auth: ['student', 'professor'],
      }
  },
  //강의 정보 수정
  {
    path: '/lectures/edit/:lectureId',
    component: () => import('../views/lecture/LectureCreate.vue'),
    meta: {
      title: '강의 정보 수정',
      subTitle: '내 강의 관리',
      groupTitle: '강의 관리',
      showInNav: false,
      activeMenu: '/lectures/my',
      auth: ['professor'],
      }
  },
  // {
  //   path: '/lectures/:lectureId/statusedit',
  //   component: () => import('../views/lecture/LectureDetail.vue'),
  // },
  // {
  //   path: '/lectures/:lectureId/statusedit',
  //   component: () => import('../views/lecture/LectureDetail.vue'),
  // },

  {
    path: '/lectures/:lectureId/attendance',
    component: () => import('../views/attendance/Attendance.vue'),
    meta: {
      title: '출석 관리 현황',
      subTitle: '내 강의 관리',
      groupTitle: '강의 관리',
      showInNav: false,
      activeMenu: '/lectures/my',
      auth: ['professor'],
      }
  },
  //////////////////////////////////////////// 강의 성적 조회 ////////////////////////////////////////////
  {
    path: '/lectures/:lectureId/grades',
    component: () => import('../views/grade/GradeManagement.vue'),
    meta: {
      title: '성적 관리 현황',
      subTitle: '내 강의 관리',
      groupTitle: '강의 관리',
      showInNav: false,
      activeMenu: '/lectures/my',
      auth: ['professor'],
      }
  },
  ///////////////////////////////////////// 학생 성적확인 ////////////////////////////////////////////
  {
    path: '/grade/MyGrades',
    component: () => import('../views/grade/MyGrades.vue'),
    meta: {
      title: '내 성적 조회', // 내 성적 조회
      groupTitle: '성적 관리',
      auth: ['student'],
    },
  },
  ///////////////////////////////////////// 강의 평가 ////////////////////////////////////////////
  {
    path: '/lectures/my/evaluation',
    component: () => import('../views/OnGoing.vue'),
    meta: {
      title: '강의평가 조회 ',
      groupTitle: '강의 관리',
      auth: ['student','professor'],
      planTitle: '강의 평가 목록 조회',
      planContent :'학생: 강의평가 해야할 수강 강의 목록 조회, 교수: 강의 평가 받을 본인 강의 목록 조회'
    },
  },
  {
    path: '/lectures/:lectureId/evaluation/new',
    component: () => import('../views/OnGoing.vue'),
    meta: {
      title: '강의평가',
      groupTitle: '강의 관리',
      auth: ['student'],
      planTitle: '학생의 강의평가',
      planContent :'수강하는 특정 강의에 대한 강의 평가'
    },
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
      title: '학과 개설',
      groupTitle: '학과 관리',
      auth: ['admin'],
    },
  },
  {
    path: '/admin/major/new/:majorId',
    component: () => import('../views/major/MajorCreate.vue'),
    meta: {
      title: '학과 정보수정',
      subTitle: '학과 조회',
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
      title: '수강 신청 및 취소',
      groupTitle: '수강 관리',
      auth: ['student'],
    },
  },

  ////////////////////////// 학사 일정 //////////////////////
  {
    path: '/calendar',
    component: () => import('../views/OnGoing.vue'),
    meta: {
      title: '학사일정',
      groupTitle: '학사일정',
      auth: ['student','professor','admin'],
      planTitle: '학사일정 조회',
      planContent :'달력 형식의 학사 일정 조회'
    },
  },
  {
    path: '/calendar/edit',
    component: () => import('../views/OnGoing.vue'),
    meta: {
      title: '학사일정 관리',
      groupTitle: '학사일정',
      auth: ['admin'],
      planTitle: '학사일정 관리',
      planContent :'관리자가 학사 일정 등록 및 수정'
    },
  },
]
