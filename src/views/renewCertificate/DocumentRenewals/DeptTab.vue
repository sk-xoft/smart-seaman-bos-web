<template>
  <div class="tab-content">
    <div v-if="!showDeptContent" class="empty-state">
      <i class="light-icon-clock"></i>
      <span>ยังไม่มีข้อมูลผลจากกรมเจ้าท่า</span>
    </div>

    <div v-else class="dept-content">
      <!-- Phase 1: รอผลกรมเจ้าท่า -->
      <div v-if="request.status === 'รอผลกรมเจ้าท่า'" class="phase-container">
        <div class="panel-layout">
          <div class="left-panel">
            <div class="panel-title">ข้อมูลการยื่นกรมเจ้าท่า</div>
            <div class="info-rows">
              <div class="info-row">
                <span class="info-label">วันที่ยื่น</span>
                <span class="info-value">{{ deptSubmission.submittedAt }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">ผู้ดำเนินการ</span>
                <span class="info-value">{{ deptSubmission.operatorName }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">เบอร์ติดต่อผู้ดำเนินการ</span>
                <span class="info-value">{{ deptSubmission.operatorPhone }}</span>
              </div>
            </div>
          </div>

          <div class="right-panel">
            <div class="panel-title">บันทึกผลจากกรม</div>
            <div class="form-group">
              <label class="form-label">วันที่สามารถรับเอกสารได้ตั้งแต่ <span class="required">*</span></label>
              <VueDatePicker v-model="availablePickupDate" v-bind="dateTimePickerProps" :format="formatThaiDateTime">
                <template #input-icon>
                  <i class="light-icon-calendar" aria-hidden="true"></i>
                </template>
              </VueDatePicker>
            </div>
            <button class="btn btn-primary" @click="saveDeptResult">
              <i class="ti ti-device-floppy"></i> บันทึกผลจากกรม
            </button>
          </div>
        </div>

        <div class="divider"></div>

        <div>
          <div class="panel-title">รายการเอกสารประกอบ <span class="subtitle">(แก้ไขได้หากกรมแจ้งให้ปรับ)</span></div>
          <DocumentTable
            :documents="documents"
            :requestNo="request.no"
            editable
            uploadable
            :initialResults="docResults"
            @save="saveDocuments"
            @changed="onDocumentsChanged"
            @upload-file="$emit('upload-file', $event)"
          />
          <ActionButtons
            :docsSaved="docsSaved"
            :allAnswered="allAnswered"
            :allPass="allPass"
            :hasFix="hasFix"
            :showSubmit="false"
            @cancel="requestAction('cancel')"
            @send-back="requestAction('sendback')"
          />
        </div>
      </div>

      <!-- Phase 2 & 3: รอรับเอกสารจากกรม -->
      <div v-else-if="['รอรับเอกสารจากกรม', 'กำลังจัดส่ง', 'จัดส่งสำเร็จ'].includes(request.status)" class="phase-container">
        <div class="panel-layout">
          <div class="left-panel">
            <div class="panel-title">ข้อมูลจากกรมเจ้าท่า</div>
            <div class="info-rows">
              <div class="info-row">
                <span class="info-label">วันที่ยื่น</span>
                <span class="info-value">{{ deptSubmission.submittedAt }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">ผู้ดำเนินการ</span>
                <span class="info-value">{{ deptSubmission.operatorName }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">เบอร์ติดต่อผู้ดำเนินการ</span>
                <span class="info-value">{{ deptSubmission.operatorPhone }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">วันที่รับเอกสารได้ตั้งแต่</span>
                <span class="info-value">{{ deptResult.availablePickupDate }}</span>
              </div>
              <div class="info-row" v-if="request.status !== 'รอรับเอกสารจากกรม'">
                <span class="info-label">วันที่รับเอกสารจริง</span>
                <span class="info-value">{{ deptResult.receivedDate }}</span>
              </div>
            </div>
          </div>

          <div class="right-panel">
            <div v-if="request.status === 'รอรับเอกสารจากกรม'">
              <div class="panel-title">บันทึกรับเอกสารจากกรม</div>
              
              <div class="form-group">
                <label class="form-label">วันที่สามารถรับเอกสารได้ตั้งแต่ <span class="subtitle">(แก้ไขได้)</span></label>
                <div class="form-action-row pickup-date-actions">
                  <VueDatePicker v-model="availablePickupDate" v-bind="dateTimePickerProps" :format="formatThaiDateTime">
                    <template #input-icon>
                      <i class="light-icon-calendar" aria-hidden="true"></i>
                    </template>
                  </VueDatePicker>
                  <button class="btn btn-ghost" @click="savePickupDateChange">
                    <i class="ti ti-device-floppy"></i> บันทึกการเปลี่ยนแปลง
                  </button>
                </div>
              </div>

              <div style="border-top: 1px solid #1e293b; padding-top: 14px">
                <div class="form-group">
                  <label class="form-label">วันที่รับเอกสาร <span class="required">*</span></label>
                  <div class="form-action-row pickup-date-actions">
                    <VueDatePicker v-model="receivedDate" v-bind="dateTimePickerProps" :format="formatThaiDateTime">
                      <template #input-icon>
                        <i class="light-icon-calendar" aria-hidden="true"></i>
                      </template>
                    </VueDatePicker>
                    <button class="btn btn-primary" @click="saveReceiveDoc">
                      <i class="ti ti-check"></i> บันทึกรับเอกสาร
                    </button>
                  </div>
                </div>
              </div>

              <div style="border-top: 1px solid #1e293b; padding-top: 14px; margin-top: 14px">
                <div class="panel-title">บันทึกข้อมูลการจัดส่ง</div>
                <p class="form-hint">กรุณากรอกข้อมูลหลังจากส่งไปรษณีย์แล้ว</p>

                <div class="form-group">
                  <label class="form-label">Tracking No. <span class="required">*</span></label>
                  <input v-model="trackingNo" type="text" class="form-input" placeholder="เช่น EF123456789TH">
                </div>

                <div class="form-action-row delivery-actions">
                  <div class="delivery-date-field">
                    <label class="form-label">วันที่จัดส่ง <span class="required">*</span></label>
                    <VueDatePicker v-model="shippedDate" v-bind="dateTimePickerProps" :format="formatThaiDateTime">
                      <template #input-icon>
                        <i class="light-icon-calendar" aria-hidden="true"></i>
                      </template>
                    </VueDatePicker>
                  </div>
                  <button class="btn btn-primary" @click="saveDeliveryInfo">
                    <i class="ti ti-send"></i> บันทึกข้อมูลจัดส่ง
                  </button>
                </div>
              </div>
            </div>

            <div v-else>
              <div class="panel-title">ข้อมูลการจัดส่ง</div>
              <div class="info-grid">
                <div>
                  <div class="info-label">Tracking No.</div>
                  <div class="info-value">{{ deliveryInfo.trackingNo }}</div>
                </div>
                <div>
                  <div class="info-label">วันที่จัดส่ง</div>
                  <div class="info-value">{{ deliveryInfo.shippedDate }}</div>
                </div>
                <div>
                  <div class="info-label">วันที่/เวลาบันทึก</div>
                  <div class="info-value">{{ deliveryInfo.recordedAt }}</div>
                </div>
                <div>
                  <div class="info-label">ผู้ดำเนินการ</div>
                  <div class="info-value">{{ deliveryInfo.operatorName }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <template v-if="['รอรับเอกสารจากกรม', 'กำลังจัดส่ง', 'จัดส่งสำเร็จ'].includes(request.status)">
          <div class="divider"></div>

          <div class="view-only-documents">
            <div class="panel-title">
              รายการเอกสารประกอบ
              <span class="subtitle"><i class="light-icon-lock"></i> view only</span>
            </div>
            <div class="view-only-label">
              <i class="light-icon-lock"></i>
              <span>ผ่านการตรวจแล้ว — view only</span>
            </div>
            <DocumentTable
              :documents="documents"
              :requestNo="request.no"
              :initialResults="docResults"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import DocumentTable from './DocumentTable.vue'
import ActionButtons from './ActionButtons.vue'

export default {
  name: 'DeptTab',
  components: { DocumentTable, ActionButtons },
  props: {
    request: {
      type: Object,
      required: true
    }
  },
  emits: ['save-dept-result', 'save-pickup-change', 'save-receive-doc', 'save-delivery-info', 'documents-saved', 'upload-file', 'request-action'],
  data() {
    return {
      availablePickupDate: '',
      receivedDate: '',
      trackingNo: '',
      shippedDate: '',
      docResults: {},
      docsSaved: false
    }
  },
  computed: {
    dateTimePickerProps() {
      return {
        locale: 'th',
        dark: true,
        clearable: false,
        enableTimePicker: true,
        showNowButton: true,
        nowButtonLabel: 'ตอนนี้',
        selectText: 'เลือก',
        cancelText: 'ยกเลิก'
      }
    },
    showDeptContent() {
      const supportedStatuses = ['รอผลกรมเจ้าท่า', 'รอรับเอกสารจากกรม', 'กำลังจัดส่ง', 'จัดส่งสำเร็จ']
      const supportedStatusCodes = [
        'PENDING_MARINE_DEPARTMENT_RESULT',
        'PENDING_DEPARTMENT_RESULT',
        'PENDING_DEPARTMENT_DOCUMENT_PICKUP',
        'PENDING_DEPARTMENT_PICKUP',
        'DELIVERING',
        'DELIVERED'
      ]
      const statusCode = this.request?.stepper?.statusCode?.toUpperCase()

      return (supportedStatuses.includes(this.request.status) || supportedStatusCodes.includes(statusCode))
        && Boolean(this.request.deptSubmission || this.request.deptResult)
    },
    documents() {
      return Array.isArray(this.request.documents) ? this.request.documents : []
    },
    allAnswered() {
      return this.documents.every(doc => this.docResults[doc.id]?.result)
    },
    allPass() {
      return this.documents.every(doc => this.docResults[doc.id]?.result === 'pass')
    },
    hasFix() {
      return this.documents.some(doc => this.docResults[doc.id]?.result === 'fix')
    },
    deptSubmission() {
      return this.request.deptSubmission ?? {
        submittedAt: '-',
        operatorName: '-',
        operatorPhone: '-',
      }
    },
    deptResult() {
      return this.request.deptResult ?? {
        availablePickupDate: '-',
        availablePickupDateValue: '',
        receivedDate: '-',
        receivedDateValue: '',
      }
    },
    deliveryInfo() {
      return this.request.deliveryInfo ?? {
        trackingNo: '-',
        shippedDate: '-',
        shippedDateValue: '',
        recordedAt: '-',
        operatorName: '-',
      }
    }
  },
  watch: {
    request: {
      immediate: true,
      deep: true,
      handler() {
        this.initializeDocResults()
        this.availablePickupDate = this.toPickerDate(this.request?.deptResult?.availablePickupDateValue)
        this.receivedDate = this.toPickerDate(this.request?.deptResult?.receivedDateValue)
        this.trackingNo = this.request?.deliveryInfo?.trackingNo && this.request?.deliveryInfo?.trackingNo !== '-'
          ? this.request.deliveryInfo.trackingNo
          : ''
        this.shippedDate = this.toPickerDate(this.request?.deliveryInfo?.shippedDateValue)
      }
    }
  },
  methods: {
    toPickerDate(value) {
      if (!value) return null
      if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

      const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/)
      if (!match) return null

      const [, year, month, day, hours = '00', minutes = '00', seconds = '00'] = match
      return new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds))
    },
    formatThaiDateTime(value) {
      if (!(value instanceof Date) || Number.isNaN(value.getTime())) return ''

      return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
      }).format(value)
    },
    formatApiDateTime(value) {
      if (!(value instanceof Date) || Number.isNaN(value.getTime())) return ''
      const pad = number => String(number).padStart(2, '0')

      return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
    },
    requestAction(action) {
      this.$emit('request-action', action)
    },
    initializeDocResults() {
      this.docResults = Object.fromEntries(this.documents.map(doc => [
        doc.id,
        { ...(this.request.attachmentResults?.[doc.id] ?? { result: '', note: '' }) }
      ]))
      this.docsSaved = this.documents.length > 0 && this.documents.every(doc => {
        const inspection = this.docResults[doc.id]
        return inspection.result === 'pass'
          || (inspection.result === 'fix' && inspection.note.trim() !== '')
      })
    },
    onDocumentsChanged(results) {
      this.docResults = results
      this.docsSaved = false
    },
    saveDocuments(results, complete) {
      this.docResults = results
      this.docsSaved = false
      this.$emit('documents-saved', results, (saved) => {
        this.docsSaved = saved
        complete(saved)
      })
    },
    saveDeptResult() {
      if (!this.availablePickupDate) {
        return
      }

      this.$emit('save-dept-result', {
        availablePickupDate: this.formatApiDateTime(this.availablePickupDate)
      })
    },
    savePickupDateChange() {
      if (!this.availablePickupDate) {
        return
      }

      this.$emit('save-pickup-change', {
        availablePickupDate: this.formatApiDateTime(this.availablePickupDate)
      })
    },
    saveReceiveDoc() {
      if (!this.receivedDate) {
        return
      }

      this.$emit('save-receive-doc', {
        receivedDate: this.formatApiDateTime(this.receivedDate)
      })
    },
    saveDeliveryInfo() {
      if (!this.trackingNo || !this.shippedDate) {
        return
      }

      this.$emit('save-delivery-info', {
        trackingNo: this.trackingNo,
        shippedDate: this.formatApiDateTime(this.shippedDate)
      })
    }
  }
}
</script>

<style scoped lang="scss">
.tab-content {
  padding: 16px 0;
}

.empty-state {
  color: #9ca3af;
  font-size: 13px;
  text-align: center;
  padding: 40px 0;

  i {
    font-size: 32px;
    display: block;
    margin-bottom: 8px;
    color: #374151;
  }
}

.dept-content {
  .phase-container {
    .panel-layout {
      display: flex;
      gap: 24px;
      align-items: flex-start;

      .left-panel {
        flex: 0 0 44%;
        padding-right: 24px;
        border-right: 1px solid #1e293b;
      }

      .right-panel {
        flex: 1;
        padding-left: 24px;
      }
    }

    .panel-title {
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 14px;

      .subtitle {
        font-size: 11px;
        color: #6b7280;
        font-weight: 400;
      }
    }

    .info-rows {
      .info-row {
        display: flex;
        padding: 8px 0;
        border-bottom: 1px solid #1e293b;
        align-items: flex-start;

        &:last-child {
          border-bottom: none;
        }
      }

      .info-label {
        width: 160px;
        flex-shrink: 0;
        color: #9ca3af;
        font-size: 13px;
      }

      .info-value {
        color: #e2e8f0;
        font-size: 13px;
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 24px;

      & > div {
        .info-label {
          font-size: 11px;
          color: #9ca3af;
          margin-bottom: 3px;
        }

        .info-value {
          color: #fff;
          font-size: 13px;
          font-weight: 600;
        }
      }
    }

    .form-group {
      margin-bottom: 14px;
    }

    .form-label {
      font-size: 12px;
      color: #9ca3af;
      margin-bottom: 6px;
      display: block;

      .required {
        color: #ef4444;
      }
    }

    .form-hint {
      font-size: 12px;
      color: #9ca3af;
      margin-bottom: 12px;
    }

    :deep(.dp__main) {
      flex: 1;
      min-width: 0;
    }

    :deep(.dp__input) {
      height: 40px;
      border-color: #2a3a4a;
      background: #0d1520;
      color: #e2e8f0;
      font-family: 'Prompt', sans-serif;
      font-size: 13px;
      padding-left: 12px;
      padding-right: 48px;
    }

    :deep(.dp__input_icon) {
      left: auto;
      right: 0;
      width: 40px;
      height: 38px;
      padding: 0;
      border-left: 1px solid #2a3a4a;
      color: #9ca3af;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .form-input {
      background: #0d1520;
      border: 1px solid #2a3a4a;
      border-radius: 5px;
      padding: 7px 10px;
      color: #e2e8f0;
      font-size: 13px;
      
      outline: none;
      width: 100%;
      height: 40px;

      &::placeholder {
        color: #374151;
      }

      &:focus {
        border-color: #f97316;
      }
    }
  }

  .divider {
    margin: 16px 0;
    // border-top: 1px solid #1e293b;
  }

  .view-only-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    color: #6b7280;
    font-size: 12px;

    i {
      font-size: 14px;
    }
  }

  .form-action-row {
    display: flex;
    align-items: flex-end;
    gap: 12px;
  }

  .pickup-date-actions {
    align-items: center;
  }

  .delivery-date-field {
    flex: 1;
    min-width: 0;
  }
}

.btn {
  border-radius: 6px;
  padding: 0 20px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 40px;
  
  white-space: nowrap;
  border: none;
  transition: all 0.2s;

  &.btn-primary {
    background: #f97316;

    &:hover {
      background: #ea580c;
    }

    i {
      font-size: 15px;
    }
  }

  &.btn-ghost {
    background: transparent;
    border: 1px solid #4b5563;
    color: #9ca3af;

    &:hover {
      border-color: #f97316;
      color: #f97316;
    }

    i {
      font-size: 14px;
    }
  }
}

@media (max-width: 1024px) {
  .dept-content {
    .phase-container .panel-layout {
      flex-direction: column;
      gap: 24px;

      .left-panel,
      .right-panel {
        width: 100%;
        padding: 0;
      }

      .left-panel {
        flex: none;
        padding-bottom: 24px;
        border-right: none;
        border-bottom: 1px solid #1e293b;
      }
    }
  }
}

@media (max-width: 768px) {
  .tab-content {
    padding: 12px 0;
  }

  .empty-state {
    padding: 32px 16px;
  }

  .dept-content {
    .phase-container {
      .panel-layout {
        gap: 20px;

        .left-panel {
          padding-bottom: 20px;
        }
      }

      .info-rows {
        .info-row {
          gap: 12px;
          padding: 9px 0;
        }

        .info-label {
          width: 140px;
          font-size: 12px;
        }

        .info-value {
          flex: 1;
          min-width: 0;
          font-size: 12px;
          text-align: right;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
      }

      .info-grid {
        gap: 12px;

        .info-value {
          overflow-wrap: anywhere;
          word-break: break-word;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .dept-content {
    .phase-container {
      .info-rows {
        .info-row {
          flex-direction: column;
          gap: 3px;
        }

        .info-label {
          width: auto;
        }

        .info-value {
          width: 100%;
          text-align: left;
        }
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .form-action-row {
        flex-direction: column;
        align-items: stretch;

        .btn,
        .date-input {
          width: 100%;
        }

        .btn {
          justify-content: center;
        }
      }

      .pickup-date-actions {
        align-items: stretch;
      }
    }
  }
}
</style>
