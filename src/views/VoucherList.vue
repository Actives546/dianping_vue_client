<template>
  <div class="voucher-list-container">
    <div class="page-header header-fixed">
      <router-link to="/home" class="back-btn">
        <span class="back-icon">←</span>
      </router-link>
      <h1 class="title">优惠券</h1>
      <div class="placeholder"></div>
    </div>
    
    <div class="page-content header-safe-area">
      <div class="filter-tabs">
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'all' }"
          @click="switchTab('all')"
        >
          全部
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'seckill' }"
          @click="switchTab('seckill')"
        >
          <span class="seckill-tag">限时秒杀</span>
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'normal' }"
          @click="switchTab('normal')"
        >
          普通券
        </div>
      </div>
      
      <div class="seckill-banner" v-if="activeTab === 'all' || activeTab === 'seckill'">
        <div class="banner-content">
          <span class="banner-icon">🔥</span>
          <span class="banner-title">限时秒杀</span>
          <span class="banner-time" v-if="seckillCountdown">
            距结束: {{ seckillCountdown }}
          </span>
        </div>
      </div>
      
      <div class="voucher-list">
        <div 
          class="voucher-item" 
          v-for="voucher in vouchers" 
          :key="voucher.id"
          @click="viewVoucherDetail(voucher)"
        >
          <div class="voucher-left">
            <div class="voucher-price">
              <span class="currency">¥</span>
              <span class="price-value">{{ voucher.payValue }}</span>
            </div>
            <div class="voucher-original">
              抵{{ voucher.actualValue }}元
            </div>
            <div class="voucher-type-tag" :class="{ 'is-seckill': voucher.type === 1 }">
              {{ voucher.type === 1 ? '秒杀券' : '普通券' }}
            </div>
          </div>
          
          <div class="voucher-divider"></div>
          
          <div class="voucher-right">
            <div class="voucher-title">{{ voucher.title }}</div>
            <div class="voucher-subtitle" v-if="voucher.subTitle">{{ voucher.subTitle }}</div>
            
            <div class="voucher-info">
              <div class="info-item" v-if="voucher.type === 1 && voucher.stock !== null">
                <span class="info-icon">📦</span>
                <span class="info-text">剩余 {{ voucher.stock }} 份</span>
              </div>
              <div class="info-item" v-if="voucher.type === 1 && voucher.beginTime">
                <span class="info-icon">⏰</span>
                <span class="info-text">{{ formatTimeRange(voucher.beginTime, voucher.endTime) }}</span>
              </div>
              <div class="info-item" v-if="voucher.rules">
                <span class="info-icon">📋</span>
                <span class="info-text">{{ voucher.rules }}</span>
              </div>
            </div>
            
            <div class="voucher-action">
              <button 
                class="action-btn" 
                :class="{ 
                  'btn-seckill': voucher.type === 1, 
                  'btn-normal': voucher.type === 0,
                  'disabled': voucher.type === 1 && voucher.stock <= 0
                }"
                @click.stop="handleGrab(voucher)"
                :disabled="voucher.type === 1 && voucher.stock <= 0"
              >
                <template v-if="voucher.type === 1">
                  <span v-if="voucher.stock <= 0">已抢光</span>
                  <span v-else>立即抢购</span>
                </template>
                <span v-else>立即领取</span>
              </button>
            </div>
          </div>
          
          <div class="voucher-corner top-left"></div>
          <div class="voucher-corner top-right"></div>
          <div class="voucher-corner bottom-left"></div>
          <div class="voucher-corner bottom-right"></div>
        </div>
        
        <div class="loading" v-if="loading && vouchers.length === 0">
          加载中...
        </div>
        
        <div class="empty" v-else-if="!loading && vouchers.length === 0">
          <span class="empty-icon">🎫</span>
          <span class="empty-text">暂无优惠券</span>
        </div>
        
        <div class="load-more" v-if="hasMore && !loading" @click="loadMore">
          加载更多
        </div>
        
        <div class="no-more-data" v-if="!hasMore && vouchers.length > 0">
          到底了
        </div>
      </div>
    </div>
    
    <BottomNav />
    
    <div class="toast" :class="{ show: showToast }">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { voucherApi } from '../api'
import BottomNav from '../components/BottomNav.vue'

const router = useRouter()

const activeTab = ref('all')
const vouchers = ref([])
const loading = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)
const showToast = ref(false)
const toastMessage = ref('')
const seckillCountdown = ref('')

const showToastMsg = (message) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
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

const switchTab = (tab) => {
  activeTab.value = tab
  currentPage.value = 1
  vouchers.value = []
  hasMore.value = true
  fetchVouchers()
}

