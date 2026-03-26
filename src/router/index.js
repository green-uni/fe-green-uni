import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { useAuthStore } from '@/stores/authentication'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 네비게이션 가드 (주소의 변화가 있으면 호출)
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const publicPages = ['/', '/member/pw']

  // persist 복원 완료까지 대기
  await authStore.$persistedState?.isReady?.()

  const isLogin = authStore.isLogin //true: 로그인 상태, false: 비로그인 상태
  const role = authStore?.role // 로그인 유저 권한

  // 비로그인상태로 접속 시도 → 로그인 페이지로
  if (!isLogin && !publicPages.includes(to.path)) {
    next('/')
    return
  }

  // 로그인 했는데 로그인 페이지 접근 시
  if (to.path === '/' && isLogin) {
    return next('/member/me')
  }

  // 권한 체크
  if (to.meta.auth && !to.meta.auth.includes(role)) {
    return next('/member/me') // 권한 없으면 내 정보 페이지로
  }

  // 계정정보 수정 페이지 접근 시 상태 체크
  if (to.path === '/member/me/mod') {
    const isInactive =
      authStore.stdStatus === 'graduation' ||
      authStore.stdStatus === 'quit' ||
      authStore.stdStatus === 'expulsion' ||
      authStore.profStatus === 'retirement' ||
      authStore.stfStatus === 'retirement'

    if (isInactive) {
      next('/member/me') // 프로필 페이지로 리다이렉트
      return
    }
  }

  if (role === 'professor' && authStore.profStatus !== 'employment') {
      const isAttendancePage = to.path.includes('/attendance');
      const isGradePage = to.path.includes('/grades');

      if (isAttendancePage || isGradePage) {
          //강의 ID 추출해서 강의 디테일로 리다이렉트
          const lectureId = to.params.lectureId;
          //라우터 가드에서는 useModalStore직접 사용이 어려워서 alert창으로 대체
          alert('재직 중인 교수만 접근할 수 있습니다.');
          next(`/lectures/${lectureId}`);
          return;
      }
  }
  next() //원래 처리대로
})

export default router
