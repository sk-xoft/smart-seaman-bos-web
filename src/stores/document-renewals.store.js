import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from '@/stores';
import { uuid } from 'vue-uuid';
import { REQUESTS } from '@/constants/documentRequests';

const baseUrl = import.meta.env.VITE_BASE_URL_API;
const MENU_CODE = 'OPER104';

function buildHeaders(token) {
    return {
        menuCode: MENU_CODE,
        language: 'TH',
        deviceModel: 'WEB_ADMIN',
        correlationid: uuid.v4(),
        deviceInfo: 'MacOS',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
    };
}

function computeStatusCounts(requests) {
    const counts = { all: requests.length };
    const statuses = ['รอตรวจเอกสาร', 'รอผู้ยื่นแก้ไข', 'รอผลกรมเจ้าท่า', 'รอรับเอกสารจากกรม', 'กำลังจัดส่ง', 'จัดส่งสำเร็จ', 'ยกเลิก'];
    statuses.forEach(s => counts[s] = 0);
    requests.forEach(r => {
        if (counts[r.status] !== undefined) counts[r.status]++;
    });
    return counts;
}

function getMockList({ filter, searchFilters, page, pageSize }) {
    let data = [...REQUESTS];

    if (filter && filter !== 'all') {
        data = data.filter(r => r.status === filter);
    }

    if (searchFilters.ssid) {
        data = data.filter(r => r.ssid.includes(searchFilters.ssid));
    }
    if (searchFilters.name) {
        const q = searchFilters.name.trim().toLowerCase();
        data = data.filter(r => r.name.toLowerCase().includes(q) || r.lname.toLowerCase().includes(q));
    }
    if (searchFilters.requestNo) {
        data = data.filter(r => r.no.includes(searchFilters.requestNo));
    }

    const total = data.length;
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);
    const statusCounts = computeStatusCounts(REQUESTS);
    const requests = data.slice((page - 1) * pageSize, page * pageSize);

    return {
        total,
        statusCounts,
        requests,
        from,
        to,
    };
}

export const useDocumentRenewalsStore = defineStore({
    id: 'documentRenewals',
    state: () => ({
        requests: [],
        total: 0,
        statusCounts: {},
        currentPage: 1,
        pageSize: 50,
        loading: false,
        currentFilter: 'all',
        searchFilters: {
            ssid: '',
            name: '',
            requestNo: '',
        },
        useMock: import.meta.env.VITE_USE_MOCK === 'true',
    }),
    getters: {
        totalPages: (state) => Math.max(1, Math.ceil(state.total / state.pageSize)),
        paginationInfo: (state) => {
            const from = state.total === 0 ? 0 : (state.currentPage - 1) * state.pageSize + 1;
            const to = Math.min(state.currentPage * state.pageSize, state.total);
            return { from, to, total: state.total };
        },
    },
    actions: {

        async fetchList() {
            this.loading = true;
            try {
                if (this.useMock) {
                    const result = getMockList({
                        filter: this.currentFilter,
                        searchFilters: this.searchFilters,
                        page: this.currentPage,
                        pageSize: this.pageSize,
                    });
                    this.requests = result.requests;
                    this.total = result.total;
                    this.statusCounts = result.statusCounts;
                    return;
                }

                const authStore = useAuthStore();
                const token = authStore.user.data.token;
                const lastNum = (this.currentPage - 1) * this.pageSize;

                const payload = {
                    size: this.pageSize,
                    lastNum,
                    ...(this.currentFilter !== 'all' && { status: this.currentFilter }),
                    ...(this.searchFilters.ssid && { ssid: this.searchFilters.ssid }),
                    ...(this.searchFilters.name && { name: this.searchFilters.name }),
                    ...(this.searchFilters.requestNo && { requestNo: this.searchFilters.requestNo }),
                };

                const res = await axios.post(`${baseUrl}/v1/document-renewals/list`, payload, {
                    headers: buildHeaders(token),
                });

                if (res.data.code === 'WA00000') {
                    this.requests = res.data.data.requests;
                    this.total = res.data.data.total;
                    this.statusCounts = res.data.data.statusCounts ?? {};
                } else if (res.data.code === 'WA00007') {
                    authStore.logout();
                } else {
                    console.log(res.data.code, res.data.description);
                }
            } catch (error) {
                console.error(error);
            } finally {
                this.loading = false;
            }
        },

        async updateStatus(requestNo, action) {
            if (this.useMock) {
                const req = this.requests.find(r => r.no === requestNo);
                if (!req) return;
                const actionMap = {
                    cancel:   { status: 'ยกเลิก',           resubmit: false },
                    sendback: { status: 'รอผู้ยื่นแก้ไข',   resubmit: false },
                    submit:   { status: 'รอผลกรมเจ้าท่า',  resubmit: undefined },
                };
                const cfg = actionMap[action];
                req.status = cfg.status;
                if (cfg.resubmit !== undefined) req.resubmit = cfg.resubmit;
                this.statusCounts = computeStatusCounts(this.requests);
                this.fetchList();
                return;
            }

            const authStore = useAuthStore();
            const token = authStore.user.data.token;

            const res = await axios.put(
                `${baseUrl}/v1/document-renewals/${requestNo}/${action}`,
                {},
                { headers: buildHeaders(token) }
            );

            if (res.data.code === 'WA00007') {
                authStore.logout();
            }
            return res.data;
        },

        setPage(page) {
            this.currentPage = page;
            this.fetchList();
        },

        setFilter(filter) {
            this.currentFilter = filter;
            this.currentPage = 1;
            this.fetchList();
        },

        search() {
            this.currentPage = 1;
            this.fetchList();
        },
    },
});
