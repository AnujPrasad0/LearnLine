import { Route, Routes } from "react-router-dom";
import Answer from "../components/Answer";
import MarkingScheme from "../components/MarkingScheme";
import Chunks from "../components/Chunks";
import TeacherSection from "../components/TeacherSection";
import TeacherGrading from "../components/TeacherGrading";

const Mainroutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Answer />} />
      <Route path="/markingscheme" element={<MarkingScheme />} />
      <Route path="/chunks" element={<Chunks />} />
      <Route path="/teachersection" element={<TeacherSection />} />
      <Route path="/teacher-grading" element={<TeacherGrading />} />
    </Routes>
  );
};

export default Mainroutes;
