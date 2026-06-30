export type TPlanName = "basic_plan" | "standard_plan" | "unlimited_plan";

export type TEmployeeSize = {
  minEmployees: number;
  maxEmployees: number;
  price: number;
  _id?: string;
};

export type TSubscription = {
  _id: string;
  add_logo_images: boolean;
  avg_viewed_1000: boolean;
  isVisible: boolean;
  expiryDate: number;
  jobpost: number | string;
  multi_categories: boolean;
  planName: TPlanName;
  planPrice?: number;
  unlimited_text?: boolean;
  updatedAt: string;
  continuous_posting?: boolean;
  cost_effective?: boolean;
  fill_multiple_positions?: boolean;
  no_time_limit?: boolean;
  multi_user_access?: boolean;
  numberOfEmployees?: TEmployeeSize[];
  discount?: number;
  popular_choice?: boolean;
  schedule_dates?: boolean;
  unlimited_postings?: boolean;

  small?: { minEmployees: number; maxEmployees: number; price: number };
  medium?: { minEmployees: number; maxEmployees: number; price: number };
  large?: { minEmployees: number; maxEmployees: number; price: number };
};

export type TMySubscription = {
  _id: string;
  channelId: {
    _id: string;
    name: string;
    avatar: string;
    description: string;
  };
  cancelAtPeriodEnd?: boolean;
  cancelledAt?: string;
  cancellation?: {
    isScheduled: boolean;
    cancelledAt: string;
    accessUntil: string;
    autoRenew: boolean;
  };
  endDate?: string;
  isPaid?: boolean;
  paymentProvider?: string;
  status?: string;
};
