import { createRouter, createWebHistory } from 'vue-router'
import MemberCreate from '@/views/admin/MemberCreate.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import("../views/Confirm.vue"),
    },
    {
      path: "/admin/m/create",
      component: MemberCreate,
    },
  ],
})

export default router
