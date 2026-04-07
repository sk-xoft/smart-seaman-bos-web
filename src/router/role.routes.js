import { Layout, Role, Add, Edit } from '@/views/role';

export default {
    path: '/role-management',
    component: Layout,
    children: [
        { path: '', component: Role },
        { path: 'add', component: Add },
        { path: 'edit/:id', component: Edit }
    ]
};
