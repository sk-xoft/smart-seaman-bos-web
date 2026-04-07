import { Layout, Certificates, View, AddCot, EditCot, AddDoc, EditDoc } from '@/views/certificates';

import { viewDepthKey } from 'vue-router';

export default {
    path: '/certificates',
    component: Layout,
    children: [
        { path: '', component: Certificates },
        { path: 'view/:id', component: View },
        { path: ':id/cot/add', component: AddCot },
        { path: ':id/cot/:certid/edit', component: EditCot },
        { path: ':id/doc/add', component: AddDoc },
        { path: ':id/doc/:docid/edit', component: EditDoc }
    ]
};
