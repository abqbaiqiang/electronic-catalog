'use client'

import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table } from 'antd'
import {
  BookOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  TeamOutlined
} from '@ant-design/icons'
import { mockDb } from '@/lib/mockData'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    catalogs: 0,
    categories: 0,
    products: 0,
    leads: 0
  })
  const [recentLeads, setRecentLeads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.id) {
      loadStats(user.id)
    }
  }, [])

  const loadStats = async (userId) => {
    try {
      const data = await mockDb.getStats(userId)
      setStats(data)

      // Get recent leads
      const catalogs = await mockDb.getCatalogs(userId)
      const catalogIds = catalogs.map(c => c.id)
      const leads = await mockDb.getLeads(catalogIds)
      setRecentLeads(leads.slice(0, 5))
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const leadsColumns = [
    {
      title: '姓名',
      dataIndex: 'visitor_name',
      key: 'visitor_name'
    },
    {
      title: '电话',
      dataIndex: 'visitor_phone',
      key: 'visitor_phone'
    },
    {
      title: '公司',
      dataIndex: 'visitor_company',
      key: 'visitor_company'
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => new Date(text).toLocaleString('zh-CN')
    }
  ]

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>仪表盘</h1>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="画册数量"
              value={stats.catalogs}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="分类数量"
              value={stats.categories}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="产品数量"
              value={stats.products}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="线索数量"
              value={stats.leads}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="最近线索" style={{ marginTop: 24 }}>
        <Table
          columns={leadsColumns}
          dataSource={recentLeads}
          rowKey="id"
          pagination={false}
          loading={loading}
        />
      </Card>
    </div>
  )
}
