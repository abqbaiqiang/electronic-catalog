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
      // Load catalogs
      const { data: catalogsData } = await supabase
        .from(TABLES.CATALOGS)
        .select('id, title')
        .eq('user_id', userId)
      
      setCatalogs(catalogsData || [])

      if (catalogsData && catalogsData.length > 0) {
        const catalogIds = catalogsData.map(c => c.id)
        
        // Load categories
        const { data: categoriesData } = await supabase
          .from(TABLES.CATEGORIES)
          .select('id, name, catalog_id')
          .in('catalog_id', catalogIds)
          .eq('is_visible', true)
        
        setCategories(categoriesData || [])

        // Load products
        const { data, error } = await supabase
          .from(TABLES.PRODUCTS)
          .select('*')
          .in('catalog_id', catalogIds)
          .order('created_at', { ascending: false })

        if (error) throw error
        setProducts(data || [])
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
      const { error } = await supabase
        .from(TABLES.PRODUCTS)
        .delete()
        .eq('id', id)

      if (error) throw error
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
        const { error } = await supabase
          .from(TABLES.PRODUCTS)
          .update({
            ...productData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProduct.id)

        if (error) throw error
        message.success('更新成功')
      } else {
        const { error } = await supabase
          .from(TABLES.PRODUCTS)
          .insert(productData)

        if (error) throw error
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
      title: '产品图片',
      dataIndex: 'images',
      key: 'images',
      render: (images) => images && images.length > 0 
        ? <img src={images[0]} alt="product" style={{ width: 60, height: 60, objectFit: 'cover' }} /> 
        : '-'
    },
    {
      title: '产品名称',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '所属画册',
      dataIndex: 'catalog_id',
      key: 'catalog_id',
      render: (id) => getCatalogTitle(id)
    },
    {
      title: '分类',
      dataIndex: 'category_id',
      key: 'category_id',
      render: (id) => getCategoryName(id)
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
      render: (active) => active ? <span style={{ color: '#52c41a' }}>上架</span> : <span style={{ color: '#999' }}>下架</span>
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => {
            // Preview product
          }}>
            预览
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>产品管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建产品
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingProduct ? '编辑产品' : '新建产品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="catalog_id"
            label="所属画册"
            rules={[{ required: true, message: '请选择画册' }]}
          >
            <Select 
              placeholder="请选择画册" 
              onChange={handleCatalogChange}
              disabled={!!editingProduct}
            >
              {catalogs.map(catalog => (
                <Select.Option key={catalog.id} value={catalog.id}>
                  {catalog.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="category_id"
            label="所属分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              {getFilteredCategories().map(category => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="产品名称"
            rules={[{ required: true, message: '请输入产品名称' }]}
          >
            <Input placeholder="请输入产品名称" />
          </Form.Item>

          <Form.Item
            name="price"
            label="价格"
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="请输入价格" 
              prefix="¥"
              min={0}
              precision={2}
            />
          </Form.Item>

          <Form.Item
            name="images"
            label="产品图片（每行一张）"
          >
            <Input.TextArea 
              rows={4} 
              placeholder="请输入图片地址，每行一张" 
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="产品详情"
          >
            <Input.TextArea 
              rows={4} 
              placeholder="请输入产品详情描述" 
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="上架状态"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingProduct ? '保存' : '创建'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
