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
// import { DndProvider } from 'react-dnd'
// import { useDrag, useDrop } from 'react-dnd'
import { DndProvider, useDrag, useDrop } from 'react-dnd/dist/index'
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
        marginBottom: 6,
      }}
    >
      <Row gutter={12} align="top">
        <Col span={1}>
          <div style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#1890ff',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 'bold',
            marginTop: 2
          }}>
            {index + 1}
          </div>
        </Col>
        <Col span={12}>
          <Input
            placeholder="Question"
            value={faq.question}
            onChange={(e) => onUpdate(faq.id, 'question', e.target.value)}
            style={{ fontWeight: 'bold', marginBottom: 4 }}
            size="small"
            prefix={<QuestionCircleOutlined style={{ color: '#1890ff', fontSize: '12px' }} />}
          />
          <TextArea
            placeholder="Answer"
            value={faq.answer}
            onChange={(e) => onUpdate(faq.id, 'answer', e.target.value)}
            rows={2}
            style={{ resize: 'none' }}
            size="small"
          />
        </Col>
        <Col span={11}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Space size="small">
              <Text type="secondary" style={{ fontSize: '12px' }}>Status:</Text>
              <Switch
                size="small"
                checked={faq.is_active}
                onChange={() => onToggleActive(faq.id)}
                checkedChildren="Active"
                unCheckedChildren="Hidden"
              />
              <Tag color={faq.is_active ? 'success' : 'default'} size="small">
                {faq.is_active ? 'Visible' : 'Hidden'}
              </Tag>
              {faq.question && faq.answer && (
                <Tag color="green" icon={<StarOutlined />} size="small">
                  Complete
                </Tag>
              )}
            </Space>
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onRemove(faq.id)}
            />
          </div>
          <div style={{ marginTop: 6, fontSize: '11px', color: '#666', display: 'flex', alignItems: 'center', gap: 4 }}>
            <DragOutlined style={{ fontSize: '10px' }} />
            <span>Drag • Pos: {index + 1}/{MAX_FAQS}</span>
          </div>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <Title level={5} style={{ margin: 0, marginBottom: 2 }}>Frequently Asked Questions</Title>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Manage customer Q&A • Max {MAX_FAQS} items
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={addFAQ}
            disabled={faqs.length >= MAX_FAQS}
            size="small"
          >
            Add FAQ ({faqs.length}/{MAX_FAQS})
          </Button>
        </div>

        {/* Compact Statistics & Progress */}
        {faqs.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
              <Space split={<span style={{ color: '#d9d9d9' }}>|</span>}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Total: <Text strong>{faqs.length}</Text>
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Active: <Text strong style={{ color: '#52c41a' }}>{activeFAQs.length}</Text>
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Complete: <Text strong style={{ color: '#1890ff' }}>{completeFAQs.length}</Text>
                </Text>
                {faqs.length - completeFAQs.length > 0 && (
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Incomplete: <Text strong style={{ color: '#faad14' }}>{faqs.length - completeFAQs.length}</Text>
                  </Text>
                )}
              </Space>
            </div>

            {/* Compact Progress Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  backgroundColor: '#f0f0f0',
                  borderRadius: 3,
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${(completeFAQs.length / faqs.length) * 100}%`,
                    backgroundColor: completeFAQs.length === faqs.length ? '#52c41a' : '#1890ff',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <Text type="secondary" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                {Math.round((completeFAQs.length / faqs.length) * 100)}% Complete
              </Text>
            </div>
          </div>
        )}

        {/* FAQ List */}
        <div style={{ display: 'grid', gap: 6 }}>
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
          <Card size="small">
            <div style={{ textAlign: 'center', padding: 24 }}>
              <div style={{ fontSize: 36, color: '#d9d9d9', marginBottom: 12 }}>
                <QuestionCircleOutlined />
              </div>
              <Text type="secondary" style={{ fontSize: '14px' }}>No FAQs created yet</Text>
              <div style={{ marginTop: 12 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={addFAQ} size="small">
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
            description={`Maximum ${MAX_FAQS} FAQs. Consider removing or combining existing FAQs.`}
            type="warning"
            showIcon
            size="small"
            style={{ marginTop: 8 }}
          />
        )}

      </div>
    </DndProvider>
  )
}

export default FAQManager