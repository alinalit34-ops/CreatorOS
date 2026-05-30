
import { Post, Stat, RevenueSource, Insight } from '../types/index';
import { subDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export const MOCK_STATS: Stat[] = [
  { label: 'Total Reach', value: '1.2M', change: 12.5, trend: 'up' },
  { label: 'Total Revenue', value: '$12,450', change: 8.2, trend: 'up' },
  { label: 'Engagement Rate', value: '4.8%', change: -1.2, trend: 'down' },
  { label: 'New Subscribers', value: '8,420', change: 24.1, trend: 'up' },
];

export const MOCK_POSTS: Post[] = [
  { id: '1', title: 'The Future of AI in Design', platform: 'youtube', status: 'scheduled', date: addDays(new Date(), 2) },
  { id: '2', title: 'Morning Routine Reel', platform: 'instagram', status: 'scheduled', date: addDays(new Date(), 1) },
  { id: '3', title: 'Creator Economy Deep Dive', platform: 'twitter', status: 'published', date: subDays(new Date(), 1) },
  { id: '4', title: 'New Product Launch', platform: 'gumroad', status: 'draft', date: addDays(new Date(), 5) },
];

export const MOCK_REVENUE: RevenueSource[] = [
  { name: 'YouTube AdSense', amount: 4500, platform: 'youtube', type: 'platform' },
  { name: 'Brand Deal: TechCo', amount: 3000, platform: 'instagram', type: 'sponsorship' },
  { name: 'Gumroad Sales', amount: 2800, platform: 'gumroad', type: 'sales' },
  { name: 'Patreon Members', amount: 2150, platform: 'youtube', type: 'membership' },
];

export const MOCK_INSIGHTS: Insight[] = [
  { 
    id: '1', 
    title: 'Peak Engagement Alert', 
    description: 'Your audience is most active on Tuesdays at 7 PM. Consider scheduling your next YouTube video then.',
    type: 'growth',
    actionLabel: 'Schedule Post'
  },
  { 
    id: '2', 
    title: 'Revenue Opportunity', 
    description: 'Your "Design Systems" course on Gumroad has seen a 40% increase in traffic from Twitter. Run a limited-time promo?',
    type: 'monetization',
    actionLabel: 'Create Promo'
  }
];

export const ANALYTICS_DATA = [
  { name: 'Mon', reach: 45000, revenue: 400 },
  { name: 'Tue', reach: 52000, revenue: 450 },
  { name: 'Wed', reach: 48000, revenue: 380 },
  { name: 'Thu', reach: 61000, revenue: 520 },
  { name: 'Fri', reach: 55000, revenue: 490 },
  { name: 'Sat', reach: 67000, revenue: 600 },
  { name: 'Sun', reach: 72000, revenue: 650 },
];

export const AUDIENCE_AGE = [
  { category: '18-24', value: 25 },
  { category: '25-34', value: 45 },
  { category: '35-44', value: 20 },
  { category: '45+', value: 10 },
];

export const AUDIENCE_GEO = [
  { category: 'USA', value: 40 },
  { category: 'UK', value: 15 },
  { category: 'Germany', value: 10 },
  { category: 'India', value: 12 },
  { category: 'Others', value: 23 },
];
