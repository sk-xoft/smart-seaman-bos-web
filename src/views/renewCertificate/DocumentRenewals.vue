<template>
  <div class="document-requests-page">
    <!-- LIST PAGE -->
    <div class="page page-list" :class="{ on: !selectedRequest }" v-if="!selectedRequest" key="list-page">
        <Title title="จัดการคำขอต่อเอกสาร" />
        <Breadcrumb link_menu="/document-renewals" name_menu="จัดการคำขอต่อเอกสาร" title="ค้นหา" />

        <!-- Search Card -->
        <div class="card bg-base-200 my-7">
          <div class="card-body p-5 pb-9">
            <h3 class="text-xl text-white font-semibold mb-3">เงื่อนไขในการค้นหา</h3>
          <div class="search-grid">
            <div>
              <label class="form-label">Smart Seaman ID</label>
              <div class="search-input-wrap">
                <input v-model="store.searchFilters.ssid" class="form-input" placeholder="Smart Seaman ID">
                <button
                  v-if="store.searchFilters.ssid"
                  type="button"
                  class="clear-input-button"
                  title="ล้าง Smart Seaman ID"
                  aria-label="ล้าง Smart Seaman ID"
                  @click="clearSearchFilter('ssid', $event)"
                >
                  <i class="light-icon-x" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <div>
              <label class="form-label">ชื่อ</label>
              <div class="search-input-wrap">
                <input v-model="store.searchFilters.name" class="form-input" placeholder="ชื่อ">
                <button
                  v-if="store.searchFilters.name"
                  type="button"
                  class="clear-input-button"
                  title="ล้างชื่อ"
                  aria-label="ล้างชื่อ"
                  @click="clearSearchFilter('name', $event)"
                >
                  <i class="light-icon-x" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <div>
              <label class="form-label">Request No.</label>
              <div class="search-input-wrap">
                <input v-model="store.searchFilters.requestNo" class="form-input" placeholder="เช่น 2505001">
                <button
                  v-if="store.searchFilters.requestNo"
                  type="button"
                  class="clear-input-button"
                  title="ล้าง Request No."
                  aria-label="ล้าง Request No."
                  @click="clearSearchFilter('requestNo', $event)"
                >
                  <i class="light-icon-x" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="search-actions">
            <button
              class="btn btn-primary search-button"
              :disabled="store.loading"
              :aria-busy="store.loading"
              @click="store.search()"
            >
              <span v-if="store.loading" class="search-spinner" aria-hidden="true"></span>
              <i v-else class="light-icon-search" aria-hidden="true"></i>
              {{ store.loading ? 'กำลังค้นหา...' : 'ค้นหา' }}
            </button>
          </div>
        </div>
        </div>

        <!-- List Card -->
        <div class="card bg-base-200 overflow-x-auto">
          <div class="card-body">
            <h3 class="text-xl text-white font-semibold mb-3">ผลการค้นหา</h3>
            <div class="filter-tabs">
              <button 
                v-for="status in filterStatuses" 
                :key="status.value"
                @click="store.setFilter(status.value)"
                :class="['tab-btn', { 'on': store.currentFilter === status.value }]"
              >
                {{ status.label }} ({{ status.count }})
              </button>
            </div>

            <!-- Table -->
            <table class="table table-striped lg:table-fixed w-full rounded-none text-center">
              <thead>
                <tr>
                  <th class="bg-base-300 whitespace-normal w-14 p-3">Request No.</th>
                  <th class="bg-base-300 whitespace-normal w-40 p-3">Smart Seaman ID</th>
                  <th class="bg-base-300 whitespace-normal p-3">ชื่อ</th>
                  <th class="bg-base-300 whitespace-normal p-3">นามสกุล</th>
                  <th class="bg-base-300 whitespace-normal p-3">ตำแหน่ง</th>
                  <th class="bg-base-300 whitespace-normal p-3">เอกสาร</th>
                  <th class="bg-base-300 whitespace-normal p-3">สถานะ</th>
                  <th class="bg-base-300 whitespace-normal p-3">
                    {{ store.currentFilter === 'ยกเลิก' ? 'วันที่ยกเลิก' : 'วันที่ยื่น' }}
                  </th>
                  <th class="bg-base-300 whitespace-normal p-3">ยอดชำระ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!store.loading && paginatedRequests.length === 0" class="empty-result-row">
                  <td colspan="9">
                    <i class="light-icon-search" aria-hidden="true"></i>
                    <span>ไม่พบข้อมูล</span>
                  </td>
                </tr>
                <tr 
                  v-for="req in paginatedRequests" 
                  :key="req.no"
                  class="cursor-pointer"
                  @click="openDetail(req)"
                >
                  <td class="whitespace-normal w-14 p-3">{{ req.no }}</td>
                  <td class="whitespace-normal w-40 p-3">{{ req.ssid }}</td>
                  <td class="whitespace-normal p-3">{{ req.name }}</td>
                  <td class="whitespace-normal p-3">{{ req.lname }}</td>
                  <td class="whitespace-normal p-3">{{ req.pos }}</td>
                  <td class="whitespace-normal p-3">{{ req.doc }}</td>
                  <td class="whitespace-normal p-3">
                    <span class="status-badge" :style="{ color: statusColors[req.status] }">{{ req.status }}</span>
                    <span v-if="req.resubmit" class="resubmit-badge">ผู้ยื่น resubmit</span>
                  </td>
                  <td class="whitespace-normal p-3">
                    {{ store.currentFilter === 'ยกเลิก' ? (req.cancelledAt || '-') : req.date }}
                  </td>
                  <td class="whitespace-normal p-3">{{ req.amt }}</td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination -->
            <div class="pagination-section">
              <div class="pagination-info">แสดง {{ paginationInfo.from }}–{{ paginationInfo.to }} จากทั้งหมด {{ paginationInfo.total }} รายการ</div>
              <div class="pagination-controls">
                <button class="btn btn-ghost" :disabled="store.currentPage <= 1" @click="store.setPage(store.currentPage - 1)">
                  <i class="light-icon-chevron-left"></i> ก่อนหน้า
                </button>
                <div class="page-numbers">
                  <button 
                    v-for="p in totalPages" 
                    :key="p"
                    @click="store.setPage(p)"
                    :class="['page-btn', { 'active': p === store.currentPage }]"
                  >
                    {{ p }}
                  </button>
                </div>
                <button class="btn btn-ghost" :disabled="store.currentPage >= store.totalPages" @click="store.setPage(store.currentPage + 1)">
                  ถัดไป <i class="light-icon-chevron-right"></i>
                </button>
              </div>
              <div class="pagination-hint"><i class="light-icon-mouse"></i> คลิกที่แถวเพื่อดูรายละเอียด</div>
            </div>
          </div>
        </div>
    </div>

    <!-- DETAIL PAGE -->
    <div v-if="selectedRequest" class="page page-detail" :class="{ on: !!selectedRequest }">
        <button class="btn btn-ghost btn-back" @click="goBack">
          <i class="light-icon-arrow-left"></i> กลับรายการ
        </button>
        <Title title="จัดการคำขอต่อเอกสาร" />
        <div class="text-sm breadcrumbs">
          <ul>
            <li><router-link to="/">หน้าหลัก</router-link></li>
            <li><a href="#" @click.prevent="goBack">จัดการคำขอต่อเอกสาร</a></li>
            <li>รายละเอียดคำขอ</li>
          </ul>
        </div>

        <!-- Profile Card -->
        <ProfileCard :request="selectedRequest" />

        <!-- Stepper Card -->
        <StepperCard :request="selectedRequest" :status="selectedRequest.status" />

        <!-- Tabs Card -->
        <div class="card">
          <div class="tabs">
            <div 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="['tab', { 'on': activeTab === tab.id }]"
            >
              {{ tab.label }}
            </div>
          </div>

          <!-- Tab Contents -->
          <DocumentsTab v-if="activeTab === 'docs'" :request="selectedRequest" @cancel="showConfirmModal('cancel')" @send-back="showConfirmModal('sendback')" @submit="showConfirmModal('submit')" @documents-saved="handleDocumentsSaved" />
          <DeptTab v-if="activeTab === 'dept'" :request="selectedRequest" />
          <DeliveryTab v-if="activeTab === 'delivery'" :request="selectedRequest" />
        </div>
    </div>

    <!-- Modal -->
    <ModalDialog v-if="showModal" :config="modalConfig" @confirm="handleModalConfirm" @close="showModal = false" />

    <!-- Toast -->
  <div
  v-if="toast.visible"
  class="toast d-flex align-items-center"
  :class="toast.type"
