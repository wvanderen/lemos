import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from './FormField';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Toggle } from '../atoms/Toggle';
import { useState } from 'react';

const meta: Meta<typeof FormField> = {
  component: FormField,
  title: 'Molecules/FormField',
  tags: ['autodocs'],
  argTypes: {
    required: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  args: {
    label: 'Full Name',
    children: <Input placeholder="Enter your full name" />,
  },
};

export const Required: Story = {
  args: {
    label: 'Email Address',
    required: true,
    children: <Input type="email" placeholder="you@example.com" />,
  },
};

export const WithHint: Story = {
  args: {
    label: 'Password',
    hint: 'Password must be at least 8 characters long',
    required: true,
    children: <Input type="password" placeholder="Enter password" />,
  },
};

export const WithError: Story = {
  args: {
    label: 'Username',
    required: true,
    error: 'Username is already taken',
    children: <Input placeholder="Choose a username" />,
  },
};

export const WithSelect: Story = {
  args: {
    label: 'Country',
    children: (
      <Select
        options={[
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
          { value: 'mx', label: 'Mexico' },
        ]}
      />
    ),
  },
};

const WithToggleComponent = () => {
  const [notifications, setNotifications] = useState(true);
  return (
    <FormField
      label="Email Notifications"
      hint="Receive email updates about your account activity"
    >
      <Toggle
        checked={notifications}
        onChange={setNotifications}
        label="Enable notifications"
      />
    </FormField>
  );
};

export const WithToggle: Story = {
  render: () => <WithToggleComponent />,
};

const MultipleFieldsComponent = () => {
  const [theme, setTheme] = useState('sun');
  const [notifications, setNotifications] = useState(true);
  const [email, setEmail] = useState('');

  return (
    <div style={{ maxWidth: '400px' }}>
      <FormField
        label="Email Address"
        required
        hint="We'll never share your email with anyone else"
      >
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
      </FormField>

      <FormField
        label="Preferred Theme"
      >
        <Select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          options={[
            { value: 'sun', label: '☀️ Sun' },
            { value: 'moon', label: '🌙 Moon' },
            { value: 'void', label: '⚫ Void' },
          ]}
          fullWidth
        />
      </FormField>

      <FormField
        label="Newsletter"
        hint="Get tips and updates delivered to your inbox"
      >
        <Toggle
          checked={notifications}
          onChange={setNotifications}
          label="Subscribe to newsletter"
        />
      </FormField>
    </div>
  );
};

export const MultipleFields: Story = {
  render: () => <MultipleFieldsComponent />,
};

const FormWithErrorsComponent = () => {
  const [email, setEmail] = useState('invalid-email');
  const [password, setPassword] = useState('');

  return (
    <div style={{ maxWidth: '400px' }}>
      <FormField
        label="Email Address"
        required
        error="Please enter a valid email address"
      >
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error
          fullWidth
        />
      </FormField>

      <FormField
        label="Password"
        required
        error="Password must be at least 8 characters"
      >
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error
          fullWidth
        />
      </FormField>
    </div>
  );
};

export const FormWithErrors: Story = {
  render: () => <FormWithErrorsComponent />,
};
