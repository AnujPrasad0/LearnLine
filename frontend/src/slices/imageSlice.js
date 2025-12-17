import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../services/api";

export const setImages = createAsyncThunk("images/setImages", async (data) => {
  console.log(data);
  const response = await axios.post("/api/subject/images", { answer: data });
  console.log(response.data);

  return response.data;
});

const initialState = {
  images: [],
  imagesLoading: false,
  imagesError: null,
};

const imageSlice = createSlice({
  name: "images",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setImages.pending, (state) => {
        state.imagesLoading = true;
        state.imagesError = null;
      })
      .addCase(setImages.rejected, (state, action) => {
        state.imagesLoading = false;
        state.imagesError = action.imagesError;
      })
      .addCase(setImages.fulfilled, (state, action) => {
        state.imagesLoading = false;
        state.images = action.payload;
      });
  },
});

export default imageSlice.reducer;
