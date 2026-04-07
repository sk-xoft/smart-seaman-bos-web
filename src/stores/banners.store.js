import { defineStore } from 'pinia';
import axios from "axios";
import { fetchWrapper } from '@/helpers';
import { useAuthStore, useAlertStore } from '@/stores';
import { uuid } from 'vue-uuid';

const baseUrl = import.meta.env.VITE_BASE_URL_API;

export const useBannersStore = defineStore({
    id: 'banners',
    state: () => ({
        banners: {},
        banner: {},
        res_code: '',
        res_desc: '',
        size: 20,
        lastNum: 20,
        currentPage: 1,
    }),
    actions: {
        async getAllBanners() {
            this.banners = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                const size = this.size;
                const lastNum = this.lastNum;
                
                const res = await axios.post(`${baseUrl}/v1/list-banner`, {size, lastNum}, {
                    headers: {
                        "menuCode": "OPER110",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){

                    this.banners = res.data.data;

                    if(!res.data.data.bannerList.length){
                        this.banners = null;
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
        
        async create(banner) {
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.post(`${baseUrl}/v1/banner/add`, banner, {
                    headers: {
                        "menuCode": "OPER110",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){
                    console.log(res.data.data);
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
        async getById(id) {
            this.course = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                const get_banner = {};
                                
                const res = await axios.get(`${baseUrl}/v1/list-banner/${id}`, {
                    headers: {
                        "menuCode": "OPER110",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){

                    get_banner["bannerId"] = res.data.data.bannerList[0].bannerId;
                    get_banner["bannerSeq"] = res.data.data.bannerList[0].bannerSeq;
                    get_banner["createDate"] = res.data.data.bannerList[0].createDate;
                    get_banner["createBy"] = res.data.data.bannerList[0].createBy;
                    get_banner["bannerName"] = res.data.data.bannerList[0].bannerName;
                    get_banner["bannerFromFile"] = res.data.data.bannerList[0].bannerFromFile;
                    get_banner["bannerBase64PDF"] = 'data:application/pdf;base64,' + res.data.data.bannerList[0].bannerFromFile;

                    this.banner = get_banner;
                    
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
                                
                const res = await axios.get(`${baseUrl}/v1/banner/preview/${id}`, {
                    headers: {
                        "menuCode": "OPER110",
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
        async update(banner) {
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.post(`${baseUrl}/v1/banner/update`, banner, {
                    headers: {
                        "menuCode": "OPER110",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){
                    console.log(res.data.data);
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
        async delete(id) {
            // add isDeleting prop to courses being deleted
            this.banners.bannerList.find(x => x.bannerId === id).isDeleting = true;

            try {
                const authStore = useAuthStore();
                const alertStore = useAlertStore();
                const username = authStore.user.data.username;

                const deleteId = JSON.stringify({"bannerId": `${id}`});
                
                const res = await axios.post(`${baseUrl}/v1/banner/delete`, deleteId, {
                    headers: {
                        "menuCode": "OPER110",
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
                    message = "ลบแบนเนอร์เสร็จสิ้น";
                    alertStore.success(message);

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

            // remove courses from list after deleted
            this.banners = this.banners.bannerList.filter(x => x.deleteId !== id);
            this.getAllBanners();
        },
        async refreshData() {
            try {
                this.banners = {}
            } catch (error) {
                console.log(error);             
            }
        }
    }
});
