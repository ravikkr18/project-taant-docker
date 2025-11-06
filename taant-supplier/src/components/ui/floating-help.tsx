'use client'

import React from 'react'
import { FloatButton, Tooltip, List } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'

interface FloatingHelpProps {
  tabId: string
  title?: string
}

const FloatingHelp: React.FC<FloatingHelpProps> = ({ tabId, title = 'Tips & Help' }) => {
  // Tips content for each tab
  const tipsContent: Record<string, { title: string; tips: string[] }> = {
    '1': {
      title: 'Basic Information Tips',
      tips: [
        'Product title should be descriptive and include key features',
        'SKU is auto-generated if left empty for inventory management',
        'Short description appears in search results (keep under 160 chars)',
        'Choose the most specific category for better visibility',
        'Set competitive pricing based on market research',
        'Use relevant tags to improve searchability',
        'Start with "Draft" status and change to "Active" when ready'
      ]
    },
    '2': {
      title: 'Product Images Tips',
      tips: [
        'Upload at least 3-5 high-quality images showing different angles',
        'First image should be a clear front/hero shot',
        'Include lifestyle images showing the product in use',
        'Add detailed close-ups of important features',
        'Ensure good lighting and minimal background distractions',
        'Images should be at least 1000x1000 pixels for zoom',
        'Name images descriptively for SEO benefits',
        'Drag images to reorder them (first becomes primary)'
      ]
    },
    '3': {
      title: 'Product Variants Tips',
      tips: [
        'Create variants for different sizes, colors, or options',
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
        'List everything included in the package to set expectations',
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
      'Use validation indicators to identify incomplete sections',
      'All required fields must be completed before publishing',
      'Preview your product before making it active',
      'Regular updates help maintain product relevance'
    ]
  }

  const tooltipContent = (
    <div style={{
      maxWidth: 350,
      backgroundColor: '#ffffff',
      padding: '12px',
      borderRadius: '6px',
      border: '1px solid #d9d9d9',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    }}>
      <h4 style={{
        margin: '0 0 8px 0',
        color: '#262626',
        fontSize: '14px',
        fontWeight: '600'
      }}>
        {content.title}
      </h4>
      <List
        size="small"
        dataSource={content.tips}
        renderItem={(tip, index) => (
          <List.Item style={{
            padding: '4px 0',
            fontSize: 12,
            lineHeight: 1.5,
            color: '#262626',
            borderBottom: index < content.tips.length - 1 ? '1px solid #f0f0f0' : 'none'
          }}>
            <span style={{ color: '#595959' }}>• {tip}</span>
          </List.Item>
        )}
      />
      <div style={{
        marginTop: 8,
        paddingTop: 8,
        borderTop: '1px solid #f0f0f0',
        backgroundColor: '#fafafa',
        margin: '12px -12px -12px -12px',
        padding: '8px 12px',
        borderBottomLeftRadius: '6px',
        borderBottomRightRadius: '6px'
      }}>
        <span style={{ fontSize: 11, color: '#595959' }}>
          💡 <strong style={{ color: '#262626' }}>Pro Tip:</strong> Complete all tabs for the best product presentation.
        </span>
      </div>
    </div>
  )

  return (
    <FloatButton.Group
      shape="circle"
      style={{
        right: 24,
        top: 80,
      }}
    >
      <Tooltip
        title={tooltipContent}
        placement="left"
        overlayStyle={{
          maxWidth: 400,
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none'
        }}
        overlayInnerStyle={{
          maxHeight: 400,
          overflowY: 'auto',
          padding: 0,
          backgroundColor: 'transparent'
        }}
      >
        <FloatButton
          icon={<QuestionCircleOutlined />}
          tooltip={content.title}
        />
      </Tooltip>
    </FloatButton.Group>
  )
}

export default FloatingHelp