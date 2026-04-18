<template>
  <div class="message-container">
    <div class="page-header">
      <h1 class="title">消息</h1>
    </div>
    
    <div class="page-content">
      <div class="message-tabs">
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'notification' }"
          @click="activeTab = 'notification'"
        >
          通知
          <span class="badge" v-if="notificationCount > 0">{{ notificationCount }}</span>
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'chat' }"
          @click="activeTab = 'chat'"
        >
          消息
          <span class="badge" v-if="chatCount > 0">{{ chatCount }}</span>
        </div>
      </div>
      
      <template v-if="activeTab === 'notification'">
        <div class="message-list" v-if="notifications.length > 0">
          <div class="message-item" v-for="item in notifications" :key="item.id">
            <div class="message-icon">
              {{ getNotificationIcon(item.type) }}
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-title">{{ item.title }}</span>
                <span class="message-time">{{ item.time }}</span>
              </div>
              <p class="message-text">{{ item.content }}</p>
            </div>
          </div>
        </div>
        
        <div class="empty" v-else>
          <span class="empty-icon">🔔</span>
          <span class="empty-text">暂无通知</span>
        </div>
      </template>
      
      <template v-else>
        <div class="message-list" v-if="chats.length > 0">
          <div class="chat-item" v-for="item in chats" :key="item.id">
            <div class="chat-avatar">
              <img :src="item.avatar" :alt="item.name" />
              <span class="unread-dot" v-if="item.unread > 0"></span>
            </div>
            <div class="chat-content">
              <div class="chat-header">
                <span class="chat-name">{{ item.name }}</span>
                <span class="chat-time">{{ item.time }}</span>
              </div>
              <div class="chat-preview">
                <span class="chat-text">{{ item.lastMessage }}</span>
                <span class="unread-count" v-if="item.unread > 0">{{ item.unread }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="empty" v-else>
          <span class="empty-icon">💬</span>
          <span class="empty-text">暂无消息</span>
        </div>
      </template>
    </div>
    
    <BottomNav />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BottomNav from '../components/BottomNav.vue'

const activeTab = ref('notification')
const notificationCount = ref(2)
const chatCount = ref(3)

const notifications = ref([
  {
    id: 1,
    type: 'comment',
    title: '新评论',
    content: '用户"美食达人"评论了你的博客："看起来很好吃！"',
    time: '10分钟前'
  },
  {
    id: 2,
    type: 'like',
    title: '获赞提醒',
    content: '你的博客获得了15个赞，继续加油！',
    time: '1小时前'
  },
  {
    id: 3,
    type: 'system',
    title: '系统通知',
    content: '欢迎使用点评APP，祝您使用愉快！',
    time: '昨天'
  }
])

const chats = ref([
  {
    id: 1,
    name: '商户客服',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20customer%20service%20avatar&image_size=square_hd',
    lastMessage: '您好，有什么可以帮助您的？',
    time: '刚刚',
    unread: 2
  },
  {
    id: 2,
    name: '美食达人',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20user%20avatar%20food%20lover&image_size=square_hd',
    lastMessage: '你推荐的那家店真的不错！',
    time: '10分钟前',
    unread: 1
  },
  {
    id: 3,
    name: '系统消息',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=system%20notification%20icon%20simple&image_size=square_hd',
    lastMessage: '您的账户已成功绑定手机号',
    time: '昨天',
    unread: 0
  }
])

const getNotificationIcon = (type) => {
  const iconMap = {
    comment: '💬',
    like: '❤️',
    system: '🔔',
    follow: '👥',
    activity: '🎁'
  }
  return iconMap[type] || '📢'
}
</script>

<style scoped>
.message-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  background-color: #ff6b35;
  padding: 16px;
  padding-top: calc(16px + env(safe-area-inset-top));
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  text-align: center;
}

.page-content {
  padding-bottom: 70px;
}

.message-tabs {
  display: flex;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 14px 0;
  font-size: 15px;
  color: #666;
  position: relative;
  cursor: pointer;
}

.tab-item.active {
  color: #ff6b35;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 2px;
  background-color: #ff6b35;
}

.badge {
  background-color: #ff4757;
  color: #fff;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 10px;
  margin-left: 4px;
  min-width: 16px;
  display: inline-block;
}

.message-list {
  background-color: #fff;
}

.message-item {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.message-item:last-child {
  border-bottom: none;
}

.message-icon {
  width: 44px;
  height: 44px;
  background-color: #fff5f2;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  margin-left: 12px;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.message-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.message-text {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.chat-item {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.chat-item:last-child {
  border-bottom: none;
}

.chat-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.chat-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.unread-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background-color: #ff4757;
  border-radius: 50%;
  border: 2px solid #fff;
}

.chat-content {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.chat-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.chat-time {
  font-size: 12px;
  color: #999;
}

.chat-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-text {
  font-size: 13px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}

.unread-count {
  background-color: #ff4757;
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  flex-shrink: 0;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #999;
  background-color: #fff;
}

.empty-icon {
  font-size: 56px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
}
</style>
