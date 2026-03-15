'use client'

import { useState, useEffect } from 'react'
import { Table, Input, Select, Space, Card } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { mockDb } from '@/lib/mockData'

const { Option } = Select

export default function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [catalogs, setCatalogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    keyword: '',
    catalog_id: ''
  })

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (storedUser.id) {
      loadData(storedUser.id)
    }
  }, [])

  const loadData = async (userId) => {
    try {
      const catalogsData = await mockDb.getCatalogs(userId)
      setCatalogs(catalogsData)

      if (catalogsData && catalogsData.length > 0) {
        const catalogIds = catalogsData.map(c => c.id)
        const leadsData = await mockDb.getLeads(catalogIds)
        setLeads(leadsData)
      }
    } catch (error) {
      console.error('Error loading leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value) => {
    setFilters({ ...filters, keyword: value })
  }

  const handleCatalogChange = (value) => {
    setFilters({ ...filters, catalog_id: value })
  }

  const getFilteredLeads = () => {
    let filtered = [...leads]

    if (filters.catalog_id) {
      filtered = filtered.filter(lead => lead.catalog_id === filters.catalog_id)
    }

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      filtered = filtered.filter(lead => 
        lead.visitor_name?.toLowerCase().includes(keyword) ||
        lead.visitor_phone?.includes(keyword) ||
        lead.visitor_company?.toLowerCase().includes(keyword)
      )
    }

    return filtered
  }

  const getCatalogTitle = (catalogId) => {
    const catalog = catalogs.find(c => c.id === catalogId)
    return catalog?.title || '-'
  }

  const columns = [
    { title: '姓名', dataIndex: 'visitor_name', key: 'visitor_name' },
    { title: '电话', dataIndex: 'visitor_phone', key: 'visitor_phone' },
    { title: '公司', dataIndex: 'visitor_company', key: 'visitor_company' },
    { title: '来源画册', dataIndex: 'catalog_id', key: 'catalog_id', render: (id) => getCatalogTitle(id) },
    { title: '分享配置', dataIndex: 'share_config', key: 'share_config', render: (config) => config === 'use_custom' ? '使用填写的信息' : '使用原画册信息' },
    { title: '时间', dataIndex: 'created_at', key: 'created_at', render: (text) => new Date(text).toLocaleString('zh-CN') }
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>线索管理</h2>
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input placeholder="搜索姓名/电话/公司" prefix={<SearchOutlined />} onChange={(e) => handleSearch(e.target.value)} style={{ width: 250 }} allowClear />
          <Select placeholder="筛选画册" style={{ width: 200 }} onChange={handleCatalogChange} allowClear>
            {catalogs.map(catalog => <Option key={catalog.id} value={catalog.id}>{catalog.title}</Option>)}
          </Select>
        </Space>
      </Card>
      <Table columns={columns} dataSource={getFilteredLeads()} rowKey="id" loading={loading} pagination={{ showSizeChanger: true, showQuickJumper: true, showTotal: (total) => `共 ${total} 条` }} />
    </div>
  )
}
