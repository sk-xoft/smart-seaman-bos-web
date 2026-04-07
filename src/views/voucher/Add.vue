<script setup>
import { Form, Field } from "vee-validate";
import * as Yup from "yup";
import { useRoute } from "vue-router";
import { storeToRefs, mapState } from "pinia";
import { ref } from 'vue'

import { useUsersStore, useAlertStore, useVoucherStore } from "@/stores";
import { router } from "@/router";

import Title from './partial/_title.vue';
import Breadcrumb from './partial/_breadcrumb.vue';

import { uuid } from 'vue-uuid';

const usersStore = useUsersStore();
const alertStore = useAlertStore();
const voucherStore = useVoucherStore();

const { vouchers, option_smart_seaman_id } = storeToRefs(voucherStore);

const route = useRoute();
const id = route.params.id;

voucherStore.fetchOptionSmartSeamanId();

let title = "เพิ่มสิทธิประโยชน์";
let voucher = null;
let voucherSmartseamanId = ref('');

const schema = Yup.object().shape({
  voucherTitle: Yup.string().required("กรุณากรอกหัวข้อสิทธิประโยชน์"),
  voucherType: Yup.string().required("กรุณากรอก Smart Seaman ID"),
  voucherDetails: Yup.string().required("กรุณากรอกรายละเอียดสิทธิประโยชน์"),
  voucherQrcode: Yup.string().required("กรุณาอัพโหลดไฟล์ภาพ QR Code"),
});

async function onSubmit(values) {
  try {
    let message;

    let rawString = values.voucherDetails;
    values.voucherDetails = rawString.replace(/\n/g, '');

    if(!values.voucherPicture){
      values.voucherPicture = "";
    }

    console.log(values);

    await voucherStore.create(JSON.stringify(values));

    if(voucherStore.get_res_code === 'WA00000'){
      message = "สร้างสิทธิประโยชน์เสร็จสิ้น";
      await router.push("/voucher");
      alertStore.success(message);
    } else {
      console.log(voucherStore.get_res_code);
      console.log(voucherStore.get_res_desc);

      message = '"' + voucherStore.get_res_desc + '"' + " การสร้างสิทธิประโยชน์เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      await router.push("/voucher");
      alertStore.error(message);
    }

    
  } catch (error) {
    alertStore.error(error);
  }
}
</script>

