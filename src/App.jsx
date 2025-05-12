import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Features from "./components/Features";
import Story from "./components/Story";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Dashboard from "./components/stateRepresentative/Dashboard";
import Login from "./components/Login";
import EventHostLogin from "./components/eventHost/EventHostLogin";
import EventHostRegistration from "./components/eventHost/EventHostRegistration";
import EventCreationProcess from "./components/eventHost/EventCreationProcess";
import BuyerLogin from "./components/buyer/BuyerLogin";
import BuyerRegistration from "./components/buyer/BuyerRegistration";
import ProductsPage from "./components/eventHost/EventHostProducts";
import BuyerEventListings from "./components/buyer/BuyerEventListings";
import EventDetailsPageTailwind from "./components/buyer/EventDetailsPageTailwind.jsx";
import BuyerPersonalEvents from "./components/buyer/BuyerPersonalEvents.jsx";
import PropTypes from "prop-types";

// ProtectedRoute component to handle authentication
const ProtectedRoute = ({ element, redirectPath = "/login" }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  console.log("isAuthenticated:", isAuthenticated); // Log for debugging

  if (!isAuthenticated) {
    // Store the current path before redirecting
    localStorage.setItem("redirectPath", window.location.pathname);
    return <Navigate to={redirectPath} />;
  }

  return element;
};

ProtectedRoute.propTypes = {
  element: PropTypes.element.isRequired, // Validate that element is a React element
  redirectPath: PropTypes.string,
};

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
        <Route path="/buyerlogin" element={<BuyerLogin />} />
        <Route path="/buyerregistration" element={<BuyerRegistration />} />

        {/* Protected Routes */}
        <Route
          path="/create-event"
          element={<ProtectedRoute element={<EventCreationProcess />} />}
        />
        <Route
          path="/productshost"
          element={<ProtectedRoute element={<ProductsPage />} />}
        />
        <Route
          path="/buyerEventListings"
          element={<ProtectedRoute element={<BuyerEventListings />} />}
        />
        <Route
          path="/buyerEventListings/:eventId"
          element={<ProtectedRoute element={<EventDetailsPageTailwind />} />}
        />
        <Route
          path="/BuyerPersonalEvents"
          element={<ProtectedRoute element={<BuyerPersonalEvents />} />}
        />
        <Route
          path="/state-representative-dashboard"
          element={<ProtectedRoute element={<Dashboard />} />}
        />

        {/* Catch-all route for unmatched paths */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </main>
  );
}

export default App;
