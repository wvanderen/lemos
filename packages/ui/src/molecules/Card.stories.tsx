import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';

const meta: Meta<typeof Card> = {
  component: Card,
  title: 'Molecules/Card',
  tags: ['autodocs'],
  argTypes: {
    noPadding: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    subtitle: 'This is a subtitle for the card',
    children: (
      <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
        This is the main content area of the card. You can put any content here
        including text, forms, lists, or other components.
      </p>
    ),
  },
};

export const WithActions: Story = {
  args: {
    title: 'User Profile',
    subtitle: 'Manage your account settings',
    actions: [
      <Button key="edit" size="sm" variant="secondary">Edit</Button>,
      <Button key="save" size="sm" variant="primary">Save</Button>,
    ],
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <strong>Name:</strong> John Doe
        </div>
        <div>
          <strong>Email:</strong> john@example.com
        </div>
        <div>
          <strong>Role:</strong> Administrator
        </div>
      </div>
    ),
  },
};

export const WithBadge: Story = {
  args: {
    title: 'Task Management',
    actions: <Badge variant="success">Active</Badge>,
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ color: 'var(--color-text-secondary)' }}>Tasks completed: 12</div>
        <div style={{ color: 'var(--color-text-secondary)' }}>Tasks pending: 3</div>
        <div style={{ color: 'var(--color-text-secondary)' }}>Total tasks: 15</div>
      </div>
    ),
  },
};

export const NoPadding: Story = {
  args: {
    title: 'Custom Layout',
    noPadding: true,
    children: (
      <div style={{ padding: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }}>
          <div style={{
            backgroundColor: 'var(--color-bg-overlay)',
            padding: '12px',
            borderRadius: 'var(--radius-panel)'
          }}>
            <strong>Column 1</strong>
            <p style={{ margin: '8px 0 0 0', color: 'var(--color-text-secondary)' }}>
              Custom content with manual spacing
            </p>
          </div>
          <div style={{
            backgroundColor: 'var(--color-bg-overlay)',
            padding: '12px',
            borderRadius: 'var(--radius-panel)'
          }}>
            <strong>Column 2</strong>
            <p style={{ margin: '8px 0 0 0', color: 'var(--color-text-secondary)' }}>
              Custom content with manual spacing
            </p>
          </div>
        </div>
      </div>
    ),
  },
};

export const MultipleCards: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Card title="Weather Today" actions={<Badge variant="primary">Live</Badge>}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>72°F</div>
            <div style={{ color: 'var(--color-text-secondary)' }}>Partly Cloudy</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--color-text-secondary)' }}>Humidity: 65%</div>
            <div style={{ color: 'var(--color-text-secondary)' }}>Wind: 8 mph</div>
          </div>
        </div>
      </Card>

      <Card title="Upcoming Events" actions={<Badge variant="warning">2 New</Badge>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ padding: '8px', backgroundColor: 'var(--color-bg-overlay)', borderRadius: 'var(--radius-panel)' }}>
            <strong>Team Meeting</strong>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Today at 2:00 PM
            </div>
          </div>
          <div style={{ padding: '8px', backgroundColor: 'var(--color-bg-overlay)', borderRadius: 'var(--radius-panel)' }}>
            <strong>Project Review</strong>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Tomorrow at 10:00 AM
            </div>
          </div>
        </div>
      </Card>
    </div>
  ),
};
