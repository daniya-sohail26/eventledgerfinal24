import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  MapPinCheckInside,
  Type,
  Clock,
  AlignLeft,
  Image as ImageIcon,
  Ticket,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

const EventCreationProcess = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [eventDetails, setEventDetails] = useState({
    eventTitle: "",
    eventCategory: "",
    eventType: "physical",
    startDate: "",
    startTime: "",
    endTime: "",
    location: "",
    eventDescription: "",
    bannerImage: null,
    tickets: [{ name: "", price: "" }],
  });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const steps = ["Edit", "Banner", "Ticketing"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventDetails((prev) => ({
        ...prev,
        bannerImage: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTicketChange = (index, e) => {
    const { name, value } = e.target;
    const newTickets = [...eventDetails.tickets];
    newTickets[index][name] = value;
    setEventDetails((prev) => ({
      ...prev,
      tickets: newTickets,
    }));
  };

  const addTicket = () => {
    setEventDetails((prev) => ({
      ...prev,
      tickets: [...prev.tickets, { name: "", price: "" }],
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Type className="mr-2 text-purple-600" />
                Event Title
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="eventTitle"
                  value={eventDetails.eventTitle}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all duration-300 ease-in-out"
                  placeholder="Enter event title"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MapPinCheckInside className="mr-2 text-purple-600" />
                Event Category
              </label>
              <div className="relative">
                <select
                  name="eventCategory"
                  value={eventDetails.eventCategory}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 appearance-none"
                >
                  <option value="">Select event category</option>
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                </select>
                <MapPinCheckInside className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <div className="flex space-x-4">
                <label
                  className={`
                  inline-flex items-center px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out
                  ${
                    eventDetails.eventType === "physical"
                      ? "bg-purple-100 text-purple-700 border-2 border-purple-500"
                      : "bg-gray-100 text-gray-700 border-2 border-transparent"
                  }
                `}
                >
                  <input
                    type="radio"
                    name="eventType"
                    value="physical"
                    checked={eventDetails.eventType === "physical"}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  Physical Event
                </label>
                <label
                  className={`
                  inline-flex items-center px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out
                  ${
                    eventDetails.eventType === "virtual"
                      ? "bg-purple-100 text-purple-700 border-2 border-purple-500"
                      : "bg-gray-100 text-gray-700 border-2 border-transparent"
                  }
                `}
                >
                  <input
                    type="radio"
                    name="eventType"
                    value="virtual"
                    checked={eventDetails.eventType === "virtual"}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  Virtual Event
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Clock className="mr-2 text-purple-600 " />
                Date & Time
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div className="relative">
                  <label>Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={eventDetails.startDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                  {/* <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /> */}
                </div>
                <div className="relative">
                  <label>Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={eventDetails.startTime}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                  {/* <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /> */}
                </div>
                <div className="relative">
                  <label>End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    value={eventDetails.endTime}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                  {/* <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /> */}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MapPinCheckInside className="mr-2 text-purple-600" />
                Location
              </label>
              <div className="relative">
                <select
                  name="location"
                  value={eventDetails.location}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 appearance-none"
                >
                  <option value="">Where will your event take place?</option>
                  <option value="venue1">Venue 1</option>
                  <option value="venue2">Venue 2</option>
                </select>
                <MapPinCheckInside className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <AlignLeft className="mr-2 text-purple-600" />
                Additional Information
              </label>
              <textarea
                name="eventDescription"
                value={eventDetails.eventDescription}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all duration-300 ease-in-out"
                rows="4"
                placeholder="Add any additional event details"
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <ImageIcon className="mr-2 text-purple-600" />
              Upload Image
            </label>
            <div
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-purple-50 transition-colors"
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Event Banner Preview"
                  className="mx-auto max-h-64 rounded-lg object-cover"
                />
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <ImageIcon className="w-12 h-12 text-purple-600 mx-auto" />
                  <p className="text-gray-600">
                    Click to upload your event banner
                  </p>
                  <p className="text-xs text-gray-500">
                    Recommended: JPG, PNG, GIF (min 110x134 pixels)
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Ticket className="mr-2 text-purple-600" />
              What tickets are you selling?
            </label>
            {eventDetails.tickets.map((ticket, index) => (
              <div key={index} className="flex space-x-4 mb-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    name="name"
                    placeholder="Ticket Name"
                    value={ticket.name}
                    onChange={(e) => handleTicketChange(index, e)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                  <Ticket className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <div className="relative flex-1">
                  <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={ticket.price}
                    onChange={(e) => handleTicketChange(index, e)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    $
                  </span>
                </div>
                {index > 0 && (
                  <button
                    onClick={() => {
                      const newTickets = eventDetails.tickets.filter(
                        (_, i) => i !== index
                      );
                      setEventDetails((prev) => ({
                        ...prev,
                        tickets: newTickets,
                      }));
                    }}
                    className="text-red-500 hover:text-red-700 self-center"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addTicket}
              className="text-purple-600 hover:text-purple-800 flex items-center transition-colors"
            >
              <PlusCircle className="mr-2" />
              Add Another Ticket Type
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  // Ticket Animation Logic
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const createTicket = () => {
      const ticket = {
        id: Math.random(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        rotation: Math.random() * 360,
        speedX: (Math.random() - 0.5) * 2, // Random horizontal speed
        speedY: Math.random() * 2 + 1, // Random vertical speed
        size: Math.random() * 20 + 10, // Random size
      };
      setTickets((prevTickets) => [...prevTickets, ticket]);
    };

    const animationFrame = () => {
      setTickets((prevTickets) =>
        prevTickets.map((ticket) => {
          const newX = ticket.x + ticket.speedX;
          const newY = ticket.y + ticket.speedY;

          // Reset ticket position when it goes out of the screen
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
      );
      requestAnimationFrame(animationFrame);
    };

    // Create initial tickets and set up the animation
    for (let i = 0; i < 20; i++) {
      // Adjust the number of initial tickets
      createTicket();
    }
    const animationId = requestAnimationFrame(animationFrame);

    // Clean up animation on component unmount
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center p-6 overflow-hidden relative">
      {/* Ticket Animation Layer */}
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ overflow: "hidden" }}
      >
        {tickets.map((ticket) => (
          <span
            key={ticket.id}
            style={{
              position: "absolute",
              left: `${ticket.x}px`,
              top: `${ticket.y}px`,
              transform: `rotate(${ticket.rotation}deg)`,
              fontSize: `${ticket.size}px`,
              color: "rgba(255, 255, 255, 0.6)",
              zIndex: 0, // Ensure tickets are behind the content
            }}
          >
            <Ticket />
          </span>
        ))}
      </div>

      <div className="max-w-3xl w-full mx-auto p-6 mt-24 bg-white shadow-lg rounded-2xl relative z-10">
        {/* Heading */}
        <h1 className="text-3xl font-bold mb-8 text-black text-center">
          Create Your <span className="text-purple-600">Event</span>
        </h1>

        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`flex-1 text-center ${
                index <= currentStep ? "text-purple-600" : "text-gray-400"
              }`}
            >
              <div
                className={`h-1 mb-2 ${
                  index < currentStep
                    ? "bg-purple-600"
                    : index === currentStep
                      ? "bg-purple-600"
                      : "bg-gray-300"
                }`}
              ></div>
              {step}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="mb-6">{renderStepContent()}</div>

        {/* Navigation */}
        <div className="flex justify-between">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ChevronLeft className="mr-2" />
              Previous
            </button>
          )}
          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="ml-auto flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Next
              <ChevronRight className="ml-2" />
            </button>
          ) : (
            <button className="ml-auto flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
              Create Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCreationProcess;
