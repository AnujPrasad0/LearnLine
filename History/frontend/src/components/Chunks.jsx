import { useSelector } from "react-redux";

const Chunks = () => {
  const answer = useSelector((state) => state.answer.answer);
  return (
    <div className="flex flex-col gap-5 px-5 py-5">
      <h1>Chunks used for this Answer:</h1>
      {answer?.memory?.map((item, index) => (
        <div
          className="flex flex-col gap-3 whitespace-pre-wrap border border-white rounded-lg p-2"
          key={index}
        >
          <p>chunk: {item.metadata.chunk_text}</p>
          <p>class: {item.metadata.className}</p>
          <p>subject: {item.metadata.subject}</p>
          <p>page: {item.metadata.page}</p>
          <p>type: {item.metadata.type}</p>
        </div>
      ))}
    </div>
  );
};

export default Chunks;
