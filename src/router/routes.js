export const routes = [
  {
    path: '/',
    component: () => import('../views/Confirm.vue'),
    meta: {
    },
  },
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
    path: '/admin/members',
    component: () => import('../views/member/MemberList.vue'),
    meta: {
      title: '인사정보 조회',
      groupTitle: '인사정보 관리',
      auth: ['admin']
    },
  },
  {
    path: '/admin/members/new',
    component: () => import('../views/member/MemberCreate.vue'),
    meta: {
      title: '계정 생성',
      groupTitle: '인사정보 관리',
      auth: ['admin']
    },
  },
    {
    path: '/lectures/create',
    component: () => import('../views/lecture/LectureSave.vue'),
    meta: {
      title: '강의개설',
      groupTitle: '강의관리',
      auth: ['professor']
    },
  },
]