<template>
    <Title title="สิทธิประโยชน์" />
    <Breadcrumb link_menu="/voucher" name_menu="สิทธิประโยชน์" title="เพิ่มสิทธิประโยชน์" />

  <template v-if="!(user?.loading || user?.error)">
    <div class="card bg-base-200 mt-5">
      <div class="card-body">
          <h1 class="text-xl mb-5 text-white font-semibold">{{title}}</h1>
        <Form
            @submit="onSubmit"
            :validation-schema="schema"
            v-slot="{ errors, isSubmitting }"
          >

            <div class="mb-2">
                <label class="mb-2" :class="{ 'is-invalid': errors.voucherPicture }">รูปภาพหน้าปก (ขนาดไฟล์ไม่เกิน 1 MB)</label>
            </div>
            <div class="flex flex-col justify-center items-center mb-5">
              <div class="relative w-full h-56 max-h-56">
                  <div
                    class="imagePreviewWrapper h-full w-full"
                    :style="[ previewImage ? { backgroundImage: `url(${previewImage})`} : { backgroundImage: `url(${fallbackBgUrl})`}]"
                    @click="selectImage">
                  </div>

                <div class="edit-wrapper py-1 px-5 absolute bottom-3 right-3 bg-primary p-1 rounded-full cursor-pointer" @click="selectImage">
                  <i class="fas fa-image text-white mr-3"></i>
                  <span class="text-normal text-white">อัพโหลด</span>
                </div>
              </div>
          
              <input
                class="opacity-0 invisible hidden"
                ref="fileInput"
                type="file"
                accept="image/jpeg, image/png"
                @input="pickFile"
                @change="onFileSelected"
                >

                <Field
                  name="voucherPicture"
                  type="hidden"
                  v-model="voucherPicture"
                />
                <div class="file-alert invalid-feedback mt-2 text-left w-full">{{ errors.voucherPicture }}</div>
            </div>

        <div class="form-row grid grid-cols-1 lg:grid-cols-2 gap-5 mb-3">
            <div class="form-group flex flex-col">
              <label class="mb-2" :class="{ 'is-invalid': errors.voucherTitle }">หัวข้อสิทธิประโยชน์ <span class="required">*</span></label>
              <Field
                name="voucherTitle"
                type="text"
                placeholder="หัวข้อสิทธิประโยชน์"
                class="placeholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent"
                :class="{ 'is-invalid': errors.voucherTitle }"
              />
              <div class="invalid-feedback mt-2">{{ errors.voucherTitle }}</div>
            </div>

            <div class="form-group flex flex-col">
                <label class="mb-3" :class="{ 'is-invalid': errors.voucherType }">Smart Seaman ID <span class="required">*</span></label>
                <div class="flex flex-col lg:flex-row gap-7">
                    <Field v-slot="{ field }" v-model="personal" name="voucherType" type="radio" :value="'PERSONAL'">
                      <label for="personal" class="cursor-pointer flex lg:justify-center items-center gap-3">
                        <input type="radio" id="personal" name="voucherType" v-bind="field" v-model="voucherType" :value="'PERSONAL'" class="radio radio-primary"/>
                        <span>กำหนด Smart Seaman ID</span>
                      </label>
                    </Field>

                    <Field v-slot="{ field }" v-model="global" name="voucherType" type="radio" :value="'GLOBAL'">
                      <label for="global" class="cursor-pointer flex lg:justify-center items-center gap-3">
                        <input type="radio" id="global" name="voucherType" v-bind="field" v-model="voucherType" :value="'GLOBAL'" class="radio radio-primary" />
                        <span>ทั้งหมด</span>
                      </label>
                    </Field>
                </div>
                <div class="invalid-feedback mt-2">{{ errors.voucherType }}</div>
                
                <template v-if="personal === 'PERSONAL'">
                    <div class="mt-3">
                      <Field v-model="voucherSmartseamanId" name="voucherSmartseamanId" v-slot="{ fieldVoucherSmartseamanId }">
                        <LvDropdown
                          optionLabel="smartseamanId"
                          optionValue="smartseamanId"
                          v-bind="fieldVoucherSmartseamanId"
                          placeholder="--- เลือก Smart Seaman ID ---"
                          emptyFilterMessage="ไม่มีผลลัพธ์ที่คุณค้นหา"
                          filterPlaceholder="ค้นหา"
                          v-model="voucherSmartseamanId"
                          :options="option_smart_seaman_id"
                          :filter="true"
                          clearable
                        />
                      </Field>
                    </div>
                    <!-- <Field as="select" v-model="voucherSmartseamanId" id="voucherSmartseamanId" name="voucherSmartseamanId" class="select select-sm mt-3 select-bordered bg-transparent" :class="{ 'is-invalid': errors.voucherSmartseamanId }">
                      <option value="" selected>----- เลือก Smart Seaman ID -----</option>
                      <template v-for="option in option_smart_seaman_id" :key="option.id">
                        <option :value="option.smartseamanId">{{ option.fullName }}</option>
                      </template>
                    </Field> -->
                    <div class="invalid-feedback mt-2">{{ errors.voucherSmartseamanId }}</div>
                </template>

                <template v-if="global === 'GLOBAL'">
                  <Field :value="``" type="hidden" name="voucherSmartseamanId" />
                </template>
            </div>
          </div>

          <div class="form-row grid grid-cols-1 gap-2">
            <label :class="{ 'is-invalid': errors.voucherDetails }">รายละเอียด <span class="required">*</span></label>
              <Field v-model="voucherDetails" name="voucherDetails" v-slot="{ fieldDetails }">
              <editor
                  id="voucherDetails"
                  name="voucherDetails"
                  v-model="voucherDetails"
                  v-bind="fieldDetails"
                  api-key="xpgm8wux59zd7ki0n5f2vnxsqcshxie7f2kyz8838sspnodl"
                  :init="{
                    height: 250,
                    menubar: false,
                    skin: 'oxide-dark',
                    content_css: 'tinymce-5-dark',
                    plugins: [
                      'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount', 'help', 'wordcount'
                    ],
                    toolbar:
                      'undo redo | casechange blocks | bold italic backcolor | \
                      alignleft aligncenter alignright alignjustify | \
                      bullist numlst checklist outdent indent | removeformat | a11ycheck code table help'
                  }"
                />
            </Field>
            <div class="invalid-feedback mt-2">{{ errors.voucherDetails }}</div>

            <div class="form-group flex flex-col">
                <label class="mb-3" :class="{ 'is-invalid': errors.voucherQrcode }">อัพโหลดรูปคิวอาร์โค้ด / รูปบาร์โค้ด / รูปแคมเปญ <span class="required">*</span></label>

                <div class="input-file-wrapper relative">
                  <input type="file" name="rawFile" id="rawFile" class="file custom-file-input w-full bg-transparent hidden" ref="inputQr" @change="onQrSelected" @input="pickFileQr" accept="image/jpeg, image/png"/>
                  <label class="input input-sm input-ghost input-bordered bg-transparent px-3 text-sm flex items-center gap-3 overflow-hidden" for="rawFile">
                    <span class="w-28 whitespace-nowrap cursor-pointer"><i class="fa fa-picture-o mr-2"></i> เลือกรูปภาพ</span>
                      <span>{{base64StringName}}</span>
                  </label>
                </div>
                
                <Field
                  name="voucherQrcode"
                  type="hidden"
                  v-model="voucherQrcode"
                />

                <div class="mt-5 w-64">
                  <!-- <div
                    class="img-qr-wrapper h-full w-full object-cover"
                    :style="[ previewQrImage ? { backgroundImage: `url(${previewQrImage})`} : { backgroundImage: `url(${fallbackBgQrUrl})`}]">
                  </div> -->
                  <template v-if="previewQrImage">
                    <img :src="previewQrImage" alt="" />
                  </template>
                  
                </div>

                <div class="invalid-feedback mt-2">{{ errors.voucherQrcode }}</div>

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
            <router-link to="/voucher" class="btn btn-sm px-5 btn-light text-white px-7">
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
import Editor from '@tinymce/tinymce-vue'
import fallbackBgUrl from "@/assets/images/1280x400.png";
import LvDropdown from 'lightvue/dropdown';

