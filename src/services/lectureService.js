import axios from './httpRequester';

const path = '/lectures';

export class LectureService {
    async lectureRoomList(params) {
        // 백엔드 API 경로가 /lectures/Roomlist 라면 아래와 같이 작성합니다.
        const res = await axios.get(`${path}/Roomlist`, { params });
        return res.data;
    }
}