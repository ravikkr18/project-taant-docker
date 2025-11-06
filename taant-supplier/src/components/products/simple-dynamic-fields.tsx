'use client'

import React, { useState } from 'react'
import { Button, Input, InputNumber, Select, Row, Col, Space, Card, Typography } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

const { Text } = Typography
const { Option } = Select

interface SimpleField {
  id: string
  option: string
  value: string | number | null
}

interface SimpleDynamicFieldsProps {
  fields: SimpleField[]
  onChange: (fields: SimpleField[]) => void
  title?: string
}

const SimpleDynamicFields: React.FC<SimpleDynamicFieldsProps> = ({
  fields,
  onChange,
  title = 'Product Details'
}) => {
  // Initialize with default fields if empty on first render
  React.useEffect(() => {
    if (fields.length === 0) {
      const defaultFields: SimpleField[] = [
        { id: `field-1`, option: 'Weight', value: null },
        { id: `field-2`, option: 'Dimensions', value: '' },
        { id: `field-3`, option: 'Material', value: '' },
        { id: `field-4`, option: 'Color', value: '' },
        { id: `field-5`, option: 'Warranty', value: '' },
      ]
      onChange(defaultFields)
    }
  }, []) // Only run once on mount

  // Common field options
  const commonOptions = [
    'Weight',
    'Dimensions',
    'Material',
    'Color',
    'Size',
    'Warranty',
    'Brand',
    'Model',
    'Origin',
    'Certification',
    'Package Includes',
    'Power Source',
    'Compatibility',
    'Features'
  ]

  // Add new field
  const addField = () => {
    const newField: SimpleField = {
      id: `field-${Date.now()}`,
      option: '',
      value: ''
    }
    onChange([...fields, newField])
  }

  // Remove field
  const removeField = (fieldId: string) => {
    if (fields.length > 1) {
      onChange(fields.filter(field => field.id !== fieldId))
    }
  }

  // Update field
  const updateField = (fieldId: string, field: 'option' | 'value', value: string | number | null) => {
    onChange(fields.map(f =>
      f.id === fieldId ? { ...f, [field]: value } : f
    ))
  }

  return (
    <div className="simple-dynamic-fields">
      <Card
        size="small"
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>{title}</Text>
            <Button size="small" icon={<PlusOutlined />} onClick={addField}>
              Add Field
            </Button>
          </div>
        }
      >
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
                <Col span={8}>
                  <Input
                    placeholder="Field name (e.g., Weight)"
                    value={field.option}
                    onChange={(e) => updateField(field.id, 'option', e.target.value)}
                  />
                </Col>
                <Col span={13}>
                  <Input
                    placeholder="Field value (e.g., 500g, 10x5x2 cm)"
                    value={field.value?.toString() || ''}
                    onChange={(e) => updateField(field.id, 'value', e.target.value)}
                  />
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
            </div>
          ))}
        </div>

        {/* Quick Add Common Fields */}
        <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f0f5ff', borderRadius: 4 }}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
            Quick add common fields:
          </Text>
          <Space size="small" wrap>
            {commonOptions.map((option, index) => (
              <Button
                key={index}
                size="small"
                type="link"
                onClick={() => {
                  const newField: SimpleField = {
                    id: `field-${Date.now()}-${fields.length + index}`,
                    option,
                    value: ''
                  }
                  onChange([...fields, newField])
                }}
                style={{ padding: '0 4px', height: 'auto', fontSize: 12 }}
              >
                {option}
              </Button>
            ))}
          </Space>
        </div>

        <div style={{ marginTop: 12, padding: 8, backgroundColor: '#f6f8fa', borderRadius: 4 }}>
          <Text type="secondary" style={{ fontSize: 11 }}>
            <strong>Tips:</strong> These fields help customers understand product specifications. Include dimensions, weight, materials, and other important details.
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default SimpleDynamicFields