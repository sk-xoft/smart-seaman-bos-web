import { createRouter, createWebHistory } from 'vue-router';

import { useAuthStore, useAlertStore } from '@/stores';
import { Layout, Home, HomeDetail, HomeAll } from '@/views';
import accountRoutes from './account.routes';
import usersRoutes from './users.routes';
import certificatesRoutes from './certificates.routes';
import coursesRoutes from './courses.routes';
import newsRoutes from './news.routes';
import voucherRoutes from './voucher.routes';
import formRoutes from './form.routes';
import bannerRoutes from './banner.routes';
import roleRoutes from './role.routes';
import policyRoutes from './policy.routes';
import DocumentRenewalsRoutes from './document-renewals.routes';

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    linkActiveClass: 'active',
    routes: [
        { path: '/',
        component: Layout,
        children: [
            { path: '', component: Home },
            { path: 'less-than/:id', component: HomeDetail },
            { path: 'user/all', component: HomeAll },
        ]},
        { ...accountRoutes },
        { ...usersRoutes },
        { ...certificatesRoutes },
        { ...coursesRoutes },
        { ...newsRoutes },
        { ...voucherRoutes },
        { ...formRoutes },
        { ...bannerRoutes },
        { ...roleRoutes },
        { ...policyRoutes },
        { ...DocumentRenewalsRoutes },
        // catch all redirect to home page
        { path: '/:pathMatch(.*)*', redirect: '/' }
    ]
});

router.beforeEach(async (to) => {
    // clear alert on route change
    const alertStore = useAlertStore();
    alertStore.clear();

    // redirect to login page if not logged in and trying to access a restricted page 
    const publicPages = ['/account/login', '/account/register', '/account/forgot', '/privacy_policy'];
    const authRequired = !publicPages.includes(to.path);
    const authStore = useAuthStore();

    // BYPASS: Set dummy user for development
    if (!authStore.user) {
        const dummyUser = {
            code: 'WA00000',
            message: 'success',
            data: {
                id: '1',
                username: 'admin',
                email: 'admin@test.com',
                token: 'dummy-token'
            }
        };
        authStore.user = dummyUser;
        localStorage.setItem('user', JSON.stringify(dummyUser));
    }

    // if (authRequired && !authStore.user) {
    //     authStore.returnUrl = to.fullPath;
    //     return '/account/login';
    // }
});
