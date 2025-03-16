import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import { IoEyeOff, IoEye } from "react-icons/io5"; // Eye Icons

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
    <div
      className="flex h-screen items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/img/image.png')" }} // Your image path
    >
      {/* Transparent Overlay for a Sharp Background Effect */}
      <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-md"></div>

      {/* Login Form */}
      <div className="relative bg-black bg-opacity-70 p-10 rounded-2xl shadow-xl border border-purple-700 w-96">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          State Representative Login
        </h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username Field */}
          <div className="relative">
            <FaUser className="absolute left-3 top-3 text-purple-400" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 pl-10 bg-black border border-purple-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Password Field with Toggle Eye Icon */}
          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-purple-400" />
            <input
              type={showPassword ? "text" : "password"} // Toggle between text and password
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pl-10 pr-10 bg-black border border-purple-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-purple-400"
            >
              {showPassword ? <IoEyeOff /> : <IoEye />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full p-3 bg-purple-700 hover:bg-purple-900 transition text-white font-semibold rounded-lg shadow-md"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
