import React, { useState, useEffect } from "react"; // Added useEffect
import { Link, useNavigate } from "react-router-dom";
import {
  Upload,
  ShieldCheck,
  Mail,
  Building,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Ticket, // Added Ticket icon
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BuyerLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Animation state for tickets
  const [animatedTickets, setAnimatedTickets] = useState([]);

  // Animation logic using useEffect
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

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/buyers/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Log the successful login response
      console.log("Buyer Login Successful:", data);

      // Store the JWT token in localStorage
      localStorage.setItem("token", data.token);

      // Show success notification
      toast.success("Login successful! Redirecting to dashboard...", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate("/BuyerEventListings");
      }, 3000);
    } catch (error) {
      // Log the error
      console.error("Login Error:", error.message);

      // Show error notification
      toast.error(error.message || "Login failed. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900 to-black px-4 py-24 relative overflow-hidden">
      {/* Falling Tickets Background */}
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

      <div className="max-w-md w-full mx-auto mt-6 bg-[#260C3C] p-10 rounded-2xl shadow-lg relative z-10">
        <h2 className="text-4xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Buyer Portal
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Mail className="inline mr-2 text-purple-500" />
            <label className="inline mb-2 text-purple-200 font-medium">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 mt-2 pr-10 rounded-lg bg-purple-900 text-purple-300 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="relative">
            <Lock className="inline mr-2 text-purple-500" />
            <label className="inline mb-2 text-purple-200 font-medium">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 mt-2 pr-10 rounded-lg bg-purple-900 text-purple-300 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-[43px] text-purple-400 hover:text-purple-300"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="relative group">
            <div
              className="absolute transition-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt"
            ></div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 
                text-white font-bold py-3 rounded-lg 
                transform hover:scale-105 hover:from-purple-700 hover:to-indigo-800
                transition duration-300 flex items-center justify-center space-x-2 
                group"
            >
              Login as Buyer
            </button>
          </div>
        </form>
        <p className="text-center text-purple-200 mt-4 text-sm">
          Don't have an account?{" "}
          <Link
            to="/buyerregistration"
            className="text-purple-500 hover:text-purple-200 
                  font-semibold transition duration-300 hover:underline"
          >
            SignUp
          </Link>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default BuyerLogin;
