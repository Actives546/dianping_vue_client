<template>
  <div class="publish-container">
    <div class="page-header header-fixed">
      <router-link to="/home" class="back-btn">
        <span class="back-icon">←</span>
      </router-link>
      <h1 class="title">发布点评</h1>
      <div class="placeholder"></div>
    </div>
    
    <div class="page-content header-safe-area">
      <div class="publish-form">
        <div class="form-section card shop-section">
          <div class="form-title">
            <span class="required-star">*</span>选择商铺
          </div>
          <div class="shop-select" :class="{ error: shopError }" @click="toggleShopSelector">
            <span class="placeholder-text" v-if="!selectedShop">请选择商铺（必填）</span>
            <span class="selected-text" v-else>{{ selectedShop.name }}</span>
            <span class="arrow-icon" :class="{ open: showShopSelector }">›</span>
          </div>
          <div class="error-tip" v-if="shopError">{{ shopError }}</div>
          
          <div class="shop-selector" v-if="showShopSelector">
            <div class="selector-header">
              <span class="selector-title">选择商铺</span>
              <span class="close-btn" @click="toggleShopSelector">×</span>
            </div>
            
            <div class="search-wrapper">
              <div class="search-input-box">
                <span class="search-icon">🔍</span>
                <input 
                  type="text" 
                  class="search-input" 
                  placeholder="搜索商铺名称..."
                  v-model="shopSearchKeyword"
                  @input="debounceSearch"
                />
              </div>
            </div>
            
            <div class="shop-list">
              <div 
                class="shop-option" 
                v-for="shop in shops" 
                :key="shop.id"
                :class="{ selected: selectedShop?.id === shop.id }"
                @click="selectShop(shop)"
              >
                <div class="shop-option-image">
                  <img :src="getShopImage(shop)" :alt="shop.name" />
                </div>
                <div class="shop-option-info">
                  <div class="shop-option-name">{{ shop.name }}</div>
                  <div class="shop-option-meta">
                    <span class="shop-option-score">★ {{ formatScore(shop.score) }}</span>
                    <span class="shop-option-area">{{ shop.area || '商圈' }}</span>
                  </div>
                </div>
                <span class="check-icon" v-if="selectedShop?.id === shop.id">✓</span>
              </div>
              
              <div class="loading" v-if="loadingShops">
                <span class="loading-spinner"></span>
                搜索中...
              </div>
              
              <div class="empty" v-else-if="shops.length === 0 && !loadingShops">
                <span class="empty-icon">🏪</span>
                <span class="empty-text">暂无相关商铺</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-section card rating-section">
          <div class="form-title">
            <span class="required-star">*</span>评分
          </div>
          <div class="rating-container">
            <div class="rating-stars">
              <span 
                class="star" 
                v-for="i in 5" 
                :key="i"
                :class="{ active: i <= rating }"
                @click="rating = i"
              >
                ★
              </span>
            </div>
            <span class="rating-label">{{ ratingText }}</span>
          </div>
        </div>
        
        <div class="form-section card images-section">
          <div class="form-title">上传图片</div>
          <div class="upload-area">
            <div class="upload-item" v-for="(img, index) in images" :key="index">
              <img :src="img" alt="图片" />
              <span class="delete-btn" @click.stop="removeImage(index)">×</span>
            </div>
            <div class="upload-btn" v-if="images.length < 9" @click="uploadImage">
              <span class="plus-icon">+</span>
              <span class="upload-text">添加图片</span>
            </div>
          </div>
          <div class="upload-tip">最多上传9张图片</div>
        </div>
        
        <div class="form-section card content-section">
          <div class="form-title">
            <span class="required-star">*</span>点评内容
          </div>
          <textarea 
            class="content-input" 
            placeholder="分享你的消费体验，帮助更多小伙伴做出选择..."
            v-model="content"
            maxlength="1000"
          ></textarea>
          <div class="char-count">
            <span :class="{ 'over-limit': content.length > 1000 }">{{ content.length }}</span>/1000
          </div>
        </div>
        
        <div class="submit-section">
          <button 
            class="btn btn-primary submit-btn" 
            @click="submitBlog"
            :disabled="submitting"
          >
            <template v-if="submitting">
              <span class="btn-spinner"></span>
              发布中...
            </template>
            <template v-else>
              立即发布
            </template>
          </button>
        </div>
      </div>
    </div>
    
    <BottomNav />
    
    <div class="mask" v-if="showShopSelector" @click="toggleShopSelector"></div>
    
    <div class="toast" :class="{ show: showToast, success: toastType === 'success', error: toastType === 'error' }">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { blogApi, shopApi, userApi } from '../api'
