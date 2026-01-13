import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Spot {
  id: string;
  name: string;
  slug: string;
}

interface SpotState {
  selectedSpot: Spot | null;
}

const initialState: SpotState = {
  selectedSpot: typeof window !== 'undefined' 
    ? (() => {
        try {
          const saved = localStorage.getItem('selectedSpot');
          return saved ? JSON.parse(saved) : null;
        } catch {
          return null;
        }
      })()
    : null,
};

const spotSlice = createSlice({
  name: 'spot',
  initialState,
  reducers: {
    setSelectedSpot: (state, action: PayloadAction<Spot | null>) => {
      state.selectedSpot = action.payload;
      if (typeof window !== 'undefined') {
        if (action.payload) {
          localStorage.setItem('selectedSpot', JSON.stringify(action.payload));
        } else {
          localStorage.removeItem('selectedSpot');
        }
      }
    },
    clearSelectedSpot: (state) => {
      state.selectedSpot = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('selectedSpot');
      }
    },
  },
});

export const { setSelectedSpot, clearSelectedSpot } = spotSlice.actions;
export default spotSlice.reducer;
