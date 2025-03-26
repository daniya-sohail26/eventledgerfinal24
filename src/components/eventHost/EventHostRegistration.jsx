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

  const [errors, setErrors] = useState({});
  const [docVerified, setDocVerified] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      businessDoc: file,
    }));
  };

  const verifyBusinessDoc = () => {
    if (formData.businessDoc) {
      const allowedTypes = ["application/pdf"];
      if (allowedTypes.includes(formData.businessDoc.type)) {
        setDocVerified(true);
        alert("Document verified successfully!");
      } else {
        alert("Please upload a PDF file.");
      }
    } else {
      alert("Please upload a business document first.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.organizationName)
      newErrors.organizationName = "Organization name is required";
    if (!formData.orgEmail) newErrors.orgEmail = "Email is required";
    if (!formData.mobileNumber)
      newErrors.mobileNumber = "Mobile number is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.orgLocation) newErrors.orgLocation = "Location is required";
    if (!formData.businessDoc)
      newErrors.businessDoc = "Business document is required";
    if (!docVerified)
      newErrors.businessDoc = "Please verify the business document";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert("Form submitted successfully!");
    }
  };

  return (
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
            <li>Business document must be a single PDF file</li>
            <li>
              Business documents must include:
              <ol className="list-decimal list-inside ml-4">
                <li>Certificate of Incorporation</li>
                <li>Income Tax Document</li>
                <li>CNIC (Computerized National Identity Card) Picture</li>
              </ol>
            </li>
            <li>
              Document should be emailed to eventledgersupport@gmail.com for
              verification and wait for
              confirmation email before registering.
            </li>
          </ul>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
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
                  className="w-full pl-10 pr-3 py-2 bg-white border border-purple-200 text-purple-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full pl-10 pr-3 py-2 bg-white border border-purple-200 text-purple-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full pl-10 pr-3 py-2 bg-white border border-purple-200 text-purple-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full pl-10 pr-3 py-2 bg-white border border-purple-200 text-purple-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full pl-10 pr-3 py-2 bg-white border border-purple-200 text-purple-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter password"
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
                  className="w-full pl-10 pr-3 py-2 bg-white border border-purple-200 text-purple-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="w-full pl-10 pr-3 py-2 bg-white border border-purple-200 text-purple-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:border-0 file:bg-purple-100 file:text-purple-900 file:px-4 file:py-2 file:rounded-lg"
                />
              </div>
              <button
                type="button"
                onClick={verifyBusinessDoc}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition duration-300"
              >
                <ShieldCheck className="mr-2" /> Verify
              </button>
            </div>
            {errors.businessDoc && (
              <p className="text-red-600 text-sm mt-1">{errors.businessDoc}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="text-center mt-8">
            <button
              type="submit"
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg"
            >
              Register as Event Host
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventHostRegistration;
