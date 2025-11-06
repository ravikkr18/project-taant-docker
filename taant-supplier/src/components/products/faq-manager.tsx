'use client'

import React, { useState } from 'react'
import {
  Button,
  Card,
  Input,
  Switch,
  Space,
  Typography,
  Popconfirm,
  Row,
  Col,
  Alert,
  Tag,
  message,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  QuestionCircleOutlined,
  DragOutlined,
  MenuOutlined,
  StarOutlined,
} from '@ant-design/icons'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

const { TextArea } = Input
const { Title, Text } = Typography

interface ProductFAQ {
  id: string
  question: string
  answer: string
  position: number
  is_active: boolean
}

interface FAQManagerProps {
  faqs: ProductFAQ[]
  onChange: (faqs: ProductFAQ[]) => void
}

const MAX_FAQS = 10

// Draggable FAQ Item Component
const DraggableFAQItem: React.FC<{
  faq: ProductFAQ
  index: number
  onMove: (dragIndex: number, hoverIndex: number) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, field: keyof ProductFAQ, value: any) => void
  onToggleActive: (id: string) => void
}> = ({ faq, index, onMove, onRemove, onUpdate, onToggleActive }) => {
  const ref = React.useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag({
    type: 'faq',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: 'faq',
    hover: (item: { index: number }) => {
      if (!ref.current) return
      const dragIndex = item.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) return
      onMove(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  drag(drop(ref))

  return (
    <Card
      ref={ref}
      size="small"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        transition: 'all 0.3s ease',
        marginBottom: 8,
      }}
    >
      <Row gutter={16} align="top">
        <Col span={1}>
          <div style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#1890ff',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            marginTop: 4
          }}>
            {index + 1}
          </div>
        </Col>
        <Col span={11}>
          <div style={{ marginBottom: 8 }}>
            <Input
              placeholder="Question"
              value={faq.question}
              onChange={(e) => onUpdate(faq.id, 'question', e.target.value)}
              style={{ fontWeight: 'bold' }}
              prefix={<QuestionCircleOutlined style={{ color: '#1890ff' }} />}
            />
          </div>
          <TextArea
            placeholder="Answer"
            value={faq.answer}
            onChange={(e) => onUpdate(faq.id, 'answer', e.target.value)}
            rows={2}
            style={{ resize: 'none' }}
          />
        </Col>
        <Col span={11}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Text type="secondary">Status:</Text>
              <Switch
                size="small"
                checked={faq.is_active}
                onChange={() => onToggleActive(faq.id)}
                checkedChildren="Active"
                unCheckedChildren="Hidden"
              />
            </Space>
            <Space>
              <Tag color={faq.is_active ? 'success' : 'default'} size="small">
                {faq.is_active ? 'Visible' : 'Hidden'}
              </Tag>
              <Button
                size="small"
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onRemove(faq.id)}
              />
            </Space>
          </div>
          <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
            <DragOutlined /> Drag to reorder • Position: {index + 1}/{MAX_FAQS}
          </div>
          {faq.question && faq.answer && (
            <div style={{ marginTop: 4 }}>
              <Tag color="green" size="small" icon={<StarOutlined />}>
                Complete
              </Tag>
            </div>
          )}
        </Col>
      </Row>
    </Card>
  )
}

