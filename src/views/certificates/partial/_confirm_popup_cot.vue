<script setup>
import { useCertificatesStore } from '@/stores';
const certificatesStore = useCertificatesStore();

</script>

<template>
    <input type="checkbox" id="onCotDelete" class="modal-toggle" />
    <label for="onCotDelete" class="modal cursor-pointer modal-bottom sm:modal-middle">
        <label class="modal-box relative p-0" for="">
            <div class="modal-header p-5 border-b-[1px] border-slate-600">
                <label for="onCotDelete" class="btn btn-sm btn-circle absolute right-4 top-4">✕</label>
                <h3 class="text-lg font-semibold text-white">ข้อความแจ้งเตือน !</h3>
            </div>
            <div class="modal-body p-5">
                <p class="py-4">คุณต้องการลบประกาศนียบัตรนี้ใช่ไหม?</p>
            </div>
            <div class="modal-footer p-5 border-t-[1px] border-slate-600 flex gap-3 justify-end">
                <label class="btn btn-sm px-5 btn-secondary text-white px-7" @click="certificatesStore.delete_cot(cotid,uuId)" for="onCotDelete">
                    <i class="fa fa-trash mr-2" aria-hidden="true"></i> ใช่
                </label>
                <label class="btn btn-sm px-5 btn-light text-white px-7" for="onCotDelete">
                    <i class="fa fa-times mr-2 text-lg" aria-hidden="true"></i> ไม่ใช่
                </label>
            </div>
        </label>
    </label>
</template>

<script>
export default {
    props: {
        uuId: {
            required: true
        },
        cotid: {
            required: true
        }
    },
}
</script>