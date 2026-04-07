import { defineStore } from 'pinia';
import axios from "axios";
import { fetchWrapper } from '@/helpers';
import { useAuthStore, useAlertStore } from '@/stores';
import { uuid } from 'vue-uuid';

const baseUrl = import.meta.env.VITE_BASE_URL_API;

export const useFormsStore = defineStore({
    id: 'forms',
    state: () => ({
        forms: {},
        form: {},
        res_code: '',
        res_desc: '',
        size: 20,
        lastNum: 20,
        currentPage: 1,
    }),
    actions: {
        async getAllForms() {
            this.forms = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                const size = this.size;
                const lastNum = this.lastNum;
                
                const res = await axios.post(`${baseUrl}/v1/list-form`, {size, lastNum}, {
                    headers: {
                        "menuCode": "OPER108",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){

                    this.forms = res.data.data;

                    if(!res.data.data.formList.length){
                        this.forms = null;
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
        
        async create(form) {
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.post(`${baseUrl}/v1/form/add`, form, {
                    headers: {
                        "menuCode": "OPER108",
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
            this.form = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                const get_form = {};
                                
                const res = await axios.get(`${baseUrl}/v1/list-form/${id}`, {
                    headers: {
                        "menuCode": "OPER108",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){

                    get_form["formId"] = res.data.data.formList[0].formId;
                    get_form["createDate"] = res.data.data.formList[0].createDate;
                    get_form["createBy"] = res.data.data.formList[0].createBy;
                    get_form["formName"] = res.data.data.formList[0].formName;
                    get_form["formFileName"] = res.data.data.formList[0].formFileName;
                    get_form["fileBase64"] = res.data.data.formList[0].fileBase64;
                    get_form["fileBase64PDF"] = 'data:application/pdf;base64,' + res.data.data.formList[0].fileBase64;

                    this.form = get_form;
                    
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
            this.form = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                                
                const res = await axios.get(`${baseUrl}/v1/from-download?formId=${id}`, {
                    headers: {
                        "menuCode": "OPER108",
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
        async update(form) {
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.post(`${baseUrl}/v1/form/update`, form, {
                    headers: {
                        "menuCode": "OPER108",
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
        async delete(id) {
            // add isDeleting prop to courses being deleted
            this.forms.formList.find(x => x.formId === id).isDeleting = true;

            try {
                const authStore = useAuthStore();
                const alertStore = useAlertStore();
                const username = authStore.user.data.username;

                const deleteId = JSON.stringify({"formId": `${id}`});
                
                const res = await axios.post(`${baseUrl}/v1/form/delete`, deleteId, {
                    headers: {
                        "menuCode": "OPER108",
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
                    message = "ลบฟอร์มเสร็จสิ้น";
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
            this.forms = this.forms.formList.filter(x => x.deleteId !== id);
            this.getAllForms();
        }
    }
});
