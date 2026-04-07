import { Layout, Policy } from '@/views/policy';

export default {
    path: '/privacy_policy',
    component: Layout,
    children: [
        { path: '', component: Policy }
    ]
};
