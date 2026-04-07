import { Layout, Form, Add, Edit } from '@/views/form';

export default {
    path: '/form',
    component: Layout,
    children: [
        { path: '', component: Form },
        { path: 'add', component: Add },
        { path: 'edit/:id', component: Edit }
    ]
};
