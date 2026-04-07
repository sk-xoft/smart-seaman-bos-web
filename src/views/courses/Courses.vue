<script setup>
import { Form, Field } from "vee-validate";
import { Alert } from '@/components';
import { storeToRefs } from 'pinia';
import { useAuthStore, useCoursesStore } from '@/stores';

import Title from './partial/_title.vue';
import Breadcrumb from './partial/_breadcrumb.vue';
import ConfirmPopup from './partial/_confirm_popup.vue';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const coursesStore = useCoursesStore();
const { courses, option_courses, option_schools, state_search_data, option_schools_active, one_option, perPage } = storeToRefs(coursesStore);

coursesStore.fetchOptionCourses();
coursesStore.fetchOptionSchools();
coursesStore.refreshData();
coursesStore.refreshStateSearch();
coursesStore.clearStateOption();

const courseSchoolCode = option_schools_active;

// coursesStore.getAllCourses();

async function onSubmit(values) {
  try {

    if( !values.courseCode ){
        values.courseCode = null;
    } 

    if( !values.courseSchoolCode ){
        values.courseSchoolCode = null;
    }
    
    coursesStore.getSearchCourses(values);

  } catch (error) {
      console.log(error);
    // alertStore.error(error);
  }
}

</script>

<template>
    <Alert/>
    <Title title="คอร์สอบรม" />
    <Breadcrumb link_menu="/courses" name_menu="คอร์สอบรม" title="ค้นหา" />
    
    <div class="card bg-base-200 my-7">
        <div class="card-body p-5 pb-9">
            <h3 class="text-lg text-white font-semibold mb-3">เงื่อนไขในการค้นหา</h3>
            <Form
                @submit="onSubmit"
                ref="form"
                :initial-values="state_search_data"
                v-slot="{ isSubmitting }"
            >
                <Field type="hidden" id="size" name="size" v-model="size" />
                <Field type="hidden" id="lastNum" name="lastNum" v-model="lastNum" />

                <div class="flex flex-col lg:flex-row justify-evenly items-center gap-7 w-full">
                    <label for="search" class="flex flex-col w-full">
                        <span class="mb-2">หลักสูตร</span>
                        <Field as="select" v-model="courseCode" id="courseCode" name="courseCode" class="select select-sm input-ghost input-bordered w-full">
                            <option value="" selected>ทั้งหมด</option>
                            <template v-for="option_course in option_courses.allCourses" :key="option_course.id">
                            <option :value="option_course.courseCode">{{ option_course.courseDisplayName }}</option>
                            </template>
                        </Field>
                    </label>

                    <label for="search" class="flex flex-col w-full">
                        <span class="mb-2">โรงเรียน/สถาบัน</span>
                        <Field as="select" v-model="courseSchoolCode" id="courseSchoolCode" name="courseSchoolCode" class="select select-sm input-ghost input-bordered w-full">
                            <template v-if="one_option === 1 && one_option != null">
                                <template v-for="option_school in option_schools.schools" :key="option_school.id">
                                    <option :value="option_school.schoolCode">{{ option_school.schoolName }}</option>
                                </template>
                            </template>
                            <template v-else>
                                <option value="" selected>ทั้งหมด</option>
                                <template v-for="option_school in option_schools.schools" :key="option_school.id">
                                    <option :value="option_school.schoolCode">{{ option_school.schoolName }}</option>
                                </template>
                            </template>
                        </Field>
                    </label>

                     <button class="btn btn-sm px-5 btn-primary mb-2 m-auto mt-7" :disabled="isSubmitting" @click="handleSearch">
                        <i class="fa fa-search mr-3 text-normal"></i>
                        <span
                            v-show="isSubmitting"
                            class="spinner-border spinner-border-sm mr-1"
                        ></span>
                        <span class="text-normal">ค้นหา</span>
                    </button>
                </div>
            </Form>
        </div>
    </div>
        
    <div class="flex justify-end mb-3">
        <router-link class="btn btn-sm px-5 btn-primary mb-2" :to="`/courses/add`">
            <i class="fa fa-plus mr-3 text-xl"></i>
            เพิ่ม
        </router-link>
    </div>
    <div class="card overflow-x-auto bg-base-200">
        <div class="card-body pr-7">
            <h3 class="text-lg text-white font-semibold mb-3">ผลการค้นหา</h3>
            <table class="table table-striped lg:table-fixed w-full rounded-none">
            <thead class="text-center">
                <tr>
                    <th class="bg-base-300 w-14 p-3">ลำดับที่</th>
                    <th class="bg-base-300 whitespace-normal p-3" colspan="2">หลักสูตร</th>
                    <th class="bg-base-300 whitespace-normal p-3">โรงเรียน/สถาบัน</th>
                    <th class="bg-base-300 whitespace-normal w-28 p-3">วันที่อบรม<br/>(ออนไลน์)</th>
                    <th class="bg-base-300 whitespace-normal w-28 p-3">วันที่อบรม<br/>(ออนไซต์)</th>
                    <th class="bg-base-300 whitespace-normal w-20 p-3">เวลาเรียน<br/>(วัน)</th>
                    <th class="bg-base-300 whitespace-normal w-20 p-3">ราคา</th>
                    <th class="bg-base-300 whitespace-normal w-28 p-3">Actions</th>
                </tr>
            </thead>
            <tbody class="text-center">
                <template v-if="courses">
                    <tr v-for="course in courses.courseList" :key="course.id">
                        <td class="whitespace-normal w-14 p-3">{{ course.courseNum }}</td>
                        <td class="whitespace-normal p-3" colspan="2">{{ course.courseNameTh }}<br>{{ course.courseNameEn }}</td>
                        <td class="whitespace-normal p-3">{{ course.courseSchoolName }}</td>
                        <td class="whitespace-normal w-28 p-3">{{ course.courseOnlineDate ? course.courseOnlineDate : '-' }}</td>
                        <td class="whitespace-normal w-28 p-3">{{ course.courseOnsiteDate ? course.courseOnsiteDate : '-' }}</td>
                        <td class="whitespace-normal w-20 p-3">{{ course.courseTotalDays }} วัน</td>
                        <td class="whitespace-normal w-20 p-3">{{ course.coursePrice }} บาท</td>
                        <td class="w-28 p-3" style="white-space: nowrap">
                            <router-link :to="`/courses/edit/${course.courseId}`" class="btn btn-sm btn-primary mr-1"><i class="fa-solid fa-pen-to-square"></i></router-link>
                            <!-- <button @click="coursesStore.delete(course.courseId)" class="btn btn-sm btn-danger btn-delete-user" :disabled="course.isDeleting">
                                <span><i class="fa-solid fa-trash"></i></span>
                            </button> -->
                            <label for="onDelete" @click="passId(course.courseId)" class="btn btn-sm btn-danger btn-delete-user" :disabled="course.isDeleting">
                                <span><i class="fa-solid fa-trash"></i></span>
                            </label>
                        </td>
                    </tr>
                    <tr v-if="courses.loading">
                        <td colspan="9" class="text-center">
                            <svg class="animate-spin h-9 w-9 text-white m-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </td>
                    </tr>
                    <tr v-if="courses.error">
                        <td colspan="9" class="text-center">
                            <div class="text-danger">เกิดข้อผิดพลาดไม่สามารถโหลดข้อมูลคอร์สได้ : {{courses.error}}</div>
                        </td>
                    </tr>
                    <tr v-if="Object.keys(courses).length === 0">
                        <td colspan="9" class="text-center">
                            <!-- ไม่มีข้อมูล -->
                        </td>
                    </tr>
                </template>
                <template v-else>
                    <tr>
                        <td colspan="9" class="text-center">
                            ไม่มีข้อมูล
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>

        <template v-if="courses">
            <template v-if="courses.countList > 20">
                <VueTailwindPagination class="pagination"
                    :current="currentPage"
                    :total="courses.countList"
                    :per-page="perPage"
                    @page-changed="handlePageChanged($event)"
                />
            </template>
        </template>

        </div>
    </div>
    <ConfirmPopup :id="itemId"/>
</template>

<script>
import '@ocrv/vue-tailwind-pagination/styles'
import VueTailwindPagination from '@ocrv/vue-tailwind-pagination'

export default {
    components: {
        VueTailwindPagination,
    },
    data() {
        return {
            itemId: 0,
            courses: null,
            currentPage: 1,
            size: 20,
            lastNum: 20,
        }
    },
    methods: {
        passId(id) {
            this.itemId = id
        },
        handlePageChanged(page) {
            this.currentPage = page;
            this.lastNum = this.size * page;

            this.submitForm();
        },
        handleSearch() {
            this.currentPage = 1;
            this.lastNum = 20;
        },
        submitForm() {
            this.$nextTick(() => {
                this.$refs.form.$el.dispatchEvent(new Event('submit'));
            });
        },
    },
}
</script>