<script setup>
import { Form, Field } from "vee-validate";
import { Alert } from '@/components';
import { storeToRefs } from 'pinia';
import { useAuthStore, useCertificatesStore } from '@/stores';

import Title from './partial/_title.vue';
import Breadcrumb from './partial/_breadcrumb.vue';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const certificatesStore = useCertificatesStore();
const { users_certificates, state_tab, perPage } = storeToRefs(certificatesStore);

certificatesStore.refreshData();
certificatesStore.clearStateTab();

async function onSubmit(values) {
  try {
    if( !values.smartSeamanId && !values.firstName ){
        values.smartSeamanId = "#";
        values.firstName = "#";
    } else if ( !values.smartSeamanId && values.firstName ) {
        values.smartSeamanId = "";
    } else if ( values.smartSeamanId && !values.firstName ) {
        values.firstName = "";
    } else {
        values.smartSeamanId;
        values.firstName;
    }
    
    certificatesStore.getSearchCertificates(values);

  } catch (error) {
      console.log(error);
  }
}

</script>

<template>
    <Title title="จัดการประกาศนียบัตร" />
    <Breadcrumb link_menu="/certificates" name_menu="จัดการข้อมูลประกาศนียบัตร" title="ค้นหา" />
    
    <div class="card bg-base-200 my-7">
        <div class="card-body p-5 pb-9">
            <h3 class="text-xl text-white font-semibold mb-3">เงื่อนไขในการค้นหา</h3>
            <Form
                @submit="onSubmit"
                ref="form"
                v-slot="{ isSubmitting }"
            >
                <Field type="hidden" id="size" name="size" v-model="size" />
                <Field type="hidden" id="lastNum" name="lastNum" v-model="lastNum" />

                <div class="flex flex-col lg:flex-row justify-evenly items-center gap-7 w-full">
                    <label for="smartSeamanId" class="flex flex-col w-full">
                        <span class="mb-2">ค้นหาโดย Smart Seaman ID</span>
                        <Field
                            id="smartSeamanId"
                            name="smartSeamanId"
                            type="text"
                            placeholder="Smart Seaman ID"
                            class="placeholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent"
                        />
                    </label>
                    <label for="firstName" class="flex flex-col w-full">
                        <span class="mb-2">ค้นหาโดยชื่อ</span>
                        <Field
                            id="firstName"
                            name="firstName"
                            type="text"
                            placeholder="ชื่อ"
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
        
    <div class="card overflow-x-auto bg-base-200">
        <div class="card-body">
            <h3 class="text-xl text-white font-semibold mb-3">ผลการค้นหา</h3>
            <table class="table table-striped lg:table-fixed w-full rounded-none text-center">
            <thead>
                <tr>
                    <th class="bg-base-300 whitespace-normal w-14 p-3">ลำดับที่</th>
                    <th class="bg-base-300 whitespace-normal w-40 p-3">Smart Seaman ID</th>
                    <th class="bg-base-300 whitespace-normal p-3">ชื่อ</th>
                    <th class="bg-base-300 whitespace-normal p-3">นามสกุล</th>
                    <th class="bg-base-300 whitespace-normal p-3">ตำแหน่ง</th>
                    <th class="bg-base-300 whitespace-normal p-3">บริษัท</th>
                    <th class="bg-base-300 whitespace-normal p-3">เบอร์โทรศัพท์</th>
                    <th class="bg-base-300 whitespace-normal p-3">อีเมล</th>
                </tr>
            </thead>
            <tbody>
                <template v-if="users_certificates">
                    <template v-for="user_cert in users_certificates.users" :key="user_cert.id">
                        <tr @click="routeId(user_cert.mobileUuid)" class="cursor-pointer">
                            <td class="whitespace-normal w-14 p-3">{{ user_cert.rowId }}</td>
                            <td class="whitespace-normal w-40 p-3">{{ user_cert.smartSeamanId }}</td>
                            <td class="whitespace-normal p-3">{{ user_cert.firstName }}</td>
                            <td class="whitespace-normal p-3">{{ user_cert.lastName }}</td>
                            <td class="whitespace-normal p-3">{{ user_cert.positionNameTh }}</td>
                            <td class="whitespace-normal p-3">{{ user_cert.companyNameTh }}</td>
                            <td class="whitespace-normal p-3">{{ user_cert.mobileNumber ? user_cert.mobileNumber : '-' }}</td>
                            <td class="whitespace-normal break-words p-3">{{ user_cert.email }}</td>
                        </tr>
                    </template>
                    
                    <tr v-if="users_certificates.loading">
                        <td colspan="8" class="text-center">
                            <svg class="animate-spin h-9 w-9 text-white m-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </td>
                    </tr>
                    <tr v-if="users_certificates.error">
                        <td colspan="8" class="text-center">
                            <div class="text-danger">เกิดข้อผิดพลาดไม่สามารถโหลดข้อมูลได้ : {{users_certificates.error}}</div>
                        </td>
                    </tr>
                    <tr v-if="Object.keys(users_certificates).length === 0">
                        <td colspan="8" class="text-center">
                            <!-- ไม่มีข้อมูล -->
                        </td>
                    </tr>
                </template>
                <template v-else>
                    <tr>
                        <td colspan="8" class="text-center">
                            ไม่มีข้อมูล
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>

        <template v-if="users_certificates">
            <template v-if="users_certificates.countList > 20">
                <VueTailwindPagination class="pagination"
                    :current="currentPage"
                    :total="users_certificates.countList"
                    :per-page="perPage"
                    @page-changed="handlePageChanged($event)"
                />
            </template>
        </template>

        </div>
    </div>
</template>

<script>
import { router } from "@/router";
import '@ocrv/vue-tailwind-pagination/styles'
import VueTailwindPagination from '@ocrv/vue-tailwind-pagination'

export default {
    data() {
        return {
            currentPage: 1,
            size: 20,
            lastNum: 20,
        }
    },
    components: {
        VueTailwindPagination,
    },
    methods: {
        async routeId(id){
            await router.push({ path: `/certificates/view/${id}` })
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
    },
}
</script>

<style lang="scss" scoped>
    table{
        tr{
            &:hover{
                td{
                    background-color: #343e4c;
                }
            }
        }
    }
</style>