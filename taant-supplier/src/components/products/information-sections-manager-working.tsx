'use client'

import React from 'react'
import { Button, Input, Card, Typography, Collapse, Space, Row, Col } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, DragOutlined } from '@ant-design/icons'

const { Text } = Typography
const { Panel } = Collapse

interface InfoItem {
  id: string
  key: string
  value: string
}

interface InfoSection {
  id: string
  title: string
  items: InfoItem[]
  isExpanded: boolean
}

interface InformationSectionsManagerWorkingProps {
  sections: InfoSection[]
  onChange: (sections: InfoSection[]) => void
  title?: string
}

const InformationSectionsManagerWorking: React.FC<InformationSectionsManagerWorkingProps> = ({
  sections,
  onChange,
  title = 'Product Information Sections'
}) => {
  // Add new section with guaranteed unique ID
  const addSection = () => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    const newSection: InfoSection = {
      id: `section-${timestamp}-${random}`,
      title: `Section ${sections.length + 1}`,
      items: [
        { id: `item-${timestamp}-1`, key: '', value: '' }
      ],
      isExpanded: true
    }
    onChange([...sections, newSection])
  }

  // Remove section
  const removeSection = (sectionId: string) => {
    onChange(sections.filter(section => section.id !== sectionId))
  }

  // Update section
  const updateSection = (sectionId: string, updates: Partial<InfoSection>) => {
    onChange(sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    ))
  }

  // Add item to section
  const addItem = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (section) {
      const timestamp = Date.now()
      const random = Math.random().toString(36).substr(2, 9)
      const newItem: InfoItem = {
        id: `item-${timestamp}-${random}`,
        key: '',
        value: ''
      }
      updateSection(sectionId, {
        items: [...section.items, newItem],
        isExpanded: true
      })
    }
  }

  // Remove item from section
  const removeItem = (sectionId: string, itemId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (section && section.items.length > 1) {
      updateSection(sectionId, {
        items: section.items.filter(item => item.id !== itemId)
      })
    }
  }

  // Update item
  const updateItem = (sectionId: string, itemId: string, field: 'key' | 'value', value: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (section) {
      updateSection(sectionId, {
        items: section.items.map(item =>
          item.id === itemId ? { ...item, [field]: value } : item
        )
      })
    }
  }

  return (
    <div className="information-sections-manager-working">
      <Card
        size="small"
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>{title}</Text>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={addSection}
            >
              Add Section
            </Button>
          </div>
        }
      >
        {sections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
            <Text type="secondary">No sections added yet. Click "Add Section" to get started.</Text>
          </div>
        ) : (
          <Collapse
            activeKey={sections.filter(s => s.isExpanded).map(s => s.id)}
            onChange={(activeKeys) => {
              onChange(sections.map(section => ({
                ...section,
                isExpanded: activeKeys.includes(section.id)
              })))
            }}
            ghost
          >
            {sections.map((section) => (
              <Panel
                key={section.id}
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <DragOutlined style={{ color: '#999', cursor: 'grab' }} />
                      <Input
                        size="small"
                        value={section.title}
                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                        placeholder="Section title"
                        style={{ width: 200, fontWeight: 'bold' }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeSection(section.id)}
                        style={{ marginLeft: 8 }}
                      />
                    </div>
                  </div>
                }
              >
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {section.items.map((item, index) => (
                      <Row key={item.id} gutter={8} align="middle">
                        <Col span={1}>
                          <Text strong style={{ color: '#1890ff', fontSize: 12 }}>{index + 1}</Text>
                        </Col>
                        <Col span={8}>
                          <Input
                            size="small"
                            placeholder="Key (e.g., Weight)"
                            value={item.key}
                            onChange={(e) => updateItem(section.id, item.id, 'key', e.target.value)}
                          />
                        </Col>
                        <Col span={13}>
                          <Input
                            size="small"
                            placeholder="Value (e.g., 1kg)"
                            value={item.value}
                            onChange={(e) => updateItem(section.id, item.id, 'value', e.target.value)}
                          />
                        </Col>
                        <Col span={2}>
                          {section.items.length > 1 && (
                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => removeItem(section.id, item.id)}
                              style={{ width: '100%' }}
                            />
                          )}
                        </Col>
                      </Row>
                    ))}
                  </div>

                  <div style={{ marginTop: 8, textAlign: 'center' }}>
                    <Button
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => addItem(section.id)}
                      type="dashed"
                      style={{ width: '100%' }}
                    >
                      Add Item
                    </Button>
                  </div>
                </div>
              </Panel>
            ))}
          </Collapse>
        )}
      </Card>
    </div>
  )
}

export default InformationSectionsManagerWorking