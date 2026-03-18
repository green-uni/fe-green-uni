import axios from './httpRequester'

class MemberService {
  #adminPath = '/admin/members'
  #path = '/member'

  async logIn(params) {
    const res = await axios.post(`${this.#path}/login`, params);
    return res.data;
  }
  async logOut(){ return await axios.post(`${this.#path}/logout`) }

  async reissue(data) { return axios.post(`${this.#path}/reissue`, data)}

  async createMember(data) {
    const res =  await axios.post(this.#adminPath, data)
    return res.data;
  }

  async findAllMember(params) { return await axios.get(this.#adminPath, { params }) }
  async modStatusList(jsonBody) { return await axios.put(`${this.#adminPath}/mod`, jsonBody) }

  async getMemberMaxPage(params){  return await axios.get(`${this.#adminPath}/max_page`, { params });  }

  async findUserProfile(){ return await axios.get(`${this.#path}/me`) };
  async modifyUserProfile(data){ return await axios.put(`${this.#path}/me/mod`, data)}

  async changePw(data){ return await axios.patch(`${this.#path}/me/pw`, data)}
  async resetPw(data){ return await axios.patch(`${this.#path}/pw`, data)}
}

export default new MemberService();
