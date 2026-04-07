<script setup>
import { Form, Field } from "vee-validate";
import * as Yup from "yup";
import { useRoute } from "vue-router";
import { storeToRefs, mapState } from "pinia";
import { ref } from 'vue'

import { useUsersStore, useAlertStore, useNewsesStore } from "@/stores";
import { router } from "@/router";

import Title from './partial/_title.vue';
import Breadcrumb from './partial/_breadcrumb.vue';

import { uuid } from 'vue-uuid';

const usersStore = useUsersStore();
const alertStore = useAlertStore();
const newsesStore = useNewsesStore();

const { newses } = storeToRefs(newsesStore);

const route = useRoute();
const id = route.params.id;

let title = "เพิ่มข่าวสาร";
let news = null;

if (id) {
  // edit mode
  title = "แก้ไขข่าวสาร";
  ({ news } = storeToRefs(newsesStore));
  newsesStore.getById(id);
}

const schema = Yup.object().shape({
  newsTitle: Yup.string().required("กรุณากรอกหัวข้อข่าว"),
  newsType: Yup.string().required("กรุณากรอกประเภทข่าว"),
  newsDetails: Yup.string().required("กรุณากรอกเนื้อหาข่าว"),
  newsStatus: Yup.string().required("กรุณาระบุสถานะข่าว"),
});

async function onSubmit(values) {
  try {
    let message;

    let rawString = values.newsDetails;
    values.newsDetails = rawString.replace(/\n/g, '');

    if(!values.newsPictureFromFile){
      values.newsPictureFromFile =  "";
    }

    await newsesStore.update(JSON.stringify(values));

    if(newsesStore.get_res_code === 'WA00000'){
      message = "แก้ไขข่าวสารเสร็จสิ้น";
      await router.push("/news");
      alertStore.success(message);
    } else {
      message = '"' + newsesStore.get_res_desc + '"' + " การสร้างข่าวเกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      await router.push("/news");
      alertStore.error(message);
    }

  } catch (error) {
    alertStore.error(error);
  }
}
</script>

