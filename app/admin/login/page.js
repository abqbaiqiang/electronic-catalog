'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { mockDb } from '@/lib/mockData'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (values) => {
    setLoading(true)
    try {
      // 使用模拟数据库登录
      const user = await mockDb.getUser(values.phone, values.password)

      if (!user) {
        message.error('手机号或密码错误')
        return
      }

      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(user))
      message.success('登录成功')
      
      // Redirect to admin dashboard
      router.push('/admin')
    } catch (error) {
      message.error('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5'
    }}>
      <Card
        title={<h2 style={{ textAlign: 'center', margin: 0 }}>电子画册管理后台</h2>}
        style={{ width: 400 }}
      >
        <Form
          name="login"
          onFinish={handleLogin}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="phone"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="手机号"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
            演示账号: 13800138000 / 123456
          </div>
        </Form>
      </Card>
    </div>
  )
}
