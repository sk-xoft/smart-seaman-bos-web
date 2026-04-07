<!-- _title.vue -->
<script setup>
    defineProps(['link_menu', 'name_menu', 'title'])
</script>

<template>
    <div class="text-sm breadcrumbs">
        <ul>
           <li><router-link to="/">หน้าหลัก</router-link></li> 
            <li><a :href="link_menu">{{ name_menu }}</a></li> 
            <li>{{ title }}</li>
        </ul>
    </div>
</template>