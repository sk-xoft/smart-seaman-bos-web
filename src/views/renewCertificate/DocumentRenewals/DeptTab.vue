<template>
  <div class="tab-content">
    <div v-if="request.status === 'รอตรวจเอกสาร'" class="empty-state">
      <i class="ti ti-clock"></i>
      <span>ยังไม่มีข้อมูลผลจากกรมเจ้าท่า</span>
    </div>

    <div v-else-if="request.status === 'รอผู้ยื่นแก้ไข'" class="empty-state">
      <i class="ti ti-clock"></i>
      <span>ยังไม่มีข้อมูล</span>
    </div>

    <div v-else class="dept-content">
      <!-- Phase 1: รอผลกรมเจ้าท่า -->
      <div v-if="request.status === 'รอผลกรมเจ้าท่า'" class="phase-container">
        <div class="panel-layout">
          <div class="left-panel">
            <div class="panel-title">ข้อมูลการยื่นกรมเจ้าท่า</div>
            <div class="info-rows">
              <div class="info-row">
                <span class="info-label">วันที่ยื่น Google Form</span>
                <span class="info-value">03/05/2026 09:30:00</span>
              </div>
              <div class="info-row">
                <span class="info-label">ผู้ดำเนินการ</span>
                <span class="info-value">superadmin02</span>
              </div>
              <div class="info-row">
                <span class="info-label">เบอร์ติดต่อผู้ดำเนินการ</span>
                <span class="info-value">081-234-5678</span>
              </div>
            </div>
          </div>

          <div class="right-panel">
            <div class="panel-title">บันทึกผลจากกรม</div>
            <div class="form-group">
              <label class="form-label">วันที่สามารถรับเอกสารได้ตั้งแต่ <span class="required">*</span></label>
              <div class="date-wrapper">
                <input type="date" class="date-input">
              </div>
            </div>
            <button class="btn btn-primary" @click="saveDeptResult">
              <i class="ti ti-device-floppy"></i> บันทึกผลจากกรม
            </button>
          </div>
        </div>

        <div class="divider"></div>

        <div>
          <div class="panel-title">รายการเอกสารประกอบ <span class="subtitle">(แก้ไขได้หากกรมแจ้งให้ปรับ)</span></div>
          <!-- DocumentTable here -->
        </div>
      </div>

      <!-- Phase 2 & 3: รอรับเอกสารจากกรม -->
      <div v-else-if="['รอรับเอกสารจากกรม', 'กำลังจัดส่ง', 'จัดส่งสำเร็จ'].includes(request.status)" class="phase-container">
        <div class="panel-layout">
          <div class="left-panel">
            <div class="panel-title">ข้อมูลจากกรมเจ้าท่า</div>
            <div class="info-rows">
              <div class="info-row">
                <span class="info-label">วันที่ยื่น Google Form</span>
                <span class="info-value">03/05/2026 09:30:00</span>
              </div>
              <div class="info-row">
                <span class="info-label">ผู้ดำเนินการ</span>
                <span class="info-value">superadmin02</span>
              </div>
              <div class="info-row">
                <span class="info-label">เบอร์ติดต่อผู้ดำเนินการ</span>
                <span class="info-value">081-234-5678</span>
              </div>
              <div class="info-row">
                <span class="info-label">วันที่รับเอกสารได้ตั้งแต่</span>
                <span class="info-value">10/05/2026</span>
              </div>
              <div class="info-row" v-if="request.status !== 'รอรับเอกสารจากกรม'">
                <span class="info-label">วันที่รับเอกสารจริง</span>
                <span class="info-value">11/05/2026</span>
              </div>
            </div>
          </div>

          <div class="right-panel">
            <div v-if="request.status === 'รอรับเอกสารจากกรม'">
              <div class="panel-title">บันทึกรับเอกสารจากกรม</div>
              
              <div class="form-group">
                <label class="form-label">วันที่สามารถรับเอกสารได้ตั้งแต่ <span class="subtitle">(แก้ไขได้)</span></label>
                <div style="display: flex; gap: 10px; align-items: center">
                  <input type="date" class="date-input" value="10/05/2026">
                  <button class="btn btn-ghost">
                    <i class="ti ti-device-floppy"></i> บันทึกการเปลี่ยนแปลง
                  </button>
                </div>
              </div>

              <div style="border-top: 1px solid #1e293b; padding-top: 14px">
                <div class="form-group">
                  <label class="form-label">วันที่รับเอกสาร <span class="required">*</span></label>
                  <input type="date" class="date-input">
                </div>
                <button class="btn btn-primary" @click="saveReceiveDoc">
                  <i class="ti ti-check"></i> บันทึกรับเอกสาร
                </button>
              </div>

              <div style="border-top: 1px solid #1e293b; padding-top: 14px; margin-top: 14px">
                <div class="panel-title">บันทึกข้อมูลการจัดส่ง</div>
                <p class="form-hint">กรุณากรอกข้อมูลหลังจากส่งไปรษณีย์แล้ว</p>

                <div class="form-group">
                  <label class="form-label">Tracking No. <span class="required">*</span></label>
                  <input type="text" class="form-input" placeholder="เช่น EF123456789TH">
                </div>

                <div style="display: flex; align-items: flex-end; gap: 12px">
                  <div style="flex: 1">
                    <label class="form-label">วันที่จัดส่ง <span class="required">*</span></label>
                    <input type="date" class="date-input">
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
                  <div class="info-value">EF123456789TH</div>
                </div>
                <div>
                  <div class="info-label">วันที่จัดส่ง</div>
                  <div class="info-value">12/05/2026</div>
                </div>
                <div>
                  <div class="info-label">วันที่/เวลาบันทึก</div>
                  <div class="info-value">12/05/2026 15:00:00</div>
                </div>
                <div>
                  <div class="info-label">ผู้ดำเนินการ</div>
                  <div class="info-value">superadmin02</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeptTab',
  props: {
    request: {
      type: Object,
      required: true
    }
  },
  methods: {
    saveDeptResult() {
      console.log('Saving dept result')
    },
    saveReceiveDoc() {
      console.log('Saving receive doc')
    },
    saveDeliveryInfo() {
      console.log('Saving delivery info')
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

    .date-wrapper {
      background: #0d1520;
      border: 1px solid #2a3a4a;
      border-radius: 5px;
      padding: 0 10px;
      height: 40px;
      display: flex;
      align-items: center;
    }

    .date-input {
      background: transparent;
      border: none;
      color: #e2e8f0;
      font-size: 13px;
      width: 100%;
      
      outline: none;

      &::placeholder {
        color: #374151;
      }
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
    border-top: 1px solid #1e293b;
    padding-top: 16px;
    margin-top: 16px;
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
</style>
