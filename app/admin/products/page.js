'use client'

import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Switch, message, Popconfirm, Select, InputNumber, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { mockDb } from '@/lib/mockData'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [catalogs, setCatalogs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form] = Form.useForm()
  const [user, setUser] = useState(null)
  const [selectedCatalog, setSelectedCatalog] = useState(null)

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    setUser(storedUser)
    loadData(storedUser.id)
  }, [])

  const loadData = async (userId) => {
    try {
      setLoading(true)
      // Load catalogs using mockDb
      const catalogsData = await mockDb.getCatalogs(userId)
      setCatalogs(catalogsData || [])

      if (catalogsData && catalogsData.length > 0) {
        const catalogIds = catalogsData.map(c => c.id)
        
        // Load categories
        const categoriesData = await mockDb.getCategories(catalogIds)
        setCategories(categoriesData || [])

        // Load products
        const productsData = await mockDb.getProducts(catalogIds)
        setProducts(productsData || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingProduct(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingProduct(record)
    setSelectedCatalog(record.catalog_id)
    form.setFieldsValue({
      ...record,
      images: record.images ? record.images.join('\n') : ''
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await mockDb.deleteProduct(id)
      message.success('删除成功')
      loadData(user.id)
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async (values) => {
    try {
      const productData = {
        catalog_id: values.catalog_id,
        category_id: values.category_id,
        title: values.title,
        description: values.description,
        price: values.price,
        images: values.images ? values.images.split('\n').filter(img => img.trim()) : [],
        is_active: values.is_active !== false
      }

      if (editingProduct) {
        await mockDb.updateProduct(editingProduct.id, productData)
        message.success('更新成功')
      } else {
        await mockDb.createProduct(productData)
        message.success('创建成功')
      }
      
      setModalVisible(false)
      loadData(user.id)
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleCatalogChange = (value) => {
    setSelectedCatalog(value)
    form.setFieldsValue({ category_id: undefined })
  }

  const getFilteredCategories = () => {
    if (!selectedCatalog) return []
    return categories.filter(c => c.catalog_id === selectedCatalog)
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || '-'
  }

  const getCatalogTitle = (catalogId) => {
    const catalog = catalogs.find(c => c.id === catalogId)
    return catalog?.title || '-'
  }

  const columns = [
    {
      title: '产品名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '所属画册',
      dataIndex: 'catalog_id',
      key: 'catalog_id',
      render: (catalogId) => getCatalogTitle(catalogId)
    },
    {
      title: '分类',
      dataIndex: 'category_id',
      key: 'category_id',
      render: (categoryId) => getCategoryName(categoryId)
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => price ? `¥${price}` : '-'
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (is_active) => is_active ? '上架' : '下架'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => window.open(`/${record.catalog_id}/product/${record.id}`, '_blank')}>
            查看
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加产品
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingProduct ? '编辑产品' : '添加产品'}
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
          <Form.Item name="catalog_id" label="所属画册" rules={[{ required: true, message: '请选择画册' }]}>
            <Select onChange={handleCatalogChange}>
              {catalogs.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.title}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="category_id" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select>
              {getFilteredCategories().map(c => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="title" label="产品名称" rules={[{ required: true, message: '请输入产品名称' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="description" label="产品描述">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="price" label="价格">
            <InputNumber style={{ width: '100%' }} min={0} precision={2} prefix="¥" />
          </Form.Item>

          <Form.Item name="images" label="图片链接（每行一个）">
            <Input.TextArea rows={3} placeholder="每行一个图片链接" />
          </Form.Item>

          <Form.Item name="is_active" label="上架" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingProduct ? '更新' : '创建'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
