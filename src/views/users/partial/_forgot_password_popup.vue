<script setup>
import { Form, Field } from "vee-validate";
import * as Yup from "yup";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";

import { useUsersStore, useAlertStore } from "@/stores";
import { router } from "@/router";

import { uuid } from 'vue-uuid';

const usersStore = useUsersStore();
const alertStore = useAlertStore();
const route = useRoute();
const id = route.params.id;

const { option_company, option_groups } = storeToRefs(usersStore);

usersStore.fetchOptionCompany();
usersStore.fetchOptionGroup();

let user = null;
const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/

if (id) {
  // edit mode
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
    <input type="checkbox" id="onDelete" class="modal-toggle" />
    <label for="onDelete" class="modal cursor-pointer modal-bottom sm:modal-middle">
        <label class="modal-box relative p-0" for="">
            <div class="modal-header p-5 border-b-[1px] border-slate-600">
                <label for="onDelete" class="btn btn-sm btn-circle absolute right-4 top-4">✕</label>
                <h3 class="text-lg font-semibold text-white">ลืมรหัสผ่าน !</h3>
            </div>
            <div class="modal-body p-5">
                <p class="py-4">กรุณากรอกอีเมลที่ใช้สร้าง Admin User</p>

                <Form
                    @submit="onSubmit"
                    :validation-schema="schema"
                >

                    <Field name="adminUserId" :value="id" type="hidden" />

                    <div class="form-group flex flex-col">
                        <label class="mb-3">อีเมล <span class="required">*</span></label>
                        <div class="flex flex-col">
                            <Field
                            name="email"
                            type="email"
                            placeholder="อีเมล"
                            class="placeholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent"
                        
                            />
                        </div>
                    </div>

                    <div class="form-group flex mt-10 justify-center items-center gap-5">
                        <button class="btn btn-sm px-5 btn-primary">
                            <i class="fa fa-check mr-3 text-lg"></i>
                            <span
                                class="spinner-border spinner-border-sm mr-1"
                            ></span>
                            ใช่
                        </button>
                        <label class="btn btn-sm px-5 btn-light text-white px-7" for="onDelete">
                            <i class="fa fa-times mr-2 text-lg" aria-hidden="true"></i> ไม่ใช่
                        </label>
                    </div>
                </Form>
            </div>
            <!-- <div class="modal-footer p-5 border-t-[1px] border-slate-600 flex gap-3 justify-end">
                <label class="btn btn-sm px-5 btn-secondary text-white px-7" @click="usersStore.delete(id)" for="onDelete">
                    <i class="fa fa-trash mr-2" aria-hidden="true"></i> ใช่
                </label>
                <label class="btn btn-sm px-5 btn-light text-white px-7" for="onDelete">
                    <i class="fa fa-times mr-2 text-lg" aria-hidden="true"></i> ไม่ใช่
                </label>
            </div> -->
        </label>
    </label>
</template>

<script>
export default {
    props: {
        id: {
            required: true
        }
    },
}
</script>