import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/lib/axiosConfig';

// Define interfaces for analytics data
export interface RevenueAnalytics {
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  revenueByStatus: Record<string, number>;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface OrderStats {
  totalOrders: number;
  orderCountByStatus: Record<string, number>;
  conversionRate: number;
}

interface AnalyticsState {
  revenueAnalytics: RevenueAnalytics | null;
  dailyRevenue: DailyRevenue[];
  monthlyRevenue: MonthlyRevenue[];
  orderStats: OrderStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  revenueAnalytics: null,
  dailyRevenue: [],
  monthlyRevenue: [],
  orderStats: null,
  loading: false,
  error: null,
};

// Async thunks for fetching analytics data
export const fetchRevenueAnalytics = createAsyncThunk(
  'analytics/fetchRevenueAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/orders/analytics/revenue');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue analytics');
    }
  }
);

export const fetchDailyRevenue = createAsyncThunk(
  'analytics/fetchDailyRevenue',
  async (days: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/orders/analytics/daily-revenue?days=${days}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch daily revenue');
    }
  }
);

export const fetchMonthlyRevenue = createAsyncThunk(
  'analytics/fetchMonthlyRevenue',
  async (months: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/orders/analytics/monthly-revenue?months=${months}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch monthly revenue');
    }
  }
);

export const fetchOrderStats = createAsyncThunk(
  'analytics/fetchOrderStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/orders/analytics/order-stats');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order stats');
    }
  }
);

export const fetchAllAnalytics = createAsyncThunk(
  'analytics/fetchAllAnalytics',
  async ({ days = 7, months = 12 }: { days?: number; months?: number }, { rejectWithValue }) => {
    try {
      const [revenueRes, dailyRes, monthlyRes, statsRes] = await Promise.all([
        axios.get('/api/orders/analytics/revenue'),
        axios.get(`/api/orders/analytics/daily-revenue?days=${days}`),
        axios.get(`/api/orders/analytics/monthly-revenue?months=${months}`),
        axios.get('/api/orders/analytics/order-stats')
      ]);

      return {
        revenueAnalytics: revenueRes.data,
        dailyRevenue: dailyRes.data,
        monthlyRevenue: monthlyRes.data,
        orderStats: statsRes.data,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics data');
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalytics: (state) => {
      state.revenueAnalytics = null;
      state.dailyRevenue = [];
      state.monthlyRevenue = [];
      state.orderStats = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all analytics
      .addCase(fetchAllAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueAnalytics = action.payload.revenueAnalytics;
        state.dailyRevenue = action.payload.dailyRevenue;
        state.monthlyRevenue = action.payload.monthlyRevenue;
        state.orderStats = action.payload.orderStats;
      })
      .addCase(fetchAllAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Individual analytics fetches
      .addCase(fetchRevenueAnalytics.fulfilled, (state, action) => {
        state.revenueAnalytics = action.payload;
      })
      .addCase(fetchDailyRevenue.fulfilled, (state, action) => {
        state.dailyRevenue = action.payload;
      })
      .addCase(fetchMonthlyRevenue.fulfilled, (state, action) => {
        state.monthlyRevenue = action.payload;
      })
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.orderStats = action.payload;
      });
  },
});

export const { clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;

