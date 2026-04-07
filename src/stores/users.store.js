import { defineStore } from 'pinia';
import axios from "axios";
import { fetchWrapper } from '@/helpers';
import { useAuthStore, useAlertStore } from '@/stores';
import { uuid } from 'vue-uuid';


const baseUrl = import.meta.env.VITE_BASE_URL_API;

export const useUsersStore = defineStore({
    id: 'users',
    state: () => ({
        option_company: {},
        option_groups: {},
        users: {},
        user: {},
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
        async fetchOptionCompany() {
            this.option_company = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.get(`${baseUrl}/v1/master/`, {
                    headers: {
                        "menuCode": "SYST101",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){
                    this.option_company = res.data.data;
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
        async fetchOptionGroup() {
            this.option_groups = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.get(`${baseUrl}/v1/master/group-name`, {
                    headers: {
                        "menuCode": "SYST101",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){
                    this.option_groups = res.data.data;

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
        async getAllUsers() {
            this.users = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                const size = this.size;
                const lastNum = this.lastNum;
                
                const res = await axios.post(`${baseUrl}/v1/list-admin`, {size, lastNum}, {
                    headers: {
                        "menuCode": "SYST101",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){

                    this.users = res.data.data;

                    if(!res.data.data.adminUserList.length){
                        this.users = null;
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
        async getSearchUsers(searchData) {
            this.users = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.post(`${baseUrl}/v1/list-admin`, searchData, {
                    headers: {
                        "menuCode": "SYST101",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){

                    this.users = res.data.data;
                    this.state_search_data = searchData;

                    if(!res.data.data.adminUserList.length){
                        this.users = null;
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
        async create(user) {
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.post(`${baseUrl}/v1/admin/add`, user, {
                    headers: {
                        "menuCode": "SYST101",
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
                        this.getSearchUsers(this.state_search_data);
                    } else {
                        console.log(res.data.code);
                        console.log(res.data.description);
                    }
                    
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else if (res.data.code === 'WA00027'){
                    console.log('กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
                    authStore.logout();
                } else {
                    this.res_desc = res.data.description;
                    console.log(res.data.code);
                    console.log(res.data.description);
                }
    
            } catch (error) {
                console.log(error);             
            }
        },
        async getById(id) {
            this.users = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                const get_user = {};
                                
                const res = await axios.get(`${baseUrl}/v1/list-admin/${id}`, {
                    headers: {
                        "menuCode": "SYST101",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){

                    get_user["createDate"] = res.data.data.adminUserList[0].createDate;
                    get_user["createBy"] = res.data.data.adminUserList[0].createBy;
                    get_user["updateBy"] = res.data.data.adminUserList[0].updateBy;
                    get_user["updateDate"] = res.data.data.adminUserList[0].updateDate;
                    get_user["lastLogon"] = res.data.data.adminUserList[0].lastLogon;
                    get_user["adminUserId"] = res.data.data.adminUserList[0].adminUserId;
                    get_user["groupId"] = res.data.data.adminUserList[0].groupId;
                    get_user["username"] = res.data.data.adminUserList[0].username;
                    get_user["password"] = res.data.data.adminUserList[0].password;
                    get_user["confirmPassword"] = res.data.data.adminUserList[0].password;
                    get_user["firstName"] = res.data.data.adminUserList[0].firstName;
                    get_user["lastName"] = res.data.data.adminUserList[0].lastName;
                    get_user["companyCode"] = res.data.data.adminUserList[0].companyCode;
                    get_user["positions"] = res.data.data.adminUserList[0].positions;
                    get_user["email"] = res.data.data.adminUserList[0].email;
                    get_user["mobileNumber"] = res.data.data.adminUserList[0].mobileNumber;
                    get_user["displayName"] = res.data.data.adminUserList[0].displayName;
                    get_user["userStatus"] = res.data.data.adminUserList[0].userStatus;
                    get_user["adminRoleName"] = res.data.data.adminUserList[0].adminRoleName;
                    get_user["adminCompany"] = res.data.data.adminUserList[0].adminCompany;
                    
                    get_user["displayType"] = res.data.data.adminUserList[0].displayType;
                    get_user["profilePicture"] = res.data.data.adminUserList[0].profilePicture;
                    get_user["pictureFromFile"] = res.data.data.adminUserList[0].pictureFromFile;

                    if (get_user["pictureFromFile"].startsWith('/9j/')) {
                        get_user["pictureFromFile"] = 'data:image/jpeg;base64,' + res.data.data.adminUserList[0].pictureFromFile;
                    } else if (get_user["pictureFromFile"].startsWith('iVBOR')){
                        get_user["pictureFromFile"] = 'data:image/png;base64,' + res.data.data.adminUserList[0].pictureFromFile;
                    } else {
                        get_user["pictureFromFile"] = null;
                    }
                    
                    // if (get_user["imageBase64"].startsWith('/9j/')) {
                    //     get_user["base64Image"] = 'data:image/jpeg;base64,' + res.data.data.newsList[0].imageBase64;
                    // } else if (get_user["imageBase64"].startsWith('iVBOR')){
                    //     get_user["base64Image"] = 'data:image/png;base64,' + res.data.data.newsList[0].imageBase64;
                    // } else {
                    //     get_user["base64Image"] = null;
                    // }
                    
                    this.user = get_user;
                    
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
        async update(user) {
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.post(`${baseUrl}/v1/admin/update`, user, {
                    headers: {
                        "menuCode": "SYST101",
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
                        this.getSearchUsers(this.state_search_data);
                    } else {
                        console.log(res.data.code);
                        console.log(res.data.description);
                    }
                    
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else if (res.data.code === 'WA00027'){
                    console.log('กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
                    authStore.logout();
                } else {
                    this.res_desc = res.data.description;
                }
    
            } catch (error) {
                console.log(error);             
            }
        },
        async updatePassword(user_password) {
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.post(`${baseUrl}/v1/admin/update-password`, user_password, {
                    headers: {
                        "menuCode": "SYST101",
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
                        this.getSearchUsers(this.state_search_data);
                    } else {
                        console.log(res.data.code);
                        console.log(res.data.description);
                    }
                    
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else if (res.data.code === 'WA00027'){
                    console.log('กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
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
            this.users.adminUserList.find(x => x.adminUserId === id).isDeleting = true;

            try {
                const authStore = useAuthStore();
                const alertStore = useAlertStore();
                const username = authStore.user.data.username;

                const deleteId = JSON.stringify({"adminUserId": `${id}`});
                
                const res = await axios.post(`${baseUrl}/v1/admin/delete`, deleteId, {
                    headers: {
                        "menuCode": "SYST101",
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
                    message = "ลบบัญชีผู้ใช้เสร็จสิ้น";
                    alertStore.success(message);

                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else if (res.data.code === 'WA00027'){
                    console.log('กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
                    authStore.logout();
                } else {
                    console.log(res.data.code);
                    console.log(res.data.description);
                }
    
            } catch (error) {
                console.log(error);             
            }

            // remove courses from list after deleted
            this.users = this.users.adminUserList.filter(x => x.deleteId !== id);

            if(this.state_search_data){
                this.getSearchUsers(this.state_search_data);
            } else {
                this.getAllUsers();
            } 
        },
        async refreshData() {
            try {
                this.users = {}
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
