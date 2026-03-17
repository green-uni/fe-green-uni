import axios from './httpRequester';

const path = '/major'

class MajorService{

    async listForCreate(){
        const res = await axios.get(`${path}/create`)
        return res.data;
    }

    async majorList(){
        const res = await axios.get(path)
        return res.data;
    }

    async createMajor(body){
        const res = await axios.post(path, body)
        return res.data;
    }

    async modifyMajor(body){
        const res = await axios.put(path, body)
        return res.data;
    }

    async getMajor(majorId) {
        const res = await axios.get(`${path}/${majorId}`);
        return res.data;
    }

    async getProfessorList(){
        const res = await axios.get(`${path}/professors`);
        return res.data;
    }

}

export default new MajorService();