<template>
    <Title title="ข่าวสาร" />
    <Breadcrumb link_menu="/news" name_menu="ข่าวสาร" title="แก้ไขข่าวสาร" />

  <template v-if="!(user?.loading || user?.error)">
    <div class="card bg-base-200 mt-5">
      <div class="card-body">
          <h1 class="text-xl mb-5 text-white font-semibold">{{title}}</h1>
          <Form
            @submit="onSubmit"
            :validation-schema="schema"
            :initial-values="news"
            v-slot="{ errors, isSubmitting }"
          >

            <Field name="newsId" type="hidden" :value="news.newsId" />
            <Field name="newsPictureFileName" v-model="news.newsPictureFileName" type="hidden" />

            <div class="mb-2">
                <label class="mb-2">รูปภาพหน้าปกข่าวสาร (ขนาดไฟล์ไม่เกิน 1 MB)</label>
            </div>
            <div class="flex flex-col justify-center items-center mb-5">
              <div class="relative w-full h-56 max-h-56">
                  <template v-if="news.imageBase64">
                    <div v-if="!previewImage"
                      class="imagePreviewWrapper h-full w-full"
                      :style="[ news.base64Image ? { backgroundImage: `url(${news.base64Image})`} : { backgroundImage: `url(${fallbackBgUrl})`}]"
                      @click="selectImage">
                    </div>
                    <div v-else
                      class="imagePreviewWrapper h-full w-full"
                      :style="[ previewImage ? { backgroundImage: `url(${previewImage})`} : { backgroundImage: `url(${fallbackBgUrl})`}]"
                      @click="selectImage">
                    </div> 
                  </template>
                  <template v-else>
                    <div 
                      class="imagePreviewWrapper h-full w-full"
                      :style="[ previewImage ? { backgroundImage: `url(${previewImage})`} : { backgroundImage: `url(${fallbackBgUrl})`}]"
                      @click="selectImage">
                    </div> 
                  </template>

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

                <template v-if="news.imageBase64">
                  <div v-if="!previewImage">
                    <Field
                      name="newsPictureFromFile"
                      type="hidden"
                      v-model="news.imageBase64"
                    />
                  </div>
                  <div v-else>
                     <Field
                      name="newsPictureFromFile"
                      type="hidden"
                      v-model="base64String"
                    />
                  </div> 
                </template>
                <template v-else>
                  <div>
                     <Field
                      name="newsPictureFromFile"
                      type="hidden"
                      v-model="base64String"
                    />
                  </div> 
                </template>
            </div>

        <div class="form-row grid grid-cols-1 lg:grid-cols-2 gap-5 mb-3">
            <div class="form-group flex flex-col">
              <label class="mb-2" :class="{ 'is-invalid': errors.newsTitle }">หัวข้อข่าว <span class="required">*</span></label>
              <Field
                name="newsTitle"
                type="text"
                placeholder="หัวข้อข่าว"
                class="placeholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent"
                :class="{ 'is-invalid': errors.newsTitle }"
              />
              <div class="invalid-feedback mt-2">{{ errors.newsTitle }}</div>
            </div>

            <div class="form-group flex flex-col">
              <label class="mb-2" :class="{ 'is-invalid': errors.newsType }">ประเภทข่าว <span class="required">*</span></label>
              <Field as="select" v-model="newsType" id="newsType" name="newsType" class="select select-sm select-bordered bg-transparent" :class="{ 'is-invalid': errors.newsType }">
                  <option value="" selected>----- เลือกประเภทข่าว -----</option>
                  <option :value="`GENERAL`">บทความทั่วไป</option>
                  <option :value="`SHIP`">ข่าวสารงานเรือ</option>
              </Field>
              <div class="invalid-feedback mt-2">{{ errors.newsType }}</div>
            </div>
          </div>

          <div class="form-row grid grid-cols-1 gap-5">
            <label :class="{ 'is-invalid': errors.newsDetails }">เนื้อหาข่าว <span class="required">*</span></label>
              <Field v-model="newsDetails" name="newsDetails" v-slot="{ fieldDetails }">
              <editor
                  id="newsDetails"
                  name="newsDetails"
                  v-model="newsDetails"
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
              <div class="invalid-feedback mt-2">{{ errors.newsDetails }}</div>
          </div>
          <div class="form-row grid grid-cols-1 lg:grid-cols-2 gap-5 mb-3">
            <div class="form-group flex flex-col">
              <label class="mb-2" :class="{ 'is-invalid': errors.newsStatus }">สถานะ <span class="required">*</span></label>
              <Field as="select" v-model="newsStatus" id="newsStatus" name="newsStatus" class="select select-sm select-bordered bg-transparent" :class="{ 'is-invalid': errors.newsStatus }">
                  <option value="" selected>----- เลือกสถานะ -----</option>
                  <option :value="`A`">Published</option>
                  <option :value="`P`">Pending</option>
              </Field>
              <div class="invalid-feedback mt-2">{{ errors.newsStatus }}</div>
            </div>
            <div class="form-group flex flex-col">
              <label class="mb-2">วันที่โพสต์ </label>
              <input type="text" disabled :value="convertDateFormat(news.createDate)" class="placeholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered p-0 bg-transparent">
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
            <router-link to="/news" class="btn btn-sm px-5 btn-light text-white px-7">
                <i class="fa-solid fa-ban text-lg mr-2"></i>
                ยกเลิก</router-link>
          </div>
        </Form>
      </div>
    </div>
  </template>
  <template v-if="news?.loading">
    <div class="text-center m-5">
      <span class="spinner-border spinner-border-lg align-center"></span>
    </div>
  </template>
  <template v-if="news?.error">
    <div class="text-center m-5">
      <div class="text-danger">Error loading user: {{ news.error }}</div>
    </div>
  </template>
</template>

<script>
import { ref } from 'vue';
import Editor from '@tinymce/tinymce-vue'
import fallbackBgUrl from "@/assets/images/1280x400.png";
const date = ref();

export default {
  name: 'app',
   components: {
     'editor': Editor
  },
  data() {
      return {
        fallbackBgUrl,
        previewImage: null,
        base64String: '',
        newsPictureFileName: '',
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
          this.newsPictureFileName = event.target.fileName;
        };
        reader.readAsDataURL(file);
      },
      convertDateFormat(isoDate){
        const date = new Date(isoDate);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear().toString();

        const convertedDateString = `${day}/${month}/${year}`;

        return convertedDateString;
      }
  }
}
</script>