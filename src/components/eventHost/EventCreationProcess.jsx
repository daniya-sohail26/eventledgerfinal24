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
} from "lucide-react";

// --- DEFINE YOUR BACKEND API URL ---
// Make sure your backend server IS running on this address!
const API_BASE_URL = "http://localhost:5000";

// --- Define the initial state outside the component for easy reset ---
const initialEventDetails = {
  eventTitle: "",
  eventCategory: "",
  eventType: "onsite",
  startDate: "",
  startTime: "",
  endTime: "",
  location: "",
  eventDescription: "",
  images: [],
  tickets: [{ name: "", price: "" }],
};

const EventCreationProcess = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [eventDetails, setEventDetails] = useState(initialEventDetails);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [animatedTickets, setAnimatedTickets] = useState([]); // State for animation

  const steps = ["Event Details", "Images"];

  // ... (keep handleInputChange, handleImageUpload, removeImage, handleTicketChange exactly as they were) ...
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImageFiles = [];

    files.forEach((file) => {
      newImageFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    if (newImageFiles.length > 0) {
      setEventDetails((prev) => ({
        ...prev,
        images: [...prev.images, ...newImageFiles],
      }));
    }
  };

  const removeImage = (index) => {
    setEventDetails((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTicketChange = (index, e) => {
    if (index !== 0) return;
    const { name, value } = e.target;
    const newTickets = [...eventDetails.tickets];
    if (name === "price") {
      newTickets[0][name] = value === "" ? "" : Number(value);
    } else {
      newTickets[0][name] = value;
    }
    setEventDetails((prev) => ({
      ...prev,
      tickets: newTickets,
    }));
  };

  // --- Function to handle final submission ---
  const handleCreateEventSubmit = async () => {
    setError(null);
    setIsLoading(true);

    const token = localStorage.getItem("hostToken");
    if (!token) {
      setError("Authentication error: Please log in again.");
      setIsLoading(false);
      return;
    }

    // Basic Frontend Validation (keep this part)
    if (
      !eventDetails.eventTitle ||
      !eventDetails.eventCategory ||
      !eventDetails.startDate ||
      !eventDetails.startTime ||
      !eventDetails.endTime
    ) {
      setError("Please fill in all required event details.");
      setCurrentStep(0);
      setIsLoading(false);
      return;
    }
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
    if (
      eventDetails.tickets[0]?.price === "" ||
      eventDetails.tickets[0]?.price === undefined ||
      eventDetails.tickets[0]?.price === null
    ) {
      setError("Please enter a valid ticket price.");
      setCurrentStep(0);
      setIsLoading(false);
      return;
    }

    // Create FormData (keep this part)
    const formData = new FormData();
    formData.append("eventTitle", eventDetails.eventTitle);
    formData.append("eventCategory", eventDetails.eventCategory);
    formData.append("eventType", eventDetails.eventType);
    formData.append("startDate", eventDetails.startDate);
    formData.append("startTime", eventDetails.startTime);
    formData.append("endTime", eventDetails.endTime);
    if (
      eventDetails.location ||
      eventDetails.eventType === "onsite" ||
      eventDetails.eventType === "hybrid"
    ) {
      formData.append("location", eventDetails.location);
    }
    formData.append("eventDescription", eventDetails.eventDescription);
    const price = eventDetails.tickets[0]?.price;
    formData.append(
      "ticketPrice",
      typeof price === "number" && !isNaN(price) ? price.toString() : "0"
    );
    eventDetails.images.forEach((file) => {
      formData.append("images", file);
    });

    // 4. Make API Request --- THIS IS THE CORRECTED PART ---
    try {
      // *** Use the API_BASE_URL variable here! ***
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        // <--- CHANGE IS HERE
        method: "POST",
        headers: {
          // 'Content-Type' is set automatically by browser for FormData
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      // ---> NO CHANGES NEEDED BELOW THIS LINE inside the try block <---
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! Status: ${response.status}`
        );
      }

      console.log("Event created successfully:", data.event);
      alert("Event created successfully!");

      setEventDetails(initialEventDetails);
      setImagePreviews([]);
      setCurrentStep(0);
    } catch (err) {
      console.error("Event Creation Failed:", err);
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Step Content Function (Keep renderStepContent exactly as it was) ---
  const renderStepContent = () => {
    // ... (NO CHANGES NEEDED INSIDE THIS FUNCTION) ...
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            {/* Event Title */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Type className="mr-2 text-purple-600" />
                Event Title * {/* Added required marker */}
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="eventTitle"
                  value={eventDetails.eventTitle}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all duration-300 ease-in-out"
                  placeholder="Enter event title"
                  required={true} // Explicit boolean attribute
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Event Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MapPinCheckInside className="mr-2 text-purple-600" />
                Event Category * {/* Added required marker */}
              </label>
              <div className="relative">
                <select
                  name="eventCategory"
                  value={eventDetails.eventCategory}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 appearance-none"
                  required={true} // Explicit boolean attribute
                >
                  <option value="">Select event category</option>
                  <option value="music">Music and Concert</option>
                  <option value="sports">Sports</option>
                  <option value="theater">Theater & Performing Arts</option>
                  <option value="festivals">Festivals & Fairs</option>
                  <option value="conferences">Conferences & Workshops</option>
                  <option value="family">Family & Kids</option>
                  <option value="food">Food & Drink</option>
                  <option value="art">Art & Culture</option>
                  <option value="nightlife">Nightlife & Parties</option>
                  <option value="charity">Charity & Community</option>
                  <option value="hobbies">Hobbies & Special Interests</option>
                </select>
                <MapPinCheckInside className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type * {/* Added required marker */}
              </label>
              <div className="flex flex-wrap gap-3">
                {" "}
                {/* Use gap for better spacing */}
                {/* Onsite Radio */}
                <label
                  className={`inline-flex items-center px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out ${
                    eventDetails.eventType === "onsite"
                      ? "bg-purple-100 text-purple-700 border-2 border-purple-500"
                      : "bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="eventType"
                    value="onsite"
                    checked={eventDetails.eventType === "onsite"}
                    onChange={handleInputChange}
                    className="hidden"
                    required={true} // Explicit boolean attribute
                  />{" "}
                  Onsite
                </label>
                {/* Virtual Radio */}
                <label
                  className={`inline-flex items-center px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out ${
                    eventDetails.eventType === "virtual"
                      ? "bg-purple-100 text-purple-700 border-2 border-purple-500"
                      : "bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="eventType"
                    value="virtual"
                    checked={eventDetails.eventType === "virtual"}
                    onChange={handleInputChange}
                    className="hidden"
                    required={true} // Explicit boolean attribute
                  />{" "}
                  Virtual
                </label>
                {/* Hybrid Radio */}
                <label
                  className={`inline-flex items-center px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out ${
                    eventDetails.eventType === "hybrid"
                      ? "bg-purple-100 text-purple-700 border-2 border-purple-500"
                      : "bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="eventType"
                    value="hybrid"
                    checked={eventDetails.eventType === "hybrid"}
                    onChange={handleInputChange}
                    className="hidden"
                    required={true} // Explicit boolean attribute
                  />{" "}
                  Hybrid
                </label>
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Clock className="mr-2 text-purple-600 " />
                Date & Time * {/* Added required marker */}
              </label>
              {/* Adjusted grid for responsiveness */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative">
                  <label className="text-xs text-gray-500 absolute -top-2 left-3 bg-white px-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={eventDetails.startDate}
                    onChange={handleInputChange}
                    className="w-full mt-1 pl-3 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                    required={true} // Explicit boolean attribute
                  />
                </div>
                <div className="relative">
                  <label className="text-xs text-gray-500 absolute -top-2 left-3 bg-white px-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={eventDetails.startTime}
                    onChange={handleInputChange}
                    className="w-full mt-1 pl-3 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                    required={true} // Explicit boolean attribute
                  />
                </div>
                <div className="relative">
                  <label className="text-xs text-gray-500 absolute -top-2 left-3 bg-white px-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={eventDetails.endTime}
                    onChange={handleInputChange}
                    className="w-full mt-1 pl-3 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                    required={true} // Explicit boolean attribute
                  />
                </div>
              </div>
            </div>

            {/* Location (Conditionally Required based on Event Type) */}
            {(eventDetails.eventType === "onsite" ||
              eventDetails.eventType === "hybrid") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MapPinCheckInside className="mr-2 text-purple-600" />
                  Location * {/* Added required marker */}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    value={eventDetails.location}
                    onChange={handleInputChange}
                    placeholder="Enter the venue or address"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                    // Required attribute depends on event type
                    required={
                      eventDetails.eventType === "onsite" ||
                      eventDetails.eventType === "hybrid"
                    }
                  />
                  <MapPinCheckInside className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            )}
            {/* If event type is virtual, location is not shown/required */}

            {/* Ticket Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Ticket className="mr-2 text-purple-600" />
                Ticket Price ($) * {/* Added required marker & unit */}
              </label>
              {/* Only show one price input for the first ticket */}
              <div className="flex space-x-4 mb-4">
                <div className="relative flex-1">
                  <input
                    type="number" // Use number for better input handling
                    name="price" // Matches handleTicketChange logic
                    placeholder="e.g., 10.00 or 0 for free"
                    // Access first ticket's price safely, default to empty string if undefined
                    value={eventDetails.tickets[0]?.price ?? ""}
                    onChange={(e) => handleTicketChange(0, e)} // Always update the first ticket item
                    min="0" // Prevent negative prices
                    step="0.01" // Allow decimals
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" // Hide number spinners
                    required={true} // Explicit boolean attribute
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    $
                  </span>
                </div>
                {/* Removed Add Ticket button as we handle single price */}
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <AlignLeft className="mr-2 text-purple-600" />
                Additional Information (Optional)
              </label>
              <textarea
                name="eventDescription"
                value={eventDetails.eventDescription}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all duration-300 ease-in-out"
                rows="4"
                placeholder="Share more details about your event..."
              />
            </div>
          </div>
        );
      case 1: // Image Upload Step
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <ImageIcon className="mr-2 text-purple-600" />
              Upload Images (Optional)
            </label>

            {/* Image gallery/grid display */}
            {imagePreviews.length > 0 && (
              // Improved responsive grid
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group aspect-square">
                    {" "}
                    {/* Ensure square aspect ratio */}
                    <img
                      src={preview}
                      alt={`Event Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border-2 border-gray-200" // Cover ensures image fills square
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-label="Remove image"
                      disabled={isLoading} // Disable remove button while submitting
                    >
                      <X size={14} /> {/* Smaller X icon */}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button/area */}
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                isLoading
                  ? "cursor-not-allowed bg-gray-100 border-gray-300" // Style when disabled
                  : "cursor-pointer hover:bg-purple-50 hover:border-purple-400 border-gray-300" // Normal and hover styles
              }`}
              onClick={() => !isLoading && fileInputRef.current.click()} // Prevent click when loading
            >
              <input
                type="file"
                ref={fileInputRef}
                // Be more specific with accepted types
                accept="image/jpeg, image/png, image/gif, image/webp"
                onChange={handleImageUpload}
                className="hidden"
                multiple
                disabled={isLoading} // Disable file input during submission
              />
              <div className="flex flex-col items-center space-y-3">
                <Plus className="w-10 h-10 text-purple-600 mx-auto" />
                <p className="text-gray-600">Click or Drag to Upload Images</p>
                <p className="text-xs text-gray-500">
                  (Max 5MB per image. JPG, PNG, GIF, WEBP supported)
                </p>
              </div>
            </div>
            {/* You could add image-specific error display here */}
          </div>
        );

      default:
        return null;
    }
  };

  // --- Ticket Animation Logic (Keep this useEffect exactly as it was) ---
  useEffect(() => {
    // ... (NO CHANGES NEEDED INSIDE THIS useEffect for animation) ...
    if (typeof window === "undefined") return;

    const createTicket = () => {
      const ticket = {
        id: Math.random(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        rotation: Math.random() * 360,
        speedX: (Math.random() - 0.5) * 2,
        speedY: Math.random() * 2 + 1,
        size: Math.random() * 20 + 10,
      };
      setAnimatedTickets((prevTickets) => [...prevTickets, ticket]);
    };

    let animationFrameId;
    const animationFrame = () => {
      setAnimatedTickets((prevTickets) =>
        prevTickets
          .map((ticket) => {
            let newX = ticket.x + ticket.speedX;
            let newY = ticket.y + ticket.speedY;

            if (newX <= 0 || newX >= window.innerWidth) {
              ticket.speedX *= -1;
              newX = ticket.x + ticket.speedX;
            }

            if (newY > window.innerHeight) {
              return {
                ...ticket,
                x: Math.random() * window.innerWidth,
                y: -ticket.size,
                speedX: (Math.random() - 0.5) * 2,
                speedY: Math.random() * 2 + 1,
                size: Math.random() * 20 + 10,
              };
            }

            return { ...ticket, x: newX, y: newY };
          })
          .filter((ticket) => ticket)
      );
      animationFrameId = requestAnimationFrame(animationFrame);
    };

    const initialTicketCount = 20;
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
  }, []); // Added dependency array to ensure it runs correctly

  // --- Return JSX (Keep the JSX structure exactly as it was) ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center p-4 sm:p-6 overflow-hidden relative">
      {/* Ticket Animation Layer */}
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ overflow: "hidden" }}
      >
        {animatedTickets.map((ticket) => (
          <span
            key={ticket.id}
            className="text-white opacity-60"
            style={{
              position: "absolute",
              left: `${ticket.x}px`,
              top: `${ticket.y}px`,
              transform: `rotate(${ticket.rotation}deg)`,
              fontSize: `${ticket.size}px`,
              zIndex: 0,
              willChange: "transform, top, left",
            }}
          >
            <Ticket />
          </span>
        ))}
      </div>

      {/* Form Container */}
      <div className="max-w-3xl w-full mx-auto p-6 md:p-8 mt-20 mb-10 bg-white shadow-2xl rounded-2xl relative z-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-black text-center">
          Create Your <span className="text-purple-600">Event</span>
        </h1>

        {/* Error Display Area */}
        {error && (
          <div
            className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm"
            role="alert"
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`flex-1 text-center transition-colors duration-300 ${
                index <= currentStep
                  ? "text-purple-600 font-medium"
                  : "text-gray-400"
              }`}
            >
              <div className="relative mb-2">
                <div className="h-1 w-full bg-gray-300"></div>
                <div
                  className={`absolute top-0 left-0 h-1 bg-purple-600 transition-all duration-500 ease-out ${
                    index < currentStep
                      ? "w-full"
                      : index === currentStep
                        ? "w-1/2"
                        : "w-0"
                  }`}
                ></div>
              </div>
              {step}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="mb-6 min-h-[300px]">{renderStepContent()}</div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <ChevronLeft size={18} className="mr-1" />
              Previous
            </button>
          )}

          {currentStep === 0 && <div className="flex-grow"></div>}

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="ml-auto flex items-center px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Next
              <ChevronRight size={18} className="ml-1" />
            </button>
          ) : (
            <button
              onClick={handleCreateEventSubmit}
              className="ml-auto flex items-center justify-center px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCreationProcess;
