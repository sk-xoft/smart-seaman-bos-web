<script setup>
import { Form, Field } from "vee-validate";
import * as Yup from "yup";
import { Alert } from '@/components';
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";

import { useUsersStore, useAlertStore } from "@/stores";
import { router } from "@/router";

import Title from './partial/_title.vue';
import Breadcrumb from './partial/_breadcrumb.vue';
import ForgotPasswordPopup from './partial/_forgot_password_popup.vue';

import { uuid } from 'vue-uuid';

const usersStore = useUsersStore();
const alertStore = useAlertStore();
const route = useRoute();
const id = route.params.id;

const { option_company, option_groups } = storeToRefs(usersStore);

usersStore.fetchOptionCompany();
usersStore.fetchOptionGroup();

let title = "สร้างบัญชีผู้ดูแลระบบ";
let user = null;
const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/

if (id) {
  // edit mode
  title = "แก้ไขบัญชีผู้ดูแลระบบ";
  ({ user } = storeToRefs(usersStore));
  usersStore.getById(id);
}

const schema = Yup.object().shape({
  groupId: Yup.string().required("กรุณาเลือก Group Name"),
  firstName: Yup.string().required("กรุณากรอกชื่อ"),
  lastName: Yup.string().required("กรุณากรอกนามสกุล"),
  positions: Yup.string().required("กรุณากรอกตำแหน่ง"),
  companyCode: Yup.string().required("กรุณาเลือกบริษัท"),
  mobileNumber: Yup.string().required("กรุณากรอกเบอร์โทรศัพท์").matches(phoneRegExp, 'กรุณากรอกรูปแบบเบอร์โทรศัพท์ให้ถูกต้อง').max(10, "กรุณากรอกรูปแบบเบอร์โทรศัพท์ให้ถูกต้อง"),
  email: Yup.string().required("กรุณากรอกอีเมล").email('กรุณากรอกรูปแบบอีเมลให้ถูกต้อง'),
});

async function onSubmit(values) {
  try {
    let message;

    values.groupId = (values.groupId).toString();
    values.username = null;

    if(!values.pictureFromFile){
      values.displayType = "NAME";
      values.profilePicture = values.profilePicture = (uuid.v4()).toString();
      values.pictureFromFile = "";
      values.displayName = (values.firstName).slice(0, 1) + (values.lastName).slice(0, 1);
    } else {
      values.displayType = "PICTURE";
      values.profilePicture = (uuid.v4()).toString();
    }

    console.log(values);

    await usersStore.update(JSON.stringify(values));

    if(usersStore.get_res_code === 'WA00000'){
      message = "แก้ไขบัญชีผู้ใช้เสร็จสิ้น";
      await router.push("/admin-management");
      alertStore.success(message);
    } else {
      message = '"' + usersStore.get_res_desc + '"' + " การสร้างข่าวเกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      await router.push("/admin-management");
      alertStore.error(message);
    }
    
  } catch (error) {
    alertStore.error(error);
  }
}
</script>

