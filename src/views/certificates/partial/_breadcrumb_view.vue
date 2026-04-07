<!-- _title.vue -->
<script setup>
    defineProps(['link_menu', 'name_menu', 'view_menu', 'name_view_menu', 'title'])
</script>

<template>
    <div class="text-sm breadcrumbs">
        <ul>
            <li><router-link to="/">หน้าหลัก</router-link></li> 
            <li><router-link :to="link_menu" >{{ name_menu }}</router-link></li> 
            <li><router-link :to="view_menu" >{{ name_view_menu }}</router-link></li> 
            <li>{{ title }}</li>
        </ul>
    </div>
</template>