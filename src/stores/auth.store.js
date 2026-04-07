import { defineStore } from 'pinia';

import { fetchWrapper } from '@/helpers';
import { router } from '@/router';
import { useAlertStore } from '@/stores';
import { uuid } from 'vue-uuid';
import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL_API;

export const useAuthStore = defineStore({
    id: 'auth',
    state: () => ({
        // initialize state from local storage to enable user to stay logged in
        user: JSON.parse(localStorage.getItem('user')),
        returnUrl: null
    }),
    actions: {
        async login(username, password) {
            try {
                const res = await axios.post(`${baseUrl}/v1/login`, {username, password}, {
                    headers: {
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                    }
                });
                
                if(res.data.code === 'WA00000'){
                    // update pinia state
                    this.user = res.data;

                    // store user details and jwt in local storage to keep user logged in between page refreshes
                    localStorage.setItem('user', JSON.stringify(res.data));

                    // redirect to previous url or default to home page
                    router.push(this.returnUrl || '/');
                } else {
                    const alertStore = useAlertStore();
                    alertStore.error(res.data.description);  
                }

            } catch (error) {
                const alertStore = useAlertStore();
                alertStore.error(error);                
            }
        },
        
        logout() {
            this.user = null;
            localStorage.clear();
            // localStorage.removeItem('user');
            // localStorage.removeItem('menus');
            // localStorage.removeItem('menus_operation');
            // localStorage.removeItem('menus_system');
            // localStorage.removeItem('img_profile');
            // localStorage.removeItem('profile_detail');
            // localStorage.removeItem('state_dashboard');
            
            router.push('/account/login');
        }
    }
});
