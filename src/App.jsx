import { Routes, Route } from "react-router-dom";
import NavBar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Features from "./components/Features";
import Story from "./components/Story";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Dashboard from "./components/stateRepresentative/Dashboard";

function App() {
  return (
    <main className="relative min-h-screen w-screen overflow-x-hidden">
      <NavBar />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <About />
              <Features />
              <Story />
              <Contact />
              <Footer />
            </>
          }
        />
        <Route path="/state-representative-dashboard" element={<Dashboard />} />
      </Routes>
    </main>
  );
}

// ✅ Make sure you have this export
export default App;
