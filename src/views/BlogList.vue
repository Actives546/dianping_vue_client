<template>
  <div class="blog-list-container">
    <div class="page-header header-fixed">
      <router-link to="/home" class="back-btn">
        <span class="back-icon">←</span>
      </router-link>
      <h1 class="title">我的笔记</h1>
      <router-link to="/publish" class="publish-btn">
        <span class="icon">✏️</span>
      </router-link>
    </div>
    
    <div class="page-content header-safe-area">
      <div class="filter-tabs">
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'my' }"
          @click="switchTab('my')"
        >
          我的发布
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'all' }"
          @click="switchTab('all')"
        >
          发现
        </div>
      </div>
      
      <div class="blog-list">
        <div 
          class="blog-item card" 
          v-for="blog in blogs" 
          :key="blog.id"
          @click="viewBlogDetail(blog)"
        >
          <div class="blog-content-wrapper" v-if="activeTab === 'all'">
            <div class="blog-header">
              <div class="author-info">
                <div class="avatar">
                  <img v-if="blog.icon" :src="blog.icon" :alt="blog.name" />
                  <span v-else class="avatar-placeholder">{{ (blog.name || '用户').charAt(0) }}</span>
                </div>
                <div class="author-details">
                  <div class="author-name">{{ blog.name || '用户' }}</div>
                  <div class="publish-time">{{ formatTime(blog.createTime) }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="blog-main">
            <div class="blog-images" v-if="getBlogImages(blog).length > 0">
              <div 
                class="image-wrapper"
                :class="{ 'single-image': getBlogImages(blog).length === 1 }"
              >
                <img 
                  v-for="(img, index) in getBlogImages(blog).slice(0, 3)" 
                  :key="index"
                  :src="img" 
                  :alt="`图片${index + 1}`"
                />
              </div>
            </div>
            
            <div class="blog-text">
              <div class="blog-title">{{ blog.title }}</div>
              <div class="blog-preview">{{ getBlogPreview(blog.content) }}</div>
            </div>
          </div>
          
          <div class="blog-footer">
            <div class="shop-info" v-if="blog.shopId" @click.stop="viewShop(blog.shopId)">
              <span class="shop-icon">📍</span>
              <span class="shop-name">{{ blog.shopName || '相关商铺' }}</span>
              <span class="arrow">›</span>
            </div>
            
            <div class="blog-stats">
              <span class="stat-item">
                <span class="stat-icon">❤️</span>
                <span class="stat-value">{{ blog.liked || 0 }}</span>
              </span>
              <span class="stat-item">
                <span class="stat-icon">💬</span>
                <span class="stat-value">{{ blog.comments || 0 }}</span>
              </span>
            </div>
          </div>
        </div>
        
        <div class="loading" v-if="loading && blogs.length === 0">
          <span class="loading-spinner"></span>
          <span class="loading-text">加载中...</span>
        </div>
        
        <div class="empty" v-else-if="!loading && blogs.length === 0">
          <span class="empty-icon">📝</span>
          <span class="empty-text">{{ activeTab === 'my' ? '您还没有发布任何笔记' : '暂无笔记' }}</span>
          <router-link to="/publish" class="empty-action" v-if="activeTab === 'my'">
            立即发布
          </router-link>
        </div>
        
        <div class="load-more" v-if="hasMore && !loading" @click="loadMore">
          加载更多
        </div>
        
        <div class="no-more-data" v-if="!hasMore && blogs.length > 0 && !loading">
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
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { blogApi, userApi } from '../api'
import BottomNav from '../components/BottomNav.vue'

const router = useRouter()

const activeTab = ref('my')
const blogs = ref([])
const loading = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)
const showToast = ref(false)
const toastMessage = ref('')
const currentUser = ref(null)

const showToastMsg = (message) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
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

