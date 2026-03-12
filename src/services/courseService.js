import axios from './httpRequester';

const path = '/course';

class CourseService{

    async courseList(){
        const res = await axios.get(path)
        return res.data;
    }

    async myCourseList(memberId) {
        if (!memberId) {
            console.error("memberId가 없습니다!");
            return;
        }
        return await axios.get(`${path}/${memberId}`);
    }

}

export default new CourseService();