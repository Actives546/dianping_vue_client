import { getToken } from '../utils/auth'

const BASE_URL = '/api'

async function request(url, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  if (token) {
    headers['authorization'] = token
  }
  
  try {
    const response = await fetch(BASE_URL + url, {
      ...options,
      headers
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Request error:', error)
    throw error
  }
}

export const userApi = {
  sendCode(phone) {
    return request(`/user/code?phone=${phone}`, {
      method: 'POST'
    })
  },
  
  login(phone, code, password) {
    const body = { phone }
    if (code) {
      body.code = code
    }
    if (password) {
      body.password = password
    }
    return request('/user/login', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  },
  
  logout() {
    return request('/user/logout', {
      method: 'POST'
    })
  },
  
  getCurrentUser() {
    return request('/user/me', {
      method: 'GET'
    })
  },
  
  register(userData) {
    return request('/user', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }
}

export const shopApi = {
  getShopList(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/shop/page?${queryString}` : '/shop/page'
    return request(url, {
      method: 'GET'
    })
  },
  
  getShopById(id) {
    return request(`/shop/${id}`, {
      method: 'GET'
    })
  }
}

export const shopTypeApi = {
  getAllShopTypes() {
    return request('/shop-type/list', {
      method: 'GET'
    })
  }
}
