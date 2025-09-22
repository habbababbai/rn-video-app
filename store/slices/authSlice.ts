import {createSlice, PayloadAction} from '@reduxjs/toolkit';


interface AuthState {
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginAsGuest: (state) => {
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
    },
  },
});

export const {loginAsGuest, logout} = authSlice.actions;
export default authSlice.reducer;
