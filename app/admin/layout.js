'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Layout, Menu, Button, Dropdown, Avatar, Space, message, Spin } from 'antd'
import {
  DashboardOutlined,
  BookOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  TeamOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout

const menuItems = [
  {
    key: '/admin',
    icon: <DashboardOutlined />,
    label: '仪表盘'
  },
  {
    key: '/admin/catalogs',
    icon: <BookOutlined />,
    label: '画册管理'
  },
  {
    key: '/admin/categories',
    icon: <AppstoreOutlined />,
    label: '分类管理'
  },
  {
    key: '/admin/products',
    icon: <ShoppingOutlined />,
    label: '产品管理'
  },
  {
    key: '/admin/leads',
    icon: <TeamOutlined />,
    label: '线索管理'
  }
]

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 登录页面不检查认证
    if (pathname === '/admin/login') {
      setLoading(false)
      return
    }
    
    // Check if user is logged in
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/admin/login')
      return
    }
    setUser(JSON.parse(storedUser))
    setLoading(false)
  }, [router, pathname])

  const handleMenuClick = ({ key }) => {
    router.push(key)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    message.success('已退出登录')
    router.push('/admin/login')
  }

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 16 : 18,
          fontWeight: 'bold'
        }}>
          {collapsed ? '画册' : '电子画册管理'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 20px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user.company_name || user.name || '用户'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
