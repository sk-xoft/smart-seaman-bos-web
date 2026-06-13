<template>
  <div class="action-buttons">
    <div class="actions-container">
      <button class="btn btn-danger" @click="$emit('cancel')">
        <i class="light-icon-trash"></i> ยกเลิกคำขอ
      </button>

      <div class="right-actions">
        <span class="hint-text" id="doc-hint" v-if="hintText">{{ hintText }}</span>
        <button class="btn btn-outline" :disabled="!canSendBack" @click="$emit('send-back')">
          <i class="light-icon-arrow-back"></i> ส่งกลับให้แก้ไข
        </button>
        <button class="btn btn-primary" :disabled="!canSubmit" @click="$emit('submit')">
          <i class="light-icon-send"></i> ยื่นกรมเจ้าท่าแล้ว
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActionButtons',
  props: {
    docsSaved: {
      type: Boolean,
      default: false
    },
    allAnswered: {
      type: Boolean,
      default: false
    },
    allPass: {
      type: Boolean,
      default: false
    },
    hasFix: {
      type: Boolean,
      default: false
    }
  },
  emits: ['cancel', 'send-back', 'submit'],
  computed: {
    hintText() {
      if (!this.docsSaved) return 'บันทึกผลตรวจก่อนดำเนินการต่อ'
      if (!this.allAnswered) return 'ยังมีเอกสารที่ยังไม่ได้ตรวจ'
      if (this.allPass) return ''
      return 'มีเอกสารที่ต้องแก้ไข'
    },
    canSendBack() {
      return this.docsSaved && this.allAnswered && this.hasFix
    },
    canSubmit() {
      return this.docsSaved && this.allPass
    }
  }
}
</script>

<style scoped lang="scss">
.action-buttons {
  margin-top: 16px;

  .actions-container {
    border-top: 1px dashed #2d3748;
    padding-top: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .hint-text {
      font-size: 12px;
      color: #6b7280;
    }

    .right-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }
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
  font-family: 'Prompt', sans-serif;
  white-space: nowrap;
  border: none;
  transition: all 0.2s;

  i {
    font-size: 15px;
  }

  &.btn-danger {
    background: transparent;
    border: 1px solid #ef4444;
    color: #ef4444;

    &:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.1);
    }
  }

  &.btn-primary {
    background: #f97316;

    &:hover:not(:disabled) {
      background: #ea580c;
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }

  &.btn-outline {
    background: transparent;
    border: 1px solid #f97316;
    color: #f97316;

    &:hover:not(:disabled) {
      background: rgba(249, 115, 22, 0.1);
    }

    &:disabled {
      border-color: #4b5563;
      color: #4b5563;
      cursor: not-allowed;
    }
  }
}
</style>
