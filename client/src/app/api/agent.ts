import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { PaginatedResponse } from "../models/pagination";
import { router } from "../router/Routes";
import { store } from "../store/configureStore";

const sleep = () => new Promise(resolve => setTimeout(resolve, 500))

axios.defaults.baseURL = process.env.REACT_APP_API_URL;
axios.defaults.withCredentials = true;

const responseBody = (response: AxiosResponse) => response.data;

axios.interceptors.request.use(config => {
    const token = store.getState().account.user?.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
})

axios.interceptors.response.use(async response => {
    if (process.env.NODE_ENV === 'development') await sleep();
    const pagination = response.headers['pagination'];
    if (pagination) {
        response.data = new PaginatedResponse(response.data, JSON.parse(pagination));
        return response;
    }
    return response
}, (error: AxiosError) => {
    const {data, status} = error.response as AxiosResponse;
    switch (status) {
        case 400:
            if (data.errors) {
                const modelStateErrors: string[] = [];
                for (const key in data.errors) {
                    if (data.errors[key]) {
                        modelStateErrors.push(data.errors[key])
                    }
                }
                throw modelStateErrors.flat();
            }
            toast.error(data.title);
            break;
        case 401:
            toast.error(data.title);
            break;
        case 403: 
            toast.error('You are not allowed to do that!');
            break;
        case 500:
            router.navigate('/server-error', {state: {error: data}});
            break;
        default:
            break;
    }

    return Promise.reject(error.response);
})

function createFormData(item: any) {
    let formData = new FormData();
    for (const key in item) {
        formData.append(key, item[key])
    }
    return formData;
}

const requests = {
    get: (url: string, params?: URLSearchParams) => axios.get(url, {params}).then(responseBody),
    post: (url: string, body: {}) => axios.post(url, body).then(responseBody),
    put: (url: string, body: {}) => axios.put(url, body).then(responseBody),
    delete: (url: string) => axios.delete(url).then(responseBody),
    postForm: (url: string, data: FormData) => axios.post(url, data, {
        headers: {'Content-type': 'multipart/form-data'}
    }).then(responseBody),
    putForm: (url: string, data: FormData) => axios.put(url, data, {
        headers: {'Content-type': 'multipart/form-data'}
    }).then(responseBody)
}

const Catalog = {
    list: (params: URLSearchParams) => requests.get('products', params),
    details: (id: number) => requests.get(`products/${id}`),
    fetchFilters: () => requests.get('products/filters')
}

const TestErrors = {
    get400Error: () => requests.get('buggy/bad-request'),
    get401Error: () => requests.get('buggy/unauthorised'),
    get404Error: () => requests.get('buggy/not-found'),
    get500Error: () => requests.get('buggy/server-error'),
    getValidationError: () => requests.get('buggy/validation-error')
}

const Basket = {
    get: () => requests.get('basket'),
    addItem: (productId: number, quantity = 1) => requests.post(`basket?productId=${productId}&quantity=${quantity}`, {}),
    removeItem: (productId: number, quantity = 1) => requests.delete(`basket?productId=${productId}&quantity=${quantity}`)
}

const Account = {
    login: (values: any) => requests.post('account/login', values),
    register: (values: any) => requests.post('account/register', values),
    currentUser: () => requests.get('account/currentUser'),
    fetchAddress: () => requests.get('account/savedAddress'),
    searchUsers: (term: any)=> requests.get(`account/search-users/${term}`),
    loadStaff: ()=> requests.get(`account/load-staff`),
    getAll: ()=> requests.get(`account/get-all`),
    updateUser: (id: any, payload: any)=> requests.put(`account/update/${id}`,payload),
    delete: (id:any)=> requests.delete(`account/delete/${id}`),
}

const Orders = {
    list: () => requests.get('orders'),
    fetch: (id: number) => requests.get(`orders/${id}`),
    create: (values: any) => requests.post('orders', values)
}

const Payments = {
    createPaymentIntent: () => requests.post('payments', {})
}

const Admin = {
    createProduct: (product: any) => requests.postForm('products', createFormData(product)),
    updateProduct: (product: any) => requests.putForm('products', createFormData(product)),
    deleteProduct: (id: number) => requests.delete(`products/${id}`),
    getFields: () => requests.get(`products/available-fields`),
    uploadExcels:  (fromData: any) => requests.postForm(`products/upload-excel`, fromData),
    finalUploadExcels:  (fromData: any) => requests.postForm(`products/final-upload-excel`, fromData),
}

const Chat = {
    fetchChats: () => requests.get('chats'),
    uploadImageChats: (data: any) => requests.post('chats/upload-image', data),
    paginateMessages: (id: number, page: number) => requests.get(`chats/messages/${id}/${page}`),
    createChat: (partnerId: number) => requests.post(`chats/create`, {partnerId}),
    addFriendToGroupChat: (userId: number, chatId: number) => requests.post(`chats/add-user-to-group`,{ userId, chatId }),
    leaveCurrentChat: (chatId: number) => requests.post(`chats/leave-current-chat}`,{ chatId }),
    deleteCurrentChat: (chatId: number) => requests.delete(`/chats/${chatId}`),
}

const Coupon = {
    getAll: () => requests.get('coupons'),
    getById: (id: number) => requests.get(`coupons/${id}`),
    createCoupon: (coupon: any) => requests.post('coupons', coupon),
    updateCoupon: (id:number,coupon: any) => requests.put(`coupons/${id}`, coupon),
    deleteCoupon: (id: number) => requests.delete(`coupons/${id}`),
    getMarketingCouponInfo: (id: number) => requests.get(`coupons/marketing/${id}`),
    cancelMarketingCoupon: (id: number) => requests.delete(`coupons/marketing/${id}`),
    createMarketingCoupon: (marketingInfo: any) => requests.post('coupons/marketing', marketingInfo),
}

const Dashboard = {
    get: () => requests.get('Dashboard'),
}


const agent = {
    Catalog,
    TestErrors,
    Basket,
    Account,
    Orders,
    Payments,
    Admin,
    Chat,
    Coupon,
    Dashboard
}

export default agent;