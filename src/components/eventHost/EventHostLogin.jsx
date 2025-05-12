import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

const EventHostLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [animatedTickets, setAnimatedTickets] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/hosts/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        setLoading(false);
        throw new Error(
          `Server error: ${response.status} ${response.statusText}. Response not in JSON format.`
        );
      }
      setLoading(false);
      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }
      // Store hostId along with token and hostInfo
      localStorage.setItem("hostToken", data.token);
      localStorage.setItem("hostInfo", JSON.stringify(data.host));
      localStorage.setItem("hostId", data.host._id); // Assuming data.host._id contains the hostId
      navigate("/productshost");
    } catch (err) {
      setLoading(false);
      setError(err.message || "Login failed. Please try again.");
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center px-4 py-24 relative overflow-hidden">
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
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative bg-black/60 backdrop-blur-2xl shadow-2xl rounded-2xl border border-purple-900/30 overflow-hidden">
          <div className="relative overflow-hidden">
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
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-700 text-red-200 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="group">
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
                  disabled={loading}
                />
              </div>
            </div>
            <div className="group">
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
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-200 focus:outline-none transition duration-300"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <a
                href="#"
                className={`text-sm transition duration-300 ${loading ? "text-purple-500 cursor-not-allowed" : "text-purple-300 hover:text-purple-100 hover:underline"}`}
                onClick={(e) => loading && e.preventDefault()}
              >
                Forgot Password?
              </a>
            </div>
            <button
              type="submit"
              className={`w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold py-3 rounded-lg transition duration-300 flex items-center justify-center space-x-2 group ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:scale-105 hover:from-purple-700 hover:to-indigo-800"
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
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
