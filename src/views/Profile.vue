<template>
  <div class="profile-container">
    <div class="profile-header header-fixed">
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
    
    <div class="profile-content header-safe-area">
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
  background-color: var(--background-secondary);
  padding-bottom: 60px;
}

.profile-header {
  background: linear-gradient(135deg, #4a90e2 0%, #6bb3f0 100%);
  padding: 20px;
  padding-top: calc(20px + env(safe-area-inset-top));
  box-shadow: var(--shadow-md);
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.user-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.4);
  box-shadow: var(--shadow-sm);
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
  font-size: 20px;
  font-weight: 600;
  color: var(--background-primary);
  margin-bottom: 4px;
}

.user-phone {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

.edit-btn {
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.edit-btn:active {
  background-color: rgba(255, 255, 255, 0.35);
}

.edit-icon {
  font-size: 20px;
}

.user-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  padding: 16px 0;
  backdrop-filter: blur(4px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform var(--transition-fast);
}

.stat-item:active {
  transform: scale(0.95);
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: var(--background-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.stat-divider {
  width: 1px;
  height: 36px;
  background-color: rgba(255, 255, 255, 0.3);
}

.profile-content {
  padding: 12px;
}

.menu-section {
  background-color: var(--background-primary);
  border-radius: var(--radius-xl);
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.menu-item:active {
  background-color: var(--background-secondary);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 22px;
  margin-right: 12px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-text {
  flex: 1;
  font-size: 15px;
  color: var(--text-primary);
  font-weight: 500;
}

.menu-arrow {
  font-size: 18px;
  color: var(--text-tertiary);
}

.logout-btn {
  width: 100%;
  padding: 14px;
  background-color: var(--background-primary);
  color: var(--error-color);
  border-radius: var(--radius-xl);
  font-size: 15px;
  font-weight: 600;
  margin-top: 12px;
  cursor: pointer;
  border: 1px solid var(--error-color);
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.logout-btn:active {
  background-color: #fff5f5;
  transform: scale(0.98);
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
