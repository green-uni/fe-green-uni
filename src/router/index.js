import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { useAuthStore } from '@/stores/authentication';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 네비게이션 가드 (주소의 변화가 있으면 호출)
router.beforeEach( (to, from, next) => {
  const authStore = useAuthStore()
  const isLogin = authStore.isLogin; //true: 로그인 상태, false: 비로그인 상태
  const role = authStore?.role; // 로그인 유저 권한

  //비로그인 상태에서 로그인이 필요한 path로 가려고 할 때
  if( to.meta.auth && !isLogin ) {
    return next('/login');
  }

  // 로그인 했는데 로그인 페이지 접근 시
  if (to.path === '/login' && isLogin ) {
    return next('/member/me')
  }

  // //로그인 상태에서 비 로그인이 필요 한 path로 가려고 할 때
  // if( to.meta.auth && isLogin ) {
  //   return next('/');
  // }

  // 권한 체크
  if (to.meta.auth && !to.meta.auth.includes(role)) {
    return next('/member/me') // 권한 없으면 내 정보 페이지로
  }

  next(); //원래 처리대로
} );

export default router
