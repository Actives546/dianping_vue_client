const mockData = {
  shopTypes: [
    { id: 1, name: '美食', icon: '🍜' },
    { id: 2, name: '电影', icon: '🎬' },
    { id: 3, name: 'KTV', icon: '🎤' },
    { id: 4, name: '酒店', icon: '🏨' },
    { id: 5, name: '丽人', icon: '💅' },
    { id: 6, name: '休闲娱乐', icon: '🎮' },
    { id: 7, name: '足疗按摩', icon: '💆' },
    { id: 8, name: '亲子', icon: '👨‍👩‍👧' }
  ],
  shops: [
    { id: 1, name: '老北京火锅店', typeId: 1, avgPrice: 88, avgScore: 4.8, distance: 1.2, address: '北京市朝阳区建国路88号', phone: '010-88888888', tags: ['火锅', '川菜'], images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotpot%20restaurant%20interior&image_size=square_hd'] },
    { id: 2, name: '日式料理寿司屋', typeId: 1, avgPrice: 128, avgScore: 4.6, distance: 2.5, address: '北京市海淀区中关村大街1号', phone: '010-66666666', tags: ['日料', '寿司'], images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=japanese%20sushi%20restaurant&image_size=square_hd'] },
    { id: 3, name: '星巴克咖啡', typeId: 6, avgPrice: 35, avgScore: 4.5, distance: 0.8, address: '北京市朝阳区国贸中心', phone: '010-77777777', tags: ['咖啡', '休闲'], images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=coffee%20shop%20cafe%20interior&image_size=square_hd'] },
    { id: 4, name: '万达影城', typeId: 2, avgPrice: 50, avgScore: 4.7, distance: 3.1, address: '北京市朝阳区万达广场', phone: '010-55555555', tags: ['电影', 'IMAX'], images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cinema%20movie%20theater%20entrance&image_size=square_hd'] }
  ],
  currentUser: {
    id: 1,
    nickName: '美食达人',
    icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20portrait%20friendly&image_size=square_hd',
    phone: '13800138000'
  }
}

class AxiosMock {
  constructor(config = {}) {
    this.baseURL = config.baseURL || ''
    this.timeout = config.timeout || 10000
    this.headers = config.headers || {}
    this.interceptors = {
      request: { use: () => {} },
      response: { use: () => {} }
    }
  }

  request(config) {
    const method = (config.method || 'get').toLowerCase()
    const url = config.url || ''
    
    console.log('[Mock Axios]', method.toUpperCase(), this.baseURL + url)
    
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = this.handleMockRequest(method, url, config)
        resolve({ data: result })
      }, 300)
    })
  }

  handleMockRequest(method, url, config) {
    if (url.includes('/user/code')) {
      return { success: true, data: null, errorMsg: null }
    }
    
    if (url.includes('/user/login')) {
      const token = 'mock_token_' + Date.now()
      return { success: true, data: token, errorMsg: null }
    }
    
    if (url.includes('/user/logout')) {
      return { success: true, data: null, errorMsg: null }
    }
    
    if (url.includes('/user/me')) {
      return { success: true, data: mockData.currentUser, errorMsg: null }
    }
    
    if (url.includes('/user') && method === 'post') {
      return { success: true, data: null, errorMsg: null }
    }
    
    if (url.includes('/shop-type/list')) {
      return { success: true, data: mockData.shopTypes, errorMsg: null }
    }
    
    if (url.includes('/shop/page')) {
      return { 
        success: true, 
        data: {
          records: mockData.shops,
          total: mockData.shops.length,
          current: 1,
          pages: 1
        }, 
        errorMsg: null 
      }
    }
    
    if (url.match(/\/shop\/\d+/)) {
      const id = parseInt(url.split('/').pop())
      const shop = mockData.shops.find(s => s.id === id)
      return { success: true, data: shop || mockData.shops[0], errorMsg: null }
    }
    
    return { success: true, data: null, errorMsg: null }
  }

  get(url, config = {}) {
    return this.request({ method: 'get', url, ...config })
  }

  post(url, data = {}, config = {}) {
    return this.request({ method: 'post', url, data, ...config })
  }

  put(url, data = {}, config = {}) {
    return this.request({ method: 'put', url, data, ...config })
  }

  delete(url, config = {}) {
    return this.request({ method: 'delete', url, ...config })
  }
}

const create = (config) => new AxiosMock(config)
const defaults = { headers: { common: {} } }

export default {
  create,
  defaults,
  get: (url, config) => create().get(url, config),
  post: (url, data, config) => create().post(url, data, config),
  put: (url, data, config) => create().put(url, data, config),
  delete: (url, config) => create().delete(url, config)
}