import BottomNav from '../components/BottomNav.vue'

const router = useRouter()

const title = ref('')
const content = ref('')
const images = ref([])
const selectedShop = ref(null)
const shopError = ref('')
const showShopSelector = ref(false)
const shops = ref([])
const shopSearchKeyword = ref('')
const loadingShops = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('')
const submitting = ref(false)
const currentUser = ref(null)

let searchTimer = null

const ratingText = computed(() => {
  const texts = ['', '很差', '较差', '一般', '满意', '非常满意']
  return texts[rating.value] || ''
})

const showToastMsg = (message, type = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
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

const fetchCurrentUser = async () => {
  try {
    const res = await userApi.getCurrentUser()
    if (res.success) {
      currentUser.value = res.data
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const fetchShops = async () => {
  if (loadingShops.value) return
  
  loadingShops.value = true
  
  try {
    const params = { current: 1, size: 20 }
    if (shopSearchKeyword.value.trim()) {
      params.name = shopSearchKeyword.value.trim()
    }
    
    const res = await shopApi.getShopList(params)
    
    if (res.success) {
      shops.value = res.data || []
    } else {
      console.error('加载商铺失败:', res.errorMsg)
    }
  } catch (error) {
    console.error('加载商铺失败:', error)
  } finally {
    loadingShops.value = false
  }
}

const debounceSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    fetchShops()
  }, 300)
}

const toggleShopSelector = () => {
  showShopSelector.value = !showShopSelector.value
  if (showShopSelector.value) {
    shopError.value = ''
    if (shops.value.length === 0) {
      fetchShops()
    }
  }
}

const selectShop = (shop) => {
  selectedShop.value = shop
  shopError.value = ''
  showShopSelector.value = false
}

const removeImage = (index) => {
  images.value.splice(index, 1)
}

const uploadImage = () => {
  const sampleImages = [
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=delicious%20food%20restaurant%20dish&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=restaurant%20interior%20modern%20design&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20food%20presentation&image_size=square_hd'
  ]
  if (images.value.length < 9) {
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)]
    images.value.push(randomImage)
  }
}

const submitBlog = async () => {
  shopError.value = ''
  
  if (!selectedShop.value) {
    shopError.value = '请选择商铺'
    showToastMsg('请选择商铺', 'error')
    return
  }
  
  if (!rating.value) {
    showToastMsg('请选择评分', 'error')
    return
  }
  
  if (!content.value.trim()) {
    showToastMsg('请输入点评内容', 'error')
    return
  }
  
  if (!currentUser.value) {
    showToastMsg('请先登录', 'error')
    return
  }
  
  submitting.value = true
  
  try {
    const blogData = {
      userId: currentUser.value.id,
      shopId: selectedShop.value.id,
      title: `${selectedShop.value.name}点评`,
      content: content.value.trim()
    }
    
    if (images.value.length > 0) {
      blogData.images = images.value.join(',')
    }
    
    const res = await blogApi.createBlog(blogData)
    
    if (res.success) {
      showToastMsg('发布成功', 'success')
      setTimeout(() => {
        title.value = ''
        content.value = ''
        images.value = []
        selectedShop.value = null
        rating.value = 0
        router.push('/blog-list')
      }, 1500)
    } else {
      showToastMsg(res.errorMsg || '发布失败', 'error')
    }
  } catch (error) {
    showToastMsg(error.message || '发布失败，请稍后重试', 'error')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchCurrentUser()
})
</script>

