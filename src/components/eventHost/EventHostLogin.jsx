import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";
// Optional: Import a library like axios if you prefer it over fetch
// import axios from 'axios';

// --- DEFINE YOUR BACKEND API URL ---
const API_BASE_URL = "http://localhost:5000"; // Assuming your backend is on port 5000

const EventHostLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(""); // State for login errors
  const [loading, setLoading] = useState(false); // State for loading indicator

  // --- Animation state ---
  const [animatedTickets, setAnimatedTickets] = useState([]);

  // --- Login Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true); // Show loading indicator

    try {
      // --- Make API Call using the FULL URL ---
      const response = await fetch(`${API_BASE_URL}/api/hosts/login`, {
        // <--- FIX HERE
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Try to parse JSON regardless of status first, as error responses often have JSON bodies
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // Handle cases where response is not JSON (e.g., unexpected server error pages)
        setLoading(false);
        console.error("Failed to parse JSON response:", jsonError);
        // Throw a more specific error if parsing failed, using status text if available
        throw new Error(
          `Server error: ${response.status} ${response.statusText}. Response not in JSON format.`
        );
      }

      setLoading(false); // Hide loading indicator (moved after potential parsing)

      if (!response.ok) {
        // Handle errors reported by the backend (e.g., 400, 401, 403, 500)
        // data should contain the message from the backend (e.g., { message: "Invalid email or password" })
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      // --- Login Successful ---
      console.log("Login successful:", data);

      // 1. Store the token (e.g., in localStorage)
      localStorage.setItem("hostToken", data.token);
      localStorage.setItem("hostInfo", JSON.stringify(data.host));

      // 2. Redirect to the host dashboard or protected area
      navigate("/host/dashboard"); // Or wherever the host should go after login
    } catch (err) {
      // Catch errors from fetch, JSON parsing, or explicitly thrown errors
      setLoading(false); // Ensure loading is stopped on any error
      console.error("Login failed:", err);
      setError(err.message || "Login failed. Please try again."); // Display error to user
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  // --- useEffect for animation (remains the same) ---
  useEffect(() => {
    // ... your existing animation logic ...
    const createTicket = () => {
      if (typeof window !== "undefined") {
        const ticket = {
          id: Math.random(),
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          rotation: Math.random() * 360,
          speedX: (Math.random() - 0.5) * 1,
          speedY: Math.random() * 1.5 + 0.5,
          size: Math.random() * 15 + 8,
        };
        setAnimatedTickets((prevTickets) => [...prevTickets, ticket]);
      }
    };

    let animationId;
    const animationFrame = () => {
      if (typeof window !== "undefined") {
        setAnimatedTickets((prevTickets) =>
          prevTickets
            .map((ticket) => {
              let newX = ticket.x + ticket.speedX;
              let newY = ticket.y + ticket.speedY;
              if (newX > window.innerWidth + ticket.size) newX = -ticket.size;
              if (newX < -ticket.size) newX = window.innerWidth + ticket.size;
              if (newY > window.innerHeight) {
                return {
                  ...ticket,
                  x: Math.random() * window.innerWidth,
                  y: -ticket.size,
                  speedX: (Math.random() - 0.5) * 1,
                  speedY: Math.random() * 1.5 + 0.5,
                  size: Math.random() * 15 + 8,
                };
              }
              return { ...ticket, x: newX, y: newY };
            })
            .filter(Boolean)
        );
      }
      animationId = requestAnimationFrame(animationFrame);
    };

    if (typeof window !== "undefined") {
      const numberOfTickets = 30;
      setAnimatedTickets([]);
      for (let i = 0; i < numberOfTickets; i++) {
        createTicket();
      }
      animationId = requestAnimationFrame(animationFrame);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // --- JSX (Return statement remains the same) ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center px-4 py-24 relative overflow-hidden">
      {/* Falling Tickets Background */}
      {/* ... */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      >
        {animatedTickets.map((ticket) => (
          <span
            key={ticket.id}
            style={{
              position: "absolute",
              left: `${ticket.x}px`,
              top: `${ticket.y}px`,
              transform: `rotate(${ticket.rotation}deg)`,
              fontSize: `${ticket.size}px`,
              color: "rgba(209, 213, 219, 0.3)",
              opacity: 0.7,
              transition: "transform 0.1s linear",
            }}
          >
            <Ticket />
          </span>
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* ... rest of your JSX structure ... */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative bg-black/60 backdrop-blur-2xl shadow-2xl rounded-2xl border border-purple-900/30 overflow-hidden">
          <div className="relative overflow-hidden">
            {/* ... Header ... */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-indigo-900 opacity-50 animate-pulse"></div>
            <div className="relative z-10 text-center py-8 px-6">
              <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-purple-600 mb-3">
                Event Host Portal
              </h1>
              <p className="text-purple-200 text-sm tracking-wide">
                Secure Access to Your Event Management Dashboard
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* --- Display Login Error --- */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-700 text-red-200 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div className="group">
              {/* ... label ... */}
              <label className="block mb-2 text-purple-200 font-medium flex items-center">
                <Mail className="mr-2 text-purple-500" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-4 pr-3 py-3 bg-white/10 border border-purple-600/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 group-hover:border-purple-400"
                  placeholder="Enter your email"
                  required
                  disabled={loading} // Disable input when loading
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              {/* ... label ... */}
              <label className="block mb-2 text-purple-200 font-medium flex items-center">
                <Lock className="mr-2 text-purple-500" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-white/10 border border-purple-600/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 group-hover:border-purple-400"
                  placeholder="Enter your password"
                  required
                  disabled={loading} // Disable input when loading
                />
                {/* ... show/hide button ... */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2
                                     text-purple-400 hover:text-purple-200
                                     focus:outline-none transition duration-300"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            {/* ... link ... */}
            <div className="text-right">
              <a
                href="#" // Implement forgot password later
                className={`text-sm transition duration-300 ${loading ? "text-purple-500 cursor-not-allowed" : "text-purple-300 hover:text-purple-100 hover:underline"}`}
                onClick={(e) => loading && e.preventDefault()} // Prevent click when loading
              >
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className={`w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold py-3 rounded-lg transition duration-300 flex items-center justify-center space-x-2 group ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:scale-105 hover:from-purple-700 hover:to-indigo-800"
              }`}
              disabled={loading} // Disable button when loading
            >
              {loading ? (
                <>
                  {/* Basic Spinner */}
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <LogIn className="mr-2" />
                  <span>Login to Dashboard</span>
                </>
              )}
            </button>

            {/* Register Link */}
            <div className="text-center pt-6 border-t border-purple-900/30">
              <span className="text-purple-300 mr-2">
                Don't have an account?
              </span>
              <button
                type="button"
                onClick={handleRegisterRedirect}
                className={`font-semibold transition duration-300 ${loading ? "text-purple-600 cursor-not-allowed" : "text-purple-500 hover:text-purple-200 hover:underline"}`}
                disabled={loading}
              >
                Register Here
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventHostLogin;
