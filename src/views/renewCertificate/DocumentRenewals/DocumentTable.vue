<template>
  <div>
    <table class="documents-table">
      <colgroup>
        <col style="width: 44px">
        <col>
        <col style="width: 140px">
        <col>
        <col style="width: 60px">
        <col style="width: 90px">
      </colgroup>
      <thead>
        <tr>
          <th>ลำดับที่</th>
          <th>เอกสาร</th>
          <th>ผลตรวจ</th>
          <th>
            หมายเหตุ
            <span class="required" v-if="editable">(required เมื่อเลือก ต้องแก้ไข)</span>
          </th>
          <th style="text-align: center">ไฟล์</th>
          <th style="text-align: center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="doc in documents" :key="doc.id" :id="`doc-row-${doc.id}`">
          <td>{{ doc.id }}</td>
          <td>
            <span class="doc-name">{{ doc.n }}</span>
            <span v-if="doc.upd" class="updated-badge">อัปเดตใหม่</span>
          </td>
          <td>
            <select 
              v-if="editable"
              v-model="docResults[doc.id].result"
              class="result-select"
              :class="getResultClass(docResults[doc.id].result)"
              @change="handleResultChange(doc.id)"
            >
              <option value="">— เลือกผล —</option>
              <option value="pass">ผ่าน</option>
              <option value="fix">ต้องแก้ไข</option>
            </select>
            <span v-else class="result-text" :class="getResultClass(docResults[doc.id].result)">
              <template v-if="docResults[doc.id].result === 'pass'">✓ ผ่าน</template>
              <template v-else-if="docResults[doc.id].result === 'fix'">✗ ต้องแก้ไข</template>
              <template v-else>—</template>
            </span>
          </td>
          <td>
            <input 
              v-if="editable"
              v-model="docResults[doc.id].note"
              type="text"
              class="note-input"
              placeholder="ระบุหมายเหตุ (ถ้ามี)"
              :style="{ color: docResults[doc.id].result === 'fix' ? '#ff0000' : '' }"
              @input="handleNoteChange(doc.id)"
            >
            <span v-else class="note-text">{{ docResults[doc.id].note || '—' }}</span>
          </td>
          <td style="text-align: center">
            <button class="btn-icon" :disabled="!doc.f" @click="viewFile(doc)">
              <i class="light-icon-eye"></i>
            </button>
          </td>
          <td style="text-align: center">
            <div class="action-buttons">
              <button class="btn-icon" :disabled="!doc.f" @click="downloadFile(doc)">
                <i class="light-icon-download"></i>
              </button>
              <button v-if="uploadable" class="btn-icon" @click="editFile(doc)">
                <i class="light-icon-edit"></i>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="editable" class="table-actions">
      <div style="display: flex; justify-content: flex-end; margin-bottom: 8px">
        <button class="btn btn-ghost" @click="saveDocs" :class="{ 'btn-saved': saveSuccess }">
          <i class="light-icon-device-floppy"></i> บันทึกผลตรวจ
        </button>
      </div>
    </div>

    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="file-modal" @click.stop>
        <div class="file-modal-header">
          <div class="file-modal-title">แก้ไขไฟล์เอกสาร</div>
          <button class="file-modal-close" @click="closeEditModal">×</button>
        </div>

        <div class="field-block">
          <div class="field-label">ชื่อเอกสาร</div>
          <div class="field-value">{{ editingDocName }}</div>
        </div>

        <div class="field-block">
          <div class="field-label">ไฟล์ปัจจุบัน</div>
          <div class="file-box">
            <i class="light-icon-file-type-pdf"></i>
            <span>{{ editingDocFilename }}</span>
            <button class="link-btn" :disabled="!editingDocId" @click="viewFile({ id: editingDocId, n: editingDocName, p: editingDocPath })">
              <i class="light-icon-eye"></i> ดูไฟล์
            </button>
          </div>
        </div>

        <div class="field-block">
          <div class="field-label">อัปโหลดไฟล์ใหม่ <span class="required-star">*</span></div>
          <label 
            class="upload-box" 
            :class="{ filled: !!selectedFileName, dragover: isDragOver }"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @drop.prevent="handleDrop"
          >
            <i class="light-icon-upload"></i>
            <span>{{ selectedFileName || 'เลือกไฟล์ หรือลากมาวางที่นี่ (PDF, JPG, PNG)' }}</span>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" @change="handleFileSelected">
          </label>
        </div>

        <div class="file-modal-actions">
          <button class="btn btn-cancel" @click="closeEditModal">ยกเลิก</button>
          <button class="btn btn-confirm" :disabled="!selectedFileName" @click="confirmUpload">
            <i class="light-icon-device-floppy"></i> บันทึก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DocumentTable',
  props: {
    documents: {
      type: Array,
      required: true
    },
    requestNo: {
      type: String,
      default: ''
    },
    editable: {
      type: Boolean,
      default: false
    },
    uploadable: {
      type: Boolean,
      default: false
    },
    initialResults: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['save', 'changed', 'upload-file'],
  data() {
    return {
      docResults: {},
      saveSuccess: false,
      showEditModal: false,
      editingDocName: '',
      editingDocId: null,
      editingDocPath: '',
      selectedFileName: '',
      selectedFile: null,
      isDragOver: false
    }
  },
  watch: {
    documents: {
      immediate: true,
      handler() {
        this.initializeDocResults()
      }
    },
    initialResults: {
      deep: true,
      handler() {
        this.initializeDocResults()
      }
    }
  },
  methods: {
    initializeDocResults() {
      this.docResults = {}
      this.documents.forEach(d => {
        if (this.initialResults[d.id]) {
          this.docResults[d.id] = { ...this.initialResults[d.id] }
        } else {
          this.docResults[d.id] = { result: '', note: '' }
        }
      })
    },
    getResultClass(result) {
      if (result === 'pass') return 'rs-pass'
      if (result === 'fix') return 'rs-fix'
      return 'rs-def'
    },
    handleResultChange(docId) {
      if (this.docResults[docId].result !== 'fix') {
        this.docResults[docId].note = ''
      }
      this.emitChanged()
    },
    handleNoteChange() {
      this.emitChanged()
    },
    emitChanged() {
      this.saveSuccess = false
      this.$emit('changed', this.cloneResults())
    },
    cloneResults() {
      return Object.fromEntries(
        Object.entries(this.docResults).map(([id, value]) => [id, { ...value }])
      )
    },
    showToast(message, isError = false) {
      const toast = document.createElement('div')
      toast.className = 'local-toast'
      if (isError) toast.classList.add('error')
      toast.innerHTML = `<i class="${isError ? 'light-icon-alert-circle' : 'light-icon-circle-check'}"></i><span>${message}</span>`
      document.body.appendChild(toast)
      setTimeout(() => {
        toast.classList.add('hide')
        setTimeout(() => toast.remove(), 300)
      }, 2200)
    },
    viewFile(doc) {
      const fileUrl = this.resolveFileUrl(doc, false)
      if (!fileUrl) {
        this.showToast('ไม่พบไฟล์ที่อัปโหลดสำหรับเอกสารนี้', true)
        return
      }

      window.open(fileUrl, '_blank', 'noopener')
    },
    downloadFile(doc) {
      const fileUrl = this.resolveFileUrl(doc, true)
      if (!fileUrl) {
        this.showToast('ไม่พบไฟล์ที่อัปโหลดสำหรับเอกสารนี้', true)
        return
      }

      const fallbackName = `${(doc?.n || 'document').replace(/\s+/g, '_')}.pdf`
      const fileName = this.extractFilename(doc?.p) || fallbackName
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = fileName
      link.target = '_blank'
      link.rel = 'noopener'
      document.body.appendChild(link)
      link.click()
      link.remove()
    },
    editFile(doc) {
      this.editingDocName = doc?.n ?? ''
      this.editingDocId = doc?.id ?? null
      this.editingDocPath = doc?.p ?? ''
      this.selectedFileName = ''
      this.selectedFile = null
      this.showEditModal = true
    },
    closeEditModal() {
      this.showEditModal = false
      this.editingDocId = null
      this.editingDocPath = ''
      this.selectedFile = null
      this.selectedFileName = ''
    },
    handleFileSelected(event) {
      const [file] = event.target.files || []
      this.selectedFileName = file ? file.name : ''
      this.selectedFile = file || null
      this.isDragOver = false
    },
    handleDrop(event) {
      this.isDragOver = false
      const [file] = event.dataTransfer.files || []
      if (!file) return
      const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!allowed.includes(file.type)) {
        this.showToast('รองรับเฉพาะไฟล์ PDF, JPG, PNG', true)
        return
      }
      this.selectedFile = file
      this.selectedFileName = file.name
    },
    confirmUpload() {
      if (!this.selectedFileName || !this.selectedFile || !this.editingDocId) return

      this.$emit('upload-file', {
        sortOrder: this.editingDocId,
        file: this.selectedFile,
        documentName: this.editingDocName,
      })

      this.closeEditModal()
    },
    normalizeFilename(name) {
      return name.replace(/\s+/g, '_')
    },
    resolveFileUrl(doc, download = false) {
      const sortOrder = Number(doc?.id)
      const baseUrl = import.meta.env.VITE_BASE_URL_API
      if (baseUrl && this.requestNo && sortOrder > 0) {
        return `${baseUrl}/v1/document-request-attachment-file?requestNo=${encodeURIComponent(this.requestNo)}&sortOrder=${encodeURIComponent(sortOrder)}&download=${download ? 'true' : 'false'}`
      }

      const filePath = doc?.p
      if (!filePath || typeof filePath !== 'string') {
        return ''
      }

      if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('blob:') || filePath.startsWith('data:')) {
        return filePath
      }

      return ''
    },
    extractFilename(filePath) {
      if (!filePath || typeof filePath !== 'string') {
        return ''
      }

      const normalized = filePath.split('?')[0].replace(/\/$/, '')
      const lastSlash = normalized.lastIndexOf('/')
      if (lastSlash === -1 || lastSlash === normalized.length - 1) {
        return ''
      }

      return normalized.slice(lastSlash + 1)
    },
    saveDocs() {
      const hasErrors = Object.entries(this.docResults).some(([, result]) => {
        return result.result === 'fix' && !result.note.trim()
      })

      if (hasErrors) {
        this.showToast('กรุณาระบุหมายเหตุสำหรับเอกสารที่ต้องแก้ไข', true)
        return
      }

      this.saveSuccess = true
      this.$emit('save', this.cloneResults())
    }
  },
  computed: {
    normalizedDocFilename() {
      return this.normalizeFilename(this.editingDocName || '')
    },
    editingDocFilename() {
      return this.extractFilename(this.editingDocPath) || `${this.normalizedDocFilename}_original.pdf`
    }
  }
}
</script>

