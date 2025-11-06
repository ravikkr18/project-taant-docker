'use client'

import React, { useState } from 'react'
import { Button, Input, Row, Col, Space, Card, Typography } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

const { Text } = Typography

interface SimpleField {
  id: string
  option: string
  value: string | number | null
}

interface SimpleDynamicFieldsFinalProps {
  fields: SimpleField[]
  onChange: (fields: SimpleField[]) => void
  title?: string
}

const SimpleDynamicFieldsFinal: React.FC<SimpleDynamicFieldsFinalProps> = ({
  fields,
  onChange,
  title = 'Product Details'
}) => {
  // Local state to manage fields
  const [localFields, setLocalFields] = useState<SimpleField[]>(fields)

  // Sync local state with props
  React.useEffect(() => {
    setLocalFields(fields)
  }, [fields])

  // Add new field
  const addField = () => {
    const newField: SimpleField = {
      id: `field-${Date.now()}-${localFields.length + 1}`,
      option: '',
      value: ''
    }
    const updatedFields = [...localFields, newField]
    setLocalFields(updatedFields)
    onChange(updatedFields)
  }

  // Remove field
  const removeField = (fieldId: string) => {
    if (localFields.length > 1) {
      const updatedFields = localFields.filter(field => field.id !== fieldId)
      setLocalFields(updatedFields)
      onChange(updatedFields)
    }
  }

  // Update field
  const updateField = (fieldId: string, field: 'option' | 'value', value: string | number | null) => {
    const updatedFields = localFields.map(f =>
      f.id === fieldId ? { ...f, [field]: value } : f
    )
    setLocalFields(updatedFields)
    onChange(updatedFields)
  }

  return (
    <div className="simple-dynamic-fields-final">
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
        {localFields.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
            <Text type="secondary">No fields added yet. Click "Add Field" to get started.</Text>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {localFields.map((field, index) => (
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
                    {localFields.length > 1 && (
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

export default SimpleDynamicFieldsFinal