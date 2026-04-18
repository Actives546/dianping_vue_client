<template>
  <div class="voucher-detail-container">
    <div class="page-header header-fixed">
      <router-link to="/voucher-list" class="back-btn">
        <span class="back-icon">←</span>
      </router-link>
      <h1 class="title">优惠券详情</h1>
      <div class="placeholder"></div>
    </div>
    
    <div class="page-content header-safe-area">
      <div class="voucher-card card" v-if="voucher">
        <div class="voucher-header">
          <div class="price-section">
            <div class="current-price">
              <span class="currency">¥</span>
              <span class="price-value">{{ voucher.payValue }}</span>
            </div>
            <div class="original-price">
              抵{{ voucher.actualValue }}元
            </div>
          </div>
          
          <div class="discount-badge" v-if="voucher.type === 1">
            <span class="badge-icon">🔥</span>
            <span class="badge-text">限时秒杀</span>
          </div>
        </div>
        
        <div class="voucher-info-section">
          <div class="voucher-title">{{ voucher.title }}</div>
          <div class="voucher-subtitle" v-if="voucher.subTitle">{{ voucher.subTitle }}</div>
          
          <div class="seckill-status" v-if="voucher.type === 1">
            <div class="status-item">
              <span class="status-label">库存</span>
              <span class="status-value" :class="{ 'low-stock': voucher.stock <= 10 }">
                {{ voucher.stock > 0 ? `剩余 ${voucher.stock} 份` : '已抢光' }}
              </span>
            </div>
            
            <div class="status-item" v-if="voucher.beginTime && voucher.endTime">
              <span class="status-label">抢购时间</span>
              <span class="status-value">{{ formatTimeRange(voucher.beginTime, voucher.endTime) }}</span>
            </div>
            
            <div class="countdown-section" v-if="seckillStatus === 'active'">
              <span class="countdown-label">距结束</span>
              <div class="countdown-timer">
                <span class="time-box">{{ countdown.hours }}</span>
                <span class="time-separator">:</span>
                <span class="time-box">{{ countdown.minutes }}</span>
                <span class="time-separator">:</span>
                <span class="time-box">{{ countdown.seconds }}</span>
              </div>
            </div>
            
            <div class="status-prompt" :class="seckillStatus">
              <template v-if="seckillStatus === 'not-started'">
                <span class="prompt-icon">⏰</span>
                <span class="prompt-text">抢购未开始</span>
              </template>
              <template v-else-if="seckillStatus === 'ended'">
                <span class="prompt-icon">😔</span>
                <span class="prompt-text">抢购已结束</span>
              </template>
              <template v-else-if="voucher.stock <= 0">
                <span class="prompt-icon">😭</span>
                <span class="prompt-text">手慢了，已抢光</span>
              </template>
            </div>
          </div>
        </div>
      </div>
      
      <div class="loading" v-else-if="loading">
        加载中...
      </div>
      
      <div class="empty" v-else>
        <span class="empty-icon">🎫</span>
        <span class="empty-text">优惠券不存在或已失效</span>
      </div>
      
      <div class="rules-section card" v-if="voucher?.rules">
        <div class="section-title">使用规则</div>
        <div class="rules-content">{{ voucher.rules }}</div>
      </div>
      
      <div class="shop-section card" v-if="shop">
        <div class="section-title">适用商铺</div>
        <div class="shop-info" @click="viewShop(shop)">
          <div class="shop-image">
            <img :src="getShopImage(shop)" :alt="shop.name" />
          </div>
          <div class="shop-details">
            <div class="shop-name">{{ shop.name }}</div>
            <div class="shop-meta">
              <span class="shop-score">★ {{ formatScore(shop.score) }}</span>
              <span class="shop-avg-price">¥{{ shop.avgPrice || 0 }}/人</span>
            </div>
            <div class="shop-location">
              <span class="location-icon">📍</span>
              <span class="shop-area">{{ shop.area || '商圈' }}</span>
            </div>
          </div>
          <span class="arrow-icon">›</span>
        </div>
      </div>
      
      <div class="tips-section card">
        <div class="section-title">温馨提示</div>
        <div class="tips-list">
          <div class="tip-item">
            <span class="tip-icon">💡</span>
            <span class="tip-text">每张优惠券每人限领1张</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">📅</span>
            <span class="tip-text">请在有效期内使用</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">📱</span>
            <span class="tip-text">出示优惠券二维码即可使用</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bottom-action-bar" v-if="voucher">
      <div class="action-left">
        <div class="price-summary">
          <span class="summary-label">到手价</span>
          <span class="summary-price">
            <span class="currency">¥</span>
            <span class="value">{{ voucher.payValue }}</span>
          </span>
        </div>
        <div class="original-summary" v-if="voucher.actualValue > voucher.payValue">
          原价 ¥{{ voucher.actualValue }}
        </div>
      </div>
      
      <button 
        class="action-btn" 
        :class="{ 
          'btn-seckill': voucher.type === 1,
          'btn-normal': voucher.type === 0,
          'disabled': !canGrab,
          'grabbing': isGrabbing
        }"
        @click="handleGrab"
        :disabled="!canGrab || isGrabbing"
      >
        <template v-if="isGrabbing">
          <span class="loading-spinner"></span>
          <span>抢购中...</span>
        </template>
        <template v-else-if="voucher.type === 1">
          <template v-if="seckillStatus === 'not-started'">
            未开始
          </template>
          <template v-else-if="seckillStatus === 'ended'">
            已结束
          </template>
          <template v-else-if="voucher.stock <= 0">
            已抢光
          </template>
          <template v-else>
            立即抢购
          </template>
        </template>
        <template v-else>
          立即领取
        </template>
      </button>
    </div>
    
    <div class="toast" :class="{ show: showToast }">
      {{ toastMessage }}
    </div>
    
    <div class="success-modal" v-if="showSuccessModal">
      <div class="modal-overlay" @click="closeSuccessModal"></div>
      <div class="modal-content">
        <div class="success-icon">
          <span class="icon-check">✓</span>
        </div>
        <div class="success-title">
          {{ voucher?.type === 1 ? '抢购成功！' : '领取成功！' }}
        </div>
        <div class="success-message">
          您已成功{{ voucher?.type === 1 ? '抢购' : '领取' }}优惠券
        </div>
        <div class="success-actions">
          <button class="action-secondary" @click="closeSuccessModal">
            继续逛逛
          </button>
          <button class="action-primary" @click="goToMyVouchers">
            查看优惠券
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { voucherApi, shopApi } from '../api'

