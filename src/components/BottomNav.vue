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
      @click="$router.push('/publish')"
    >
      <div class="publish-btn">
        <span class="nav-icon">+</span>
      </div>
    </div>
    
    <div 
      class="nav-item" 
      :class="{ active: currentRoute === '/message' }"
      @click="$router.push('/message')"
    >
      <span class="nav-icon">💬</span>
      <span class="nav-text">消息</span>
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
  height: 50px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid #eee;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.3s;
}

.nav-item.active {
  color: #ff6b35;
}

.nav-icon {
  font-size: 20px;
  margin-bottom: 2px;
  line-height: 1;
}

.nav-text {
  font-size: 11px;
}

.publish-btn {
  width: 44px;
  height: 44px;
  background-color: #ff6b35;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -10px;
  box-shadow: 0 2px 10px rgba(255, 107, 53, 0.3);
}

.publish-btn .nav-icon {
  color: #fff;
  font-size: 28px;
  margin-bottom: 0;
  font-weight: 300;
}
</style>
