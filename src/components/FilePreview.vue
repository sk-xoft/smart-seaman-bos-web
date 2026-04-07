<template>
  <div class="flex justify-center items-center mb-12">
    <div class="avatar relative">
      <div class="w-24 rounded-full border-4 border-primary">
         <div
          class="imagePreviewWrapper h-full w-full"
          :style="[ previewImage ? { backgroundImage: `url(${previewImage})`} : { backgroundImage: `url(${fallbackBgUrl})`}]"
          @click="selectImage">
        </div>
      </div>

      <div class="edit-wrapper absolute bottom-0 right-0 bg-primary p-1 rounded-full cursor-pointer" @click="selectImage">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
 
    <input
      class="opacity-0 invisible hidden"
      ref="fileInput"
      type="file"
      @input="pickFile">
  </div>
</template>
 
<script>
import fallbackBgUrl from "@/assets/images/placeimage.jpeg";
  
export default {
  data() {
      return {
        fallbackBgUrl,
        previewImage: null
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
      }
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