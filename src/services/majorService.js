import axios from './httpRequester';

const path = '/major'

class MajorService{

    async listForCreate(){
        const res = await axios.get(`${path}/create`)
        return res.data;
    }

    async majorList(){
        const res = await axios.get(`${path}/list`)
        return res.data;
    }

    async createMajor(body){
        const res = await axios.post(path, body)
        return res.data;
    }

}

export default new MajorService();

