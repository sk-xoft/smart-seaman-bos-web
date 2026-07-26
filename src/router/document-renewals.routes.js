import { Layout, DocumentRenewals, DocumentRenewalsDetail } from '@/views/renewCertificate';

export default {
    path: '/document-renewals',
    component: Layout,
    children: [
        { path: '', component: DocumentRenewals, meta: { title: 'จัดการคำขอต่อเอกสาร', requiresAuth: true } },
        { path: '/document-request-detail/:requestNo', name: 'document-renewals-detail', component: DocumentRenewalsDetail, meta: { title: 'รายละเอียดคำขอต่อเอกสาร', requiresAuth: true } },
        { path: '/document-renewals-detail/:requestNo', redirect: to => ({ path: `/document-request-detail/${to.params.requestNo}` }) }
    ]
};
