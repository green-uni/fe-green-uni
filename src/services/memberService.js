import axios from './httpRequester'

// const memberPath = '/members'
// const adminPath = '/admin/members'

// export const createMember = (data) => axios.post(adminPath, data)

class MemberService {
  #adminPath = '/admin/members'

  async createMember(data) {
    const res = await axios.post(this.#adminPath, data)
    return res.data
  }

  async findAllMember(params) {
    const res = await axios.get(this.#adminPath, { params })
    return res.data
  }
}

export default new MemberService()
