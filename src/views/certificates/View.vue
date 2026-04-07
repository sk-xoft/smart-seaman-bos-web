<script setup>
import { Form, Field } from "vee-validate";
import { Alert } from '@/components';
import { storeToRefs } from 'pinia';
import { useAuthStore, useCertificatesStore } from '@/stores';
import { useRoute } from "vue-router";
import { router } from "@/router";

import Title from './partial/_title.vue';
import Breadcrumb from './partial/_breadcrumb.vue';
import ConfirmPopupCot from './partial/_confirm_popup_cot.vue';
import ConfirmPopupDoc from './partial/_confirm_popup_doc.vue';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const route = useRoute();
const id = route.params.id;

const certificatesStore = useCertificatesStore();
// const { user_profile, url_img_profile, cots, docs, state_tab, sizeCot, lastNumCot, currentPageCot, sizeDoc, lastNumDoc, currentPageDoc } = storeToRefs(certificatesStore);
const { user_profile, url_img_profile, cots, docs, state_tab } = storeToRefs(certificatesStore);

if (id) {
  certificatesStore.getUserProfile(id);
  certificatesStore.getUserImageProfile(id);
  
  certificatesStore.getAllCots();
  certificatesStore.getAllDocs();
}

// function handlePageChangedCot(page) {
//     certificatesStore.currentPageCot = page;
//     certificatesStore.lastNumCot = certificatesStore.sizeCot * page;

//     certificatesStore.getAllCots();
// }

// function handlePageChangedDoc(page) {
//     certificatesStore.currentPageDoc = page;
//     certificatesStore.lastNumDoc = certificatesStore.sizeDoc * page;

//     certificatesStore.getAllDocs();
// }

</script>

