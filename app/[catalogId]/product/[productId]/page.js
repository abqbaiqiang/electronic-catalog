'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DotLoading, Empty } from 'antd-mobile'
import { mockDb } from '@/lib/mockData'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { catalogId, productId } = params

  const [product, setProduct] = useState(null)
  const [catalog, setCatalog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [visitor, setVisitor] = useState(null)

  useEffect(() => {
    const storedVisitor = localStorage.getItem('visitor')
    if (storedVisitor) {
      setVisitor(JSON.parse(storedVisitor))
    }
    
    if (productId) {
      loadData(productId)
    }
  }, [productId])

  const loadData = async (id) => {
    try {
      const productData = await mockDb.getProductById(id)
      if (!productData) {
        setLoading(false)
        return
      }
      setProduct(productData)

      if (productData?.catalog_id) {
        const catalogData = await mockDb.getCatalogById(productData.catalog_id)
        setCatalog(catalogData)
      }
    } catch (error) {
      console.error('Error loading product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push(`/${catalogId}`)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <DotLoading />
      </div>
    )
  }

  if (!product) {
    return <div style={{ padding: 20 }}><Empty description="产品不存在" /></div>
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: 80, maxWidth: 750, margin: '0 auto' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        <span onClick={handleBack} style={{ fontSize: 16, cursor: 'pointer' }}>{"\u2190"} 返回</span>
        <span style={{ fontWeight: 'bold' }}>产品详情</span>
        <span style={{ visibility: 'hidden' }}>占位</span>
      </div>

      {product.images && product.images.length > 0 && (
        <div style={{ height: 300, background: '#fff' }}>
          <div style={{ height: 300, background: `url(${product.images[0]}) center/contain no-repeat`, backgroundColor: '#fff' }} />
        </div>
      )}

      <div style={{ background: '#fff', padding: 16, marginTop: 8 }}>
        <h1 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>{product.title}</h1>
        {product.price != null && <div style={{ color: '#ff4d4f', fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>{"\u00A5"}{product.price}</div>}
        {visitor?.company && (
          <div style={{ background: '#f5f5f5', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{visitor.company}</div>
            <div style={{ color: '#666' }}>{visitor.name} {visitor.phone}</div>
          </div>
        )}
      </div>

      {product.description && (
        <div style={{ background: '#fff', padding: 16, marginTop: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>产品详情</h3>
          <div style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#666' }}>{product.description}</div>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', padding: '12px 16px', boxShadow: '0 -1px 4px rgba(0,0,0,0.1)' }}>
        {visitor?.phone ? (
          <a href={`tel:${visitor.phone}`} style={{ display: 'block', background: '#1677ff', color: '#fff', textAlign: 'center', padding: '12px 0', borderRadius: 8, fontSize: 16, textDecoration: 'none' }}>联系客服</a>
        ) : (
          <div style={{ textAlign: 'center', color: '#999', fontSize: 14, padding: '12px 0' }}>请先填写联系信息以查看画册</div>
        )}
      </div>
    </div>
  )
}