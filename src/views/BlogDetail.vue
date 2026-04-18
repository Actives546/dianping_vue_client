<template>
  <div class="blog-detail-container">
    <div class="page-header header-fixed">
      <router-link to="/home" class="back-btn">
        <span class="back-icon">←</span>
      </router-link>
      <h1 class="title">博客详情</h1>
      <div class="placeholder"></div>
    </div>
    
    <div class="page-content header-safe-area">
      <div class="blog-detail card" v-if="blog">
        <div class="blog-header">
          <div class="author-info">
            <div class="avatar" v-if="blog.icon">
              <img :src="blog.icon" :alt="blog.name" />
            </div>
            <div class="avatar-placeholder" v-else>
              <span class="avatar-text">{{ (blog.name || '用户').charAt(0) }}</span>
            </div>
            <div class="author-details">
              <div class="author-name">{{ blog.name || '用户' }}</div>
              <div class="publish-time">{{ formatTime(blog.createTime) }}</div>
            </div>
          </div>
          
          <div class="blog-stats" v-if="blog.liked || blog.comments">
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
        
        <div class="blog-title">{{ blog.title }}</div>
        
        <div class="shop-info" v-if="shop">
          <div class="shop-info-header">
            <span class="shop-tag">探店</span>
            <span class="shop-name">{{ shop.name }}</span>
          </div>
          <div class="shop-info-detail" @click="viewShop(shop)">
            <div class="shop-image">
              <img :src="getShopImage(shop)" :alt="shop.name" />
            </div>
            <div class="shop-detail-info">
              <div class="shop-score">
                <span class="score-value">★ {{ formatScore(shop.score) }}</span>
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
        
        <div class="blog-images" v-if="blogImages.length > 0">
          <div 
            class="blog-image-item" 
            v-for="(img, index) in blogImages" 
            :key="index"
            :class="{ 'single-image': blogImages.length === 1 }"
          >
            <img :src="img" :alt="`博客图片${index + 1}`" />
          </div>
        </div>
        
        <div class="blog-content">{{ blog.content }}</div>
      </div>
      
      <div class="loading" v-else-if="loadingBlog">
        加载中...
      </div>
      
      <div class="empty" v-else>
        <span class="empty-icon">📝</span>
        <span class="empty-text">博客不存在或已删除</span>
      </div>
      
      <div class="comments-section" v-if="blog">
        <div class="section-header">
          <h3 class="section-title">评论 ({{ totalComments }})</h3>
        </div>
        
        <div class="comments-list" v-if="comments.length > 0">
          <div 
            class="comment-item" 
            v-for="comment in comments" 
            :key="comment.id"
          >
            <div class="comment-header">
              <div class="comment-avatar">
                <span class="avatar-placeholder-small">
                  {{ (comment.userId || 'U').toString().charAt(0) }}
                </span>
              </div>
              <div class="comment-info">
                <div class="comment-user">用户{{ comment.userId }}</div>
                <div class="comment-time">{{ formatTime(comment.createTime) }}</div>
              </div>
              <div class="comment-actions">
                <span class="like-btn" @click="likeComment(comment)">
                  <span class="like-icon">👍</span>
                  <span class="like-count">{{ comment.liked || 0 }}</span>
                </span>
                <span class="reply-btn" @click="replyToComment(comment)">回复</span>
              </div>
            </div>
            
            <div class="comment-content">
              <span class="reply-to" v-if="comment.answerId">
                @用户{{ comment.answerId }}
              </span>
              {{ comment.content }}
            </div>
            
            <div class="replies-list" v-if="comment.replies && comment.replies.length > 0">
              <div 
                class="reply-item" 
                v-for="reply in comment.replies" 
                :key="reply.id"
              >
                <div class="reply-header">
                  <span class="reply-user">用户{{ reply.userId }}</span>
                  <span class="reply-to" v-if="reply.answerId">
                    @用户{{ reply.answerId }}
                  </span>
                  <span class="reply-content">: {{ reply.content }}</span>
                </div>
                <div class="reply-footer">
                  <span class="reply-time">{{ formatTime(reply.createTime) }}</span>
                  <span class="reply-action" @click="replyToReply(reply, comment)">回复</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="empty-comments" v-else-if="!loadingComments">
          <span class="empty-icon">💬</span>
          <span class="empty-text">暂无评论，快来抢沙发吧</span>
        </div>
        
        <div class="loading" v-else-if="loadingComments">
          加载评论中...
        </div>
        
        <div class="load-more" v-if="hasMoreComments && !loadingComments" @click="loadMoreComments">
          加载更多评论
        </div>
        
        <div class="no-more-data" v-if="!hasMoreComments && comments.length > 0">
          到底了
        </div>
      </div>
    </div>
    
    <div class="comment-input-bar">
      <div class="input-wrapper">
        <input 
          type="text" 
          class="comment-input" 
          :placeholder="replyPlaceholder"
          v-model="commentContent"
          @keyup.enter="submitComment"
        />
        <span class="cancel-reply" v-if="replyingTo" @click="cancelReply">×</span>
      </div>
      <button 
        class="submit-comment-btn" 
        @click="submitComment"
        :disabled="!commentContent.trim() || submittingComment"
      >
        {{ submittingComment ? '发送中...' : '发送' }}
      </button>
    </div>
    
    <div class="toast" :class="{ show: showToast }">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { blogApi, blogCommentApi, shopApi, userApi } from '../api'