const route = useRoute()
const router = useRouter()

const voucherId = ref(parseInt(route.params.id) || 0)
const voucher = ref(null)
const shop = ref(null)
const loading = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const isGrabbing = ref(false)
const showSuccessModal = ref(false)

const countdown = ref({
  hours: '00',
  minutes: '00',
  seconds: '00'
})

let countdownTimer = null

const seckillStatus = computed(() => {
  if (!voucher.value || voucher.value.type !== 1) return null
  
  const now = new Date()
  
  if (voucher.value.beginTime) {
    const beginTime = new Date(voucher.value.beginTime)
    if (now < beginTime) {
      return 'not-started'
    }
  }
  
  if (voucher.value.endTime) {
    const endTime = new Date(voucher.value.endTime)
    if (now > endTime) {
      return 'ended'
    }
  }
  
  return 'active'
})

const canGrab = computed(() => {
  if (!voucher.value) return false
  
  if (voucher.value.type === 1) {
    if (seckillStatus.value !== 'active') return false
    if (voucher.value.stock <= 0) return false
  }
  
  return true
})

const showToastMsg = (message) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

const getShopImage = (shopItem) => {
  if (shopItem.images) {
    const imageList = shopItem.images.split(',')
    if (imageList.length > 0) {
      return imageList[0]
    }
  }
  return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=restaurant%20storefront%20modern%20food%20shop&image_size=square_hd'
}

const formatScore = (score) => {
  if (!score) return '暂无'
  return (score / 10).toFixed(1)
}

