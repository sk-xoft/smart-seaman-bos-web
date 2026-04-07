import { Layout, List, Add, Edit, ChangePassword } from '@/views/users';

export default {
    path: '/admin-management',
    component: Layout,
    children: [
        { path: '', component: List },
        { path: 'add', component: Add },
        { path: 'edit/:id', component: Edit },
        { path: 'edit/:id/change-password', component: ChangePassword }
    ]
};
