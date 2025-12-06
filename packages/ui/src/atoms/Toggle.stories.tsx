import type { Meta, StoryObj } from '@storybook/react';
import { Toggle, type ToggleProps } from './Toggle';
import { useState } from 'react';

const meta: Meta<typeof Toggle> = {
  component: Toggle,
  title: 'Atoms/Toggle',
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    label: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

const ToggleWithState = ({ checked: initialChecked = false, ...args }: Partial<ToggleProps>) => {
  const [checked, setChecked] = useState(initialChecked);
  return <Toggle {...args} checked={checked} onChange={setChecked} />;
};

export const Default: Story = {
  render: (args) => <ToggleWithState {...(args as ToggleProps)} />,
};

export const WithLabel: Story = {
  render: () => <ToggleWithState label="Enable notifications" checked={false} />,
};

export const Checked: Story = {
  render: () => <ToggleWithState label="Enabled" checked={true} />,
};

export const Disabled: Story = {
  render: () => <ToggleWithState label="Disabled toggle" disabled checked={false} />,
};

export const CheckedAndDisabled: Story = {
  render: () => <ToggleWithState label="Checked and disabled" checked={true} disabled />,
};

const MultipleToggles = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Toggle checked={notifications} onChange={setNotifications} label="Enable notifications" />
      <Toggle checked={darkMode} onChange={setDarkMode} label="Dark mode" />
      <Toggle checked={autoSave} onChange={setAutoSave} label="Auto-save" />
    </div>
  );
};

export const Multiple: Story = {
  render: () => <MultipleToggles />,
};
