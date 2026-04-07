<script setup>
import { Form, Field } from "vee-validate";
import * as Yup from "yup";
import { useRoute } from "vue-router";
import { storeToRefs, mapState } from "pinia";
import { ref } from 'vue'

import { useAuthStore, useDashboardsStore } from "@/stores";
import { router } from "@/router";

import { uuid } from 'vue-uuid';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const dashboardsStore = useDashboardsStore();

const route = useRoute();
const id = route.params.id;

let title = "";

const { dashboard_details, currentPageLess, sizeLess, lastNumLess } = storeToRefs(dashboardsStore);

if (id) {
  title = `คนประจำเรือที่อายุเอกสารน้อยกว่า ${id} เดือน`;
  dashboardsStore.refreshLessDataTable();
  dashboardsStore.getDashboardDetail(id);
}

function handlePageChanged(page, id) {
    dashboardsStore.currentPageLess = page;
    dashboardsStore.lastNumLess = dashboardsStore.sizeLess * page;

    dashboardsStore.getDashboardDetail(id);
}

</script>

<template>
  <div class="text-sm breadcrumbs">
      <ul>
          <li><router-link to="/">หน้าหลัก</router-link></li> 
          <li>{{ title }}</li>
      </ul>
  </div>
  <h1 class="text-2xl font-medium mb-7">{{ title }}</h1>

  <div class="card overflow-x-auto bg-base-200">
      <div class="card-body">
          <h3 class="text-xl text-white font-semibold mb-3">ผลการค้นหา</h3>
          <table class="table table-striped lg:table-fixed w-full rounded-none text-center">
            <thead class="text-center">
                <tr>
                    <th class="bg-base-300 w-14">ลำดับที่</th>
                    <th class="whitespace-normal w-40 bg-base-300">Smart Seaman ID</th>
                    <th class="bg-base-300">ชื่อ</th>
                    <th class="bg-base-300">นามสกุล</th>
                    <th class="bg-base-300">ตำแหน่ง</th>
                    <th class="bg-base-300">บริษัท</th>
                    <th class="bg-base-300">เบอร์โทรศัพท์</th>
                    <th class="bg-base-300">อีเมล</th>
                    <!-- <th class="bg-base-300">วันที่หมดอายุ</th> -->
                </tr>
            </thead>
            <tbody class="text-center">
                  <template v-if="dashboard_details">
                    <template v-for="detail in dashboard_details.items" :key="detail.id">
                      <tr @click="routeId(detail.certMobileUuid)" class="cursor-pointer">
                          <td class="whitespace-normal w-14 p-3">{{ detail.num }}</td>
                          <td class="whitespace-normal w-40 p-3">{{ detail.smartSeamanId ? detail.smartSeamanId : '-' }}</td>
                          <td class="whitespace-normal p-3 break-words">{{ detail.firstName ? detail.firstName : '-' }}</td>
                          <td class="whitespace-normal p-3 break-words">{{ detail.lastName ? detail.lastName : '-' }}</td>
                          <td class="whitespace-normal p-3">{{ detail.positionNameEn ? detail.positionNameEn : '-' }}</td>
                          <td class="whitespace-normal p-3">{{ detail.companyNameEn ? detail.companyNameEn : '-' }}</td>
                          <td class="whitespace-normal p-3">{{ detail.mobileNumber ? detail.mobileNumber : '-' }}</td>
                          <td class="whitespace-normal p-3 break-words">{{ detail.email ? detail.email : '-' }}</td>
                          <!-- <td class="whitespace-normal p-3">{{ convertDate(detail.certEndDate) }}</td> -->
                      </tr>
                    </template>
                    <tr v-if="dashboard_details.loading">
                        <td colspan="8" class="text-center">
                            <svg class="animate-spin h-9 w-9 text-white m-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </td>
                    </tr>
                    <tr v-if="dashboard_details.error">
                        <td colspan="8" class="text-center">
                            <div class="text-danger">เกิดข้อผิดพลาดไม่สามารถโหลดข้อมูลข่าวสารได้ : {{dashboard_details.error}}</div>
                        </td>
                    </tr>
                    <tr v-if="Object.keys(dashboard_details).length === 0">
                        <td colspan="8" class="text-center">
                            ไม่มีข้อมูล
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

        <template v-if="dashboard_details">
            <template v-if="dashboard_details.totalData > 20">
                <VueTailwindPagination class="pagination"
                    :current="currentPageLess"
                    :total="dashboard_details.totalData"
                    :per-page="sizeLess"
                    @page-changed="handlePageChanged($event, id)"
                />
            </template>
        </template>

      </div>
    </div>
</template>

<script>
import '@ocrv/vue-tailwind-pagination/styles'
import VueTailwindPagination from '@ocrv/vue-tailwind-pagination'

export default {
    components: {
        VueTailwindPagination,
    },
    methods: {
        convertDate(isoDate){
            const date = new Date(isoDate);
            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const year = date.getFullYear().toString();

            const convertedDateString = `${day}/${month}/${year}`;

            return convertedDateString;
        },
        async routeId(uuid){
            await router.push({ path: `/certificates/view/${uuid}` })
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

  .welcome-card{
    background-color: #25695C !important;
  }

  .card-body{
    .parrten {
      position: absolute;
      top: -25px;
      right: -25px;

      svg {
        fill: rgba(217, 127, 61, 0.03);
        width: 100px;
        height: 100px;
        -webkit-transform: rotate(-135deg);
        transform: rotate(-135deg);
      }
    }
  }

  .card:hover{
    .round-box{
      background-color: #d97f3d;

      svg{
        fill: #fff;
      }
    }
  }

  .round-box{
    width: 55px;
    height: 55px;
    border-radius: 27px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 20px;
    -webkit-transition: all 0.5s ease;
    transition: all 0.5s ease;
    background-color: rgba(217, 127, 61, 0.1);

    svg {
      fill: #d97f3d;
      width: auto;
      height: 25px;
      -webkit-transition: all 0.5s ease;
      transition: all 0.5s ease;
    }
  }

.topright-general, .toprightarrow-primary, .toprightarrow-secondary {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: inline-grid;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
}

.toprightarrow-primary {
    color: #d97f3d;
    background-color: rgba(217, 127, 61, 0.1);
}

.topright-general:before, .toprightarrow-primary:before, .toprightarrow-secondary:before {
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
}
</style>