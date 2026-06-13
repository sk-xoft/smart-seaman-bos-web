import { Layout, DocumentRenewals } from '@/views/renewCertificate';

export default {
    path: '/document-renewals',
    component: Layout,
    children: [
        { path: '', component: DocumentRenewals, meta: { title: 'จัดการคำขอต่อเอกสาร', requiresAuth: true } }
    ]
};
