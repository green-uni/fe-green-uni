import axios from './httpRequester'

class MemberService {
  #adminPath = '/admin/members'
  #path = '/member'

  async logIn(params) { return await axios.post(`${this.#path}/login`, params) }
  async logOut(){ return await axios.post(`${this.#path}/logout`) }

  async reissue(data) { return axios.post(`${this.#path}/reissue`, data)}

  async createMember(data) { return await axios.post(this.#adminPath, data) }

  async findAllMember(params) { return await axios.get(this.#adminPath, { params }) }
  async modStatusList(jsonBody) { return await axios.put(`${this.#adminPath}/mod`, jsonBody) }

  async getMemberMaxPage(params){  return await axios.get(`${this.#adminPath}/max_page`, { params });  }

  async findUserProfile(){ return await axios.get(`${this.#path}/me`) };
  async modifyUserProfile(data){ return await axios.put(`${this.#path}/me/mod`, data)}

  async changePw(data){ return await axios.patch(`${this.#path}/me/pw`, data)}
}

export default new MemberService();
