import { defineStore } from 'pinia';
import axios from "axios";
import { fetchWrapper } from '@/helpers';
import { useAuthStore, useAlertStore } from '@/stores';
import { uuid } from 'vue-uuid';

const baseUrl = import.meta.env.VITE_BASE_URL_API;

export const useCoursesStore = defineStore({
    id: 'courses',
    state: () => ({
        option_courses: {},
        option_schools: {},
        option_schools_active: '',
        one_option: 0,
        courses: {},
        course: {},
        state_search_data: {},
        perPage: 20,
        size: 20,
        lastNum: 20,
    }),
    getters: {
        getCourse: (state) => state.course,
    },
    actions: {
        async fetchOptionCourses() {
            this.option_courses = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.get(`${baseUrl}/v1/master/course-name`, {
                    headers: {
                        "menuCode": "OPER105",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){
                    this.option_courses = res.data.data;
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    console.log(error);
                }
    
            } catch (error) {
                console.log(error);             
            }
        },
        async fetchOptionSchools() {
            this.option_schools = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.get(`${baseUrl}/v1/master/schools`, {
                    headers: {
                        "menuCode": "OPER105",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){
                    this.option_schools = res.data.data;

                    for(let i=0; i in this.option_schools.schools; i++){
                        if(this.option_schools.schools.length == 1){
                            this.option_schools_active = this.option_schools.schools[i].schoolCode;
                            this.one_option = 1;
                        }
                    }

                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    console.log(error);
                }
    
            } catch (error) {
                console.log(error);             
            }
        },
        async getAllCourses() {
            this.courses = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                const size = this.size;
                const lastNum = this.lastNum;
                
                const res = await axios.post(`${baseUrl}/v1/list-course`, {size, lastNum}, {
                    headers: {
                        "menuCode": "OPER105",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){

                    this.courses = res.data.data;

                    if(!res.data.data.courseList.length){
                        this.courses = null;
                    }
                    
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    console.log(error);
                }
    
            } catch (error) {
                console.log(error);             
            }
        },
        async getSearchCourses(searchData) {
            this.courses = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.post(`${baseUrl}/v1/list-course`, searchData, {
                    headers: {
                        "menuCode": "OPER105",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){

                    this.courses = res.data.data;
                    this.state_search_data = searchData;

                    if(!res.data.data.courseList.length){
                        this.courses = null;
                    }
                    
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    this.res_code = res.data.code;
                    this.res_desc = res.data.description;
                }
    
            } catch (error) {
                console.log(error);             
            }
        },
        async create(course) {
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.post(`${baseUrl}/v1/course/add`, course, {
                    headers: {
                        "menuCode": "OPER105",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){
                    console.log(res.data.data);

                    console.log(res.data.code);
                    console.log(res.data.description);

                    if(this.state_search_data){
                        this.getSearchCourses(this.state_search_data);
                    } else {
                        console.log(res.data.code);
                        console.log(res.data.description);
                    }
                    
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    console.log(res.data.code);
                    console.log(res.data.description);
                }
    
            } catch (error) {
                console.log(error);             
            }
        },
        async getById(id) {
            this.course = { loading: true };
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                const get_course = {};
                                
                const res = await axios.get(`${baseUrl}/v1/list-course/${id}`, {
                    headers: {
                        "menuCode": "OPER105",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){

                    get_course["courseNum"] = res.data.data.courseList[0].courseNum;
                    get_course["courseId"] = res.data.data.courseList[0].courseId;
                    get_course["courseCode"] = res.data.data.courseList[0].courseCode;
                    get_course["courseName"] = res.data.data.courseList[0].courseName;
                    get_course["courseSchoolCode"] = res.data.data.courseList[0].courseSchoolCode;
                    get_course["courseSchoolName"] = res.data.data.courseList[0].courseSchoolName;
                    get_course["courseType"] = res.data.data.courseList[0].courseType;

                    if(res.data.data.courseList[0].courseOnlineDate){
                        if(res.data.data.courseList[0].courseOnlineDate.match(',')){
                            // Split input string into an array of date strings
                            const dateStrs = res.data.data.courseList[0].courseOnlineDate.split(", ");
    
                            // Loop through the array and convert each date string
                            const outputDateStrs = dateStrs.map((dateStr) => {
                                // Parse input date string into date object
                                const parts = dateStr.split('/');
                                const inputDate = new Date(parts[2], parts[1] - 1, parts[0], 0, 0, 0);
    
                                return inputDate;
                            });
    
                            get_course["courseOnlineDate"] = outputDateStrs;
    
                        } else {
                            let outputDateStrs = [];
                            const parts = (res.data.data.courseList[0].courseOnlineDate).split('/');
                            const inputDate = new Date(parts[2], parts[1] - 1, parts[0], 0, 0, 0);
    
                            outputDateStrs.push(inputDate);
    
                            get_course["courseOnlineDate"] = outputDateStrs;
                        }
                    }
                    
                    if(res.data.data.courseList[0].courseOnsiteDate){
                        if(res.data.data.courseList[0].courseOnsiteDate.match(',')){
                            // Split input string into an array of date strings
                            const dateStrs = res.data.data.courseList[0].courseOnsiteDate.split(", ");
    
                            // Loop through the array and convert each date string
                            const outputDateStrs = dateStrs.map((dateStr) => {
                                // Parse input date string into date object
                                const parts = dateStr.split('/');
                                const inputDate = new Date(parts[2], parts[1] - 1, parts[0], 0, 0, 0);
    
                                return inputDate;
                            });
    
                            get_course["courseOnsiteDate"] = outputDateStrs;
    
                        } else {
                            let outputDateStrs = [];
                            const parts = (res.data.data.courseList[0].courseOnsiteDate).split('/');
                            const inputDate = new Date(parts[2], parts[1] - 1, parts[0], 0, 0, 0);
    
                            outputDateStrs.push(inputDate);
                            
                            get_course["courseOnsiteDate"] = outputDateStrs;
                        }
                    }

                    // get_course["courseOnlineDate"] = res.data.data.courseList[0].courseOnlineDate;
                    // get_course["courseOnsiteDate"] = res.data.data.courseList[0].courseOnsiteDate;
                    get_course["courseColour"] = '#' + res.data.data.courseList[0].courseColour;
                    get_course["courseTotalDays"] = res.data.data.courseList[0].courseTotalDays;
                    get_course["coursePrice"] = res.data.data.courseList[0].coursePrice;
                    get_course["courseStatus"] = res.data.data.courseList[0].courseStatus;
                    
                    this.course = get_course;
                    
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    console.log(error);
                }
    
            } catch (error) {
                console.log(error);             
            }
        },
        async update(course) {
            try {
                const authStore = useAuthStore();
                const username = authStore.user.data.username;
                
                const res = await axios.post(`${baseUrl}/v1/course/update`, course, {
                    headers: {
                        "menuCode": "OPER105",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });
                
                if(res.data.code === 'WA00000'){
                    console.log(res.data.data);

                    if(this.state_search_data){
                        this.getSearchCourses(this.state_search_data);
                    }
                    
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    console.log(res.data.code);
                    console.log(res.data.description);
                }
    
            } catch (error) {
                console.log(error);             
            }
        },
        async delete(id) {
            // add isDeleting prop to courses being deleted
            this.courses.courseList.find(x => x.courseId === id).isDeleting = true;

            try {
                const authStore = useAuthStore();
                const alertStore = useAlertStore();
                const username = authStore.user.data.username;

                const deleteId = JSON.stringify({"courseId": `${id}`});
                
                const res = await axios.post(`${baseUrl}/v1/course/delete`, deleteId, {
                    headers: {
                        "menuCode": "OPER105",
                        'language': 'TH', 
                        'deviceModel': 'WEB_ADMIN', 
                        'correlationid': uuid.v4(), 
                        'deviceInfo': 'MacOS', 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authStore.user.data.token,
                    }
                });

                this.res_code = res.data.code;
                let message;
                
                if(res.data.code === 'WA00000'){
                    console.log(res.data.data);
                    message = "ลบคอร์สเสร็จสิ้น";
                    alertStore.success(message);
                
                } else if (res.data.code === 'WA00007'){
                    console.log('Session หมดอายุ');
                    authStore.logout();
                } else {
                    console.log(res.data.code);
                    console.log(res.data.description);
                }
    
            } catch (error) {
                console.log(error);             
            }

            // remove courses from list after deleted
            this.courses = this.courses.courseList.filter(x => x.courseId !== id);

            if(this.state_search_data){
                this.getSearchCourses(this.state_search_data);
            } else {
                this.getAllCourses();
            } 
        },
        async refreshData() {
            try {
                this.courses = {}
            } catch (error) {
                console.log(error);             
            }
        },
        async refreshStateSearch() {
            try {
                this.state_search_data = {}
            } catch (error) {
                console.log(error);             
            }
        },
        async clearStateOption() {
            try {
                this.option_schools_active = '';
                this.one_option = 0;
            } catch (error) {
                console.log(error);             
            }
        },
        incrementLastNum(page) {
            this.lastNumValue = this.lastNumValue * page;
        },
    }
});
