import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from '@/stores';
import { uuid } from 'vue-uuid';
import { REQUESTS } from '@/constants/documentRequests';

const baseUrl = import.meta.env.VITE_BASE_URL_API;
const MENU_CODE = 'OPER104';

function buildHeaders(token) {
    const headers = {
        Accept: 'application/json, text/plain, */*',
        Language: 'TH',
        'device-model': 'ios',
        'correlation-id': uuid.v4(),
    };

    // if (token) {
    //     headers.Authorization = 'Bearer ' + token;
    // }

    return headers;
}

function normalizeRequest(item) {
    return {
        no: item.no ?? item.request_no ?? item.requestNo ?? item.documentRequestNo ?? '-',
        mobileUserUuid: item.mobileUserUuid ?? item.mobile_user_uuid ?? '-',
        ssid: item.ssid ?? item.smartSeamanId ?? item.smartSeamanID ?? item.mobile_user_smart_seaman_id ?? '-',
        name: item.name ?? item.firstName ?? item.mobile_user_first_name ?? '-',
        lname: item.lname ?? item.lastName ?? item.mobile_user_last_name ?? '-',
        pos: item.pos ?? item.position ?? item.mobile_user_position_name_th ?? '-',
        doc: item.doc ?? item.documentName ?? item.documentType ?? item.document_display_name ?? item.document_name_th ?? '-',
        status: item.status ?? item.requestStatus ?? item.document_status_name_th ?? item.document_status_name ?? '-',
        date: item.date ?? item.requestDate ?? item.submitted_at ?? item.created_at ?? item.createdAt ?? '-',
        amt: item.amt ?? item.amount ?? item.paymentAmount ?? '-',
        resubmit: item.resubmit ?? item.isResubmit ?? item.is_resubmit ?? false,
    };
}

function buildAddressText(deliverAddress) {
    if (!deliverAddress) return '-';

    const parts = [
        deliverAddress.address_line,
        deliverAddress.sub_district,
        deliverAddress.district,
        deliverAddress.province,
        deliverAddress.postal_code,
    ].filter(Boolean);

    return parts.length ? parts.join(' ') : '-';
}

