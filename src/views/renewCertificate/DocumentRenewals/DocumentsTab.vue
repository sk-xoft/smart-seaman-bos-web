<template>
  <div class="tab-content">
    <div class="edit-mode">
      <div v-if="request.resubmit" class="resubmit-badge">
        <i class="light-icon-refresh"></i> ผู้ยื่นแก้ไขและส่งกลับมาแล้ว
        <span class="date">อัปเดตเมื่อ {{ request.date }}</span>
      </div>

      <div class="documents-header">
        <div class="title">รายการเอกสารประกอบ</div>
        <button class="btn btn-primary" @click="downloadAllFiles">
          <i class="light-icon-download"></i> ดาวน์โหลดทั้งหมด (.zip)
        </button>
      </div>

      <DocumentTable
        :documents="documents"
        :requestNo="request.no"
        :editable="isEditable"
        :uploadable="isUploadable"
        :initialResults="docResults"
        @save="saveDocuments"
        @changed="onDocumentsChanged"
        @upload-file="uploadFile"
      />
      <ActionButtons
        v-if="isInspectionStep"
        :docsSaved="docsSaved"
        :allAnswered="allAnswered"
        :allPass="allPass"
        :hasFix="hasFix"
        @cancel="$emit('cancel')"
        @send-back="$emit('send-back')"
        @submit="$emit('submit')"
      />
    </div>
  </div>
</template>

<script>
import JSZip from 'jszip'
import DocumentTable from './DocumentTable.vue'
import ActionButtons from './ActionButtons.vue'
import { DOCS_DEFAULT, DOCS_RESUB } from '@/constants/documentRequests'

export default {
  name: 'DocumentsTab',
  components: { DocumentTable, ActionButtons },
  props: {
    request: {
      type: Object,
      required: true
    }
  },
  emits: ['cancel', 'send-back', 'submit', 'documents-saved', 'upload-file'],
  data() {
    return {
      docResults: {},
      docsSaved: false,
      isDownloadingAll: false,
    }
  },
  computed: {
    isInspectionStep() {
      const currentStep = this.request?.stepper?.currentStep
      if (currentStep === 1) {
        return true
      }

      // Fallback for responses that do not include stepper yet.
      return ['รอตรวจเอกสาร', 'รอผู้ยื่นแก้ไข'].includes(this.request?.status)
    },
    isEditable() {
      return this.isInspectionStep
    },
    isUploadable() {
      if (this.request?.stepper?.isCancelled) {
        return false
      }

      return this.request?.status !== 'ยกเลิก'
    },
    documents() {
      if (Array.isArray(this.request.documents) && this.request.documents.length) {
        return this.request.documents
      }
      return this.request.resubmit ? DOCS_RESUB : DOCS_DEFAULT
    },
    allAnswered() {
      return this.documents.every(d => this.docResults[d.id] && this.docResults[d.id].result !== '')
    },
    allPass() {
      return this.documents.every(d => this.docResults[d.id] && this.docResults[d.id].result === 'pass')
    },
    hasFix() {
      return this.documents.some(d => this.docResults[d.id] && this.docResults[d.id].result === 'fix')
    }
  },
  mounted() {
    this.initializeDocResults()
  },
  methods: {
    async downloadAllFiles() {
      if (this.isDownloadingAll) return

      const downloadableDocs = this.documents.filter(d => d.f)
      if (!downloadableDocs.length) {
        return
      }

      const baseUrl = import.meta.env.VITE_BASE_URL_API
      const requestNo = this.request?.no
      if (!baseUrl || !requestNo) {
        return
      }

      this.isDownloadingAll = true

      try {
        const zip = new JSZip()

        for (const doc of downloadableDocs) {
          const sortOrder = Number(doc.id)
          if (!sortOrder) {
            continue
          }

          const fileUrl = `${baseUrl}/v1/document-request-attachment-file?requestNo=${encodeURIComponent(requestNo)}&sortOrder=${encodeURIComponent(sortOrder)}&download=true`
          const response = await fetch(fileUrl)

          if (!response.ok) {
            throw new Error(`Download failed with status ${response.status}`)
          }

          const blob = await response.blob()
          const disposition = response.headers.get('content-disposition') || ''
          const serverFileName = this.extractFilenameFromDisposition(disposition)
          const fallback = `${this.sanitizeFilename(doc.n || `document_${sortOrder}`)}${this.getExtensionByContentType(blob.type)}`
          const fileName = serverFileName || fallback

          zip.file(fileName, blob)
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const zipUrl = URL.createObjectURL(zipBlob)
        const link = document.createElement('a')
        link.href = zipUrl
        link.download = `documents-${requestNo}.zip`
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(zipUrl)
      } catch (error) {
        console.error(error)
      } finally {
        this.isDownloadingAll = false
      }
    },
    sanitizeFilename(filename) {
      return filename
        .replace(/[\\/:*?"<>|]/g, '_')
        .replace(/\s+/g, '_')
        .trim()
    },
    extractFilenameFromDisposition(disposition) {
      if (!disposition) {
        return ''
      }

      const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
      if (utf8Match && utf8Match[1]) {
        try {
          return decodeURIComponent(utf8Match[1].trim())
        } catch {
          return utf8Match[1].trim()
        }
      }

      const asciiMatch = disposition.match(/filename="?([^";]+)"?/i)
      return asciiMatch && asciiMatch[1] ? asciiMatch[1].trim() : ''
    },
    getExtensionByContentType(contentType) {
      const normalized = (contentType || '').toLowerCase()
      if (normalized.includes('pdf')) return '.pdf'
      if (normalized.includes('png')) return '.png'
      if (normalized.includes('jpeg') || normalized.includes('jpg')) return '.jpg'
      return ''
    },
    initializeDocResults() {
      this.docsSaved = false
      const docs = this.documents

      if (this.request.attachmentResults) {
        docs.forEach(d => {
          this.docResults[d.id] = this.request.attachmentResults[d.id] ?? { result: '', note: '' }
        })
        return
      }

      docs.forEach(d => {
        if (this.request.resubmit) {
          this.docResults[d.id] = d.id <= 2 ? { result: 'pass', note: '' } : { result: '', note: '' }
        } else {
          if (d.id === 1 || d.id === 2) this.docResults[d.id] = { result: 'pass', note: '' }
          else if (d.id === 3) this.docResults[d.id] = { result: 'fix', note: 'หนังสือหมดอายุ' }
          else this.docResults[d.id] = { result: '', note: '' }
        }
      })
    },
    onDocumentsChanged(results) {
      this.docResults = results
      this.docsSaved = false
    },
    saveDocuments(results) {
      this.docResults = results
      this.docsSaved = true
      this.$emit('documents-saved', results)
    },
    uploadFile(payload) {
      this.$emit('upload-file', payload)
    }
  }
}
</script>

<style scoped lang="scss">
.tab-content {
  padding: 16px 0;
}

.edit-mode,
.view-mode {
  .resubmit-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
    background: #1e3a5f;
    color: #60a5fa;
    border-radius: 6px;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 600;

    i {
      font-size: 14px;
    }

    .date {
      font-size: 12px;
      color: #6b7280;
      margin-left: auto;
    }
  }
}

.view-only-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #6b7280;

  i {
    font-size: 14px;
  }
}

.documents-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;

  .title {
    color: #fff;
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
