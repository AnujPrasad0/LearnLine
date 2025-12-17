import Mainroutes from "./routes/Mainroutes";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <div className="min-h-screen bg-black/70 text-white space-y-5">
      <Navbar />
      <Mainroutes />
    </div>
  );
};

export default App;
