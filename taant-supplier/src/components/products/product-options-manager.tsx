'use client'

import React, { useState, useRef } from 'react'
import {
  Button,
  Input,
  Select,
  Row,
  Col,
  Typography,
  ColorPicker,
  message,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons'

const { Text } = Typography
const { Option } = Select

interface ProductOption {
  id: string
  name: string
  value: string
}

interface ProductOptionsManagerProps {
  value?: ProductOption[]
  onChange?: (options: ProductOption[]) => void
}

// Common colors for quick selection
const COMMON_COLORS = [
  { label: 'Red', value: '#FF0000' },
  { label: 'Blue', value: '#0000FF' },
  { label: 'Green', value: '#00FF00' },
  { label: 'Yellow', value: '#FFFF00' },
  { label: 'Orange', value: '#FFA500' },
  { label: 'Purple', value: '#800080' },
  { label: 'Pink', value: '#FFC0CB' },
  { label: 'Brown', value: '#964B00' },
  { label: 'Black', value: '#000000' },
  { label: 'White', value: '#FFFFFF' },
  { label: 'Gray', value: '#808080' },
  { label: 'Navy', value: '#000080' },
  { label: 'Teal', value: '#008080' },
  { label: 'Gold', value: '#FFD700' },
  { label: 'Silver', value: '#C0C0C0' },
]

// Common option names
const COMMON_OPTIONS = [
  'Color',
  'Size',
  'Material',
  'Style',
  'Weight',
  'Dimensions',
  'Finish',
  'Pattern',
  'Fit',
  'Length',
  'Width',
  'Height',
]

export default function ProductOptionsManager({ value = [], onChange }: ProductOptionsManagerProps) {
  const [options, setOptions] = useState<ProductOption[]>(value)

  // Use a ref to track if we're updating to prevent loops
  const isUpdatingFromParent = useRef(false)

  // Sync with parent value when value prop changes
  React.useEffect(() => {
    // Only update if the value has actually changed and we're not in the middle of a parent update
    if (!isUpdatingFromParent.current) {
      const hasChanged = value.length !== options.length ||
        value.some((val, index) =>
          val.id !== options[index]?.id ||
          val.name !== options[index]?.name ||
          val.value !== options[index]?.value
        )

      if (hasChanged) {
        setOptions(value)
      }
    }
    isUpdatingFromParent.current = false
  }, [value, options.length])

  const updateOption = (optionId: string, field: 'name' | 'value', newValue: string) => {
    const updatedOptions = options.map(option =>
      option.id === optionId ? { ...option, [field]: newValue } : option
    )
    setOptions(updatedOptions)
    isUpdatingFromParent.current = true
    onChange?.(updatedOptions)
  }

  const addOption = () => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    const newOption: ProductOption = {
      id: `opt-${timestamp}-${random}-${options.length + 1}`,
      name: '',
      value: ''
    }

    const updatedOptions = [...options, newOption]
    setOptions(updatedOptions)
    isUpdatingFromParent.current = true
    onChange?.(updatedOptions)
  }

  const removeOption = (optionId: string) => {
    if (options.length <= 1) return

    const updatedOptions = options.filter(option => option.id !== optionId)
    setOptions(updatedOptions)
    isUpdatingFromParent.current = true
    onChange?.(updatedOptions)
    message.success('Option removed')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text strong>Product Options</Text>
        <Button icon={<PlusOutlined />} onClick={addOption}>
          Add Option
        </Button>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {options.map((option, index) => (
          <div key={option.id} style={{
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
                <Select
                  value={option.name}
                  placeholder="Option name (e.g., Size, Color)"
                  onChange={(newValue) => updateOption(option.id, 'name', newValue)}
                  style={{ width: '100%' }}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {COMMON_OPTIONS.map(commonOption => (
                    <Option key={commonOption} value={commonOption}>
                      {commonOption}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={10}>
                {option.name?.toLowerCase() === 'color' ? (
                  <ColorPicker
                    showText
                    allowClear
                    value={option.value || undefined}
                    presets={[
                      {
                        label: 'Common Colors',
                        colors: COMMON_COLORS.map(c => c.value),
                      },
                    ]}
                    onChange={(color, hex) => {
                      if (hex) {
                        updateOption(option.id, 'value', hex)
                      }
                    }}
                    format="hex"
                    style={{ width: '100%' }}
                  />
                ) : (
                  <Input
                    value={option.value}
                    placeholder="Option value (e.g., Small, Blue)"
                    onChange={(e) => updateOption(option.id, 'value', e.target.value)}
                  />
                )}
              </Col>
              <Col span={3}>
                {options.length > 1 && (
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeOption(option.id)}
                    style={{ width: '100%' }}
                  >
                    Remove
                  </Button>
                )}
              </Col>
            </Row>
          </div>
        ))}
      </div>

      {options.length === 0 && (
        <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
          No options added yet. Click "Add Option" to get started.
        </div>
      )}
    </div>
  )
}