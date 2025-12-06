import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  component: Select,
  title: 'Atoms/Select',
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const sampleOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

export const Default: Story = {
  args: {
    options: sampleOptions,
  },
};

export const WithError: Story = {
  args: {
    options: sampleOptions,
    error: true,
  },
};

export const Disabled: Story = {
  args: {
    options: sampleOptions,
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    options: sampleOptions,
    fullWidth: true,
  },
};

export const PlanetaryModes: Story = {
  args: {
    options: [
      { value: 'sun', label: '☀️ Sun' },
      { value: 'moon', label: '🌙 Moon' },
      { value: 'void', label: '⚫ Void' },
    ],
  },
};