<template>
  <Alert/>
  <Title title="จัดการผู้ดูแลระบบ" />
  <Breadcrumb link_menu="/admin-management" name_menu="จัดการผู้ดูแลระบบ" title="แก้ไขบัญชีผู้ดูแลระบบ" />

  <template v-if="!(user?.loading || user?.error)">
    <div class="card overflow-x-auto bg-base-200 mt-5">
      <div class="card-body">
          <h1 class="text-xl mb-5 text-white font-semibold">{{title}}</h1>
        <Form
          @submit="onSubmit"
          :validation-schema="schema"
          :initial-values="user"
          v-slot="{ errors, isSubmitting }"
        >

        <Field name="adminUserId" v-model="adminUserId" type="hidden" />

        <div class="grid grid-cols-1 lg:grid-cols-[_.5fr_1fr] gap-5">
          <Field name="profilePicture" v-model="profilePicture" type="hidden" />

            <div class="flex flex-col items-center mb-5">
              <div class="relative w-full h-24 max-h-24">
                  <template v-if="user.pictureFromFile">
                    <div v-if="!previewImage"
                      class="imagePreviewWrapper h-full w-full"
                      :style="[ user.pictureFromFile ? { backgroundImage: `url(${user.pictureFromFile})`} : { backgroundImage: `url(${fallbackBgUrl})`}]"
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

                <div class="relative max-w-full lg:max-w-[220px]">
                  <div class="edit-wrapper absolute right-2 bottom-2 w-12 h-12 bg-primary p-1 rounded-full cursor-pointer" @click="selectImage">
                    <svg class="icon-camera" width="50" height="30" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clip-path="url(#clip0_218_400)">
                      <path d="M1.33301 2.662C1.33423 2.48692 1.40427 2.31934 1.52802 2.19548C1.65176 2.07161 1.81926 2.0014 1.99434 2H14.005C14.3703 2 14.6663 2.29667 14.6663 2.662V13.338C14.6651 13.5131 14.5951 13.6807 14.4713 13.8045C14.3476 13.9284 14.1801 13.9986 14.005 14H1.99434C1.81888 13.9998 1.65067 13.93 1.52667 13.8059C1.40266 13.6817 1.33301 13.5135 1.33301 13.338V2.662ZM2.66634 3.33333V12.6667H13.333V3.33333H2.66634ZM7.99967 10C8.53011 10 9.03882 9.78929 9.41389 9.41421C9.78896 9.03914 9.99967 8.53043 9.99967 8C9.99967 7.46957 9.78896 6.96086 9.41389 6.58579C9.03882 6.21071 8.53011 6 7.99967 6C7.46924 6 6.96053 6.21071 6.58546 6.58579C6.21039 6.96086 5.99967 7.46957 5.99967 8C5.99967 8.53043 6.21039 9.03914 6.58546 9.41421C6.96053 9.78929 7.46924 10 7.99967 10V10ZM7.99967 11.3333C7.11562 11.3333 6.26777 10.9821 5.64265 10.357C5.01753 9.7319 4.66634 8.88406 4.66634 8C4.66634 7.11595 5.01753 6.2681 5.64265 5.64298C6.26777 5.01786 7.11562 4.66667 7.99967 4.66667C8.88373 4.66667 9.73158 5.01786 10.3567 5.64298C10.9818 6.2681 11.333 7.11595 11.333 8C11.333 8.88406 10.9818 9.7319 10.3567 10.357C9.73158 10.9821 8.88373 11.3333 7.99967 11.3333V11.3333ZM11.333 4H12.6663V5.33333H11.333V4Z" fill="#fff"/>
                      </g>
                      <defs>
                      <clipPath id="clip0_218_400">
                      <rect width="16" height="16" fill="white"/>
                      </clipPath>
                      </defs>
                    </svg>
                  </div>
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

                <template v-if="user.pictureFromFile">
                  <div v-if="!previewImage">
                    <Field
                      name="pictureFromFile"
                      type="hidden"
                      v-model="user.pictureFromFile"
                    />
                  </div>
                  <div v-else>
                     <Field
                      name="pictureFromFile"
                      type="hidden"
                      v-model="base64String"
                    />
                  </div> 
                </template>
                <template v-else>
                  <div>
                     <Field
                      name="pictureFromFile"
                      type="hidden"
                      v-model="base64String"
                    />
                  </div> 
                </template>

                <!-- <Field
                  name="pictureFromFile"
                  type="hidden"
                  v-model="base64String"
                /> -->
                <div class="file-alert invalid-feedback mt-2 text-left w-full">{{ errors.pictureFromFile }}</div>
            </div>

            <div class="form-row mt-56 lg:mt-0 grid grid-cols-1 lg:grid-cols-1 gap-5">
              <div class="form-group grid grid-cols-2">
                <label class="mb-3" :class="{ 'is-invalid': errors.username }">ชื่อผู้ใช้ (ภาษาอังกฤษ)</label>
                <div class="flex flex-col">
                  <input type="text" :value="user.username" class="laceholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent" disabled>
                </div>
              </div>
              <div class="form-group grid grid-cols-2">
                <label class="mb-3" :class="{ 'is-invalid': errors.groupId }">Group Name <span class="required">*</span></label>
                <div class="flex flex-col">
                  <label for="groupId" class="flex flex-col w-full">
                      <Field as="select" v-model="groupId" id="groupId" name="groupId" class="select select-sm input-ghost input-bordered w-full">
                          <option value="" selected>--- เลือก Group Name ---</option>
                          <template v-for="option in option_groups.groups" :key="option.id">
                              <option :value="option.groupId">{{ option.groupName }}</option>
                          </template>
                      </Field>
                  </label>
                  <div class="invalid-feedback mt-2">{{ errors.groupId }}</div>
                </div>
              </div>
              <div class="form-group grid grid-cols-2">
                <label class="mb-2" :class="{ 'is-invalid': errors.firstName }">ชื่อ <span class="required">*</span></label>
                <div class="flex flex-col">
                  <Field
                    name="firstName"
                    type="text"
                    placeholder="ชื่อ"
                    class="placeholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent"
                    :class="{ 'is-invalid': errors.firstName }"
                  />
                  <div class="invalid-feedback mt-2">{{ errors.firstName }}</div>
                </div>
              </div>
              <div class="form-group grid grid-cols-2">
                <label class="mb-2" :class="{ 'is-invalid': errors.lastName }">นามสกุล <span class="required">*</span></label>
                  <div class="flex flex-col">
                    <Field
                    name="lastName"
                    type="text"
                    placeholder="นามสกุล"
                    class="placeholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent"
                    :class="{ 'is-invalid': errors.lastName }"
                  />
                  <div class="invalid-feedback mt-2">{{ errors.lastName }}</div>
                </div>
              </div>
              <div class="form-group grid grid-cols-2">
               <label class="mb-2" :class="{ 'is-invalid': errors.positions }">ตำแหน่ง <span class="required">*</span></label>
                  <div class="flex flex-col">
                    <Field
                      name="positions"
                      type="text"
                      placeholder="ตำแหน่ง"
                      class="placeholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent"
                      :class="{ 'is-invalid': errors.positions }"
                    />
                    <div class="invalid-feedback mt-2">{{ errors.positions }}</div>
                </div>
              </div>
              <div class="form-group grid grid-cols-2">
                <label class="mb-2" :class="{ 'is-invalid': errors.companyCode }">บริษัท <span class="required">*</span></label>
                  <div class="flex flex-col">
                    <Field as="select" v-model="companyCode" id="companyCode" name="companyCode" class="select select-sm input-ghost input-bordered w-full">
                        <option value="" selected>--- เลือก บริษัท ---</option>
                        <template v-for="option in option_company.company" :key="option.id">
                            <option :value="option.companyCode">{{ option.companyName }}</option>
                        </template>
                    </Field>
                    <div class="invalid-feedback mt-2">{{ errors.companyCode }}</div>
                </div>
              </div>
              <div class="form-group grid grid-cols-2">
                 <label class="mb-2" :class="{ 'is-invalid': errors.mobileNumber }">เบอร์โทรศัพท์ <span class="required">*</span></label>
                  <div class="flex flex-col">
                    <Field
                      name="mobileNumber"
                      type="text"
                      placeholder="เบอร์โทรศัพท์ (0xxxxxxxxxx)"
                      class="placeholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent"
                      :class="{ 'is-invalid': errors.mobileNumber }"
                    />
                    <div class="invalid-feedback mt-2">{{ errors.mobileNumber }}</div>
                </div>
              </div>
              <div class="form-group grid grid-cols-2">
                  <label class="mb-3" :class="{ 'is-invalid': errors.email }">อีเมล <span class="required">*</span></label>
                  <div class="flex flex-col">
                      <Field
                      name="email"
                      type="email"
                      placeholder="อีเมล"
                      class="placeholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent"
                      :class="{ 'is-invalid': errors.email }"
                    />
                    <div class="invalid-feedback mt-2">{{ errors.email }}</div>
                </div>
              </div>
              <div class="form-group grid grid-cols-2">
                <label class="mb-2" :class="{ 'is-invalid': errors.userStatus }">สถานะ <span class="required">*</span></label>
                  <div class="flex flex-col">
                    <Field as="select" v-model="userStatus" id="userStatus" name="userStatus" class="select select-sm input-ghost input-bordered w-full">
                        <option value="" selected>--- เลือก สถานะ ---</option>
                        <option value="A" selected>Active</option>
                        <option value="I" selected>Inactive</option>
                    </Field>
                    <div class="invalid-feedback mt-2">{{ errors.userStatus }}</div>
                </div>
              </div>
          </div>
        </div>
          <div class="form-group flex flex-wrap mt-10 justify-center items-center gap-5">
            <!-- <label class="btn btn-sm px-5 btn-primary" for="onDelete" @click="passId(user.adminUserId)">
                <i class="fa fa-unlock-alt mr-3 text-lg"></i>
                ลืมรหัสผ่าน
            </label> -->
            <router-link :to="`/admin-management/edit/${user.adminUserId}/change-password`+ '?username=' + user.username" class="btn btn-sm px-5 btn-outline border-primary btn-text-primary">
                <i class="fa fa-lock mr-3 text-lg btn-text-primary"></i>
                เปลี่ยนรหัสผ่าน
            </router-link>
            <button class="btn btn-sm px-5 btn-primary" :disabled="isSubmitting">
                <i class="fa-solid fa-floppy-disk mr-3 text-lg"></i>
                <span
                    v-show="isSubmitting"
                    class="spinner-border spinner-border-sm mr-1"
                ></span>
                บันทึก
            </button>
            <router-link to="/admin-management" class="btn btn-sm px-5 btn-light text-white px-7">
                <i class="fa-solid fa-ban text-lg mr-2"></i>
                ยกเลิก</router-link>
          </div>
          <ForgotPasswordPopup :id="itemId"/>
        </Form>
      </div>
    </div>
    <div class="card overflow-x-auto bg-base-200 mt-5">
      <div class="card-body">
          <h1 class="text-xl mb-5 text-white font-semibold">Admin Information</h1>
          
          <div class="grid grid-cols-2 gap-7">
            <div class="form-group flex flex-col">
                  <label class="mb-3">วันที่เข้าใช้งานล่าสุด</label>
                  <div class="flex flex-col">
                    <input type="text" :value="user.lastLogon ? convertDateTime(user.lastLogon) : '-'" class="laceholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent" disabled>
                  </div>
              </div>
              <div class="form-group flex flex-col"></div>
              <div class="form-group flex flex-col">
                  <label class="mb-3">สร้างโดย</label>
                  <div class="flex flex-col">
                    <input type="text" :value="user.createBy ? user.createBy : '-'" class="laceholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent" disabled>
                  </div>
              </div>
              <div class="form-group flex flex-col">
                  <label class="mb-3">วันที่สร้าง</label>
                  <div class="flex flex-col">
                    <input type="text" :value="user.createDate ? convertDateTime(user.createDate) : '-'" class="laceholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent" disabled>
                  </div>
              </div>
              <div class="form-group flex flex-col">
                  <label class="mb-3">แก้ไขโดย</label>
                  <div class="flex flex-col">
                    <input type="text" :value="user.updateBy ? user.updateBy : '-'" class="laceholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent" disabled>
                  </div>
              </div>
              <div class="form-group flex flex-col">
                  <label class="mb-3">วันที่แก้ไขล่าสุด</label>
                  <div class="flex flex-col">
                    <input type="text" :value="user.updateDate ? convertDateTime(user.updateDate) : '-'" class="laceholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent" disabled>
                  </div>
              </div>
          </div>
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
import fallbackBgUrl from "@/assets/images/placeimage.jpeg";

