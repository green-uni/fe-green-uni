import axios from './httpRequester';

const path = '/course';

class CourseService{

    async courseList(){
        const res = await axios.get(path)
        return res.data;
    }

    async myCourseList() {
        const res = await axios.get(`${path}/my`)
        return res.data;
    }

}

export default new CourseService();