import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const loginUserId = ref(0)
    const name = ref('')
    const code = ref('')
    const role = ref('')
    const isLogin = ref(false)

    // 로그인
    const logIn = (loginUser) => {
      loginUserId.value = loginUser.loginUserId
      name.value = loginUser.name
      code.value = loginUser.code
      role.value = loginUser.role
      isLogin.value = true
    }

    // 로그아웃
    const logOut = () => {
      loginUserId.value = 0
      name.value = ''
      code.value = ''
      role.value = ''
      isLogin.value = false
    }

    return { loginUserId, name, code, role, isLogin, logIn, logOut }
  },
  { persist: true },
)
