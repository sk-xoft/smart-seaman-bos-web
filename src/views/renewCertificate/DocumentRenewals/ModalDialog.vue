<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal">
      <div class="modal-content">
        <div class="modal-icon" :class="config.icon || 'mi-warn'">
          <i :class="getIconClass(config.isDanger)"></i>
        </div>
        <div class="modal-title">{{ config.title }}</div>
        <div class="modal-body" v-html="config.body"></div>
        <div class="modal-actions">
          <button class="btn-mc" @click="$emit('close')">ยกเลิก</button>
          <button 
            :class="['btn-confirm', { 'btn-mdanger': config.isDanger, 'btn-mok': !config.isDanger }]"
            @click="$emit('confirm', config.action)"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalDialog',
  props: {
    config: {
      type: Object,
      default: () => ({
        icon: 'mi-warn',
        title: '',
        body: '',
        action: '',
        isDanger: false
      })
    }
  },
  emits: ['close', 'confirm'],
  methods: {
    handleOverlayClick(event) {
      if (event.target === event.currentTarget) {
        this.$emit('close')
      }
    },
    getIconClass(isDanger) {
      return isDanger ? 'light-icon-alert-triangle' : 'light-icon-alert-circle'
    }
  }
}
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100 !important;
}

.modal {
  background: #1a2332;
  border-radius: 12px;
  padding: 28px;
  width: 480px;
  max-height: 90vh;
  border: 1px solid #2d3748;
  overflow-y: auto;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
  z-index: 101 !important;
  position: relative !important;
  margin: auto !important;
}

.modal-content {
  text-align: center;
}

.modal-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 24px;

  &.mi-warn {
    background: #451a03;
    color: #f97316;
  }

  &.mi-danger {
    background: #2d1515;
    color: #ef4444;
  }

  i {
    font-size: 28px;
  }
}

.modal-title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
}

.modal-body {
  color: #9ca3af;
  font-size: 13px;
  line-height: 1.7;
  margin-bottom: 20px;

  :deep(.hl) {
    color: #f97316;
    font-weight: 600;
  }
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn-mc {
  background: transparent;
  border: 1px solid #4b5563;
  border-radius: 6px;
  padding: 0 24px;
  color: #9ca3af;
  font-size: 13px;
  cursor: pointer;
  height: 40px;
  
  transition: all 0.2s;

  &:hover {
    border-color: #f97316;
    color: #f97316;
  }
}

.btn-confirm {
  border: none;
  border-radius: 6px;
  padding: 0 24px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  height: 40px;
  
  transition: all 0.2s;

  &.btn-mok {
    background: #f97316;
    color: #fff;

    &:hover {
      background: #ea580c;
    }
  }

  &.btn-mdanger {
    background: #ef4444;
    color: #fff;

    &:hover {
      background: #dc2626;
    }
  }
}
</style>
