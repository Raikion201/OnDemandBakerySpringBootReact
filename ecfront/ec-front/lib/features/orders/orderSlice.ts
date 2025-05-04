import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/lib/axiosConfig';

// Define interfaces
interface LineItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  lineTotal: number;
  productImageUrl: string;
}

interface Order {
  id: number;
  orderNumber: string;
  orderDate: string;
  status: string;
  userId: number;
  userName: string;
  items: LineItem[];
  totalAmount: number;
  paymentMethod: string;
  shippingFirstName: string;
  shippingLastName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
}

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null
};

// Create async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (status?: string, { rejectWithValue }) => {
    try {
      let url = '/api/orders';
      if (status && status !== 'ALL') {
        url = `/api/orders/status/${status}`;
      }
      const response = await axios.get(url);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status }: { id: number, status: string }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/orders/${id}/status`, { status });
      return { id, status };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

// Create the orders slice
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch orders cases
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update order status cases
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Update the order status in the orders array
        const { id, status } = action.payload;
        const orderIndex = state.orders.findIndex(order => order.id === id);
        if (orderIndex >= 0) {
          state.orders[orderIndex].status = status;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export default orderSlice.reducer;
