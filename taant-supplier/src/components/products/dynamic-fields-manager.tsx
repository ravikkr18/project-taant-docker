'use client'

import React, { useState } from 'react'
import { Button, Input, InputNumber, Select, Row, Col, Space, Card, Typography } from 'antd'
import { PlusOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons'

const { Text } = Typography
const { Option } = Select

interface DynamicField {
  id: string
  name: string
  type: 'text' | 'number' | 'select'
  value: string | number | null
  options?: string[] // for select type
}

interface DynamicFieldsManagerProps {
  fields: DynamicField[]
  onChange: (fields: DynamicField[]) => void
  title?: string
  placeholder?: string
}

const DynamicFieldsManager: React.FC<DynamicFieldsManagerProps> = ({
  fields,
  onChange,
  title = 'Dynamic Fields',
  placeholder = 'Add custom fields'
}) => {
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'select'>('text')

  // Common field types to choose from
  const commonFieldTypes = [
    { name: 'Weight Unit', type: 'select' as const, options: ['kg', 'g', 'lb', 'oz'] },
    { name: 'Dimensions Unit', type: 'select' as const, options: ['cm', 'in', 'mm'] },
    { name: 'Material', type: 'text' as const },
    { name: 'Finish', type: 'text' as const },
    { name: 'Power Source', type: 'select' as const, options: ['Battery', 'Electric', 'Manual', 'Solar'] },
    { name: 'Voltage', type: 'number' as const },
    { name: 'Wattage', type: 'number' as const },
    { name: 'Frequency', type: 'select' as const, options: ['50Hz', '60Hz', 'Dual'] },
    { name: 'Water Resistance', type: 'text' as const },
    { name: 'Certification', type: 'text' as const },
    { name: 'Package Type', type: 'select' as const, options: ['Box', 'Blister Pack', 'Bag', 'Custom'] },
    { name: 'Shelf Life', type: 'text' as const },
  ]

  // Add new field
  const addField = (fieldName?: string, fieldType?: 'text' | 'number' | 'select', options?: string[]) => {
    const newField: DynamicField = {
      id: `field-${Date.now()}`,
      name: fieldName || '',
      type: fieldType || newFieldType,
      value: fieldType === 'number' ? null : '',
      options: options || (fieldType === 'select' ? [] : undefined)
    }
    onChange([...fields, newField])
  }

  // Remove field
  const removeField = (fieldId: string) => {
    onChange(fields.filter(field => field.id !== fieldId))
  }

  // Update field
  const updateField = (fieldId: string, updates: Partial<DynamicField>) => {
    onChange(fields.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    ))
  }

  // Add option to select field
  const addSelectOption = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId)
    if (field && field.type === 'select') {
      const newOptions = [...(field.options || []), '']
      updateField(fieldId, { options: newOptions })
    }
  }

  // Remove option from select field
  const removeSelectOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find(f => f.id === fieldId)
    if (field && field.type === 'select' && field.options) {
      const newOptions = field.options.filter((_, index) => index !== optionIndex)
      updateField(fieldId, { options: newOptions })
    }
  }

  // Update select option
  const updateSelectOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = fields.find(f => f.id === fieldId)
    if (field && field.type === 'select' && field.options) {
      const newOptions = [...field.options]
      newOptions[optionIndex] = value
      updateField(fieldId, { options: newOptions })
    }
  }

  return (
    <div className="dynamic-fields-manager">
      <Card
        size="small"
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>{title}</Text>
            <Button size="small" icon={<PlusOutlined />} onClick={() => addField()}>
              Add Field
            </Button>
          </div>
        }
      >
        {/* Quick Add Common Fields */}
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
            Quick add common fields:
          </Text>
          <Space size="small" wrap>
            {commonFieldTypes.map((commonField, index) => (
              <Button
                key={index}
                size="small"
                type="link"
                onClick={() => addField(commonField.name, commonField.type, commonField.options)}
                style={{ padding: '0 4px', height: 'auto' }}
              >
                {commonField.name}
              </Button>
            ))}
          </Space>
        </div>

        {/* Fields List */}
        <div style={{ display: 'grid', gap: 12 }}>
          {fields.map((field, index) => (
            <div key={field.id} style={{
              padding: 12,
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              backgroundColor: '#fafafa'
            }}>
              <Row gutter={8} align="middle">
                <Col span={1}>
                  <Text strong style={{ color: '#1890ff' }}>{index + 1}</Text>
                </Col>
                <Col span={7}>
                  <Input
                    placeholder="Field name (e.g., Material)"
                    value={field.name}
                    onChange={(e) => updateField(field.id, { name: e.target.value })}
                  />
                </Col>
                <Col span={4}>
                  <Select
                    value={field.type}
                    onChange={(value) => updateField(field.id, {
                      type: value,
                      value: value === 'number' ? null : '',
                      options: value === 'select' ? [] : undefined
                    })}
                    style={{ width: '100%' }}
                  >
                    <Option value="text">Text</Option>
                    <Option value="number">Number</Option>
                    <Option value="select">Select</Option>
                  </Select>
                </Col>
                <Col span={field.type === 'select' ? 5 : 9}>
                  {field.type === 'number' ? (
                    <InputNumber
                      value={field.value as number || null}
                      onChange={(value) => updateField(field.id, { value })}
                      placeholder="Value"
                      style={{ width: '100%' }}
                    />
                  ) : field.type === 'select' ? (
                    <Select
                      value={field.value as string || undefined}
                      onChange={(value) => updateField(field.id, { value })}
                      placeholder="Select value"
                      style={{ width: '100%' }}
                    >
                      {(field.options || []).map((option, optIndex) => (
                        <Option key={optIndex} value={option}>
                          {option || `Option ${optIndex + 1}`}
                        </Option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      value={field.value as string || ''}
                      onChange={(e) => updateField(field.id, { value: e.target.value })}
                      placeholder="Field value"
                    />
                  )}
                </Col>
                <Col span={2}>
                  {fields.length > 1 && (
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeField(field.id)}
                      style={{ width: '100%' }}
                    />
                  )}
                </Col>
              </Row>

              {/* Select Options Management */}
              {field.type === 'select' && (
                <div style={{ marginTop: 8, padding: '8px 12px', backgroundColor: '#fff', borderRadius: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 12, color: '#666' }}>Select Options:</Text>
                    <Button
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => addSelectOption(field.id)}
                      type="link"
                      style={{ padding: '0 4px', height: 'auto' }}
                    >
                      Add Option
                    </Button>
                  </div>
                  {(field.options || []).map((option, optionIndex) => (
                    <Row key={optionIndex} gutter={4} style={{ marginBottom: 4 }}>
                      <Col span={20}>
                        <Input
                          size="small"
                          placeholder={`Option ${optionIndex + 1}`}
                          value={option}
                          onChange={(e) => updateSelectOption(field.id, optionIndex, e.target.value)}
                        />
                      </Col>
                      <Col span={4}>
                        {(field.options || []).length > 1 && (
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeSelectOption(field.id, optionIndex)}
                            style={{ width: '100%' }}
                          />
                        )}
                      </Col>
                    </Row>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {fields.length === 0 && (
          <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
            <Text type="secondary">{placeholder}</Text>
            <div style={{ marginTop: 8 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => addField()}>
                Add Your First Field
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default DynamicFieldsManager