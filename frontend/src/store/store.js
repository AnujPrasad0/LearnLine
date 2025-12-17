import { configureStore } from "@reduxjs/toolkit";
import imageReducer from "../slices/imageSlice";
import teacherMarkingReducer from "../slices/teacherMarkingSlice";
import aiMarkingReducer from "../slices/aiMarkingSlice";
import answerReducer from "../slices/answerSlice";

const store = configureStore({
  reducer: {
    aiMarking: aiMarkingReducer,
    images: imageReducer,
    answer: answerReducer,
    teacherMarking: teacherMarkingReducer,
  },
});

export default store;
