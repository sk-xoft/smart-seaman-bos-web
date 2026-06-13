<template>
  <div class="card">
    <div class="profile-container">
      <div class="profile-avatar-section">
        <div class="avatar" :style="{ backgroundColor: '#f97316' }">
          {{ getInitials(request.name, request.lname) }}
        </div>
        <div class="profile-name">
          <div class="full-name">{{ request.name }} {{ request.lname }}</div>
          <div class="position">({{ request.pos }})</div>
        </div>
      </div>

      <div class="profile-info">
        <div class="info-row">
          <span class="info-label">Date of Birth</span>
          <span class="info-value">25-Jan-1988</span>
        </div>
        <div class="info-row">
          <span class="info-label">Age</span>
          <span class="info-value">38</span>
        </div>
        <div class="info-row">
          <span class="info-label">Mobile Phone</span>
          <span class="info-value">082-464-2893</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">somchai.jai@gmail.com</span>
        </div>
        <div class="info-row">
          <span class="info-label">Company</span>
          <span class="info-value">OCEAN STAR</span>
        </div>
        <div class="info-row">
          <span class="info-label">Smart Seaman ID</span>
          <span class="info-value ssid">{{ request.ssid }}</span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="delivery-address">
        <div class="address-header">
          <div class="address-title"><i class="light-icon-map-pin"></i> ที่อยู่จัดส่ง</div>
          <button class="btn-copy" @click="copyAddress">
            <i class="light-icon-copy"></i> คัดลอก
          </button>
        </div>
        <div class="address-text">
          33/8 หมู่ที่ 6<br>
          ตำบลคลองตะเกรา<br>
          อำเภอท่าตะเกียบ<br>
          จังหวัดฉะเชิงเทรา 24160
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileCard',
  props: {
    request: {
      type: Object,
      required: true
    }
  },
  methods: {
    getInitials(firstName, lastName) {
      const first = firstName.charAt(0) || ''
      const last = lastName.charAt(0) || ''
      return (first + last).toUpperCase()
    },
    copyAddress() {
      const text = '33/8 หมู่ที่ 6\nตำบลคลองตะเกรา\nอำเภอท่าตะเกียบ\nจังหวัดฉะเชิงเทรา 24160'
      navigator.clipboard.writeText(text)
      // Show toast notification
      this.$emit('copied')
    }
  }
}
</script>

<style scoped lang="scss">
.card {
  margin-bottom: 16px;
}

.profile-container {
  display: flex;
  align-items: stretch;
  gap: 24px;
}

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  min-width: 0;

  .avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    color: #fff;
    font-weight: 700;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .profile-name {
    text-align: center;
    line-height: 1.4;

    .full-name {
      color: #fff;
      font-size: 13px;
      font-weight: 600;
    }

    .position {
      color: #9ca3af;
      font-size: 11px;
    }
  }
}

.profile-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .info-row {
    display: flex;
    padding: 6px 0;
    border-bottom: 1px solid #1e293b;
    align-items: flex-start;

    &:last-child {
      border-bottom: none;
    }
  }

  .info-label {
    width: 130px;
    flex-shrink: 0;
    color: #9ca3af;
    font-size: 13px;
  }

  .info-value {
    color: #e2e8f0;
    font-size: 13px;

    &.ssid {
      color: #f97316;
      font-weight: 600;
    }
  }
}

.divider {
  width: 1px;
  height: auto;
  background: #1e293b;
  align-self: stretch;
  flex-shrink: 0;
}

.delivery-address {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .address-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;

    .address-title {
      color: #f97316;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 5px;

      i {
        font-size: 14px;
      }
    }
  }

  .address-text {
    color: #e2e8f0;
    font-size: 13px;
    line-height: 1.9;
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
</style>
