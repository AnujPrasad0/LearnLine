import { Route, Routes } from "react-router-dom";
import Answer from "../components/Answer";
import MarkingScheme from "../components/MarkingScheme";
import Chunks from "../components/Chunks";

const Mainroutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Answer />} />
      <Route path="/markingscheme" element={<MarkingScheme />} />
      <Route path="/chunks" element={<Chunks />} />
    </Routes>
  );
};

export default Mainroutes;
