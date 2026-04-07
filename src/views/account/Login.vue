<script setup>
import { Alert } from '@/components';
import { Form, Field } from 'vee-validate';
import * as Yup from 'yup';

import { useAuthStore, useMenuStore } from '@/stores';

const schema = Yup.object().shape({
    username: Yup.string().required('กรุณากรอกชื่อผู้ใช้'),
    password: Yup.string().required('กรุณากรอกรหัสผ่าน')
});

async function onSubmit(values) {
    const authStore = useAuthStore();
    const { username, password } = values;
    await authStore.login(username, password);

    const fetchMenus  = useMenuStore();

    fetchMenus.fetchMenus();
    fetchMenus.getUserImageProfile();
    fetchMenus.fetchProfileDetail();
}

</script>

<template>
    <div class="card w-full lg:w-[30rem] lg:card-side bg-base-200 shadow-xl border-0 rounded-tl-2xl rounded-bl-2xl">
        <!-- <div class="hero min-h-screen cover-login min-h-1/2 w-2/4 hidden lg:grid">
            <div class="hero-overlay bg-black bg-opacity-40"></div>
            <div class="hero-content text-center text-neutral-content">
                <div class="max-w-md flex flex-col justify-center items-center -mt-7">
                    <img class="w-40" src="@/assets/images/logo-seaman.png" >
                    <h3 class="text-white text-lg italic">Easy your life Enjoy your leave</h3>
                </div>
            </div>
        </div> -->
        <div class="card-body flex flex-col items-center justify-center">
            <div class="flex justify-between w-full lg:w-96 mb-7">
                <h2 class="text-white card-title text-3xl">เข้าสู่ระบบ</h2>
                <img class="w-12" src="@/assets/images/ss-logo.png" alt="">
            </div>
            
            <Form class="grid gap-2 w-full lg:w-96" @submit="onSubmit" :validation-schema="schema" v-slot="{ errors, isSubmitting }">
                <Alert/>
                <div class="input-group flex flex-col">
                    <label for="username" class="mb-2">ชื่อผู้ใช้</label>
                    <label class="relative block">
                        <span class="absolute inset-y-0 left-0 flex items-center px-5 bg-base-100 rounded-tl-lg rounded-bl-lg rounded-tr-none rounded-br-none input input-bordered border-r-0">
                            <i class="fa-regular fa-user"></i>
                        </span>
                        <Field name="username" placeholder="ชื่อผู้ใช้" type="text" v-model="username" class="placeholder:italic placeholder:text-slate-400 input input-ghost input-bordered bg-transparent w-full sm:text-sm pl-16" :class="{ 'is-invalid': errors.username }" />
                    </label>
                    <div class="invalid-feedback mt-2 text-error">{{ errors.username }}</div>
                </div>
            
                <div class="input-group flex flex-col">
                    <label for="username" class="mb-2">รหัสผ่าน</label>
                    <label class="relative block">
                        <span class="absolute inset-y-0 left-0 flex items-center px-5 bg-base-100 rounded-tl-lg rounded-bl-lg rounded-tr-none rounded-br-none input input-bordered border-r-0">
                            <i class="fa-solid fa-lock"></i>
                        </span>
                        <Field name="password" placeholder="รหัสผ่าน" type="password" v-model="password" class="placeholder:italic placeholder:text-slate-400 input input-ghost input-bordered bg-transparent w-full sm:text-sm pl-16" :class="{ 'is-invalid': errors.password }" />
                    </label>
                    <div class="invalid-feedback mt-2 text-error">{{ errors.password }}</div>
                </div>

                <div class="flex justify-between">
                    <div class="form-control">
                        <label class="label cursor-pointer gap-3 p-0" for="remember">
                            <input name="remember" id="remember" type="checkbox" class="checkbox checkbox-primary" />
                            <span for="remember" class="label-text text-sm text-white font-light">จำรหัสผ่าน</span> 
                        </label>
                    </div>
                    <div class="form-control flex justify-center">
                        <router-link class="text-sm text-white" to="/account/forgot">ลืมรหัสผ่าน ?</router-link>
                    </div>
                </div>
                
                <div class="form-group flex justify-center mt-5">
                    <button class="btn btn-primary" :disabled="isSubmitting">
                        <span v-show="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
                        เข้าสู่ระบบ
                    </button>
                </div>
            </Form>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .cover-login{
        background: url(@/assets/images/login-banner.png) no-repeat center center;
        background-size: cover;
    }
</style>