const formatTimeRange = (beginTime, endTime) => {
  if (!beginTime || !endTime) return ''
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${month}月${day}日 ${hours}:${minutes}`
  }
  
  return `${formatDate(beginTime)} - ${formatDate(endTime)}`
}

const fetchVoucherDetail = async () => {
  if (!voucherId.value) return
  
  loading.value = true
  
  try {
    const res = await voucherApi.getVoucherById(voucherId.value)
    
    if (res.success) {
      voucher.value = res.data
      
      if (voucher.value.shopId) {
        fetchShopDetail(voucher.value.shopId)
      }
      
      if (voucher.value.type === 1 && seckillStatus.value === 'active') {
        startCountdown()
      }
    } else {
      showToastMsg(res.errorMsg || '加载优惠券失败')
    }
  } catch (error) {
    showToastMsg(error.message || '加载优惠券失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const fetchShopDetail = async (shopId) => {
  try {
    const res = await shopApi.getShopById(shopId)
    if (res.success) {
      shop.value = res.data
    }
  } catch (error) {
    console.error('加载商铺信息失败:', error)
  }
}

const startCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
}

const updateCountdown = () => {
  if (!voucher.value || !voucher.value.endTime) return
  
  const now = new Date()
  const endTime = new Date(voucher.value.endTime)
  const diff = endTime.getTime() - now.getTime()
  
  if (diff <= 0) {
    countdown.value = { hours: '00', minutes: '00', seconds: '00' }
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
    return
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  countdown.value = {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0')
  }
}

const handleGrab = async () => {
  if (!canGrab.value || isGrabbing.value) return
  
  isGrabbing.value = true
  
  try {
    if (voucher.value.type === 1) {
      const res = await voucherApi.seckillVoucher(voucher.value.id)
      
      if (res.success) {
        showSuccessModal.value = true
        if (voucher.value.stock > 0) {
          voucher.value.stock--
        }
      } else {
        showToastMsg(res.errorMsg || '抢购失败')
      }
    } else {
      showSuccessModal.value = true
    }
  } catch (error) {
    showToastMsg(error.message || '操作失败，请稍后重试')
  } finally {
    isGrabbing.value = false
  }
}

const viewShop = (shopItem) => {
  showToastMsg(`查看商铺: ${shopItem.name}`)
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}

const goToMyVouchers = () => {
  showSuccessModal.value = false
  showToastMsg('跳转到我的优惠券')
}

watch(() => route.params.id, (newId) => {
  voucherId.value = parseInt(newId) || 0
  voucher.value = null
  shop.value = null
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  fetchVoucherDetail()
})

onMounted(() => {
  fetchVoucherDetail()
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})
</script>

<style scoped>
.voucher-detail-container {
  min-height: 100vh;
  background-color: var(--background-secondary);
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  padding-top: calc(16px + env(safe-area-inset-top));
  background: linear-gradient(135deg, var(--primary-color) 0%, #ff8c5a 100%);
  box-shadow: var(--shadow-md);
}

.back-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--background-primary);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.back-btn:active {
  background-color: rgba(255, 255, 255, 0.2);
}

.title {
  font-size: 17px;
  font-weight: 600;
  color: var(--background-primary);
}

.placeholder {
  width: 32px;
}

.page-content {
  padding-bottom: 20px;
}

.voucher-card {
  margin: 12px;
  padding: 0;
  overflow: hidden;
}

.voucher-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 16px;
  background: linear-gradient(135deg, var(--primary-light) 0%, #ffe8e0 100%);
  position: relative;
}

.voucher-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: repeating-linear-gradient(
    to right,
    transparent,
    transparent 8px,
    var(--border-color) 8px,
    var(--border-color) 16px
  );
}

.price-section {
  display: flex;
  flex-direction: column;
}

.current-price {
  display: flex;
  align-items: baseline;
  color: var(--primary-color);
}

.current-price .currency {
  font-size: 18px;
  font-weight: 600;
}

.current-price .price-value {
  font-size: 42px;
  font-weight: bold;
  line-height: 1;
}

.original-price {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.discount-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
  padding: 6px 12px;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
}

.badge-icon {
  font-size: 16px;
}

.badge-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--background-primary);
}

.voucher-info-section {
  padding: 16px;
}

.voucher-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 6px;
}

.voucher-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.seckill-status {
  background-color: var(--background-secondary);
  border-radius: var(--radius-md);
  padding: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-label {
  font-size: 13px;
  color: var(--text-tertiary);
  width: 70px;
}

.status-value {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

.status-value.low-stock {
  color: var(--error-color);
}

.countdown-section {
  display: flex;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
}

.countdown-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-right: 8px;
}

.countdown-timer {
  display: flex;
  align-items: center;
  gap: 4px;
}

.time-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: var(--text-primary);
  color: var(--background-primary);
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.time-separator {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-primary);
}

.status-prompt {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
  padding: 10px;
  border-radius: var(--radius-md);
}

.status-prompt.not-started {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.status-prompt.ended {
  background-color: var(--background-secondary);
  color: var(--text-tertiary);
}

.prompt-icon {
  font-size: 16px;
}

.prompt-text {
  font-size: 13px;
  font-weight: 500;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-tertiary);
  font-size: 14px;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-tertiary);
  background-color: var(--background-primary);
  border-radius: var(--radius-lg);
  margin: 12px;
}

.empty-icon {
  font-size: 56px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  color: var(--text-secondary);
}

.rules-section,
.shop-section,
.tips-section {
  margin: 12px;
  padding: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.rules-content {
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-secondary);
  white-space: pre-wrap;
}

.shop-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  padding: 8px;
  border-radius: var(--radius-md);
}

.shop-info:active {
  background-color: var(--background-secondary);
}

.shop-image {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  background-color: var(--background-secondary);
}

.shop-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shop-details {
  flex: 1;
  margin-left: 12px;
}

.shop-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shop-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.shop-score {
  font-size: 13px;
  color: var(--primary-color);
  font-weight: 500;
}

.shop-avg-price {
  font-size: 13px;
  color: var(--text-secondary);
}

.shop-location {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--text-tertiary);
}

.location-icon {
  margin-right: 4px;
}

.arrow-icon {
  color: var(--text-tertiary);
  font-size: 18px;
  margin-left: 8px;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.tip-icon {
  font-size: 16px;
}

.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background-color: var(--background-primary);
  border-top: 1px solid var(--border-light);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.action-left {
  display: flex;
  flex-direction: column;
}

.price-summary {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.summary-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.summary-price {
  display: flex;
  align-items: baseline;
  color: var(--primary-color);
}

.summary-price .currency {
  font-size: 14px;
  font-weight: 600;
}

.summary-price .value {
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
}

.original-summary {
  font-size: 12px;
  color: var(--text-tertiary);
  text-decoration: line-through;
  margin-top: 2px;
}

.action-btn {
  padding: 14px 32px;
  border-radius: var(--radius-full);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-seckill {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
  color: var(--background-primary);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.btn-seckill:active:not(.disabled) {
  transform: scale(0.98);
  box-shadow: 0 6px 16px rgba(255, 107, 107, 0.4);
}

.btn-normal {
  background: linear-gradient(135deg, var(--primary-color) 0%, #ff8c5a 100%);
  color: var(--background-primary);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.btn-normal:active:not(.disabled) {
  transform: scale(0.98);
  box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
}

.action-btn.disabled {
  background: #e0e0e0;
  color: #999;
  cursor: not-allowed;
  box-shadow: none;
}

.action-btn.grabbing {
  opacity: 0.8;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: var(--background-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.9);
  background-color: rgba(0, 0, 0, 0.85);
  color: var(--background-primary);
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-size: 14px;
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  transition: all var(--transition-fast);
  backdrop-filter: blur(4px);
}

.toast.show {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background-color: var(--background-primary);
  border-radius: var(--radius-xl);
  padding: 32px 24px;
  margin: 24px;
  max-width: 320px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.success-icon {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, var(--success-color) 0%, #73d13d 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
}

.icon-check {
  font-size: 36px;
  color: var(--background-primary);
  font-weight: bold;
}

.success-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.success-message {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.success-actions {
  display: flex;
  gap: 12px;
}

.action-secondary,
.action-primary {
  flex: 1;
  padding: 12px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.action-secondary {
  background-color: var(--background-secondary);
  color: var(--text-primary);
}

.action-secondary:active {
  background-color: var(--border-light);
}

.action-primary {
  background: linear-gradient(135deg, var(--primary-color) 0%, #ff8c5a 100%);
  color: var(--background-primary);
}

.action-primary:active {
  transform: scale(0.98);
}
</style>