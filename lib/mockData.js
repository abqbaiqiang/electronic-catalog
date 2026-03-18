// 模拟数据 - 用于演示版本
// 数据存储在浏览器本地存储中

// 模拟用户数据
const MOCK_USER = {
  id: 'demo-user-001',
  phone: '13800138000',
  password: '123456',
  company_name: '演示公司',
  name: '管理员',
  role: 'client',
  status: 'active'
}

// 模拟画册数据
const MOCK_CATALOGS = [
  {
    id: 'catalog-001',
    user_id: 'demo-user-001',
    title: '2026春节年货礼盒精选',
    banner_url: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800',
    share_image: '',
    share_desc: '精选年货礼盒，送礼首选',
    template: 'template1',
    sort_order: 1,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'catalog-002',
    user_id: 'demo-user-001',
    title: '端午礼品集',
    banner_url: 'https://images.unsplash.com/photo-1469307517101-0b99d8fb0c33?w=800',
    share_image: '',
    share_desc: '端午佳节，礼品精选',
    template: 'template1',
    sort_order: 2,
    is_active: true,
    created_at: '2026-02-01T00:00:00Z'
  }
]

// 模拟分类数据
const MOCK_CATEGORIES = [
  { id: 'cat-001', catalog_id: 'catalog-001', name: '坚果礼盒', sort_order: 1, is_visible: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-002', catalog_id: 'catalog-001', name: '糖果巧克力', sort_order: 2, is_visible: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-003', catalog_id: 'catalog-001', name: '保健品', sort_order: 3, is_visible: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-004', catalog_id: 'catalog-002', name: '粽子礼盒', sort_order: 1, is_visible: true, created_at: '2026-02-01T00:00:00Z' },
  { id: 'cat-005', catalog_id: 'catalog-002', name: '咸鸭蛋', sort_order: 2, is_visible: true, created_at: '2026-02-01T00:00:00Z' }
]

// 模拟产品数据
const MOCK_PRODUCTS = [
  {
    id: 'prod-001',
    catalog_id: 'catalog-001',
    category_id: 'cat-001',
    title: '【三只松鼠】坚果大礼包1523g',
    description: '精选多种坚果，营养丰富，送礼佳品。包含夏威夷果、碧根果、开心果等。',
    images: [
      'https://images.unsplash.com/photo-1599599810769-bcde5a1645f7?w=400',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
    ],
    price: 168.00,
    is_active: true,
    created_at: '2026-01-10T00:00:00Z'
  },
  {
    id: 'prod-002',
    catalog_id: 'catalog-001',
    category_id: 'cat-001',
    title: '【百草味】富贵礼1730g',
    description: '高端坚果礼盒，送礼有面子。',
    images: [
      'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400'
    ],
    price: 198.00,
    is_active: true,
    created_at: '2026-01-11T00:00:00Z'
  },
  {
    id: 'prod-003',
    catalog_id: 'catalog-001',
    category_id: 'cat-002',
    title: '【徐福记】酥心糖礼盒900g',
    description: '传统糖果，经典味道，春节必备。',
    images: [
      'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=400'
    ],
    price: 68.00,
    is_active: true,
    created_at: '2026-01-12T00:00:00Z'
  },
  {
    id: 'prod-004',
    catalog_id: 'catalog-001',
    category_id: 'cat-003',
    title: '【燕窝】即食燕窝礼盒70g*6瓶',
    description: '滋补养颜，送礼佳品。',
    images: [
      'https://images.unsplash.com/photo-1574068305096-7c0b05b38987?w=400'
    ],
    price: 368.00,
    is_active: true,
    created_at: '2026-01-13T00:00:00Z'
  },
  {
    id: 'prod-005',
    catalog_id: 'catalog-002',
    category_id: 'cat-004',
    title: '【五芳斋】粽子礼盒1400g',
    description: '经典端午礼品，咸甜都有。',
    images: [
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400'
    ],
    price: 128.00,
    is_active: true,
    created_at: '2026-02-15T00:00:00Z'
  }
]

// 模拟线索数据
const MOCK_LEADS = [
  { id: 'lead-001', catalog_id: 'catalog-001', visitor_name: '张先生', visitor_phone: '13900139000', visitor_company: '某某公司', share_config: 'use_custom', created_at: '2026-01-20T10:00:00Z' },
  { id: 'lead-002', catalog_id: 'catalog-001', visitor_name: '李女士', visitor_phone: '13800138001', visitor_company: '某某企业', share_config: 'use_custom', created_at: '2026-01-21T14:30:00Z' },
  { id: 'lead-003', catalog_id: 'catalog-002', visitor_name: '王先生', visitor_phone: '13700137000', visitor_company: '某某集团', share_config: 'use_original', created_at: '2026-02-10T09:15:00Z' }
]

// 从本地存储加载数据或使用默认数据
function loadFromStorage(key, defaultData) {
  if (typeof window === 'undefined') return defaultData
  const stored = localStorage.getItem(key)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return defaultData
    }
  }
  return defaultData
}

// 保存到本地存储
function saveToStorage(key, data) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

