import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../services/api";

export const setAnswer = createAsyncThunk("answer/setAnswer", async (data) => {
  const response = await axios.post("/api/subject/answer", data);
  return response.data;
});

const initialState = {
  answer: [],
  answerLoading: false,
  answerError: null,
};

const answerSlice = createSlice({
  name: "answer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setAnswer.pending, (state) => {
        state.answerLoading = true;
        state.answerError = null;
      })
      .addCase(setAnswer.rejected, (state, action) => {
        state.answerLoading = false;
        state.answerError = action.answerError;
      })
      .addCase(setAnswer.fulfilled, (state, action) => {
        state.answerLoading = false;
        state.answer = action.payload;
      });
  },
});

export default answerSlice.reducer;
