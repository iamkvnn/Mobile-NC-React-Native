import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CartItem } from '@/types/cart.types';
import cartService from '@/services/cart.service';
import type { RootState } from '@/store';

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (courseId: string, { dispatch, rejectWithValue }) => {
    try {
      await cartService.addToCart(courseId);
      dispatch(fetchCart());
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add to cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId: string, { dispatch, rejectWithValue }) => {
    try {
      await cartService.removeFromCart(itemId);
      dispatch(fetchCart());
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove from cart');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await cartService.clearCart();
      dispatch(fetchCart());
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to clear cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartLocal(state) {
      state.items = [];
    },
    clearItemsLocal(state, action) {
      state.items = state.items.filter((item) => !action.payload.includes(item.id));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCartLocal, clearItemsLocal } = cartSlice.actions;

export const selectCartItems = (state: RootState) => (state as any).cart.items as CartItem[];
export const selectCartCount = (state: RootState) => ((state as any).cart.items as CartItem[]).length;
export const selectCartLoading = (state: RootState) => (state as any).cart.loading as boolean;

export default cartSlice.reducer;
