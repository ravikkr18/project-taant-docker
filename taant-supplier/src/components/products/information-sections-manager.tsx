'use client'

import React, { useState } from 'react'
import { Button, Input, Card, Typography, Collapse, Space, Row, Col, Switch } from 'antd'
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

interface InformationSectionsManagerProps {
  sections: InfoSection[]
  onChange: (sections: InfoSection[]) => void
  title?: string
}

const InformationSectionsManager: React.FC<InformationSectionsManagerProps> = ({
  sections,
  onChange,
  title = 'Product Information Sections'
}) => {
  // Add a default section on first render if sections are empty
  React.useEffect(() => {
    if (sections.length === 0) {
      const defaultSection: InfoSection = {
        id: `section-1`,
        title: 'Product Specifications',
        items: [
          { id: `item-1`, key: 'Weight', value: '' },
          { id: `item-2`, key: 'Dimensions', value: '' },
          { id: `item-3`, key: 'Material', value: '' }
        ],
        isExpanded: true
      }
      onChange([defaultSection])
    }
  }, []) // Only run once on mount
  // Predefined section templates
  const sectionTemplates = [
    {
      title: 'Technical Specifications',
      items: [
        { key: 'Screen Size', value: '' },
        { key: 'Resolution', value: '' },
        { key: 'Processor', value: '' },
        { key: 'RAM', value: '' },
        { key: 'Storage', value: '' }
      ]
    },
    {
      title: 'Physical Specifications',
      items: [
        { key: 'Dimensions', value: '' },
        { key: 'Weight', value: '' },
        { key: 'Material', value: '' },
        { key: 'Color Options', value: '' }
      ]
    },
    {
      title: 'Connectivity',
      items: [
        { key: 'Wi-Fi', value: '' },
        { key: 'Bluetooth', value: '' },
        { key: 'USB Ports', value: '' },
        { key: 'Audio Jack', value: '' }
      ]
    },
    {
      title: 'Power & Battery',
      items: [
        { key: 'Battery Capacity', value: '' },
        { key: 'Battery Life', value: '' },
        { key: 'Charging Time', value: '' },
        { key: 'Power Adapter', value: '' }
      ]
    },
    {
      title: 'What\'s in the Box',
      items: [
        { key: 'Main Product', value: '' },
        { key: 'Charging Cable', value: '' },
        { key: 'User Manual', value: '' },
        { key: 'Warranty Card', value: '' }
      ]
    },
    {
      title: 'Software & Features',
      items: [
        { key: 'Operating System', value: '' },
        { key: 'Special Features', value: '' },
        { key: 'Apps Included', value: '' },
        { key: 'Updates', value: '' }
      ]
    }
  ]

  // Add new section
  const addSection = (template?: typeof sectionTemplates[0]) => {
    const newSection: InfoSection = {
      id: `section-${Date.now()}`,
      title: template?.title || `Section ${sections.length + 1}`,
      items: template?.items.map(item => ({
        ...item,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      })) || [{ id: `item-${Date.now()}`, key: '', value: '' }],
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
      const newItem: InfoItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        key: '',
        value: ''
      }
      updateSection(sectionId, {
        items: [...section.items, newItem],
        isExpanded: true // Expand section when item is added
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
  const updateItem = (sectionId: string, itemId: string, updates: Partial<InfoItem>) => {
    const section = sections.find(s => s.id === sectionId)
    if (section) {
      updateSection(sectionId, {
        items: section.items.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        )
      })
    }
  }

  return (
    <div className="information-sections-manager">
      <Card
        size="small"
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>{title}</Text>
            <Space>
              <Button size="small" icon={<PlusOutlined />} onClick={() => addSection()}>
                Custom Section
              </Button>
            </Space>
          </div>
        }
      >
        {/* Quick Add Templates */}
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
            Quick add common sections:
          </Text>
          <Space size="small" wrap>
            {sectionTemplates.map((template, index) => (
              <Button
                key={index}
                size="small"
                type="link"
                onClick={() => addSection(template)}
                style={{ padding: '0 4px', height: 'auto' }}
              >
                {template.title}
              </Button>
            ))}
          </Space>
        </div>

        {/* Sections */}
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
                {/* Section Items */}
                <div style={{ display: 'grid', gap: 8 }}>
                  {section.items.map((item, index) => (
                    <Row key={item.id} gutter={8} align="middle">
                      <Col span={1}>
                        <Text strong style={{ color: '#1890ff', fontSize: 12 }}>{index + 1}</Text>
                      </Col>
                      <Col span={8}>
                        <Input
                          size="small"
                          placeholder="Key (e.g., Screen Size)"
                          value={item.key}
                          onChange={(e) => updateItem(section.id, item.id, { key: e.target.value })}
                        />
                      </Col>
                      <Col span={13}>
                        <Input
                          size="small"
                          placeholder="Value (e.g., 6.5 inches)"
                          value={item.value}
                          onChange={(e) => updateItem(section.id, item.id, { value: e.target.value })}
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

                {/* Add Item Button */}
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

        {/* Empty State */}
        {sections.length === 0 && (
          <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
            <Text type="secondary">No information sections created yet</Text>
            <div style={{ marginTop: 8 }}>
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => addSection()}>
                  Add Custom Section
                </Button>
                <Button icon={<PlusOutlined />} onClick={() => addSection(sectionTemplates[0])}>
                  Add Technical Specs
                </Button>
              </Space>
            </div>
          </div>
        )}

        {/* Tips */}
        <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f6f8fa', borderRadius: 4 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <strong>Tips:</strong>
          </Text>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: 16, color: '#666', fontSize: 12 }}>
            <li>Use templates for common product information categories</li>
            <li>Customize section titles and add/remove key-value pairs as needed</li>
            <li>Keep keys concise and descriptive</li>
            <li>Include all relevant technical specifications</li>
            <li>Group related information together</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}

export default InformationSectionsManager