const fetchVouchers = async () => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    const params = {
      current: currentPage.value,
      size: 10
    }
    
    if (activeTab.value === 'seckill') {
      params.type = 1
    } else if (activeTab.value === 'normal') {
      params.type = 0
    }
    
    const res = await voucherApi.getVoucherList(params)
    
    if (res.success) {
      const newVouchers = res.data || []
      
      if (currentPage.value === 1) {
        vouchers.value = newVouchers
      } else {
        vouchers.value = [...vouchers.value, ...newVouchers]
      }
      
      hasMore.value = newVouchers.length >= 10
    } else {
      showToastMsg(res.errorMsg || '加载优惠券失败')
    }
  } catch (error) {
    showToastMsg(error.message || '加载优惠券失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  currentPage.value++
  fetchVouchers()
}

const viewVoucherDetail = (voucher) => {
  router.push(`/voucher/${voucher.id}`)
}

const handleGrab = (voucher) => {
  if (voucher.type === 1 && voucher.stock <= 0) {
    showToastMsg('优惠券已抢光')
    return
  }
  
  if (voucher.type === 1) {
    router.push(`/voucher/${voucher.id}`)
  } else {
    showToastMsg('领取成功')
  }
}

const updateSeckillCountdown = () => {
  const now = new Date()
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)
  
  const diff = endOfDay.getTime() - now.getTime()
  
  if (diff <= 0) {
    seckillCountdown.value = '00:00:00'
    return
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  seckillCountdown.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

onMounted(() => {
  fetchVouchers()
  updateSeckillCountdown()
  setInterval(updateSeckillCountdown, 1000)
})
</script>

<style scoped>
.voucher-list-container {
  min-height: 100vh;
  background-color: var(--background-secondary);
  padding-bottom: 70px;
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

.filter-tabs {
  display: flex;
  background-color: var(--background-primary);
  padding: 12px 16px;
  gap: 12px;
  box-shadow: var(--shadow-sm);
}

.tab-item {
  padding: 8px 16px;
  font-size: 14px;
  color: var(--text-secondary);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-item.active {
  background-color: var(--primary-light);
  color: var(--primary-color);
  font-weight: 500;
}

.seckill-tag {
  display: inline-flex;
  align-items: center;
}

.seckill-tag::before {
  content: '🔥';
  margin-right: 4px;
}

.seckill-banner {
  margin: 12px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow-md);
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.banner-icon {
  font-size: 24px;
}

.banner-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--background-primary);
}

.banner-time {
  margin-left: auto;
  font-size: 13px;
  color: var(--background-primary);
  background-color: rgba(0, 0, 0, 0.2);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-family: 'Courier New', monospace;
}

.voucher-list {
  padding: 0 12px;
}

.voucher-item {
  position: relative;
  display: flex;
  background-color: var(--background-primary);
  border-radius: var(--radius-lg);
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.voucher-item:active {
  transform: scale(0.99);
  box-shadow: var(--shadow-md);
}

.voucher-left {
  width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  background: linear-gradient(135deg, var(--primary-light) 0%, #ffe8e0 100%);
  position: relative;
}

.voucher-left::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 4px,
    var(--border-color) 4px,
    var(--border-color) 8px
  );
}

.voucher-price {
  display: flex;
  align-items: baseline;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.currency {
  font-size: 14px;
  font-weight: 600;
}

.price-value {
  font-size: 28px;
  font-weight: bold;
  line-height: 1;
}

.voucher-original {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.voucher-type-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background-color: var(--background-primary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.voucher-type-tag.is-seckill {
  background-color: var(--primary-color);
  color: var(--background-primary);
  border: none;
}

.voucher-divider {
  width: 0;
  position: relative;
}

.voucher-divider::before,
.voucher-divider::after {
  content: '';
  position: absolute;
  left: -8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--background-secondary);
  z-index: 1;
}

.voucher-divider::before {
  top: -8px;
}

.voucher-divider::after {
  bottom: -8px;
}

.voucher-right {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.voucher-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.voucher-subtitle {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-bottom: 8px;
}

.voucher-info {
  flex: 1;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.info-icon {
  font-size: 14px;
}

.voucher-action {
  margin-top: 8px;
}

.action-btn {
  padding: 8px 20px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.btn-seckill {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
  color: var(--background-primary);
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.btn-seckill:active {
  transform: scale(0.98);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.btn-normal {
  background-color: var(--primary-light);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.btn-normal:active {
  background-color: var(--primary-color);
  color: var(--background-primary);
}

.action-btn.disabled {
  background-color: #e0e0e0;
  color: #999;
  cursor: not-allowed;
  box-shadow: none;
}

.voucher-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: var(--background-secondary);
  border-radius: 50%;
}

.voucher-corner.top-left {
  top: -6px;
  left: -6px;
}

.voucher-corner.top-right {
  top: -6px;
  right: -6px;
}

.voucher-corner.bottom-left {
  bottom: -6px;
  left: -6px;
}

.voucher-corner.bottom-right {
  bottom: -6px;
  right: -6px;
}

.loading {
  text-align: center;
  padding: 40px 20px;
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

.load-more {
  text-align: center;
  padding: 16px;
  color: var(--primary-color);
  font-size: 14px;
  background-color: var(--background-primary);
  cursor: pointer;
  border-radius: var(--radius-lg);
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
}

.no-more-data {
  text-align: center;
  padding: 16px;
  color: var(--text-tertiary);
  font-size: 13px;
  background-color: transparent;
}

.no-more-data::before,
.no-more-data::after {
  content: '';
  display: inline-block;
  width: 20px;
  height: 1px;
  background-color: var(--border-color);
  vertical-align: middle;
  margin: 0 8px;
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
</style>