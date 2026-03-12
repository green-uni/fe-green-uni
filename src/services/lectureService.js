import axios from './httpRequester';

const path = '/lectures'; 

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

    //강의개설 승인 전 목록조회
    static async getBeforeLecture() {
        const res = await axios.get(`${path}/me/before`);
        return res.data.result;
    }

    //전체 강의조회
    static async getLectureList() {
        const res = await axios.get(path);
        return res.data.result;
    }

    //강의 디테일(상세)
    static async findById(id) {
        const res = await axios.get(`${path}/${id}`);
        return res.data.result;
    }
}