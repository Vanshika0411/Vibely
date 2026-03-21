import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"; 
import api from "../../api/axios";

const initialState = { messages: [] };

// Fetch chat messages between logged-in user and selected user
export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async ({ token, userId }) => {
    const { data } = await api.get(`/api/message/chat/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.success ? data.messages : [];
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    resetMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.messages = action.payload;
    });
  },
});

export const { addMessage, resetMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
