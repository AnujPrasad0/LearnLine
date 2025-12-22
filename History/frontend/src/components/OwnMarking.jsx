import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchAiMarkingScheme } from "../slices/aiMarkingSlice";

const OwnMarking = () => {
  const dispatch = useDispatch();
  const ownMarkingScheme = useSelector((state) => state.aiMarking.own.data);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const submitHandler = async (data) => {
    dispatch(fetchAiMarkingScheme({ mode: "own", ...data }));
  };
  return (
    <>
      <div className="px-6">Gemini Answer Check:</div>
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
          <textarea
            className="border border-white rounded-lg px-2 py-2 focus:outline-none"
            placeholder="Type your answer"
            {...register("answer", { required: true })}
          ></textarea>
          <button className="border-2 rounded-lg px-2 py-2 focus:outline-none">
            Submit
          </button>
        </form>
        <div className="flex flex-col gap-5 w-5/8">
          <div className="whitespace-pre-wrap border border-white rounded-lg p-2">
            Marking:
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {ownMarkingScheme?.markingScheme}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </>
  );
};

export default OwnMarking;
