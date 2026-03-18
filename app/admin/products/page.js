'use client'

import { useState, useEffect, useRef } from 'react'
import { Table, Button, Modal, Form, Input, Switch, message, Popconfirm, Select, InputNumber, Space, Upload, Image } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons'
import { mockDb } from '@/lib/mockData'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [catalogs, setCatalogs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectModalVisible, setSelectModalVisible] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form] = Form.useForm()
  const [user, setUser] = useState(null)
  const [selectedCatalog, setSelectedCatalog] = useState(null)
  const [imageList, setImageList] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    setUser(storedUser)
    loadData(storedUser.id)
  }, [])

  const loadData = async (userId) => {
    try {
      setLoading(true)
      const catalogsData = await mockDb.getCatalogs(userId)
      setCatalogs(catalogsData || [])

      if (catalogsData && catalogsData.length > 0) {
        const catalogIds = catalogsData.map(c => c.id)
        
        const categoriesData = await mockDb.getCategories(catalogIds)
        setCategories(categoriesData || [])

        const productsData = await mockDb.getProducts(catalogIds)
        setProducts(productsData || [])
      }

      const allProds = await mockDb.getAllProducts()
      setAllProducts(allProds || [])
    } catch (error) {
      console.error('Error loading data:', error)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setImageList([])
    form.resetFields()
    setSelectedCatalog(null)
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingProduct(record)
    setSelectedCatalog(record.catalog_id)
    setImageList(record.images || [])
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
        images: imageList,
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
      setImageList([])
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

  // 图片上传处理 - base64
  const handleImageUpload = (file) => {
    if (!file.type.startsWith('image/')) {
      message.error('请选择图片文件')
      return false
    }
    if (file.size > 2 * 1024 * 1024) {
      message.error('图片大小不能超过2MB')
      return false
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target.result
      setImageList(prev => [...prev, base64])
    }
    reader.readAsDataURL(file)
    return false // 阻止默认上传
  }

  const handleRemoveImage = (index) => {
    setImageList(prev => prev.filter((_, i) => i !== index))
  }

  const handleUrlAdd = () => {
    const urlValue = form.getFieldValue('images')
    if (urlValue && urlValue.trim()) {
      const urls = urlValue.split('\n').map(u => u.trim()).filter(u => u)
      setImageList(prev => [...prev, ...urls])
      form.setFieldsValue({ images: '' })
    }
  }

  // 从已有产品选择
  const handleOpenSelectModal = () => {
    setSearchKeyword('')
    setSelectModalVisible(true)
  }

  const getFilteredExistingProducts = () => {
    let filtered = allProducts.filter(p => p.id !== editingProduct?.id)
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase()
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(kw)
      )
    }
    return filtered
  }

  const handleSelectExistingProduct = (product) => {
    form.setFieldsValue({
      title: product.title,
      description: product.description,
      price: product.price
    })
    if (product.images && product.images.length > 0) {
      setImageList([...product.images])
    }
    setSelectModalVisible(false)
    message.success('已填充产品信息，可修改后保存')
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
      title: '产品图片',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images) => {
        if (!images || images.length === 0) return '-'
        return <img src={images[0]} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />
      }
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price) => price != null ? `\u00A5${price}` : '-'
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      render: (is_active) => is_active ? '上架' : '下架'
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => window.open(`/${record.catalog_id}/product/${record.id}`, '_blank')}>
            查看
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
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
        scroll={{ x: 800 }}
      />

      {/* 产品编辑/新建弹窗 */}
      <Modal
        title={editingProduct ? '编辑产品' : '添加产品'}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setImageList([]) }}
        footer={null}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item style={{ marginBottom: 12 }}>
            <Button icon={<CopyOutlined />} onClick={handleOpenSelectModal} block>
              从已有产品选择（快速填充信息）
            </Button>
          </Form.Item>

          <Form.Item name="catalog_id" label="所属画册" rules={[{ required: true, message: '请选择画册' }]}>
            <Select onChange={handleCatalogChange} showSearch optionFilterProp="children">
              {catalogs.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.title}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="category_id" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select showSearch optionFilterProp="children">
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
            <InputNumber style={{ width: '100%' }} min={0} precision={2} prefix="\u00A5" />
          </Form.Item>

          <Form.Item label="产品图片">
            <div style={{ marginBottom: 8 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => {
                  Array.from(e.target.files).forEach(file => handleImageUpload(file))
                  e.target.value = ''
                }}
              />
              <Upload.Dragger
                accept="image/*"
                multiple
                showUploadList={false}
                beforeUpload={(file) => { handleImageUpload(file); return false }}
                style={{ marginBottom: 8 }}
              >
                <p style={{ margin: '8px 0', color: '#1677ff' }}>点击或拖拽图片到此区域上传</p>
                <p style={{ margin: 0, color: '#999', fontSize: 12 }}>支持 JPG、PNG、GIF，单张不超过2MB</p>
              </Upload.Dragger>
            </div>

            {imageList.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {imageList.map((img, index) => (
                  <div key={index} style={{ position: 'relative', width: 80, height: 80 }}>
                    <Image
                      src={img}
                      alt=""
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                      preview={false}
                    />
                    <Button
                      type="text"
                      danger
                      size="small"
                      onClick={() => handleRemoveImage(index)}
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 20,
                        height: 20,
                        padding: 0,
                        minWidth: 20,
                        fontSize: 12,
                        borderRadius: '50%',
                        background: '#ff4d4f',
                        color: '#fff',
                        lineHeight: '20px',
                        textAlign: 'center'
                      }}
                    >
                      {"\u00D7"}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <Form.Item name="images" style={{ marginBottom: 0, flex: 1 }}>
                <Input.TextArea rows={2} placeholder="也可粘贴图片URL（每行一个）" />
              </Form.Item>
              <Button onClick={handleUrlAdd} style={{ alignSelf: 'flex-end' }}>
                添加URL
              </Button>
            </div>
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

      {/* 从已有产品选择弹窗 */}
      <Modal
        title="从已有产品选择"
        open={selectModalVisible}
        onCancel={() => setSelectModalVisible(false)}
        footer={null}
        width={640}
      >
        <Input
          placeholder="搜索产品名称..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          allowClear
          style={{ marginBottom: 12 }}
        />
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {getFilteredExistingProducts().length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>暂无可选择的产品</div>
          ) : (
            getFilteredExistingProducts().map(product => (
              <div
                key={product.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onClick={() => handleSelectExistingProduct(product)}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                <div style={{ width: 48, height: 48, marginRight: 12, flexShrink: 0 }}>
                  {product.images && product.images[0] ? (
                    <img src={product.images[0]} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                  ) : (
                    <div style={{ width: 48, height: 48, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 20 }}>+</div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {product.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                    {getCatalogTitle(product.catalog_id)} / {getCategoryName(product.category_id)}
                    {product.price != null && <span style={{ marginLeft: 8, color: '#ff4d4f' }}>{`\u00A5${product.price}`}</span>}
                  </div>
                </div>
                <Button type="link" size="small">选择</Button>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  )
}