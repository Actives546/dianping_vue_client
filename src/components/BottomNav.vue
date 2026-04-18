<template>
  <div class="bottom-nav">
    <div 
      class="nav-item" 
      :class="{ active: currentRoute === '/home' }"
      @click="$router.push('/home')"
    >
      <span class="nav-icon">🏠</span>
      <span class="nav-text">首页</span>
    </div>
    
    <div 
      class="nav-item" 
      :class="{ active: currentRoute === '/blog-list' }"
      @click="$router.push('/blog-list')"
    >
      <span class="nav-icon">📝</span>
      <span class="nav-text">笔记</span>
    </div>
    
    <div 
      class="nav-item" 
      @click="$router.push('/publish')"
    >
      <div class="publish-btn">
        <span class="nav-icon">+</span>
      </div>
    </div>
    
    <div 
      class="nav-item" 
      :class="{ active: currentRoute === '/voucher-list' }"
      @click="$router.push('/voucher-list')"
    >
      <span class="nav-icon">🎫</span>
      <span class="nav-text">优惠券</span>
    </div>
    
    <div 
      class="nav-item" 
      :class="{ active: currentRoute === '/profile' }"
      @click="$router.push('/profile')"
    >
      <span class="nav-icon">👤</span>
      <span class="nav-text">我的</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const currentRoute = computed(() => route.path)
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background-color: var(--background-primary);
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid var(--border-light);
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  color: var(--text-tertiary);
  font-size: 12px;
  cursor: pointer;
  transition: color var(--transition-fast);
  position: relative;
}

.nav-item.active {
  color: var(--primary-color);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background-color: var(--primary-color);
  border-radius: 0 0 3px 3px;
}

.nav-icon {
  font-size: 22px;
  margin-bottom: 2px;
  line-height: 1;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-text {
  font-size: 11px;
}

.publish-btn {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #ff8c5a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -14px;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  transition: all var(--transition-fast);
}

.publish-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
}

.publish-btn .nav-icon {
  color: var(--background-primary);
  font-size: 22px;
  margin-bottom: 0;
  font-weight: 300;
  line-height: 1;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>