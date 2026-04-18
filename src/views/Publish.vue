<template>
  <div class="publish-container">
    <div class="page-header header-fixed">
      <router-link to="/home" class="back-btn">
        <span class="back-icon">←</span>
      </router-link>
      <h1 class="title">发布博客</h1>
      <div class="placeholder"></div>
    </div>
    
    <div class="page-content header-safe-area">
      <div class="publish-form">
        <div class="form-section card">
          <div class="form-title">博客标题</div>
          <input 
            type="text" 
            class="title-input" 
            placeholder="请输入博客标题"
            v-model="title"
            maxlength="50"
          />
          <div class="char-count">{{ title.length }}/50</div>
        </div>
        
        <div class="form-section card">
          <div class="form-title">选择商铺</div>
          <div class="shop-select" @click="toggleShopSelector">
            <span class="placeholder-text" v-if="!selectedShop">点击选择商铺（可选）</span>
            <span class="selected-text" v-else>{{ selectedShop.name }}</span>
            <span class="arrow-icon" :class="{ open: showShopSelector }">›</span>
          </div>
          
          <div class="shop-selector" v-if="showShopSelector">
            <div class="search-input-wrapper">
              <span class="search-icon">🔍</span>
              <input 
                type="text" 
                class="search-input" 
                placeholder="搜索商铺..."
                v-model="shopSearchKeyword"
                @input="searchShops"
              />
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
                加载中...
              </div>
              
              <div class="empty" v-else-if="shops.length === 0 && !loadingShops">
                暂无商铺
              </div>
            </div>
            
            <div class="selector-footer">
              <button class="btn btn-secondary" @click="clearShopSelection">取消选择</button>
              <button class="btn btn-primary" @click="confirmShopSelection">确定</button>
            </div>
          </div>
        </div>
        
        <div class="form-section card">
          <div class="form-title">上传图片</div>
          <div class="upload-area">
            <div class="upload-item" v-for="(img, index) in images" :key="index">
              <img :src="img" alt="图片" />
              <span class="delete-btn" @click="removeImage(index)">×</span>
            </div>
            <div class="upload-btn" v-if="images.length < 9" @click="uploadImage">
              <span class="plus-icon">+</span>
              <span class="upload-text">上传图片</span>
            </div>
          </div>
          <div class="upload-tip">最多上传9张图片</div>
        </div>
        
        <div class="form-section card">
          <div class="form-title">博客内容</div>
          <textarea 
            class="content-input" 
            placeholder="分享你的体验，帮助其他用户做出选择..."
            v-model="content"
            maxlength="1000"
          ></textarea>
          <div class="char-count">{{ content.length }}/1000</div>
        </div>
        
        <button 
          class="btn btn-primary submit-btn" 
          @click="submitBlog"
          :disabled="submitting"
        >
          {{ submitting ? '发布中...' : '发布' }}
        </button>
      </div>
    </div>
    
    <BottomNav />
    
    <div class="toast" :class="{ show: showToast }">
      {{ toastMessage }}
    </div>
    
    <div class="mask" v-if="showShopSelector" @click="toggleShopSelector"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { blogApi, shopApi, userApi } from '../api'
import BottomNav from '../components/BottomNav.vue'

const router = useRouter()

const title = ref('')
const content = ref('')
const images = ref([])
const selectedShop = ref(null)
const showShopSelector = ref(false)
const shops = ref([])
const shopSearchKeyword = ref('')
const loadingShops = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const submitting = ref(false)
const currentUser = ref(null)

const showToastMsg = (message) => {
  toastMessage.value = message
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
      showToastMsg(res.errorMsg || '加载商铺失败')
    }
  } catch (error) {
    showToastMsg(error.message || '加载商铺失败，请稍后重试')
  } finally {
    loadingShops.value = false
  }
}

const searchShops = () => {
  fetchShops()
}

const toggleShopSelector = () => {
  showShopSelector.value = !showShopSelector.value
  if (showShopSelector.value && shops.value.length === 0) {
    fetchShops()
  }
}

const selectShop = (shop) => {
  selectedShop.value = shop
}

const clearShopSelection = () => {
  selectedShop.value = null
  showShopSelector.value = false
}

const confirmShopSelection = () => {
  showShopSelector.value = false
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

const removeImage = (index) => {
  images.value.splice(index, 1)
}

const submitBlog = async () => {
  if (!title.value.trim()) {
    showToastMsg('请输入博客标题')
    return
  }
  
  if (!content.value.trim()) {
    showToastMsg('请输入博客内容')
    return
  }
  
  if (!currentUser.value) {
    showToastMsg('请先登录')
    return
  }
  
  submitting.value = true
  
  try {
    const blogData = {
      userId: currentUser.value.id,
      title: title.value.trim(),
      content: content.value.trim()
    }
    
    if (selectedShop.value) {
      blogData.shopId = selectedShop.value.id
    }
    
    if (images.value.length > 0) {
      blogData.images = images.value.join(',')
    }
    
    const res = await blogApi.createBlog(blogData)
    
    if (res.success) {
      showToastMsg('发布成功')
      setTimeout(() => {
        title.value = ''
        content.value = ''
        images.value = []
        selectedShop.value = null
        router.push('/home')
      }, 1500)
    } else {
      showToastMsg(res.errorMsg || '发布失败')
    }
  } catch (error) {
    showToastMsg(error.message || '发布失败，请稍后重试')
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
  padding: 16px;
}

.form-section {
  margin-bottom: 12px;
}

.form-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.title-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 15px;
  background-color: var(--background-primary);
  transition: all var(--transition-fast);
}

.title-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.shop-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background-color: var(--background-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
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
}

.arrow-icon {
  color: var(--text-tertiary);
  font-size: 18px;
  transition: transform var(--transition-fast);
}

.arrow-icon.open {
  transform: rotate(90deg);
}

.shop-selector {
  margin-top: 12px;
  background-color: var(--background-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
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
  max-height: 300px;
  overflow-y: auto;
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
}

.selector-footer {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-light);
}

.selector-footer .btn {
  flex: 1;
  padding: 12px;
  font-size: 14px;
}

.upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.upload-item {
  width: 80px;
  height: 80px;
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
  width: 20px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.6);
  color: var(--background-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.delete-btn:active {
  transform: scale(0.9);
}

.upload-btn {
  width: 80px;
  height: 80px;
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
  margin-top: 8px;
}

.content-input {
  width: 100%;
  height: 150px;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  resize: none;
  background-color: var(--background-primary);
  transition: all var(--transition-fast);
  line-height: 1.6;
}

.content-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 8px;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 8px;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 24px;
  color: var(--text-tertiary);
  font-size: 14px;
}

.empty {
  text-align: center;
  padding: 24px;
  color: var(--text-tertiary);
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