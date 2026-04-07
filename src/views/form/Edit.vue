<script setup>
import { Form, Field } from "vee-validate";
import * as Yup from "yup";
import { useRoute } from "vue-router";
import { storeToRefs, mapState } from "pinia";
import { ref } from 'vue'

import { useUsersStore, useAlertStore, useFormsStore } from "@/stores";
import { router } from "@/router";

import Title from './partial/_title.vue';
import Breadcrumb from './partial/_breadcrumb.vue';

import { uuid } from 'vue-uuid';

const usersStore = useUsersStore();
const alertStore = useAlertStore();
const formsStore = useFormsStore();

const { forms } = storeToRefs(formsStore);

const route = useRoute();
const id = route.params.id;

let title = "เพิ่มฟอร์ม";
let form = null;

if (id) {
  // edit mode
  title = "แก้ไขฟอร์ม";
  formsStore.getById(id);
  ({ form } = storeToRefs(formsStore));
}

const schema = Yup.object().shape({
  // date_online: Yup.date().required("กรุณาเลือกวันอบรมออนไลน์").nullable(),
  formName: Yup.string().required("กรุณากรอกชื่อแบบฟอร์ม"),
  formFile: Yup.string().required("กรุณาอัพโหลดไฟล์"),
});

async function onSubmit(values) {
  try {
    let message;

    values.formFileName = (uuid.v4()+'.pdf').toString();

    console.log(values.formFile);

    // console.log(JSON.stringify(values));
    await formsStore.update(JSON.stringify(values));
    message = "สร้างฟอร์มเสร็จสิ้น";

    await router.push("/form");
    alertStore.success(message);
  } catch (error) {
    alertStore.error(error);
  }
}
</script>

<template>
    <Title title="ฟอร์ม" />
    <Breadcrumb link_menu="/form" name_menu="ฟอร์ม" title="แก้ไขฟอร์ม" />

  <template v-if="!(form?.loading || form?.error)">
    <div class="card bg-base-200 mt-5">
      <div class="card-body">
          <h1 class="text-xl mb-5 text-white font-semibold">{{title}}</h1>
          <Form
            @submit="onSubmit"
            :validation-schema="schema"
            :initial-values="form"
            v-slot="{ errors, isSubmitting }"
          >

        <Field name="formFileName" type="hidden"></Field>
        <Field name="formId" type="hidden" :value="form.formId" />

        <div class="form-row grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div class="form-group flex flex-col">
              <label class="mb-3" :class="{ 'is-invalid': errors.formName }">ชื่อแบบฟอร์ม <span class="required">*</span></label>
              <Field
                name="formName"
                type="text"
                placeholder="ชื่อแบบฟอร์ม"
                class="placeholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent"
                :class="{ 'is-invalid': errors.formName }"
              />
              <div class="invalid-feedback mt-2">{{ errors.formName }}</div>
            </div>

            <div class="form-group flex flex-col">
                <label class="mb-3" :class="{ 'is-invalid': errors.formFile }">อัพโหลดไฟล์ <span class="required">*</span></label>

                <!-- <input type="file" name="rawFile" class="file-input file-input-sm file-input-bordered w-full bg-transparent" @change="onFileSelected" accept="application/pdf"/> -->
                
                <div class="input-file-wrapper">
                  <input type="file" name="rawFile" id="rawFile" class="file custom-file-input w-full bg-transparent hidden" @change="onFileSelected" accept="application/pdf"/>
                  <label class="input input-sm input-ghost input-bordered bg-transparent px-5 text-sm flex items-center gap-3 overflow-hidden" for="rawFile">
                    <span class="w-20 whitespace-nowrap cursor-pointer"><i class="fa fa-paperclip"></i> เลือกไฟล์</span>

                    <template v-if="!base64StringName">
                      <span v-if="form.formFileName" class="whitespace-nowrap">{{form.formFileName}}</span>
                    </template>
                    <template v-else>
                      <span>{{base64StringName}}</span>
                    </template>
                  </label>
                </div>
                
                <template v-if="!base64String">
                  <Field
                    name="formFile"
                    type="hidden"
                    v-model="form.fileBase64"
                  />
                </template>
                <template v-else>
                  <Field
                    name="formFile"
                    type="hidden"
                    v-model="base64String"
                  />
                </template>
              
                <div class="invalid-feedback mt-2">{{ errors.formFile }}</div>
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
            <router-link to="/form" class="btn btn-sm px-5 btn-light text-white px-7">
                <i class="fa-solid fa-ban text-lg mr-2"></i>
                ยกเลิก</router-link>
          </div>
        </Form>
      </div>
    </div>
  </template>
  <template v-if="form?.loading">
    <div class="text-center m-5">
      <span class="spinner-border spinner-border-lg align-center"></span>
    </div>
  </template>
  <template v-if="form?.error">
    <div class="text-center m-5">
      <div class="text-danger">Error loading form: {{ form.error }}</div>
    </div>
  </template>
</template>

<script>
export default {
   data() {
    return {
      selectedFile: null,
      base64String: '',
      base64StringName: '',
    };
  },
  methods: {
    onFileSelected(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.fileName = file.name;

      reader.onload = (event) => {
        this.base64String = event.target.result.split(',')[1].toString();
        //this.form.fileBase64 = event.target.result.split(',')[1].toString();
        this.base64StringName = event.target.fileName;
        this.selectedFile = file;
       // const encodedData = btoa("Hello, world"); // encode a string
       // let decodedData = atob(this.base64String); // decode the string
      };
      reader.readAsDataURL(file);
    }
  },
}

</script>

<style lang="scss" scoped>
</style>