>
  <i :class="toastIconClass"></i>
  <span class="ms-2">{{ toast.message }}</span>
</div>
  </div>
</template>

<script>
import ProfileCard from './DocumentRenewals/ProfileCard.vue'
import StepperCard from './DocumentRenewals/StepperCard.vue'
import DocumentsTab from './DocumentRenewals/DocumentsTab.vue'
import DeptTab from './DocumentRenewals/DeptTab.vue'
import DeliveryTab from './DocumentRenewals/DeliveryTab.vue'
import ModalDialog from './DocumentRenewals/ModalDialog.vue'
import Title from './partial/_title.vue'
import Breadcrumb from './partial/_breadcrumb.vue'
import { STATUS_COLORS } from '@/constants/documentRequests'
import { useDocumentRenewalsStore } from '@/stores'

export default {
  name: 'DocumentRenewals',
  components: {
    ProfileCard,
    StepperCard,
    DocumentsTab,
    DeptTab,
    DeliveryTab,
    ModalDialog,
    Title,
    Breadcrumb
  },
  setup() {
    const store = useDocumentRenewalsStore()
    store.fetchList()
    return { store }
  },
  data() {
    return {
      selectedRequest: null,
      activeTab: 'docs',
      statusColors: STATUS_COLORS,
      showModal: false,
      modalConfig: {},
      docResults: {},
      docSaved: false,
      toast: {
        visible: false,
        message: '',
        type: 'success'
      },
      toastTimer: null,
      tabs: [
        { id: 'docs', label: 'เอกสารประกอบ' },
        { id: 'dept', label: 'ผลจากกรมเจ้าท่า' },
        { id: 'delivery', label: 'การจัดส่ง' }
      ]
    }
  },
  computed: {
    filterStatuses() {
      const counts = this.store.statusCounts
      return [
        { value: 'all', label: 'ทั้งหมด', count: counts.all ?? 0 },
        { value: 'รอชำระเงิน', label: 'รอชำระเงิน', count: counts['รอชำระเงิน'] ?? 0 },
        { value: 'รอตรวจเอกสาร', label: 'รอตรวจเอกสาร', count: counts['รอตรวจเอกสาร'] ?? 0 },
        { value: 'รอผู้ยื่นแก้ไข', label: 'รอผู้ยื่นแก้ไข', count: counts['รอผู้ยื่นแก้ไข'] ?? 0 },
        { value: 'รอผลกรมเจ้าท่า', label: 'รอผลกรมเจ้าท่า', count: counts['รอผลกรมเจ้าท่า'] ?? 0 },
        { value: 'รอรับเอกสารจากกรม', label: 'รอรับเอกสารจากกรม', count: counts['รอรับเอกสารจากกรม'] ?? 0 },
        { value: 'กำลังจัดส่ง', label: 'กำลังจัดส่ง', count: counts['กำลังจัดส่ง'] ?? 0 },
        { value: 'จัดส่งสำเร็จ', label: 'จัดส่งสำเร็จ', count: counts['จัดส่งสำเร็จ'] ?? 0 },
        { value: 'ยกเลิก', label: 'ยกเลิก', count: counts['ยกเลิก'] ?? 0 }
      ]
    },
    paginatedRequests() {
      return this.store.requests
    },
    totalPages() {
      return this.store.totalPages
    },
    paginationInfo() {
      return this.store.paginationInfo
    },
    toastIconClass() {
      return this.toast.type === 'error' ? 'light-icon-alert-circle' : 'light-icon-circle-check'
    }
  },
  methods: {
    clearSearchFilter(filterName, event) {
      const input = event.currentTarget.closest('.search-input-wrap')?.querySelector('input')
      this.store.searchFilters[filterName] = ''
      this.store.search()
      this.$nextTick(() => {
        input?.focus()
      })
    },
    openDetail(req) {
      if (!req.no || req.no === '-') return
      const defaultDeptStatuses = ['รอผลกรมเจ้าท่า', 'รอรับเอกสารจากกรม']
      const defaultDeliveryStatuses = ['กำลังจัดส่ง', 'จัดส่งสำเร็จ']
      this.$router.push({
        name: 'document-renewals-detail',
        params: { requestNo: req.no },
        query: defaultDeliveryStatuses.includes(req.status)
          ? { tab: 'delivery' }
          : defaultDeptStatuses.includes(req.status)
            ? { tab: 'dept' }
            : {}
      })
    },
    goBack() {
      this.selectedRequest = null
      setTimeout(() => {
        this.$nextTick(() => {
          const wrapper = document.querySelector('.content-wrapper')
          if (wrapper) {
            wrapper.scrollTop = 0
          }
          window.scrollTo(0, 0)
        })
      }, 50)
    },
    showConfirmModal(action) {
      const config = {
        cancel: {
          icon: 'mi-danger',
          title: 'ยืนยันยกเลิกคำขอ',
          body: 'ระบบจะเปลี่ยนสถานะเป็น <span class="hl">"ยกเลิกคำขอ"</span>',
          isDanger: true
        },
        sendback: {
          icon: 'mi-warn',
          title: 'ยืนยันส่งกลับให้แก้ไข',
          body: 'ระบบจะเปลี่ยนสถานะเป็น <span class="hl">"รอผู้ยื่นแก้ไข"</span>'
        },
        submit: {
          icon: 'mi-warn',
          title: 'ยืนยันยื่นกรมเจ้าท่าแล้ว',
          body: 'ระบบจะเปลี่ยนสถานะเป็น <span class="hl">"รอผลกรมเจ้าท่า"</span>'
        }
      }
      this.modalConfig = { ...config[action], action }
      this.showModal = true
    },
    async handleModalConfirm(action) {
      const actionMap = {
        cancel:   { status: 'ยกเลิก',           resubmit: false,     toast: ['ยกเลิกคำขอเรียบร้อยแล้ว', 'error'] },
        sendback: { status: 'รอผู้ยื่นแก้ไข',   resubmit: false,     toast: ['ส่งกลับให้ผู้ยื่นแก้ไขแล้ว', 'warning'] },
        submit:   { status: 'รอผลกรมเจ้าท่า',  resubmit: undefined,  toast: ['บันทึกยื่นกรมเจ้าท่าแล้ว', 'success'] }
      }
      const cfg = actionMap[action]
      const requestNo = this.selectedRequest.no
      try {
        await this.store.updateStatus(requestNo, action)
        this.selectedRequest.status = cfg.status
        if (cfg.resubmit !== undefined) this.selectedRequest.resubmit = cfg.resubmit
        this.showToast(...cfg.toast)
        this.store.fetchList()
      } catch {
        this.showToast('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error')
      }
      this.showModal = false
    },
    async handleDocumentsSaved(results, complete) {
      if (!this.selectedRequest?.no) {
        complete(false)
        return
      }

      try {
        await this.store.saveInspectionResults(this.selectedRequest.no, results)
        this.selectedRequest.attachmentResults = { ...(this.selectedRequest.attachmentResults || {}), ...results }
        complete(true)
        this.showToast('บันทึกผลตรวจเรียบร้อยแล้ว', 'success')
        this.store.fetchList()
      } catch {
        complete(false)
        this.showToast('บันทึกผลตรวจไม่สำเร็จ กรุณาลองใหม่', 'error')
      }
    },
    showToast(message, type = 'success') {
      if (this.toastTimer) {
        clearTimeout(this.toastTimer)
      }

      this.toast.message = message
      this.toast.type = type
      this.toast.visible = true

      this.toastTimer = setTimeout(() => {
        this.toast.visible = false
      }, 2500)
    }
  },
  beforeUnmount() {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer)
    }
  }
}
</script>

