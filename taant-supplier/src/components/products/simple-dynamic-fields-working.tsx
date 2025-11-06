'use client'

import React from 'react'
import { Button, Input, Row, Col, Space, Card, Typography } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

const { Text } = Typography

interface SimpleField {
  id: string
  option: string
  value: string | number | null
}

interface SimpleDynamicFieldsWorkingProps {
  fields: SimpleField[]
  onChange: (fields: SimpleField[]) => void
  title?: string
}

const SimpleDynamicFieldsWorking: React.FC<SimpleDynamicFieldsWorkingProps> = ({
  fields,
  onChange,
  title = 'Product Details'
}) => {
  // Add new field with guaranteed unique ID
  const addField = () => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    const newField: SimpleField = {
      id: `field-${timestamp}-${random}`,
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
    <div className="simple-dynamic-fields-working">
      <Card
        size="small"
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>{title}</Text>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={addField}
            >
              Add Field
            </Button>
          </div>
        }
      >
        {fields.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
            <Text type="secondary">No fields added yet. Click "Add Field" to get started.</Text>
          </div>
        ) : (
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
        )}
      </Card>
    </div>
  )
}

export default SimpleDynamicFieldsWorking