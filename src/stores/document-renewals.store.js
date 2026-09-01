import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from '@/stores';
import { uuid } from 'vue-uuid';
import { REQUESTS } from '@/constants/documentRequests';

const baseUrl = import.meta.env.VITE_BASE_URL_API;
const MENU_CODE = 'OPER104';
const BANGKOK_TIME_ZONE = 'Asia/Bangkok';

function buildHeaders(token) {
    const headers = {
        Accept: 'application/json, text/plain, */*',
        Language: 'TH',
        'device-model': 'ios',
        'correlation-id': uuid.v4(),
    };

    if (token) {
        headers.Authorization = 'Bearer ' + token;
    }

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
        date: formatDateTime(item.date ?? item.requestDate ?? item.submitted_at ?? item.created_at ?? item.createdAt),
        cancelledAt: formatShortBangkokDateTime(item.cancelledAt ?? item.cancelled_at),
        amt: item.amt ?? item.amount ?? item.paymentAmount ?? '-',
        resubmit: item.resubmit ?? item.isResubmit ?? item.is_resubmit ?? false,
    };
}

function buildAddressText(deliverAddress) {
    if (!deliverAddress) return '-';

    const parts = [
        deliverAddress.addressLine ?? deliverAddress.address_line,
        deliverAddress.subDistrictName ?? deliverAddress.sub_district_name ?? deliverAddress.subDistrict ?? deliverAddress.sub_district,
        deliverAddress.districtName ?? deliverAddress.district_name ?? deliverAddress.district,
        deliverAddress.provinceName ?? deliverAddress.province_name ?? deliverAddress.province,
        deliverAddress.postalCode ?? deliverAddress.postal_code,
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
            return new Date(Date.UTC(
                Number(year),
                Number(month) - 1,
                Number(day),
                Number(hours),
                Number(minutes),
                Number(seconds),
            ));
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

    return new Intl.DateTimeFormat('en-GB', {
        timeZone: BANGKOK_TIME_ZONE,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).format(date).replace(',', '');
}

function formatShortBangkokDateTime(value) {
    if (!value) {
        return null;
    }

    if (typeof value === 'string') {
        const normalized = value.trim();
        const displayDateMatch = normalized.match(/^(\d{2})\/(\d{2})\/(\d{2}|\d{4})\s+(\d{2}):(\d{2})$/);
        if (displayDateMatch) {
            const [, day, month, year, hours, minutes] = displayDateMatch;
            return `${day}/${month}/${year.slice(-2)} ${hours}:${minutes}`;
        }

        const bangkokLocalMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/);
        if (bangkokLocalMatch) {
            const [, year, month, day, hours, minutes] = bangkokLocalMatch;
            return `${day}/${month}/${year.slice(-2)} ${hours}:${minutes}`;
        }
    }

    const date = parseDateValue(value);
    if (!date) {
        return value;
    }

    return new Intl.DateTimeFormat('en-GB', {
        timeZone: BANGKOK_TIME_ZONE,
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).format(date).replace(',', '');
}

function normalizeDeptSubmission(deptSubmission) {
    if (!deptSubmission) {
        return null;
    }

    const operatorName = deptSubmission.actionedByUsername
        ?? deptSubmission.actioned_by_username
        ?? [
            deptSubmission.actionedByFirstName ?? deptSubmission.actioned_by_first_name,
            deptSubmission.actionedByLastName ?? deptSubmission.actioned_by_last_name,
        ].filter(Boolean).join(' ')
        ?? '-';

    return {
        submittedAt: formatDateTime(
            deptSubmission.actionedAt
                ?? deptSubmission.actioned_at
                ?? deptSubmission.submittedToDeptDate
                ?? deptSubmission.submitted_to_dept_date
                ?? deptSubmission.recordedAt
                ?? deptSubmission.recorded_at,
        ),
        operatorName: operatorName || '-',
        operatorPhone: deptSubmission.actionedByMobileNumber
            ?? deptSubmission.actioned_by_mobile_number
            ?? '-',
        action: deptSubmission.action ?? null,
        note: deptSubmission.note ?? '',
        actionedBy: deptSubmission.actionedBy ?? deptSubmission.actioned_by ?? null,
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

    return new Intl.DateTimeFormat('en-GB', {
        timeZone: BANGKOK_TIME_ZONE,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
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

    const operatorName = deliveryInfo.shippedByUsername
        ?? deliveryInfo.shipped_by_username
        ?? [
            deliveryInfo.shippedByFirstName ?? deliveryInfo.shipped_by_first_name,
            deliveryInfo.shippedByLastName ?? deliveryInfo.shipped_by_last_name,
        ].filter(Boolean).join(' ')
        ?? '-';

    return {
        trackingNo: deliveryInfo.trackingNo ?? deliveryInfo.tracking_no ?? '-',
        shippedDate: formatDate(deliveryInfo.shippedDate ?? deliveryInfo.shipped_date),
        shippedDateValue: deliveryInfo.shippedDateValue ?? deliveryInfo.shipped_date ?? '',
        recordedAt: formatDateTime(deliveryInfo.shippedRecordedAt ?? deliveryInfo.shipped_recorded_at),
        operatorName: operatorName || '-',
        operatorPhone: deliveryInfo.shippedByMobileNumber
            ?? deliveryInfo.shipped_by_mobile_number
            ?? '-',
        status: deliveryInfo.deliveryStatus ?? deliveryInfo.delivery_status ?? '-',
    };
}

function buildDocumentsFromAttachments(attachments = []) {
    return attachments.map((item, index) => ({
        id: item.sortOrder ?? index + 1,
        itemId: item.itemId ?? null,
        n: item.documentName ?? item.document_name ?? `เอกสาร ${index + 1}`,
        f: !!item.fileUploaded,
        // support old flat filePath and new nested files[] array
        p: item.filePath ?? item.file_path ?? item.files?.[0]?.fileUrl ?? item.files?.[0]?.filePath ?? item.files?.[0]?.url ?? null,
        fileName: item.files?.[0]?.originalFileName ?? null,
        upd: !!item.isUpdated,
    }));
}

function buildAttachmentResults(attachments = []) {
    const results = {};

    attachments.forEach((item, index) => {
        const rawResult = (item.checkResult ?? item.check_result ?? item.approveStatus ?? item.approve_status ?? '')
            .toString()
            .trim()
            .toLowerCase();
        const result = rawResult === 'fix' ? 'fix' : rawResult === 'pass' ? 'pass' : '';
        const docId = item.sortOrder ?? index + 1;
        results[docId] = {
            result,
            note: item.checkNote ?? item.check_note ?? item.note ?? '',
        };
    });

    return results;
}

function mapStatusCodeToLabel(statusCode, fallbackStatus = 'รอตรวจเอกสาร') {
    const statusMap = {
        PAYMENT_PENDING: 'รอชำระเงิน',
        PENDING_DOCUMENT_REVIEW: 'รอตรวจเอกสาร',
        PENDING_APPLICANT_CORRECTION: 'รอผู้ยื่นแก้ไข',
        PENDING_MARINE_DEPARTMENT_RESULT: 'รอผลกรมเจ้าท่า',
        PENDING_DEPARTMENT_RESULT: 'รอผลกรมเจ้าท่า',
        PENDING_DEPARTMENT_DOCUMENT_PICKUP: 'รอรับเอกสารจากกรม',
        PENDING_DEPARTMENT_PICKUP: 'รอรับเอกสารจากกรม',
        DELIVERING: 'กำลังจัดส่ง',
        DELIVERED: 'จัดส่งสำเร็จ',
        CANCELLED: 'ยกเลิก',
    };

    return statusMap[(statusCode ?? '').toString().toUpperCase()] ?? fallbackStatus;
}

function normalizeStepper(stepper, fallbackStatus) {
    if (!stepper) {
        return null;
    }

    const statusCode = (stepper.statusCode ?? '').toString().toUpperCase();
    let statusLabel = mapStatusCodeToLabel(stepper.statusCode, fallbackStatus);
    const statusSignal = `${statusCode} ${statusLabel}`.toUpperCase();

    let currentStep = stepper.currentStep ?? 1;
    if (statusSignal.includes('รอชำระเงิน') || statusSignal.includes('PAYMENT_PENDING')) {
        currentStep = null;
    } else if (statusSignal.includes('จัดส่งสำเร็จ') || statusSignal.includes('DELIVERED') || statusSignal.includes('DELIVERY_SUCCESS') || statusSignal.includes('SHIPPING_SUCCESS')) {
        currentStep = 5;
    } else if (statusSignal.includes('กำลังจัดส่ง') || statusSignal.includes('อยู่ระหว่างจัดส่ง') || statusSignal.includes('DELIVERING') || statusSignal.includes('OUT_FOR_DELIVERY') || statusSignal.includes('IN_TRANSIT') || statusSignal.includes('SHIPPING')) {
        currentStep = 4;
    } else if (statusSignal.includes('รอรับเอกสารจากกรม') || statusSignal.includes('PENDING_DEPARTMENT_DOCUMENT_PICKUP') || statusSignal.includes('PENDING_DEPARTMENT_PICKUP')) {
        currentStep = 3;
    } else if (statusSignal.includes('รอผลกรมเจ้าท่า') || statusSignal.includes('PENDING_MARINE_DEPARTMENT_RESULT') || statusSignal.includes('PENDING_DEPARTMENT_RESULT')) {
        currentStep = 2;
    } else if (statusSignal.includes('รอตรวจเอกสาร') || statusSignal.includes('รอผู้ยื่นแก้ไข') || statusSignal.includes('PENDING_DOCUMENT_REVIEW') || statusSignal.includes('PENDING_APPLICANT_CORRECTION')) {
        currentStep = 1;
    }

    const completedSteps = currentStep == null
        ? []
        : Array.from({ length: Math.max(currentStep - 1, 0) }, (_, index) => index + 1);

    return {
        statusCode: stepper.statusCode ?? null,
        currentStep,
        completedSteps,
        isCancelled: !!stepper.isCancelled,
        statusLabel,
    };
}

function normalizeDetailResponse(responseData, requestNo, currentRequests = []) {
    // support both old (documentAttachments) and new (items) attachment key
    const attachments = responseData.documentAttachments ?? responseData.items ?? [];
    const profile = responseData.profile ?? {};
    const deptSubmission = normalizeDeptSubmission(responseData.deptSubmission);
    const deptResult = normalizeDeptResult(responseData.deptResult);
    // support both old (deliveryInfo) and new (delivery) delivery key
    const deliveryInfo = normalizeDeliveryInfo(responseData.deliveryInfo ?? responseData.delivery);
    const deliverAddress = responseData.deliverAddress ?? null;
    const requestFromList = currentRequests.find((req) => req.no === requestNo) ?? null;

    // status can be a string (old) or an object { documentStatusCode, nameTh } (new)
    const rawStatus = responseData.status;
    const statusString = typeof rawStatus === 'string'
        ? rawStatus
        : (rawStatus?.nameTh ?? mapStatusCodeToLabel(rawStatus?.documentStatusCode, null) ?? null);
    const fallbackStatus = statusString ?? requestFromList?.status ?? 'รอตรวจเอกสาร';

    // build stepper from responseData.stepper or from status.step when stepper is absent
    const stepperInput = responseData.stepper
        ?? (rawStatus?.step != null ? { statusCode: rawStatus?.documentStatusCode, currentStep: rawStatus.step, isCancelled: false } : null);
    const normalizedStepper = normalizeStepper(stepperInput, fallbackStatus);

    const attachmentResults = buildAttachmentResults(attachments);
    const rawResubmittedAt = responseData.resubmittedAt ?? responseData.resubmitted_at ?? null;
    const rawCancelledAt = responseData.cancelledAt ?? responseData.cancelled_at ?? null;

    return {
        no: responseData.requestNo ?? requestFromList?.no ?? '-',
        mobileUserUuid: responseData.mobileUserUuid ?? profile.mobileUuid ?? profile.MOBILE_UUID ?? requestFromList?.mobileUserUuid ?? '-',
        ssid: profile.smartSeamanId ?? profile.SMART_SEAMAN_ID ?? requestFromList?.ssid ?? '-',
        name: profile.firstName ?? profile.FIRST_NAME ?? requestFromList?.name ?? '-',
        lname: profile.lastName ?? profile.LAST_NAME ?? requestFromList?.lname ?? '-',
        pos: profile.positionDescription ?? profile.positionName ?? profile.POSITION_NAME ?? profile.positionCode ?? profile.POSITION_CODE ?? requestFromList?.pos ?? '-',
        doc: responseData.documentName ?? requestFromList?.doc ?? (attachments[0]?.documentName ?? '-'),
        status: normalizedStepper?.statusLabel ?? fallbackStatus,
        // support both old (dateOfSubmission) and new (submittedAt) date key
        date: responseData.dateOfSubmission ?? responseData.submittedAt ?? requestFromList?.date ?? '-',
        resubmittedAt: rawResubmittedAt ? formatDateTime(rawResubmittedAt) : null,
        cancelledAt: formatShortBangkokDateTime(rawCancelledAt),
        amt: responseData.amount != null ? String(responseData.amount) : (requestFromList?.amt ?? '-'),
        resubmit: responseData.isResubmit ?? requestFromList?.resubmit ?? false,
        dob: profile.dateOfBirth ?? profile.DATE_OF_BIRTH ?? '-',
        age: profile.age ?? '-',
        email: profile.email ?? profile.EMAIL ?? '-',
        mobile: profile.mobile ?? profile.mobileNumber ?? profile.MOBILE_NUMBER ?? '-',
        company: profile.companyDescription ?? profile.companyName ?? profile.COMPANY_NAME ?? profile.companyCode ?? profile.COMPANY_CODE ?? '-',
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
    const statuses = ['รอชำระเงิน', 'รอตรวจเอกสาร', 'รอผู้ยื่นแก้ไข', 'รอผลกรมเจ้าท่า', 'รอรับเอกสารจากกรม', 'กำลังจัดส่ง', 'จัดส่งสำเร็จ', 'ยกเลิก'];
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

function isSuccessfulDeliveryStatus(status) {
    const statusText = String(status ?? '').toLowerCase();
    return [
        'จัดส่งสำเร็จ',
        'นำจ่ายสำเร็จ',
        'นำส่งสำเร็จ',
        'delivered',
        'delivery successful',
        'successfully delivered',
    ].some(keyword => statusText.includes(keyword));
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
        trackingEvents: [],
        trackingLoading: false,
        trackingError: '',
        trackingLastUpdated: null,
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
            this.trackingEvents = [];
            this.trackingError = '';
            this.trackingLastUpdated = null;
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
                    // detect flat response (new API shape) vs wrapped response (old shape)
                    const isRichFlat = responseData.requestNo
                        || responseData.documentAttachments
                        || responseData.items
                        || responseData.profile
                        || responseData.deliverAddress;

                    let detailData;
                    if (isRichFlat) {
                        detailData = responseData;
                    } else {
                        detailData = responseData.documentRequest
                            ?? responseData.item
                            ?? responseData.documentRequestDetail
                            ?? (Array.isArray(responseData.documentRequestList) ? responseData.documentRequestList[0] : null);
                    }

                    if (!detailData) {
                        this.detailRequest = null;
                        return null;
                    }

                    // use rich normalizer if any detail fields are present, otherwise basic
                    if (detailData.profile || detailData.documentAttachments || detailData.items || detailData.deliverAddress || detailData.requestNo) {
                        this.detailRequest = normalizeDetailResponse(detailData, requestNo, this.requests);
                    } else {
                        this.detailRequest = normalizeRequest(detailData);
                    }
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

        async fetchDeliveryTracking(requestNo) {
            if (!requestNo) {
                return null;
            }

            this.trackingLoading = true;
            this.trackingError = '';
            try {
                if (this.useMock) {
                    this.trackingEvents = [];
                    return null;
                }

                const authStore = useAuthStore();
                const token = authStore.user?.data?.token;
                const res = await axios.get(`${baseUrl}/v1/document-renewals/${requestNo}/tracking`, {
                    headers: buildHeaders(token),
                });

                if (res.data?.code === 'WA00007') {
                    authStore.logout();
                }

                const data = res.data?.data ?? {};
                this.trackingEvents = Array.isArray(data.events)
                    ? data.events.map((event) => ({
                        time: event.time ?? '-',
                        status: event.status ?? '-',
                        loc: [event.location, event.postcode].filter(value => value && value !== '-').join(' ') || '-',
                        cur: !!event.current,
                    }))
                    : [];

                if (this.detailRequest && this.trackingEvents.some(event => isSuccessfulDeliveryStatus(event.status))) {
                    this.detailRequest.status = 'จัดส่งสำเร็จ';
                    this.detailRequest.stepper = {
                        ...(this.detailRequest.stepper ?? {}),
                        statusCode: 'DELIVERED',
                        currentStep: 5,
                        completedSteps: [1, 2, 3, 4],
                        isCancelled: false,
                        statusLabel: 'จัดส่งสำเร็จ',
                    };
                }

                this.trackingLastUpdated = data.lastUpdated ?? null;
                return data;
            } catch (error) {
                this.trackingEvents = [];
                this.trackingError = error.response?.data?.description
                    ?? error.response?.data?.message
                    ?? 'ไม่สามารถโหลดสถานะจากไปรษณีย์ไทยได้';
                return null;
            } finally {
                this.trackingLoading = false;
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

            const responseCode = res.data?.code;
            if (responseCode === 'WA00007') {
                authStore.logout();
            }
            if (responseCode !== 'WA00000') {
                throw new Error(res.data?.description || 'Can not save inspection results.');
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