<template>
    <Alert/>
    <Title title="จัดการประกาศนียบัตร" />
    <Breadcrumb link_menu="/certificates" name_menu="จัดการข้อมูลประกาศนียบัตร" title="ข้อมูลผู้ใช้" />
    
    <div class="card bg-base-200 my-7">
        <div class="card-body p-7">
            <div class="grid grid-cols-[_.5fr_1fr] gap-5">
                <template v-if="url_img_profile.loading">
                    <div class="text-center">
                        <svg class="animate-spin h-9 w-9 text-white m-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                </template>
                <template v-else>
                    <template v-if="url_img_profile">
                        <div class="item avatar flex justify-center items-center">
                            <div class="w-36 flex justify-center items-center rounded-full border-4 border-primary">
                                <img :src="url_img_profile" alt="">
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div class="item avatar flex justify-center items-center">
                            <div class="w-36 flex justify-center items-center rounded-full border-4 border-primary">
                                <h4 class="w-full h-full flex justify-center items-center text-3xl">
                                    {{ user_profile.shortName }}
                                </h4>
                            </div>
                        </div>
                    </template>
                </template>
                <div class="item detail flex flex-col justify-start items-start relative">
                    <div class="profile-wrapper absolute">
                         <h3 class="text-2xl text-white font-semibold mb-1 w-full text-center">
                            <span class="prefix-name" v-if="user_profile.positionDescription === 'Master'">Capt.</span>{{ user_profile.firstName }} {{ user_profile.lastName }}
                        </h3>
                        <h3 class="text-2xl text-white font-semibold mb-5 w-full text-center">({{ user_profile.positionDescription }})</h3>
                    </div>

                    <ul class="grid grid-cols-1 w-full gap-2 pt-24">
                        <li class="grid grid-cols-[_.75fr_1fr] gap-2">
                            <h5 class="text-normal w-32 lg:w-full">Date of Birth</h5>
                            <span class="text-white text-normal break-words">{{ user_profile.dateOfBirth }}</span>
                        </li>
                        <li class="grid grid-cols-[_.75fr_1fr] gap-2">
                            <h5 class="text-normal w-32 lg:w-full">Age</h5>
                            <span class="text-white text-normal break-words">{{ user_profile.age }}</span>
                        </li>
                        <li class="grid grid-cols-[_.75fr_1fr] gap-2">
                            <h5 class="text-normal w-32 lg:w-full">Mobile Phone</h5>
                            <span class="text-white text-normal break-words">{{ user_profile.mobile ? user_profile.mobile : '-'}}</span>
                        </li>
                        <li class="grid grid-cols-[_.75fr_1fr] gap-2">
                            <h5 class="text-normal w-32 lg:w-full">Email</h5>
                            <span class="text-white text-normal break-words">{{ user_profile.email }}</span>
                        </li>
                        <li class="grid grid-cols-[_.75fr_1fr] gap-2">
                            <h5 class="text-normal w-32 lg:w-full">Company</h5>
                            <span class="text-white text-normal break-words">{{ user_profile.companyDescription }}</span>
                        </li>
                        <li class="grid grid-cols-[_.75fr_1fr] gap-2">
                            <h5 class="text-normal w-32 lg:w-full">Smart Seaman ID</h5>
                            <span class="text-white text-normal break-words">{{ user_profile.smartSeamanId }}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <div class="tabs mx-5">
        <a class="tab bg-base-200" :class="{'tab-active': state_tab === 1}" @click="certificatesStore.saveStateTab(1)">Certificate of Training</a> 
        <a class="tab bg-base-200" :class="{'tab-active': state_tab === 2}" @click="certificatesStore.saveStateTab(2)">Document</a> 
    </div>
    <div class="card bg-base-200 my-7 mt-0">
        <div class="card-body p-7 border-0">
            <div class="content-wrapper">
                <div v-if="state_tab === 1">
                    <div class="grid grid-cols-1 gap-3 mb-3">
                        <!-- <h3 class="flex items-center justify-start text-lg text-white font-semibold">ผลการค้นหา</h3> -->
                        <div class="w-full flex justify-end items-center">
                            <router-link class="btn btn-sm px-5 btn-primary mb-2" :to="`/certificates/${id}/cot/add`">
                                <i class="fa fa-plus mr-3 text-xl"></i>
                                เพิ่ม
                            </router-link>
                        </div>
                    </div>
                    <table class="table table-striped lg:table-fixed w-full rounded-none">
                        <thead class="text-center">
                            <tr>
                                <th class="bg-base-300 w-14 p-3">ลำดับที่</th>
                                <th class="bg-base-300 whitespace-normal p-3">ชื่อประกาศนียบัตร</th>
                                <th class="bg-base-300 whitespace-normal w-32 p-3">วันที่ออกประกาศนียบัตร</th>
                                <th class="bg-base-300 whitespace-normal w-32 p-3">วันที่หมดอายุ</th>
                                <th class="bg-base-300 whitespace-normal p-3">จำนวนวันหมดอายุคงเหลือ</th>
                                <th class="bg-base-300 whitespace-normal w-20 p-3">ไฟล์</th>
                                <th class="bg-base-300 whitespace-normal w-28 p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="text-center">
                            <template v-if="cots">
                                <tr v-for="cot in cots.documentEntityList" :key="cot.id">
                                    <td class="whitespace-normal w-14 p-3">{{ cot.rowId }}</td>
                                    <td class="whitespace-normal p-3">{{cot.documentNameEn}}</td>
                                    <td class="whitespace-normal w-32 p-3">{{ cot.certStartDate ? convertDate(cot.certStartDate) : '-' }}</td>
                                    <td class="whitespace-normal w-32 p-3">{{ cot.certEndDate ? convertDate(cot.certEndDate) : '-' }}</td>
                                    <td class="whitespace-normal p-3" :class="getDateClassColor(cot.certEndDate)">
                                        <template v-if="cot.certEndDate">
                                            <template v-if="parseInt(cot.disYear) > 0 || parseInt(cot.disMonth) > 0 || parseInt(cot.disDay) > 0">
                                                <template v-if="parseInt(cot.disYear) != 0">
                                                    {{cot.disYear}} ปี 
                                                </template>
                                                <template v-if="parseInt(cot.disMonth) != 0">
                                                    {{cot.disMonth}} เดือน
                                                </template>
                                                <template v-if="parseInt(cot.disDay) != 0">
                                                    {{cot.disDay}} วัน
                                                </template>
                                            </template>
                                            <template v-else>
                                                <span class="invalid-feedback">หมดอายุ</span>
                                            </template>
                                        </template>
                                        <template v-else>
                                            -
                                        </template>
                                    </td>
                                    <!-- <td class="whitespace-normal p-3">{{ cot.certEndDate ? diffDate(cot.certEndDate, cot.certStartDate) + ' วัน' : '-' }}</td> -->
                                    <td class="whitespace-normal text-center">
                                        <template v-if="cot.certFileName != ''">
                                            <template v-if="cot.certFileName != null">
                                                <button class="btn btn-sm btn-primary" @click="certificatesStore.preview(cot.documentCode, id)"><i class="fa fa-eye"></i></button>
                                            </template>
                                            <template v-else>
                                                <span>-</span>
                                            </template>
                                        </template>
                                        <template v-else>
                                            <span>-</span>
                                        </template>
                                    </td>
                                    <td style="white-space: nowrap">
                                        <router-link :to="`/certificates/${id}/cot/${cot.documentCode}/edit/`" class="btn btn-sm btn-primary mr-1"><i class="fa-solid fa-pen-to-square"></i></router-link>
                                        <label for="onCotDelete" @click="passCotId(cot.documentCode, id)" class="btn btn-sm btn-danger btn-delete-user" :disabled="cot.isDeleting">
                                            <span><i class="fa-solid fa-trash"></i></span>
                                        </label>
                                    </td>
                                </tr>
                                <tr v-if="cots.loading">
                                    <td colspan="7" class="text-center">
                                        <svg class="animate-spin h-9 w-9 text-white m-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </td>
                                </tr>
                                <tr v-if="cots.error">
                                    <td colspan="7" class="text-center">
                                        <div class="text-danger">เกิดข้อผิดพลาดไม่สามารถโหลดข้อมูลข่าวสารได้ : {{cots.error}}</div>
                                    </td>
                                </tr>
                                <tr v-if="Object.keys(cots).length === 0">
                                    <td colspan="7" class="text-center">
                                        <!-- ไม่มีข้อมูล -->
                                    </td>
                                </tr>
                            </template>
                            <template v-else>
                                <tr>
                                    <td colspan="7" class="text-center">
                                        ไม่มีข้อมูล
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>

                    <!-- <template v-if="cots">
                        <VueTailwindPagination class="pagination"
                            :current="currentPageCot"
                            :total="cots.totalData"
                            :per-page="sizeCot"
                            @page-changed="handlePageChangedCot($event)"
                        />
                    </template> -->
                </div>
                <div v-if="state_tab === 2">
                    <div class="grid grid-cols-1 gap-3 mb-3">
                        <!-- <h3 class="flex items-center justify-start text-lg text-white font-semibold">ผลการค้นหา</h3> -->
                        <div class="w-full flex justify-end items-center">
                            <router-link class="btn btn-sm px-5 btn-primary mb-2" :to="`/certificates/${id}/doc/add`">
                                <i class="fa fa-plus mr-3 text-xl"></i>
                                เพิ่ม
                            </router-link>
                        </div>
                    </div>
                    <table class="table table-striped lg:table-fixed w-full rounded-none">
                        <thead class="text-center">
                            <tr>
                                <th class="bg-base-300 w-14 p-3">ลำดับที่</th>
                                <th class="bg-base-300 whitespace-normal p-3">ชื่อเอกสาร</th>
                                <th class="bg-base-300 whitespace-normal w-32 p-3">วันที่ออกเอกสาร</th>
                                <th class="bg-base-300 whitespace-normal w-32 p-3">วันที่หมดอายุ</th>
                                <th class="bg-base-300 whitespace-normal p-3">จำนวนวันหมดอายุคงเหลือ</th>
                                <th class="bg-base-300 whitespace-normal w-20 p-3">ไฟล์</th>
                                <th class="bg-base-300 whitespace-normal w-28 p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="text-center">
                            <template v-if="docs">
                                <tr v-for="doc in docs.documentEntityList" :key="doc.id">
                                    <td class="whitespace-normal w-14 p-3">{{ doc.rowId }}</td>
                                    <td class="whitespace-normal p-3">{{doc.documentNameEn}}</td>
                                    <td class="whitespace-normal w-32 p-3">{{ doc.certStartDate ? convertDate(doc.certStartDate) : '-' }}</td>
                                    <td class="whitespace-normal w-32 p-3">{{ doc.certEndDate ? convertDate(doc.certEndDate) : '-' }}</td>
                                    <td class="whitespace-normal p-3" :class="getDateClassColor(doc.certEndDate)">
                                        <template v-if="doc.certEndDate">
                                            <template v-if="parseInt(doc.disYear) > 0 || parseInt(doc.disMonth) > 0 || parseInt(doc.disDay) > 0">
                                                <template v-if="parseInt(doc.disYear) != 0">
                                                    {{doc.disYear}} ปี 
                                                </template>
                                                <template v-if="parseInt(doc.disMonth) != 0">
                                                    {{doc.disMonth}} เดือน
                                                </template>
                                                <template v-if="parseInt(doc.disDay) != 0">
                                                    {{doc.disDay}} วัน
                                                </template>
                                            </template>
                                            <template v-else>
                                                <span class="invalid-feedback">หมดอายุ</span>
                                            </template>
                                        </template>
                                        <template v-else>
                                            -
                                        </template>
                                    </td>
                                    <!-- <td class="whitespace-normal p-3">{{ doc.certEndDate ? diffDate(doc.certEndDate, doc.certStartDate) + ' วัน' : '-' }}</td> -->
                                    <td class="whitespace-normal text-center">
                                        <template v-if="doc.certFileName != ''">
                                            <template v-if="doc.certFileName != null">
                                                <button class="btn btn-sm btn-primary" @click="certificatesStore.preview(doc.documentCode, id)"><i class="fa fa-eye"></i></button>
                                            </template>
                                            <template v-else>
                                                <span>-</span>
                                            </template>
                                        </template>
                                        <template v-else>
                                            <span>-</span>
                                        </template>
                                    </td>
                                    <td style="white-space: nowrap">
                                        <router-link :to="`/certificates/${id}/doc/${doc.documentCode}/edit/`" class="btn btn-sm btn-primary mr-1"><i class="fa-solid fa-pen-to-square"></i></router-link>
                                        <label for="onDocDelete" @click="passDocId(doc.documentCode, id)" class="btn btn-sm btn-danger btn-delete-user" :disabled="doc.isDeleting">
                                            <span><i class="fa-solid fa-trash"></i></span>
                                        </label>
                                    </td>
                                </tr>
                                <tr v-if="docs.loading">
                                    <td colspan="7" class="text-center">
                                        <svg class="animate-spin h-9 w-9 text-white m-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </td>
                                </tr>
                                <tr v-if="docs.error">
                                    <td colspan="7" class="text-center">
                                        <div class="text-danger">เกิดข้อผิดพลาดไม่สามารถโหลดข้อมูลข่าวสารได้ : {{docs.error}}</div>
                                    </td>
                                </tr>
                                <tr v-if="Object.keys(docs).length === 0">
                                    <td colspan="7" class="text-center">
                                        <!-- ไม่มีข้อมูล -->
                                    </td>
                                </tr>
                            </template>
                            <template v-else>
                                <tr>
                                    <td colspan="7" class="text-center">
                                        ไม่มีข้อมูล
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>

                    <!-- <template v-if="docs">
                        <VueTailwindPagination class="pagination"
                            :current="currentPageDoc"
                            :total="docs.totalData"
                            :per-page="sizeDoc"
                            @page-changed="handlePageChangedDoc($event)"
                        />
                    </template> -->

                </div>
            </div>
        </div>
    </div>
    <ConfirmPopupCot :cotid="cotid" :uuId="id"/>
    <ConfirmPopupDoc :docid="docid" :uuId="id"/>
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
            activeTab: 1,
            uuId: 0,
            cotid: 0,
            docid: 0,
        }
    },
    methods: {
        getDateClassColor(endDate) {
            if(endDate){
                const currentDate = new Date();
                const endDateConvert = new Date(endDate);

                // const diffDays = Math.floor((endDateConvert - currentDate) / (1000 * 60 * 60 * 24)); // Calculate the difference in days

                const yearDiff = endDateConvert.getUTCFullYear() - currentDate.getUTCFullYear();
                const monthDiff = endDateConvert.getUTCMonth() - currentDate.getUTCMonth();
                const dayDiff = endDateConvert.getUTCDate() - currentDate.getUTCDate();

                const amountDiff = yearDiff * 12 + monthDiff + (dayDiff >= 0 ? 0 : -1);
                
                if (amountDiff >= 18) {
                    return ""; // 18 months or more
                } else if (amountDiff < 18 && amountDiff >= 12) {
                    return "text-yellow"; // Between 12 and 18 months
                } else {
                    return "text-red"; // Less than 12 months or negative
                }
            }
        },

        passDocId(docid, id) {
            this.uuId = id
            this.docid = docid
        },
        passCotId(cotid, id) {
            this.uuId = id
            this.cotid = cotid
        },
        convertDate(isoDate){
            const date = new Date(isoDate);
            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const year = date.getFullYear().toString();

            const convertedDateString = `${day}/${month}/${year}`;

            return convertedDateString;
        },
        diffDate(endDate, startDate){
            startDate = new Date(startDate);
            endDate = new Date(endDate);
            const diffInMs = endDate.getTime() - startDate.getTime();
            const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

            return diffInDays.toString();
        },
    },
}
</script>

<style lang="scss" scoped>

.prefix-name{
    font-size: 1.5rem !important;
}

.card{
    border: 0 !important;
}

 span.text-lg{
     font-size: 18px !important;
 }

 .tabs {
    .tab{
        color: #fff;
        border-radius: 5px 5px 0 0;
        margin-right: 3px;
        
        &.tab-active{
            background-color: #d97f3d;
        }
    }
 }

.profile-wrapper{
    width: 100%;
    left: 30%;
    transform: translate(-50%, 0px);
}

.text-white {
  color: white;
}

.text-yellow {
  color: yellow;
}

.text-red {
  color: #fd2e64;
}

</style>