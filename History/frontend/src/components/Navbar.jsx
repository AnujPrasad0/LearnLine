import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="flex justify-around items-center bg-slate-800">
      <NavLink to="/">Answer</NavLink>
      <NavLink to="/markingscheme">MarkingScheme</NavLink>
      <NavLink to="/chunks">Chunks</NavLink>
      <NavLink to="/teachersection">TeacherSection</NavLink>
      <NavLink to="/teacher-grading">Teacher Grading</NavLink>
    </div>
  );
};

export default Navbar;
