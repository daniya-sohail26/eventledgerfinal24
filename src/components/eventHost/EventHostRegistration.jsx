// import React, { useState, useEffect } from "react";
// import {
//   Upload,
//   ShieldCheck,
//   Mail,
//   Building,
//   Phone,
//   MapPin,
//   Lock,
//   Link as LinkIcon, // Using LinkIcon for wallet connection button
// } from "lucide-react";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { ethers } from "ethers"; // Import ethers

// // Define your backend API URL (replace if necessary)
// const API_URL = "http://localhost:5000/api/hosts";

// const EventHostRegistration = () => {
//   const [formData, setFormData] = useState({
//     organizationName: "",
//     orgEmail: "",
//     mobileNumber: "",
//     password: "",
//     confirmPassword: "",
//     orgLocation: "",
//     businessDoc: null,
//     // Add walletAddress to formData state
//     walletAddress: "",
//   });

//   const [errors, setErrors] = useState({});
//   const [docVerified, setDocVerified] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [walletAddress, setWalletAddress] = useState(""); // Separate state for display/connection logic
//   const [isWalletConnecting, setIsWalletConnecting] = useState(false);

//   // Effect to potentially listen for account changes if needed (optional for basic registration)
//   // useEffect(() => {
//   //   if (window.ethereum) {
//   //     const handleAccountsChanged = (accounts) => {
//   //       if (accounts.length > 0 && walletAddress) { // Only update if already connected
//   //           console.log("Account changed:", accounts[0]);
//   //           setWalletAddress(accounts[0]);
//   //           setFormData(prev => ({ ...prev, walletAddress: accounts[0] }));
//   //           toast.info(`Wallet account updated to: ${accounts[0].substring(0, 6)}...`);
//   //       } else if (accounts.length === 0 && walletAddress) { // Handle disconnection
//   //           console.log("Wallet disconnected");
//   //           setWalletAddress("");
//   //           setFormData(prev => ({ ...prev, walletAddress: "" }));
//   //           toast.warn("Wallet disconnected.");
//   //       }
//   //     };
//   //     window.ethereum.on('accountsChanged', handleAccountsChanged);
//   //     // Cleanup listener on component unmount
//   //     return () => {
//   //       if (window.ethereum.removeListener) { // Check if removeListener exists
//   //         window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
//   //       }
//   //     };
//   //   }
//   // }, [walletAddress]); // Re-run effect if walletAddress changes

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//     // Clear related errors
//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: null }));
//     }
//     if (name === "password" || name === "confirmPassword") {
//       setErrors((prev) => ({ ...prev, confirmPassword: null }));
//     }
//   };

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     setFormData((prev) => ({
//       ...prev,
//       businessDoc: file,
//     }));
//     setDocVerified(false);
//     setErrors((prev) => ({ ...prev, businessDoc: null }));
//   };

//   const verifyBusinessDoc = () => {
//     // ... (verification logic remains the same)
//     setErrors((prev) => ({ ...prev, businessDoc: null }));
//     if (formData.businessDoc) {
//       const allowedTypes = ["application/pdf"];
//       if (allowedTypes.includes(formData.businessDoc.type)) {
//         setDocVerified(true);
//         toast.success("Document verified (PDF)!", { autoClose: 3000 });
//       } else {
//         setDocVerified(false);
//         const errorMsg = "Invalid file type. Please upload a PDF.";
//         setErrors((prev) => ({ ...prev, businessDoc: errorMsg }));
//         toast.error(errorMsg, { autoClose: 5000 });
//       }
//     } else {
//       setDocVerified(false);
//       const errorMsg = "Please select a business document first.";
//       setErrors((prev) => ({ ...prev, businessDoc: errorMsg }));
//       toast.error(errorMsg, { autoClose: 5000 });
//     }
//   };

//   // --- Wallet Connection Logic ---
//   const connectWallet = async () => {
//     if (typeof window.ethereum === "undefined") {
//       toast.error(
//         "MetaMask (or compatible wallet) not detected. Please install it.",
//         { position: "top-center" }
//       );
//       return;
//     }

//     setIsWalletConnecting(true);
//     setErrors((prev) => ({ ...prev, walletAddress: null })); // Clear previous wallet errors

//     try {
//       // Use ethers.js BrowserProvider
//       const provider = new ethers.BrowserProvider(window.ethereum);
//       // Request account access
//       const accounts = await provider.send("eth_requestAccounts", []);

//       if (accounts && accounts.length > 0) {
//         const address = accounts[0];
//         setWalletAddress(address); // Update display state
//         setFormData((prev) => ({ ...prev, walletAddress: address })); // Update form data state
//         toast.success(
//           `Wallet connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
//           { autoClose: 4000 }
//         );
//       } else {
//         toast.warn(
//           "No accounts found. Please unlock your wallet or grant permissions."
//         );
//         setWalletAddress(""); // Clear address if no accounts returned
//         setFormData((prev) => ({ ...prev, walletAddress: "" }));
//       }
//     } catch (error) {
//       console.error("Wallet connection error:", error);
//       if (error.code === 4001) {
//         // EIP-1193 user rejected request error
//         toast.error("Wallet connection request rejected by user.");
//       } else if (error.code === -32002) {
//         // Request already pending
//         toast.warn(
//           "Connection request already pending. Please check your wallet."
//         );
//       } else {
//         toast.error("Failed to connect wallet. See console for details.");
//       }
//       setWalletAddress(""); // Clear address on error
//       setFormData((prev) => ({ ...prev, walletAddress: "" }));
//     } finally {
//       setIsWalletConnecting(false);
//     }
//   };

//   const disconnectWallet = () => {
//     setWalletAddress("");
//     setFormData((prev) => ({ ...prev, walletAddress: "" }));
//     setErrors((prev) => ({ ...prev, walletAddress: null })); // Clear potential errors
//     toast.info("Wallet disconnected.");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrors({});

//     // --- Client-Side Validation ---
//     const newErrors = {};
//     if (!formData.organizationName.trim())
//       newErrors.organizationName = "Organization name is required";
//     if (!formData.orgEmail.trim()) newErrors.orgEmail = "Email is required";
//     else if (
//       !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.orgEmail)
//     )
//       newErrors.orgEmail = "Invalid email format";
//     if (!formData.mobileNumber.trim())
//       newErrors.mobileNumber = "Mobile number is required";
//     if (!formData.password) newErrors.password = "Password is required";
//     else if (formData.password.length < 6)
//       newErrors.password = "Password must be at least 6 characters";
//     if (!formData.confirmPassword)
//       newErrors.confirmPassword = "Confirm password is required";
//     else if (
//       formData.password &&
//       formData.password !== formData.confirmPassword
//     )
//       newErrors.confirmPassword = "Passwords do not match";
//     if (!formData.orgLocation.trim())
//       newErrors.orgLocation = "Location is required";
//     if (!formData.businessDoc)
//       newErrors.businessDoc = "Business document is required";
//     else if (!docVerified)
//       newErrors.businessDoc = "Please click 'Verify' for the selected document";

//     // --- Wallet Address Validation (Optional, but recommended) ---
//     if (!formData.walletAddress) {
//       // Check if wallet address is missing in formData
//       newErrors.walletAddress = "Please connect your wallet.";
//     } else if (!ethers.isAddress(formData.walletAddress)) {
//       // Use ethers utility
//       newErrors.walletAddress = "Invalid wallet address format.";
//       // Optionally disconnect if format is wrong after manual input (though unlikely with connect button)
//       // disconnectWallet();
//     }
//     // --- End Validation ---

//     setErrors(newErrors);

//     if (Object.keys(newErrors).length > 0) {
//       toast.warn("Please fix the errors in the form.", {
//         position: "top-center",
//       });
//       return;
//     }

//     // --- API Call ---
//     setIsLoading(true);
//     // Construct payload including wallet address
//     const payload = {
//       organizationName: formData.organizationName.trim(),
//       orgEmail: formData.orgEmail.trim(),
//       mobileNumber: formData.mobileNumber.trim(),
//       password: formData.password,
//       confirmPassword: formData.confirmPassword, // Keep sending confirm for potential backend double-check
//       orgLocation: formData.orgLocation.trim(),
//       walletAddress: formData.walletAddress, // Include wallet address
//     };

//     // Note: We are NOT sending the businessDoc file in this JSON request.
//     // The instructions say to email it. If you wanted to upload it via the API,
//     // you would need to use FormData and likely a different backend endpoint setup.

//     try {
//       const response = await fetch(`${API_URL}/register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await response.json();

//       if (!response.ok) {
//         toast.error(
//           data.message || `Registration failed! Status: ${response.status}`,
//           { autoClose: 5000 }
//         );
//         console.error("Registration failed:", data);
//         // Potentially set backend errors if they are field specific
//         // e.g., if (data.field === 'orgEmail') setErrors(prev => ({...prev, orgEmail: data.message}))
//       } else {
//         toast.success(
//           data.message ||
//             "Registration submitted successfully! Remember to email your documents.",
//           { autoClose: 7000 }
//         );
//         console.log("Registration successful:", data);
//         // Reset form
//         setFormData({
//           organizationName: "",
//           orgEmail: "",
//           mobileNumber: "",
//           password: "",
//           confirmPassword: "",
//           orgLocation: "",
//           businessDoc: null,
//           walletAddress: "", // Reset wallet address in form data
//         });
//         setDocVerified(false);
//         setWalletAddress(""); // Reset wallet display state
//         setErrors({});
//         // Optionally clear the file input visually (requires useRef usually)
//         const fileInput = document.querySelector(
//           'input[type="file"][name="businessDoc"]'
//         );
//         if (fileInput) fileInput.value = "";
//       }
//     } catch (error) {
//       toast.error("Network error. Failed to connect to the server.", {
//         autoClose: 5000,
//       });
//       console.error("Network or fetch error:", error);
//     } finally {
//       setIsLoading(false);
//     }
//     // --- End API Call ---
//   };

//   return (
//     <>
//       <ToastContainer
//         position="top-right"
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="light"
//       />
//       <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center px-4 py-24">
//         <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl border border-purple-200 overflow-hidden">
//           {/* Header */}
//           <div className="bg-purple-500 text-white text-center py-8">
//             <h1 className="text-4xl font-extrabold text-white mb-2">
//               Event Host Registration
//             </h1>
//             <p className="text-purple-200 text-lg">
//               Register your organization to host events
//             </p>
//           </div>

//           {/* Rules Section */}
//           <div className="bg-purple-50 p-6 border-b border-purple-100">
//             {/* ... (rules content remains the same) ... */}
//             <h2 className="text-2xl font-semibold text-purple-900 mb-4">
//               Requirements & Instructions
//             </h2>
//             <ul className="list-disc list-inside text-purple-800 space-y-2">
//               <li>
//                 Connect your organization's primary wallet (e.g., MetaMask).
//                 This address will be associated with your host account.
//               </li>
//               <li>
//                 Please select your business document (PDF format only) below and
//                 click 'Verify'.
//               </li>
//               <li>Ensure the document is a single PDF file containing:</li>
//               <ol className="list-decimal list-inside ml-4">
//                 <li>Certificate of Incorporation</li>
//                 <li>Income Tax Document</li>
//                 <li>CNIC (Computerized National Identity Card) Picture</li>
//               </ol>
//               <li>
//                 After submitting this form, the actual document must be emailed
//                 to <strong>eventledgersupport@gmail.com</strong> for
//                 verification and final approval.
//               </li>
//             </ul>
//           </div>

//           {/* Registration Form */}
//           <form onSubmit={handleSubmit} className="p-8 space-y-6">
//             {/* --- Wallet Connection Section --- */}
//             <div>
//               <label className="block mb-2 text-purple-900 font-medium">
//                 Connect Wallet <span className="text-red-500">*</span>{" "}
//                 {/* Mark as required */}
//               </label>
//               {walletAddress ? (
//                 <div className="flex items-center justify-between p-3 bg-green-100 border border-green-300 rounded-lg">
//                   <div className="flex items-center space-x-2">
//                     <ShieldCheck className="w-5 h-5 text-green-600" />
//                     <span
//                       className="text-green-800 font-medium text-sm break-all"
//                       title={walletAddress}
//                     >
//                       Connected:{" "}
//                       {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
//                     </span>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={disconnectWallet}
//                     className="ml-4 text-xs text-red-600 hover:text-red-800 font-medium"
//                     disabled={isLoading || isWalletConnecting}
//                   >
//                     Disconnect
//                   </button>
//                 </div>
//               ) : (
//                 <button
//                   type="button"
//                   onClick={connectWallet}
//                   className={`w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition duration-300 ${isWalletConnecting ? "opacity-70 cursor-wait" : ""}`}
//                   disabled={isWalletConnecting || isLoading}
//                 >
//                   <LinkIcon className="w-5 h-5 mr-2" />
//                   {isWalletConnecting
//                     ? "Connecting..."
//                     : "Connect Wallet (e.g., MetaMask)"}
//                 </button>
//               )}
//               {errors.walletAddress && (
//                 <p className="text-red-600 text-sm mt-1">
//                   {errors.walletAddress}
//                 </p>
//               )}
//             </div>

//             {/* Existing Input fields */}
//             <div className="grid md:grid-cols-2 gap-6">
//               {/* Organization Name */}
//               <div>
//                 <label className="block mb-2 text-purple-900 font-medium">
//                   Organization Name <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
//                   <input
//                     type="text"
//                     name="organizationName"
//                     value={formData.organizationName}
//                     onChange={handleInputChange}
//                     className={`w-full pl-10 pr-3 py-2 bg-white border ${errors.organizationName ? "border-red-500" : "border-purple-200"} text-purple-900 rounded-lg focus:outline-none focus:ring-2 ${errors.organizationName ? "focus:ring-red-500" : "focus:ring-purple-500"}`}
//                     placeholder="Enter organization name"
//                     required // Added HTML5 required
//                   />
//                 </div>
//                 {errors.organizationName && (
//                   <p className="text-red-600 text-sm mt-1">
//                     {errors.organizationName}
//                   </p>
//                 )}
//               </div>
//               {/* Organization Email */}
//               <div>
//                 <label className="block mb-2 text-purple-900 font-medium">
//                   Organization Email <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
//                   <input
//                     type="email"
//                     name="orgEmail"
//                     value={formData.orgEmail}
//                     onChange={handleInputChange}
//                     className={`w-full pl-10 pr-3 py-2 bg-white border ${errors.orgEmail ? "border-red-500" : "border-purple-200"} text-purple-900 rounded-lg focus:outline-none focus:ring-2 ${errors.orgEmail ? "focus:ring-red-500" : "focus:ring-purple-500"}`}
//                     placeholder="Enter organization email"
//                     required
//                   />
//                 </div>
//                 {errors.orgEmail && (
//                   <p className="text-red-600 text-sm mt-1">{errors.orgEmail}</p>
//                 )}
//               </div>
//             </div>
//             {/* ... (Mobile Number, Location, Passwords remain the same, add required span if needed) ... */}
//             <div className="grid md:grid-cols-2 gap-6">
//               {/* Mobile Number */}
//               <div>
//                 <label className="block mb-2 text-purple-900 font-medium">
//                   Mobile Number <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
//                   <input
//                     type="tel"
//                     name="mobileNumber"
//                     value={formData.mobileNumber}
//                     onChange={handleInputChange}
//                     className={`w-full pl-10 pr-3 py-2 bg-white border ${errors.mobileNumber ? "border-red-500" : "border-purple-200"} text-purple-900 rounded-lg focus:outline-none focus:ring-2 ${errors.mobileNumber ? "focus:ring-red-500" : "focus:ring-purple-500"}`}
//                     placeholder="Enter mobile number"
//                     required
//                   />
//                 </div>
//                 {errors.mobileNumber && (
//                   <p className="text-red-600 text-sm mt-1">
//                     {errors.mobileNumber}
//                   </p>
//                 )}
//               </div>
//               {/* Organization Location */}
//               <div>
//                 <label className="block mb-2 text-purple-900 font-medium">
//                   Organization Location <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
//                   <input
//                     type="text"
//                     name="orgLocation"
//                     value={formData.orgLocation}
//                     onChange={handleInputChange}
//                     className={`w-full pl-10 pr-3 py-2 bg-white border ${errors.orgLocation ? "border-red-500" : "border-purple-200"} text-purple-900 rounded-lg focus:outline-none focus:ring-2 ${errors.orgLocation ? "focus:ring-red-500" : "focus:ring-purple-500"}`}
//                     placeholder="Enter organization location"
//                     required
//                   />
//                 </div>
//                 {errors.orgLocation && (
//                   <p className="text-red-600 text-sm mt-1">
//                     {errors.orgLocation}
//                   </p>
//                 )}
//               </div>
//             </div>
//             {/* Password and Confirm Password */}
//             <div className="grid md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block mb-2 text-purple-900 font-medium">
//                   Password <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
//                   <input
//                     type="password"
//                     name="password"
//                     value={formData.password}
//                     onChange={handleInputChange}
//                     className={`w-full pl-10 pr-3 py-2 bg-white border ${errors.password ? "border-red-500" : "border-purple-200"} text-purple-900 rounded-lg focus:outline-none focus:ring-2 ${errors.password ? "focus:ring-red-500" : "focus:ring-purple-500"}`}
//                     placeholder="Enter password (min 6 chars)"
//                     required
//                   />
//                 </div>
//                 {errors.password && (
//                   <p className="text-red-600 text-sm mt-1">{errors.password}</p>
//                 )}
//               </div>
//               <div>
//                 <label className="block mb-2 text-purple-900 font-medium">
//                   Confirm Password <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
//                   <input
//                     type="password"
//                     name="confirmPassword"
//                     value={formData.confirmPassword}
//                     onChange={handleInputChange}
//                     className={`w-full pl-10 pr-3 py-2 bg-white border ${errors.confirmPassword ? "border-red-500" : "border-purple-200"} text-purple-900 rounded-lg focus:outline-none focus:ring-2 ${errors.confirmPassword ? "focus:ring-red-500" : "focus:ring-purple-500"}`}
//                     placeholder="Confirm password"
//                     required
//                   />
//                 </div>
//                 {errors.confirmPassword && (
//                   <p className="text-red-600 text-sm mt-1">
//                     {errors.confirmPassword}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Business Document Upload */}
//             <div>
//               <label className="block mb-2 text-purple-900 font-medium">
//                 Business Document (PDF only){" "}
//                 <span className="text-red-500">*</span>
//               </label>
//               <div className="flex items-center space-x-4">
//                 <div className="relative flex-grow">
//                   <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
//                   <input
//                     type="file"
//                     name="businessDoc"
//                     accept=".pdf"
//                     onChange={handleFileUpload}
//                     className={`w-full pl-10 pr-3 py-2 bg-white border ${errors.businessDoc ? "border-red-500" : "border-purple-200"} text-purple-900 rounded-lg focus:outline-none focus:ring-2 ${errors.businessDoc ? "focus:ring-red-500" : "focus:ring-purple-500"} file:mr-4 file:border-0 file:bg-purple-100 file:text-purple-900 file:px-4 file:py-2 file:rounded-lg file:cursor-pointer`}
//                     required
//                   />
//                 </div>
//                 <button
//                   type="button"
//                   onClick={verifyBusinessDoc}
//                   className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition duration-300 ${docVerified ? "bg-green-600 hover:bg-green-700" : ""} ${!formData.businessDoc ? "opacity-50 cursor-not-allowed" : ""}`}
//                   disabled={!formData.businessDoc || isLoading} // Disable if no doc or submitting
//                 >
//                   <ShieldCheck className="mr-2 h-5 w-5" />
//                   {docVerified ? "Verified" : "Verify"}
//                 </button>
//               </div>
//               {errors.businessDoc && (
//                 <p className="text-red-600 text-sm mt-1">
//                   {errors.businessDoc}
//                 </p>
//               )}
//             </div>

//             {/* Submit Button */}
//             <div className="text-center mt-8">
//               <button
//                 type="submit"
//                 className={`bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg ${isLoading || isWalletConnecting ? "opacity-50 cursor-not-allowed" : ""}`}
//                 disabled={
//                   isLoading ||
//                   isWalletConnecting ||
//                   !docVerified ||
//                   !walletAddress
//                 } // Disable if loading, connecting, doc not verified, or wallet not connected
//               >
//                 {isLoading ? "Submitting..." : "Register as Event Host"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// };

// export default EventHostRegistration;

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
  Loader2, // Added for loading state in verify button
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ethers, Contract, BrowserProvider } from "ethers"; // Import ethers types
import { of as generateCID } from "ipfs-only-hash"; // Import CID generator

// Define your backend API URL (replace if necessary)
const API_URL = "http://localhost:5000/api/hosts";

// --- Smart Contract Details (Copied from your second snippet) ---
const CONTRACT_ADDRESS = "0x48F8377e3e7b073843529F1B8FC56d9019B3Ed52"; // Ensure this is correct for Sepolia
const CONTRACT_ABI = [
  // --- ABI from your second snippet ---
  // (Removed STATE_REP, approvedCIDs array view as they aren't directly needed for registration call)
  // (Removed getApprovedCIDCount, getApprovedCID views)
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isVerifiedHost",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_cid",
        type: "string",
      },
    ],
    name: "registerEventHost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_hostAddress",
        type: "address",
      },
    ],
    name: "checkIsHostVerified",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_cid",
        type: "string",
      },
    ],
    name: "checkIsCIDApproved",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "stateRep",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "cid",
        type: "string",
      },
    ],
    name: "DocumentUploadedByStateRep",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "eventHost",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "cidUsed",
        type: "string",
      },
    ],
    name: "HostVerified",
    type: "event",
  },
  // Note: Removed uploadDocumentByStateRep from ABI as frontend won't call it
];
// --- End Smart Contract Details ---

