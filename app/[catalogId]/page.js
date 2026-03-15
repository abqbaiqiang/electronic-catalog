'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DotLoading, Empty } from 'antd-mobile'
import { mockDb } from '@/lib/mockData'

export default function CatalogHomePage() {
  const params = useParams()
  const router = useRouter()
  const catalogId = params.catalogId

  const [catalog, setCatalog] = useState(null)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [visitor, setVisitor] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    phone: ''
  })

  useEffect(() => {
    const storedVisitor = localStorage.getItem('visitor')
    if (storedVisitor) {
      setVisitor(JSON.parse(storedVisitor))
    } else {
      setShowForm(true)
    }
    
    if (catalogId) {
      loadData(catalogId)
    }
  }, [catalogId])

  const loadData = async (id) => {
    try {
      const catalogData = await mockDb.getCatalogById(id)
      if (!catalogData) {
        setLoading(false)
        return
      }
      setCatalog(catalogData)

      // Get all catalogs to get categories
      const allCatalogs = await mockDb.getCatalogs('demo-user-001')
      const allCatalogIds = allCatalogs.map(c => c.id)
      const allCategories = await mockDb.getCategories(allCatalogIds)
      const filteredCategories = allCategories.filter(c => c.catalog_id === id && c.is_visible)
      setCategories(filteredCategories)
      
      if (filteredCategories.length > 0) {
        setSelectedCategory(filteredCategories[0].id)
      }

      const allProducts = await mockDb.getProducts(allCatalogIds)
      const filteredProducts = allProducts.filter(p => p.catalog_id === id && p.is_active)
      setProducts(filteredProducts)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.company || !formData.name || !formData.phone) {
      alert('请填写完整信息')
      return
    }

    try {
      await mockDb.createLead({
        catalog_id: catalogId,
        visitor_name: formData.name,
        visitor_phone: formData.phone,
        visitor_company: formData.company,
        share_config: 'use_custom'
      })

      localStorage.setItem('visitor', JSON.stringify(formData))
      setVisitor(formData)
      setShowForm(false)
    } catch (error) {
      console.error('Error saving visitor:', error)
    }
  }

  const getFilteredProducts = () => {
    if (!selectedCategory) return products
    return products.filter(p => p.category_id === selectedCategory)
  }

  const handleProductClick = (productId) => {
    router.push(`/${catalogId}/product/${productId}`)
  }

  const handleGenerateLink = () => {
    setShowForm(true)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <DotLoading />
      </div>
    )
  }

  if (!catalog) {
    return <div style={{ padding: 20 }}><Empty description="画册不存在或已下架" /></div>
  }

  if (showForm && !visitor) {
    return (
      <div style={{ minHeight: '100vh', background: catalog.banner_url ? `url(${catalog.banner_url}) center/cover` : '#1677ff', padding: '60px 20px 40px' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
          <h2 style={{ textAlign: 'center', marginBottom: 24, fontSize: 20 }}>{catalog.title}</h2>
          <form onSubmit={handleFormSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>公司名称 *</label>
              <input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="请输入公司名称" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9d9d9', borderRadius: 8, fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>联系人 *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="请输入联系人姓名" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9d9d9', borderRadius: 8, fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>手机号 *</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="请输入联系人手机号" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9d9d9', borderRadius: 8, fontSize: 14 }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '12px 0', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>查看画册</button>
          </form>
          <div style={{ textAlign: 'center', color: '#999', fontSize: 12, marginTop: 16 }}>保存完成信息后，请点击右上角分享</div>
        </div>
      </div>
    )
  }

  const filteredProducts = getFilteredProducts()

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ height: 180, background: catalog.banner_url ? `url(${catalog.banner_url}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#fff' }}>
            <div style={{ fontSize: 18, fontWeight: 'bold' }}>{visitor?.company || catalog.title}</div>
            {visitor?.name && <div style={{ fontSize: 14, marginTop: 4 }}>{visitor.name} {visitor.phone}</div>}
          </div>
          <button onClick={handleGenerateLink} style={{ background: 'rgba(255,255,255,0.9)', border: 'none', padding: '8px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer', color: '#1677ff' }}>生成我的链接</button>
        </div>
      </div>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 180px)' }}>
        <div style={{ width: 80, background: '#fff', overflowY: 'auto' }}>
          {categories.map(category => (
            <div key={category.id} onClick={() => setSelectedCategory(category.id)} style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, cursor: 'pointer', background: selectedCategory === category.id ? '#f5f5f5' : '#fff', color: selectedCategory === category.id ? '#1677ff' : '#666', borderLeft: selectedCategory === category.id ? '3px solid #1677ff' : '3px solid transparent' }}>{category.name}</div>
          ))}
        </div>
        <div style={{ flex: 1, padding: 12, overflowY: 'auto' }}>
          {filteredProducts.length === 0 ? <Empty description="暂无产品" /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {filteredProducts.map(product => (
                <div key={product.id} onClick={() => handleProductClick(product.id)} style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ height: 120, background: product.images && product.images[0] ? `url(${product.images[0]}) center/cover` : '#eee' }} />
                  <div style={{ padding: 8 }}>
                    <div style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{product.title}</div>
                    {product.price && <div style={{ color: '#ff4d4f', fontSize: 14, fontWeight: 'bold' }}>¥{product.price}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
