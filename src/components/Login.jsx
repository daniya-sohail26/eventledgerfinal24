import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import { IoEyeOff, IoEye } from "react-icons/io5";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const storedUsername = import.meta.env.VITE_REACT_APP_USERNAME;
    const storedPassword = import.meta.env.VITE_REACT_APP_PASSWORD;

    if (username === storedUsername && password === storedPassword) {
      localStorage.setItem("isAuthenticated", "true");
      navigate("/state-representative-dashboard");
    } else {
      setError("Invalid credentials. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950 to-black p-4 relative overflow-hidden pt-14">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-800/10 rounded-full animate-blob blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-900/10 rounded-full animate-blob animation-delay-4000 blur-3xl"></div>
      </div>

      {/* Login Container */}
      <div className="relative w-full max-w-md z-10">
        <div className="bg-black/70 backdrop-blur-3xl rounded-3xl shadow-2xl border-2 border-purple-800/30 p-10 space-y-8 relative overflow-hidden">
          {/* Subtle Gradient Border Effect */}
          <div className="absolute inset-[2px] bg-gradient-to-br from-black/80 via-purple-950/50 to-black/80 rounded-[1.5rem] -z-10"></div>

          {/* Header Section */}
          <div className="text-center space-y-4">
            <h2
              className="text-5xl font-extrabold bg-clip-text text-transparent 
              bg-gradient-to-r from-purple-400 to-pink-600"
            >
              State Representative
            </h2>
            <p className="text-xl text-purple-300/80 font-medium">
              Secure Login Portal
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="bg-red-600/20 border border-red-500 text-red-300 
              p-3 rounded-xl text-center animate-pulse"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <FaUser className="text-purple-500 group-focus-within:text-purple-300 transition-colors text-xl" />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-black/40 border border-purple-800/50 
                  rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 
                  transition-all duration-300 placeholder-purple-500/70"
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <FaLock className="text-purple-500 group-focus-within:text-purple-300 transition-colors text-xl" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-black/40 border border-purple-800/50 
                  rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 
                  transition-all duration-300 placeholder-purple-500/70"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 
                  text-purple-500 hover:text-purple-300 transition-colors"
              >
                {showPassword ? (
                  <IoEyeOff className="text-xl" />
                ) : (
                  <IoEye className="text-xl" />
                )}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-700 to-pink-600 
              hover:from-purple-800 hover:to-pink-700 rounded-xl text-white 
              text-lg font-semibold tracking-wide transition-all duration-300 
              transform hover:scale-[1.02] active:scale-95 focus:outline-none 
              focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 
              shadow-xl hover:shadow-2xl"
            >
              Secure Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
