import axios from './httpRequester';

const memberPath = '/members'
const adminPath = '/admin/members'

export const createMember = data => axios.post(adminPath, data);