const date = ref();

export default {
  name: 'app',
    data() {
        return {
          itemId: 0,
          fallbackBgUrl,
          previewImage: null,
          base64String: '',
          profilePicture: '',
        };
      },
    computed: {
      background () {
          return !previewImage ? '#fff' : `url(${previewImage}) center no-repeat`
      }
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
        convertDateTime(isoDate){
            // Create a new Date object from the input date string
            const inputDate = new Date(isoDate);

            // Format the date to the desired format (mm/dd/yyyy)
            const formattedDate = `${(inputDate.getMonth() + 1).toString().padStart(2, '0')}/${inputDate.getDate().toString().padStart(2, '0')}/${inputDate.getFullYear()}`;

            // Format the time to the desired format (hh:mm:ss)
            const formattedTime = `${inputDate.getHours().toString().padStart(2, '0')}:${inputDate.getMinutes().toString().padStart(2, '0')}:${inputDate.getSeconds().toString().padStart(2, '0')}`;

            // Combine the formatted date and time
            const convertedDateStr = `${formattedDate} ${formattedTime}`;

            return convertedDateStr;
        },
        passId(id) {
            this.itemId = id
        },
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
            this.profilePicture = event.target.fileName;
          // const encodedData = btoa("Hello, world"); // encode a string
          // let decodedData = atob(this.base64String); // decode the string
          };
          reader.readAsDataURL(file);
        },
    }
}
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

  .btn-text-primary{
    color: #d97f3d !important;

    &:hover{
      color: #fff !important;

      i{
        color: #fff !important;
      }
    }
  }

  @media(max-width: 767px){
     .imagePreviewWrapper{
      width: 100%;
      height: 300px;
     }
  }
</style>