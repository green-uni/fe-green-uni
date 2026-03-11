import axios from './httpRequester';

const path = '/lectures'

class lectureService{

    export class lectureService {
        async lectureRoomList(params) {
            const res = await axios.get(`${path}/Roomlist`, { params });
            return res.data;
        }
    }