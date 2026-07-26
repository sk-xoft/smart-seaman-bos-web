<template>
  <div class="document-requests-page">
    <div class="page page-detail on">
      <button class="btn btn-ghost btn-back" @click="goBack">
        <i class="light-icon-arrow-left"></i> กลับรายการ
      </button>
      <Title title="จัดการคำขอต่อเอกสาร" />
      <div class="text-sm breadcrumbs">
        <ul>
          <li><router-link to="/">หน้าหลัก</router-link></li>
          <li><router-link to="/document-renewals">จัดการคำขอต่อเอกสาร</router-link></li>
          <li>รายละเอียดคำขอ</li>
        </ul>
      </div>

      <div v-if="selectedRequest">
        <ProfileCard :request="selectedRequest" />
        <StepperCard :request="selectedRequest" :status="selectedRequest.status" />

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

          <DocumentsTab
            v-if="activeTab === 'docs'"
            :request="selectedRequest"
            @cancel="showConfirmModal('cancel')"
            @send-back="showConfirmModal('sendback')"
            @submit="showConfirmModal('submit')"
            @documents-saved="handleDocumentsSaved"
            @upload-file="handleAttachmentUpload"
          />
          <DeptTab
            v-if="activeTab === 'dept'"
            :request="selectedRequest"
            @save-dept-result="handleDeptResultSaved"
            @save-pickup-change="handlePickupDateChanged"
            @save-receive-doc="handleReceiveDocSaved"
            @save-delivery-info="handleDeliveryInfoSaved"
          />
          <DeliveryTab v-if="activeTab === 'delivery'" :request="selectedRequest" />
        </div>
      </div>

      <div v-else class="card bg-base-200 p-6 mt-6 text-center">
        <p>ไม่พบข้อมูลคำขอที่เลือก</p>
      </div>
    </div>

    <ModalDialog v-if="showModal" :config="modalConfig" @confirm="handleModalConfirm" @close="showModal = false" />

    <div v-if="toast.visible" class="toast d-flex align-items-center" :class="toast.type">
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
import { useDocumentRenewalsStore } from '@/stores'

export default {
  name: 'DocumentRenewalsDetail',
  components: {
    ProfileCard,
    StepperCard,
    DocumentsTab,
    DeptTab,
    DeliveryTab,
    ModalDialog,
    Title
  },
  data() {
    return {
      store: null,
      activeTab: 'docs',
      showModal: false,
      modalConfig: {},
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
    selectedRequest() {
      if (!this.store) return null
      return this.store.detailRequest
    },
    toastIconClass() {
      return this.toast.type === 'error' ? 'light-icon-alert-circle' : 'light-icon-circle-check'
    }
  },
  async created() {
    this.store = useDocumentRenewalsStore()
    await this.loadDetail()
  },
  watch: {
    '$route.params.requestNo': {
      immediate: false,
      async handler() {
        await this.loadDetail()
      }
    },
    '$route.query.tab': {
      immediate: true,
      handler() {
        this.applyDefaultTab()
      }
    }
  },
  methods: {
    async loadDetail() {
      const requestNo = this.$route.params.requestNo
      await this.store.fetchDetail(requestNo)
      this.applyDefaultTab()
    },
    applyDefaultTab() {
      const requestedTab = this.$route.query.tab
      if (requestedTab === 'docs' || requestedTab === 'dept' || requestedTab === 'delivery') {
        this.activeTab = requestedTab
        return
      }

      const stepperStep = this.selectedRequest?.stepper?.currentStep
      if (stepperStep === 4 || stepperStep === 5) {
        this.activeTab = 'delivery'
        return
      }

      if (['รอผลกรมเจ้าท่า', 'รอรับเอกสารจากกรม'].includes(this.selectedRequest?.status)) {
        this.activeTab = 'dept'
        return
      }

      if (['กำลังจัดส่ง', 'จัดส่งสำเร็จ'].includes(this.selectedRequest?.status)) {
        this.activeTab = 'delivery'
        return
      }

      this.activeTab = 'docs'
    },
    goBack() {
      this.$router.push('/document-renewals')
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
      if (!this.selectedRequest) return

      const actionMap = {
        cancel: { status: 'ยกเลิก', resubmit: false, toast: ['ยกเลิกคำขอเรียบร้อยแล้ว', 'error'] },
        sendback: { status: 'รอผู้ยื่นแก้ไข', resubmit: false, toast: ['ส่งกลับให้ผู้ยื่นแก้ไขแล้ว', 'warning'] },
        submit: { status: 'รอผลกรมเจ้าท่า', resubmit: undefined, toast: ['บันทึกยื่นกรมเจ้าท่าแล้ว', 'success'] }
      }
      const cfg = actionMap[action]
      const requestNo = this.selectedRequest.no
      try {
        await this.store.updateStatus(requestNo, action)
        this.selectedRequest.status = cfg.status
        if (cfg.resubmit !== undefined) this.selectedRequest.resubmit = cfg.resubmit
        this.showToast(...cfg.toast)
        this.store.fetchList()
        this.loadDetail()
      } catch {
        this.showToast('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error')
      }
      this.showModal = false
    },
    async handleDocumentsSaved(results) {
      if (!this.selectedRequest?.no) return

      await this.store.saveInspectionResults(this.selectedRequest.no, results)
      await this.loadDetail()
      this.showToast('บันทึกผลตรวจเรียบร้อยแล้ว', 'success')
    },
    async handleDeptResultSaved(payload) {
      if (!this.selectedRequest?.no) return

      try {
        await this.store.saveDeptResult(this.selectedRequest.no, payload.availablePickupDate)
        await this.store.fetchList()
        await this.loadDetail()
        this.showToast('บันทึกผลจากกรมเรียบร้อยแล้ว', 'success')
      } catch {
        this.showToast('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error')
      }
    },
    async handlePickupDateChanged(payload) {
      if (!this.selectedRequest?.no) return

      try {
        await this.store.savePickupAction(this.selectedRequest.no, {
          action: 'update_pickup_date',
          availablePickupDate: payload.availablePickupDate,
        })
        await this.store.fetchList()
        await this.loadDetail()
        this.showToast('บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว', 'success')
      } catch {
        this.showToast('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error')
      }
    },
    async handleReceiveDocSaved(payload) {
      if (!this.selectedRequest?.no) return

      try {
        await this.store.savePickupAction(this.selectedRequest.no, {
          action: 'receive_doc',
          receivedDate: payload.receivedDate,
        })
        await this.store.fetchList()
        await this.loadDetail()
        this.showToast('บันทึกรับเอกสารเรียบร้อยแล้ว', 'success')
      } catch {
        this.showToast('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error')
      }
    },
    async handleDeliveryInfoSaved(payload) {
      if (!this.selectedRequest?.no) return

      try {
        await this.store.savePickupAction(this.selectedRequest.no, {
          action: 'save_delivery_info',
          trackingNo: payload.trackingNo,
          shippedDate: payload.shippedDate,
        })
        await this.store.fetchList()
        await this.loadDetail()
        this.showToast('บันทึกข้อมูลจัดส่งเรียบร้อยแล้ว', 'success')
      } catch {
        this.showToast('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error')
      }
    },
    async handleAttachmentUpload(payload) {
      if (!this.selectedRequest?.no || !payload?.sortOrder || !payload?.file) return

      try {
        await this.store.uploadRequestAttachment(this.selectedRequest.no, payload.sortOrder, payload.file)
        await this.loadDetail()
        this.showToast('อัปโหลดไฟล์เอกสารเรียบร้อยแล้ว', 'success')
      } catch {
        this.showToast('อัปโหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่', 'error')
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
</style>
