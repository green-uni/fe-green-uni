import axios from './httpRequester';

const path = '/lectures'; 

class StudentInfo {

    //강의 디테일(상세)
    async findByStudentInfo(id) {
        const res = await axios.get(`${path}/${id}/studentInfo`, {
            params: { lectureId: id }
        });
        return res.data.result;
    }
}

export default new StudentInfo();