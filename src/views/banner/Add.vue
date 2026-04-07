<script setup>
import { Form, Field } from "vee-validate";
import * as Yup from "yup";
import { useRoute } from "vue-router";
import { storeToRefs, mapState } from "pinia";
import { ref } from 'vue'

import { useUsersStore, useAlertStore, useBannersStore } from "@/stores";
import { router } from "@/router";

import Title from './partial/_title.vue';
import Breadcrumb from './partial/_breadcrumb.vue';

import { uuid } from 'vue-uuid';

const usersStore = useUsersStore();
const alertStore = useAlertStore();
const bannersStore = useBannersStore();

const { banners } = storeToRefs(bannersStore);

const route = useRoute();
const id = route.params.id;

let title = "เพิ่มแบนเนอร์";
let banner = null;
let bannerSeq = ref('');

const schema = Yup.object().shape({
  bannerName: Yup.string().required("กรุณากรอกชื่อแบนเนอร์"),
  bannerFromFile: Yup.string().required("กรุณาอัพโหลดรูปภาพหน้าปก"),
  bannerSeq: Yup.string().required("กรุณาเลือกลำดับการแสดง"),
});

async function onSubmit(values) {
  try {
    let message;

    // values.bannerFileName = (uuid.v4()+'.pdf').toString();

    await bannersStore.create(JSON.stringify(values));
    message = "สร้างแบนเนอร์เสร็จสิ้น";

    await router.push("/banner");
    alertStore.success(message);
  } catch (error) {
    alertStore.error(error);
  }
}
</script>

<template>
    <Title title="โฆษณาแบนเนอร์" />
    <Breadcrumb link_menu="/banner" name_menu="โฆษณาแบนเนอร์" title="เพิ่มโฆษณาแบนเนอร์" />

  <template v-if="!(banner?.loading || banner?.error)">
    <div class="card bg-base-200 mt-5">
      <div class="card-body">
          <h1 class="text-xl mb-5 text-white font-semibold">{{title}}</h1>
          <Form
            @submit="onSubmit"
            :validation-schema="schema"
            v-slot="{ errors, isSubmitting }"
          >

            <Field name="bannerFileName" v-model="bannerFileName" type="hidden" />

            <div class="mb-2">
                <label class="mb-2" :class="{ 'is-invalid': errors.bannerFromFile }">รูปภาพหน้าปก (ขนาดไฟล์ไม่เกิน 1 MB)<span class="required">*</span></label>
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
                  name="bannerFromFile"
                  type="hidden"
                  v-model="base64String"
                />
                <div class="file-alert invalid-feedback mt-2 text-left w-full">{{ errors.bannerFromFile }}</div>
            </div>

            <div class="form-row grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div class="form-group flex flex-col">
                <label class="mb-2" :class="{ 'is-invalid': errors.bannerName }">ชื่อแบนเนอร์ <span class="required">*</span></label>
                <Field
                  name="bannerName"
                  type="text"
                  placeholder="ชื่อแบนเนอร์"
                  class="placeholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent"
                  :class="{ 'is-invalid': errors.bannerName }"
                />
                <div class="invalid-feedback mt-2">{{ errors.bannerName }}</div>
              </div>

              <div class="form-group flex flex-col">
                <label class="mb-2" :class="{ 'is-invalid': errors.bannerSeq }">ลำดับการแสดง <span class="required">*</span></label>
                <Field as="select" v-model="bannerSeq" id="bannerSeq" name="bannerSeq" class="select select-sm select-bordered bg-transparent" :class="{ 'is-invalid': errors.bannerSeq }">
                  <option value="">--- กรุณาเลือก ---</option>
                  <option :value="`1`">1</option>
                  <option :value="`2`">2</option>
                  <option :value="`3`">3</option>
                  <option :value="`4`">4</option>
                  <option :value="`5`">5</option>
                  <option :value="`6`">6</option>
                  <option :value="`7`">7</option>
                  <option :value="`8`">8</option>
                  <option :value="`9`">9</option>
                  <option :value="`10`">10</option>
                </Field>
                <div class="invalid-feedback mt-2">{{ errors.bannerSeq }}</div>
              </div>
              </div>
              <div class="form-group flex mt-10 justify-center items-center gap-5">
                <button class="btn btn-sm btn-primary px-5" :disabled="isSubmitting">
                    <i class="fa-solid fa-floppy-disk mr-3 text-lg"></i>
                    <span
                        v-show="isSubmitting"
                        class="spinner-border spinner-border-sm mr-1"
                    ></span>
                    บันทึก
                </button>
                <router-link to="/banner" class="btn btn-sm btn-light px-5">
                    <i class="fa-solid fa-ban text-lg mr-2"></i>
                    ยกเลิก</router-link>
              </div>
          </Form>
      </div>
    </div>
  </template>
  <template v-if="banner?.loading">
    <div class="text-center m-5">
      <span class="spinner-border spinner-border-lg align-center"></span>
    </div>
  </template>
  <template v-if="banner?.error">
    <div class="text-center m-5">
      <div class="text-danger">Error loading banner: {{ banner.error }}</div>
    </div>
  </template>
</template>

<script>
import { ref } from 'vue';
import fallbackBgUrl from "@/assets/images/1280x400.png";
const date = ref();

export default {
  data() {
      return {
        fallbackBgUrl,
        previewImage: null,
        //selectedFile: null,
        base64String: '',
        bannerFileName: '',
      };
    },
  computed: {
    background () {
        return !previewImage ? '#fff' : `url(${previewImage}) center no-repeat`
    }
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
      onFileSelected(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.fileName = file.name;

        reader.onload = (event) => {
          this.base64String = event.target.result.split(',')[1].toString();
          this.selectedFile = file;
          this.bannerFileName = event.target.fileName;
        // const encodedData = btoa("Hello, world"); // encode a string
        // let decodedData = atob(this.base64String); // decode the string
        };
        reader.readAsDataURL(file);
      },
  }
}
</script>
