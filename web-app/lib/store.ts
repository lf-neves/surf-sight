import { configureStore } from '@reduxjs/toolkit';
import authReducer from './store/authSlice';
import spotReducer from './store/spotSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    spot: spotReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