const date = ref();

export default {
  name: 'app',
   components: {
     'editor': Editor,
     LvDropdown
  },
  data() {
      return {
        voucherSmartseamanId: '',

        fallbackBgUrl,
        previewImage: null,
        voucherPicture: '',

        fallbackBgQrUrl: '',
        selectedFile: null,
        voucherQrcode: '',
        base64StringName: '',
      };
    },
  computed: {
    background () {
      if(previewImage){
        return !previewImage ? '#fff' : `url(${previewImage}) center no-repeat`;
      }

      if(previewQrImage){
        return !previewQrImage ? '#fff' : `url(${previewQrImage}) center no-repeat`;
      }
      
    },
  },
  methods: {
      selectImage () {
          this.$refs.fileInput.click()
      },
      pickFile () {
        let input = this.$refs.fileInput
        let file = input.files
        if (file && file[0]) {
          let reader = new FileReader
          if(file[0].size > 1024 * 1024){
            alert('กรุณาอัพโหลดไฟล์ไม่เกิน 1MB');
            return;
          } else {
              reader.onload = e => {
              this.previewImage = e.target.result
            }
            reader.readAsDataURL(file[0])
            this.$emit('input', file[0])
          }
        }
      },
      pickFileQr () {
        let input = this.$refs.inputQr
        let file = input.files
        if (file && file[0]) {
          let reader = new FileReader
          if(file[0].size > 1024 * 1024){
            alert('กรุณาอัพโหลดไฟล์ไม่เกิน 1MB');
            return;
          } else {
              reader.onload = e => {
              this.previewQrImage = e.target.result
            }
            reader.readAsDataURL(file[0])
            this.$emit('input', file[0])
          }
        }
      },
      onFileSelected(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.fileName = file.name;

        reader.onload = (event) => {
          this.voucherPicture = event.target.result.split(',')[1].toString();
          this.selectedFile = file;
        };
        reader.readAsDataURL(file);
      },
      onQrSelected(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.fileName = file.name;

        reader.onload = (event) => {
          this.fileCert = event.target.result.split(',')[1].toString();
          this.selectedFile = file;
          this.base64StringName = event.target.fileName;
          this.voucherQrcode = event.target.result.split(',')[1].toString();
        };
        reader.readAsDataURL(file);
      },
  }
}
</script>