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

  useEffect(() => {
    // Get visitor info from localStorage
    const storedVisitor = localStorage.getItem('visitor')
    if (storedVisitor) {
      setVisitor(JSON.parse(storedVisitor))
    }
    
    if (catalogId) {
      loadData(catalogId)
    }
  }, [catalogId])

  const loadData = async (id) => {
    try {
      // Load catalog using mockDb
      const catalogData = await mockDb.getCatalogById(id)
      setCatalog(catalogData)

      // Load all catalogs to get categories
      const allCatalogs = await mockDb.getCatalogs('demo-user-001')
      const catalogIds = allCatalogs.map(c => c.id)
      
      // Load categories
      const categoriesData = await mockDb.getCategories(catalogIds)
      const filteredCategories = categoriesData.filter(c => c.catalog_id === id)
      setCategories(filteredCategories || [])
      
      if (filteredCategories && filteredCategories.length > 0) {
        setSelectedCategory(filteredCategories[0].id)
      }

      // Load products
      const productsData = await mockDb.getProducts(catalogIds)
      const filteredProducts = productsData.filter(p => p.catalog_id === id)
      setProducts(filteredProducts || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
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
    router.push(`/?id=${catalogId}`)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <DotLoading />
      </div>
    )
  }

  if (!catalog) {
    return (
      <div style={{ padding: 20 }}>
        <Empty description="画册不存在或已下架" />
      </div>
    )
  }

  const filteredProducts = getFilteredProducts()

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Banner */}
      <div style={{ 
        height: 180,
        background: catalog.banner_url 
          ? `url(${catalog.banner_url}) center/cover`
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative'
      }}>
        <div style={{ 
          position: 'absolute',
          bottom: 12,
          left: 12,
          right: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ color: '#fff' }}>
            <div style={{ fontSize: 18, fontWeight: 'bold' }}>
              {visitor?.shareConfig === 'use_custom' && visitor?.company 
                ? visitor.company 
                : catalog.title}
            </div>
            {visitor?.shareConfig === 'use_custom' && visitor?.name && (
              <div style={{ fontSize: 14, marginTop: 4 }}>
                {visitor.name} {visitor.phone}
              </div>
            )}
          </div>
          <button 
            onClick={handleGenerateLink}
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: 13,
              cursor: 'pointer',
              color: '#1677ff'
            }}
          >
            生成我的链接
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 180px)' }}>
        {/* Categories Sidebar */}
        <div style={{
          width: 80,
          background: '#fff',
          overflowY: 'auto'
        }}>
          {categories.map(category => (
            <div
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: '12px 8px',
                textAlign: 'center',
                fontSize: 13,
                cursor: 'pointer',
                background: selectedCategory === category.id ? '#f5f5f5' : '#fff',
                color: selectedCategory === category.id ? '#1677ff' : '#666',
                borderLeft: selectedCategory === category.id ? '3px solid #1677ff' : '3px solid transparent'
              }}
            >
              {category.name}
            </div>
          ))}
        </div>

        {/* Products Grid */}
        <div style={{
          flex: 1,
          padding: 12,
          overflowY: 'auto'
        }}>
          {filteredProducts.length === 0 ? (
            <Empty description="暂无产品" />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12
            }}>
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  style={{
                    background: '#fff',
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ 
                    height: 120,
                    background: product.images && product.images[0]
                      ? `url(${product.images[0]}) center/cover`
                      : '#eee'
                  }} />
                  <div style={{ padding: 8 }}>
                    <div style={{ 
                      fontSize: 13,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: 4
                    }}>
                      {product.title}
                    </div>
                    {product.price && (
                      <div style={{ color: '#ff4d4f', fontSize: 14, fontWeight: 'bold' }}>
                        ¥{product.price}
                      </div>
                    )}
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
