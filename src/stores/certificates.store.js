import { defineStore } from 'pinia';
import axios from "axios";
import { fetchWrapper } from '@/helpers';
import { useAuthStore, useAlertStore } from '@/stores';
import { uuid } from 'vue-uuid';
import { useRoute } from "vue-router";
import { router } from "@/router";

const baseUrl = import.meta.env.VITE_BASE_URL_API;

export const useCertificatesStore = defineStore({
    id: 'certificates',
    state: () => ({
        certificates: {},
        cots:{},
        docs:{},
        cot:{},
        doc:{},
        users_certificates: {},
        certificate: {},
        user_profile: {},
        url_img_profile: '',
        preview_file: '',
        user_uuid: '',
        get_doc_options: '',
        old_file: '',
        res_code: '',
        res_desc: '',
        state_tab: 1,
        
        perPage: 20,
        size: 20,
        lastNum: 20,

        currentPageCot: 1,
        sizeCot: 99999999,
        lastNumCot: 99999999,

        currentPageDoc: 1,
        sizeDoc: 99999999,
        lastNumDoc: 99999999,
    }),
    getters: {
        get_res_code: (state) => {
            return state.res_code
        },
        get_res_desc: (state) => {
            return state.res_desc
        },
        get_old_file: (state) => {
            return state.old_file
        },
    },
    actions: {
        async getAllCertsUsers() {
            this.users_certificates = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                const size = this.size;
                const lastNum = this.lastNum;
                
                const res = await axios.post(`${baseUrl}/v1/user-mobile/list`, {size, lastNum}, {
                    headers: {
                        "menuCode": "OPER103",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){

                    this.users_certificates = res.data.data;

                    if(!res.data.data.users.length){
                        this.users_certificates = null;
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
        async getAllCots() {
            this.cots = { loading: true };
            const mobileUserUuid = this.user_uuid;

            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                const size = this.sizeCot;
                const lastNum = this.lastNumCot;
                
                const res = await axios.post(`${baseUrl}/v1/cert-type-cot`, {size, lastNum, mobileUserUuid}, {
                    headers: {
                        "menuCode": "OPER103",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){
                    this.cots = res.data.data;
                    
                    if(!res.data.data.documentEntityList.length){
                        this.cots = null;
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
        async getAllDocs() {
            this.docs = { loading: true };
            const mobileUserUuid = this.user_uuid;

            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                const size = this.sizeDoc;
                const lastNum = this.lastNumDoc;
                
                const res = await axios.post(`${baseUrl}/v1/cert-type-document`, {size, lastNum, mobileUserUuid}, {
                    headers: {
                        "menuCode": "OPER103",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){
                    this.docs = res.data.data;
                    
                    if(!res.data.data.documentEntityList.length){
                        this.docs = null;
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
        async getSearchCertificates(searchData) {
            this.users_certificates = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.post(`${baseUrl}/v1/user-mobile/list`, searchData, {
                    headers: {
                        "menuCode": "OPER103",
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
                    this.users_certificates = res.data.data;
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
        async getUserProfile(id) {
            const route = useRoute();
            const mobileUserUuid = route.params.id;
            this.user_uuid = mobileUserUuid;

            this.user_profile = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.get(`${baseUrl}/v1/user-mobile/profile?mobileUUID=${id}`, {
                    headers: {
                        "menuCode": "OPER103",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){
                    this.user_profile = res.data.data;
                
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
        async getUserImageProfile(id) {
            this.url_img_profile = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.get(`${baseUrl}/v1/user-mobile/profile/image?mobileUUID=${id}`, {
                    headers: {
                        "menuCode": "OPER103",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    },
                    responseType: 'blob',
                });

                var urlCreator = window.URL || window.webkitURL;
                this.url_img_profile = urlCreator.createObjectURL(res.data);

                if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                }
    
            } catch (error) {
                console.log(error);             
            }
        },
        async preview(docid, id) {
            this.preview_file = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.get(`${baseUrl}/v1/cert-user-preview?certCode=${docid}&mobileUserUuid=${id}`, {
                    headers: {
                        "menuCode": "OPER103",
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
        async create(certificate) {
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.post(`${baseUrl}/v1/documents/certification/create`, certificate, {
                    headers: {
                        "menuCode": "OPER103",
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
        async fetchOptionDoc() {
            this.get_doc_options = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.get(`${baseUrl}/v1/master/documents`, {
                    headers: {
                        "menuCode": "OPER105",
                        'language': 'EN', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){
                    this.get_doc_options = res.data.data;
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
        async getCotById(certid, id) {
            this.cot = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                const get_cot = {};
                                
                const res = await axios.get(`${baseUrl}/v1/documents/certification/edit?certCode=${certid}&uUid=${id}`, {
                    headers: {
                        "menuCode": "OPER103",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){

                    get_cot["documentCode"] = res.data.data.documentCode;
                    get_cot["certStartDate"] = res.data.data.certStartDate;
                    get_cot["certEndDate"] = res.data.data.certEndDate;
                    get_cot["certEndDateType"] = res.data.data.certEndDateType;
                    get_cot["fileCertName"] = res.data.data.fileCertName;
                    get_cot["fileCert"] = res.data.data.fileBase64;
                    
                    this.cot = get_cot;
                    this.old_file = get_cot["fileCert"];
                    
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    console.log( res.data.code );
                    console.log( res.data.description );
                }
    
            } catch (error) {
                console.log(error);             
            }
        },
        async update(certificate) {
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.post(`${baseUrl}/v1/documents/certification/update`, certificate, {
                    headers: {
                        "menuCode": "OPER103",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });

                console.log(res.data.data);
                
                this.res_code = res.data.code;
                
                if(res.data.code === 'WA00000'){
                    console.log(res.data.data);
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
        async delete_doc(docid, uuId) {
            // add isDeleting prop to courses being deleted
            // this.cots.certificateList.find(x => x.certificateId === id).isDeleting = true;
            this.docs.documentEntityList.find(x => x.documentCode === docid).isDeleting = true;

            try {
                const authStore = useAuthStore();
                const alertStore = useAlertStore();
                const username = authStore.user.data.username;
                
                const res = await axios.delete(`${baseUrl}/v1/documents/certification/delete?certCode=${docid}&uUid=${uuId}`, {
                    headers: {
                        "menuCode": "OPER103",
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
                    message = "ลบเอกสารเสร็จสิ้น";
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
            this.docs = this.docs.documentEntityList.filter(x => x.documentCode !== docid);
            // this.cots = this.getAllCots();
            this.getAllDocs();
        },
        async delete_cot(cotid, uuId) {
            // add isDeleting prop to courses being deleted
            this.cots.documentEntityList.find(x => x.documentCode === cotid).isDeleting = true;

            try {
                const authStore = useAuthStore();
                const alertStore = useAlertStore();
                const username = authStore.user.data.username;
                
                const res = await axios.delete(`${baseUrl}/v1/documents/certification/delete?certCode=${cotid}&uUid=${uuId}`, {
                    headers: {
                        "menuCode": "OPER103",
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
                    message = "ลบประกาศนียบัตรเสร็จสิ้น";
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
            this.cots = this.cots.documentEntityList.filter(x => x.documentCode !== cotid);
            this.getAllCots();
        },
        async refreshData() {
            try {
                this.users_certificates = {}
            } catch (error) {
                console.log(error);
            }
        },
        async clearStateTab() {
            try {
                this.state_tab = 1;
            } catch (error) {
                console.log(error);
            }
        },
        async saveStateTab(active) {
            try {
                this.state_tab = active;
                return this.state_tab;
            } catch (error) {
                console.log(error);
            }
        },
        async getStateTab() {
            try {
                return this.state_tab;
            } catch (error) {
                console.log(error);
            }
        },
    }
});
