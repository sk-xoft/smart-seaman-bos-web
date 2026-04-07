<script setup>
import { useVoucherStore } from '@/stores';
const voucherStore = useVoucherStore();

</script>

<template>
    <input type="checkbox" id="onDelete" class="modal-toggle" />
    <label for="onDelete" class="modal cursor-pointer modal-bottom sm:modal-middle">
        <label class="modal-box relative p-0" for="">
            <div class="modal-header p-5 border-b-[1px] border-slate-600">
                <label for="onDelete" class="btn btn-sm btn-circle absolute right-4 top-4">✕</label>
                <h3 class="text-lg font-semibold text-white">ข้อความแจ้งเตือน !</h3>
            </div>
            <div class="modal-body p-5">
                <p class="py-4">คุณต้องการลบสิทธิประโยชน์นี้ใช่ไหม?</p>
            </div>
            <div class="modal-footer p-5 border-t-[1px] border-slate-600 flex gap-3 justify-end">
                <label class="btn btn-sm px-5 btn-secondary text-white px-7" @click="voucherStore.delete(id)" for="onDelete">
                    <i class="fa fa-trash mr-2" aria-hidden="true"></i> ใช่
                </label>
                <label class="btn btn-sm px-5 btn-light text-white px-7" for="onDelete">
                    <i class="fa fa-times mr-2 text-lg" aria-hidden="true"></i> ไม่ใช่
                </label>
            </div>
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