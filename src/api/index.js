import axios from 'axios'
import { getToken } from '../utils/auth'

const instance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

instance.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers['authorization'] = token
    }
    console.log('Request:', config.method.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (response) => {
    const res = response.data
    console.log('Response:', response.config.url, res)
    
    if (res.success) {
      return res
    } else {
      console.error('Response Error:', res.errorMsg || '请求失败')
      return Promise.reject(new Error(res.errorMsg || '请求失败'))
    }
  },
  (error) => {
    console.error('Network Error:', error.message)
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('未授权，请重新登录')
          break
        case 403:
          console.error('拒绝访问')
          break
        case 404:
          console.error('请求地址不存在')
          break
        case 500:
          console.error('服务器内部错误')
          break
        default:
          console.error(`请求错误: ${error.response.status}`)
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error('请求超时')
    } else {
      console.error('网络连接失败')
    }
    
    return Promise.reject(error)
  }
)

export const userApi = {
  sendCode(phone) {
    return instance.post(`/user/code?phone=${phone}`)
  },
  
  login(phone, code, password) {
    const body = { phone }
    if (code) {
      body.code = code
    }
    if (password) {
      body.password = password
    }
    return instance.post('/user/login', body)
  },
  
  logout() {
    return instance.post('/user/logout')
  },
  
  getCurrentUser() {
    return instance.get('/user/me')
  },
  
  register(userData) {
    return instance.post('/user', userData)
  }
}

export const shopApi = {
  getShopList(params = {}) {
    return instance.get('/shop/page', { params })
  },
  
  getShopById(id) {
    return instance.get(`/shop/${id}`)
  }
}

export const shopTypeApi = {
  getAllShopTypes() {
    return instance.get('/shop-type/list')
  }
}

export default instance
