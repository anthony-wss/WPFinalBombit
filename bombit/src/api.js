import axios from 'axios';

const instance = axios.create({
  baseURL: `http://linux7.csie.ntu.edu.tw:5000/api`,
});

export default instance;