// 模拟数据库客户端
export const mockDb = {
  // 用户相关
  async getUser(phone, password) {
    const users = loadFromStorage('mock_users', [MOCK_USER])
    return users.find(u => u.phone === phone && u.password === password) || null
  },

  async getUserById(id) {
    const users = loadFromStorage('mock_users', [MOCK_USER])
    return users.find(u => u.id === id) || null
  },

  // 画册相关
  async getCatalogs(userId) {
    const catalogs = loadFromStorage('mock_catalogs', MOCK_CATALOGS)
    return catalogs.filter(c => c.user_id === userId)
  },

  async getCatalogById(id) {
    const catalogs = loadFromStorage('mock_catalogs', MOCK_CATALOGS)
    return catalogs.find(c => c.id === id) || null
  },

  async createCatalog(data) {
    const catalogs = loadFromStorage('mock_catalogs', MOCK_CATALOGS)
    const newCatalog = {
      ...data,
      id: 'catalog-' + Date.now(),
      created_at: new Date().toISOString()
    }
    catalogs.push(newCatalog)
    saveToStorage('mock_catalogs', catalogs)
    return newCatalog
  },

  async updateCatalog(id, data) {
    const catalogs = loadFromStorage('mock_catalogs', MOCK_CATALOGS)
    const index = catalogs.findIndex(c => c.id === id)
    if (index >= 0) {
      catalogs[index] = { ...catalogs[index], ...data, updated_at: new Date().toISOString() }
      saveToStorage('mock_catalogs', catalogs)
      return catalogs[index]
    }
    return null
  },

  async deleteCatalog(id) {
    let catalogs = loadFromStorage('mock_catalogs', MOCK_CATALOGS)
    catalogs = catalogs.filter(c => c.id !== id)
    saveToStorage('mock_catalogs', catalogs)
    return { success: true }
  },

  // 分类相关
  async getCategories(catalogIds) {
    const categories = loadFromStorage('mock_categories', MOCK_CATEGORIES)
    return categories.filter(c => catalogIds.includes(c.catalog_id))
  },

  async getCategoriesByCatalogId(catalogId) {
    const categories = loadFromStorage('mock_categories', MOCK_CATEGORIES)
    return categories.filter(c => c.catalog_id === catalogId)
  },

  async getCategoryById(id) {
    const categories = loadFromStorage('mock_categories', MOCK_CATEGORIES)
    return categories.find(c => c.id === id) || null
  },

  async createCategory(data) {
    const categories = loadFromStorage('mock_categories', MOCK_CATEGORIES)
    const newCategory = {
      ...data,
      id: 'cat-' + Date.now(),
      created_at: new Date().toISOString()
    }
    categories.push(newCategory)
    saveToStorage('mock_categories', categories)
    return newCategory
  },

  async updateCategory(id, data) {
    const categories = loadFromStorage('mock_categories', MOCK_CATEGORIES)
    const index = categories.findIndex(c => c.id === id)
    if (index >= 0) {
      categories[index] = { ...categories[index], ...data }
      saveToStorage('mock_categories', categories)
      return categories[index]
    }
    return null
  },

  async deleteCategory(id) {
    let categories = loadFromStorage('mock_categories', MOCK_CATEGORIES)
    categories = categories.filter(c => c.id !== id)
    saveToStorage('mock_categories', categories)
    return { success: true }
  },

  // 产品相关
  async getProducts(catalogIds) {
    const products = loadFromStorage('mock_products', MOCK_PRODUCTS)
    return products.filter(p => catalogIds.includes(p.catalog_id))
  },

  async getProductsByCatalogId(catalogId) {
    const products = loadFromStorage('mock_products', MOCK_PRODUCTS)
    return products.filter(p => p.catalog_id === catalogId)
  },

  async getAllProducts() {
    return loadFromStorage('mock_products', MOCK_PRODUCTS)
  },

  async getProductById(id) {
    const products = loadFromStorage('mock_products', MOCK_PRODUCTS)
    return products.find(p => p.id === id) || null
  },

  async createProduct(data) {
    const products = loadFromStorage('mock_products', MOCK_PRODUCTS)
    const newProduct = {
      ...data,
      id: 'prod-' + Date.now(),
      created_at: new Date().toISOString()
    }
    products.push(newProduct)
    saveToStorage('mock_products', products)
    return newProduct
  },

  async updateProduct(id, data) {
    const products = loadFromStorage('mock_products', MOCK_PRODUCTS)
    const index = products.findIndex(p => p.id === id)
    if (index >= 0) {
      products[index] = { ...products[index], ...data, updated_at: new Date().toISOString() }
      saveToStorage('mock_products', products)
      return products[index]
    }
    return null
  },

  async deleteProduct(id) {
    let products = loadFromStorage('mock_products', MOCK_PRODUCTS)
    products = products.filter(p => p.id !== id)
    saveToStorage('mock_products', products)
    return { success: true }
  },

  // 线索相关
  async getLeads(catalogIds) {
    const leads = loadFromStorage('mock_leads', MOCK_LEADS)
    return leads.filter(l => catalogIds.includes(l.catalog_id))
  },

  async createLead(data) {
    const leads = loadFromStorage('mock_leads', MOCK_LEADS)
    const newLead = {
      ...data,
      id: 'lead-' + Date.now(),
      created_at: new Date().toISOString()
    }
    leads.push(newLead)
    saveToStorage('mock_leads', leads)
    return newLead
  },

  // 统计
  async getStats(userId) {
    const catalogs = loadFromStorage('mock_catalogs', MOCK_CATALOGS).filter(c => c.user_id === userId)
    const catalogIds = catalogs.map(c => c.id)
    const categories = loadFromStorage('mock_categories', MOCK_CATEGORIES).filter(c => catalogIds.includes(c.catalog_id))
    const products = loadFromStorage('mock_products', MOCK_PRODUCTS).filter(p => catalogIds.includes(p.catalog_id))
    const leads = loadFromStorage('mock_leads', MOCK_LEADS).filter(l => catalogIds.includes(l.catalog_id))
    
    return {
      catalogs: catalogs.length,
      categories: categories.length,
      products: products.length,
      leads: leads.length
    }
  }
}

export default mockDb