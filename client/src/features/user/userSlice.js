import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";
import { toast } from "react-hot-toast";

const initialState = {
  value: null,
};

export const fetchUser = createAsyncThunk("user/fetchUser", async () => {
  // No need to send token in headers, Clerk will handle it
  const { data } = await api.get("/api/user/data");
  return data.success ? data.user : null;
});

export const updateUser = createAsyncThunk(
  "user/update",
  async ({ userData }) => {
    const { data } = await api.post("/api/user/update", userData);
    if (data.success) {
      toast.success(data.message);
      return data.user;
    } else {
      toast.error(data.message);
      return null;
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.value = action.payload;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.value = action.payload;
      });
  },
});

export default userSlice.reducer;