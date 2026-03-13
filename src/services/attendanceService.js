import axios from "./httpRequester";

const path = '/lectures';

class AttendanceService {
    async getAttendList(lectureId, attendDate) {
        const res = await axios.get(`${path}/${lectureId}/attendance`, {
            params: { attendDate }
        });
        return res.data.result;
    }

    async getLectureId(lectureId) {
        const res = await axios.get(`${path}/${lectureId}`);
        return res.data.result;
    }

}

export default new AttendanceService();