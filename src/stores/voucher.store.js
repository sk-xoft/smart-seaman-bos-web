import { defineStore } from 'pinia';
import axios from "axios";
import { fetchWrapper } from '@/helpers';
import { useAuthStore, useAlertStore } from '@/stores';
import { uuid } from 'vue-uuid';

const baseUrl = import.meta.env.VITE_BASE_URL_API;

export const useVoucherStore = defineStore({

    id: 'vouchers',
    state: () => ({
        vouchers: {},
        voucher: {},
        res_code: '',
        res_desc: '',
        option_smart_seaman_id: {},
        state_seach_data: {},
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
        async getAllVouchers() {
            this.vouchers = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                const size = this.size;
                const lastNum = this.lastNum;
                
                const res = await axios.post(`${baseUrl}/v1/vouchers`, {size, lastNum}, {
                    headers: {
                        "menuCode": "OPER107",
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
                    this.vouchers = res.data.data;

                    if(!res.data.data.voucherList.length){
                        this.vouchers = null;
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
        async getSearchVouchers(searchData) {
            this.vouchers = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.post(`${baseUrl}/v1/vouchers`, searchData, {
                    headers: {
                        'menuCode': 'OPER107',
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                this.res_code = res.data.code;
                this.state_seach_data = searchData;
                
                if(res.data.code === 'WA00000'){
                    this.vouchers = res.data.data;

                    if(!res.data.data.voucherList.length){
                        this.vouchers = null;
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
        async create(voucher) {
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.post(`${baseUrl}/v1/vouchers/add`, voucher, {
                    headers: {
                        "menuCode": "OPER107",
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

                    if(this.state_seach_data){
                        this.getSearchVouchers(this.state_seach_data);
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
        async delete(id) {
            // add isDeleting prop to courses being deleted
            this.vouchers.voucherList.find(x => x.voucherId === id).isDeleting = true;

            try {
                const authStore = useAuthStore();
                const alertStore = useAlertStore();
                const username = authStore.user.data.username;

                // const deleteId = JSON.stringify({"voucherId": `${id}`});
                
                const res = await axios.delete(`${baseUrl}/v1/vouchers/delete?voucherId=${id}`, {
                    headers: {
                        "menuCode": "OPER107",
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
                    message = "ลบสิทธิประโยชน์เสร็จสิ้น";
                    alertStore.success(message);

                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    this.res_desc = res.data.description;

                    console.log(res.data.code);
                    console.log(res.data.description);
                }
    
            } catch (error) {
                console.log(error);             
            }

            // remove courses from list after deleted
            this.vouchers = this.vouchers.voucherList.filter(x => x.deleteId !== id);
            
            if(this.state_seach_data){
                this.getSearchVouchers(this.state_seach_data);
            } else {
                this.getAllVouchers();
            }  
            
        },
        async fetchOptionSmartSeamanId() {
            this.option_smart_seaman_id = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                const get_option = {};
                
                const res = await axios.get(`${baseUrl}/v1/smartseaman-code-list`, {
                    headers: {
                        "menuCode": "OPER107",
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
                    this.option_smart_seaman_id = res.data.data;

                    // this.option_smart_seaman_id = (this.option_smart_seaman_id).map(item => {
                    //     return {
                    //         name: item.fullName,
                    //         code: item.smartseamanId,
                    //     };
                    // });

                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    this.res_desc = res.data.description;
                    console.log(res.data.description);
                }
    
            } catch (error) {
                console.log(error);             
            }
        },
        async refreshData() {
            try {
                this.vouchers = {}
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
