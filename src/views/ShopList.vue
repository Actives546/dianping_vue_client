<template>
  <div class="shop-list-container">
    <div class="page-header">
      <router-link to="/home" class="back-btn">
        <span class="back-icon">←</span>
      </router-link>
      <h1 class="title">{{ pageTitle }}</h1>
      <div class="placeholder"></div>
    </div>
    
    <div class="page-content">
      <div class="filter-bar">
        <div class="filter-item" :class="{ active: sortBy === 'default' }" @click="sortBy = 'default'">
          综合排序
        </div>
        <div class="filter-item" :class="{ active: sortBy === 'score' }" @click="sortBy = 'score'">
          好评优先
        </div>
        <div class="filter-item" :class="{ active: sortBy === 'distance' }" @click="sortBy = 'distance'">
          离我最近
        </div>
      </div>
      
      <div class="shops-list" v-if="shops.length > 0">
        <div class="shop-item" v-for="shop in shops" :key="shop.id" @click="viewShopDetail(shop)">
          <div class="shop-image">
            <img :src="getShopImage(shop)" :alt="shop.name" />
          </div>
          <div class="shop-info">
            <h4 class="shop-name">{{ shop.name }}</h4>
            <div class="shop-meta">
              <span class="shop-score">
                ★ {{ formatScore(shop.score) }}
              </span>
              <span class="shop-sold" v-if="shop.sold">
                售{{ shop.sold }}
              </span>
              <span class="shop-avg-price">
                ¥{{ shop.avgPrice || 0 }}/人
              </span>
            </div>
            <div class="shop-location">
              <span class="location-icon">📍</span>
              <span class="shop-area">{{ shop.area || '商圈' }}</span>
              <span class="shop-distance" v-if="shop.distance">
                {{ shop.distance }}km
              </span>
            </div>
            <div class="shop-tags">
              <span class="tag" v-if="shop.shopType">{{ shop.shopType.name }}</span>
              <span class="tag" v-if="shop.openHours">营业中</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="loading" v-else-if="loading">
        加载中...
      </div>
      
      <div class="empty" v-else>
        <span class="empty-icon">🏪</span>
        <span class="empty-text">暂无商铺</span>
      </div>
      
      <div class="load-more" v-if="hasMore && !loading" @click="loadMore">
        加载更多
      </div>
      
      <div class="no-more" v-if="!hasMore && shops.length > 0">
        没有更多了
      </div>
    </div>
    
    <BottomNav />
    
    <div class="toast" :class="{ show: showToast }">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { shopApi, shopTypeApi } from '../api'
import BottomNav from '../components/BottomNav.vue'

export default {
  name: 'ShopList',
  components: {
    BottomNav
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const typeId = ref(parseInt(route.params.typeId) || 0)
    const pageTitle = ref('商铺列表')
    const shops = ref([])
    const loading = ref(false)
    const showToast = ref(false)
    const toastMessage = ref('')
    const sortBy = ref('default')
    const currentPage = ref(1)
    const hasMore = ref(true)
    
    const showToastMessage = (message) => {
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
    
    const fetchShopTypeInfo = async () => {
      if (typeId.value === 0) {
        pageTitle.value = '全部商铺'
        return
      }
      
      try {
        const res = await shopTypeApi.getAllShopTypes()
        if (res.success && res.data) {
          const type = res.data.find(t => t.id === typeId.value)
          if (type) {
            pageTitle.value = type.name
          }
        }
      } catch (error) {
        console.error('获取商铺类型失败:', error)
      }
    }
    
    const fetchShops = async (isLoadMore = false) => {
      if (loading.value) return
      
      loading.value = true
      
      try {
        const params = {
          current: isLoadMore ? currentPage.value : 1,
          size: 10
        }
        
        const res = await shopApi.getShopList(params)
        
        if (res.success) {
          const newShops = res.data || []
          
          if (isLoadMore) {
            shops.value = [...shops.value, ...newShops]
          } else {
            shops.value = newShops
          }
          
          hasMore.value = newShops.length >= 10
        } else {
          showToastMessage(res.errorMsg || '加载商铺失败')
        }
      } catch (error) {
        showToastMessage('加载商铺失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
    
    const loadMore = () => {
      currentPage.value++
      fetchShops(true)
    }
    
    const viewShopDetail = (shop) => {
      showToastMessage(`查看商铺详情: ${shop.name}`)
    }
    
    watch(sortBy, () => {
      currentPage.value = 1
      shops.value = []
      hasMore.value = true
      fetchShops()
    })
    
    onMounted(() => {
      fetchShopTypeInfo()
      fetchShops()
    })
    
    return {
      pageTitle,
      shops,
      loading,
      showToast,
      toastMessage,
      sortBy,
      hasMore,
      getShopImage,
      formatScore,
      loadMore,
      viewShopDetail
    }
  }
}
</script>

<style scoped>
.shop-list-container {
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

.filter-bar {
  display: flex;
  background-color: #fff;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.filter-item {
  flex: 1;
  text-align: center;
  font-size: 14px;
  color: #666;
  padding: 4px 0;
  position: relative;
  cursor: pointer;
}

.filter-item.active {
  color: #ff6b35;
  font-weight: 500;
}

.filter-item.active::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 2px;
  background-color: #ff6b35;
}

.shops-list {
  padding: 0 16px;
  background-color: #fff;
}

.shop-item {
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.shop-item:last-child {
  border-bottom: none;
}

.shop-image {
  width: 120px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background-color: #f5f5f5;
}

.shop-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shop-info {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.shop-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shop-meta {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.shop-score {
  font-size: 14px;
  color: #ff6b35;
  margin-right: 12px;
}

.shop-sold {
  font-size: 13px;
  color: #999;
  margin-right: 12px;
}

.shop-avg-price {
  font-size: 13px;
  color: #666;
}

.shop-location {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
  color: #999;
}

.location-icon {
  margin-right: 4px;
}

.shop-area {
  margin-right: 8px;
}

.shop-tags {
  display: flex;
  gap: 6px;
}

.tag {
  font-size: 11px;
  color: #ff6b35;
  background-color: #fff5f2;
  padding: 2px 6px;
  border-radius: 4px;
}

.loading {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
  background-color: #fff;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
  background-color: #fff;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
}

.load-more {
  text-align: center;
  padding: 16px;
  color: #ff6b35;
  font-size: 14px;
  background-color: #fff;
  cursor: pointer;
}

.no-more {
  text-align: center;
  padding: 16px;
  color: #999;
  font-size: 13px;
  background-color: #fff;
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
