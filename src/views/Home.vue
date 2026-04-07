<script setup>
import { Form, Field } from "vee-validate";
import { Alert } from '@/components';
import { storeToRefs } from 'pinia';
import { useAuthStore, useDashboardsStore, useMenuStore } from '@/stores';


const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const menuStore = useMenuStore();
const { profile, menus_operation } = storeToRefs(menuStore);

const dashboardsStore = useDashboardsStore();
const { all_user, less_three, less_six, less_year } = storeToRefs(dashboardsStore);

dashboardsStore.getAllUser();
dashboardsStore.getLessThree();
dashboardsStore.getLessSix();
dashboardsStore.getLessYear();

</script>

<template>
  <div class="flex flex-col justify-center flex-column items-center">
      <h1 class="mb-5 w-full text-3xl font-semi-bold">แดชบอร์ด</h1>

      <div class="grid grid-cols-1 gap-7 w-full mb-7">
        <div class="card bg-[#25695C] rounded-none w-full h-48 w-full">
          <div class="card-body flex justify-center items-center">
              <h2 class="text-3xl font-medium leading-[50px] text-white text-center">Welcome to Smart Seaman <br>{{profile.companyDescription}}</h2>
          </div>
        </div>
      </div>

      <template v-if="menus_operation[0].menuCode === 'OPER101'">

        <div v-if="all_user.loading || less_three.loading || less_six.loading || less_year.loading">
          <div class="text-center">
              <svg class="animate-spin h-9 w-9 text-white m-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
          </div>
        </div>

        <div v-else>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-7 w-full mb-7">
            <div></div>
            <div class="card bg-[#25695C] rounded-none w-full">
              <template v-if="all_user.count">
                <router-link to="/user/all">    
                  <div class="card-body text-center">                    
                    <h5 class="text-normal font-medium text-base-content mb-3">จำนวนคนประจำเรือทั้งหมด</h5>
                    <h3 class="ml-2 text-3xl font-semibold text-white">{{ all_user.count ? all_user.count : '-' }}</h3>
                  </div>
                </router-link>
              </template>
              <template v-else>
                <div class="card-body text-center">                    
                  <h5 class="text-normal font-medium text-base-content mb-3">จำนวนคนประจำเรือทั้งหมด</h5>
                  <h3 class="ml-2 text-3xl font-semibold text-white">{{ all_user.count ? all_user.count : '-' }}</h3>
                </div>
              </template>
            </div>
            <div></div>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-7 w-full mb-7">
            <div class="card bg-[#25695C] rounded-none w-full">
              <template v-if="less_year.count">
                <router-link to="/less-than/12">    
                  <div class="card-body text-center">                    
                    <h5 class="text-normal font-medium text-base-content mb-3">อายุเอกสาร &lt; 12 เดือน (คน)</h5>
                    <h3 class="ml-2 text-3xl font-semibold text-[#FFE600]">{{ less_year.count ? less_year.count : '-' }}</h3>
                  </div>
                </router-link>
              </template>
              <template v-else>
                <div class="card-body text-center">                    
                  <h5 class="text-normal font-medium text-base-content mb-3">อายุเอกสาร &lt; 12 เดือน (คน)</h5>
                  <h3 class="ml-2 text-3xl font-semibold text-[#FFE600]">{{ less_year.count ? less_year.count : '-' }}</h3>
                </div>
              </template>
            </div>
            <div class="card bg-[#25695C] rounded-none w-full">
              <template v-if="less_six.count">
                <router-link to="/less-than/6">
                  <div class="card-body text-center">                          
                    <h5 class="text-normal font-medium text-base-content mb-3">อายุเอกสาร &lt; 6 เดือน (คน)</h5>
                    <h3 class="ml-2 text-3xl font-semibold text-[#FF0000]">{{ less_six.count ? less_six.count : '-' }}</h3>
                  </div>
                </router-link>
              </template>
              <template v-else>
                <div class="card-body text-center">                    
                  <h5 class="text-normal font-medium text-base-content mb-3">อายุเอกสาร &lt; 6 เดือน (คน)</h5>
                  <h3 class="ml-2 text-3xl font-semibold text-[#FFE600]">{{ less_six.count ? less_six.count : '-' }}</h3>
                </div>
              </template>
            </div>
            <div class="card bg-[#25695C] rounded-none w-full">
              <template v-if="less_three.count">
                <router-link to="/less-than/3">
                  <div class="card-body text-center">                           
                    <h5 class="text-normal font-medium text-base-content mb-3">อายุเอกสาร &lt; 3 เดือน (คน)</h5>
                    <h3 class="ml-2 text-3xl font-semibold text-[#FF0000]">{{ less_three.count ? less_three.count : '-' }}</h3>
                  </div>
                </router-link>
              </template>
              <template v-else>
                <div class="card-body text-center">                           
                  <h5 class="text-normal font-medium text-base-content mb-3">อายุเอกสาร &lt; 3 เดือน (คน)</h5>
                  <h3 class="ml-2 text-3xl font-semibold text-[#FF0000]">{{ less_three.count ? less_three.count : '-' }}</h3>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="h-56"></div>
      </template>
  </div>
</template>

<style lang="scss" scoped>
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