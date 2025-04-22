import React, { useState, useEffect, useMemo } from "react"; // Added useEffect
import { Mail, Lock, Eye, EyeOff, LogIn, Ticket } from "lucide-react"; // Ensure Ticket is imported
import { useNavigate } from "react-router-dom";

// No CSS defined inside the component anymore

const EventHostLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // --- State for the falling tickets animation ---
  const [animatedTickets, setAnimatedTickets] = useState([]); // Renamed to avoid conflict if 'tickets' is used elsewhere

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempted with:", { email, password });
    // Add actual login logic here
  };

  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  // --- useEffect for the falling tickets animation logic ---
  useEffect(() => {
    const createTicket = () => {
      // Ensure window object is available (runs client-side)
      if (typeof window !== "undefined") {
        const ticket = {
          id: Math.random(),
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight, // Start scattered
          rotation: Math.random() * 360,
          speedX: (Math.random() - 0.5) * 1, // Slower horizontal drift
          speedY: Math.random() * 1.5 + 0.5, // Slower vertical speed
          size: Math.random() * 15 + 8, // Slightly smaller tickets
        };
        setAnimatedTickets((prevTickets) => [...prevTickets, ticket]);
      }
    };

    let animationId;
    const animationFrame = () => {
      if (typeof window !== "undefined") {
        setAnimatedTickets(
          (prevTickets) =>
            prevTickets
              .map((ticket) => {
                let newX = ticket.x + ticket.speedX;
                let newY = ticket.y + ticket.speedY;

                // Wrap around horizontally (optional, subtle effect)
                if (newX > window.innerWidth + ticket.size) newX = -ticket.size;
                if (newX < -ticket.size) newX = window.innerWidth + ticket.size;

                // Reset ticket position when it goes off the bottom
                if (newY > window.innerHeight) {
                  return {
                    ...ticket,
                    x: Math.random() * window.innerWidth,
                    y: -ticket.size, // Reset above the screen
                    speedX: (Math.random() - 0.5) * 1,
                    speedY: Math.random() * 1.5 + 0.5,
                    size: Math.random() * 15 + 8,
                  };
                }

                return { ...ticket, x: newX, y: newY };
              })
              .filter(Boolean) // Remove any potential null/undefined entries if logic changes
        );
      }
      animationId = requestAnimationFrame(animationFrame); // Continue the loop
    };

    // Create initial tickets only on client-side
    if (typeof window !== "undefined") {
      const numberOfTickets = 30; // Control density
      // Clear any existing tickets before creating new ones on mount/re-render if needed
      setAnimatedTickets([]);
      for (let i = 0; i < numberOfTickets; i++) {
        createTicket();
      }
      animationId = requestAnimationFrame(animationFrame); // Start the animation loop
    }

    // Clean up animation frame on component unmount
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Removed the old useMemo for CSS-based tickets ---
  /*
  const numTickets = 30;
  const tickets = useMemo(() => { ... }, []);
  */

  return (
    // Root container needs relative position and overflow hidden
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center px-4 py-24 relative overflow-hidden">
      {/* --- Falling Tickets Background (JS Animation) --- */}
      {/* This div MUST have position: absolute and a lower z-index than the form */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true" // Good practice for decorative elements
      >
        {animatedTickets.map((ticket) => (
          <span // Using span as it's inline, but div would work too
            key={ticket.id}
            style={{
              position: "absolute",
              left: `${ticket.x}px`,
              top: `${ticket.y}px`,
              transform: `rotate(${ticket.rotation}deg)`,
              fontSize: `${ticket.size}px`, // Font size controls icon size
              color: "rgba(209, 213, 219, 0.3)", // Light gray, semi-transparent
              opacity: 0.7, // You can adjust base opacity here if needed
              transition: "transform 0.1s linear", // Optional: slight smoothing
            }}
          >
            <Ticket /> {/* The Lucide Ticket icon */}
          </span>
        ))}
      </div>
      {/* --- End Falling Tickets Background --- */}

      {/* z-10 ensures the form is above the tickets */}
      <div className="w-full max-w-md relative z-10">
        {/* Glow Effects (kept from original) */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition duration-1000"></div>

        <div className="relative bg-black/60 backdrop-blur-2xl shadow-2xl rounded-2xl border border-purple-900/30 overflow-hidden">
          {/* Animated Gradient Header (kept from original) */}
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

          {/* Login Form (kept from original) */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Email Input */}
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
                  className="w-full pl-4 pr-3 py-3 bg-white/10 border border-purple-600/30 text-white rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-purple-500
                    transition duration-300 group-hover:border-purple-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
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
                  className="w-full pl-4 pr-10 py-3 bg-white/10 border border-purple-600/30 text-white rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-purple-500
                    transition duration-300 group-hover:border-purple-400"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2
                    text-purple-400 hover:text-purple-200
                    focus:outline-none transition duration-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <a
                href="#"
                className="text-purple-300 hover:text-purple-100 text-sm
                  transition duration-300 hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-700
                text-white font-bold py-3 rounded-lg
                transform hover:scale-105 hover:from-purple-700 hover:to-indigo-800
                transition duration-300 flex items-center justify-center space-x-2
                group"
            >
              <LogIn className="mr-2" />
              <span>Login to Dashboard</span>
            </button>

            {/* Register Link */}
            <div className="text-center pt-6 border-t border-purple-900/30">
              <span className="text-purple-300 mr-2">
                Don't have an account?
              </span>
              <button
                type="button"
                onClick={handleRegisterRedirect}
                className="text-purple-500 hover:text-purple-200
                  font-semibold transition duration-300 hover:underline"
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
