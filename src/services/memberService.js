import axios from './httpRequester';

const path = '/major'

class MajorService{

    async findAll(){
        const res = await axios.get(path)
        return res.data;
    }
}

export default new MajorService();

