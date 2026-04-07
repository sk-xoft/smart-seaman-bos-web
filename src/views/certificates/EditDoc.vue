<script setup>
import { Form, Field } from "vee-validate";
import * as Yup from "yup";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { ref } from 'vue'

import { useUsersStore, useAlertStore, useCertificatesStore } from "@/stores";
import { router } from "@/router";

import Title from './partial/_title.vue';
import BreadcrumbView from './partial/_breadcrumb_view.vue';

import { uuid } from 'vue-uuid';

const usersStore = useUsersStore();
const alertStore = useAlertStore();
const certificatesStore = useCertificatesStore();
const route = useRoute();
const id = route.params.id;
const uuId = route.params.id;
const docid = route.params.docid;

const { get_doc_options } = storeToRefs(certificatesStore);
certificatesStore.fetchOptionDoc();

let title = "แก้ไขเอกสาร";
let certStartDate = ref('');
let certEndDate = ref('');
let cot = null;

if (docid) {
  // edit mode
  title = "แก้ไขเอกสาร";
  certificatesStore.getCotById(docid, id);

  ({ cot } = storeToRefs(certificatesStore));
}

const schema = Yup.object().shape({
  documentCode: Yup.string().required("กรุณาเลือกเอกสาร"),
  certStartDate: Yup.string().required("กรุณาเลือกวันที่ออกเอกสาร").nullable(),
  certEndDateType: Yup.string().required("กรุณาเลือกประเภทวันหมดอายุ").nullable(),
  certEndDate: Yup.string().nullable().notRequired().when("certEndDateType", {
    is: (val) => val === "A",
    then: Yup.string().nullable().required("กรุณาระบุวันที่หมดอายุ"),
    otherwise: Yup.string().notRequired()
  }),
});

async function onSubmit(values) {
  try {
    let message;
    const old_file = certificatesStore.get_old_file;

    values.userMobileUuid = id;

    if(values.certStartDate){
      const date = new Date(values.certStartDate);
      const year = date.getFullYear();
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const day = ("0" + date.getDate()).slice(-2);
      const formattedDate = `${year}-${month}-${day}`;

      values.certStartDate = formattedDate;
    }

    if(values.certEndDateType === 'N'){
      values.certEndDate = '9999-99-99';
    }

    if(values.certEndDateType === 'A'){
      const date = new Date(values.certEndDate);
      const year = date.getFullYear();
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const day = ("0" + date.getDate()).slice(-2);
      const formattedDate = `${year}-${month}-${day}`;

      values.certEndDate = formattedDate;
    }

    if(!values.fileCert){
      values.fileCertName = "";
      values.fileCert = "";

      if(old_file != values.fileCert){
        values.isChangeFile = 'Y';
      } else {
        values.isChangeFile = 'N';
      }

    } else {
      values.fileCertName = (uuid.v4()+'.pdf').toString();

      if(old_file != values.fileCert){
        values.isChangeFile = 'Y';
      } else {
        values.isChangeFile = 'N';
      }
    }

    // console.log(JSON.stringify(values));
    await certificatesStore.update(JSON.stringify(values));

    if(certificatesStore.get_res_code === 'WA00000'){
      message = "แก้ไขเอกสารเสร็จสิ้น";
      await router.push(`/certificates/view/${id}`);
      alertStore.success(message);
    } else if ( certificatesStore.get_res_code === 'WA00015'){
      console.log(certificatesStore.get_res_code );
      message = "ข้อมูลนี้มีอยู่แล้วในระบบ กรุณาตรวจสอบอีกครั้ง";
      await router.push(`/certificates/view/${id}`);
      alertStore.error(message);
    } else {
      message = '"' + certificatesStore.get_res_desc + '"' + " การแก้ไขเอกสารเกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      await router.push(`/certificates/view/${id}`);
      alertStore.error(message);
    }

  } catch (error) {
    alertStore.error(error);
  }
}
</script>

