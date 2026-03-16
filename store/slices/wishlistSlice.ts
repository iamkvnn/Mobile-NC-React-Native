import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import wishlistService from '@/services/wishlist.service';
import type { RootState } from '@/store';

interface WishlistState {
  courseIds: string[]; // set of wishlisted courseIds
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  courseIds: [],
  loading: false,
  error: null,
};

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistService.getWishlist();
      return response.data.map((item) => item.courseId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (courseId: string, { dispatch, rejectWithValue }) => {
    try {
      await wishlistService.addToWishlist(courseId);
      return courseId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add to wishlist');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (courseId: string, { rejectWithValue }) => {
    try {
      await wishlistService.removeFromWishlist(courseId);
      return courseId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove from wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist(state) {
      state.courseIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.loading = false;
        state.courseIds = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addToWishlist.fulfilled, (state, action: PayloadAction<string>) => {
        if (!state.courseIds.includes(action.payload)) {
          state.courseIds.push(action.payload);
        }
      })
      .addCase(removeFromWishlist.fulfilled, (state, action: PayloadAction<string>) => {
        state.courseIds = state.courseIds.filter((id) => id !== action.payload);
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;

// Selectors
export const selectWishlistCourseIds = (state: RootState) => state.wishlist.courseIds;
export const selectIsWishlisted = (courseId: string) => (state: RootState) =>
  state.wishlist.courseIds.includes(courseId);
export const selectWishlistLoading = (state: RootState) => state.wishlist.loading;

export default wishlistSlice.reducer;
