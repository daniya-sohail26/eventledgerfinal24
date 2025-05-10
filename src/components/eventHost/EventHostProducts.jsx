import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, RefreshCcw, Clock, Tag } from 'lucide-react';
import axios from 'axios';

const tabs = ['Created Events', 'Upcoming Events', 'Reselling Requests'];

const EventHostDashboard = () => {
  const [activeTab, setActiveTab] = useState('Created Events');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const hostId = localStorage.getItem('hostId');
        if (!hostId) {
          throw new Error('Please log in to view your events');
        }
        const response = await axios.get(`http://localhost:5000/api/events/${hostId}`);
        setEvents(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch events');
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const now = new Date();
  const createdEvents = events;
  const upcomingEvents = events.filter((event) => new Date(event.startDate) > now); // Updated to use startDate
  const displayedEvents =
    activeTab === 'Created Events'
      ? createdEvents
      : activeTab === 'Upcoming Events'
      ? upcomingEvents
      : [];

  const myResellRequests = [
    { id: 4, eventName: 'Techno Festival 2025', buyerName: 'John Doe', requestedPrice: '$39', image: '/img/contact-1.webp' },
    { id: 5, eventName: 'Blockchain Summit', buyerName: 'Jane Smith', requestedPrice: '$100', image: '/img/swordman.webp' },
  ];

  if (loading) return <div className="text-center text-purple-400 mt-20 text-xl">Loading...</div>;
  if (error) return <div className="text-center text-red-400 mt-20 text-xl">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-28 px-6">
      <h1 className="text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-500 to-indigo-400 mb-20 animate-fade-in">
        My Events Dashboard
      </h1>
      <div className="flex justify-center gap-6 mb-16">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-full font-semibold text-base tracking-wide transition-all duration-300 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                : 'bg-black/40 text-purple-300 border border-purple-800 hover:border-purple-500 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {activeTab !== 'Reselling Requests' ? (
          displayedEvents.map((event) => (
            <div
              key={event._id}
              className="group bg-black/50 border border-purple-800/40 rounded-3xl overflow-hidden shadow-2xl hover:shadow-purple-600/50 transition-transform transform hover:scale-105 hover:rotate-1 backdrop-blur-md"
            >
              <div className="relative">
              <img
  src={event.posterImages?.[0] || '/img/fallback-image.jpg'} // use a fallback image path here
  alt={event.eventTitle || 'Event Image'}
  className="w-full h-48 object-cover group-hover:brightness-110"
/>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              </div>
              <div className="p-6 text-purple-200">
                <h2 className="text-xl font-bold text-pink-300 mb-2">{event.eventTitle}</h2>
                {event.eventType !== 'virtual' && ( // Conditionally render location for non-virtual events
                  <div className="flex items-center text-sm mb-1">
                    <MapPin size={16} className="mr-2 text-purple-400" />
                    {event.location || 'Location TBD'}
                  </div>
                )}
                <div className="flex items-center text-sm mb-1">
                  <Calendar size={16} className="mr-2 text-purple-400" />
                  {new Date(event.startDate).toLocaleDateString()} at {event.startTime}
                </div>
                <div className="flex items-center text-sm mb-4">
                  <Tag size={16} className="mr-2 text-purple-400" />
                  {event.category} | {event.ticketsSold} Tickets Sold
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-pink-400">{event.ticketPriceETH} ETH</span>
                  <button className="bg-gradient-to-br from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-sm px-5 py-2 rounded-full flex items-center gap-2 shadow-md">
                    <Clock size={16} /> Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          myResellRequests.map((request) => (
            <div
              key={request.id}
              className="group bg-black/50 border border-pink-800/40 rounded-3xl overflow-hidden shadow-2xl hover:shadow-pink-600/50 transition-transform transform hover:scale-105 hover:-rotate-1 backdrop-blur-md"
            >
              <div className="relative">
                <img src={request.image} alt={request.eventName} className="w-full h-48 object-cover group-hover:brightness-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              </div>
              <div className="p-6 text-pink-200">
                <h2 className="text-xl font-bold text-purple-300 mb-2">{request.eventName}</h2>
                <p className="text-sm mb-2">Requested by: {request.buyerName}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-pink-400">{request.requestedPrice}</span>
                  <button className="bg-gradient-to-br from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-sm px-5 py-2 rounded-full flex items-center gap-2 shadow-md">
                    <RefreshCcw size={16} /> Approve
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {displayedEvents.length === 0 && activeTab !== 'Reselling Requests' && (
        <p className="text-center text-purple-400 mt-20 text-xl">No {activeTab.toLowerCase()} available.</p>
      )}
    </div>
  );
};

export default EventHostDashboard;
