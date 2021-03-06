import API from '../api/api';
import {createURLGenerator} from '../api/apiList';

const urlGenerator = createURLGenerator('transfer');

export const DocumentService = {
    get: (id, params) => {
        return API.get(urlGenerator('document')(id, params));
    },
    update: (id, form) => {
        return API.put(urlGenerator('document')(id, form));
    },
    delete: (id) => {
        return API.delete(urlGenerator('document')(id));
    },
    download: (transactionId) => {
        return API.get(urlGenerator('document')(transactionId), {responseType: 'arraybuffer'});
    }
};
