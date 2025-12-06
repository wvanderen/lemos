import type { Meta, StoryObj } from '@storybook/react';
import { ModuleShell } from './ModuleShell';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Card } from '../molecules/Card';
import { Panel } from '../molecules/Panel';

const meta: Meta<typeof ModuleShell> = {
  component: ModuleShell,
  title: 'Organisms/ModuleShell',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ModuleShell>;

export const Default: Story = {
  args: {
    title: 'Session Timer',
    subtitle: 'Focus on your work with timed sessions',
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
        <Panel>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 16px 0', color: 'var(--color-text-primary)' }}>
              25:00
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <Button variant="primary">Start</Button>
              <Button variant="secondary">Pause</Button>
              <Button variant="ghost">Reset</Button>
            </div>
          </div>
        </Panel>

        <Card title="Session Stats">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Today</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>4</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Total</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>142</div>
            </div>
          </div>
        </Card>
      </div>
    ),
  },
};

export const WithActions: Story = {
  args: {
    title: 'Ritual Editor',
    subtitle: 'Create and manage your personal rituals',
    actions: [
      <Button key="new" variant="primary">New Ritual</Button>,
      <Badge key="active" variant="success">3 Active</Badge>,
    ],
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Card
          title="Morning Anchor"
          actions={<Button size="sm" variant="secondary">Edit</Button>}
        >
          <div style={{ color: 'var(--color-text-secondary)' }}>
            Start your day with intention and clarity
          </div>
          <div style={{ marginTop: '12px' }}>
            <strong>Steps:</strong> 5 | <strong>Duration:</strong> 15 minutes
          </div>
        </Card>

        <Card
          title="Evening Review"
          actions={<Button size="sm" variant="secondary">Edit</Button>}
        >
          <div style={{ color: 'var(--color-text-secondary)' }}>
            Reflect on your accomplishments and prepare for tomorrow
          </div>
          <div style={{ marginTop: '12px' }}>
            <strong>Steps:</strong> 3 | <strong>Duration:</strong> 10 minutes
          </div>
        </Card>
      </div>
    ),
  },
};

export const EnergyManagement: Story = {
  args: {
    title: 'Energy Management',
    subtitle: 'Track and optimize your daily energy levels',
    actions: [
      <Badge key="level" variant="warning">Level 8</Badge>,
    ],
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
        <Panel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>⚡ Energy</div>
              <div style={{ color: 'var(--color-text-secondary)' }}>Current Level: 8 / 15</div>
            </div>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-inverse)',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              8
            </div>
          </div>
        </Panel>

        <Card title="Today's Activities">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px',
              backgroundColor: 'var(--color-bg-overlay)',
              borderRadius: 'var(--radius-panel)'
            }}>
              <span>Completed Morning Ritual</span>
              <Badge variant="success">+2</Badge>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px',
              backgroundColor: 'var(--color-bg-overlay)',
              borderRadius: 'var(--radius-panel)'
            }}>
              <span>25-minute Focus Session</span>
              <Badge variant="success">+3</Badge>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px',
              backgroundColor: 'var(--color-bg-overlay)',
              borderRadius: 'var(--radius-panel)'
            }}>
              <span>Took Break</span>
              <Badge variant="warning">-1</Badge>
            </div>
          </div>
        </Card>
      </div>
    ),
  },
};

export const ConstellationView: Story = {
  args: {
    title: 'Constellation Explorer',
    subtitle: 'Navigate through your interconnected goals',
    actions: [
      <Button key="create" variant="primary">Create Constellation</Button>,
    ],
    children: (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px'
      }}>
        <Card title="Career Growth" actions={<Badge variant="primary">5 Nodes</Badge>}>
          <div style={{ color: 'var(--color-text-secondary)' }}>
            Professional development and skill building
          </div>
        </Card>

        <Card title="Health & Wellness" actions={<Badge variant="success">3 Nodes</Badge>}>
          <div style={{ color: 'var(--color-text-secondary)' }}>
            Physical and mental wellbeing practices
          </div>
        </Card>

        <Card title="Creative Projects" actions={<Badge variant="warning">7 Nodes</Badge>}>
          <div style={{ color: 'var(--color-text-secondary)' }}>
            Artistic and creative expression goals
          </div>
        </Card>
      </div>
    ),
  },
};
