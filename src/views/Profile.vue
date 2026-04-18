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
        <div class="stat-item" @click="switchTab('notes')">
          <span class="stat-value">{{ stats.notes }}</span>
          <span class="stat-label">笔记</span>
        </div>
        <div class="stat-item" @click="switchTab('reviews')">
          <span class="stat-value">{{ stats.reviews }}</span>
          <span class="stat-label">评价</span>
        </div>
        <div class="stat-item" @click="switchTab('followers')">
          <span class="stat-value">{{ stats.followers }}</span>
          <span class="stat-label">粉丝</span>
        </div>
        <div class="stat-item" @click="switchTab('following')">
          <span class="stat-value">{{ stats.following }}</span>
          <span class="stat-label">关注</span>
        </div>
      </div>
    </div>
    
    <div class="profile-content header-safe-area">
      <div class="tab-content">
        <div class="tab-header">
          <div 
            v-for="(tab, index) in tabList" 
            :key="tab.value"
            class="tab-item"
            :class="{ active: activeTab === tab.value }"
            @click="switchTab(tab.value)"
          >
            {{ tab.label }}
            <div class="tab-indicator" v-if="activeTab === tab.value"></div>
          </div>
        </div>
        
        <div class="tab-body">
          <div v-if="loading" class="loading-state">
            加载中...
          </div>
          
          <div v-else-if="activeTab === 'notes'">
            <div v-if="notesList.length > 0" class="note-list">
              <div class="note-item" v-for="note in notesList" :key="note.id">
                <div class="note-header">
                  <img class="note-avatar" :src="userInfo.icon || defaultAvatar" :alt="userInfo.nickName" />
                  <div class="note-user-info">
                    <span class="note-username">{{ userInfo.nickName || '用户' }}</span>
                    <span class="note-time">{{ formatTime(note.createTime) }}</span>
                  </div>
                </div>
                <div class="note-content">{{ note.content }}</div>
                <div class="note-images" v-if="note.images && note.images.length > 0">
                  <img 
                    v-for="(img, idx) in note.images.slice(0, 9)" 
                    :key="idx" 
                    class="note-image" 
                    :src="img" 
                    :alt="'笔记图片' + (idx + 1)" 
                  />
                </div>
                <div class="note-stats">
                  <span class="stat">💬 {{ note.comments || 0 }}</span>
                  <span class="stat">❤️ {{ note.likes || 0 }}</span>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <span class="empty-icon">📝</span>
              <span class="empty-text">暂无笔记</span>
              <span class="empty-hint">快去发布你的第一篇笔记吧</span>
            </div>
          </div>
          
          <div v-else-if="activeTab === 'reviews'">
            <div v-if="reviewsList.length > 0" class="review-list">
              <div class="review-item" v-for="review in reviewsList" :key="review.id">
                <div class="review-header">
                  <div class="review-shop-name">{{ review.shopName || '商铺' }}</div>
                  <div class="review-score">
                    <span class="stars" v-for="n in 5" :key="n">
                      {{ n <= (review.score || 0) ? '★' : '☆' }}
                    </span>
                  </div>
                </div>
                <div class="review-content">{{ review.content }}</div>
                <div class="review-images" v-if="review.images && review.images.length > 0">
                  <img 
                    v-for="(img, idx) in review.images.slice(0, 3)" 
                    :key="idx" 
                    class="review-image" 
                    :src="img" 
                    :alt="'评价图片' + (idx + 1)" 
                  />
                </div>
                <div class="review-time">{{ formatTime(review.createTime) }}</div>
              </div>
            </div>
            <div v-else class="empty-state">
              <span class="empty-icon">⭐</span>
              <span class="empty-text">暂无评价</span>
              <span class="empty-hint">去商铺写下你的评价吧</span>
            </div>
          </div>
          
          <div v-else-if="activeTab === 'followers'">
            <div v-if="followersList.length > 0" class="user-list">
              <div class="user-item" v-for="user in followersList" :key="user.id">
                <img class="user-avatar-small" :src="user.icon || defaultAvatar" :alt="user.nickName" />
                <div class="user-detail-small">
                  <span class="username">{{ user.nickName || '用户' }}</span>
                  <span class="user-desc">{{ user.signature || '这个人很懒，什么都没写' }}</span>
                </div>
                <button class="follow-btn following">互相关注</button>
              </div>
            </div>
            <div v-else class="empty-state">
              <span class="empty-icon">👥</span>
              <span class="empty-text">暂无粉丝</span>
              <span class="empty-hint">分享你的内容，吸引更多粉丝</span>
            </div>
          </div>
          
          <div v-else-if="activeTab === 'following'">
            <div v-if="followingList.length > 0" class="user-list">
              <div class="user-item" v-for="user in followingList" :key="user.id">
                <img class="user-avatar-small" :src="user.icon || defaultAvatar" :alt="user.nickName" />
                <div class="user-detail-small">
                  <span class="username">{{ user.nickName || '用户' }}</span>
                  <span class="user-desc">{{ user.signature || '这个人很懒，什么都没写' }}</span>
                </div>
                <button class="follow-btn following">已关注</button>
              </div>
            </div>
            <div v-else class="empty-state">
              <span class="empty-icon">➕</span>
              <span class="empty-text">暂无关注</span>
              <span class="empty-hint">去发现更多有趣的人吧</span>
            </div>
          </div>
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
  notes: 0,
  reviews: 0,
  followers: 0,
  following: 0
})

