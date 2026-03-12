import axios from './httpRequester';

const path = '/course';

class CourseService{

    async courseList(){
        const res = await axios.get(path)
        return res.data;
    }

}

export default new CourseService();