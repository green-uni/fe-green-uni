import axios from './httpRequester';

const path = '/lectures'; // 프록시 설정을 위해 /api를 붙이는 것이 안전합니다.

export class LectureService {

    // 강의 생성
        static async postLecture(data) {
        const res = await axios.post(`${path}/create`, data);
        return res.data.result;
    }
    
    // 건물 목록 조회
    static async getBuildings() {
        const res = await axios.get(`${path}/buildings`);
        return res.data.result; // 건물 이름 리스트 반환
    }

    // 강의실 목록 조회
    static async getRoomNumber(params) {
        const res = await axios.get(`${path}/Roomlist`, { params });
        return res.data.result;
    }
}