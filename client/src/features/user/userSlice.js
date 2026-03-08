// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import api from "../../api/axios.js";
// import { toast } from "react-hot-toast";

// const initialState = {
//   value: null,
// };

// export const fetchUser = createAsyncThunk("user/fetchUser", async (token) => {
//   const { data } = await api.get("/api/user/data", {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return data.success ? data.user : null;
// });

// export const updateUser = createAsyncThunk(
//   "user/update",
//   async ({ userData, token }) => {
//     const { data } = await api.post("/api/user/update", userData, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     if (data.success) {
//       toast.success(data.message);
//       return data.user;
//     } else {
//       toast.error(data.message);
//       return null;
//     }
//   }
// );

// const userSlice = createSlice({
//   name: "user",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchUser.fulfilled, (state, action) => {
//         state.value = action.payload;
//       })
//       .addCase(updateUser.fulfilled, (state, action) => {
//         state.value = action.payload;
//       });
//   },
// });

// export default userSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";
import { toast } from "react-hot-toast";

const initialState = {
  value: null,
};

// ✅ Fetch user data
export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (token, { rejectWithValue }) => {
    try {
      if (!token) return rejectWithValue("No token provided");

      const { data } = await api.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return data.success ? data.user : null;
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);

// ✅ Update user
export const updateUser = createAsyncThunk(
  "user/update",
  async ({ userData, token }, { rejectWithValue }) => {
    try {
      if (!token) return rejectWithValue("No token provided");

      const { data } = await api.post("/api/user/update", userData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success(data.message);
        return data.user;
      } else {
        toast.error(data.message);
        return rejectWithValue(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Update failed");
      return rejectWithValue(error.response?.data?.message);
    }
  },
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
