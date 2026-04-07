<script setup>
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
</script>

<template>
    <nav class="navbar bg-base-200 shadow-lg z-50 fixed top-0 w-full" v-if="user">
        <div class="flex-none"> 
            <!-- <label tabindex="0" class="btn btn-ghost btn-circle avatar">
                <div class="w-9 rounded-full">
                    <router-link to="/" class="nav-item nav-link">
                        <img src="@/assets/images/ss.svg"/>
                    </router-link>
                </div>
            </label> -->
        </div>
        <div class="logo-text flex-none hidden lg:flex">
            <router-link to="/" class="normal-case text-lg font-semibold mx-3 text-white">
                Smart Seaman
            </router-link>
        </div>
        <div class="flex-1">
            <button class="btn btn-sm btn-square btn-ghost toggle-sidebar ml-5" @click="toggleSidebar" >
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-align-center status_toggle middle" id="sidebar-toggle"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>
            </button>
        </div>
       <div class="navbar-end">
            <!-- <button class="btn btn-sm btn-ghost btn-square mx-3 hover:bg-primary-light">
                <div class="indicator">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-bell"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path></svg>
                    <span class="badge badge-xs badge-primary indicator-item p-[3px] h-[8px]"></span>
                </div>
            </button> -->
            <button @click="authStore.logout()" class="btn btn-sm bg-primary-light text-white border-0 px-5 hover:bg-primary btn-logout" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-log-out">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span class="ml-3 text-primary">
                    ออกจากระบบ
                </span>
            </button>
        </div>
    </nav>
</template>

<script>
export default {
    data() {
        return {
            isOpen: true 
        }
    },

    methods: {
        toggleSidebar(isOpen) {
            this.isOpen = !this.isOpen;
            this.emitter.emit("toggle-sidebar", this.isOpen);
        }
    },
}
</script>

<style lang="scss" scoped>
    .btn-logout{
        &:hover{
            span{
                color: #fff;
            }
        }
    }

    .logo-text{
        a{
            color: #fff;
        }
    }

    .toggle-sidebar{
        &:hover{
            background-color: rgba(217, 127, 61, 0.1);
        }

        svg{
            width: 20px;
            color: #d97f3d;
        }
    }
</style>