<style scoped lang="scss">
.documents-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed;
  margin-bottom: 10px;

  colgroup {
    col {
      &:nth-child(2) {
        width: auto;
      }
    }
  }

  thead {
    tr {
      th {
        padding: 10px 12px;
        color: #9ca3af;
        font-weight: 500;
        text-align: left;
        background: #111c2b;
        border-bottom: 1px solid #2a3a4a;
        font-size: 12px;
        white-space: nowrap;

        .required {
          color: #ef4444;
          font-size: 10px;
        }
      }
    }
  }

  tbody {
    tr {
      td {
        padding: 11px 12px;
        border-bottom: 1px solid #1e293b;
        color: #d1d5db;
        vertical-align: middle;

        .doc-name {
          color: #e2e8f0;
          font-weight: 500;
        }

        .updated-badge {
          background: #1e3a5f;
          color: #60a5fa;
          border-radius: 4px;
          padding: 1px 7px;
          font-size: 10px;
          font-weight: 600;
          margin-left: 4px;
        }

        .result-select {
          background: #0d1520;
          border: 1px solid #2a3a4a;
          border-radius: 5px;
          padding: 5px 8px;
          font-size: 12px;
          outline: none;
          cursor: pointer;
          width: 100%;
          color: #e2e8f0;

          &.rs-pass {
            color: #00bf63;
          }

          &.rs-fix {
            color: #ff0000;
          }

          &.rs-def {
            color: #f97316;
          }

          &:focus {
            border-color: #f97316;
          }
        }

        .result-text {
          font-size: 13px;

          &.rs-pass {
            color: #00bf63;
          }

          &.rs-fix {
            color: #ff0000;
          }

          &.rs-def {
            color: #f97316;
          }
        }

        .note-input {
          background: #0d1520;
          border: 1px solid #2a3a4a;
          border-radius: 5px;
          padding: 5px 8px;
          font-size: 12px;
          outline: none;
          width: 100%;
          color: #e2e8f0;

          &::placeholder {
            color: #374151;
          }

          &:focus {
            border-color: #f97316;
          }
        }

        .note-text {
          color: #4b5563;
          font-size: 12px;
        }

        .action-buttons {
          display: flex;
          gap: 5px;
          justify-content: center;
        }
      }
    }
  }
}

