'use client'

import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Switch, message, Popconfirm, Card } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, QrcodeOutlined } from '@ant-design/icons'
import { mockDb } from '@/lib/mockData'

export default function CatalogsPage() {
  const [catalogs, setCatalogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCatalog, setEditingCatalog] = useState(null)
  const [form] = Form.useForm()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    setUser(storedUser)
    if (storedUser.id) {
      loadCatalogs(storedUser.id)
    }
  }, [])

  const loadCatalogs = async (userId) => {
    try {
      const data = await mockDb.getCatalogs(userId)
      setCatalogs(data)
    } catch (error) {
      console.error('Error loading catalogs:', error)
      message.error('加载画册失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingCatalog(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingCatalog(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await mockDb.deleteCatalog(id)
      message.success('删除成功')
      loadCatalogs(user.id)
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async (values) => {
    try {
      if (editingCatalog) {
        await mockDb.updateCatalog(editingCatalog.id, {
          title: values.title,
          banner_url: values.banner_url,
          share_image: values.share_image,
          share_desc: values.share_desc,
          is_active: values.is_active !== false
        })
        message.success('更新成功')
      } else {
        await mockDb.createCatalog({
          user_id: user.id,
          title: values.title,
          banner_url: values.banner_url,
          share_image: values.share_image,
          share_desc: values.share_desc,
          is_active: values.is_active !== false
        })
        message.success('创建成功')
      }
      
      setModalVisible(false)
      loadCatalogs(user.id)
    } catch (error) {
      message.error('操作失败')
    }
  }

  const getShareLink = (catalog) => {
    return `${window.location.origin}/${catalog.id}`
  }

  const columns = [
    {
      title: '画册标题',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'Banner图',
      dataIndex: 'banner_url',
      key: 'banner_url',
      render: (url) => url ? <img src={url} alt="banner" style={{ width: 100, height: 50, objectFit: 'cover' }} /> : '-'
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => active ? <span style={{ color: '#52c41a' }}>启用</span> : <span style={{ color: '#999' }}>禁用</span>
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => new Date(text).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => window.open(getShareLink(record), '_blank')}
          >
            预览
          </Button>
          <Button 
            type="link" 
            icon={<QrcodeOutlined />}
            onClick={() => {
              const link =getShareLink(record)
              navigator.clipboard.writeText(link)
              message.success('链接已复制: ' + link)
            }}
          >
            链接
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </div>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>画册管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建画册
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={catalogs}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingCatalog ? '编辑画册' : '新建画册'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="画册标题"
            rules={[{ required: true, message: '请输入画册标题' }]}
          >
            <Input placeholder="请输入画册标题" />
          </Form.Item>

          <Form.Item
            name="banner_url"
            label="Banner图片地址"
          >
            <Input placeholder="请输入Banner图片URL" />
          </Form.Item>

          <Form.Item
            name="share_image"
            label="微信分享图"
          >
            <Input placeholder="请输入微信分享图URL" />
          </Form.Item>

          <Form.Item
            name="share_desc"
            label="微信分享描述"
          >
            <Input.TextArea rows={2} placeholder="请输入微信分享描述" />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="启用状态"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingCatalog ? '保存' : '创建'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
