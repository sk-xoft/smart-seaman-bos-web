import { Layout, Login, Register, Forgot } from '@/views/account';

export default {
    path: '/account',
    component: Layout,
    children: [
        { path: '', redirect: 'login' },
        { path: 'login', component: Login },
        { path: 'register', component: Register },
        { path: 'forgot', component: Forgot },
    ]
};
