<script setup>
import { Form, Field } from 'vee-validate';
import * as Yup from 'yup';

import { useUsersStore, useAlertStore } from '@/stores';
import { router } from '@/router';

const schema = Yup.object().shape({
    firstName: Yup.string()
        .required('First Name is required'),
    lastName: Yup.string()
        .required('Last Name is required'),
    email: Yup.string()
        .required('Email is required'),
    username: Yup.string()
        .required('Username is required'),
    password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters')
});

async function onSubmit(values) {
    const usersStore = useUsersStore();
    const alertStore = useAlertStore();
    try {
        await usersStore.register(values);
        await router.push('/account/login');
        alertStore.success('Registration successful');
    } catch (error) { 
        alertStore.error(error);
    }
}
</script>

<template>
 <div class="card w-full lg:w-9/12 lg:card-side bg-base-200 shadow-xl border-0 rounded-tl-2xl rounded-bl-2xl">
        <div class="hero min-h-screen cover-login min-h-1/2 w-2/4 hidden lg:grid">
            <div class="hero-overlay bg-black bg-opacity-40"></div>
            <div class="hero-content text-center text-neutral-content">
                <div class="max-w-md flex flex-col justify-center items-center -mt-7">
                    <img class="w-40" src="@/assets/images/logo-seaman.png" >
                    <h3 class="text-white text-lg italic">Easy your life Enjoy your leave</h3>
                </div>
            </div>
        </div>
        <div class="card-body flex flex-col items-center justify-center">
            <h2 class="text-white card-title">สมัครสมาชิก</h2>
            <span class="text-white mb-5">หากมีสมาชิกอยู่แล้ว, กรุณา<router-link class="underline" to="login">เข้าสู่ระบบ</router-link></span>
            <Alert/>
              <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors, isSubmitting }">
                <div class="input-group flex flex-col">
                     <label class="relative block">
                        <span class="absolute inset-y-0 left-3 flex items-center pl-2 bg-transparent">
                            <i class="fa-solid fa-user-tag mr-3"></i>ชื่อ
                        </span>
                        <Field name="firstName" type="text" class="placeholder:italic placeholder:text-slate-400 input input-ghost input-bordered bg-transparent w-full sm:text-sm pl-20" :class="{ 'is-invalid': errors.firstName }" />
                    </label>
                    <div class="invalid-feedback my-2 text-error">{{ errors.firstName }}</div>
                </div>
                <div class="input-group flex flex-col">
                     <label class="relative block">
                        <span class="absolute inset-y-0 left-3 flex items-center pl-2 bg-transparent">
                            <i class="fa-solid fa-people-roof mr-3"></i>นามสกุล
                        </span>
                        <Field name="lastName" type="text" class="placeholder:italic placeholder:text-slate-400 input input-ghost input-bordered bg-transparent w-full sm:text-sm pl-28" :class="{ 'is-invalid': errors.lastName }" />
                    </label>
                    <div class="invalid-feedback my-2 text-error">{{ errors.lastName }}</div>
                </div>
                <div class="input-group flex flex-col">
                     <label class="relative block">
                        <span class="absolute inset-y-0 left-3 flex items-center pl-2 bg-transparent">
                            <i class="fa-solid fa-envelope mr-3"></i>อีเมล
                        </span>
                        <Field name="email" type="email" class="placeholder:italic placeholder:text-slate-400 input input-ghost input-bordered bg-transparent w-full sm:text-sm pl-24" :class="{ 'is-invalid': errors.email }" />
                    </label>
                    <div class="invalid-feedback my-2 text-error">{{ errors.email }}</div>
                </div>
                <div class="input-group flex flex-col">
                     <label class="relative block">
                        <span class="absolute inset-y-0 left-3 flex items-center pl-2 bg-transparent">
                            <i class="fa-solid fa-building mr-3"></i>บริษัท
                        </span>
                        <Field name="company" type="text" class="placeholder:italic placeholder:text-slate-400 input input-ghost input-bordered bg-transparent w-full sm:text-sm pl-24" :class="{ 'is-invalid': errors.company }" />
                    </label>
                    <div class="invalid-feedback my-2 text-error">{{ errors.company }}</div>
                </div>
                <div class="input-group flex flex-col">
                     <label class="relative block">
                        <span class="absolute inset-y-0 left-3 flex items-center pl-2 bg-transparent">
                            <i class="fa-solid fa-user mr-3"></i>ชื่อผู้ใช้
                        </span>
                        <Field name="username" type="text" class="placeholder:italic placeholder:text-slate-400 input input-ghost input-bordered bg-transparent w-full sm:text-sm pl-28" :class="{ 'is-invalid': errors.username }" />
                    </label>
                    <div class="invalid-feedback my-2 text-error">{{ errors.username }}</div>
                </div>
                <div class="input-group flex flex-col">
                     <label class="relative block">
                        <span class="absolute inset-y-0 left-3 flex items-center pl-2 bg-transparent">
                            <i class="fa-solid fa-lock mr-3"></i>รหัสผ่าน
                        </span>
                        <Field name="password" type="password" class="placeholder:italic placeholder:text-slate-400 input input-ghost input-bordered bg-transparent w-full sm:text-sm pl-28" :class="{ 'is-invalid': errors.password }" />
                    </label>
                    <div class="invalid-feedback my-2 text-error">{{ errors.password }}</div>
                </div>
                <div class="form-group flex justify-center mt-5">
                    <button class="btn btn-primary" :disabled="isSubmitting">
                        <span v-show="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
                        สมัครสมาชิก
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