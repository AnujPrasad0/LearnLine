import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { setAnswer } from "../slices/answerSlice";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchAiMarkingScheme } from "../slices/aiMarkingSlice";
import { setImages } from "../slices/imageSlice";
import { useState } from "react";

const Answer = () => {
  const dispatch = useDispatch();
  const answer = useSelector((state) => state.answer.answer);
  const geminiMarkingScheme = useSelector(
    (state) => state.aiMarking.gemini.data
  );

  const images = useSelector((state) => state.images.images);

  const [formData, setFormData] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const submitHandler = async (data) => {
    setFormData(data);
    dispatch(setAnswer(data));
  };

  const markingSchemeHandler = () => {
    dispatch(
      fetchAiMarkingScheme({
        mode: "gemini",
        question: formData.question,
        marks: formData.marks,
        answer: answer.answer,
      })
    );
  };

  const imageHandler = () => {
    dispatch(setImages(answer.answer));
  };

  return (
    <>
      <div className="flex justify-around items-start gap-5 py-5">
        <form
          className="flex flex-col gap-3 w-2/8"
          onSubmit={handleSubmit(submitHandler)}
        >
          <input
            className="border border-white rounded-lg px-2 py-2 focus:outline-none"
            type="text"
            placeholder="Enter your question"
            {...register("question", { required: true })}
          />
          <select
            className="border border-white rounded-lg px-2 py-2 focus:outline-none"
            {...register("marks", { required: true })}
          >
            <option className="bg-black/70" value="">
              Select Marks
            </option>
            <option className="bg-black/70" value="1">
              1
            </option>
            <option className="bg-black/70" value="2">
              2
            </option>
            <option className="bg-black/70" value="3">
              3
            </option>
            <option className="bg-black/70" value="4">
              4
            </option>
            <option className="bg-black/70" value="5">
              5
            </option>
          </select>
          <select
            className="border border-white rounded-lg px-2 py-2 focus:outline-none"
            {...register("subject")}
          >
            <option className="bg-black/70" value="">
              Select Subject
            </option>
            <option className="bg-black/70" value="history">
              History
            </option>
          </select>
          <select
            className="border border-white rounded-lg px-2 py-2 focus:outline-none"
            {...register("className")}
          >
            <option className="bg-black/70" value="">
              Select class
            </option>
            <option className="bg-black/70" value="10">
              10
            </option>
            <option className="bg-black/70" value="9">
              9
            </option>
            <option className="bg-black/70" value="8">
              8
            </option>
            <option className="bg-black/70" value="7">
              7
            </option>
            <option className="bg-black/70" value="6">
              6
            </option>
          </select>
          <button className="border-2 rounded-lg px-2 py-2 focus:outline-none">
            Submit
          </button>
        </form>
        <div className="flex flex-col gap-3 w-3/8">
          <h1>Answer: </h1>
          <div className="whitespace-pre-wrap">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {answer?.answer}
            </ReactMarkdown>
          </div>
          {answer.answer && (
            <div className="space-x-2">
              <button
                onClick={markingSchemeHandler}
                className="bg-blue-500 p-2"
              >
                Marking Scheme
              </button>
              <button onClick={imageHandler} className="bg-blue-500 p-2">
                Visual Representation
              </button>
            </div>
          )}
          <br />
        </div>
        <div className="flex flex-col gap-3 w-2/8">
          <h1>Visual Representation:</h1>
          {images?.images?.map((img, index) => (
            <img
              key={index}
              src={`data:image/png;base64,${img}`}
              alt={`generated-${index}`}
            />
          ))}
        </div>
      </div>
      <div className="whitespace-pre-wrap border border-white rounded-lg p-2 m-5">
        Marking Scheme:
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {geminiMarkingScheme?.markingScheme}
        </ReactMarkdown>
      </div>
    </>
  );
};

export default Answer;
