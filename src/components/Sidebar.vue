<script setup>

import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore, useMenuStore } from '@/stores';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const menuStore = useMenuStore();
const { menus, menus_operation, menus_system, url_img_profile, profile } = storeToRefs(menuStore);

// menuStore.fetchMenus();

</script>

<template>
    <aside class="sidebar fixed h-screen top-16 z-20 w-1/5 bg-base-200" v-if="user">
        <div tabindex="0" class="avatar sidebar-user flex flex-col justify-center items-center p-5 border-b border-slate-700 mb-4">
            <div class="w-24 rounded-full mb-3">
                <template v-if="url_img_profile">
                    <template v-if="url_img_profile.loading">
                        <div class="text-center">
                            <svg class="animate-spin h-9 w-9 text-white m-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    </template>
                    <template v-else>
                        <template v-if="url_img_profile.startsWith('data:application/json;base64,')">
                            <span class="with-short-name">
                                {{profile?.shortName || 'U'}}
                            </span>
                        </template>
                        <template v-else>
                            <img :src="url_img_profile" />
                        </template>
                    </template>
                </template>
            </div>
            <!-- <h1 class="text-xl font-normal no-underline text-primary my-2">{{user.firstName}}</h1> -->
            <h1 class="text-lg font-normal no-underline text-primary">{{ user.data.username }}</h1>
            <span class="text-md font-light no-underline text-white">{{ profile?.roleName || 'User' }}</span>
        </div>
        <div class="menu-sidebar overflow-y-auto">
             <ul class="menu w-full">
                 <template v-if="menus_operation && menus_operation.length">
                     <div class="heading-menu -operation px-3 mb-3">
                        <h3 class="text-xl font-medium text-primary border-b py-3 border-slate-700">Operation</h3>
                    </div>

                     <template v-for="item in menus_operation" :key="item.id"> 
                        <li class="px-3">
                            <router-link
                                :to="item.menuUrl"
                                v-slot="{ isActive }"
                                >
                                <i class="fa" :class="[isActive && 'router-link-active', item.menuIcon]"></i>
                                {{item.menuNameTh}}
                            </router-link>
                        </li>
                    </template>
                 </template>
                <template v-if="menus_system && menus_system.length">
                    <div class="heading-menu -System px-3 mb-3">
                        <h3 class="text-xl font-medium text-primary border-b py-3 border-slate-700">System</h3>
                    </div>

                    <template v-for="item in menus_system" :key="item.id"> 
                        <li class="px-3">
                            <router-link
                                :to="item.menuUrl"
                                v-slot="{ isActive }"
                                >
                                <i class="fa" :class="[isActive && 'router-link-active', item.menuIcon]"></i>
                                {{item.menuNameTh}}
                            </router-link>
                        </li>
                    </template>
                </template>
             </ul>
        </div>
       
    </aside>
</template>

<script>
export default {
    name: 'sidebar',
    data() {
        return {
            operation: [
                { icon: 'fa-solid fa-house', message: 'แดชบอร์ด', url: '/' }, 
                { icon: 'fa-solid fa-sliders', message: 'จัดการข้อมูล Mobile User', 
                    manage_mobile_users: [
                        { icon: 'fa-solid fa-sliders', message: 'ประกาศนียบัตร' },
                        { icon: 'fa-solid fa-sliders', message: 'โปรไฟล์' },
                    ]
                }, 
                { icon: 'fa-solid fa-sliders', message: 'คอร์สอบรม' },
                { icon: 'fa-solid fa-sliders', message: 'ข่าวสาร' },
                { icon: 'fa-solid fa-sliders', message: 'สิทธิประโยชน์' },
                { icon: 'fa-solid fa-sliders', message: 'ฟอร์ม' },
                { icon: 'fa-solid fa-sliders', message: 'รายงาน' }],
            system: [
                { icon: 'fa-solid fa-sliders', message: 'จัดการผู้ดูแลระบบ', url: '/users' }, 
                { icon: 'fa-solid fa-sliders', message: 'จัดการบทบาท' }, 
                { icon: 'fa-solid fa-sliders', message: 'ข้อมูล', 
                    manage_data: [
                        { icon: 'fa-solid fa-sliders', message: 'ตารางประกาศนียบัตร' },
                        { icon: 'fa-solid fa-sliders', message: 'ตารางการฝึกอบรม' },
                        { icon: 'fa-solid fa-sliders', message: 'ตารางบริษัท' },
                        { icon: 'fa-solid fa-sliders', message: 'ตารางตำแหน่ง' },
                    ]
            }],
        }
    },
}

</script>

<style lang="scss" scoped>
    aside.sidebar{
        .menu-sidebar{
            height: calc(100vh - 18rem);
        }
    }
    .collapse-arrow {
        .collapse-title{
            &::after{
                right: 0.5rem;
            }
        }
    }

    .head-collapse{
        &:hover{
            .collapse-title{
                background-color: #d97f3d;
            }
        }
    }

    .with-short-name{
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        background-color: #d97f3d;
        color: #fff;
        font-size: 28px !important;
        font-weight: 500;
    }
</style>