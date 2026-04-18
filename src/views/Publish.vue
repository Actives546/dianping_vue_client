<template>
  <div class="publish-container">
    <div class="page-header">
      <router-link to="/home" class="back-btn">
        <span class="back-icon">←</span>
      </router-link>
      <h1 class="title">发布博客</h1>
      <div class="placeholder"></div>
    </div>
    
    <div class="page-content">
      <div class="publish-form">
        <div class="form-section">
          <div class="form-title">选择商铺</div>
          <div class="shop-select" @click="showShopSelector = true">
            <span class="placeholder-text" v-if="!selectedShop">点击选择商铺</span>
            <span class="selected-text" v-else>{{ selectedShop.name }}</span>
            <span class="arrow-icon">›</span>
          </div>
        </div>
        
        <div class="form-section">
          <div class="form-title">评分</div>
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
        </div>
        
        <div class="form-section">
          <div class="form-title">上传图片</div>
          <div class="upload-area">
            <div class="upload-item" v-for="(img, index) in images" :key="index">
              <img :src="img" alt="图片" />
              <span class="delete-btn" @click="images.splice(index, 1)">×</span>
            </div>
            <div class="upload-btn" v-if="images.length < 9" @click="uploadImage">
              <span class="plus-icon">+</span>
              <span class="upload-text">上传图片</span>
            </div>
          </div>
          <div class="upload-tip">最多上传9张图片</div>
        </div>
        
        <div class="form-section">
          <div class="form-title">内容</div>
          <textarea 
            class="content-input" 
            placeholder="分享你的体验，帮助其他用户做出选择..."
            v-model="content"
            maxlength="500"
          ></textarea>
          <div class="char-count">{{ content.length }}/500</div>
        </div>
        
        <button class="submit-btn" @click="submitBlog">发布</button>
      </div>
    </div>
    
    <BottomNav />
    
    <div class="toast" :class="{ show: showToast }">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import BottomNav from '../components/BottomNav.vue'

export default {
  name: 'Publish',
  components: {
    BottomNav
  },
  setup() {
    const selectedShop = ref(null)
    const rating = ref(0)
    const images = ref([])
    const content = ref('')
    const showToast = ref(false)
    const toastMessage = ref('')
    const showShopSelector = ref(false)
    
    const showToastMessage = (message) => {
      toastMessage.value = message
      showToast.value = true
      setTimeout(() => {
        showToast.value = false
      }, 2000)
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
    
    const submitBlog = () => {
      if (!selectedShop.value) {
        showToastMessage('请选择商铺')
        return
      }
      if (rating.value === 0) {
        showToastMessage('请选择评分')
        return
      }
      if (!content.value.trim()) {
        showToastMessage('请输入内容')
        return
      }
      
      showToastMessage('发布成功')
      setTimeout(() => {
        selectedShop.value = null
        rating.value = 0
        images.value = []
        content.value = ''
      }, 1500)
    }
    
    return {
      selectedShop,
      rating,
      images,
      content,
      showToast,
      toastMessage,
      showShopSelector,
      uploadImage,
      submitBlog
    }
  }
}
</script>

<style scoped>
.publish-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  padding-top: calc(16px + env(safe-area-inset-top));
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.back-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #333;
}

.title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.placeholder {
  width: 32px;
}

.page-content {
  padding-bottom: 70px;
}

.publish-form {
  padding: 16px;
}

.form-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.form-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.shop-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background-color: #f8f8f8;
  border-radius: 8px;
  cursor: pointer;
}

.placeholder-text {
  color: #999;
  font-size: 14px;
}

.selected-text {
  color: #333;
  font-size: 14px;
}

.arrow-icon {
  color: #999;
  font-size: 18px;
}

.rating-stars {
  display: flex;
  gap: 8px;
}

.star {
  font-size: 28px;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s;
}

.star.active {
  color: #ffc107;
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
  border-radius: 8px;
  overflow: hidden;
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
  width: 18px;
  height: 18px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
}

.upload-btn {
  width: 80px;
  height: 80px;
  background-color: #f8f8f8;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px dashed #ddd;
}

.plus-icon {
  font-size: 24px;
  color: #999;
  margin-bottom: 4px;
}

.upload-text {
  font-size: 12px;
  color: #999;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.content-input {
  width: 100%;
  height: 120px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  resize: none;
  background-color: #fafafa;
}

.content-input:focus {
  border-color: #ff6b35;
  outline: none;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background-color: #ff6b35;
  color: #fff;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #e55a2b;
}

.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}

.toast.show {
  opacity: 1;
}
</style>
