<template>
    <footer class="footer items-center py-2 px-4 bg-base-200 text-neutral-content">
        <div class="items-center grid-flow-col w-full">
            <p class="text-white text-xs text-center lg:text-left lg:text-base w-full">Copyright © {{ new Date().getFullYear() }} Smart Seaman. All right reserved. v1.0.0</p>
        </div> 
        <div class="flex justify-end items-end text-center lg:text-left w-full">
            <p class="text-white text-center lg:text-right w-full -mt-5 lg:mt-0 text-xs lg:text-base">
                <span>Admin Contact :</span> <span>contact.smartseaman@gmail.com</span>
            </p>    
        </div>
    </footer>
</template>

<style lang="scss" scoped>
    .text-xs{
        font-size: 12px !important;
    }

    span{
        font-size: 12px !important;
    }
</style>