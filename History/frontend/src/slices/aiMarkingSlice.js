// aiMarkingSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../services/api";

export const fetchAiMarkingScheme = createAsyncThunk(
  "aiMarking/fetch",
  async ({ mode, ...payload }, { rejectWithValue }) => {
    try {
      // ⛔ mode is NOT sent to backend
      const res = await axios.post("/api/subject/marking", payload);
      return { mode, data: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const initialState = {
  gemini: { data: null, loading: false, error: null },
  own: { data: null, loading: false, error: null },
};

const aiMarkingSlice = createSlice({
  name: "aiMarking",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAiMarkingScheme.pending, (state, action) => {
        const { mode } = action.meta.arg;
        if (!state[mode]) return;

        state[mode].loading = true;
        state[mode].error = null;
        state[mode].data = null;
      })
      .addCase(fetchAiMarkingScheme.fulfilled, (state, action) => {
        const { mode, data } = action.payload;
        if (!state[mode]) return;

        state[mode].loading = false;
        state[mode].data = data;
      })
      .addCase(fetchAiMarkingScheme.rejected, (state, action) => {
        const { mode } = action.meta.arg;
        if (!state[mode]) return;

        state[mode].loading = false;
        state[mode].error = action.payload || action.error.message;
      });
  },
});

export default aiMarkingSlice.reducer;
