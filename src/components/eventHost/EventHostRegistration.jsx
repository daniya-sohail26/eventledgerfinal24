import React, { useState, useEffect } from "react";
import {
  Upload,
  ShieldCheck,
  Mail,
  Building,
  Phone,
  MapPin,
  Lock,
  Link as LinkIcon, // Using LinkIcon for wallet connection button
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ethers } from "ethers"; // Import ethers

// Define your backend API URL (replace if necessary)
const API_URL = "http://localhost:5000/api/hosts";

const EventHostRegistration = () => {
  const [formData, setFormData] = useState({
    organizationName: "",
    orgEmail: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    orgLocation: "",
    businessDoc: null,
    // Add walletAddress to formData state
    walletAddress: "",
  });

  const [errors, setErrors] = useState({});
  const [docVerified, setDocVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState(""); // Separate state for display/connection logic
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);

  // Effect to potentially listen for account changes if needed (optional for basic registration)
  // useEffect(() => {
  //   if (window.ethereum) {
  //     const handleAccountsChanged = (accounts) => {
  //       if (accounts.length > 0 && walletAddress) { // Only update if already connected
  //           console.log("Account changed:", accounts[0]);
  //           setWalletAddress(accounts[0]);
  //           setFormData(prev => ({ ...prev, walletAddress: accounts[0] }));
  //           toast.info(`Wallet account updated to: ${accounts[0].substring(0, 6)}...`);
  //       } else if (accounts.length === 0 && walletAddress) { // Handle disconnection
  //           console.log("Wallet disconnected");
  //           setWalletAddress("");
  //           setFormData(prev => ({ ...prev, walletAddress: "" }));
  //           toast.warn("Wallet disconnected.");
  //       }
  //     };
  //     window.ethereum.on('accountsChanged', handleAccountsChanged);
  //     // Cleanup listener on component unmount
  //     return () => {
  //       if (window.ethereum.removeListener) { // Check if removeListener exists
  //         window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
  //       }
  //     };
  //   }
  // }, [walletAddress]); // Re-run effect if walletAddress changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear related errors
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (name === "password" || name === "confirmPassword") {
      setErrors((prev) => ({ ...prev, confirmPassword: null }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      businessDoc: file,
    }));
    setDocVerified(false);
    setErrors((prev) => ({ ...prev, businessDoc: null }));
  };

  const verifyBusinessDoc = () => {
    // ... (verification logic remains the same)
    setErrors((prev) => ({ ...prev, businessDoc: null }));
    if (formData.businessDoc) {
      const allowedTypes = ["application/pdf"];
      if (allowedTypes.includes(formData.businessDoc.type)) {
        setDocVerified(true);
        toast.success("Document verified (PDF)!", { autoClose: 3000 });
      } else {
        setDocVerified(false);
        const errorMsg = "Invalid file type. Please upload a PDF.";
        setErrors((prev) => ({ ...prev, businessDoc: errorMsg }));
        toast.error(errorMsg, { autoClose: 5000 });
      }
    } else {
      setDocVerified(false);
      const errorMsg = "Please select a business document first.";
      setErrors((prev) => ({ ...prev, businessDoc: errorMsg }));
      toast.error(errorMsg, { autoClose: 5000 });
    }
  };

  // --- Wallet Connection Logic ---
  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error(
        "MetaMask (or compatible wallet) not detected. Please install it.",
        { position: "top-center" }
      );
      return;
    }

    setIsWalletConnecting(true);
    setErrors((prev) => ({ ...prev, walletAddress: null })); // Clear previous wallet errors

    try {
      // Use ethers.js BrowserProvider
      const provider = new ethers.BrowserProvider(window.ethereum);
      // Request account access
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address); // Update display state
        setFormData((prev) => ({ ...prev, walletAddress: address })); // Update form data state
        toast.success(
          `Wallet connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
          { autoClose: 4000 }
        );
      } else {
        toast.warn(
          "No accounts found. Please unlock your wallet or grant permissions."
        );
        setWalletAddress(""); // Clear address if no accounts returned
        setFormData((prev) => ({ ...prev, walletAddress: "" }));
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      if (error.code === 4001) {
        // EIP-1193 user rejected request error
        toast.error("Wallet connection request rejected by user.");
      } else if (error.code === -32002) {
        // Request already pending
        toast.warn(
          "Connection request already pending. Please check your wallet."
        );
      } else {
        toast.error("Failed to connect wallet. See console for details.");
      }
      setWalletAddress(""); // Clear address on error
      setFormData((prev) => ({ ...prev, walletAddress: "" }));
    } finally {
      setIsWalletConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    setFormData((prev) => ({ ...prev, walletAddress: "" }));
    setErrors((prev) => ({ ...prev, walletAddress: null })); // Clear potential errors
    toast.info("Wallet disconnected.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // --- Client-Side Validation ---
    const newErrors = {};
    if (!formData.organizationName.trim())
      newErrors.organizationName = "Organization name is required";
    if (!formData.orgEmail.trim()) newErrors.orgEmail = "Email is required";
    else if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.orgEmail)
    )
      newErrors.orgEmail = "Invalid email format";
    if (!formData.mobileNumber.trim())
      newErrors.mobileNumber = "Mobile number is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm password is required";
    else if (
      formData.password &&
      formData.password !== formData.confirmPassword
    )
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.orgLocation.trim())
      newErrors.orgLocation = "Location is required";
    if (!formData.businessDoc)
      newErrors.businessDoc = "Business document is required";
    else if (!docVerified)
      newErrors.businessDoc = "Please click 'Verify' for the selected document";

    // --- Wallet Address Validation (Optional, but recommended) ---
    if (!formData.walletAddress) {
      // Check if wallet address is missing in formData
      newErrors.walletAddress = "Please connect your wallet.";
    } else if (!ethers.isAddress(formData.walletAddress)) {
      // Use ethers utility
      newErrors.walletAddress = "Invalid wallet address format.";
      // Optionally disconnect if format is wrong after manual input (though unlikely with connect button)
      // disconnectWallet();
    }
    // --- End Validation ---

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.warn("Please fix the errors in the form.", {
        position: "top-center",
      });
      return;
    }

    // --- API Call ---
    setIsLoading(true);
    // Construct payload including wallet address
    const payload = {
      organizationName: formData.organizationName.trim(),
      orgEmail: formData.orgEmail.trim(),
      mobileNumber: formData.mobileNumber.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword, // Keep sending confirm for potential backend double-check
      orgLocation: formData.orgLocation.trim(),
      walletAddress: formData.walletAddress, // Include wallet address
    };

    // Note: We are NOT sending the businessDoc file in this JSON request.
    // The instructions say to email it. If you wanted to upload it via the API,
    // you would need to use FormData and likely a different backend endpoint setup.

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(
          data.message || `Registration failed! Status: ${response.status}`,
          { autoClose: 5000 }
        );
        console.error("Registration failed:", data);
        // Potentially set backend errors if they are field specific
        // e.g., if (data.field === 'orgEmail') setErrors(prev => ({...prev, orgEmail: data.message}))
      } else {
        toast.success(
          data.message ||
            "Registration submitted successfully! Remember to email your documents.",
          { autoClose: 7000 }
        );
        console.log("Registration successful:", data);
        // Reset form
        setFormData({
          organizationName: "",
          orgEmail: "",
          mobileNumber: "",
          password: "",
          confirmPassword: "",
          orgLocation: "",
          businessDoc: null,
          walletAddress: "", // Reset wallet address in form data
        });
        setDocVerified(false);
        setWalletAddress(""); // Reset wallet display state
        setErrors({});
        // Optionally clear the file input visually (requires useRef usually)
        const fileInput = document.querySelector(
          'input[type="file"][name="businessDoc"]'
        );
        if (fileInput) fileInput.value = "";
      }
    } catch (error) {
      toast.error("Network error. Failed to connect to the server.", {
        autoClose: 5000,
      });
      console.error("Network or fetch error:", error);
    } finally {
      setIsLoading(false);
    }
    // --- End API Call ---
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl border border-purple-200 overflow-hidden">
          {/* Header */}
          <div className="bg-purple-500 text-white text-center py-8">
            <h1 className="text-4xl font-extrabold text-white mb-2">
              Event Host Registration
            </h1>
            <p className="text-purple-200 text-lg">
              Register your organization to host events
            </p>
          </div>

          {/* Rules Section */}
          <div className="bg-purple-50 p-6 border-b border-purple-100">
            {/* ... (rules content remains the same) ... */}
            <h2 className="text-2xl font-semibold text-purple-900 mb-4">
              Requirements & Instructions
            </h2>
            <ul className="list-disc list-inside text-purple-800 space-y-2">
              <li>
                Connect your organization's primary wallet (e.g., MetaMask).
                This address will be associated with your host account.
              </li>
              <li>
                Please select your business document (PDF format only) below and
                click 'Verify'.
              </li>
              <li>Ensure the document is a single PDF file containing:</li>
              <ol className="list-decimal list-inside ml-4">
                <li>Certificate of Incorporation</li>
                <li>Income Tax Document</li>
                <li>CNIC (Computerized National Identity Card) Picture</li>
              </ol>
              <li>
                After submitting this form, the actual document must be emailed
                to <strong>eventledgersupport@gmail.com</strong> for
                verification and final approval.
              </li>
            </ul>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* --- Wallet Connection Section --- */}
            <div>
              <label className="block mb-2 text-purple-900 font-medium">
                Connect Wallet <span className="text-red-500">*</span>{" "}
                {/* Mark as required */}
              </label>
              {walletAddress ? (
                <div className="flex items-center justify-between p-3 bg-green-100 border border-green-300 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    <span
                      className="text-green-800 font-medium text-sm break-all"
                      title={walletAddress}
                    >
                      Connected:{" "}
                      {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={disconnectWallet}
                    className="ml-4 text-xs text-red-600 hover:text-red-800 font-medium"
                    disabled={isLoading || isWalletConnecting}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={connectWallet}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition duration-300 ${isWalletConnecting ? "opacity-70 cursor-wait" : ""}`}
                  disabled={isWalletConnecting || isLoading}
                >
                  <LinkIcon className="w-5 h-5 mr-2" />
                  {isWalletConnecting
                    ? "Connecting..."
                    : "Connect Wallet (e.g., MetaMask)"}
                </button>
              )}
              {errors.walletAddress && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.walletAddress}
                </p>
              )}
            </div>

            {/* Existing Input fields */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Organization Name */}
              <div>
                <label className="block mb-2 text-purple-900 font-medium">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 bg-white border ${errors.organizationName ? "border-red-500" : "border-purple-200"} text-purple-900 rounded-lg focus:outline-none focus:ring-2 ${errors.organizationName ? "focus:ring-red-500" : "focus:ring-purple-500"}`}
                    placeholder="Enter organization name"
                    required // Added HTML5 required
                  />
                </div>
                {errors.organizationName && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.organizationName}
                  </p>
                )}
              </div>
              {/* Organization Email */}
              <div>
                <label className="block mb-2 text-purple-900 font-medium">
                  Organization Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
                  <input
                    type="email"
                    name="orgEmail"
                    value={formData.orgEmail}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 bg-white border ${errors.orgEmail ? "border-red-500" : "border-purple-200"} text-purple-900 rounded-lg focus:outline-none focus:ring-2 ${errors.orgEmail ? "focus:ring-red-500" : "focus:ring-purple-500"}`}
                    placeholder="Enter organization email"
                    required
                  />
                </div>
                {errors.orgEmail && (
                  <p className="text-red-600 text-sm mt-1">{errors.orgEmail}</p>
                )}
              </div>
            </div>
            {/* ... (Mobile Number, Location, Passwords remain the same, add required span if needed) ... */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Mobile Number */}
              <div>
                <label className="block mb-2 text-purple-900 font-medium">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 bg-white border ${errors.mobileNumber ? "border-red-500" : "border-purple-200"} text-purple-900 rounded-lg focus:outline-none focus:ring-2 ${errors.mobileNumber ? "focus:ring-red-500" : "focus:ring-purple-500"}`}
                    placeholder="Enter mobile number"
                    required
                  />
                </div>
                {errors.mobileNumber && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.mobileNumber}
                  </p>
                )}
              </div>
              {/* Organization Location */}
              <div>
                <label className="block mb-2 text-purple-900 font-medium">
                  Organization Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
                  <input
                    type="text"
                    name="orgLocation"
                    value={formData.orgLocation}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 bg-white border ${errors.orgLocation ? "border-red-500" : "border-purple-200"} text-purple-900 rounded-lg focus:outline-none focus:ring-2 ${errors.orgLocation ? "focus:ring-red-500" : "focus:ring-purple-500"}`}
                    placeholder="Enter organization location"
                    required
                  />
                </div>
                {errors.orgLocation && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.orgLocation}
                  </p>
                )}
              </div>
            </div>
            {/* Password and Confirm Password */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-purple-900 font-medium">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 bg-white border ${errors.password ? "border-red-500" : "border-purple-200"} text-purple-900 rounded-lg focus:outline-none focus:ring-2 ${errors.password ? "focus:ring-red-500" : "focus:ring-purple-500"}`}
                    placeholder="Enter password (min 6 chars)"
                    required
                  />
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-purple-900 font-medium">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 bg-white border ${errors.confirmPassword ? "border-red-500" : "border-purple-200"} text-purple-900 rounded-lg focus:outline-none focus:ring-2 ${errors.confirmPassword ? "focus:ring-red-500" : "focus:ring-purple-500"}`}
                    placeholder="Confirm password"
                    required
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Business Document Upload */}
            <div>
              <label className="block mb-2 text-purple-900 font-medium">
                Business Document (PDF only){" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative flex-grow">
                  <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
                  <input
                    type="file"
                    name="businessDoc"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className={`w-full pl-10 pr-3 py-2 bg-white border ${errors.businessDoc ? "border-red-500" : "border-purple-200"} text-purple-900 rounded-lg focus:outline-none focus:ring-2 ${errors.businessDoc ? "focus:ring-red-500" : "focus:ring-purple-500"} file:mr-4 file:border-0 file:bg-purple-100 file:text-purple-900 file:px-4 file:py-2 file:rounded-lg file:cursor-pointer`}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={verifyBusinessDoc}
                  className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition duration-300 ${docVerified ? "bg-green-600 hover:bg-green-700" : ""} ${!formData.businessDoc ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!formData.businessDoc || isLoading} // Disable if no doc or submitting
                >
                  <ShieldCheck className="mr-2 h-5 w-5" />
                  {docVerified ? "Verified" : "Verify"}
                </button>
              </div>
              {errors.businessDoc && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.businessDoc}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-center mt-8">
              <button
                type="submit"
                className={`bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg ${isLoading || isWalletConnecting ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={
                  isLoading ||
                  isWalletConnecting ||
                  !docVerified ||
                  !walletAddress
                } // Disable if loading, connecting, doc not verified, or wallet not connected
              >
                {isLoading ? "Submitting..." : "Register as Event Host"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EventHostRegistration;
