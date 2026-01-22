export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface Post {
  id: string;
  post_date: string | null;
  created_time: string | null;
  media_type: string | null;
  theme: string | null;
  caption: string | null;
  likes: number | null;
  reach: number | null;
  comments: number | null;
  saved: number | null;
  follows: number | null;
  post_url: string | null;
  media_url: string | null;
}

export interface HourlyPerformance {
  hour: number;
  hourLabel: string;
  count: number;
  avgLikes: number;
  avgReach: number;
  engagementRate: number;
}

export interface DayHourCell {
  dayIndex: number;
  day: string;
  hour: number;
  hourLabel: string;
  count: number;
  avgLikes: number;
  avgReach: number;
  engagementRate: number;
}

export interface ThemeData {
  theme: string;
  engagementRate: number;
  posts: number;
  totalLikes: number;
  totalComments: number;
  totalReach: number;
}

export interface MediaTypePerformance {
  type: string;
  count: number;
  avgLikes: number;
  avgReach: number;
  avgComments: number;
  engagementRate: number;
}

export interface MonthlyTrend {
  month: string;
  monthLabel: string;
  count: number;
  totalLikes: number;
  totalReach: number;
  totalComments: number;
  avgLikes: number;
  avgReach: number;
  engagementRate: number;
}

export interface DayOfWeekPerformance {
  day: string;
  dayIndex: number;
  count: number;
  avgLikes: number;
  avgReach: number;
  engagementRate: number;
}

export const CHART_COLORS = [
  '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', 
  '#ef4444', '#6366f1', '#14b8a6', '#f97316', '#84cc16'
];

export const DAY_NAMES = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'];
