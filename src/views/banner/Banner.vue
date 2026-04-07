<script setup>
import { Alert } from '@/components';
import { storeToRefs } from 'pinia';
import { useAuthStore, useBannersStore } from '@/stores';

import Title from './partial/_title.vue';
import Breadcrumb from './partial/_breadcrumb.vue';
import ConfirmPopup from './partial/_confirm_popup.vue';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const bannersStore = useBannersStore();
const { banners, size, lastNum, currentPage } = storeToRefs(bannersStore);

bannersStore.getAllBanners();

function handlePageChanged(page) {
    bannersStore.currentPage = page;
    bannersStore.lastNum = bannersStore.size * page;

    bannersStore.getAllBanners();
}

</script>

<template>
    <Alert/>
    <Title title="โฆษณาแบนเนอร์" />
    <Breadcrumb link_menu="/banner" name_menu="โฆษณาแบนเนอร์" title="ค้นหา" />

    <div class="flex justify-end mb-3">
        <router-link class="btn btn-sm px-5 btn-primary mb-2" :to="`/banner/add`">
            <i class="fa fa-plus mr-3 text-xl"></i>
            เพิ่ม
        </router-link>
    </div>
    <div class="card overflow-x-auto bg-base-200">
        <div class="card-body">
            <h3 class="text-xl text-white font-semibold mb-3">ผลการค้นหา</h3>
            <table class="table table-striped w-full rounded-none text-center">
                <thead>
                    <tr>
                        <th class="bg-base-300">ลำดับที่</th>
                        <th class="bg-base-300">ชื่อแบนเนอร์</th>
                        <th class="bg-base-300">วันที่เพิ่ม</th>
                        <th class="bg-base-300">เพิ่มโดย</th>
                        <th class="bg-base-300">รูปแบนเนอร์</th>
                        <th class="bg-base-300">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-if="banners">
                        <tr v-for="banner in banners.bannerList" :key="banner.id">
                            <td class="whitespace-normal">{{ banner.bannerNum }}</td>
                            <td class="whitespace-normal">{{ banner.bannerName }}</td>
                            <td class="whitespace-normal">{{ convertDateFormat(banner.createDate) }}</td>
                            <td class="whitespace-normal">{{ banner.createBy ? banner.createBy : '-' }}</td>
                            <td class="whitespace-normal text-center"><button class="btn btn-sm btn-primary" @click="bannersStore.preview(banner.bannerId)"><i class="fa fa-eye"></i></button></td>
                            <td style="white-space: nowrap">
                                <label for="onDelete" @click="passId(banner.bannerId)" class="btn btn-sm btn-danger btn-delete-user" :disabled="banner.isDeleting">
                                    <span><i class="fa-solid fa-trash"></i></span>
                                </label>
                            </td>
                        </tr>
                        <tr v-if="banners.loading">
                        <td colspan="9" class="text-center">
                            <svg class="animate-spin h-9 w-9 text-white m-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </td>
                    </tr>
                    <tr v-if="banners.error">
                        <td colspan="9" class="text-center">
                            <div class="text-danger">เกิดข้อผิดพลาดไม่สามารถโหลดข้อมูลข่าวสารได้ : {{banners.error}}</div>
                        </td>
                    </tr>
                    <tr v-if="Object.keys(banners).length === 0">
                        <td colspan="9" class="text-center">
                            ไม่มีข้อมูล
                        </td>
                    </tr>
                </template>
                <template v-else>
                    <tr>
                        <td colspan="9" class="text-center">
                            ไม่มีข้อมูล
                        </td>
                    </tr>
                </template>
                </tbody>
            </table>

            <template v-if="banners">
                <template v-if="banners.totalData > 20">
                    <VueTailwindPagination class="pagination"
                        :current="currentPage"
                        :total="banners.totalData"
                        :per-page="size"
                        @page-changed="handlePageChanged($event)"
                    />
                </template>
            </template>

        </div>
    </div>
    <ConfirmPopup :id="itemId"/>
</template>

<script>
import '@ocrv/vue-tailwind-pagination/styles'
import VueTailwindPagination from '@ocrv/vue-tailwind-pagination'
import { storeToRefs } from 'pinia';
import { useBannersStore } from '@/stores';

export default {
    components: {
        VueTailwindPagination,
    },
    data() {
        return {
            itemId: 0,
            banners: null,
        }
    },

    methods: {
        passId(id) {
            this.itemId = id
        },
        convertDateFormat(isoDate){
            const date = new Date(isoDate);
            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const year = date.getFullYear().toString();

            const convertedDateString = `${day}/${month}/${year}`;

            return convertedDateString;
        },
    },
}
</script>