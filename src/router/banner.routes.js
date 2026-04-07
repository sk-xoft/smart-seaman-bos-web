import { Layout, Banner, Add, Edit } from '@/views/banner';

export default {
    path: '/banner',
    component: Layout,
    children: [
        { path: '', component: Banner },
        { path: 'add', component: Add },
        { path: 'edit/:id', component: Edit }
    ]
};
