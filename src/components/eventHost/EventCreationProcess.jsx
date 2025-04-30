import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  MapPinCheckInside,
  Type,
  Clock,
  AlignLeft,
  Image as ImageIcon,
  Ticket,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Plus,
  Loader2,
  DollarSign, // Added for price icon
  Hash, // Added for supply icon
} from "lucide-react";

// --- DEFINE YOUR BACKEND API URL ---
const API_BASE_URL = "http://localhost:5000";

// --- CORRECTED Initial State ---
const initialEventDetails = {
  eventTitle: "",
  eventCategory: "",
  eventType: "onsite",
  startDate: "",
  endDate: "", // <-- ADDED
  startTime: "",
  endTime: "",
  location: "",
  eventDescription: "",
  images: [], // Holds File objects for upload
  ticketPrice: "", // <-- CHANGED: Top-level price (string for input)
  ticketSupply: "", // <-- ADDED: Top-level supply (string for input)
};

const EventCreationProcess = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [eventDetails, setEventDetails] = useState(initialEventDetails);
  const [imagePreviews, setImagePreviews] = useState([]); // Holds data URLs for display
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [animatedTickets, setAnimatedTickets] = useState([]);

  const steps = ["Event Details", "Images"];

  // --- Generic Input Handler (Handles all text/date/time/number inputs) ---
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    // Prevent leading zeros for number inputs unless it's '0.' for decimals
    if (
      type === "number" &&
      value.length > 1 &&
      value.startsWith("0") &&
      !value.startsWith("0.")
    ) {
      // Allow '0' or '0.something', but not '01', '05' etc.
      setEventDetails((prev) => ({
        ...prev,
        [name]: parseFloat(value).toString(), // Remove leading zero by parsing
      }));
    } else {
      setEventDetails((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // --- Image Upload Handler (No changes needed) ---
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const currentImageCount = eventDetails.images.length;
    const newImageFiles = []; // Keep track of actual File objects
    const newImagePreviews = []; // Keep track of data URLs

    // Basic validation (optional: add more like size limit)
    if (files.length + currentImageCount > 5) {
      // Example limit of 5 images
      setError("You can upload a maximum of 5 images.");
      return; // Stop processing if limit exceeded
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        // Example: 5MB limit
        setError(`File "${file.name}" exceeds the 5MB size limit.`);
        return; // Skip this file
      }
      if (
        !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
          file.type
        )
      ) {
        setError(`File "${file.name}" has an unsupported format.`);
        return; // Skip this file
      }

      newImageFiles.push(file); // Add valid File object to state list
      const reader = new FileReader();
      reader.onloadend = () => {
        // Use function form of setState for preview to avoid race conditions
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    if (newImageFiles.length > 0) {
      setEventDetails((prev) => ({
        ...prev,
        images: [...prev.images, ...newImageFiles], // Store actual File objects
      }));
    }
  };

  // --- Remove Image Handler (No changes needed) ---
  const removeImage = (index) => {
    setEventDetails((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index), // Filter File objects
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index)); // Filter previews
  };

  // --- REMOVED handleTicketChange --- (No longer needed)

  // --- Function to handle final submission ---
  const handleCreateEventSubmit = async () => {
    setError(null); // Clear previous errors
    setIsLoading(true);

    const token = localStorage.getItem("hostToken"); // Ensure you save token with this key on login
    if (!token) {
      setError("Authentication error: Please log in again.");
      setIsLoading(false);
      return;
    }

    // --- UPDATED Frontend Validation ---
    const requiredFields = [
      "eventTitle",
      "eventCategory",
      "eventType",
      "startDate",
      "endDate",
      "startTime",
      "endTime",
      "ticketPrice",
      "ticketSupply",
    ];
    for (const field of requiredFields) {
      if (!eventDetails[field] && eventDetails[field] !== 0) {
        // Allow 0 for price
        // Convert camelCase to Title Case for error message
        const fieldName = field
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        setError(`${fieldName} is required.`);
        setCurrentStep(0);
        setIsLoading(false);
        return;
      }
    }

    // Location validation
    if (
      (eventDetails.eventType === "onsite" ||
        eventDetails.eventType === "hybrid") &&
      !eventDetails.location
    ) {
      setError("Location is required for onsite or hybrid events.");
      setCurrentStep(0);
      setIsLoading(false);
      return;
    }

    // Specific validation for numbers
    const priceNum = parseFloat(eventDetails.ticketPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Please enter a valid ticket price (0 or greater).");
      setCurrentStep(0);
      setIsLoading(false);
      return;
    }
    const supplyNum = parseInt(eventDetails.ticketSupply, 10);
    if (isNaN(supplyNum) || supplyNum < 1) {
      setError("Please enter a valid ticket supply (must be 1 or more).");
      setCurrentStep(0);
      setIsLoading(false);
      return;
    }

    // Date validation
    const start = new Date(eventDetails.startDate);
    const end = new Date(eventDetails.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError("Invalid start or end date selected.");
      setCurrentStep(0);
      setIsLoading(false);
      return;
    }
    if (end < start) {
      setError("End date cannot be before the start date.");
      setCurrentStep(0);
      setIsLoading(false);
      return;
    }

    // --- CORRECTED FormData Creation ---
    const formData = new FormData();
    formData.append("eventTitle", eventDetails.eventTitle);
    formData.append("eventCategory", eventDetails.eventCategory);
    formData.append("eventType", eventDetails.eventType);
    formData.append("startDate", eventDetails.startDate);
    formData.append("endDate", eventDetails.endDate); // <-- ADDED
    formData.append("startTime", eventDetails.startTime);
    formData.append("endTime", eventDetails.endTime);
    // Only append location if it's provided and relevant
    if (
      eventDetails.location &&
      (eventDetails.eventType === "onsite" ||
        eventDetails.eventType === "hybrid")
    ) {
      formData.append("location", eventDetails.location);
    }
    formData.append("eventDescription", eventDetails.eventDescription);
    formData.append("ticketPrice", eventDetails.ticketPrice); // <-- CORRECTED (using state value)
    formData.append("ticketSupply", eventDetails.ticketSupply); // <-- ADDED

    // Append images (File objects)
    eventDetails.images.forEach((file) => {
      formData.append("images", file); // Key MUST match Multer config in backend
    });

    console.log("Submitting FormData keys:"); // Debugging: Check keys before sending
    for (let key of formData.keys()) {
      console.log(key);
    }

    // --- Make API Request (No change needed here) ---
    try {
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data' is set automatically by browser for FormData
        },
        body: formData,
      });

      const data = await response.json(); // Attempt to parse JSON regardless of status

      if (!response.ok) {
        // Use message from backend response if available, otherwise generic error
        console.error("API Error Response:", data);
        throw new Error(
          data.message || `HTTP error! Status: ${response.status}`
        );
      }

      // --- Success ---
      console.log("Event created successfully:", data.event);
      alert("Event created successfully!"); // Simple success feedback

      // Reset form
      setEventDetails(initialEventDetails);
      setImagePreviews([]);
      setCurrentStep(0);
    } catch (err) {
      console.error("Event Creation Failed:", err);
      // Display specific error from backend or fetch failure
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
      // Don't reset form on error so user can fix input
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Step Content Function ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Event Details Step
        return (
          <div className="space-y-6">
            {/* Event Title */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Type className="mr-2 h-4 w-4 text-purple-600" />
                Event Title *
              </label>
              <input
                type="text"
                name="eventTitle"
                value={eventDetails.eventTitle}
                onChange={handleInputChange}
                className="w-full pl-3 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Enter event title"
                required={true}
              />
            </div>

            {/* Event Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <MapPinCheckInside className="mr-2 h-4 w-4 text-purple-600" />
                Event Category *
              </label>
              <div className="relative">
                <select
                  name="eventCategory"
                  value={eventDetails.eventCategory}
                  onChange={handleInputChange}
                  className="w-full pl-3 pr-8 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 appearance-none bg-white"
                  required={true}
                >
                  <option value="" disabled>
                    Select category...
                  </option>
                  {/* Make sure these values match your schema enum if applicable */}
                  <option value="Music & Concerts">Music & Concerts</option>
                  <option value="Sports">Sports</option>
                  <option value="Theater & Performing Arts">
                    Theater & Performing Arts
                  </option>
                  <option value="Festivals & Fairs">Festivals & Fairs</option>
                  <option value="Conferences & Workshops">
                    Conferences & Workshops
                  </option>
                  <option value="Family & Kids">Family & Kids</option>
                  <option value="Food & Drink">Food & Drink</option>
                  <option value="Art & Culture">Art & Culture</option>
                  <option value="Nightlife & Parties">
                    Nightlife & Parties
                  </option>
                  <option value="Charity & Community">
                    Charity & Community
                  </option>
                  <option value="Hobbies & Special Interests">
                    Hobbies & Special Interests
                  </option>
                  <option value="Technology">Technology</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none h-5 w-5" />
              </div>
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type *
              </label>
              <div className="flex flex-wrap gap-3">
                {["onsite", "virtual", "hybrid"].map((type) => (
                  <label
                    key={type}
                    className={`inline-flex items-center px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out border-2 ${
                      eventDetails.eventType === type
                        ? "bg-purple-100 text-purple-700 border-purple-500"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="eventType"
                      value={type}
                      checked={eventDetails.eventType === type}
                      onChange={handleInputChange}
                      className="hidden" // Hide actual radio button
                      required={true}
                    />
                    {/* Capitalize first letter for display */}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* --- CORRECTED Date & Time Section --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Clock className="mr-2 h-4 w-4 text-purple-600" />
                Date & Time *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="relative">
                  <label className="text-xs text-gray-500 absolute -top-2 left-2 bg-white px-1 z-10">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={eventDetails.startDate}
                    onChange={handleInputChange}
                    className="w-full relative mt-1 pl-3 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                    required={true}
                  />
                </div>
                {/* End Date - ADDED */}
                <div className="relative">
                  <label className="text-xs text-gray-500 absolute -top-2 left-2 bg-white px-1 z-10">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={eventDetails.endDate}
                    onChange={handleInputChange}
                    className="w-full relative mt-1 pl-3 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                    required={true}
                    min={eventDetails.startDate} // Prevent selecting end date before start
                  />
                </div>
                {/* Start Time */}
                <div className="relative">
                  <label className="text-xs text-gray-500 absolute -top-2 left-2 bg-white px-1 z-10">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={eventDetails.startTime}
                    onChange={handleInputChange}
                    className="w-full relative mt-1 pl-3 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                    required={true}
                  />
                </div>
                {/* End Time */}
                <div className="relative">
                  <label className="text-xs text-gray-500 absolute -top-2 left-2 bg-white px-1 z-10">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={eventDetails.endTime}
                    onChange={handleInputChange}
                    className="w-full relative mt-1 pl-3 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                    required={true}
                  />
                </div>
              </div>
            </div>

            {/* Location (Conditionally Required) */}
            {(eventDetails.eventType === "onsite" ||
              eventDetails.eventType === "hybrid") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <MapPinCheckInside className="mr-2 h-4 w-4 text-purple-600" />
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={eventDetails.location}
                  onChange={handleInputChange}
                  placeholder="Enter the venue or address"
                  className="w-full pl-3 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  required={
                    eventDetails.eventType === "onsite" ||
                    eventDetails.eventType === "hybrid"
                  }
                />
              </div>
            )}

            {/* --- CORRECTED Ticket Price & Supply Section --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Ticket className="mr-2 h-4 w-4 text-purple-600" />
                Tickets *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Ticket Price (ETH) */}
                <div className="relative">
                  <label className="text-xs text-gray-500 absolute -top-2 left-2 bg-white px-1 z-10">
                    Price (ETH)
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <DollarSign size={16} /> {/* Icon for price */}
                    </span>
                    <input
                      type="number"
                      name="ticketPrice" // <-- CORRECTED name
                      placeholder="e.g., 0.1"
                      value={eventDetails.ticketPrice} // <-- CORRECTED value binding
                      onChange={handleInputChange} // <-- Use generic handler
                      min="0"
                      step="any" // Allow decimals for ETH
                      className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      required={true}
                    />
                  </div>
                </div>
                {/* Ticket Supply - ADDED */}
                <div className="relative">
                  <label className="text-xs text-gray-500 absolute -top-2 left-2 bg-white px-1 z-10">
                    Supply
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Hash size={16} /> {/* Icon for supply */}
                    </span>
                    <input
                      type="number"
                      name="ticketSupply" // <-- ADDED name
                      placeholder="e.g., 100"
                      value={eventDetails.ticketSupply} // <-- ADDED value binding
                      onChange={handleInputChange} // <-- Use generic handler
                      min="1" // Must be at least 1
                      step="1" // Whole numbers only
                      className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      required={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information (Description) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <AlignLeft className="mr-2 h-4 w-4 text-purple-600" />
                Event Description (Optional)
              </label>
              <textarea
                name="eventDescription"
                value={eventDetails.eventDescription}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                rows="4"
                placeholder="Share more details about your event..."
              />
            </div>
          </div>
        ); // End case 0

      case 1: // Image Upload Step
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <ImageIcon className="mr-2 h-4 w-4 text-purple-600" />
              Upload Images (Optional, max 5)
            </label>

            {/* Image gallery/grid display */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative group aspect-w-1 aspect-h-1"
                  >
                    {" "}
                    {/* Aspect ratio */}
                    <img
                      src={preview}
                      alt={`Event Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-label="Remove image"
                      disabled={isLoading}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button/area */}
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                isLoading || eventDetails.images.length >= 5 // Disable if loading or max images reached
                  ? "cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400"
                  : "cursor-pointer hover:bg-purple-50 hover:border-purple-400 border-gray-300 text-gray-600"
              }`}
              onClick={() =>
                !isLoading &&
                eventDetails.images.length < 5 &&
                fileInputRef.current.click()
              } // Prevent click when loading or max images
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg, image/png, image/gif, image/webp" // Accepted types
                onChange={handleImageUpload}
                className="hidden"
                multiple
                disabled={isLoading || eventDetails.images.length >= 5}
              />
              <div className="flex flex-col items-center space-y-2">
                <Plus
                  className={`w-8 h-8 mx-auto ${isLoading || eventDetails.images.length >= 5 ? "text-gray-400" : "text-purple-600"}`}
                />
                <p>Click or Drag to Upload Images</p>
                {eventDetails.images.length < 5 ? (
                  <p className="text-xs text-gray-500">
                    ({5 - eventDetails.images.length} remaining. Max 5MB each.
                    JPG, PNG, GIF, WEBP)
                  </p>
                ) : (
                  <p className="text-xs text-red-500">
                    Maximum images uploaded.
                  </p>
                )}
              </div>
            </div>
            {/* Display image-specific errors here if needed */}
            {error && error.startsWith("File ") && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>
        ); // End case 1

      default:
        return null;
    } // End switch
  };

  // --- Ticket Animation Logic (Keep as is) ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    // ... (rest of animation code remains unchanged) ...

    const createTicket = () => {
      const ticket = {
        id: Math.random(),
        x: Math.random() * window.innerWidth,
        y: -30, // Start above the screen
        rotation: Math.random() * 360,
        speedX: (Math.random() - 0.5) * 1, // Slower horizontal movement
        speedY: Math.random() * 1 + 0.5, // Slower vertical movement
        size: Math.random() * 15 + 10, // Slightly smaller range
      };
      setAnimatedTickets((prevTickets) => {
        // Limit number of tickets on screen for performance
        if (prevTickets.length > 50) {
          return [...prevTickets.slice(1), ticket]; // Remove oldest, add new
        }
        return [...prevTickets, ticket];
      });
    };

    let animationFrameId;
    const animationFrame = () => {
      setAnimatedTickets(
        (prevTickets) =>
          prevTickets
            .map((ticket) => {
              let newX = ticket.x + ticket.speedX;
              let newY = ticket.y + ticket.speedY;

              // Boundary checks more gentle
              if (
                newX <= -ticket.size ||
                newX >= window.innerWidth + ticket.size
              ) {
                // Reset off-screen horizontally
                return { ...ticket, y: window.innerHeight + ticket.size }; // Mark for removal below
              }

              if (newY > window.innerHeight + ticket.size) {
                // Reset ticket when it goes off bottom
                return {
                  ...ticket,
                  x: Math.random() * window.innerWidth,
                  y: -ticket.size, // Reset above screen
                  speedX: (Math.random() - 0.5) * 1,
                  speedY: Math.random() * 1 + 0.5,
                };
              }
              return { ...ticket, x: newX, y: newY };
            })
            .filter((ticket) => ticket.y <= window.innerHeight + ticket.size) // Filter out tickets marked for removal
      );
      // Add new tickets periodically instead of every frame
      if (Math.random() < 0.1) {
        // ~10% chance each frame to add one
        createTicket();
      }

      animationFrameId = requestAnimationFrame(animationFrame);
    };

    // Initial burst of tickets
    const initialTicketCount = 15;
    if (animatedTickets.length < initialTicketCount) {
      for (let i = 0; i < initialTicketCount; i++) {
        createTicket();
      }
    }

    animationFrameId = requestAnimationFrame(animationFrame);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // --- Return JSX ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4 sm:p-6 overflow-hidden relative">
      {/* Ticket Animation Layer */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ overflow: "hidden" }}
      >
        {animatedTickets.map((ticket) => (
          <span
            key={ticket.id}
            className="text-white opacity-40" // Reduced opacity
            style={{
              position: "absolute",
              left: `${ticket.x}px`,
              top: `${ticket.y}px`,
              transform: `rotate(${ticket.rotation}deg)`,
              fontSize: `${ticket.size}px`,
              willChange: "transform, top, left", // Performance hint
              transition: "opacity 0.5s ease-out", // Fade effect (optional)
            }}
          >
            <Ticket />
          </span>
        ))}
      </div>
      {/* Form Container */}
      <div className="relative z-10 max-w-2xl w-full mx-auto p-6 md:p-8 my-12 bg-white shadow-xl rounded-lg">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">
          Create Your <span className="text-purple-600">Event</span>
        </h1>

        {/* Non-file related Error Display Area */}
        {error && !error.startsWith("File ") && (
          <div
            className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm transition-opacity duration-300"
            role="alert"
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center mb-8">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div
                className={`flex flex-col items-center ${index <= currentStep ? "text-purple-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${index <= currentStep ? "border-purple-600 bg-purple-600 text-white" : "border-gray-300 bg-white"}`}
                >
                  {index + 1}
                </div>
                <div className="text-xs mt-1 text-center">{step}</div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${index < currentStep ? "bg-purple-600" : "bg-gray-300"}`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Content Area */}
        <div className="mb-8 min-h-[400px]">
          {" "}
          {/* Increased min height */}
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200">
          {/* Previous Button */}
          <button
            onClick={() => setCurrentStep((prev) => prev - 1)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              currentStep === 0
                ? "invisible"
                : "text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500"
            }`}
            disabled={isLoading || currentStep === 0}
          >
            <ChevronLeft size={16} className="mr-1" />
            Previous
          </button>

          {/* Next / Submit Button */}
          {currentStep < steps.length - 1 ? (
            // Next Button
            <button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="flex items-center px-5 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </button>
          ) : (
            // Create Event Button (Submit)
            <button
              onClick={handleCreateEventSubmit}
              className="flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]" // Adjusted min-width
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </button>
          )}
        </div>
      </div>{" "}
      {/* End Form Container */}
    </div> // End Main Div
  );
};

export default EventCreationProcess;
