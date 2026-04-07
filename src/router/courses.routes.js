import { Layout, Courses, Add, Edit } from '@/views/courses';

export default {
    path: '/courses',
    component: Layout,
    children: [
        { path: '', component: Courses },
        { path: 'add', component: Add },
        { path: 'edit/:id', component: Edit }
    ]
}