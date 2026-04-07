import { Layout, News, Add, Edit } from '@/views/news';

export default {
    path: '/news',
    component: Layout,
    children: [
        { path: '', component: News },
        { path: 'add', component: Add },
        { path: 'edit/:id', component: Edit }
    ]
};
