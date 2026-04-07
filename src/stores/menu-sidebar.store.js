import { defineStore } from 'pinia';
import axios from "axios";
import { uuid } from 'vue-uuid';
import { useAuthStore } from '@/stores';

const baseUrl = import.meta.env.VITE_BASE_URL_API;

export const useMenuStore = defineStore({
  id: 'menu',
  state: () => ({
    menus: JSON.parse(localStorage.getItem("menus")),
    menus_operation: JSON.parse(localStorage.getItem("menus_operation")),
    menus_system: JSON.parse(localStorage.getItem("menus_system")),
    url_img_profile: localStorage.getItem("img_profile"),
    profile: JSON.parse(localStorage.getItem("profile_detail")),
  }),
  actions: {
    async fetchMenus() {
      try {
            const authStore = useAuthStore();
            const username = authStore.user.data.username;
            
            const res = await axios.post(`${baseUrl}/v1/list-menu`, {username}, {
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
                // console.log(res);

                this.menus = res.data.data;
                let menus_operation = [];
                let menus_system = [];

                for (const prop in res.data.data.menu) {
                  if(res.data.data.menu[prop].menuGroup === 'OPERATION'){
                    menus_operation.push(res.data.data.menu[prop]);

                  } else {
                    menus_system.push(res.data.data.menu[prop]);
                  }
                }

                this.menus_operation = menus_operation;
                this.menus_system = menus_system;

                localStorage.setItem('menus', JSON.stringify(res.data.data));
                localStorage.setItem('menus_operation', JSON.stringify(menus_operation));
                localStorage.setItem('menus_system', JSON.stringify(menus_system));

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
    async getUserImageProfile() {
      this.user_img_profile = { loading: true };
      try {
          const authStore = useAuthStore();
          const username = authStore.user.data.username;
          
          const res = await axios.get(`${baseUrl}/v1/profile/pic`, {
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

          // var urlCreator = window.URL || window.webkitURL;
          // const data_img_profile = urlCreator.createObjectURL(res.data);
          // this.url_img_profile = data_img_profile;

          // localStorage.setItem('img_profile', data_img_profile );
          
          if(res.data){
            const profilePicBlob = res.data;

            // Convert Blob to base64 string
            const reader = new FileReader();
            reader.readAsDataURL(profilePicBlob);
            reader.onloadend = () => {
              var base64data = reader.result;

              this.url_img_profile = base64data;
              localStorage.setItem('img_profile', base64data );
            };
          }
          
          if (res.data.code === 'WA00007'){
            console.log('Session หมดอายุ');
            authStore.logout();
          }

      } catch (error) {
          console.log(error);             
      }
    },
    async fetchProfileDetail() {
      this.profile = { loading: true };
      try {
          const authStore = useAuthStore();
          const username = authStore.user.data.username;
          const get_profiles = {};
                          
          const res = await axios.get(`${baseUrl}/v1/profile`, {
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
              
              this.profile = res.data.data;

              localStorage.setItem('profile_detail', JSON.stringify(res.data.data));
              
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

  }
})