// --- Sepolia Chain ID ---
const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex

const EventHostRegistration = () => {
  const [formData, setFormData] = useState({
    organizationName: "",
    orgEmail: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    orgLocation: "",
    businessDoc: null,
    walletAddress: "", // Wallet address is part of formData now
  });

  const [errors, setErrors] = useState({});
  const [docVerified, setDocVerified] = useState(false); // Tracks successful on-chain verification
  const [isLoading, setIsLoading] = useState(false); // General loading for form submission
  const [isVerifyingDoc, setIsVerifyingDoc] = useState(false); // Specific loading for doc verification
  const [walletAddress, setWalletAddress] = useState(""); // Separate state for display/connection logic
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);

  // --- Input Change Handler (No changes needed) ---
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

  // --- File Upload Handler ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      businessDoc: file,
    }));
    // Reset verification status when a new file is selected
    setDocVerified(false);
    setErrors((prev) => ({ ...prev, businessDoc: null }));
  };

  // --- **MODIFIED** verifyBusinessDoc with Smart Contract Logic ---
  const verifyBusinessDoc = async () => {
    console.log("Starting verifyBusinessDoc...");
    setErrors((prev) => ({ ...prev, businessDoc: null })); // Clear previous doc errors
    setIsVerifyingDoc(true); // Start verification loading state
    setDocVerified(false); // Assume verification fails initially

    // 1. Check Wallet Connection
    if (!walletAddress || !formData.walletAddress) {
      toast.error("Please connect your wallet first.", {
        position: "top-right",
      });
      setIsVerifyingDoc(false);
      return;
    }

    // 2. Check if Document is Selected
    if (!formData.businessDoc) {
      console.log("No business document selected.");
      setErrors((prev) => ({
        ...prev,
        businessDoc: "Please select a business document first.",
      }));
      toast.error("Please select a business document first.", {
        position: "top-right",
      });
      setIsVerifyingDoc(false);
      return;
    }
    console.log("Business document exists:", formData.businessDoc.name);

    // 3. Check File Type
    const allowedTypes = ["application/pdf"];
    if (!allowedTypes.includes(formData.businessDoc.type)) {
      console.log("Invalid file type:", formData.businessDoc.type);
      setErrors((prev) => ({
        ...prev,
        businessDoc: "Invalid file type. Please upload a PDF.",
      }));
      toast.error("Invalid file type. Please upload a PDF.", {
        position: "top-right",
      });
      setIsVerifyingDoc(false);
      return;
    }
    console.log("File type is valid (PDF).");

    // 4. Smart Contract Interaction
    try {
      console.log("Initializing ethers provider...");
      if (!window.ethereum) {
        throw new Error("No Web3 wallet detected. Please install MetaMask.");
      }
      // Use the currently connected wallet provider
      const provider = new BrowserProvider(window.ethereum);

      // 4a. Check Network
      const network = await provider.getNetwork();
      console.log("Current network:", network);
      if (network.chainId.toString() !== BigInt(SEPOLIA_CHAIN_ID).toString()) {
        // Compare chain IDs correctly
        toast.info(
          `Please switch your wallet network to Sepolia (Chain ID: ${parseInt(SEPOLIA_CHAIN_ID, 16)}). Attempting to switch...`,
          { autoClose: 7000 }
        );
        try {
          await provider.send("wallet_switchEthereumChain", [
            { chainId: SEPOLIA_CHAIN_ID },
          ]);
          // Re-check network after switching
          const newNetwork = await provider.getNetwork();
          if (
            newNetwork.chainId.toString() !==
            BigInt(SEPOLIA_CHAIN_ID).toString()
          ) {
            throw new Error(
              "Failed to switch network to Sepolia. Please switch manually."
            );
          }
          toast.success("Switched to Sepolia network.");
        } catch (switchError) {
          console.error("Network switch error:", switchError);
          // Handle case where Sepolia is not added (code 4902)
          if (switchError.code === 4902) {
            toast.error(
              "Sepolia network not added to your wallet. Please add it manually."
            );
          } else {
            throw new Error(
              "Failed to switch network. Please ensure your wallet is set to Sepolia."
            );
          }
          setIsVerifyingDoc(false);
          return; // Stop verification if network switch fails
        }
      }

      // 4b. Get Signer
      const signer = await provider.getSigner();
      const connectedAddr = await signer.getAddress();
      if (connectedAddr.toLowerCase() !== walletAddress.toLowerCase()) {
        // This case is less likely with BrowserProvider but good for safety
        throw new Error(
          "Wallet address mismatch. Please reconnect your wallet."
        );
      }
      console.log("Signer obtained:", connectedAddr);

      // 4c. Read File and Generate CID
      console.log("Reading file as ArrayBuffer...");
      const arrayBuffer = await formData.businessDoc.arrayBuffer();
      console.log("File read successfully, converting to Uint8Array...");
      const fileContent = new Uint8Array(arrayBuffer);
      console.log("Generating CID...");
      // Use cidVersion 0 for compatibility if state rep used v0
      const cid = await generateCID(fileContent, { cidVersion: 0 });
      console.log(`✅ Generated CID (v0): ${cid}`);

      // 4d. Initialize Contract
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      console.log("Contract initialized at:", CONTRACT_ADDRESS);

      // 4e. Call registerEventHost (This function performs the check internally)
      console.log(`Calling registerEventHost with CID: ${cid}...`);
      toast.info(
        "Please confirm the transaction in your wallet to verify the document.",
        { autoClose: 10000 }
      );

      const tx = await contract.registerEventHost(cid);
      console.log("Transaction sent:", tx.hash);
      toast.info(
        `Transaction sent (${tx.hash.substring(0, 8)}...). Waiting for confirmation...`,
        { autoClose: 15000, position: "bottom-center" }
      );

      // 4f. Wait for Transaction Confirmation
      const receipt = await tx.wait(); // Wait for 1 confirmation by default
      console.log("Transaction confirmed in block:", receipt.blockNumber);

      if (receipt.status === 1) {
        // Transaction successful
        console.log("✅ Transaction successful!");
        // Optionally double-check if the host is now verified (good practice)
        // const isNowVerified = await contract.checkIsHostVerified(connectedAddr);
        // console.log("On-chain verification status check:", isNowVerified);
        // if (isNowVerified) { ... } else { throw new Error("Verification transaction succeeded but host status not updated on-chain.")}

        setDocVerified(true); // Set state only after successful confirmation
        toast.success("Document successfully verified on-chain!", {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        // Transaction reverted
        console.error("❌ Transaction reverted. Receipt:", receipt);
        throw new Error(
          "On-chain verification transaction failed. Check transaction details."
        );
      }
    } catch (error) {
      console.error("❌ Error during document verification:", error);
      setDocVerified(false);
      let errorMessage = "Failed to verify document. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("No Web3 wallet detected")) {
          errorMessage = "Please install MetaMask or connect your wallet.";
        } else if (error.message.includes("Wallet address mismatch")) {
          errorMessage = error.message;
        } else if (error.message.includes("network")) {
          // Catch network errors
          errorMessage = error.message;
        }
        // Check for Ethers v6 specific contract revert reason
        else if (error.code === "ACTION_REJECTED") {
          errorMessage = "Transaction rejected by user in wallet.";
        } else if (error.reason) {
          // Try to extract a more specific revert reason
          if (error.reason.includes("DV: CID mismatch or not approved")) {
            errorMessage =
              "Document not approved by State Representative. Please ensure the correct document was uploaded by the state rep.";
          } else if (error.reason.includes("DV: CID cannot be empty")) {
            errorMessage = "Internal error: Generated CID was empty.";
          } else {
            errorMessage = `Verification failed: ${error.reason}`;
          }
        }
        // Fallback for other generic errors
        else if (error.message.includes("transaction failed")) {
          errorMessage = error.message;
        }
      }

      setErrors((prev) => ({ ...prev, businessDoc: errorMessage }));
      toast.error(errorMessage, { position: "top-right", autoClose: 7000 });
    } finally {
      setIsVerifyingDoc(false); // End verification loading state
      console.log("verifyBusinessDoc completed.");
    }
  };

  // --- Wallet Connection Logic (Mostly unchanged, ensures provider is set) ---
  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error(
        "MetaMask (or compatible wallet) not detected. Please install it.",
        { position: "top-center" }
      );
      return;
    }

    setIsWalletConnecting(true);
    setErrors((prev) => ({ ...prev, walletAddress: null }));

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts && accounts.length > 0) {
        const address = ethers.getAddress(accounts[0]); // Normalize address
        setWalletAddress(address);
        setFormData((prev) => ({ ...prev, walletAddress: address }));
        toast.success(
          `Wallet connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
          { autoClose: 4000 }
        );

        // Check network after connecting
        const network = await provider.getNetwork();
        if (
          network.chainId.toString() !== BigInt(SEPOLIA_CHAIN_ID).toString()
        ) {
          toast.warn(
            `Wallet connected, but please switch network to Sepolia (Chain ID: ${parseInt(SEPOLIA_CHAIN_ID, 16)}).`,
            { autoClose: 6000 }
          );
          // Don't auto-switch here, let user do it or handle in verify step
        } else {
          toast.info("Connected to Sepolia network.", { autoClose: 3000 });
        }
      } else {
        toast.warn(
          "No accounts found. Please unlock your wallet or grant permissions."
        );
        setWalletAddress("");
        setFormData((prev) => ({ ...prev, walletAddress: "" }));
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      if (error.code === 4001) {
        toast.error("Wallet connection request rejected by user.");
      } else if (error.code === -32002) {
        toast.warn(
          "Connection request already pending. Please check your wallet."
        );
      } else {
        toast.error("Failed to connect wallet. See console for details.");
      }
      setWalletAddress("");
      setFormData((prev) => ({ ...prev, walletAddress: "" }));
    } finally {
      setIsWalletConnecting(false);
    }
  };

  // --- Disconnect Wallet (Unchanged) ---
  const disconnectWallet = () => {
    setWalletAddress("");
    setFormData((prev) => ({ ...prev, walletAddress: "" }));
    setErrors((prev) => ({ ...prev, walletAddress: null }));
    toast.info("Wallet disconnected.");
    setDocVerified(false); // Reset doc verification on disconnect
  };

  // --- Form Submit Handler (Added check for docVerified) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // --- Client-Side Validation ---
    const newErrors = {};
    // ... (validation for name, email, mobile, password, location remains the same) ...
    if (!formData.organizationName.trim())
      newErrors.organizationName = "Organization name is required";
    if (!formData.orgEmail.trim()) newErrors.orgEmail = "Email is required";
    else if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.orgEmail)
    )
      newErrors.orgEmail = "Invalid email format";
    if (!formData.mobileNumber.trim())
      newErrors.mobileNumber = "Mobile number is required"; // Add more specific validation if needed
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

    // Document and Wallet Validation
    if (!formData.businessDoc) {
      newErrors.businessDoc = "Business document is required";
    } else if (!docVerified) {
      // Check if docVerified (on-chain verification status) is true
      newErrors.businessDoc =
        "Please verify the selected document using the 'Verify' button.";
    }
    if (!formData.walletAddress) {
      newErrors.walletAddress = "Please connect your wallet.";
    } else if (!ethers.isAddress(formData.walletAddress)) {
      newErrors.walletAddress = "Invalid wallet address format.";
    }
    // --- End Validation ---

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.warn("Please fix the errors in the form.", {
        position: "top-center",
      });
      return;
    }

    // --- API Call (No document sent here, relies on email) ---
    setIsLoading(true);
    const payload = {
      organizationName: formData.organizationName.trim(),
      orgEmail: formData.orgEmail.trim(),
      mobileNumber: formData.mobileNumber.trim(), // Consider backend validation/formatting
      password: formData.password,
      // Don't usually send confirmPassword, backend compares password hash
      orgLocation: formData.orgLocation.trim(),
      walletAddress: formData.walletAddress, // Wallet address is crucial
    };

    try {
      const response = await fetch(`${API_URL}/register`, {
        // Ensure this endpoint exists and handles the payload
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
        // Handle potential backend field errors (e.g., email already exists)
        if (data.field && data.message) {
          setErrors((prev) => ({ ...prev, [data.field]: data.message }));
        }
      } else {
        toast.success(
          data.message ||
            "Registration submitted successfully! Remember to email your documents.",
          { autoClose: 7000 }
        );
        console.log("Registration successful:", data);
        // Reset form completely on success
        setFormData({
          organizationName: "",
          orgEmail: "",
          mobileNumber: "",
          password: "",
          confirmPassword: "",
          orgLocation: "",
          businessDoc: null,
          walletAddress: "",
        });
        setDocVerified(false);
        setWalletAddress(""); // Reset display wallet address
        setErrors({});
        // Clear file input visually
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

  // --- JSX Structure (Mostly Unchanged) ---
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
            <h2 className="text-2xl font-semibold text-purple-900 mb-4">
              Requirements & Instructions
            </h2>
            <ul className="list-disc list-inside text-purple-800 space-y-2">
              <li>
                Connect your organization's primary wallet (e.g., MetaMask) on
                the <strong className="text-purple-950">Sepolia Network</strong>
                . This address will be associated with your host account.
              </li>
              <li>
                Select your combined business document (PDF format only) below.
              </li>
              <li>Ensure the document is a single PDF file containing:</li>
              <ol className="list-decimal list-inside ml-4">
                <li>Certificate of Incorporation</li>
                <li>Income Tax Document</li>
                <li>CNIC (Computerized National Identity Card) Picture</li>
              </ol>
              <li>
                Click the 'Verify Document On-Chain' button. This will generate
                a unique identifier (CID) for your document and check if it has
                been pre-approved by the State Representative on the blockchain.
                Confirm the transaction in your wallet.
              </li>
              <li>
                Once the document is successfully verified on-chain, the
                'Verify' button will turn green.
              </li>
              <li>Fill out the rest of the registration details.</li>
              <li>
                Submit the registration form. Note: The document *file* itself
                is not uploaded here, only its verified status.
              </li>
              <li>
                (Optional/Backup) The actual document may still need to be
                emailed to <strong>eventledgersupport@gmail.com</strong> for
                manual review or record-keeping.
              </li>
            </ul>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Wallet Connection Section (Unchanged) */}
            <div>
              <label className="block mb-2 text-purple-900 font-medium">
                Connect Wallet (Sepolia Network){" "}
                <span className="text-red-500">*</span>
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
                    disabled={isLoading || isWalletConnecting || isVerifyingDoc}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={connectWallet}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition duration-300 ${isWalletConnecting ? "opacity-70 cursor-wait" : ""}`}
                  disabled={isWalletConnecting || isLoading || isVerifyingDoc}
                >
                  <LinkIcon className="w-5 h-5 mr-2" />
                  {isWalletConnecting
                    ? "Connecting..."
                    : "Connect Wallet"}
                </button>
              )}
              {errors.walletAddress && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.walletAddress}
                </p>
              )}
            </div>

            {/* Existing Input fields (Unchanged) */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Organization Name */}
              <div>
                <label className="block mb-1 text-purple-900 font-medium">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 bg-gray-50 border ${errors.organizationName ? "border-red-500" : "border-gray-300"} text-gray-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500`}
                    placeholder="Enter organization name"
                    required
                  />
                </div>
                {errors.organizationName && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.organizationName}
                  </p>
                )}
              </div>
              {/* Organization Email */}
              <div>
                <label className="block mb-1 text-purple-900 font-medium">
                  Organization Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
                  <input
                    type="email"
                    name="orgEmail"
                    value={formData.orgEmail}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 bg-gray-50 border ${errors.orgEmail ? "border-red-500" : "border-gray-300"} text-gray-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500`}
                    placeholder="Enter organization email"
                    required
                  />
                </div>
                {errors.orgEmail && (
                  <p className="text-red-600 text-xs mt-1">{errors.orgEmail}</p>
                )}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Mobile Number */}
              <div>
                <label className="block mb-1 text-purple-900 font-medium">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 bg-gray-50 border ${errors.mobileNumber ? "border-red-500" : "border-gray-300"} text-gray-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500`}
                    placeholder="Enter mobile number"
                    required
                  />
                </div>
                {errors.mobileNumber && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.mobileNumber}
                  </p>
                )}
              </div>
              {/* Organization Location */}
              <div>
                <label className="block mb-1 text-purple-900 font-medium">
                  Organization Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
                  <input
                    type="text"
                    name="orgLocation"
                    value={formData.orgLocation}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 bg-gray-50 border ${errors.orgLocation ? "border-red-500" : "border-gray-300"} text-gray-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500`}
                    placeholder="Enter organization location"
                    required
                  />
                </div>
                {errors.orgLocation && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.orgLocation}
                  </p>
                )}
              </div>
            </div>
            {/* Password and Confirm Password */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 text-purple-900 font-medium">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 bg-gray-50 border ${errors.password ? "border-red-500" : "border-gray-300"} text-gray-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500`}
                    placeholder="Enter password (min 6 chars)"
                    required
                  />
                </div>
                {errors.password && (
                  <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-purple-900 font-medium">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 bg-gray-50 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} text-gray-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500`}
                    placeholder="Confirm password"
                    required
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Business Document Upload & Verify Button */}
            <div>
              <label className="block mb-1 text-purple-900 font-medium">
                Business Document (Single PDF){" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex items-stretch space-x-3">
                {" "}
                {/* Use items-stretch */}
                {/* File Input */}
                <div className="relative flex-grow">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 pointer-events-none">
                    <Upload className="h-5 w-5" />
                  </span>
                  <input
                    type="file"
                    name="businessDoc"
                    accept=".pdf" // Only accept PDF
                    onChange={handleFileUpload}
                    className={`block w-full pl-10 pr-3 py-2 text-sm bg-gray-50 border ${errors.businessDoc ? "border-red-500" : "border-gray-300"} text-gray-500 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 file:hidden`} // Hide default file input button text
                    required
                    disabled={isVerifyingDoc || isLoading} // Disable while verifying/submitting
                  />
                  {/* Display selected file name */}
                  {formData.businessDoc && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-600 truncate max-w-[50%]">
                      {formData.businessDoc.name}
                    </span>
                  )}
                </div>
                {/* Verify Button */}
                <button
                  type="button"
                  onClick={verifyBusinessDoc}
                  className={`px-4 py-2 rounded-lg flex items-center justify-center text-sm font-medium transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 whitespace-nowrap ${
                    docVerified
                      ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                      : "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500"
                  } ${
                    !formData.businessDoc ||
                    !walletAddress ||
                    isVerifyingDoc ||
                    isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  // Disable if no doc, no wallet, already verifying, or submitting form
                  disabled={
                    !formData.businessDoc ||
                    !walletAddress ||
                    isVerifyingDoc ||
                    isLoading
                  }
                >
                  {isVerifyingDoc ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Verifying...
                    </>
                  ) : docVerified ? (
                    <>
                      <ShieldCheck className="mr-2 h-5 w-5" /> Verified
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-5 w-5" /> Verify Document
                      On-Chain
                    </>
                  )}
                </button>
              </div>
              {errors.businessDoc && (
                <p className="text-red-600 text-xs mt-1">
                  {" "}
                  {errors.businessDoc}{" "}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-center pt-4">
              <button
                type="submit"
                className={`bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                disabled={
                  isLoading || // Disable if main form is submitting
                  isWalletConnecting || // Disable if wallet is connecting
                  isVerifyingDoc || // Disable if doc verification is in progress
                  !docVerified || // Disable if doc hasn't been successfully verified on-chain
                  !walletAddress // Disable if wallet is not connected
                }
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