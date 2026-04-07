<script setup>
  defineProps(['name'])
</script>


<template>
    <div class="mb-2">
        <label for="text-banner">รูปภาพหน้าปก <span class="required">*</span></label>
    </div>
  <div class="flex justify-center items-center mb-12">
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
        :name="name"
        type="hidden"
        v-model="base64String"
      />
  </div>
</template>
 
<script>
import fallbackBgUrl from "@/assets/images/1280x400.png";
  
export default {
  data() {
      return {
        fallbackBgUrl,
        previewImage: null,
        //selectedFile: null,
        base64String: '',
        base64StringName: '',
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
          reader.onload = e => {
            this.previewImage = e.target.result
          }
          reader.readAsDataURL(file[0])
          this.$emit('input', file[0])
        }
      },
      onFileSelected(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.fileName = file.name;

        reader.onload = (event) => {
          this.base64String = event.target.result.split(',')[1].toString();
          this.selectedFile = file;
          this.base64StringName = event.target.fileName;
        // const encodedData = btoa("Hello, world"); // encode a string
        // let decodedData = atob(this.base64String); // decode the string
        };
        reader.readAsDataURL(file);
      },
  }
}
</script>
 
<style scoped lang="scss">
.imagePreviewWrapper {
    display: block;
    cursor: pointer;
    margin: 0 auto 30px;
    background-size: cover;
    background-position: center center;
}
</style>