<template>
  <Title title="จัดการประกาศนียบัตร" />
  <BreadcrumbView link_menu="/certificates" name_menu="จัดการข้อมูลประกาศนียบัตร" :view_menu="`/certificates/view/${id}`" name_view_menu="ข้อมูลผู้ใช้" title="แก้ไขเอกสาร" />

  <template v-if="!(user?.loading || user?.error)">
    <div class="card bg-base-200 mt-5">
      <div class="card-body">
          <h1 class="text-xl mb-5 text-white font-semibold">{{ title }}</h1>
        
        <Form
          class="w-full max-w-xl m-auto"
          @submit="onSubmit"
          :validation-schema="schema"
          :initial-values="cot"
          v-slot="{ errors, isSubmitting }"
        >

        <Field type="hidden" name="userMobileUuid" :value="id" />

        <div class="form-row grid grid-cols-1 gap-5">
            <div class="form-group flex flex-col">
              <label class="mb-2" :class="{ 'is-invalid': errors.documentCode }">ชื่อเอกสาร <span class="required">*</span></label>
              <Field as="select" v-model="documentCode" id="documentCode" name="documentCode" class="select select-dis select-sm input-ghost input-bordered w-full" disabled>
                  <option value="" selected>เลือกเอกสาร</option>
                  <template v-for="option_doc in get_doc_options.documents" :key="option_doc.id">
                    <option :value="option_doc.documentCode">{{option_doc.documentName}}</option>
                  </template>
              </Field>
              <div class="invalid-feedback mt-2">{{ errors.documentCode }}</div>
            </div>

            <div class="form-group flex flex-col">
              <label class="mb-2" :class="{ 'is-invalid': errors.certStartDate }">วันที่ออกเอกสาร <span class="required">*</span></label>
              <Field v-model="certStartDate" type="text" name="certStartDate" v-slot="{ fieldCertStartDate }">
                <VueDatePicker
                  id="certStartDate"
                  name="certStartDate"
                  v-model="cot.certStartDate" 
                  :format="certStartDateFormat" 
                  v-bind="fieldCertStartDate"
                  dark="true"
                  placeholder="เลือกวันที่ออกเอกสาร" 
                  text-input
                  auto-apply
                  :enable-time-picker="false"
                />
              </Field>
              <div class="invalid-feedback mt-2">{{ errors.certStartDate }}</div>
            </div>

            <div class="form-group flex flex-col">
                <label class="mb-3" :class="{ 'is-invalid': errors.certEndDateType }">วันที่หมดอายุ <span class="required">*</span></label>
                <div class="flex flex-col lg:flex-row gap-7">
                    <Field v-slot="{ field }" v-model="noExpried" name="certEndDateType" type="radio" :value="'N'">
                      <label for="noExpried" class="cursor-pointer flex lg:justify-center items-center gap-3">
                        <input type="radio" id="noExpried" name="certEndDateType" v-bind="field" v-model="cot.certEndDateType" :value="'N'" class="radio radio-primary"/>
                        <span>ไม่มีวันหมดอายุ</span>
                      </label>
                    </Field>

                    <Field v-slot="{ field }" v-model="expried" name="certEndDateType" type="radio" :value="'A'">
                      <label for="expried" class="cursor-pointer flex lg:justify-center items-center gap-3">
                        <input type="radio" id="expried" name="certEndDateType" v-bind="field" v-model="cot.certEndDateType" :value="'A'" class="radio radio-primary" />
                        <span>กำหนดเอง (เลือกวันที่หมดอายุ)</span>
                      </label>
                    </Field>
                </div>
                <div class="invalid-feedback mt-2">{{ errors.certEndDateType }}</div>
            </div>

            <!-- <template v-if="noExpried === 'N'">
              <Field :value="`9999-99-99`" type="hidden" name="certEndDate" />
            </template> -->

            <template v-if="expried === 'A'">
              <div class="form-group flex flex-col" >
                <label class="mb-3" :class="{ 'is-invalid': errors.certEndDate }">วันที่หมดอายุ <span class="required">*</span></label>
                  <Field v-model="cot.certEndDate" type="text" name="certEndDate" v-slot="{ fieldCertEndDate }">
                    <VueDatePicker
                      id="certEndDate"
                      name="certEndDate"
                      v-model="cot.certEndDate" 
                      v-bind="fieldCertEndDate"
                      :format="certEndDateFormat" 
                      dark="true"
                      placeholder="เลือกวันที่หมดอายุ" 
                      text-input
                      auto-apply
                      :enable-time-picker="false"
                    />
                  </Field>
                  <div class="invalid-feedback mt-2">{{ errors.certEndDate }}</div>
              </div>
            </template>

            <div class="form-group flex flex-col">
                <label class="mb-2">อัพโหลดไฟล์เอกสาร</label>

                <div class="input-file-wrapper relative">
                  <input type="file" name="rawFile" id="rawFile" class="file custom-file-input w-full bg-transparent hidden" @change="onFileSelected" accept="application/pdf"/>
                  <label class="input input-sm input-ghost input-bordered bg-transparent px-5 text-sm flex items-center gap-3 overflow-hidden" for="rawFile">
                    <span class="w-20 whitespace-nowrap cursor-pointer"><i class="fa fa-paperclip"></i> เลือกไฟล์</span>

                    <template v-if="!base64StringName">
                      <span id="string-name" v-if="cot.fileCertName" class="whitespace-nowrap">{{cot.fileCertName}}</span>
                    </template>
                    <template v-else>
                      <span id="string-name">{{base64StringName}}</span>
                    </template>
                  </label>
                  <!-- <template v-if="cot.fileCertName || fileCertName">
                    <span id="clear-btn" class="text-white cursor-pointer absolute top-1 right-3 z-10" @click="resetInput">
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 32 32" class="dp__clear_input" data-test="clear-icon"><path d="M23.057 7.057l-16 16c-0.52 0.52-0.52 1.365 0 1.885s1.365 0.52 1.885 0l16-16c0.52-0.52 0.52-1.365 0-1.885s-1.365-0.52-1.885 0z"></path><path d="M7.057 8.943l16 16c0.52 0.52 1.365 0.52 1.885 0s0.52-1.365 0-1.885l-16-16c-0.52-0.52-1.365-0.52-1.885 0s-0.52 1.365 0 1.885z"></path></svg>
                    </span>
                  </template> -->
                </div>
                
                <template v-if="!fileCert">
                  <Field
                    id="file-cert"
                    name="fileCert"
                    type="hidden"
                    v-model="cot.fileBase64"
                  />
                </template>
                <template v-else>
                  <Field
                    id="file-cert"
                    name="fileCert"
                    type="hidden"
                    v-model="fileCert"
                  />
                </template>
                
                <Field id="file-cert-name" name="fileCertName" v-model="fileCertName" type="hidden" />
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
            <router-link :to="`/certificates/view/${uuId}`" class="btn btn-sm px-5 btn-light text-white px-7">
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

