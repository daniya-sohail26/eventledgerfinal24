import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Calendar, Clock, MapPin } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const TICKET_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "resellTicket",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "host",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "resalePrice",
        "type": "uint256"
      }
    ],
    "name": "TicketResold",
    "type": "event"
  }
];
const TICKET_CONTRACT_ADDRESS = "0xdEdbc29a3C78797A79544EE9D251A9f9C016771C";

const BuyerPersonalEvents = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchStatus, setFetchStatus] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("MetaMask not installed. Please install MetaMask to continue.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWalletAddress(accounts[0]);
      setError(null);
      setFetchStatus(null);
    } catch (err) {
      setError("Failed to connect wallet. Please try again.");
      console.error("Wallet connection error:", err);
    }
  };

  const fetchPersonalEvents = async () => {
    if (!walletAddress) return;
    setLoading(true);
    setError(null);
    setFetchStatus(null);
    console.log(`Fetching tickets for wallet: ${walletAddress}`);

    try {
      const response = await fetch(`http://localhost:5000/api/ticketMetadata/personal/${walletAddress}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch tickets: ${errorText || response.statusText}`);
      }
      const data = await response.json();
      console.log("Fetch successful. API response:", data);

      if (!Array.isArray(data.tickets)) {
        throw new Error("Invalid response: Tickets data is not an array");
      }
      if (typeof data.events !== "object" || data.events === null) {
        throw new Error("Invalid response: Events data is not an object");
      }

      setTickets(data.tickets);
      setEvents(data.events);
      setFetchStatus(data.tickets.length === 0 ? "No tickets found for this wallet." : "Tickets fetched successfully!");
    } catch (err) {
      console.error("Fetch error:", err.message);
      let userErrorMessage = "Unable to fetch tickets. Please try again later.";
      if (err.message.includes("Invalid response")) {
        userErrorMessage = "Received invalid data from server. Please contact support.";
      } else if (err.message.includes("Failed to fetch tickets")) {
        userErrorMessage = `Server error: ${err.message}`;
      }
      setError(userErrorMessage);
      setFetchStatus("Failed to fetch tickets.");
    } finally {
      setLoading(false);
      console.log("Fetch process completed. Status:", fetchStatus);
    }
  };

  useEffect(() => {
    fetchPersonalEvents();
  }, [walletAddress]);

  const resellTicket = async (ticketId, originalPrice) => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not installed");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();
      const contract = new ethers.Contract(TICKET_CONTRACT_ADDRESS, TICKET_CONTRACT_ABI, signer);

      const resalePrice = ethers.parseEther((originalPrice * 0.8).toString());

      const balance = await provider.getBalance(walletAddress);
      const requiredEth = resalePrice + ethers.parseEther("0.01");
      if (balance < requiredEth) {
        throw new Error(
          `Insufficient funds. Need ${ethers.formatEther(requiredEth)} ETH, but only ${ethers.formatEther(balance)} ETH available.`
        );
      }

      const ticket = tickets.find((t) => t.ticketId === ticketId);
      const event = ticket ? events[ticket.eventId] : null;
      if (!ticket || !event) {
        throw new Error("Ticket or event data not found");
      }
      if (event.startDate && Date.now() >= event.startDate) {
        throw new Error("Cannot resell: Event has already occurred");
      }
      if (ticket.isResold) {
        throw new Error("Ticket already resold");
      }

      const tx = await contract.resellTicket(ticketId, { value: resalePrice, gasLimit: 300000 });
      const receipt = await tx.wait();

      const ticketResoldEvent = receipt.logs
        .filter((log) => log.address.toLowerCase() === TICKET_CONTRACT_ADDRESS.toLowerCase())
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find((event) => event && event.name === "TicketResold");

      if (!ticketResoldEvent) {
        throw new Error("Failed to parse TicketResold event");
      }

      const hostAddress = ticketResoldEvent.args.host;

      const updateResponse = await fetch(`http://localhost:5000/api/ticketMetadata/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isResold: true,
          resalePrice: Number(ethers.formatEther(resalePrice)),
          soldAt: new Date(),
          owner: hostAddress,
        }),
      });

      if (!updateResponse.ok) {
        console.error("Failed to update ticket metadata:", await updateResponse.text());
        alert("Ticket resold on blockchain, but failed to update database. Contact support.");
      }

      setTickets(tickets.map((t) =>
        t.ticketId === ticketId
          ? {
              ...t,
              isResold: true,
              resalePrice: Number(ethers.formatEther(resalePrice)),
              soldAt: new Date(),
              owner: hostAddress,
            }
          : t
      ));

      alert("Ticket resold successfully to the host!");
    } catch (err) {
      console.error("Resell error:", err);
      setError(`Failed to resell ticket: ${err.message || "Unknown error"}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-16 px-6">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-500 to-indigo-400 mb-12"
      >
        Your Tickets
      </motion.h1>

      {!walletAddress && (
        <motion.button
          onClick={connectWallet}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto block bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-full font-semibold"
        >
          Connect Wallet
        </motion.button>
      )}

      {loading && walletAddress && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-purple-400 mt-12 text-xl"
        >
          <svg
            className="animate-spin h-8 w-8 text-purple-400 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Fetching tickets...
        </motion.div>
      )}

      {error && walletAddress && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-pink-400 text-xl mb-4">{error}</p>
          <button
            onClick={fetchPersonalEvents}
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-full font-semibold"
          >
            Retry Fetching Tickets
          </button>
        </motion.div>
      )}

      {!loading && !error && walletAddress && fetchStatus && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`text-center text-xl mt-12 ${tickets.length === 0 ? "text-purple-400" : "text-pink-300"}`}
        >
          {fetchStatus}
        </motion.p>
      )}

      {walletAddress && !loading && !error && tickets.length > 0 && (
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {tickets.map((ticket) => {
                const event = events[ticket.eventId];
                return (
                  <motion.div
                    key={ticket.ticketId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    className="relative group border border-purple-800/40 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden hover:shadow-purple-800/50"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-pink-600 opacity-20 blur-xl rounded-3xl group-hover:opacity-40 transition-opacity duration-300"></div>
                    {event ? (
                      <>
                        <img
                          src={event.images[0]?.url || "https://via.placeholder.com/300x200"}
                          alt={event.eventTitle}
                          className="w-full h-48 object-cover rounded-t-3xl border-b border-purple-700/40"
                        />
                        <div className="relative p-5 z-10 text-purple-200">
                          <h3 className="text-xl font-bold mb-2 text-pink-300 tracking-wide">
                            {event.eventTitle}
                          </h3>
                          <div className="flex items-center text-sm space-x-2 mb-1 text-purple-400">
                            <Calendar size={16} />
                            <span>{event.startDate ? new Date(event.startDate).toLocaleDateString() : "Date not available"}</span>
                          </div>
                          <div className="flex items-center text-sm space-x-2 mb-1 text-purple-400">
                            <Clock size={16} />
                            <span>{event.startTime} - {event.endTime}</span>
                          </div>
                          <div className="flex items-center text-sm space-x-2 mb-1 text-purple-400">
                            <MapPin size={16} />
                            <span>{event.eventType === "virtual" ? "Virtual Event" : event.location}</span>
                          </div>
                          <div className="flex items-center text-sm space-x-2 mb-1 text-purple-400">
                            <Ticket size={16} />
                            <span>{ticket.ticketType}</span>
                          </div>
                          <div className="text-sm text-purple-400 mb-2">
                            Ticket Price: {ticket.price} ETH
                          </div>
                          <div className="text-sm text-purple-400 mb-2">
                            {ticket.isResold ? (
                              <>Resold at: {ticket.resalePrice} ETH</>
                            ) : (
                              <>Resale Price: {(ticket.price * 0.8).toFixed(4)} ETH</>
                            )}
                          </div>
                          {!ticket.isUsed && ticket.qrCodeMetadata && !ticket.isResold && (
                            <div className="text-center mb-4">
                              <QRCodeSVG
                                value={ticket.qrCodeMetadata}
                                size={128}
                                className="mx-auto"
                                id={`qr-code-${ticket.ticketId}`}
                              />
                              <p className="text-sm text-purple-400 mt-2">
                                Scan to verify ticket
                              </p>
                            </div>
                          )}
                          {!ticket.isResold && event.startDate && Date.now() < event.startDate ? (
                            <button
                              onClick={() => resellTicket(ticket.ticketId, ticket.price)}
                              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-full font-semibold"
                            >
                              Resell Ticket to Host
                            </button>
                          ) : (
                            <p className="text-pink-400">
                              {ticket.isResold ? "Ticket Resold" : ticket.isUsed ? "Ticket Used" : "Cannot resell after event date"}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="p-5 text-pink-400">
                        Event data not available for ticket ID: {ticket.ticketId}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BuyerPersonalEvents;