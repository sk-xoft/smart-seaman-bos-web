<script setup>
import { Form, Field } from "vee-validate";
import * as Yup from "yup";
import { useRoute } from "vue-router";
import { storeToRefs, mapState } from "pinia";
import { ref } from 'vue'

import { useUsersStore, useAlertStore, useRolesStore } from "@/stores";
import { router } from "@/router";

import Title from './partial/_title.vue';
import Breadcrumb from './partial/_breadcrumb.vue';

import { uuid } from 'vue-uuid';

const usersStore = useUsersStore();
const alertStore = useAlertStore();
const rolesStore = useRolesStore();

const { roles, row_tables } = storeToRefs(rolesStore);

const route = useRoute();
const id = route.params.id;

let title = "Edit Group Profile";
let role = null;

if (id) {
  // edit mode
  title = "Edit Group Profile";
  ({ role } = storeToRefs(rolesStore));
  rolesStore.getById(id);
}

rolesStore.fetchRowTable();

const schema = Yup.object().shape({
  groupName: Yup.string().required("กรุณากรอกชื่อบทบาท"),
  groupStatus: Yup.string().required("กรุณาเลือกสถานะบทบาท"),
});

async function onSubmit(values) {
  try {
    let message;

    let inputObj = values.menuId;

    values.menuAuthorlist = inputObj.map(menuId => ({
      menuId: menuId.toString(),
      menuStatus: "A"
    }));

    console.log(values);

    await rolesStore.update(JSON.stringify(values));

    if(rolesStore.get_res_code === 'WA00000'){
      message = "แก้ไขบทบาทผู้ใช้เสร็จสิ้น";
      await router.push("/role-management");
      alertStore.success(message);
    } else {
      message = '"' + rolesStore.get_res_desc + '"' + " การแก้ไขบทบาทผู้ใช้เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      await router.push("/role-management");
      alertStore.error(message);
    }

    
  } catch (error) {
    alertStore.error(error);
  }
}
</script>

<template>
    <Title title="จัดการสิทธิ์ผู้ดูแลระบบ" />
    <Breadcrumb link_menu="/role-management" name_menu="จัดการสิทธิ์ผู้ดูแลระบบ" title="แก้ไขสิทธิ์ผู้ดูแลระบบ" />

  <template v-if="!(user?.loading || user?.error)">
    <div class="card bg-base-200 mt-5">
      <div class="card-body">
          <h1 class="text-xl mb-5 text-white font-semibold">{{title}}</h1>
        <Form
            @submit="onSubmit"
            :validation-schema="schema"
            :initial-values="role"
            v-slot="{ errors, isSubmitting }"
          >

          <Field name="groupId" v-model="groupId" type="hidden" />

          <div class="form-row grid grid-cols-1 lg:grid-cols-2 gap-5 mb-3">
            <div class="form-group flex flex-col">
              <label class="mb-2" :class="{ 'is-invalid': errors.groupName }">ชื่อบทบาท <span class="required">*</span></label>
              <Field
                name="groupName"
                type="text"
                placeholder="ชื่อบทบาท"
                class="placeholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent"
                :class="{ 'is-invalid': errors.groupName }"
              />
              <div class="invalid-feedback mt-2">{{ errors.groupName }}</div>
            </div>

            <div class="form-group flex flex-col">
              <label class="mb-2" :class="{ 'is-invalid': errors.groupStatus }">สถานะ <span class="required">*</span></label>
              <Field as="select" v-model="groupStatus" id="groupStatus" name="groupStatus" class="select select-sm select-bordered bg-transparent" :class="{ 'is-invalid': errors.groupStatus }">
                  <option value="" selected>--- เลือกสถานะ ---</option>
                  <option value="A">Active</option>
                  <option value="I">Inactive</option>
              </Field>
              <div class="invalid-feedback mt-2">{{ errors.groupStatus }}</div>
            </div>
          </div>
          <div class="grid w-full lg:w-[70%] m-auto mt-7">
            <table class="table table-striped lg:table-fixed w-full rounded-none">
                <thead class="text-center">
                    <tr>
                        <th class="bg-base-300">เมนู</th>
                        <th class="bg-base-300">สิทธิ์</th>
                    </tr>
                </thead>
                <tbody class="text-center">
                    <template v-if="row_tables">
                        <tr v-for="row in row_tables.menus" :key="row.id">
                            <td class="whitespace-normal p-3">{{ row.menuNameTh }}</td>
                            <td class="whitespace-normal p-3 only-field">
                              <template v-for="menu in role.menuId" :key="menu.menuId">
                                <template v-if="menu === row.menuId">
                                  <Field class="checkbox checkbox-sm checkbox-primary" as="input" name="menuId" type="checkbox" :value="row.menuId"/>
                                </template>
                              </template>
                              <Field class="checkbox checkbox-sm checkbox-primary" as="input" name="menuId" type="checkbox" :value="row.menuId"/>
                            </td>
                        </tr>
                        <tr v-if="row_tables.loading">
                            <td colspan="2" class="text-center">
                                <svg class="animate-spin h-9 w-9 text-white m-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </td>
                        </tr>
                        <tr v-if="row_tables.error">
                            <td colspan="2" class="text-center">
                                <div class="text-danger">เกิดข้อผิดพลาดไม่สามารถโหลดข้อมูลจัดการสิทธิ์ได้ : {{row_tables.error}}</div>
                            </td>
                        </tr>
                        <tr v-if="Object.keys(row_tables).length === 0">
                            <td colspan="2" class="text-center">
                                ไม่มีข้อมูล
                            </td>
                        </tr>
                    </template>
                    <template v-else>
                        <tr>
                            <td colspan="2" class="text-center">
                                ไม่มีข้อมูล
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
          </div>
          <div class="form-group flex mt-10 justify-center items-center gap-5">
            <button class="btn btn-sm px-5 btn-primary" :disabled="isSubmitting">
                <i class="fa-solid fa-floppy-disk mr-3 text-lg"></i>
                <span
                    v-show="isSubmitting"
                    class="spinner-border spinner-border-sm mr-1"
                ></span>
                บันทึก
            </button>
            <router-link to="/role-management" class="btn btn-sm px-5 btn-light text-white px-7">
                <i class="fa-solid fa-ban text-lg mr-2"></i>
                ยกเลิก</router-link>
          </div>
        </Form>
      </div>
    </div>
  </template>
  <template v-if="user?.loading">
    <div class="text-center m-5">
      <span class="spinner-border spinner-border-lg align-center"></span>
    </div>
  </template>
  <template v-if="user?.error">
    <div class="text-center m-5">
      <div class="text-danger">Error loading user: {{ user.error }}</div>
    </div>
  </template>
</template>

<script>
import { ref } from 'vue';
export default {
  methods: {
    isMenuSelected(menuId) {
      return this.menu === menuId;
    },
  }
}
</script>

<style lang="scss">
  .only-field{
    input:nth-of-type(2n){
      display: none;
    }
  }
</style>