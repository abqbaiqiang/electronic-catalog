'use client'

import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Switch, message, Popconfirm, Select, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { mockDb } from '@/lib/mockData'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [catalogs, setCatalogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [form] = Form.useForm()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    setUser(storedUser)
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
        const categoriesData = await mockDb.getCategories(catalogIds)
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingCategory(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingCategory(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await mockDb.deleteCategory(id)
      message.success('删除成功')
      loadData(user.id)
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        await mockDb.updateCategory(editingCategory.id, {
          name: values.name,
          catalog_id: values.catalog_id,
          sort_order: values.sort_order || 0,
          is_visible: values.is_visible !== false
        })
        message.success('更新成功')
      } else {
        await mockDb.createCategory({
          catalog_id: values.catalog_id,
          name: values.name,
          sort_order: values.sort_order || 0,
          is_visible: values.is_visible !== false
        })
        message.success('创建成功')
      }
      
      setModalVisible(false)
      loadData(user.id)
    } catch (error) {
      message.error('操作失败')
    }
  }

  const getCatalogTitle = (catalogId) => {
    const catalog = catalogs.find(c => c.id === catalogId)
    return catalog?.title || '-'
  }

  const columns = [
    {
      title: '所属画册',
      dataIndex: 'catalog_id',
      key: 'catalog_id',
      render: (id) => getCatalogTitle(id)
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order'
    },
    {
      title: '显示',
      dataIndex: 'is_visible',
      key: 'is_visible',
      render: (visible) => visible ? <span style={{ color: '#52c41a' }}>是</span> : <span style={{ color: '#999' }}>否</span>
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
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
        <h2>分类管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建分类
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingCategory ? '编辑分类' : '新建分类'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
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
            <Select placeholder="请选择画册">
              {catalogs.map(catalog => (
                <Select.Option key={catalog.id} value={catalog.id}>
                  {catalog.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>

          <Form.Item
            name="sort_order"
            label="排序"
          >
            <Input type="number" placeholder="数字越小越靠前" />
          </Form.Item>

          <Form.Item
            name="is_visible"
            label="是否显示"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingCategory ? '保存' : '创建'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
