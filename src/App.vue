<script setup>
import { Sidebar, Nav } from '@/components';
import { useAuthStore } from '@/stores';

const authStore = useAuthStore();

</script>

<template>
    <div class="app-container bg-base-100" :class="{ '-open-sidebar': isOpen, '-close-sidebar': !isOpen }">
        <Nav />
        <Sidebar />
        <router-view />
    </div>
</template>

<style lang="scss">
    @import '@/assets/base.css';

    .content-wrapper{
        transition: .5s;
    }

    .app-container {
        .sidebar {
            transform: translateX(-100%);
            transition: all .5s;
        }

        &.-close-sidebar{
            .content-wrapper{
                width: 100%;
            }
        }

        &.-open-sidebar{
            .sidebar {
                transform: translateX(0%);
            }
        }
    }

    @media(max-width: 1024px){
        .app-container {
            &.-close-sidebar{
                .sidebar{
                    width: 90%;
                    transform: translateX(0%);
                }
            }

            &.-open-sidebar{
                .sidebar {
                    width: 90%;
                    transform: translateX(-100%);
                }

                 .content-wrapper{
                    width: 100%;
                }
            }
        }
    }
</style>

<script>
export default {
    data() {
        return {
            isOpen: true
        };
    },
    mounted() { 
        this.emitter.on("toggle-sidebar", isOpen => {
            this.isOpen = isOpen;
        });
    }
}
</script>