<template>
  <div class="tab-content">
    <div v-if="request.status === 'รอตรวจเอกสาร'" class="edit-mode">
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
        :editable="true"
        :initialResults="docResults"
        @save="saveDocuments"
        @changed="onDocumentsChanged"
      />
      <ActionButtons
        :docsSaved="docsSaved"
        :allAnswered="allAnswered"
        :allPass="allPass"
        :hasFix="hasFix"
        @cancel="$emit('cancel')"
        @send-back="$emit('send-back')"
        @submit="$emit('submit')"
      />
    </div>

    <div v-else class="view-mode">
      <div class="view-only-badge">
        <i class="light-icon-lock"></i>
        <span>ผ่านการตรวจแล้ว — view only</span>
      </div>
      <DocumentTable :documents="documents" :editable="false" />
    </div>
  </div>
</template>

<script>
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
  emits: ['cancel', 'send-back', 'submit', 'documents-saved'],
  data() {
    return {
      docResults: {},
      docsSaved: false
    }
  },
  computed: {
    documents() {
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
    downloadAllFiles() {
      const downloadableDocs = this.documents.filter(d => d.f)
      if (!downloadableDocs.length) return

      const content = downloadableDocs.map((d, index) => `${index + 1}. ${d.n}`).join('\n')
      const blob = new Blob([`Documents in package:\n${content}\n`], { type: 'application/zip' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `documents-${this.request.no || 'bundle'}.zip`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    },
    initializeDocResults() {
      this.docsSaved = false
      const docs = this.documents
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