const route = useRoute()
const router = useRouter()

const blogId = ref(parseInt(route.params.id) || 0)
const blog = ref(null)
const shop = ref(null)
const comments = ref([])
const totalComments = ref(0)
const currentPage = ref(1)
const hasMoreComments = ref(true)
const loadingBlog = ref(false)
const loadingComments = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const commentContent = ref('')
const submittingComment = ref(false)
const currentUser = ref(null)
const replyingTo = ref(null)
const replyingParent = ref(null)

const replyPlaceholder = computed(() => {
  if (replyingTo.value) {
    return `回复 @用户${replyingTo.value.userId}`
  }
  return '说点什么...'
})

const blogImages = computed(() => {
  if (!blog.value || !blog.value.images) return []
  return blog.value.images.split(',').filter(img => img.trim())
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

const fetchBlogDetail = async () => {
  if (!blogId.value) return
  
  loadingBlog.value = true
  
  try {
    const res = await blogApi.getBlogById(blogId.value)
    
    if (res.success) {
      blog.value = res.data
      totalComments.value = blog.value.comments || 0
      
      if (blog.value.shopId) {
        fetchShopDetail(blog.value.shopId)
      }
    } else {
      showToastMsg(res.errorMsg || '加载博客失败')
    }
  } catch (error) {
    showToastMsg(error.message || '加载博客失败，请稍后重试')
  } finally {
    loadingBlog.value = false
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

const fetchComments = async (isLoadMore = false) => {
  if (!blogId.value || loadingComments.value) return
  
  loadingComments.value = true
  
  try {
    const params = {
      current: isLoadMore ? currentPage.value : 1,
      size: 10
    }
    
    const res = await blogCommentApi.getCommentsByBlogId(blogId.value, params)
    
    if (res.success) {
      const newComments = res.data || []
      
      if (isLoadMore) {
        comments.value = [...comments.value, ...newComments]
      } else {
        comments.value = newComments
      }
      
      hasMoreComments.value = newComments.length >= 10
    } else {
      showToastMsg(res.errorMsg || '加载评论失败')
    }
  } catch (error) {
    showToastMsg(error.message || '加载评论失败，请稍后重试')
  } finally {
    loadingComments.value = false
  }
}

const loadMoreComments = () => {
  currentPage.value++
  fetchComments(true)
}

const likeComment = (comment) => {
  showToastMsg('点赞成功')
  if (!comment.liked) comment.liked = 0
  comment.liked++
}

const replyToComment = (comment) => {
  replyingTo.value = comment
  replyingParent.value = comment
}

const replyToReply = (reply, parentComment) => {
  replyingTo.value = reply
  replyingParent.value = parentComment
}

const cancelReply = () => {
  replyingTo.value = null
  replyingParent.value = null
}

const submitComment = async () => {
  if (!commentContent.value.trim()) {
    showToastMsg('请输入评论内容')
    return
  }
  
  if (!currentUser.value) {
    showToastMsg('请先登录')
    return
  }
  
  submittingComment.value = true
  
  try {
    const commentData = {
      userId: currentUser.value.id,
      blogId: blogId.value,
      content: commentContent.value.trim()
    }
    
    if (replyingTo.value && replyingParent.value) {
      commentData.parentId = replyingParent.value.id
      commentData.answerId = replyingTo.value.id
    }
    
    const res = await blogCommentApi.createComment(commentData)
    
    if (res.success) {
      showToastMsg('评论成功')
      commentContent.value = ''
      cancelReply()
      
      currentPage.value = 1
      fetchComments(false)
      
      if (blog.value) {
        if (!blog.value.comments) blog.value.comments = 0
        blog.value.comments++
        totalComments.value = blog.value.comments
      }
    } else {
      showToastMsg(res.errorMsg || '评论失败')
    }
  } catch (error) {
    showToastMsg(error.message || '评论失败，请稍后重试')
  } finally {
    submittingComment.value = false
  }
}

const viewShop = (shopItem) => {
  showToastMsg(`查看商铺: ${shopItem.name}`)
}

watch(() => route.params.id, (newId) => {
  blogId.value = parseInt(newId) || 0
  blog.value = null
  shop.value = null
  comments.value = []
  currentPage.value = 1
  hasMoreComments.value = true
  fetchBlogDetail()
  fetchComments()
})

onMounted(() => {
  fetchCurrentUser()
  fetchBlogDetail()
  fetchComments()
})
</script>

<style scoped>
.blog-detail-container {
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

.blog-detail {
  margin: 12px;
  padding: 16px;
}

.blog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.author-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--background-secondary);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color) 0%, #ff8c5a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  color: var(--background-primary);
  font-size: 18px;
  font-weight: 600;
}

.author-details {
  margin-left: 12px;
}

.author-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.publish-time {
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
  font-size: 13px;
  color: var(--text-secondary);
}

.stat-icon {
  font-size: 16px;
}

.blog-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 16px;
}

.shop-info {
  margin-bottom: 16px;
}

.shop-info-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.shop-tag {
  font-size: 11px;
  color: var(--background-primary);
  background-color: var(--primary-color);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  margin-right: 8px;
}

.shop-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.shop-info-detail {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: var(--background-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.shop-info-detail:active {
  background-color: var(--border-light);
}

.shop-image {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  background-color: var(--background-primary);
}

.shop-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shop-detail-info {
  flex: 1;
  margin-left: 12px;
}

.shop-score {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.score-value {
  font-size: 14px;
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

.blog-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.blog-image-item {
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: var(--background-secondary);
}

.blog-image-item.single-image {
  grid-column: span 3;
  aspect-ratio: 16/9;
}

.blog-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blog-content {
  font-size: 15px;
  line-height: 1.8;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.comments-section {
  margin: 12px;
}

.section-header {
  padding: 12px 0;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.comments-list {
  background-color: var(--background-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.comment-item {
  padding: 16px;
  border-bottom: 1px solid var(--border-light);
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
}

.comment-avatar {
  margin-right: 12px;
}

.avatar-placeholder-small {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6bb3f0 0%, #4a90e2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--background-primary);
  font-size: 14px;
  font-weight: 600;
}

.comment-info {
  flex: 1;
}

.comment-user {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.comment-time {
  font-size: 11px;
  color: var(--text-tertiary);
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.like-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.like-btn:active {
  color: var(--primary-color);
}

.reply-btn {
  font-size: 12px;
  color: var(--primary-color);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.reply-btn:active {
  color: var(--primary-dark);
}

.comment-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  margin-left: 48px;
}

.reply-to {
  color: var(--primary-color);
  font-weight: 500;
}

.replies-list {
  margin-left: 48px;
  margin-top: 8px;
  padding: 12px;
  background-color: var(--background-secondary);
  border-radius: var(--radius-md);
}

.reply-item {
  padding: 8px 0;
  border-bottom: 1px solid var(--border-light);
}

.reply-item:last-child {
  border-bottom: none;
}

.reply-header {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-primary);
}

.reply-user {
  color: var(--primary-color);
  font-weight: 500;
}

.reply-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.reply-time {
  font-size: 11px;
  color: var(--text-tertiary);
}

.reply-action {
  font-size: 11px;
  color: var(--primary-color);
  cursor: pointer;
}

.empty-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: var(--background-primary);
  border-radius: var(--radius-lg);
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
  margin: 12px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
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
  margin-top: 12px;
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

.comment-input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background-color: var(--background-primary);
  border-top: 1px solid var(--border-light);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: var(--background-secondary);
  border-radius: var(--radius-full);
  padding: 0 16px;
}

.comment-input {
  flex: 1;
  border: none;
  font-size: 14px;
  padding: 10px 0;
  background-color: transparent;
}

.cancel-reply {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--text-tertiary);
  color: var(--background-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  margin-left: 8px;
}

.submit-comment-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #ff8c5a 100%);
  color: var(--background-primary);
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.submit-comment-btn:active {
  transform: scale(0.98);
}

.submit-comment-btn:disabled {
  background: #cccccc;
  box-shadow: none;
  cursor: not-allowed;
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