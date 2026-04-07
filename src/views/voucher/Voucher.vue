<script setup>
import { Form, Field } from "vee-validate";
import { Alert } from '@/components';
import { storeToRefs } from 'pinia';
import { useAuthStore, useVoucherStore } from '@/stores';

import Title from './partial/_title.vue';
import Breadcrumb from './partial/_breadcrumb.vue';
import ConfirmPopup from './partial/_confirm_popup.vue';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const voucherStore = useVoucherStore();
const { vouchers, state_search_data, perPage } = storeToRefs(voucherStore);

voucherStore.refreshData();
voucherStore.refreshStateSearch();

async function onSubmit(values) {
  try {
    if( !values.voucherTitle ){
        values.voucherTitle = null;
    }
    
    voucherStore.getSearchVouchers(values);
  } catch (error) {
      console.log(error);
  }
}

</script>

<template>
    <Alert/>
    <Title title="สิทธิประโยชน์" />
    <Breadcrumb link_menu="/voucher" name_menu="สิทธิประโยชน์" title="ค้นหา" />

    <div class="card bg-base-200 my-7">
        <div class="card-body p-5 pb-9">
            <h3 class="text-lg text-white font-semibold mb-3">เงื่อนไขในการค้นหา</h3>
            <Form
                @submit="onSubmit"
                ref="form"
                :initial-values="state_search_data"
                v-slot="{ isSubmitting }"
            >

                <Field type="hidden" id="size" name="size" v-model="size" />
                <Field type="hidden" id="lastNum" name="lastNum" v-model="lastNum" />

                <div class="flex flex-col lg:flex-row justify-evenly items-center gap-7 w-full">
                        <label for="search" class="flex flex-col w-full">
                            <span class="mb-2">หัวข้อสิทธิประโยชน์</span>
                            <Field
                                id="voucherTitle"
                                name="voucherTitle"
                                type="text"
                                placeholder="ทั้งหมด"
                                class="placeholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent"
                            />
                        </label>

                        <button class="btn btn-sm px-5 btn-primary mb-2 m-auto mt-7" :disabled="isSubmitting">
                        <i class="fa fa-search mr-3 text-normal"></i>
                        <span
                            v-show="isSubmitting"
                            class="spinner-border spinner-border-sm mr-1"
                        ></span>
                        <span class="text-normal">ค้นหา</span>
                    </button>
                </div>
            </Form>
        </div>
    </div>

    <div class="flex justify-end mb-3">
        <router-link class="btn btn-sm px-5 btn-primary mb-2" :to="`/voucher/add`">
            <i class="fa fa-plus mr-3 text-xl"></i>
            เพิ่ม
        </router-link>
    </div>
    <div class="card overflow-x-auto bg-base-200">
        <div class="card-body">
            <h3 class="text-xl text-white font-semibold mb-3">ผลการค้นหา</h3>
            <table class="table table-striped w-full rounded-none text-center">
            <thead class="text-center">
                <tr>
                    <th class="bg-base-300 w-14">ลำดับที่</th>
                    <th class="bg-base-300">หัวข้อสิทธิประโยชน์</th>
                    <th class="bg-base-300">Smart Seaman ID</th>
                    <th class="bg-base-300">วันที่สร้าง</th>
                    <th class="bg-base-300 w-28">Actions</th>
                </tr>
            </thead>
            <tbody class="text-center">
                <template v-if="vouchers">
                    <tr v-for="voucher in vouchers.voucherList" :key="voucher.id">
                        <td class="whitespace-normal w-14 p-3">{{ voucher.voucherSeq }}</td>
                        <td class="whitespace-normal p-3">{{ voucher.voucherTitle }}</td>
                        <td class="whitespace-normal p-3">
                            <template v-if="voucher.voucherSmartSeamanId != ''">
                                <span>{{ voucher.voucherSmartSeamanId }}</span>
                            </template>
                            <template v-else >
                                <template v-if="voucher.voucherType === 'GLOBAL'">
                                    <span>ทั้งหมด</span>
                                </template>
                                <template v-else>
                                    <span>{{ voucher.voucherType }}</span>
                                </template>
                            </template>
                        </td>
                        <td class="whitespace-normal">{{ convertDateFormat(voucher.createDate) }}</td>
                        <td class="w-28 p-3" style="white-space: nowrap">
                            <label for="onDelete" @click="passId(voucher.voucherId)" class="btn btn-sm btn-danger btn-delete-user" :disabled="voucher.isDeleting">
                                <span><i class="fa-solid fa-trash"></i></span>
                            </label>
                        </td>
                    </tr>
                    <tr v-if="vouchers.loading">
                        <td colspan="9" class="text-center">
                            <svg class="animate-spin h-9 w-9 text-white m-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </td>
                    </tr>
                    <tr v-if="vouchers.error">
                        <td colspan="9" class="text-center">
                            <div class="text-danger">เกิดข้อผิดพลาดไม่สามารถโหลดข้อมูลข่าวสารได้ : {{vouchers.error}}</div>
                        </td>
                    </tr>
                    <tr v-if="Object.keys(vouchers).length === 0">
                        <td colspan="9" class="text-center">
                            <!-- ไม่มีข้อมูล -->
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

        <template v-if="vouchers">
            <template v-if="vouchers.countList > 20">
                <VueTailwindPagination class="pagination"
                    :current="currentPage"
                    :total="vouchers.countList"
                    :per-page="perPage"
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

export default {
    components: {
        VueTailwindPagination,
    },
    data() {
        return {
            itemId: 0,
            vouchers: null,
            currentPage: 1,
            size: 20,
            lastNum: 20,
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
        handlePageChanged(page) {
            this.currentPage = page;
            this.lastNum = this.size * page;

            this.submitForm();
        },
        handleSearch() {
            this.currentPage = 1;
            this.lastNum = 20;
        },
        submitForm() {
            this.$nextTick(() => {
                this.$refs.form.$el.dispatchEvent(new Event('submit'));
            });
        },
    }
}
</script>