.table-actions {
  margin-top: 16px;

  .actions-footer {
    border-top: 1px dashed #2d3748;
    padding-top: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .hint-text {
      font-size: 12px;
      color: #6b7280;
    }

    .footer-controls {
      display: flex;
      gap: 10px;
      align-items: center;
    }
  }
}

.btn-icon {
  background: #f97316;
  border: none;
  border-radius: 6px;
  padding: 7px 9px;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background: #ea580c;
  }

  i {
    font-size: 15px;
  }
}

.btn {
  background: transparent;
  border: 1px solid #4b5563;
  border-radius: 6px;
  padding: 0 20px;
  color: #9ca3af;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 40px;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #9ca3af;
    color: #e2e8f0;
  }

  i {
    font-size: 15px;
  }
}

.btn-saved {
  background: #16a34a;
  border: none;
  color: #fff;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 120;
}

.file-modal {
  width: 480px;
  background: #1a2332;
  border: 1px solid #2d3748;
  border-radius: 12px;
  padding: 24px;
}

.file-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.file-modal-title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.file-modal-close {
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 24px;
  cursor: pointer;
}

.field-block {
  margin-bottom: 16px;
}

.field-label {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 6px;
}

.field-value {
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 500;
}

.file-box {
  background: #111c2b;
  border: 1px solid #1e293b;
  border-radius: 6px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #d1d5db;
  font-size: 13px;
}

.link-btn {
  margin-left: auto;
  background: transparent;
  border: none;
  color: #f97316;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.upload-box {
  background: #0d1520;
  border: 1px dashed #2a3a4a;
  border-radius: 6px;
  padding: 14px;
  display: flex;
  gap: 10px;
  align-items: center;
  color: #9ca3af;
  font-size: 13px;
  cursor: pointer;

  input {
    display: none;
  }

  &.filled {
    border-style: solid;
    border-color: #f97316;
    color: #e2e8f0;
  }

  &.dragover {
    border-color: #f97316;
    background: #111c2b;
  }
}

.required-star {
  color: #ef4444;
}

.file-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  border: 1px solid #4b5563;
  color: #9ca3af;
}

.btn-confirm {
  background: #f97316;
  border: none;
  color: #fff;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
</style>
