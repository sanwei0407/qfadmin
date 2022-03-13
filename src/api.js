import axios from 'axios';

//  创建一个axios 实例
const $api = axios.create({
  baseURL: 'http://localhost:3000/api/v1', // 设置一个请求的公共基础路径
});

export default $api;
