import axios from './httpRequester'

class MemberService {
  #adminPath = '/admin/members'
  #path = '/members'

  async createMember(data) {
    const res = await axios.post(this.#adminPath, data)
    return res
  }

  async findAllMember(params) { return await axios.get(this.#adminPath, { params }) }
  async modStatusList(jsonBody) { return await axios.put(`${this.#adminPath}/mod`, jsonBody) }

  async getMemberMaxPage(params){
    return await axios.get(`${this.#adminPath}/max_page`, { params });
  }

  async logIn(params) { return await axios.post(`${this.#path}/login`, params) }
  async logOut(){ return await axios.post(`${this.#path}/logout`) }

  async findUserProfile(){ return await axios.get(`${this.#path}/me`) };

  async modifyUserProfile(data){ return await axios.put(`${this.#path}/me/mod`, data)}
}

export default new MemberService();
