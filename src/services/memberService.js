import axios from './httpRequester'

class MemberService {
  #adminPath = '/admin/members'
  #path = '/members'

  async createMember(data) {
    const res = await axios.post(this.#adminPath, data)
    return res.data
  }

  async findAllMember(params) {
    const res = await axios.get(this.#adminPath, { params })
    return res.data
  }

  async login(params) {
    const res = await axios.post(`${this.#path}/login`, params)
    return res.data
  }

  async logOut(){
    const res = await axios.post(`${this.#path}/logout`)
    return res.data;
  }
}

export default new MemberService()
