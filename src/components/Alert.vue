<script setup>
import { storeToRefs } from 'pinia';

import { useAlertStore } from '@/stores';

const alertStore = useAlertStore();
const { alert } = storeToRefs(alertStore);

</script>

<template>
    <div v-if="alert" class="container">
        <div class="alert shadow-lg relative my-3 py-0" :class="alert.type">
            <div class="icon-symbol">
                <i class="fa" v-bind:class="symbol(alert.type)"></i>
                <span class="text-sm">{{alert.message}}</span>
            </div>
            <div class="flex-none">
                <button @click="alertStore.clear()" class="btn btn-link no-underline text-black close"><i class="fa-regular fa-circle-xmark"></i></button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    methods: {
        symbol(type) {
            if(type=== 'alert-success') {
                return 'fa-circle-check';
            } else if (type=== 'alert-error') {
                return 'fa-triangle-exclamation';
            } 
            else {
                return 'fa-info-circle';
            }
        },
    }
}
</script>