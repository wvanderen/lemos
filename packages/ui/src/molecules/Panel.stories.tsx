import type { Meta, StoryObj } from '@storybook/react';
import { Panel } from './Panel';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

const meta: Meta<typeof Panel> = {
  component: Panel,
  title: 'Molecules/Panel',
  tags: ['autodocs'],
  argTypes: {
    noPadding: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Panel>;

export const Default: Story = {
  render: (args) => (
    <Panel {...args}>
      <h3 style={{ margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>Panel Title</h3>
      <p style={{ margin: '0 0 16px 0', color: 'var(--color-text-secondary)' }}>
        This is a panel with default padding. It provides a consistent container for content
        with a subtle border and shadow.
      </p>
      <Button size="sm">Action</Button>
    </Panel>
  ),
};

export const NoPadding: Story = {
  render: (args) => (
    <Panel {...args} noPadding>
      <div style={{ padding: '16px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>Custom Padding</h3>
        <p style={{ margin: '0 0 16px 0', color: 'var(--color-text-secondary)' }}>
          This panel has no default padding, allowing you to control spacing manually.
        </p>
      </div>
    </Panel>
  ),
};

export const WithForm: Story = {
  render: (args) => (
    <Panel {...args}>
      <h3 style={{ margin: '0 0 16px 0', color: 'var(--color-text-primary)' }}>Login Form</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Input placeholder="Username" fullWidth />
        <Input type="password" placeholder="Password" fullWidth />
        <Button variant="primary" fullWidth>
          Sign In
        </Button>
      </div>
    </Panel>
  ),
};

export const MultiplePanels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
      <Panel>
        <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>Panel 1</h3>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>First panel content</p>
      </Panel>
      <Panel>
        <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>Panel 2</h3>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Second panel content</p>
      </Panel>
      <Panel>
        <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>Panel 3</h3>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Third panel content</p>
      </Panel>
    </div>
  ),
};
