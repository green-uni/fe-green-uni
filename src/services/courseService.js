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

    async courseDel(params){
        const res = await axios.delete(path, { params })
        return res.data;
    }

    async postCourse(data){
        const res = await axios.delete(path, data)
        return res.data;
    }

}

export default new CourseService();