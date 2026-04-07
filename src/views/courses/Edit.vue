<script setup>
import { Form, Field } from "vee-validate";
import * as Yup from "yup";
import { useRoute } from "vue-router";
import { storeToRefs, mapState } from "pinia";
import { ref } from 'vue'

import { useUsersStore, useAlertStore, useCoursesStore } from "@/stores";
import { router } from "@/router";

import Title from './partial/_title.vue';
import Breadcrumb from './partial/_breadcrumb.vue';

const usersStore = useUsersStore();
const alertStore = useAlertStore();
const coursesStore = useCoursesStore();

const { courses, option_courses, option_schools, option_schools_active, one_option } = storeToRefs(coursesStore);

coursesStore.fetchOptionCourses();
coursesStore.fetchOptionSchools();
coursesStore.clearStateOption();

const route = useRoute();
const id = route.params.id;

let title = "เพิ่มคอร์ส";
let course = null;

const courseCode = ref('');
const courseSchoolCode = ref(option_schools_active);
let courseType = ref('BOTH');
const courseOnlineDate = ref('');
const courseOnsiteDate = ref('');
let courseColour = ref('#DA8343');
let test;

if (id) {
  // edit mode
  courseType = ref('');
  courseColour = ref('');
  title = "แก้ไขคอร์ส";
  coursesStore.getById(id);

  ({ course } = storeToRefs(coursesStore));
  
}

const schema = Yup.object().shape({
  // date_online: Yup.date().required("กรุณาเลือกวันอบรมออนไลน์").nullable(),
  courseCode: Yup.string().required("กรุณาเลือกหลักสูตร"),
  courseSchoolCode: Yup.string().required("กรุณาเลือกโรงเรียน/สถาบัน"),
  courseType: Yup.string().required("กรุณาเลือกรูปแบบการอบรม"),
  courseTotalDays: Yup.string().required("กรุณาระบุจำนวนวันอบรม"),
  coursePrice: Yup.number().required("กรุณาระบุราคา"),
  courseOnlineDate: Yup.array().nullable().notRequired().when("courseType", {
    is: (val) => val === "ONLINE" || val === "BOTH",
    then: Yup.array().nullable().required("กรุณาระบุวันที่อบรมออนไลน์"),
    otherwise: Yup.array().notRequired()
  }),
  courseOnsiteDate: Yup.array().nullable().notRequired().when("courseType", {
    is: (val) => val === "ONSITE" || val === "BOTH",
    then: Yup.array().nullable().required("กรุณาระบุวันที่อบรมออนไซต์"),
    otherwise: Yup.array().notRequired()
  }),
});

async function onSubmit(values) {
  try {
    let message;
    if (course) {
      values.coursePrice = parseFloat(values.coursePrice);

      if(values.courseType == "ONLINE"){
        values.courseOnsiteDate = "";

        if(values.courseOnlineDate){
          values.courseOnlineDate = dateString(values.courseOnlineDate).toString().replaceAll(",", ", ");
        }

      } else if (values.courseType == "ONSITE"){
        values.courseOnlineDate = "";

        if(values.courseOnsiteDate){
          values.courseOnsiteDate = dateString(values.courseOnsiteDate).toString().replaceAll(",", ", ");
        }
      } else {
        if(values.courseOnlineDate){
          values.courseOnlineDate = dateString(values.courseOnlineDate).toString().replaceAll(",", ", ");
        }
        if(values.courseOnsiteDate){
          values.courseOnsiteDate = dateString(values.courseOnsiteDate).toString().replaceAll(",", ", ");
        }
      }
      
      values.courseColour = values.courseColour.substring(1);
      values.courseStatus = 'A';

      // console.log(JSON.stringify(values));
      await coursesStore.update(JSON.stringify(values));
      message = "แก้ไขคอร์สอบรมเสร็จสิ้น";

    } 
    await router.push("/courses");
    alertStore.success(message);
  } catch (error) {
    alertStore.error(error);
  }
}

function dateString(date){
  const courseOnlineDateStrings = date.map(date => { 
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  });

  return courseOnlineDateStrings;
}
//:initial-values="course.courseList[0]"
</script>

