import { reactive } from 'vue'
import { defineStore } from 'pinia'

export const useAuthenticationStore = defineStore(
  'authentication',
  () => {
    const state = reactive({
      loginUser: {
        memberId: 0,
        name: '',
        code: '',
        pic: null,
      },
      isLogin: false,
    })

    const logIn = loginUser => {
      state.isLogin = true
      state.loginUser = loginUser
    }

    const setLoginUser = loginUser => {
      console.log('auth: ', loginUser)
      state.isLogin = true
      const user = {
        memberId: loginUser.loginUserId,
        name:loginUser.name,
        code:loginUser.code
      }
      state.loginUser = user
    }

    const setLoginUserPic = pic => {
      state.loginUser.pic = pic
    }

    const logOut = () => {
      state.isLogin = false
      state.loginUser = null
    }

    return { state, setLoginUser, setLoginUserPic, logIn, logOut }
  },
  { persist: true },
)
