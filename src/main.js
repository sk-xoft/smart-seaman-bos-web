import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueApexCharts } from "vue3-apexcharts";
import mitt from 'mitt';
import { Quasar } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
// import 'quasar/src/css/index.sass'
import VueDatePicker from '@vuepic/vue-datepicker';
import LvColorpicker from 'lightvue/color-picker';
import LvTextEditor from 'lightvue/text-editor';

import '@vuepic/vue-datepicker/dist/main.css'

import App from './App.vue';

import { router } from './router';
import MainFooter from './components/Footer.vue';

import "light-icons/dist/light-icon.css";
import "@/assets/scss/style.scss";

// setup fake backend
// import { fakeBackend } from './helpers';

// fakeBackend();

const app = createApp(App);

app.use(createPinia());
app.use(VueApexCharts);
const emitter = mitt();
app.config.globalProperties.emitter = emitter;
app.use(router);

app.use(Quasar, {
    plugins: {}, // import Quasar plugins and add here
})

app.component('VueDatePicker', VueDatePicker);
app.component('LvColorpicker', LvColorpicker);
app.component('LvTextEditor', LvTextEditor);
app.component('MainFooter', MainFooter);

app.mount('#app');
