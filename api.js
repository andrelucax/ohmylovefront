import axios from 'axios';
import Constants from './constants'

const api = axios.create({
    baseURL: Constants.siteEndpoint,
    timeout: 10 * 1000,
});

const get = async (url) => {
    const response = await api.get(url);
    return response.data;
};

const post = async (url, data) => {
    const response = await api.post(url, data);
    return response.data;
};

export { api, get, post };