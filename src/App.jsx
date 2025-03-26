import { Routes, Route } from "react-router-dom";
import NavBar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Features from "./components/Features";
import Story from "./components/Story";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Dashboard from "./components/stateRepresentative/Dashboard";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import EventHostLogin from "./components/eventHost/EventHostLogin";
import EventHostRegistration from "./components/eventHost/EventHostRegistration";


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
        <Route path="/login" element={<Login />} />
        <Route path="/event-host-login" element={<EventHostLogin />} />
        <Route path="/register" element={<EventHostRegistration />} />
        <Route element={<PrivateRoute />}>
          <Route
            path="/state-representative-dashboard"
            element={<Dashboard />}
          />
        </Route>
      </Routes>
    </main>
  );
}

export default App;
