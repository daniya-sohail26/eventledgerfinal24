import React, { useState } from "react";
import {
  Upload,
  ShieldCheck,
  Mail,
  Building,
  Phone,
  MapPin,
  Lock,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify"; // Import toast components
import "react-toastify/dist/ReactToastify.css"; // Import default CSS

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
  });

  const [errors, setErrors] = useState({}); // Keep for field-specific errors
  const [docVerified, setDocVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [successMessage, setSuccessMessage] = useState(""); // Remove - replaced by toasts

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (name === "password" || name === "confirmPassword") {
      setErrors((prev) => ({ ...prev, confirmPassword: null }));
    }
    if (name === "businessDoc") {
      setErrors((prev) => ({ ...prev, businessDoc: null }));
    }
    // setSuccessMessage(""); // No longer needed
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      businessDoc: file,
    }));
    setDocVerified(false);
    setErrors((prev) => ({ ...prev, businessDoc: null }));
    // setSuccessMessage(""); // No longer needed
  };

  
  const verifyBusinessDoc = () => {
    setErrors((prev) => ({ ...prev, businessDoc: null }));
    
    if (formData.businessDoc) {
      const allowedTypes = ["application/pdf"];
      if (allowedTypes.includes(formData.businessDoc.type)) {
        setDocVerified(true);
        toast.success(
          "Document verified (PDF)!",
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
      } else {
        setDocVerified(false);
        setErrors((prev) => ({
          ...prev,
          businessDoc: "Invalid file type. Please upload a PDF.",
        }));
        // Use toast.error instead of alert
        toast.error("Invalid file type. Please upload a PDF.", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } else {
      setDocVerified(false);
      setErrors((prev) => ({
        ...prev,
        businessDoc: "Please select a business document first.",
      }));
      toast.error("Please select a business document first.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});


    // --- Client-Side Validation ---
    const newErrors = {};
    // (Validation logic remains the same...)
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
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.orgLocation.trim())
      newErrors.orgLocation = "Location is required";
    if (!formData.businessDoc) {
      newErrors.businessDoc = "Business document is required";
    } else if (!docVerified) {
      newErrors.businessDoc = "Please click 'Verify' for the selected document";
    }
    // --- End Validation ---

    setErrors(newErrors); // Set field-specific errors

    if (Object.keys(newErrors).length > 0) {
      // Optionally, show a general validation error toast
      toast.warn("Please fix the errors in the form.", {
        position: "top-center",
      });
      return;
    }

    // --- API Call ---
    setIsLoading(true);
    const payload = {
      organizationName: formData.organizationName.trim(),
      orgEmail: formData.orgEmail.trim(),
      mobileNumber: formData.mobileNumber.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      orgLocation: formData.orgLocation.trim(),
    };

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
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
        console.error("Registration failed:", data);
    
      } else {
        // Use toast.success for success message
        toast.success(
          data.message ||
            "Registration submitted successfully! Remember to email your documents.",
          {
            position: "top-right",
            autoClose: 7000, // Maybe keep success longer
          }
        );
        console.log("Registration successful:", data);
        // Optionally reset form fields here
        setFormData({
          organizationName: "",
          orgEmail: "",
          mobileNumber: "",
          password: "",
          confirmPassword: "",
          orgLocation: "",
          businessDoc: null,
        });
        setDocVerified(false); // Reset doc verification
        setErrors({}); // Clear any remaining field errors
      }
    } catch (error) {
      // Use toast.error for network errors
      toast.error("Network error. Failed to connect to the server.", {
        position: "top-right",
        autoClose: 5000,
      });
      console.error("Network or fetch error:", error);
      // Note: We don't set apiError in state anymore
    } finally {
      setIsLoading(false);
    }
    // --- End API Call ---
  };

  return (
  
    <>
      <ToastContainer />
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
              Document Requirements
            </h2>
            <ul className="list-disc list-inside text-purple-800 space-y-2">
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
            {/* Remove the inline API error/success divs */}
            {/* {errors.apiError && ( ... removed ... )} */}
            {/* {successMessage && ( ... removed ... )} */}

            {/* Input fields remain the same - field errors are still shown inline */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Organization Name */}
              <div>
                <label className="block mb-2 text-purple-900 font-medium">
                  Organization Name
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
                  Organization Email
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
                  />
                </div>
                {errors.orgEmail && (
                  <p className="text-red-600 text-sm mt-1">{errors.orgEmail}</p>
                )}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Mobile Number */}
              <div>
                <label className="block mb-2 text-purple-900 font-medium">
                  Mobile Number
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
                  Organization Location
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
                  Password
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
                  />
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-purple-900 font-medium">
                  Confirm Password
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
                Business Document (PDF only)
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative flex-grow">
                  <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
                  <input
                    type="file"
                    name="businessDoc"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className={`w-full pl-10 pr-3 py-2 bg-white border ${errors.businessDoc ? "border-red-500" : "border-purple-200"} text-purple-900 rounded-lg focus:outline-none focus:ring-2 ${errors.businessDoc ? "focus:ring-red-500" : "focus:ring-purple-500"} file:mr-4 file:border-0 file:bg-purple-100 file:text-purple-900 file:px-4 file:py-2 file:rounded-lg`}
                  />
                </div>
                <button
                  type="button"
                  onClick={verifyBusinessDoc}
                  className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition duration-300 ${docVerified ? "bg-green-600 hover:bg-green-700" : ""}`}
                  disabled={!formData.businessDoc}
                >
                  <ShieldCheck className="mr-2" />{" "}
                  {docVerified ? "Verified" : "Verify"}
                </button>
              </div>
              {/* Keep inline error for doc format/selection, but status can also be shown by toast */}
              {/* {docVerified && (<p className="text-green-600 text-sm mt-1">Document format verified (PDF).</p>)} */}
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
                className={`bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Register as Event Host"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </> // Use Fragment to wrap ToastContainer and the main div
  );
};

export default EventHostRegistration;