<style scoped>
.publish-container {
  min-height: 100vh;
  background-color: var(--background-secondary);
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
  padding-bottom: 80px;
}

.publish-form {
  padding: 12px;
}

.form-section {
  margin-bottom: 12px;
}

.form-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.required-star {
  color: var(--error-color);
  margin-right: 4px;
}

.shop-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background-color: var(--background-secondary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.shop-select.error {
  border-color: var(--error-color);
  background-color: #fff5f5;
}

.shop-select:active {
  background-color: var(--border-light);
}

.placeholder-text {
  color: var(--text-tertiary);
  font-size: 14px;
}

.selected-text {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.arrow-icon {
  color: var(--text-tertiary);
  font-size: 18px;
  transition: transform var(--transition-fast);
}

.arrow-icon.open {
  transform: rotate(90deg);
}

.error-tip {
  font-size: 12px;
  color: var(--error-color);
  margin-top: 6px;
}

.shop-selector {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 400px;
  max-height: 70vh;
  background-color: var(--background-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  z-index: 999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.selector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border-light);
}

.selector-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: var(--background-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-btn:active {
  background-color: var(--border-light);
}

.search-wrapper {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
}

.search-input-box {
  display: flex;
  align-items: center;
  background-color: var(--background-secondary);
  border-radius: var(--radius-full);
  padding: 10px 16px;
}

.search-icon {
  font-size: 16px;
  margin-right: 8px;
  color: var(--text-tertiary);
}

.search-input {
  flex: 1;
  border: none;
  font-size: 14px;
  background-color: transparent;
}

.shop-list {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.shop-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  border-bottom: 1px solid var(--border-light);
}

.shop-option:active {
  background-color: var(--background-secondary);
}

.shop-option.selected {
  background-color: var(--primary-light);
}

.shop-option:last-child {
  border-bottom: none;
}

.shop-option-image {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  background-color: var(--background-secondary);
}

.shop-option-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shop-option-info {
  flex: 1;
  margin-left: 12px;
  min-width: 0;
}

.shop-option-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shop-option-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}

.shop-option-score {
  color: var(--primary-color);
}

.shop-option-area {
  color: var(--text-tertiary);
}

.check-icon {
  color: var(--primary-color);
  font-size: 18px;
  font-weight: bold;
  margin-left: 8px;
}

.rating-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-stars {
  display: flex;
  gap: 4px;
}

.star {
  font-size: 32px;
  color: #ddd;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.star.active {
  color: #ffc107;
  transform: scale(1.1);
}

.star:hover {
  transform: scale(1.15);
}

.rating-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.images-section .upload-area {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.upload-item {
  aspect-ratio: 1;
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.upload-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.delete-btn:active {
  transform: scale(0.9);
}

.upload-btn {
  aspect-ratio: 1;
  background-color: var(--background-secondary);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px dashed var(--border-color);
  transition: all var(--transition-fast);
}

.upload-btn:active {
  background-color: var(--border-light);
  border-color: var(--primary-color);
}

.plus-icon {
  font-size: 28px;
  color: var(--text-tertiary);
  margin-bottom: 2px;
  line-height: 1;
}

.upload-text {
  font-size: 12px;
  color: var(--text-tertiary);
}

.upload-tip {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 10px;
}

.content-section .content-input {
  width: 100%;
  height: 160px;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 14px;
  resize: none;
  background-color: var(--background-primary);
  transition: all var(--transition-fast);
  line-height: 1.6;
}

.content-section .content-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.content-section .char-count {
  text-align: right;
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 8px;
}

.content-section .char-count .over-limit {
  color: var(--error-color);
}

.submit-section {
  padding: 8px 0;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--radius-full);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
  box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--text-tertiary);
  font-size: 14px;
  gap: 12px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-light);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
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
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
}

.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.9);
  background-color: rgba(0, 0, 0, 0.85);
  color: var(--background-primary);
  padding: 14px 28px;
  border-radius: var(--radius-lg);
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

.toast.success {
  background-color: rgba(82, 196, 26, 0.95);
}

.toast.error {
  background-color: rgba(255, 71, 87, 0.95);
}
</style>