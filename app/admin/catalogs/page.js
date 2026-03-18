'use client'

import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Switch, message, Popconfirm, Card, Image } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, QrcodeOutlined, LinkOutlined } from '@ant-design/icons'
import { mockDb } from '@/lib/mockData'

function getQrCodeUrl(url) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
}

export default function CatalogsPage() {
  const [catalogs, setCatalogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [qrModalVisible, setQrModalVisible] = useState(false)
  const [currentCatalog, setCurrentCatalog] = useState(null)
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

  const handleShowQrCode = (catalog) => {
    setCurrentCatalog(catalog)
    setQrModalVisible(true)
  }

  const handleCopyLink = (catalog) => {
    const link = getShareLink(catalog)
    navigator.clipboard.writeText(link).then(() => {
      message.success('链接已复制 ' + link)
    }).catch(() => {
      message.error('复制失败，请手动复制')
    })
  }

  const columns = [
    {
      title: '画册标题',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'Banner',
      dataIndex: 'banner_url',
      key: 'banner_url',
      width: 140,
      render: (url) => url ? <img src={url} alt="banner" style={{ width: 100, height: 50, objectFit: 'cover', borderRadius: 4 }} /> : '-'
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      render: (active) => active ? <span style={{ color: '#52c41a' }}>启用</span> : <span style={{ color: '#999' }}>禁用</span>
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text) => new Date(text).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => window.open(getShareLink(record), '_blank')}>
            预览
          </Button>
          <Button type="link" size="small" icon={<QrcodeOutlined />} onClick={() => handleShowQrCode(record)}>
            二维码
          </Button>
          <Button type="link" size="small" icon={<LinkOutlined />} onClick={() => handleCopyLink(record)}>
            链接
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </div>
      )
    }
  ]

  const shareLink = currentCatalog ? getShareLink(currentCatalog) : ''

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
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="画册标题" rules={[{ required: true, message: '请输入画册标题' }]}>
            <Input placeholder="请输入画册标题" />
          </Form.Item>
          <Form.Item name="banner_url" label="Banner图片地址">
            <Input placeholder="请输入Banner图片URL" />
          </Form.Item>
          <Form.Item name="share_image" label="微信分享图">
            <Input placeholder="请输入微信分享图URL" />
          </Form.Item>
          <Form.Item name="share_desc" label="微信分享描述">
            <Input.TextArea rows={2} placeholder="请输入微信分享描述" />
          </Form.Item>
          <Form.Item name="is_active" label="启用状态" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingCatalog ? '保存' : '创建'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="扫码查看画册"
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={null}
        width={400}
        centered
      >
        {currentCatalog && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ marginBottom: 12, color: '#666' }}>
              {currentCatalog.title}
            </p>
            <div style={{
              display: 'inline-block',
              padding: 16,
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: 16
            }}>
              <Image
                src={getQrCodeUrl(shareLink)}
                alt="QR Code"
                width={200}
                height={200}
                preview={false}
                style={{ display: 'block' }}
              />
            </div>
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>手机扫码即可查看画册</p>
              <Input.Group compact>
                <Input value={shareLink} readOnly style={{ width: 'calc(100% - 80px)' }} />
                <Button type="primary" onClick={() => handleCopyLink(currentCatalog)}>复制</Button>
              </Input.Group>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}