const FAQManager: React.FC<FAQManagerProps> = ({ faqs, onChange }) => {
  // Add new FAQ
  const addFAQ = () => {
    if (faqs.length >= MAX_FAQS) {
      message.warning(`Maximum ${MAX_FAQS} FAQs allowed`)
      return
    }

    const newFAQ: ProductFAQ = {
      id: `temp-${Date.now()}`,
      question: '',
      answer: '',
      position: faqs.length,
      is_active: true
    }
    onChange([...faqs, newFAQ])
    message.success('New FAQ added')
  }

  // Remove FAQ
  const removeFAQ = (id: string) => {
    const updatedFAQs = faqs.filter(faq => faq.id !== id)
    // Update positions
    const repositionedFAQs = updatedFAQs.map((faq, index) => ({
      ...faq,
      position: index
    }))
    onChange(repositionedFAQs)
    message.success('FAQ removed')
  }

  // Update FAQ
  const updateFAQ = (id: string, field: keyof ProductFAQ, value: any) => {
    onChange(faqs.map(faq =>
      faq.id === id ? { ...faq, [field]: value } : faq
    ))
  }

  // Toggle FAQ active status
  const toggleActive = (id: string) => {
    onChange(faqs.map(faq =>
      faq.id === id ? { ...faq, is_active: !faq.is_active } : faq
    ))
  }

  // Move FAQ
  const moveFAQ = (dragIndex: number, hoverIndex: number) => {
    const dragFAQ = faqs[dragIndex]
    const newFAQs = [...faqs]
    newFAQs.splice(dragIndex, 1)
    newFAQs.splice(hoverIndex, 0, dragFAQ)

    // Update positions
    const repositionedFAQs = newFAQs.map((faq, index) => ({
      ...faq,
      position: index
    }))

    onChange(repositionedFAQs)
  }

  const activeFAQs = faqs.filter(faq => faq.is_active)
  const completeFAQs = faqs.filter(faq => faq.question.trim() !== '' && faq.answer.trim() !== '')

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Title level={4}>Frequently Asked Questions</Title>
            <Text type="secondary">
              Manage customer Q&A with a maximum of {MAX_FAQS} items
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={addFAQ}
            disabled={faqs.length >= MAX_FAQS}
          >
            Add FAQ ({faqs.length}/{MAX_FAQS})
          </Button>
        </div>

        {/* Statistics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
          <Card size="small">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary">Total FAQs</Text>
              <Text strong>{faqs.length}</Text>
            </div>
          </Card>
          <Card size="small">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary">Active</Text>
              <Text strong style={{ color: '#52c41a' }}>{activeFAQs.length}</Text>
            </div>
          </Card>
          <Card size="small">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary">Complete</Text>
              <Text strong style={{ color: '#1890ff' }}>{completeFAQs.length}</Text>
            </div>
          </Card>
          <Card size="small">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary">Incomplete</Text>
              <Text strong style={{ color: '#faad14' }}>
                {faqs.length - completeFAQs.length}
              </Text>
            </div>
          </Card>
        </div>

        {/* Progress Bar */}
        {faqs.length > 0 && (
          <Alert
            message={`FAQ Progress: ${completeFAQs.length} of ${faqs.length} completed`}
            description={
              <div style={{ marginTop: 8 }}>
                <div
                  style={{
                    width: '100%',
                    height: 8,
                    backgroundColor: '#f0f0f0',
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${(completeFAQs.length / faqs.length) * 100}%`,
                      backgroundColor: '#52c41a',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {Math.round((completeFAQs.length / faqs.length) * 100)}% Complete
                </Text>
              </div>
            }
            type={completeFAQs.length === faqs.length ? 'success' : 'info'}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* FAQ List */}
        <div style={{ display: 'grid', gap: 8 }}>
          {faqs.map((faq, index) => (
            <DraggableFAQItem
              key={faq.id}
              faq={faq}
              index={index}
              onMove={moveFAQ}
              onRemove={removeFAQ}
              onUpdate={updateFAQ}
              onToggleActive={toggleActive}
            />
          ))}
        </div>

        {/* Empty State */}
        {faqs.length === 0 && (
          <Card>
            <div style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }}>
                <QuestionCircleOutlined />
              </div>
              <Text type="secondary">No FAQs created yet</Text>
              <div style={{ marginTop: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={addFAQ}>
                  Add Your First FAQ
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Limit Warning */}
        {faqs.length >= MAX_FAQS && (
          <Alert
            message="FAQ Limit Reached"
            description={`You have reached the maximum limit of ${MAX_FAQS} FAQs. Consider removing or combining existing FAQs.`}
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}

          </div>
    </DndProvider>
  )
}

export default FAQManager