<template>
    <Title title="คอร์สอบรม" />
    <Breadcrumb link_menu="/courses" name_menu="คอร์สอบรม" title="แก้ไขคอร์สอบรม" />
    
  <template v-if="!(course?.loading || course?.error)">
    <div class="card bg-base-200 mt-5">
      <div class="card-body">
          <h1 class="text-xl mb-5 text-white font-semibold">{{title}}</h1>
          <Form
            @submit="onSubmit"
            :validation-schema="schema"
            :initial-values="course"
            v-slot="{ errors, isSubmitting }"
          >

          <Field type="hidden" name="courseId" :value="course.courseId" />

        <div class="form-row grid grid-cols-1 lg:grid-cols-2 gap-5 mb-3">
            <div class="form-group flex flex-col">
              <label class="mb-3" :class="{ 'is-invalid': errors.courseCode }">หลักสูตร <span class="required">*</span></label>
              <Field as="select" v-model="courseCode" id="courseCode" name="courseCode" class="select select-sm select-bordered bg-transparent" :class="{ 'is-invalid': errors.courseCode }">
                <option value="" selected>----- เลือกหลักสูตร -----</option>
                <template v-for="option_course in option_courses.allCourses" :key="option_course.id">
                  <option :value="option_course.courseCode">{{ option_course.courseDisplayName }}</option>
                </template>
              </Field>
              <div class="invalid-feedback mt-2">{{ errors.courseCode }}</div>
            </div>

            <div class="form-group flex flex-col">
              <label class="mb-3" :class="{ 'is-invalid': errors.school }">โรงเรียน/สถาบัน <span class="required">*</span></label>
              <Field as="select" v-model="courseSchoolCode" id="courseSchoolCode" name="courseSchoolCode" class="select select-sm select-bordered bg-transparent" :class="{ 'is-invalid': errors.courseSchoolCode }">
                <template v-if="one_option === 1 && one_option != null">
                    <template v-for="option_school in option_schools.schools" :key="option_school.id">
                        <option :value="option_school.schoolCode">{{ option_school.schoolName }}</option>
                    </template>
                </template>
                <template v-else>
                    <option value="" selected>----- เลือกโรงเรียน/สถาบัน -----</option>
                    <template v-for="option_school in option_schools.schools" :key="option_school.id">
                        <option :value="option_school.schoolCode">{{ option_school.schoolName }}</option>
                    </template>
                </template>
                <!-- <option value="" selected>----- เลือกโรงเรียน/สถานบัน -----</option>
                <template v-for="option_school in option_schools.schools" :key="option_school.id">
                  <option :value="option_school.schoolCode">{{ option_school.schoolName }}</option>
                </template> -->
              </Field>
              <div class="invalid-feedback mt-2">{{ errors.courseSchoolCode }}</div>
            </div>
        </div>
        <div class="form-row grid grid-cols-1 gap-5 mb-3">
          <div class="form-group flex flex-col">
              <label class="mb-3" :class="{ 'is-invalid': errors.courseType }">รูปแบบการอบรม <span class="required">*</span></label>
              <Field as="select" v-model="course.courseType" id="courseType" name="courseType" class="select select-sm select-bordered bg-transparent" :class="{ 'is-invalid': errors.courseType }">
                <option :value="`BOTH`">ออนไลน์+ออนไซต์</option>
                <option :value="`ONLINE`">ออนไลน์</option>
                <option :value="`ONSITE`">ออนไซต์</option>
              </Field>
              <div class="invalid-feedback mt-2">{{ errors.courseType }}</div>
            </div>
        </div>
        <div class="form-row grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <div class="form-group flex flex-col" v-if="course.courseType === 'ONLINE' || course.courseType === 'BOTH'">
              <label class="mb-3" :class="{ 'is-invalid': errors.courseOnlineDate }">วันอบรม ออนไลน์ <span class="required">*</span></label>
              <template v-if="course.courseOnlineDate">
                <Field v-model="courseOnlineDate" type="text" name="courseOnlineDate" v-slot="{ fieldOnline }">
                  <VueDatePicker
                    id="courseOnlineDate"
                    name="courseOnlineDate"
                    v-model="course.courseOnlineDate" 
                    v-bind="fieldOnline"
                    :format="courseOnlineDateFormat" 
                    dark="true"
                    placeholder="เลือกวันอบรมออนไลน์" 
                    text-input 
                    multi-dates 
                    :enable-time-picker="false"
                  />
                </Field>
                <div class="invalid-feedback mt-2">{{ errors.courseOnlineDate }}</div>
              </template>
              <template v-else>
                <Field v-model="courseOnlineDate" type="text" name="courseOnlineDate" v-slot="{ fieldOnline }">
                  <VueDatePicker
                    id="courseOnlineDate"
                    name="courseOnlineDate"
                    v-model="courseOnlineDate" 
                    v-bind="fieldOnline"
                    :format="courseOnlineDateFormat" 
                    dark="true"
                    placeholder="เลือกวันอบรมออนไลน์" 
                    text-input 
                    multi-dates 
                    :enable-time-picker="false"
                  />
                </Field>
                <div class="invalid-feedback mt-2">{{ errors.courseOnlineDate }}</div>
              </template>
          </div>
          <div class="flex gap-3">
            <div class="form-group flex flex-col flex-1" v-if="course.courseType === 'ONSITE' || course.courseType === 'BOTH'">
              <label class="mb-3" :class="{ 'is-invalid': errors.courseOnsiteDate }">วันอบรม ออนไซต์ <span class="required">*</span></label>
              <template v-if="course.courseOnsiteDate">
                <Field v-model="courseOnsiteDate" type="text" name="courseOnsiteDate" v-slot="{ fieldOnsite }">
                  <VueDatePicker v-bind="fieldOnsite" v-model="course.courseOnsiteDate" :format="courseOnsiteDateFormat" dark="true" placeholder="เลือกวันวันอบรมออนไซต์" text-input multi-dates :enable-time-picker="false" />
                </Field>
                <div class="invalid-feedback mt-2">{{ errors.courseOnlineDate }}</div>
              </template>
              <template v-else>
                <Field v-model="courseOnsiteDate" type="text" name="courseOnsiteDate" v-slot="{ fieldOnsite }">
                  <VueDatePicker v-bind="fieldOnsite" v-model="courseOnsiteDate" :format="courseOnsiteDateFormat" dark="true" placeholder="เลือกวันวันอบรมออนไซต์" text-input multi-dates :enable-time-picker="false" />
                </Field>
                <div class="invalid-feedback mt-2">{{ errors.courseOnlineDate }}</div>
              </template>
              <div class="invalid-feedback mt-2">{{ errors.courseOnsiteDate }}</div>
            </div>
            <div class="form-group flex flex-col">
                <label class="mb-3" :class="{ 'is-invalid': errors.courseColour }">สี <span class="required">*</span></label>
                <div class="input input-sm input-ghost input-bordered bg-transparent flex justify-center items-center">
                  <Field v-model="courseColour" type="text" name="courseColour" id="courseColour" v-slot="{ fieldColour }">
                       <LvColorpicker 
                        v-bind="fieldColour"
                        class="dark-color"
                        v-model="course.courseColour"
                        :value="course.courseColour"
                        :colors="[
                          '#FFA500',
                          '#0000FF',
                          '#00FF00',
                          '#FF0000',
                          '#FFFF00',
                          '#FF00FF',
                          '#7FFFD4',
                          '#FFA07A',
                          '#00BFFF',
                          '#FFC0CB'
                        ]"
                        withoutInput
                      />
                  </Field>
                </div>
                <div class="invalid-feedback mt-2">{{ errors.courseColour }}</div>
            </div>
          </div>
        </div>
        <div class="form-row grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <div class="form-group flex flex-col">
              <label class="mb-3" :class="{ 'is-invalid': errors.courseTotalDays }">จำนวนวันอบรบ (ออนไลน์+ออนไซต์) <span class="required">*</span></label>
              <Field
                name="courseTotalDays"
                type="text"
                placeholder="จำนวนวันอบรบ (ออนไลน์+ออนไซต์)"
                class="placeholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent"
                :class="{ 'is-invalid': errors.courseTotalDays }"
              />
              <div class="invalid-feedback mt-2">{{ errors.courseTotalDays }}</div>
            </div>
            <div class="form-group flex flex-col">
              <label class="mb-3" :class="{ 'is-invalid': errors.coursePrice }">ราคา (บาท) <span class="required">*</span></label>
              <Field
                name="coursePrice"
                type="number"
                placeholder="ราคา (บาท)"
                class="placeholder:italic placeholder:text-slate-400 input input-sm input-ghost input-bordered bg-transparent"
                :class="{ 'is-invalid': errors.coursePrice }"
              />
              <div class="invalid-feedback mt-2">{{ errors.coursePrice }}</div>
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
            <router-link to="/courses" class="btn btn-sm px-5 btn-light text-white px-7">
                <i class="fa-solid fa-ban text-lg mr-2"></i>
                ยกเลิก</router-link>
          </div>
        </Form>
      </div>
    </div>
  </template>
  <template v-if="course?.loading">
    <div class="text-center m-5">
      <span class="spinner-border spinner-border-lg align-center"></span>
    </div>
  </template>
  <template v-if="course?.error">
    <div class="text-center m-5">
      <div class="text-danger">Error loading course: {{ course.error }}</div>
    </div>
  </template>
</template>

<script>
import LvColorpicker from 'lightvue/color-picker';

export default {
  components: {
      LvColorpicker
  },
  data() {
    return {
      courseOnlineDateFormat: 'dd/MM/yyyy',
      courseOnsiteDateFormat: 'dd/MM/yyyy',
    };
  },
};

</script>