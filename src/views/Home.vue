<template>
  <div class="home-container">
    <div class="home-header header-fixed">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="搜索商铺、美食、景点" v-model="searchKeyword" />
      </div>
    </div>
    
    <div class="page-content header-safe-area">
      <div class="shop-types-section">
        <div class="section-header">
          <h3 class="section-title">商铺分类</h3>
        </div>
        
        <div class="shop-types-grid" v-if="shopTypes.length > 0">
          <div 
            class="shop-type-item" 
            v-for="type in shopTypes" 
            :key="type.id"
            @click="goToShopList(type.id)"
          >
            <div class="type-icon">
              {{ getTypeIcon(type.name) }}
            </div>
            <span class="type-name">{{ type.name }}</span>
          </div>
        </div>
        
        <div class="loading" v-else-if="loadingTypes">
          加载中...
        </div>
        
        <div class="empty" v-else>
          暂无分类
        </div>
      </div>
      
      <div class="shops-section">
        <div class="section-header">
          <h3 class="section-title">推荐商铺</h3>
          <span class="see-more" @click="goToShopList()">更多 ></span>
        </div>
        
        <div class="shops-list" v-if="shops.length > 0">
          <div class="shop-item" v-for="shop in shops" :key="shop.id">
            <div class="shop-image">
              <img :src="getShopImage(shop)" :alt="shop.name" />
            </div>
            <div class="shop-info">
              <h4 class="shop-name">{{ shop.name }}</h4>
              <div class="shop-meta">
                <span class="shop-score">
                  ★ {{ formatScore(shop.score) }}
                </span>
                <span class="shop-avg-price">
                  ¥{{ shop.avgPrice || 0 }}/人
                </span>
              </div>
              <div class="shop-location">
                <span class="location-icon">📍</span>
                <span class="shop-area">{{ shop.area || '商圈' }}</span>
                <span class="shop-distance" v-if="shop.distance">
                  {{ shop.distance }}km
                </span>
              </div>
              <div class="shop-tags" v-if="shop.shopType">
                <span class="tag">{{ shop.shopType.name }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="loading" v-else-if="loadingShops">
          加载中...
        </div>
        
        <div class="empty" v-else>
          <span class="empty-icon">🏪</span>
          <span class="empty-text">暂无商铺</span>
        </div>
        
        <div class="no-more-data" v-if="shops.length > 0 && !loadingShops">
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { shopApi, shopTypeApi } from '../api'
import BottomNav from '../components/BottomNav.vue'

const router = useRouter()

const searchKeyword = ref('')
const shopTypes = ref([])
const shops = ref([])
const loadingTypes = ref(false)
const loadingShops = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

const showToastMsg = (message) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

const getTypeIcon = (name) => {
  const iconMap = {
    '美食': '🍜',
    '娱乐': '🎮',
    '酒店': '🏨',
    '丽人': '💄',
    '休闲娱乐': '🎡',
    'KTV': '🎤',
    '酒吧': '🍺',
    '按摩/足疗': '💆',
    '洗浴/汗蒸': '🛁',
    '健身': '🏋️',
    '瑜伽': '🧘',
    '美甲': '💅',
    '美发': '💇',
    '美容/SPA': '💆‍♀️',
    '宠物': '🐱',
    '亲子': '👶',
    '学习培训': '📚',
    '生活服务': '🔧',
    '医疗健康': '🏥',
    '电影': '🎬',
    '演出': '🎭',
    '展览': '🖼️'
  }
  return iconMap[name] || '🏪'
}

const getShopImage = (shop) => {
  if (shop.images) {
    const imageList = shop.images.split(',')
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

const fetchShopTypes = async () => {
  loadingTypes.value = true
  try {
    const res = await shopTypeApi.getAllShopTypes()
    if (res.success) {
      shopTypes.value = res.data || []
    } else {
      showToastMsg(res.errorMsg || '加载分类失败')
    }
  } catch (error) {
    showToastMsg(error.message || '加载分类失败，请稍后重试')
  } finally {
    loadingTypes.value = false
  }
}

const fetchShops = async () => {
  loadingShops.value = true
  try {
    const res = await shopApi.getShopList({ current: 1, size: 10 })
    if (res.success) {
      shops.value = res.data || []
    } else {
      showToastMsg(res.errorMsg || '加载商铺失败')
    }
  } catch (error) {
    showToastMsg(error.message || '加载商铺失败，请稍后重试')
  } finally {
    loadingShops.value = false
  }
}

const goToShopList = (typeId) => {
  if (typeId) {
    router.push(`/shop-list/${typeId}`)
  } else {
    router.push('/shop-list/0')
  }
}

onMounted(() => {
  fetchShopTypes()
  fetchShops()
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: var(--background-secondary);
  padding-bottom: 60px;
}

.home-header {
  background: linear-gradient(135deg, #4a90e2 0%, #6bb3f0 100%);
  padding: 16px;
  padding-top: calc(16px + env(safe-area-inset-top));
  box-shadow: var(--shadow-md);
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: var(--background-primary);
  border-radius: var(--radius-full);
  padding: 10px 16px;
  box-shadow: var(--shadow-sm);
}

.search-icon {
  font-size: 18px;
  margin-right: 8px;
}

.search-bar input {
  flex: 1;
  border: none;
  font-size: 14px;
  color: var(--text-primary);
  background-color: transparent;
}

.search-bar input::placeholder {
  color: var(--text-tertiary);
}

.page-content {
  padding-bottom: 70px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  padding-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.see-more {
  font-size: 13px;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.see-more:hover {
  color: var(--primary-color);
}

.shop-types-section {
  background-color: var(--background-primary);
  margin-bottom: 8px;
  border-radius: var(--radius-xl);
  margin: 12px;
  box-shadow: var(--shadow-sm);
}

.shop-types-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0;
  padding: 0 8px 16px;
}

.shop-type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.shop-type-item:active {
  transform: scale(0.95);
}

.type-icon {
  width: 48px;
  height: 48px;
  background-color: var(--primary-light);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 6px;
}

.type-name {
  font-size: 12px;
  color: var(--text-primary);
  text-align: center;
}

.shops-section {
  background-color: var(--background-primary);
  border-radius: var(--radius-xl);
  margin: 12px;
  box-shadow: var(--shadow-sm);
}

.shops-list {
  padding: 0 16px;
}

.shop-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.shop-item:active {
  background-color: var(--background-secondary);
}

.shop-item:last-child {
  border-bottom: none;
}

.shop-image {
  width: 120px;
  height: 90px;
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

.shop-info {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
  margin-bottom: 4px;
}

.shop-score {
  font-size: 13px;
  color: var(--primary-color);
  margin-right: 12px;
}

.shop-avg-price {
  font-size: 13px;
  color: var(--text-secondary);
}

.shop-location {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.location-icon {
  margin-right: 4px;
}

.shop-area {
  margin-right: 8px;
}

.shop-tags {
  display: flex;
  gap: 6px;
}

.tag {
  font-size: 11px;
  color: var(--primary-color);
  background-color: var(--primary-light);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.loading {
  text-align: center;
  padding: 20px;
  color: var(--text-tertiary);
  font-size: 14px;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--text-tertiary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
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