const fetchBlogs = async (isLoadMore = false) => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    const params = {
      current: isLoadMore ? currentPage.value : 1,
      size: 10
    }
    
    if (activeTab.value === 'my' && currentUser.value) {
      params.userId = currentUser.value.id
    }
    
    const res = await blogApi.getBlogList(params)
    
    if (res.success) {
      const newBlogs = res.data || []
      
      if (isLoadMore) {
        blogs.value = [...blogs.value, ...newBlogs]
      } else {
        blogs.value = newBlogs
      }
      
      hasMore.value = newBlogs.length >= 10
    } else {
      showToastMsg(res.errorMsg || '加载笔记失败')
    }
  } catch (error) {
    showToastMsg(error.message || '加载笔记失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  currentPage.value++
  fetchBlogs(true)
}

const switchTab = (tab) => {
  activeTab.value = tab
  currentPage.value = 1
  blogs.value = []
  hasMore.value = true
  fetchBlogs()
}

const getBlogImages = (blog) => {
  if (!blog.images) return []
  return blog.images.split(',').filter(img => img.trim())
}

const getBlogPreview = (content) => {
  if (!content) return ''
  return content.length > 80 ? content.substring(0, 80) + '...' : content
}

const viewBlogDetail = (blog) => {
  router.push(`/blog/${blog.id}`)
}

const viewShop = (shopId) => {
  showToastMsg(`查看商铺ID: ${shopId}`)
}

watch(activeTab, () => {
  if (activeTab.value === 'my' && !currentUser.value) {
    fetchCurrentUser().then(() => {
      fetchBlogs()
    })
  } else {
    fetchBlogs()
  }
})

onMounted(() => {
  fetchCurrentUser().then(() => {
    if (activeTab.value === 'my' && currentUser.value) {
      fetchBlogs()
    } else {
      fetchBlogs()
    }
  })
})
</script>

<style scoped>
.blog-list-container {
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

.publish-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.publish-btn:active {
  background-color: rgba(255, 255, 255, 0.2);
}

.publish-btn .icon {
  font-size: 20px;
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
  margin-bottom: 2px;
}

.tab-item {
  padding: 10px 20px;
  font-size: 14px;
  color: var(--text-secondary);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-item.active {
  background-color: var(--primary-light);
  color: var(--primary-color);
  font-weight: 600;
}

.blog-list {
  padding: 12px;
}

.blog-item {
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.blog-item:active {
  transform: scale(0.99);
}

.blog-header {
  margin-bottom: 12px;
}

.author-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--background-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 16px;
  font-weight: 600;
  color: var(--background-primary);
  background: linear-gradient(135deg, var(--primary-color) 0%, #ff8c5a 100%);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.author-details {
  margin-left: 10px;
}

.author-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.publish-time {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 2px;
}

.blog-main {
  margin-bottom: 12px;
}

.blog-images {
  margin-bottom: 12px;
}

.image-wrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.image-wrapper.single-image {
  grid-template-columns: 1fr;
}

.image-wrapper img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: var(--radius-md);
  background-color: var(--background-secondary);
}

.image-wrapper.single-image img {
  aspect-ratio: 16/9;
}

.blog-text {
  padding: 0 2px;
}

.blog-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.blog-preview {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.blog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
}

.shop-info {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background-color: var(--background-secondary);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.shop-info:active {
  background-color: var(--border-light);
}

.shop-icon {
  font-size: 12px;
}

.shop-name {
  font-size: 12px;
  color: var(--text-secondary);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow {
  font-size: 12px;
  color: var(--text-tertiary);
}

.blog-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.stat-icon {
  font-size: 14px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-light);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  font-size: 14px;
  color: var(--text-tertiary);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
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
  margin-bottom: 16px;
}

.empty-action {
  padding: 10px 24px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #ff8c5a 100%);
  color: var(--background-primary);
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 500;
}

.load-more {
  text-align: center;
  padding: 16px;
  color: var(--primary-color);
  font-size: 14px;
  background-color: var(--background-primary);
  cursor: pointer;
  border-radius: var(--radius-lg);
  margin-top: 4px;
  box-shadow: var(--shadow-sm);
}

.no-more-data {
  text-align: center;
  padding: 16px;
  color: var(--text-tertiary);
  font-size: 13px;
  margin-top: 4px;
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