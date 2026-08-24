
export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'spotify' | 'twitter' | 'gumroad' | 'convertkit';

export interface YouTubeChannelInfo {
  channelId?: string;
  title?: string;
  customUrl?: string;
  avatar?: string;
  metrics?: {
    subscribers?: number;
    views?: number;
    videos?: number;
    hiddenSubscriberCount?: boolean;
  };
}

export interface TikTokAccountInfo {
  openId?: string;
  displayName?: string;
  avatarUrl?: string;
  bioDescription?: string;
  profileDeepLink?: string;
  isVerified?: boolean;
  metrics?: {
    followers?: number;
    following?: number;
    likes?: number;
    videos?: number;
  };
}

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
  userId?: string;
  views?: number;
  likes?: number;
  comments?: number;
  engagement?: number;
  audienceReach?: number;
  revenue?: number;
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

export type GoalMetricType = 'views' | 'revenue' | 'subscribers' | 'posts' | 'engagement';

export interface MonthlyGoal {
  id: string;
  metricType: GoalMetricType;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  prefix?: string;
  suffix?: string;
  month: string; // e.g. "August 2026"
  color: 'indigo' | 'emerald' | 'amber' | 'pink' | 'cyan' | 'purple';
  notes?: string;
  autoSync?: boolean;
  createdAt: string;
  updatedAt?: string;
}
