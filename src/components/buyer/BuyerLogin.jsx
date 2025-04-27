import React, { useState } from "react";
import { Link } from "react-router-dom"; // Make sure you're using react-router
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
} from "lucide-react";

const BuyerRegister = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false); // Add this to your component state

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Buyer Registered:", formData);
    alert("Registration successful!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900 to-black px-4 py-24">
      <div className="max-w-md w-full mx-auto mt-6 bg-[#260C3C] p-10 rounded-2xl shadow-lg">
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
            <div class="absolute transitiona-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt"></div>
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
    </div>
  );
};

export default BuyerRegister;