<style scoped lang="scss">
.page-list {
  .card-body {
    min-width: 0;
  }

  .search-input-wrap {
    position: relative;

    .form-input {
      width: 100%;
      padding-right: 40px;
    }
  }

  .clear-input-button {
    position: absolute;
    top: 50%;
    right: 6px;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 0;
    border-radius: 4px;
    background: transparent;
    color: #6b7280;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transform: translateY(-50%);
    cursor: pointer;

    &:hover,
    &:focus-visible {
      background: #253244;
      color: #e2e8f0;
      outline: none;
    }

    i {
      font-size: 14px;
    }
  }

  .search-button {
    min-width: 126px;

    &:disabled {
      cursor: wait;
      opacity: 0.75;
    }
  }

  .search-spinner {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255, 255, 255, 0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: search-button-spin 0.7s linear infinite;
  }

  .filter-tabs {
    scrollbar-width: thin;
    scrollbar-color: #4b5563 transparent;
  }

  table {
    min-width: 980px;

    th,
    td {
      vertical-align: middle;
    }

    tbody tr {
      transition: background-color 0.2s;

      &:hover td {
        background: #1a2840;
      }
    }

    .empty-result-row {
      cursor: default;

      td {
        height: 140px;
        color: #6b7280;
        text-align: center;
      }

      i,
      span {
        display: block;
      }

      i {
        margin-bottom: 8px;
        color: #4b5563;
        font-size: 28px;
      }

      &:hover td {
        background: transparent;
      }
    }
  }
}

@keyframes search-button-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .page-list {
    .card-body {
      padding: 16px;
    }

    .filter-tabs {
      gap: 6px;
      margin-bottom: 12px;
    }

    .tab-btn {
      padding: 6px 10px;
      font-size: 12px;
    }

    table {
      min-width: 860px;
      font-size: 12px;

      th,
      td {
        padding: 10px 8px;
      }
    }

    .pagination-section {
      align-items: flex-start;
      gap: 12px;
    }

    .pagination-controls {
      width: 100%;
      justify-content: space-between;
      gap: 8px;
    }

    .page-numbers {
      overflow-x: auto;
      max-width: 100%;
      padding-bottom: 4px;
    }

    .pagination-hint {
      display: none;
    }
  }
}

@media (max-width: 480px) {
  .page-list {
    .card-body {
      padding: 14px;
    }

    .pagination-controls {
      flex-wrap: wrap;
    }

    .page-numbers {
      order: 3;
      width: 100%;
    }
  }
}
</style>
