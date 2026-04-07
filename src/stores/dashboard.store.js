import { defineStore } from 'pinia';
import axios from "axios";
import { fetchWrapper } from '@/helpers';
import { useAuthStore } from '@/stores';
import { uuid } from 'vue-uuid';

const baseUrl = import.meta.env.VITE_BASE_URL_API;

export const useDashboardsStore = defineStore({
    id: 'dashboards',
    state: () => ({
        all_user: '',
        less_three: '',
        less_six: '',
        less_year: '',
        dashboard_details: {},
        all_detail_user: {},
        dashboard: {},
        currentPage: 1,
        size: 20,
        lastNum: 20,
        currentPageLess: 1,
        sizeLess: 20,
        lastNumLess: 20,
    }),
    actions: {
        async getAllUser() {
            this.all_user = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.get(`${baseUrl}/v1/get-all-user`, {
                    headers: {
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){

                    this.all_user = res.data.data;
                    
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    console.log(res.data.code);
                    console.log(res.data.description);
                }
    
            } catch (error) {
                console.log(error);             
            }
        },

        async getAllDetailUser() {
            this.all_detail_user = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                const size = this.size;
                const lastNum = this.lastNum;
                                
                const res = await axios.post(`${baseUrl}/v1/list-mobile-user/all`, {size, lastNum}, {
                    headers: {
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });

                if(res.data.code === 'WA00000'){

                    this.all_detail_user = res.data.data;

                    console.log(res.data.data);

                    if(!res.data.data.items.length){
                        this.all_detail_user = null;
                    }
                    
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    console.log(res.data.code);
                    console.log(res.data.description);
                }
    
            } catch (error) {
                console.log(error);             
            }
        },

        async getLessThree() {
            this.less_three = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.get(`${baseUrl}/v1/get-less-three`, {
                    headers: {
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){

                    this.less_three = res.data.data;
                    
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    console.log(res.data.code);
                    console.log(res.data.description);
                }
    
            } catch (error) {
                console.log(error);             
            }
        },

        async getLessSix() {
            this.less_six = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.get(`${baseUrl}/v1/get-less-six`, {
                    headers: {
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){

                    this.less_six = res.data.data;
                    
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    console.log(res.data.code);
                    console.log(res.data.description);
                }
    
            } catch (error) {
                console.log(error);             
            }
        },

        async getLessYear() {
            this.less_year = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.get(`${baseUrl}/v1/get-less-year`, {
                    headers: {
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){

                    this.less_year = res.data.data;
                    
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    console.log(res.data.code);
                    console.log(res.data.description);
                }
    
            } catch (error) {
                console.log(error);             
            }
        },
        
        async getDashboardDetail(id) {
            this.dashboard_details = { loading: true };

            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                const size = this.sizeLess;
                const lastNum = this.lastNumLess;
                                
                const res = await axios.post(`${baseUrl}/v1/list-mobile-user/${id}`, {size, lastNum }, {
                    headers: {
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });

                if(res.data.code === 'WA00000'){
                    this.dashboard_details = res.data.data;

                    console.log(res.data.data);

                    if(!res.data.data.items.length){
                        this.dashboard_details = null;
                    }
                    
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    console.log(res.data.code);
                    console.log(res.data.description);
                }
    
            } catch (error) {
                console.log(error);             
            }
        },

        async refreshData() {
            try {
                this.dashboard_details = {};
                this.currentPageLess = 1;
                this.sizeLess = 20;
                this.lastNumLess = 20;
            } catch (error) {
                console.log(error);             
            }
        },

        async refreshAllDataTable(){
            try {
                this.currentPage = 1;
                this.size = 20;
                this.lastNum = 20;
            } catch (error) {
                console.log(error);             
            }
        },

        async refreshLessDataTable(){
            try {
                this.currentPageLess = 1;
                this.sizeLess = 20;
                this.lastNumLess = 20;
            } catch (error) {
                console.log(error);             
            }
        }
    }
});
