import { defineStore } from 'pinia';
import axios from "axios";
import { fetchWrapper } from '@/helpers';
import { useAuthStore, useAlertStore } from '@/stores';
import { uuid } from 'vue-uuid';

const baseUrl = import.meta.env.VITE_BASE_URL_API;

export const useRolesStore = defineStore({
    id: 'roles',
    state: () => ({
        roles: {},
        role: {},
        row_tables: {},
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
        async fetchRowTable() {
            this.row_tables = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.get(`${baseUrl}/v1/master/menu`, {
                    headers: {
                        "menuCode": "SYST102",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){
                    this.row_tables = res.data.data;

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
        async getAllRoles() {
            this.roles = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                const size = this.size;
                const lastNum = this.lastNum;
                
                const res = await axios.post(`${baseUrl}/v1/list-group`, {size, lastNum}, {
                    headers: {
                        "menuCode": "SYST102",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){

                    this.roles = res.data.data;

                    if(!res.data.data.groupList.length){
                        this.roles = null;
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
        async getSearchRoles(searchData) {
            this.roles = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.post(`${baseUrl}/v1/list-group`, searchData, {
                    headers: {
                        "menuCode": "SYST102",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });

                if(res.data.code === 'WA00000'){

                    this.roles = res.data.data;
                    this.state_search_data = searchData;

                    if(!res.data.data.groupList.length){
                        this.roles = null;
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
        async create(role) {
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;

                const res = await axios.post(`${baseUrl}/v1/group/add`, role, {
                    headers: {
                        "menuCode": "SYST102",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });

                console.log(res);

                this.res_code = res.data.code;
                
                if(res.data.code === 'WA00000'){
                    console.log(res.data.data);

                    console.log(res.data.code);
                    console.log(res.data.description);

                    let roleObject = JSON.parse(role);
                    roleObject.groupAuthor.groupId = res.data.data.groupId;
                
                    let role_detail = roleObject.groupAuthor;
                    this.create_detail(role_detail);

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
        },
        async create_detail(role_detail) {
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;

                const res = await axios.post(`${baseUrl}/v1/group/add-detail`, role_detail, {
                    headers: {
                        "menuCode": "SYST102",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });

                console.log(res);

                this.res_code = res.data.code;
                
                if(res.data.code === 'WA00000'){
                    console.log(res.data.data);

                    console.log(res.data.code);
                    console.log(res.data.description);

                    if(this.state_search_data){
                        this.getSearchRoles(this.state_search_data);
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
                    console.log(res.data.code);
                    console.log(res.data.description);
                }
    
            } catch (error) {
                console.log(error);             
            }
        },
        async getById(id) {
            this.role = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                const get_role = {};
                                
                const res = await axios.get(`${baseUrl}/v1/list-group/${id}`, {
                    headers: {
                        "menuCode": "SYST102",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){

                    get_role["groupId"] = res.data.data.groupList[0].groupId;
                    get_role["groupName"] = res.data.data.groupList[0].groupName;
                    get_role["groupStatus"] = res.data.data.groupList[0].groupStatus;

                    const menuIds = [];

                    for (const menuId of res.data.data.menuAuthorlist) {
                        menuIds.push(menuId.menuId);
                    }

                    get_role["menuId"] = menuIds;
                    
                    this.role = get_role;
                    
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    console.log(res.data.data);

                    console.log(res.data.code);
                    console.log(res.data.description);
                }
    
            } catch (error) {
                console.log(error);             
            }
        },
        async update(role) {
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.post(`${baseUrl}/v1/group/update`, role, {
                    headers: {
                        "menuCode": "SYST102",
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

                    if(Object.keys(this.state_search_data).length !== 0){
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
                    console.log(res.data.code);
                    console.log(res.data.description);
                }
    
            } catch (error) {
                console.log(error);             
            }
        },
        async delete(id) {
            // add isDeleting prop to courses being deleted
            this.roles.groupList.find(x => x.groupId === id).isDeleting = true;

            try {
                const authStore = useAuthStore();
                const alertStore = useAlertStore();
                const username = authStore.user.data.username;

                const deleteId = JSON.stringify({"groupId": `${id}`});
                
                const res = await axios.post(`${baseUrl}/v1/group/delete`, deleteId, {
                    headers: {
                        "menuCode": "SYST102",
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
                    message = "ลบบทบาทผู้ใช้เสร็จสิ้น";
                    alertStore.success(message);
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else if (res.data.code === 'WA00027'){
                    console.log('กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
                    authStore.logout();
                } else {
                    message = res.data.description;
                    alertStore.error(message);
                    console.log(res.data.code);
                    console.log(res.data.description);
                }
    
            } catch (error) {
                console.log(error);             
            }

            // remove courses from list after deleted
            this.roles = this.roles.groupList.filter(x => x.deleteId !== id);

            if(this.state_search_data){
                this.getSearchRoles(this.state_search_data);
            } else {
                this.getAllRoles();
            } 
        },
        async refreshData() {
            try {
                this.roles = {}
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
