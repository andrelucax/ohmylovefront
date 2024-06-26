import axios from 'axios';
import Constants from './constants'

const api = axios.create({
    baseURL: Constants.siteEndpoint,
    timeout: 10 * 1000,
    headers: {
        'Accept-Encoding': '*/*'
    },
});

const get = async (url, config = {}) => {
    const response = await api.get(url, config);
    return response.data;
};

const post = async (url, data, config = {}) => {
    const response = await api.post(url, data, config);
    return response.data;
};

const put = async (url, data, config = {}) => {
    const response = await api.put(url, data, config);
    return response.data;
};

export { api, get, post, put };