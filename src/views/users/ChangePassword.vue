<script setup>
import { Form, Field } from "vee-validate";
import * as Yup from "yup";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";

import { useUsersStore, useAlertStore } from "@/stores";
import { router } from "@/router";

import Title from './partial/_title.vue';
import Breadcrumb from './partial/_breadcrumb_change.vue';

import { uuid } from 'vue-uuid';

const usersStore = useUsersStore();
const alertStore = useAlertStore();
const route = useRoute();
const id = route.params.id;
const prev_username = route.query.username;

let title = "";
let user = null;

if (id) {
  // edit mode
  title = "แก้ไขรหัสผ่าน";
  ({ user } = storeToRefs(usersStore));
  usersStore.getById(id);
}

const schema = Yup.object().shape({
  oldPassword: Yup.string()
    .required("กรุณากรอกรหัสผ่านเก่า")
    .min(8, "รหัสผ่านเก่าจะต้องมีอย่างน้อย 8 ตัวอักษร, กรุณากรอกใหม่อีกครั้ง"),
  newPassword: Yup.string()
    .required("กรุณากรอกรหัสผ่านใหม่")
    .min(8, "รหัสผ่านใหม่จะต้องมีอย่างน้อย 8 ตัวอักษร, กรุณากรอกใหม่อีกครั้ง"),
  confirmPassword: Yup.string()
    .required("กรุณากรอกยืนยันรหัสผ่าน")
    .oneOf([Yup.ref('newPassword'), null], 'รหัสผ่านไม่ตรงกัน กรุณากรอกใหม่อีกครั้ง')
    .min(8, "ยืนยันรหัสผ่านจะต้องมีอย่างน้อย 8 ตัวอักษร, กรุณากรอกใหม่อีกครั้ง"),
});

async function onSubmit(values) {
  try {
    let message;

    console.log(values);

    await usersStore.updatePassword(JSON.stringify(values));

    if(usersStore.get_res_code === 'WA00000'){
      message = "แก้ไขรหัสผ่านเสร็จสิ้น";
      await router.push(`/admin-management/edit/${id}`);
      alertStore.success(message);
    } else {
      message = '"' + usersStore.get_res_desc + '"' + " การแก้ไขรหัสผ่านเกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      await router.push(`/admin-management/edit/${id}`);
      alertStore.error(message);
    }

    
  } catch (error) {
    alertStore.error(error);
  }
}
</script>

<template>
  <Title title="จัดการผู้ดูแลระบบ" />
  <Breadcrumb link_menu="/admin-management" name_menu="จัดการผู้ดูแลระบบ" :change_menu="`/admin-management/edit/${id}`" name_change_menu="แก้ไขรหัสผ่าน" title="เปลี่ยนรหัสผ่าน" />

  <template v-if="!(user?.loading || user?.error)">
    <div class="card overflow-x-auto bg-base-200 mt-5">
      <div class="card-body">
          <h1 class="text-xl mb-5 text-white font-semibold">{{title}}</h1>
        <Form
          @submit="onSubmit"
          :validation-schema="schema"
          v-slot="{ errors, isSubmitting }"
        >

        <Field name="adminUserId" :value="id" type="hidden" />
        <Field name="username" :value="prev_username" type="hidden" />

        <div class="grid grid-cols-1 gap-5">
         <div class="form-group flex flex-col">
              <label class="mb-2" :class="{ 'is-invalid': errors.oldPassword }">
              รหัสผ่านเดิม <span class="required">*</span></label>
              <div class="flex flex-col">
                  <Field
                    name="oldPassword"
                    type="password"
                    placeholder="รหัสผ่านเดิม (อย่างน้อย 8 ตัว)"
                    class="placeholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent"
                    :class="{ 'is-invalid': errors.oldPassword }"
                  />
                  <div class="invalid-feedback mt-2">{{ errors.oldPassword }}</div>
            </div>
          </div>
         <div class="form-group flex flex-col">
              <label class="mb-2" :class="{ 'is-invalid': errors.newPassword }">
              รหัสผ่านใหม่ <span class="required">*</span></label>
              <div class="flex flex-col">
                  <Field
                    name="newPassword"
                    type="password"
                    placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัว)"
                    class="placeholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent"
                    :class="{ 'is-invalid': errors.newPassword }"
                  />
                  <div class="invalid-feedback mt-2">{{ errors.newPassword }}</div>
            </div>
          </div>
          <div class="form-group flex flex-col">
              <label class="mb-2" :class="{ 'is-invalid': errors.confirmPassword }">
              ยืนยันรหัสผ่าน <span class="required">*</span></label>
              <div class="flex flex-col">
                  <Field
                  name="confirmPassword"
                  type="password"
                  placeholder="ยืนยันรหัสผ่าน"
                  class="placeholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent"
                  :class="{ 'is-invalid': errors.confirmPassword }"
                />
                <div class="invalid-feedback mt-2">{{ errors.confirmPassword }}</div>
            </div>
          </div>
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
            <router-link :to="`/admin-management/edit/${id}`" class="btn btn-sm px-5 btn-light text-white px-7">
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
</script>

<style lang="scss" scoped>
  input[disabled]{
    border: 1px solid rgba(255,255,255,.2);
    color: rgba(255,255,255,.2);
  }

  .imagePreviewWrapper{
    border-radius: 50%;
    width: 220px;
    height: 220px;
    border: 3px solid #d97f3f;
  }

  .icon-camera {
    margin-left: -4px;
    margin-top: 5px;

    g{
      transform: scale(3);
    }
  }
</style>