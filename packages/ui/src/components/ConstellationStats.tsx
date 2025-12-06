import { useState, useEffect } from 'react';
import type { ConstellationDefinition, ConstellationStats as Stats } from '@lemos/core';
import type { ConstellationOS } from '@lemos/modules-constellation-os';

interface ConstellationStatsProps {
  constellationOS: ConstellationOS;
  constellationId: string;
}

export function ConstellationStats({
  constellationOS,
  constellationId
}: ConstellationStatsProps): JSX.Element {
  const [constellation, setConstellation] = useState<ConstellationDefinition | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [constellationData, statsData] = await Promise.all([
          constellationOS.getConstellation(constellationId),
          constellationOS.getStats(constellationId),
        ]);

        setConstellation(constellationData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load constellation stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [constellationOS, constellationId]);

  if (loading) {
    return (
      <div style={{ padding: 16, color: '#6b7280' }}>
        Loading stats...
      </div>
    );
  }

  if (!constellation || !stats) {
    return (
      <div style={{ padding: 16, color: '#ef4444' }}>
        Failed to load constellation stats
      </div>
    );
  }

  const formatLastActivity = (timestamp: string | null): string => {
    if (!timestamp) return 'Never';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 16,
        background: 'white',
        border: `2px solid ${constellation.color}`,
        borderRadius: 12,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            fontSize: 32,
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: constellation.color + '20',
            borderRadius: 12,
          }}
        >
          {constellation.icon}
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: constellation.color,
            }}
          >
            {constellation.name}
          </div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            {constellation.description}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}
      >
        <StatCard
          label="Sessions"
          value={stats.totalSessions.toString()}
          color={constellation.color}
        />
        <StatCard
          label="Rituals"
          value={stats.totalRituals.toString()}
          color={constellation.color}
        />
        <StatCard
          label="Total Time"
          value={`${stats.totalMinutes}m`}
          color={constellation.color}
        />
        <StatCard
          label="Completion"
          value={`${stats.completionRate}%`}
          color={constellation.color}
        />
      </div>

      {/* Last Activity */}
      <div
        style={{
          padding: 12,
          background: constellation.color + '10',
          borderRadius: 8,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>
          LAST ACTIVITY
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: constellation.color }}>
          {formatLastActivity(stats.lastActivityAt)}
        </div>
      </div>

      {/* Progress Bar */}
      {stats.totalMinutes > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>
            TIME INVESTED
          </div>
          <div
            style={{
              height: 8,
              background: '#e5e7eb',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, (stats.totalMinutes / 1000) * 100)}%`,
                background: `linear-gradient(90deg, ${constellation.color}, ${constellation.color}dd)`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', textAlign: 'right' }}>
            {(stats.totalMinutes / 60).toFixed(1)} hours
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  color: string;
}

function StatCard({ label, value, color }: StatCardProps): JSX.Element {
  return (
    <div
      style={{
        padding: 12,
        background: '#f9fafb',
        borderRadius: 8,
        border: '1px solid #e5e7eb',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>
        {value}
      </div>
    </div>
  );
}
