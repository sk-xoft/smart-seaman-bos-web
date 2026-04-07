import { defineStore } from 'pinia';
import axios from "axios";
import { fetchWrapper } from '@/helpers';
import { useAuthStore, useAlertStore } from '@/stores';
import { uuid } from 'vue-uuid';

const baseUrl = import.meta.env.VITE_BASE_URL_API;

export const useNewsesStore = defineStore({
    id: 'newses',
    state: () => ({
        newses: {},
        news: {},
        res_code: '',
        res_desc: '',
        state_search_data: {},
        perPage: 20,
        size: 20,
        lastNum: 20,
    }),
    getters: {
        get_res_code: (state) => {
            return state.res_code
        },
        get_res_desc: (state) => {
            return state.res_desc
        },
    },
    actions: {
        async getAllNewses() {
            this.newses = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                const size = this.size;
                const lastNum = this.lastNum;
                
                const res = await axios.post(`${baseUrl}/v1/list-news`, {size, lastNum}, {
                    headers: {
                        "menuCode": "OPER106",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN',
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){

                    this.newses = res.data.data;

                    if(!res.data.data.newsList.length){
                        this.newses = null;
                    }
                    
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    console.log(error);
                }
    
            } catch (error) {
                console.log(error);             
            }
        },
        async getSearchNewses(searchData) {
            this.newses = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.post(`${baseUrl}/v1/list-news`, searchData, {
                    headers: {
                        'menuCode': 'OPER106',
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){

                    this.newses = res.data.data;
                    this.state_search_data = searchData;

                    if(!res.data.data.newsList.length){
                        this.newses = null;
                    }
                    
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                }  else {
                    console.log(res.data.code);
                    console.log(res.data.description);
                }
    
            } catch (error) {
                console.log(error);             
            }
        },
        async create(news) {
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.post(`${baseUrl}/v1/news/add`, news, {
                    headers: {
                        "menuCode": "OPER106",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });

                this.res_code = res.data.code;
                
                if(res.data.code === 'WA00000'){
                    console.log(res.data.data);

                    console.log(res.data.code);
                    console.log(res.data.description);

                    if(this.state_search_data){
                        this.getSearchNewses(this.state_search_data);
                    } else {
                        console.log(res.data.code);
                        console.log(res.data.description);
                    }

                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    this.res_desc = res.data.description;
                }
    
            } catch (error) {
                console.log(error);             
            }
        },
        async getById(id) {
            this.news = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                const get_news = {};
                                
                const res = await axios.get(`${baseUrl}/v1/list-news/${id}`, {
                    headers: {
                        "menuCode": "OPER106",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){

                    get_news["newsId"] = res.data.data.newsList[0].newsId;
                    get_news["newsTitle"] = res.data.data.newsList[0].newsTitle;
                    get_news["newsType"] = res.data.data.newsList[0].newsType;
                    get_news["newsDetails"] = res.data.data.newsList[0].newsDetails;
                    get_news["newsStatus"] = res.data.data.newsList[0].newsStatus;
                    get_news["createDate"] = res.data.data.newsList[0].createDate;
                    get_news["createBy"] = res.data.data.newsList[0].createBy;

                    get_news["newsPictureFileName"] = res.data.data.newsList[0].newsPictureFileName;
                    get_news["imageBase64"] = res.data.data.newsList[0].imageBase64;

                    if (get_news["imageBase64"].startsWith('/9j/')) {
                        get_news["base64Image"] = 'data:image/jpeg;base64,' + res.data.data.newsList[0].imageBase64;
                    } else if (get_news["imageBase64"].startsWith('iVBOR')){
                        get_news["base64Image"] = 'data:image/png;base64,' + res.data.data.newsList[0].imageBase64;
                    } else {
                        get_news["base64Image"] = null;
                    }
                    
                    this.news = get_news;
                    
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    console.log(error);
                }
    
            } catch (error) {
                console.log(error);             
            }
        },
        async preview(id) {
            this.course = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                                
                const res = await axios.get(`${baseUrl}/v1/news-download?newsId=${id}`, {
                    headers: {
                        "menuCode": "OPER106",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    },
                    responseType: 'blob',
                });

                // console.log(res.data);
                window.open(URL.createObjectURL(res.data));

                if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } 
                
    
            } catch (error) {
                console.log(error);             
            }
        },
        async update(news) {
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.post(`${baseUrl}/v1/news/update`, news, {
                    headers: {
                        "menuCode": "OPER106",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                this.res_code = res.data.code;
                
                if(res.data.code === 'WA00000'){
                    console.log(res.data.data);

                    if(this.state_search_data){
                        this.getSearchNewses(this.state_search_data);
                    }
                    
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    this.res_desc = res.data.description;
                }
    
            } catch (error) {
                console.log(error);             
            }
        },
        async delete(id) {
            // add isDeleting prop to courses being deleted
            this.newses.newsList.find(x => x.newsId === id).isDeleting = true;

            try {
                const authStore = useAuthStore();
                const alertStore = useAlertStore();
                const username = authStore.user.data.username;

                const deleteId = JSON.stringify({"newsId": `${id}`});
                
                const res = await axios.post(`${baseUrl}/v1/news/delete`, deleteId, {
                    headers: {
                        "menuCode": "OPER106",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });

                this.res_code = res.data.code;
                let message;
                
                if(res.data.code === 'WA00000'){
                    console.log(res.data.data);
                    message = "ลบข่าวสารเสร็จสิ้น";
                    alertStore.success(message);

                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                }  else {
                    console.log(res.data.code);
                    console.log(res.data.description);
                }
    
            } catch (error) {
                console.log(error);             
            }

            // remove courses from list after deleted
            this.newses = this.newses.newsList.filter(x => x.deleteId !== id);

            if(this.state_search_data){
                this.getSearchNewses(this.state_search_data);
            } else {
                this.getAllNewses();
            } 
        },
        async refreshData() {
            try {
                this.newses = {}
            } catch (error) {
                console.log(error);             
            }
        },
        async refreshStateSearch() {
            try {
                this.state_search_data = {}
            } catch (error) {
                console.log(error);             
            }
        }
    }
});