<style lang="scss" scoped>
  .dp__clear_input{
    path{
      fill: #fff;
    }
  }
  .select-dis{
    border: 1px solid #323b4e !important;
  }
</style>

<script>
import { FilePreview } from '@/components';
import { ref } from 'vue';
const date = ref();

export default {
  data() {
    return {
      certEndDateType: ref('N'),
      certStartDateFormat: 'dd/MM/yyyy',
      certEndDateFormat: 'dd/MM/yyyy',
      selectedFile: null,
      fileCert: '',
      base64StringName: '',
      fileCertName: '',
    };
  },
  methods: {
    onFileSelected(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.fileName = file.name;

      reader.onload = (event) => {
        this.fileCert = event.target.result.split(',')[1].toString();
        this.selectedFile = file;
         this.base64StringName = event.target.fileName;
         this.fileCertName = event.target.fileName;
      };
      reader.readAsDataURL(file);
    },
    resetInput() {
      var file_cert = document.getElementById('file-cert');
      var file_cert_name = document.getElementById('file-cert-name');
      var string_name = document.getElementById('string-name');

      this.fileCertName = "";
      this.base64StringName = "";
      this.fileCert = "";
      this.cot.fileBase64 = "";
      this.cot.fileCertName = "";

      file_cert.value = "";
      file_cert_name.value = "";
      string_name.innerHTML = "";
    },
  },
};

</script>