function parseDateValue(value) {
    if (!value) {
        return null;
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === 'string') {
        const normalized = value.trim();
        const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
        if (match) {
            const [, year, month, day, hours = '00', minutes = '00', seconds = '00'] = match;
            return new Date(
                Number(year),
                Number(month) - 1,
                Number(day),
                Number(hours),
                Number(minutes),
                Number(seconds),
            );
        }
    }

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function formatDateTime(value) {
    if (!value) {
        return '-';
    }

    const date = parseDateValue(value);
    if (!date) {
        return value;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function normalizeDeptSubmission(deptSubmission) {
    if (!deptSubmission) {
        return null;
    }

    const operatorName = deptSubmission.actioned_by_username
        ?? [deptSubmission.actioned_by_first_name, deptSubmission.actioned_by_last_name].filter(Boolean).join(' ')
        ?? '-';

    return {
        submittedAt: formatDateTime(deptSubmission.actioned_at),
        operatorName: operatorName || '-',
        operatorPhone: deptSubmission.actioned_by_mobile_number ?? '-',
        action: deptSubmission.action ?? null,
        note: deptSubmission.note ?? '',
        actionedBy: deptSubmission.actioned_by ?? null,
    };
}

function formatDate(value) {
    if (!value) {
        return '-';
    }

    const date = parseDateValue(value);
    if (!date) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const [year, month, day] = value.split('-');
            return `${day}/${month}/${year}`;
        }
        return value;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function normalizeDeptResult(deptResult) {
    if (!deptResult) {
        return null;
    }

    const receivedOperatorName = deptResult.received_actioned_by_username
        ?? [deptResult.received_actioned_by_first_name, deptResult.received_actioned_by_last_name].filter(Boolean).join(' ')
        ?? '-';

    return {
        availablePickupDate: formatDate(deptResult.note),
        availablePickupDateValue: deptResult.note ?? '',
        recordedAt: formatDateTime(deptResult.actioned_at),
        operatorName: deptResult.actioned_by_username
            ?? [deptResult.actioned_by_first_name, deptResult.actioned_by_last_name].filter(Boolean).join(' ')
            ?? '-',
        operatorPhone: deptResult.actioned_by_mobile_number ?? '-',
        receivedDate: formatDate(deptResult.received_date),
        receivedDateValue: deptResult.received_date ?? '',
        receivedRecordedAt: formatDateTime(deptResult.received_actioned_at),
        receivedOperatorName: receivedOperatorName || '-',
        receivedOperatorPhone: deptResult.received_actioned_by_mobile_number ?? '-',
    };
}

function normalizeDeliveryInfo(deliveryInfo) {
    if (!deliveryInfo) {
        return null;
    }

    const operatorName = deliveryInfo.shipped_by_username
        ?? [deliveryInfo.shipped_by_first_name, deliveryInfo.shipped_by_last_name].filter(Boolean).join(' ')
        ?? '-';

    return {
        trackingNo: deliveryInfo.tracking_no ?? '-',
        shippedDate: formatDate(deliveryInfo.shipped_date),
        shippedDateValue: deliveryInfo.shipped_date ?? '',
        recordedAt: formatDateTime(deliveryInfo.shipped_recorded_at),
        operatorName: operatorName || '-',
        operatorPhone: deliveryInfo.shipped_by_mobile_number ?? '-',
        status: deliveryInfo.delivery_status ?? '-',
    };
}

function buildDocumentsFromAttachments(attachments = []) {
    return attachments.map((item, index) => ({
        id: item.sortOrder ?? index + 1,
        n: item.documentName ?? item.document_name ?? `เอกสาร ${index + 1}`,
        f: !!item.fileUploaded,
        p: item.filePath ?? item.file_path ?? null,
        upd: !!item.isUpdated,
    }));
}

function buildAttachmentResults(attachments = []) {
    const results = {};

    attachments.forEach((item, index) => {
        const result = item.checkResult === 'fix' ? 'fix' : item.checkResult === 'pass' ? 'pass' : '';
        const docId = item.sortOrder ?? index + 1;
        results[docId] = {
            result,
            note: item.checkNote ?? '',
        };
    });

    return results;
}

function ensurePassedAttachmentResultsForDepartmentStatus(attachmentResults, attachments, statusLabel) {
    if (statusLabel !== 'รอผลกรมเจ้าท่า') {
        return attachmentResults;
    }

    const normalizedResults = { ...attachmentResults };
    attachments.forEach((item, index) => {
        const docId = item.sortOrder ?? index + 1;
        const currentResult = normalizedResults[docId]?.result;

        normalizedResults[docId] = {
            result: currentResult === 'fix' ? 'pass' : (currentResult || 'pass'),
            note: '',
        };
    });

    return normalizedResults;
}

function mapStatusCodeToLabel(statusCode, fallbackStatus = 'รอตรวจเอกสาร') {
    const statusMap = {
        PENDING_DOCUMENT_REVIEW: 'รอตรวจเอกสาร',
        PENDING_APPLICANT_CORRECTION: 'รอผู้ยื่นแก้ไข',
        PENDING_DEPARTMENT_RESULT: 'รอผลกรมเจ้าท่า',
        PENDING_DEPARTMENT_PICKUP: 'รอรับเอกสารจากกรม',
        DELIVERING: 'กำลังจัดส่ง',
        DELIVERED: 'จัดส่งสำเร็จ',
        CANCELLED: 'ยกเลิก',
    };

    return statusMap[statusCode] ?? fallbackStatus;
}

function normalizeStepper(stepper, fallbackStatus) {
    if (!stepper) {
        return null;
    }

    const statusCode = (stepper.statusCode ?? '').toString().toUpperCase();
    let statusLabel = mapStatusCodeToLabel(stepper.statusCode, fallbackStatus);
    const statusSignal = `${statusCode} ${statusLabel}`.toUpperCase();

    let currentStep = stepper.currentStep ?? 1;
    if (statusSignal.includes('จัดส่งสำเร็จ') || statusSignal.includes('DELIVERED') || statusSignal.includes('DELIVERY_SUCCESS') || statusSignal.includes('SHIPPING_SUCCESS')) {
        currentStep = 5;
    } else if (statusSignal.includes('กำลังจัดส่ง') || statusSignal.includes('อยู่ระหว่างจัดส่ง') || statusSignal.includes('DELIVERING') || statusSignal.includes('OUT_FOR_DELIVERY') || statusSignal.includes('IN_TRANSIT') || statusSignal.includes('SHIPPING')) {
        currentStep = 4;
    } else if (statusSignal.includes('รอรับเอกสารจากกรม') || statusSignal.includes('PENDING_DEPARTMENT_PICKUP')) {
        currentStep = 3;
    } else if (statusSignal.includes('รอผลกรมเจ้าท่า') || statusSignal.includes('PENDING_DEPARTMENT_RESULT')) {
        currentStep = 2;
    }

    const completedSteps = Array.from({ length: Math.max(currentStep - 1, 0) }, (_, index) => index + 1);

    // Keep status label aligned with stepper stage when backend status code is non-semantic (e.g. UUID).
    if (currentStep >= 5) {
        statusLabel = 'จัดส่งสำเร็จ';
    } else if (currentStep === 4) {
        statusLabel = 'กำลังจัดส่ง';
    } else if (currentStep === 3) {
        statusLabel = 'รอรับเอกสารจากกรม';
    } else if (currentStep === 2) {
        statusLabel = 'รอผลกรมเจ้าท่า';
    }

    return {
        statusCode: stepper.statusCode ?? null,
        currentStep,
        completedSteps,
        isCancelled: !!stepper.isCancelled,
        statusLabel,
    };
}

function normalizeDetailResponse(responseData, requestNo, currentRequests = []) {
    const attachments = responseData.documentAttachments ?? [];
    const profile = responseData.profile ?? {};
    const deptSubmission = normalizeDeptSubmission(responseData.deptSubmission);
    const deptResult = normalizeDeptResult(responseData.deptResult);
    const deliveryInfo = normalizeDeliveryInfo(responseData.deliveryInfo);
    const deliverAddress = responseData.deliverAddress ?? null;
    const requestFromList = currentRequests.find((req) => req.no === requestNo) ?? null;
    const fallbackStatus = requestFromList?.status ?? 'รอตรวจเอกสาร';
    const normalizedStepper = normalizeStepper(responseData.stepper, fallbackStatus);

    const attachmentResults = ensurePassedAttachmentResultsForDepartmentStatus(
        buildAttachmentResults(attachments),
        attachments,
        normalizedStepper?.statusLabel ?? fallbackStatus,
    );

    return {
        no: responseData.requestNo ?? requestFromList?.no ?? '-',
        mobileUserUuid: profile.MOBILE_UUID ?? requestFromList?.mobileUserUuid ?? '-',
        ssid: profile.SMART_SEAMAN_ID ?? requestFromList?.ssid ?? '-',
        name: profile.FIRST_NAME ?? requestFromList?.name ?? '-',
        lname: profile.LAST_NAME ?? requestFromList?.lname ?? '-',
        pos: profile.POSITION_CODE ?? requestFromList?.pos ?? '-',
        doc: responseData.documentName ?? requestFromList?.doc ?? (attachments[0]?.documentName ?? '-'),
        status: normalizedStepper?.statusLabel ?? fallbackStatus,
        date: responseData.dateOfSubmission ?? requestFromList?.date ?? '-',
        amt: requestFromList?.amt ?? '-',
        resubmit: requestFromList?.resubmit ?? false,
        dob: profile.DATE_OF_BIRTH ?? '-',
        email: profile.EMAIL ?? '-',
        mobile: profile.MOBILE_NUMBER ?? '-',
        company: profile.COMPANY_CODE ?? '-',
        deptSubmission,
        deptResult,
        deliveryInfo,
        stepper: normalizedStepper,
        deliveryAddressText: buildAddressText(deliverAddress),
        deliverAddress,
        profile,
        attachments,
        documents: buildDocumentsFromAttachments(attachments),
        attachmentResults,
    };
}

function computeStatusCounts(requests, total = requests.length, currentFilter = 'all') {
    const counts = { all: requests.length };
    const statuses = ['รอตรวจเอกสาร', 'รอผู้ยื่นแก้ไข', 'รอผลกรมเจ้าท่า', 'รอรับเอกสารจากกรม', 'กำลังจัดส่ง', 'จัดส่งสำเร็จ', 'ยกเลิก'];
    statuses.forEach(s => counts[s] = 0);
    requests.forEach(r => {
        if (counts[r.status] !== undefined) counts[r.status]++;
    });

    if (currentFilter === 'all') {
        counts.all = total;
    } else {
        counts.all = total;
        counts[currentFilter] = total;
    }

    return counts;
}

function normalizeStatusCounts(statusCounts, total = 0) {
    if (!Array.isArray(statusCounts)) {
        return statusCounts;
    }

    const counts = { all: 0 };
    statusCounts.forEach((item) => {
        const statusName = item.document_status_name_th ?? item.status ?? item.name;
        const statusTotal = item.total ?? 0;

        if (statusName) {
            counts[statusName] = statusTotal;
        }

        counts.all += statusTotal;
    });

    if (!counts.all) {
        counts.all = total;
    }

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
        pageSize: 10,
        detailRequest: null,
        detailLoading: false,
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
                const token = authStore.user?.data?.token;
                const lastNum = this.currentPage * this.pageSize;

                const query = {
                    size: this.pageSize,
                    lastNum,
                    ...(this.currentFilter !== 'all' && { status: this.currentFilter }),
                    ...(this.searchFilters.ssid && { mobile_user_smart_seaman_id: this.searchFilters.ssid }),
                    ...(this.searchFilters.name && { mobile_user_first_name: this.searchFilters.name }),
                    ...(this.searchFilters.requestNo && { requestNo: this.searchFilters.requestNo }),
                };

                const res = await axios.get(`${baseUrl}/v1/document-request`, {
                    params: query,
                    headers: buildHeaders(token),
                });

                const responseCode = res.data?.code;
                const responseData = res.data?.data ?? res.data ?? {};

                if (!responseCode || responseCode === 'WA00000') {
                    const rawRequests = responseData.documentRequestList ?? responseData.requests ?? responseData.items ?? responseData.documentRequests ?? responseData.list ?? [];
                    this.requests = rawRequests.map(normalizeRequest);
                    this.total = responseData.totalData ?? responseData.total ?? responseData.totalCount ?? responseData.countList ?? this.requests.length;
                    this.statusCounts = responseData.statusCounts
                        ? normalizeStatusCounts(responseData.statusCounts, this.total)
                        : computeStatusCounts(this.requests, this.total, this.currentFilter);
                } else if (res.data.code === 'WA00007') {
                    authStore.logout();
                } else {
                    console.log(res.data.code, res.data.description);
                    this.requests = [];
                    this.total = 0;
                    this.statusCounts = {};
                }
            } catch (error) {
                console.error(error);
                this.requests = [];
                this.total = 0;
                this.statusCounts = {};
            } finally {
                this.loading = false;
            }
        },

        async fetchDetail(requestNo) {
            this.detailLoading = true;
            try {
                if (!requestNo) {
                    this.detailRequest = null;
                    return null;
                }

                const authStore = useAuthStore();
                const token = authStore.user?.data?.token;

                const res = await axios.get(`${baseUrl}/v1/document-renewals/${requestNo}`, {
                    headers: buildHeaders(token),
                });

                const responseCode = res.data?.code;
                const responseData = res.data?.data ?? res.data ?? {};

                if (!responseCode || responseCode === 'WA00000') {
                    if (responseData.profile || responseData.documentAttachments || responseData.deliverAddress) {
                        this.detailRequest = normalizeDetailResponse(responseData, requestNo, this.requests);
                        return this.detailRequest;
                    }

                    const rawDetail = responseData.documentRequest
                        ?? responseData.item
                        ?? responseData.documentRequestDetail
                        ?? (Array.isArray(responseData.documentRequestList) ? responseData.documentRequestList[0] : null)
                        ?? (Array.isArray(responseData.items) ? responseData.items[0] : null);

                    this.detailRequest = rawDetail ? normalizeRequest(rawDetail) : null;
                    return this.detailRequest;
                }

                if (res.data.code === 'WA00007') {
                    authStore.logout();
                }

                this.detailRequest = null;
                return null;
            } catch (error) {
                console.error(error);
                this.detailRequest = null;
                return null;
            } finally {
                this.detailLoading = false;
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

            const res = await axios.post(
                `${baseUrl}/v1/document-request-action/${requestNo}/${action}`,
                {},
                { headers: buildHeaders(token) }
            );

            if (res.data.code === 'WA00007') {
                authStore.logout();
            }
            return res.data;
        },

        async saveInspectionResults(requestNo, results = {}) {
            if (!requestNo) {
                return null;
            }

            const normalizedResults = Object.fromEntries(
                Object.entries(results).map(([docId, value]) => {
                    const normalizedResult = value?.result === 'fix' ? 'fix' : value?.result === 'pass' ? 'pass' : '';
                    const normalizedNote = normalizedResult === 'fix' ? (value?.note ?? '').trim() : '';

                    return [String(docId), {
                        result: normalizedResult,
                        note: normalizedNote,
                    }];
                })
            );

            if (this.useMock) {
                if (this.detailRequest && this.detailRequest.no === requestNo) {
                    this.detailRequest.attachmentResults = normalizedResults;
                }
                return normalizedResults;
            }

            const inspections = Object.entries(normalizedResults).map(([docId, value]) => ({
                sortOrder: Number(docId),
                checkResult: value.result,
                checkNote: value.note,
            }));

            const authStore = useAuthStore();
            const token = authStore.user?.data?.token;

            const res = await axios.post(
                `${baseUrl}/v1/document-request-inspection`,
                {
                    requestNo,
                    inspections,
                },
                { headers: buildHeaders(token) }
            );

            if (res.data?.code === 'WA00007') {
                authStore.logout();
            }

            if (this.detailRequest && this.detailRequest.no === requestNo) {
                this.detailRequest.attachmentResults = normalizedResults;

                if (Array.isArray(this.detailRequest.attachments)) {
                    this.detailRequest.attachments = this.detailRequest.attachments.map((item, index) => {
                        const docId = String(item.sortOrder ?? index + 1);
                        const result = normalizedResults[docId];
                        if (!result) {
                            return item;
                        }

                        return {
                            ...item,
                            checkResult: result.result,
                            checkNote: result.note,
                        };
                    });
                }
            }

            return normalizedResults;
        },

        async saveDeptResult(requestNo, availablePickupDate) {
            if (!requestNo || !availablePickupDate) {
                return null;
            }

            const authStore = useAuthStore();
            const token = authStore.user?.data?.token;

            const res = await axios.post(
                `${baseUrl}/v1/document-request-dept-result`,
                {
                    requestNo,
                    availablePickupDate,
                },
                { headers: buildHeaders(token) }
            );

            if (res.data?.code === 'WA00007') {
                authStore.logout();
            }

            return res.data?.data ?? res.data;
        },

        async savePickupAction(requestNo, payload = {}) {
            if (!requestNo || !payload?.action) {
                return null;
            }

            const authStore = useAuthStore();
            const token = authStore.user?.data?.token;

            const res = await axios.post(
                `${baseUrl}/v1/document-request-pickup-action`,
                {
                    requestNo,
                    action: payload.action,
                    availablePickupDate: payload.availablePickupDate,
                    receivedDate: payload.receivedDate,
                    trackingNo: payload.trackingNo,
                    shippedDate: payload.shippedDate,
                },
                { headers: buildHeaders(token) }
            );

            if (res.data?.code === 'WA00007') {
                authStore.logout();
            }

            return res.data?.data ?? res.data;
        },

        async uploadRequestAttachment(requestNo, sortOrder, file) {
            if (!requestNo || !sortOrder || !file) {
                return null;
            }

            const authStore = useAuthStore();
            const token = authStore.user?.data?.token;

            const formData = new FormData();
            formData.append('requestNo', requestNo);
            formData.append('sortOrder', String(sortOrder));
            formData.append('file', file);

            const res = await axios.post(
                `${baseUrl}/v1/document-request-attachment-upload`,
                formData,
                {
                    headers: {
                        ...buildHeaders(token),
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (res.data?.code === 'WA00007') {
                authStore.logout();
            }

            return res.data?.data ?? res.data;
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
