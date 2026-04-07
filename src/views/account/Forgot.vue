<script setup>
import { Form, Field } from "vee-validate";
import * as Yup from "yup";

import { useAuthStore } from "@/stores";

const schema = Yup.object().shape({
  username: Yup.string().required("Email is required"),
});
</script>

<template>
  <div
    class="
      card
      w-9/12
      lg:card-side
      bg-base-200
      shadow-xl
      border-0
      rounded-tl-2xl rounded-bl-2xl
      overflow-hidden
    "
  >
    <div class="hero min-h-screen cover-login min-h-1/2 w-2/4">
      <div class="hero-overlay bg-black bg-opacity-40"></div>
      <div class="hero-content text-center text-neutral-content">
        <div class="max-w-md flex flex-col justify-center items-center -mt-7">
          <img class="w-40" src="@/assets/images/logo-seaman.png" />
          <h3 class="text-white text-2xl italic">
            Easy your life Enjoy your leave
          </h3>
        </div>
      </div>
    </div>
    <div class="card-body flex flex-col items-center justify-center relative">
      <router-link
        to="login"
        class="btn btn-link no-underline absolute left-1 top-1"
        ><i class="fa fa-chevron-left mr-2" aria-hidden="true"></i>
        Back</router-link
      >
      <h2 class="text-white card-title mb-3">ลืมรหัสผ่าน</h2>
      <form ref="form" class="grid gap-5 w-96" @submit.prevent="sendEmail">
        <div class="input-group flex flex-col">
          <label class="relative block">
            <span
              class="
                absolute
                inset-y-0
                left-3
                flex
                items-center
                pl-2
                bg-transparent
              "
            >
              <i class="fa fa-envelope mr-3" aria-hidden="true"></i> อีเมล
            </span>
            <input
              name="email"
              type="email"
              class="
                placeholder:italic placeholder:text-slate-400
                input input-ghost input-bordered
                bg-transparent
                w-full
                sm:text-sm
                pl-24
              "
            />
          </label>
          <!-- <div class="invalid-feedback mt-2 text-error">{{ errors.email }}</div> -->
        </div>

        <div class="form-group">
          <button class="btn btn-primary w-full" type="submit">
            <span class="spinner-border spinner-border-sm mr-1"></span>
            Submit
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import emailjs from "@emailjs/browser";

export default {
  data() {
    return {
      email: "",
    };
  },
  methods: {
    sendEmail() {
      emailjs
        .sendForm(
          "service_smartseaman",
          "template_eveqm0b",
          this.$refs.form,
          "vd9-TWekAa1sEIukg"
        )
        .then(
          (result) => {
            console.log("SUCCESS!", result.text);
          },
          (error) => {
            console.log("FAILED...", error.text);
          }
        );
    },
  },
};
</script>