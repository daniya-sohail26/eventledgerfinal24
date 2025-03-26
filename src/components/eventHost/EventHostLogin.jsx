import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EventHostLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempted with:", { email, password });
  };

  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md relative">
        {/* Glow Effects */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition duration-1000"></div>

        <div className="relative bg-black/60 backdrop-blur-2xl shadow-2xl rounded-2xl border border-purple-900/30 overflow-hidden">
          {/* Animated Gradient Header */}
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

          {/* Login Form */}
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

        {/* Subtle Background Particles */}
        <div className="absolute -z-10 inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-purple-500/20 rounded-full animate-pulse"
              style={{
                width: `${Math.random() * 50 + 10}px`,
                height: `${Math.random() * 50 + 10}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventHostLogin;
