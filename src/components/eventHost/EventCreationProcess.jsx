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
  DollarSign,
  Hash,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify"; // <-- IMPORT
import "react-toastify/dist/ReactToastify.css"; // <-- IMPORT CSS

// --- DEFINE YOUR BACKEND API URL ---
const API_BASE_URL = "http://localhost:5000";

// --- CORRECTED Initial State ---
const initialEventDetails = {
  eventTitle: "",
  eventCategory: "",
  eventType: "onsite",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  location: "",
  eventDescription: "",
  images: [],
  ticketPrice: "",
  ticketSupply: "",
};

const EventCreationProcess = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [eventDetails, setEventDetails] = useState(initialEventDetails);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // For general/API errors displayed in the component
  const [fieldErrors, setFieldErrors] = useState({});
  const [animatedTickets, setAnimatedTickets] = useState([]);

  const steps = ["Event Details", "Images"];

  // --- Validation Function ---
  const validateForm = (stepToValidate = -1) => {
    const newErrors = {};
    let overallIsValid = true;

    if (stepToValidate === 0 || stepToValidate === -1) {
      if (!eventDetails.eventTitle.trim())
        newErrors.eventTitle = "Please fill this field";
      if (!eventDetails.eventCategory)
        newErrors.eventCategory = "Please select a category";
      if (!eventDetails.startDate)
        newErrors.startDate = "Please select a start date";
      if (!eventDetails.endDate) {
        newErrors.endDate = "Please select an end date";
      } else if (
        eventDetails.startDate &&
        new Date(eventDetails.endDate) < new Date(eventDetails.startDate)
      ) {
        newErrors.endDate = "End date cannot be before start date";
      }

      if (!eventDetails.startTime)
        newErrors.startTime = "Please select a start time";
      if (!eventDetails.endTime)
        newErrors.endTime = "Please select an end time";

      if (
        eventDetails.startDate &&
        eventDetails.endDate &&
        eventDetails.startTime &&
        eventDetails.endTime
      ) {
        const startFullDateTime = new Date(
          `${eventDetails.startDate}T${eventDetails.startTime}`
        );
        const endFullDateTime = new Date(
          `${eventDetails.endDate}T${eventDetails.endTime}`
        );
        if (
          !isNaN(startFullDateTime.getTime()) &&
          !isNaN(endFullDateTime.getTime())
        ) {
          if (endFullDateTime <= startFullDateTime) {
            const msg = "End date/time must be after start date/time.";
            if (!newErrors.endDate) newErrors.endDate = msg;
            if (!newErrors.endTime) newErrors.endTime = msg;
          }
        }
      }

      if (
        eventDetails.eventType === "onsite" ||
        eventDetails.eventType === "hybrid"
      ) {
        if (!eventDetails.location.trim())
          newErrors.location = "Please fill this field";
      }

      if (
        eventDetails.ticketPrice === "" ||
        eventDetails.ticketPrice === null
      ) {
        newErrors.ticketPrice = "Please fill this field";
      } else {
        const priceNum = parseFloat(eventDetails.ticketPrice);
        if (isNaN(priceNum) || priceNum < 0)
          newErrors.ticketPrice = "Price must be 0 or greater";
      }

      if (
        eventDetails.ticketSupply === "" ||
        eventDetails.ticketSupply === null
      ) {
        newErrors.ticketSupply = "Please fill this field";
      } else {
        const supplyNum = parseInt(eventDetails.ticketSupply, 10);
        if (isNaN(supplyNum) || supplyNum < 1)
          newErrors.ticketSupply = "Supply must be at least 1";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      overallIsValid = false;
    }
    return { isValid: overallIsValid, errors: newErrors };
  };

  const handleInputChange = (e) => {
    const { name, value: rawValue, type } = e.target;
    let processedValue = rawValue;

    if (
      type === "number" &&
      rawValue.length > 1 &&
      rawValue.startsWith("0") &&
      !rawValue.startsWith("0.")
    ) {
      processedValue = parseFloat(rawValue).toString();
    }

    setEventDetails((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    setFieldErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      let changed = false;
      if (newErrors[name]) {
        delete newErrors[name];
        changed = true;
      }
      if (
        name === "eventType" &&
        rawValue === "virtual" &&
        newErrors.location
      ) {
        delete newErrors.location;
        changed = true;
      }
      if (
        name === "startDate" &&
        newErrors.endDate?.includes("before start date")
      ) {
        delete newErrors.endDate;
        changed = true;
      }
      if (
        (name === "startDate" || name === "startTime") &&
        (newErrors.endDate?.includes("must be after start date/time") ||
          newErrors.endTime?.includes("must be after start date/time"))
      ) {
        if (newErrors.endDate?.includes("must be after start date/time"))
          delete newErrors.endDate;
        if (newErrors.endTime?.includes("must be after start date/time"))
          delete newErrors.endTime;
        changed = true;
      }
      return changed ? newErrors : prevErrors;
    });
    setError(null); // Clear general error when user starts typing
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const currentImageCount = eventDetails.images.length;
    const newImageFiles = [];
    const newImagePreviews = [];
    let imageError = null;

    if (files.length + currentImageCount > 5) {
      imageError = "You can upload a maximum of 5 images.";
      toast.error(imageError); // Use toast for image errors
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        imageError = `File "${file.name}" exceeds the 5MB size limit.`;
        return;
      }
      if (
        !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
          file.type
        )
      ) {
        imageError = `File "${file.name}" has an unsupported format.`;
        return;
      }

      newImageFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    if (imageError) {
      toast.error(imageError); // Show the first encountered image error
      return;
    }
    // setError(null); // No longer using general 'error' state for image file errors

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
    // setError(null); // No longer using general 'error' state for image file errors
  };

  const handleNextStep = () => {
    setError(null);
    const validationResult = validateForm(currentStep);
    setFieldErrors(validationResult.errors);

    if (validationResult.isValid) {
      setCurrentStep((prev) => prev + 1);
    } else {
      toast.warn("Please correct the highlighted fields.", { autoClose: 2000 });
    }
  };

  const handleCreateEventSubmit = async () => {
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    const token = localStorage.getItem("hostToken");
    if (!token) {
      toast.error("Authentication error: Please log in again.");
      setIsLoading(false);
      return;
    }

    const validationResult = validateForm(-1);
    setFieldErrors(validationResult.errors);

    if (!validationResult.isValid) {
      const step0Fields = [
        "eventTitle",
        "eventCategory",
        "startDate",
        "endDate",
        "startTime",
        "endTime",
        "location",
        "ticketPrice",
        "ticketSupply",
      ];
      let errorOnStep0 = false;
      for (const field of step0Fields) {
        if (validationResult.errors[field]) {
          errorOnStep0 = true;
          break;
        }
      }
      if (errorOnStep0 && currentStep !== 0) setCurrentStep(0);

      toast.error("Please correct the highlighted fields before submitting.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    // ... (append form data - no changes here)
    formData.append("eventTitle", eventDetails.eventTitle);
    formData.append("eventCategory", eventDetails.eventCategory);
    formData.append("eventType", eventDetails.eventType);
    formData.append("startDate", eventDetails.startDate);
    formData.append("endDate", eventDetails.endDate);
    formData.append("startTime", eventDetails.startTime);
    formData.append("endTime", eventDetails.endTime);
    if (
      eventDetails.location &&
      (eventDetails.eventType === "onsite" ||
        eventDetails.eventType === "hybrid")
    ) {
      formData.append("location", eventDetails.location);
    }
    formData.append("eventDescription", eventDetails.eventDescription);
    formData.append("ticketPrice", eventDetails.ticketPrice);
    formData.append("ticketSupply", eventDetails.ticketSupply);

    eventDetails.images.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! Status: ${response.status}`
        );
      }
      toast.success("Event created successfully!"); // <-- USE TOAST
      setEventDetails(initialEventDetails);
      setImagePreviews([]);
      setCurrentStep(0);
      setFieldErrors({});
    } catch (err) {
      console.error("Event Creation Failed:", err);
      toast.error(
        err.message || "An unexpected error occurred. Please try again."
      ); // <-- USE TOAST
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
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
                className={`w-full pl-3 pr-3 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                  fieldErrors.eventTitle
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 focus:border-purple-500"
                }`}
                placeholder="Enter event title"
              />
              {fieldErrors.eventTitle && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.eventTitle}
                </p>
              )}
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
                  className={`w-full pl-3 pr-8 py-2 border-2 rounded-lg focus:outline-none appearance-none transition-colors ${
                    fieldErrors.eventCategory
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-purple-500"
                  }`}
                >
                  <option value="" disabled>
                    Select category...
                  </option>
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
              {fieldErrors.eventCategory && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.eventCategory}
                </p>
              )}
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
                      className="hidden"
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* Date & Time Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Clock className="mr-2 h-4 w-4 text-purple-600" />
                Date & Time *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-xs text-gray-500 absolute -top-2 left-2 bg-white px-1 z-10">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={eventDetails.startDate}
                    onChange={handleInputChange}
                    className={`w-full relative mt-1 pl-3 pr-3 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                      fieldErrors.startDate
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-purple-500"
                    }`}
                  />
                  {fieldErrors.startDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.startDate}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <label className="text-xs text-gray-500 absolute -top-2 left-2 bg-white px-1 z-10">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={eventDetails.endDate}
                    onChange={handleInputChange}
                    min={eventDetails.startDate}
                    className={`w-full relative mt-1 pl-3 pr-3 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                      fieldErrors.endDate
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-purple-500"
                    }`}
                  />
                  {fieldErrors.endDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.endDate}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <label className="text-xs text-gray-500 absolute -top-2 left-2 bg-white px-1 z-10">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={eventDetails.startTime}
                    onChange={handleInputChange}
                    className={`w-full relative mt-1 pl-3 pr-3 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                      fieldErrors.startTime
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-purple-500"
                    }`}
                  />
                  {fieldErrors.startTime && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.startTime}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <label className="text-xs text-gray-500 absolute -top-2 left-2 bg-white px-1 z-10">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={eventDetails.endTime}
                    onChange={handleInputChange}
                    className={`w-full relative mt-1 pl-3 pr-3 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                      fieldErrors.endTime
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-purple-500"
                    }`}
                  />
                  {fieldErrors.endTime && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.endTime}
                    </p>
                  )}
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
                  className={`w-full pl-3 pr-3 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                    fieldErrors.location
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-purple-500"
                  }`}
                />
                {fieldErrors.location && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.location}
                  </p>
                )}
              </div>
            )}

            {/* Ticket Price & Supply Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Ticket className="mr-2 h-4 w-4 text-purple-600" />
                Tickets *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-xs text-gray-500 absolute -top-2 left-2 bg-white px-1 z-10">
                    Price (ETH)
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <DollarSign size={16} />
                    </span>
                    <input
                      type="number"
                      name="ticketPrice"
                      placeholder="e.g., 0.1"
                      value={eventDetails.ticketPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="any"
                      className={`w-full pl-9 pr-3 py-2 border-2 rounded-lg focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                        fieldErrors.ticketPrice
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-200 focus:border-purple-500"
                      }`}
                    />
                  </div>
                  {fieldErrors.ticketPrice && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.ticketPrice}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <label className="text-xs text-gray-500 absolute -top-2 left-2 bg-white px-1 z-10">
                    Supply
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Hash size={16} />
                    </span>
                    <input
                      type="number"
                      name="ticketSupply"
                      placeholder="e.g., 100"
                      value={eventDetails.ticketSupply}
                      onChange={handleInputChange}
                      min="1"
                      step="1"
                      className={`w-full pl-9 pr-3 py-2 border-2 rounded-lg focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                        fieldErrors.ticketSupply
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-200 focus:border-purple-500"
                      }`}
                    />
                  </div>
                  {fieldErrors.ticketSupply && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.ticketSupply}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Event Description */}
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
        );

      case 1: // Image Upload Step
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <ImageIcon className="mr-2 h-4 w-4 text-purple-600" />
              Upload Images (Optional, max 5)
            </label>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative group aspect-w-1 aspect-h-1"
                  >
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
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                isLoading || eventDetails.images.length >= 5
                  ? "cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400"
                  : "cursor-pointer hover:bg-purple-50 hover:border-purple-400 border-gray-300 text-gray-600"
              }`}
              onClick={() =>
                !isLoading &&
                eventDetails.images.length < 5 &&
                fileInputRef.current.click()
              }
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg, image/png, image/gif, image/webp"
                onChange={handleImageUpload}
                className="hidden"
                multiple
                disabled={isLoading || eventDetails.images.length >= 5}
              />
              <div className="flex flex-col items-center space-y-2">
                <Plus
                  className={`w-8 h-8 mx-auto ${
                    isLoading || eventDetails.images.length >= 5
                      ? "text-gray-400"
                      : "text-purple-600"
                  }`}
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
            {/* The 'error' state for specific file errors is now handled by toasts */}
            {/* {error && error.startsWith("File ") && ( // This can be removed
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )} */}
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    // ... (ticket animation code, no changes needed here)
    const createTicket = () => {
      const ticket = {
        id: Math.random(),
        x: Math.random() * window.innerWidth,
        y: -30,
        rotation: Math.random() * 360,
        speedX: (Math.random() - 0.5) * 1,
        speedY: Math.random() * 1 + 0.5,
        size: Math.random() * 15 + 10,
      };
      setAnimatedTickets((prevTickets) => {
        if (prevTickets.length > 50) {
          return [...prevTickets.slice(1), ticket];
        }
        return [...prevTickets, ticket];
      });
    };

    let animationFrameId;
    const animationFrame = () => {
      setAnimatedTickets((prevTickets) =>
        prevTickets
          .map((ticket) => {
            let newX = ticket.x + ticket.speedX;
            let newY = ticket.y + ticket.speedY;

            if (
              newX <= -ticket.size ||
              newX >= window.innerWidth + ticket.size
            ) {
              return { ...ticket, y: window.innerHeight + ticket.size };
            }

            if (newY > window.innerHeight + ticket.size) {
              return {
                ...ticket,
                x: Math.random() * window.innerWidth,
                y: -ticket.size,
                speedX: (Math.random() - 0.5) * 1,
                speedY: Math.random() * 1 + 0.5,
              };
            }
            return { ...ticket, x: newX, y: newY };
          })
          .filter((ticket) => ticket.y <= window.innerHeight + ticket.size)
      );
      if (Math.random() < 0.1) {
        createTicket();
      }

      animationFrameId = requestAnimationFrame(animationFrame);
    };

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
  }, []); // Removed animatedTickets from dependency array

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4 sm:p-6 overflow-hidden relative">
      <ToastContainer // <-- ADD TOAST CONTAINER
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" // Or "light", "dark"
      />
      {/* Ticket Animation Layer */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ overflow: "hidden" }}
      >
        {animatedTickets.map((ticket) => (
          <span
            key={ticket.id}
            className="text-white opacity-40"
            style={{
              position: "absolute",
              left: `${ticket.x}px`,
              top: `${ticket.y}px`,
              transform: `rotate(${ticket.rotation}deg)`,
              fontSize: `${ticket.size}px`,
              willChange: "transform, top, left",
              transition: "opacity 0.5s ease-out",
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

        {/* General Error Display Area - No longer needed if all errors are toasts or field errors */}
        {/* {error && !error.startsWith("File ") && (
          <div
            className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm transition-opacity duration-300"
            role="alert"
          >
            <strong>Error:</strong> {error}
          </div>
        )} */}

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

        <div className="mb-8 min-h-[400px]">{renderStepContent()}</div>

        <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200">
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

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNextStep}
              className="flex items-center px-5 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </button>
          ) : (
            <button
              onClick={handleCreateEventSubmit}
              className="flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
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
      </div>
    </div>
  );
};

export default EventCreationProcess;
