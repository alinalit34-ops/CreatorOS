
export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'spotify' | 'twitter' | 'gumroad' | 'convertkit';

export interface Stat {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  platform?: Platform;
}

export interface Post {
  id: string;
  title: string;
  platform: Platform;
  status: 'draft' | 'scheduled' | 'published';
  date: Date;
  thumbnail?: string;
}

export interface RevenueSource {
  name: string;
  amount: number;
  platform: Platform;
  type: 'sponsorship' | 'sales' | 'membership' | 'platform';
}

export interface AudienceMetric {
  category: string;
  value: number;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'growth' | 'monetization' | 'engagement';
  actionLabel?: string;
}
