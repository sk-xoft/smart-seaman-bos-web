<script>
import { h } from 'vue'
import { STEPPER_STEPS } from '@/constants/documentRequests'

export default {
  name: 'StepperCard',
  props: {
    request: {
      type: Object,
      required: true
    },
    status: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      stepsConfig: {
        'รอตรวจเอกสาร': { done: [], active: 1 },
        'รอผู้ยื่นแก้ไข': { done: [], active: 1 },
        'รอผลกรมเจ้าท่า': { done: [1], active: 2 },
        'รอรับเอกสารจากกรม': { done: [1, 2], active: 3 },
        'กำลังจัดส่ง': { done: [1, 2, 3], active: 4 },
        'จัดส่งสำเร็จ': { done: [1, 2, 3, 4], active: 5 },
        'ยกเลิก': { done: [], active: 1 }
      }
    }
  },
  computed: {
    currentStepConfig() {
      return this.stepsConfig[this.status] || { done: [], active: 1 }
    }
  },
  methods: {
    renderStepperHTML() {
      const { done, active } = this.currentStepConfig
      return h('div', { class: 'stepper-container' }, 
        STEPPER_STEPS.map((step, idx) => {
          const isDone = done.includes(step.n)
          const isActive = step.n === active
          const circleClass = isDone ? 'sc-done' : isActive ? 'sc-active' : 'sc-pending'
          const labelClass = isDone ? 'sl-done' : isActive ? 'sl-active' : ''
          const dashClass = isDone ? 'sd-done' : ''

          const elements = [
            h('div', { class: 'step' }, [
              h('div', { class: ['step-circle', circleClass] }, step.n),
              h('div', { class: ['step-lbl', labelClass] }, step.l)
            ])
          ]

          if (idx < STEPPER_STEPS.length - 1) {
            elements.push(h('div', { class: ['step-dash', dashClass] }))
          }

          return elements
        }).flat()
      )
    }
  },
  render() {
    return h('div', { class: 'card stepper-card' },
      h('div', { class: 'stepper-content' }, [
        h('div', { class: 'stepper-info' }, [
          h('div', { class: 'info-block' }, [
            h('div', { class: 'info-label' }, 'เอกสารที่ขอต่ออายุ'),
            h('div', { class: 'info-value' }, this.request.doc)
          ]),
          h('div', { class: 'info-grid' }, [
            h('div', {}, [
              h('div', { class: 'info-label' }, 'เลขที่คำขอ'),
              h('div', { class: 'info-value' }, this.request.no)
            ]),
            h('div', {}, [
              h('div', { class: 'info-label' }, 'วันที่ยื่น'),
              h('div', { class: 'info-value' }, this.request.date)
            ])
          ])
        ]),
        h('div', { class: 'divider' }),
        h('div', { class: 'stepper' }, [
          this.renderStepperHTML()
        ])
      ])
    )
  }
}
</script>

<style scoped lang="scss">
.stepper-card {
  display: flex;
  gap: 32px;
  align-items: stretch;
  min-height: 100px;
  padding: 20px 24px;
  margin-bottom: 16px;
}

.stepper-content {
  display: flex;
  width: 100%;
  height: 100%;
  gap: 32px;
  align-items: stretch;
}

.stepper-info {
  flex: 0 0 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .info-block {
    margin-bottom: 14px;

    .info-label {
      font-size: 11px;
      color: #9ca3af;
      margin-bottom: 3px;
    }

    .info-value {
      color: #f97316;
      font-size: 17px;
      font-weight: 600;
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 16px;

    & > div {
      .info-label {
        font-size: 11px;
        color: #9ca3af;
        margin-bottom: 3px;
      }

      .info-value {
        color: #e2e8f0;
        font-size: 13px;
        font-weight: 600;
      }
    }
  }
}

.divider {
  width: 1px;
  height: auto;
  background: #1e293b;
  align-self: stretch;
  flex-shrink: 0;
  margin: 0;
}

.stepper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  min-height: 100%;

  .stepper-container {
    display: flex;
    align-items: center;
    width: 100%;
  }
}

/* Stepper styles */
.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
  min-width: 0;

  .step-circle {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;

    &.sc-active {
      background: #f97316;
      color: #fff;
    }

    &.sc-done {
      background: #16a34a;
      color: #fff;
    }

    &.sc-pending {
      background: transparent;
      color: #6b7280;
      border: 1.5px solid #374151;
    }
  }

  .step-lbl {
    font-size: 11px;
    color: #6b7280;
    word-break: break-word;
    text-align: center;
    line-height: 1.3;
    max-width: 70px;

    &.sl-active {
      color: #f97316;
      font-weight: 600;
    }

    &.sl-done {
      color: #4ade80;
    }
  }
}

.step-dash {
  flex: 1 1 auto;
  border: none;
  border-top: 2px dashed #374151;
  margin-bottom: 22px;
  min-width: 20px;

  &.sd-done {
    border-top-color: #16a34a;
  }
}
</style>
