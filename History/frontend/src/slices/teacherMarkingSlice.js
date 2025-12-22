// teacherMarkingSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../services/api";

export const fetchTeacherMarkingScheme = createAsyncThunk(
  "teacherMarking/fetch",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/subject/marking", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const teacherMarkingSlice = createSlice({
  name: "teacherMarking",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherMarkingScheme.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherMarkingScheme.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTeacherMarkingScheme.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default teacherMarkingSlice.reducer;
