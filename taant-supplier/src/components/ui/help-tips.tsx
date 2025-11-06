'use client'

import React, { useState } from 'react'
import { Button, Card, Typography, Collapse } from 'antd'
import { QuestionCircleOutlined, InfoCircleOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'

const { Text, Paragraph } = Typography
const { Panel } = Collapse

interface HelpTipsProps {
  tabId: string
  title?: string
}

const HelpTips: React.FC<HelpTipsProps> = ({ tabId, title = 'Tips & Help' }) => {
  const [expanded, setExpanded] = useState(false)

  // Tips content for each tab
  const tipsContent: Record<string, { title: string; tips: string[] }> = {
    '1': {
      title: 'Basic Information Tips',
      tips: [
        'Product title should be descriptive and include key features (e.g., "Sony WH-1000XM5 Wireless Noise Canceling Headphones")',
        'SKU is auto-generated if left empty, but custom SKUs help with inventory management',
        'Short description appears in search results and category listings (keep it under 160 characters)',
        'Choose the most specific category for better visibility',
        'Set competitive pricing based on market research',
        'Use relevant tags to improve searchability',
        'Start with "Draft" status and change to "Active" when ready to sell'
      ]
    },
    '2': {
      title: 'Product Images Tips',
      tips: [
        'Upload at least 3-5 high-quality images showing different angles',
        'The first image should be a clear front/hero shot',
        'Include lifestyle images showing the product in use',
        'Add detailed close-ups of important features',
        'Ensure good lighting and minimal background distractions',
        'Images should be at least 1000x1000 pixels for zoom functionality',
        'Name images descriptively for SEO benefits',
        'Drag images to reorder them (first image becomes the primary)'
      ]
    },
    '3': {
      title: 'Product Variants Tips',
      tips: [
        'Create variants for different sizes, colors, or other options',
        'Each variant should have at least one image for best presentation',
        'Use clear, consistent naming for variant options',
        'Set appropriate inventory quantities for each variant',
        'Pricing can vary between variants based on features',
        'Enable/disable variants individually without deleting them',
        'Consider using SKU patterns for easy identification'
      ]
    },
    '4': {
      title: 'A+ Content Tips',
      tips: [
        'Use A+ content to tell your product story and highlight benefits',
        'Mix text and image sections for visual appeal',
        'Keep text concise and easy to scan',
        'Use formatting to emphasize key features and benefits',
        'Show product dimensions and scale with reference objects',
        'Include lifestyle scenarios and use cases',
        'Highlight what makes your product unique',
        'Ensure high-quality images that load quickly'
      ]
    },
    '5': {
      title: 'FAQs Tips',
      tips: [
        'Anticipate common customer questions about your product',
        'Include questions about specifications, compatibility, and usage',
        'Keep answers clear, concise, and helpful',
        'Address potential concerns or limitations honestly',
        'Include information about warranty and support',
        'Consider shipping and return policy questions',
        'Update FAQs based on actual customer inquiries',
        'Maximum of 10 FAQs to keep focused and relevant'
      ]
    },
    '6': {
      title: 'Product Details Tips',
      tips: [
        'Provide accurate dimensions and weight for shipping calculations',
        'Include warranty information to build customer trust',
        'Country of origin affects shipping times and costs',
        'Manufacturer details help with brand recognition',
        'Model numbers help customers find the exact product',
        'Shipping requirements inform carriers about special handling',
        'Dynamic fields let you add custom properties as needed',
        'Use standard units (kg, cm, etc.) for consistency'
      ]
    },
    '7': {
      title: 'Product Information Tips',
      tips: [
        'Detailed descriptions help customers make informed decisions',
        'Organize information in logical sections for easy reading',
        'Include both technical specifications and benefits',
        "List everything included in the package to set expectations",
        'Mention compatibility with other products or systems',
        'Include safety information and usage guidelines',
        'Care instructions help customers maintain the product',
        'Use sections to group related information together'
      ]
    },
    '8': {
      title: 'SEO Tips',
      tips: [
        'SEO title should be 50-60 characters including spaces',
        'SEO description should be 150-160 characters',
        'Include primary keywords naturally in both title and description',
        'Write compelling meta descriptions that encourage clicks',
        'Use tags that customers would search for',
        'Include brand name, model, and key features',
        'Avoid keyword stuffing - write for humans first',
        'Review competitor SEO strategies for inspiration'
      ]
    }
  }

  const content = tipsContent[tabId] || {
    title: 'General Tips',
    tips: [
      'Save your work frequently to avoid data loss',
      'Use the validation indicators to identify incomplete sections',
      'All required fields must be completed before publishing',
      'Preview your product before making it active',
      'Regular updates help maintain product relevance'
    ]
  }

  return (
    <div className="help-tips">
      <Card
        size="small"
        style={{
          marginTop: 16,
          backgroundColor: '#f6f8fa',
          border: '1px solid #e1e4e8'
        }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            <span>{content.title}</span>
            <Button
              type="text"
              size="small"
              icon={expanded ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => setExpanded(!expanded)}
              style={{ marginLeft: 'auto', padding: '0 8px', height: 'auto' }}
            >
              {expanded ? 'Hide Tips' : 'Show Tips'}
            </Button>
          </div>
        }
        bodyStyle={{ padding: expanded ? '12px 16px' : '0' }}
      >
        {expanded && (
          <div>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {content.tips.map((tip, index) => (
                <li key={index} style={{ marginBottom: 8, color: '#586069', fontSize: 13, lineHeight: 1.4 }}>
                  {tip}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid #e1e4e8' }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                💡 <strong>Pro Tip:</strong> Complete all tabs for the best product presentation and search visibility.
              </Text>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default HelpTips