const activeTab = ref('notes')
const loading = ref(false)

const tabList = [
  { value: 'notes', label: '笔记' },
  { value: 'reviews', label: '评价' },
  { value: 'followers', label: '粉丝' },
  { value: 'following', label: '关注' }
]

const notesList = ref([])
const reviewsList = ref([])
const followersList = ref([])
const followingList = ref([])

const switchTab = (tab) => {
  activeTab.value = tab
  loadTabData(tab)
}

const loadTabData = async (tab) => {
  loading.value = true
  try {
    switch (tab) {
      case 'notes':
        await fetchNotes()
        break
      case 'reviews':
        await fetchReviews()
        break
      case 'followers':
        await fetchFollowers()
        break
      case 'following':
        await fetchFollowing()
        break
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchNotes = async () => {
  // TODO: 接入真实API
  // const res = await noteApi.getUserNotes({ userId: userInfo.value.id })
  // if (res.success) {
  //   notesList.value = res.data || []
  //   stats.value.notes = res.data?.length || 0
  // }
}

const fetchReviews = async () => {
  // TODO: 接入真实API
  // const res = await reviewApi.getUserReviews({ userId: userInfo.value.id })
  // if (res.success) {
  //   reviewsList.value = res.data || []
  //   stats.value.reviews = res.data?.length || 0
  // }
}

const fetchFollowers = async () => {
  // TODO: 接入真实API
  // const res = await userApi.getFollowers({ userId: userInfo.value.id })
  // if (res.success) {
  //   followersList.value = res.data || []
  //   stats.value.followers = res.data?.length || 0
  // }
}

const fetchFollowing = async () => {
  // TODO: 接入真实API
  // const res = await userApi.getFollowing({ userId: userInfo.value.id })
  // if (res.success) {
  //   followingList.value = res.data || []
  //   stats.value.following = res.data?.length || 0
  // }
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN')
}

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
  transition: all var(--transition-fast);
  padding: 8px 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
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

.profile-content {
  padding: 12px 16px;
  padding-top: 220px;
}

.tab-content {
  background-color: var(--background-primary);
  border-radius: var(--radius-lg);
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
  min-height: 300px;
  overflow: hidden;
}

.tab-header {
  display: flex;
  border-bottom: 1px solid var(--border-light);
  background-color: var(--background-primary);
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 12px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  position: relative;
  transition: color var(--transition-fast);
}

.tab-item.active {
  color: #4a90e2;
  font-weight: 500;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 3px;
  background-color: #4a90e2;
  border-radius: 3px 3px 0 0;
}

.tab-body {
  min-height: 200px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--text-tertiary);
  font-size: 14px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  color: var(--text-tertiary);
}

.empty-state .empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state .empty-text {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  font-weight: 500;
}

.empty-state .empty-hint {
  font-size: 13px;
  color: var(--text-tertiary);
}

.note-list, .review-list, .user-list {
  padding: 0;
}

.note-item {
  padding: 16px;
  border-bottom: 1px solid var(--border-light);
}

.note-item:last-child {
  border-bottom: none;
}

.note-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.note-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}

.note-user-info {
  display: flex;
  flex-direction: column;
}

.note-username {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.note-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.note-content {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 10px;
}

.note-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-bottom: 10px;
}

.note-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.note-stats {
  display: flex;
  gap: 20px;
}

.note-stats .stat {
  font-size: 13px;
  color: var(--text-tertiary);
}

.review-item {
  padding: 16px;
  border-bottom: 1px solid var(--border-light);
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.review-shop-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}

.review-score {
  font-size: 14px;
  color: #ff6b35;
}

.review-score .stars {
  margin-right: 1px;
}

.review-content {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 10px;
}

.review-images {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.review-image {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.review-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.user-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
}

.user-item:last-child {
  border-bottom: none;
}

.user-avatar-small {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
}

.user-detail-small {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}

.user-desc {
  font-size: 13px;
  color: var(--text-tertiary);
  margin-top: 2px;
}

.follow-btn {
  padding: 6px 16px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.follow-btn.following {
  background-color: var(--background-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.logout-btn {
  width: 100%;
  padding: 14px;
  background-color: var(--background-primary);
  color: var(--error-color);
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--error-color);
  transition: all var(--transition-fast);
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
