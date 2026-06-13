<template>
  <div class="tab-content">
    <div v-if="['รอตรวจเอกสาร', 'รอผู้ยื่นแก้ไข', 'รอผลกรมเจ้าท่า', 'รอรับเอกสารจากกรม'].includes(request.status)" class="empty-state">
      <i class="ti ti-truck-delivery"></i>
      <span>ยังไม่มีข้อมูลการจัดส่ง</span>
    </div>

    <div v-else class="delivery-content">
      <div class="panel-layout">
        <div class="left-panel">
          <div class="panel-title">ข้อมูลการจัดส่ง</div>
          <div class="info-rows">
            <div class="info-row">
              <span class="info-label">Tracking No.</span>
              <span class="info-value tracking">
                EF123456789TH
                <button class="btn-copy" @click="copyTracking">
                  <i class="light-icon-copy"></i> คัดลอก
                </button>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">วันที่จัดส่ง</span>
              <span class="info-value">12/05/2026</span>
            </div>
            <div class="info-row">
              <span class="info-label">วันที่/เวลาบันทึก</span>
              <span class="info-value">12/05/2026 15:00:00</span>
            </div>
            <div class="info-row">
              <span class="info-label">ผู้ดำเนินการ</span>
              <span class="info-value">superadmin02</span>
            </div>
          </div>
        </div>

        <div class="right-panel">
          <div class="panel-title">สถานะการจัดส่ง</div>
          <p class="api-hint">
            <i class="ti ti-info-circle"></i> ข้อมูลจาก API ไปรษณีย์ไทย
          </p>

          <div class="tracking-timeline">
            <div v-for="(track, idx) in deliveryTracks" :key="idx" class="track-item">
              <div class="track-dot-col">
                <div class="track-dot" :class="{ 'td-cur': track.cur, 'td-done': !track.cur }"></div>
                <div v-if="idx < deliveryTracks.length - 1" class="track-line"></div>
              </div>
              <div class="track-time">{{ track.time }}</div>
              <div class="track-info">
                <div class="track-status" :class="{ 'ts-cur': track.cur, 'ts-done': !track.cur }">
                  {{ track.status }}
                </div>
                <div class="track-loc">{{ track.loc }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { DELIVERY_TRACKS_SENDING, DELIVERY_TRACKS_DELIVERED } from '@/constants/documentRequests'

export default {
  name: 'DeliveryTab',
  props: {
    request: {
      type: Object,
      required: true
    }
  },
  computed: {
    deliveryTracks() {
      return this.request.status === 'จัดส่งสำเร็จ' 
        ? DELIVERY_TRACKS_DELIVERED 
        : DELIVERY_TRACKS_SENDING
    }
  },
  methods: {
    copyTracking() {
      const text = 'EF123456789TH'
      navigator.clipboard.writeText(text).then(() => {
        // Show toast
        console.log('Copied to clipboard')
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

.delivery-content {
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
      display: flex;
      align-items: center;
      gap: 8px;

      &.tracking {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: #fff;
        font-family: monospace;
      }
    }
  }

  .btn-copy {
    background: transparent;
    border: 1px solid #2a3a4a;
    border-radius: 4px;
    padding: 3px 7px;
    color: #9ca3af;
    cursor: pointer;
    font-size: 11px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: 'Prompt', sans-serif;
    transition: all 0.2s;

    &:hover {
      background: #1a2332;
      border-color: #f97316;
      color: #f97316;
    }

    i {
      font-size: 10px;
    }
  }

  .api-hint {
    font-size: 11px;
    color: #4b5563;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 5px;

    i {
      font-size: 12px;
    }
  }

  .tracking-timeline {
    padding-left: 4px;

    .track-item {
      display: flex;
      gap: 14px;
      padding-bottom: 20px;

      &:last-child {
        padding-bottom: 0;
      }

      .track-dot-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-shrink: 0;
        width: 20px;
        gap: 0;

        .track-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;

          &.td-cur {
            background: #21e5f8;
            box-shadow: 0 0 0 3px rgba(33, 229, 248, 0.2);
          }

          &.td-done {
            background: #00bf63;
          }
        }

        .track-line {
          flex: 1;
          min-height: 12px;
          width: 2px;
          background: #00bf63;
          margin-bottom: -20px;
        }
      }

      .track-time {
        font-size: 11px;
        color: #6b7280;
        white-space: nowrap;
        width: 130px;
        flex-shrink: 0;
        padding-top: 2px;
      }

      .track-info {
        flex: 1;

        .track-status {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 2px;

          &.ts-cur {
            color: #21e5f8;
          }

          &.ts-done {
            color: #00bf63;
          }
        }

        .track-loc {
          font-size: 12px;
          color: #6b7280;
        }
      }
    }
  }
}
</style>
