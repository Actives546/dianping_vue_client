<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="user-info">
        <div class="user-avatar">
          <img :src="userInfo.icon || defaultAvatar" :alt="userInfo.nickName" />
        </div>
        <div class="user-detail">
          <h2 class="user-name">{{ userInfo.nickName || '用户' }}</h2>
          <p class="user-phone">{{ maskedPhone }}</p>
        </div>
        <div class="edit-btn" @click="goToEdit">
          <span class="edit-icon">⚙️</span>
        </div>
      </div>
      
      <div class="user-stats">
        <div class="stat-item">
          <span class="stat-value">{{ stats.blogs }}</span>
          <span class="stat-label">博客</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.followers }}</span>
          <span class="stat-label">粉丝</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.following }}</span>
          <span class="stat-label">关注</span>
        </div>
      </div>
    </div>
    
    <div class="profile-content">
      <div class="menu-section">
        <div class="menu-item" @click="showToast('我的收藏')">
          <span class="menu-icon">⭐</span>
          <span class="menu-text">我的收藏</span>
          <span class="menu-arrow">›</span>
        </div>
        <div class="menu-item" @click="showToast('浏览历史')">
          <span class="menu-icon">📜</span>
          <span class="menu-text">浏览历史</span>
          <span class="menu-arrow">›</span>
        </div>
        <div class="menu-item" @click="showToast('我的订单')">
          <span class="menu-icon">📋</span>
          <span class="menu-text">我的订单</span>
          <span class="menu-arrow">›</span>
        </div>
      </div>
      
      <div class="menu-section">
        <div class="menu-item" @click="showToast('帮助中心')">
          <span class="menu-icon">❓</span>
          <span class="menu-text">帮助中心</span>
          <span class="menu-arrow">›</span>
        </div>
        <div class="menu-item" @click="showToast('关于我们')">
          <span class="menu-icon">ℹ️</span>
          <span class="menu-text">关于我们</span>
          <span class="menu-arrow">›</span>
        </div>
        <div class="menu-item" @click="showToast('意见反馈')">
          <span class="menu-icon">📝</span>
          <span class="menu-text">意见反馈</span>
          <span class="menu-arrow">›</span>
        </div>
      </div>
      
      <button class="logout-btn" @click="handleLogout">
        退出登录
      </button>
    </div>
    
    <BottomNav />
    
    <div class="toast" :class="{ show: showToastFlag }">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '../api'
import { getToken, removeToken } from '../utils/auth'
import BottomNav from '../components/BottomNav.vue'

const router = useRouter()

const userInfo = ref({
  id: null,
  nickName: '',
  icon: '',
  phone: ''
})

const stats = ref({
  blogs: 0,
  followers: 0,
  following: 0
})

const showToastFlag = ref(false)
const toastMessage = ref('')

const defaultAvatar = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=default%20user%20avatar%20simple%20circle&image_size=square_hd'

const maskedPhone = computed(() => {
  if (userInfo.value.phone) {
    return userInfo.value.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }
  return '未绑定手机号'
})

const showToast = (message) => {
  toastMessage.value = message
  showToastFlag.value = true
  setTimeout(() => {
    showToastFlag.value = false
  }, 2000)
}

const fetchUserInfo = async () => {
  if (!getToken()) {
    router.push('/login')
    return
  }
  
  try {
    const res = await userApi.getCurrentUser()
    if (res.success && res.data) {
      userInfo.value = {
        ...userInfo.value,
        ...res.data
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const goToEdit = () => {
  showToast('编辑资料')
}

const handleLogout = async () => {
  try {
    await userApi.logout()
  } catch (error) {
    console.error('退出登录失败:', error)
  }
  
  removeToken()
  showToast('已退出登录')
  setTimeout(() => {
    router.push('/login')
  }, 1000)
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 60px;
}

.profile-header {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%);
  padding: 20px;
  padding-top: calc(20px + env(safe-area-inset-top));
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.user-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-detail {
  flex: 1;
  margin-left: 16px;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.user-phone {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.edit-btn {
  width: 36px;
  height: 36px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.edit-icon {
  font-size: 18px;
}

.user-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.stat-divider {
  width: 1px;
  height: 30px;
  background-color: rgba(255, 255, 255, 0.3);
}

.profile-content {
  padding: 12px;
}

.menu-section {
  background-color: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 20px;
  margin-right: 12px;
}

.menu-text {
  flex: 1;
  font-size: 15px;
  color: #333;
}

.menu-arrow {
  font-size: 18px;
  color: #ccc;
}

.logout-btn {
  width: 100%;
  padding: 14px;
  background-color: #fff;
  color: #ff4757;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  margin-top: 12px;
  cursor: pointer;
  border: 1px solid #ff4757;
  transition: all 0.3s;
}

.logout-btn:hover {
  background-color: #fff5f5;
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
