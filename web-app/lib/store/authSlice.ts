import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { config } from '../config';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  skillLevel?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Load user from token on initialization
if (typeof window !== 'undefined' && initialState.token) {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      initialState.user = JSON.parse(userStr);
      initialState.isAuthenticated = true;
    }
  } catch {
    // Invalid user data, clear it
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    initialState.token = null;
  }
}

export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
                token
                user {
                  id
                  email
                  name
                  phone
                  skillLevel
                  createdAt
                  updatedAt
                }
              }
            }
          `,
          variables: {
            input: credentials,
          },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        // Return generic error message instead of technical GraphQL errors
        return rejectWithValue(
          "Something went wrong. We're investigating the problem and will reach out to you when we solve it."
        );
      }

      return data.data.login;
    } catch {
      // Return generic error message for network errors too
      return rejectWithValue(
        "Something went wrong. We're investigating the problem and will reach out to you when we solve it."
      );
    }
  }
);

export const signupAsync = createAsyncThunk(
  'auth/signup',
  async (input: { email: string; password: string; name?: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation Signup($input: SignupInput!) {
              signup(input: $input) {
                token
                user {
                  id
                  email
                  name
                  phone
                  skillLevel
                  createdAt
                  updatedAt
                }
              }
            }
          `,
          variables: {
            input,
          },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        // Return generic error message instead of technical GraphQL errors
        return rejectWithValue(
          "Something went wrong. We're investigating the problem and will reach out to you when we solve it."
        );
      }

      return data.data.signup;
    } catch {
      // Return generic error message for network errors too
      return rejectWithValue(
        "Something went wrong. We're investigating the problem and will reach out to you when we solve it."
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', action.payload.token);
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Signup
      .addCase(signupAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', action.payload.token);
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
      })
      .addCase(signupAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
