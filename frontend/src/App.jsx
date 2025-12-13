import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "./services/api";

const App = () => {
  const [answer, setAnswer] = useState("");
  const [images, setImages] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const submitHandler = async (data) => {
    console.log(data);
    const response = await axios.post("/api/subject/answer", data);
    console.log(response);
    setAnswer(response.data.answer);
    setImages(response.data.images);
  };
  return (
    <div className="flex flex-wrap min-h-screen bg-black/70 text-white justify-around gap-5 py-5">
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
        <p className="whitespace-pre-wrap">{answer}</p>
      </div>
      <div className="flex flex-col gap-3 w-2/8">
        <h1>Visual Representation:</h1>
        {images.map((img, index) => (
          <img
            key={index}
            src={`data:image/png;base64,${img}`}
            alt={`generated-${index}`}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
