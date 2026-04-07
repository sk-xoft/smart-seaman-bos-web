import { Layout, Voucher, Add } from '@/views/voucher';

export default {
    path: '/voucher',
    component: Layout,
    children: [
        { path: '', component: Voucher },
        { path: 'add', component: Add },
        // { path: 'edit/:id', component: Crud }
    ]
};
