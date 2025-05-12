import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  CiImageOn,
  CiCalendar,
  CiClock2,
  CiLocationOn,
  CiUser,
  CiBookmark,
  CiFolderOn,
  CiFilter,
} from "react-icons/ci";
import { ethers } from "ethers";
import { QRCodeSVG } from "qrcode.react";

const CONTRACT_ADDRESS = "0xA58f8f070471A67B48Bb760Cf936B2C085bD591E";

const TicketContractABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "ticketId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "ticketType",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "eventId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "nftMetadataUri",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "qrCodeMetadata",
        type: "string",
      },
    ],
    name: "TicketPurchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "ticketId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isValid",
        type: "bool",
      },
    ],
    name: "TicketVerified",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_eventId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_ticketType",
        type: "string",
      },
      {
        internalType: "string",
        name: "_nftMetadataUri",
        type: "string",
      },
    ],
    name: "buyTicket",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_ticketType",
        type: "string",
      },
    ],
    name: "getTicketPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_ticketId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_transactionHash",
        type: "string",
      },
    ],
    name: "setTransactionHash",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_ticketId",
        type: "uint256",
      },
    ],
    name: "verifyTicket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ticketCounter",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "tickets",
    outputs: [
      {
        internalType: "uint256",
        name: "ticketId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "eventId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "ticketType",
        type: "string",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "string",
        name: "nftMetadataUri",
        type: "string",
      },
      {
        internalType: "string",
        name: "transactionHash",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isVerified",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "purchasedAt",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "qrCodeMetadata",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const EventDetailsPageTailwind = () => {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState(null);
  const [hostData, setHostData] = useState({
    name: "",
    contactNumber: "",
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isInsufficientFundsOpen, setIsInsufficientFundsOpen] = useState(false);
  const [isEventDataErrorOpen, setIsEventDataErrorOpen] = useState(false);
  const [isMetaMaskErrorOpen, setIsMetaMaskErrorOpen] = useState(false);
  const [isNoTicketsErrorOpen, setIsNoTicketsErrorOpen] = useState(false);
  const [isPurchaseFailedOpen, setIsPurchaseFailedOpen] = useState(false);
  const [isInvalidEventIdOpen, setIsInvalidEventIdOpen] = useState(false);
  const [isTicketTypeErrorOpen, setIsTicketTypeErrorOpen] = useState(false);
  const [isTicketIdErrorOpen, setIsTicketIdErrorOpen] = useState(false);
  const [isTransactionFailedOpen, setIsTransactionFailedOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasedTickets, setPurchasedTickets] = useState([]);
  const [fundsMessage, setFundsMessage] = useState("");
  const [purchaseErrorMessage, setPurchaseErrorMessage] = useState("");
  const [transactionErrorMessage, setTransactionErrorMessage] = useState("");

  const API_BASE_URL = "http://localhost:5000";
  const QR_CODE_BASE_URL = "http://localhost:3000/ticket/verify";

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        console.log("Fetching event with ID:", eventId);
        const response = await fetch(
          `${API_BASE_URL}/api/detailsEvents/${eventId}`
        );
        if (!response.ok)
          throw new Error(`Failed to fetch event data: ${response.statusText}`);
        const data = await response.json();
        console.log("API response:", data);

        const event = data.event || data;
        if (
          !event.ticketPriceETH ||
          isNaN(event.ticketPriceETH) ||
          event.ticketPriceETH <= 0
        ) {
          console.warn(
            "Event data missing or invalid ticketPriceETH, setting default based on ticketType:",
            event
          );
          event.ticketPriceETH =
            event.ticketType === "General Admission" ? 0.05 : 0.1;
        }
        if (!event.ticketType) {
          console.warn(
            "Event data missing ticketType, setting default:",
            event
          );
          event.ticketType = "General Admission";
        }
        setEventData(event);

        try {
          console.log("Fetching host with ID:", event.hostId); // Debug hostId
          const hostResponse = await fetch(
            `${API_BASE_URL}/api/hosts/${event.hostId}`
          );
          if (!hostResponse.ok) throw new Error("Failed to fetch host data");
          const hostData = await hostResponse.json();
          console.log("Host API response:", hostData); // Debug host data
          setHostData({
            name: hostData.organizationName || "Unknown Host",
            contactNumber: hostData.mobileNumber || "Contact Number",
          });
        } catch (hostErr) {
          console.error("Host fetch error:", hostErr.message, hostErr.stack);
          setHostData({
            name: "Unknown Host",
            contactNumber: "Contact Number",
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  const nextImage = () => {
    if (eventData?.images?.length) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === eventData.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (eventData?.images?.length) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? eventData.images.length - 1 : prevIndex - 1
      );
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const closeAlert = () => {
    setIsAlertOpen(false);
    setTicketQuantity(1);
    setPurchasedTickets([]);
  };
  const closeInsufficientFundsAlert = () => setIsInsufficientFundsOpen(false);
  const closeEventDataError = () => setIsEventDataErrorOpen(false);
  const closeMetaMaskError = () => setIsMetaMaskErrorOpen(false);
  const closeNoTicketsError = () => setIsNoTicketsErrorOpen(false);
  const closePurchaseFailed = () => setIsPurchaseFailedOpen(false);
  const closeInvalidEventId = () => setIsInvalidEventIdOpen(false);
  const closeTicketTypeError = () => setIsTicketTypeErrorOpen(false);
  const closeTicketIdError = () => setIsTicketIdErrorOpen(false);
  const closeTransactionFailed = () => setIsTransactionFailedOpen(false);

  const saveTicketToMongoDB = async (ticketData) => {
    const requiredFields = [
      "ticketId",
      "eventId",
      "ticketType",
      "owner",
      "nftMetadataUri",
      "transactionHash",
      "price",
      "purchasedAt",
    ];
    for (const field of requiredFields) {
      if (!ticketData[field]) {
        console.error(`Missing required field: ${field}`);
        throw new Error(`Failed to save ticket: Missing ${field}`);
      }
    }

    if (!ethers.isAddress(ticketData.owner)) {
      console.error("Invalid owner address:", ticketData.owner);
      throw new Error("Failed to save ticket: Invalid owner address");
    }

    const qrCodeUrl = `${QR_CODE_BASE_URL}/${ticketData.ticketId}`;
    const ticketDataWithQr = {
      ...ticketData,
      qrCodeMetadata: qrCodeUrl,
      isUsed: false,
    };

    const maxRetries = 3;
    const delay = 1000;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `Saving ticket metadata (Attempt ${attempt}):`,
          ticketDataWithQr
        );
        const response = await fetch(`${API_BASE_URL}/api/ticketMetadata`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ticketDataWithQr),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to save ticket metadata: ${errorText || response.statusText}`
          );
        }

        const result = await response.json();
        console.log("Ticket metadata saved:", result);
        return { ...result, qrCodeUrl };
      } catch (err) {
        console.error(`Attempt ${attempt} failed:`, err.message);
        if (attempt === maxRetries) {
          throw new Error(
            `Failed to save ticket after ${maxRetries} attempts: ${err.message}`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  };

  const handleBuyTickets = async () => {
    if (!eventData) {
      setIsEventDataErrorOpen(true);
      return;
    }

    console.log("Event data in handleBuyTickets:", eventData);
    const ticketPrice = eventData.ticketPriceETH;
    const newPurchasedTickets = [];

    try {
      for (let i = 0; i < ticketQuantity; i++) {
        const result = await purchaseTicketsOnBlockchain(ticketPrice);
        if (result && result.tx && result.ticketId) {
          const savedTicket = await saveTicketToMongoDB({
            ticketId: result.ticketId,
            eventId: eventData._id,
            ticketType: eventData.ticketType,
            owner: result.tx.from,
            nftMetadataUri: result.nftMetadataUri,
            transactionHash: result.tx.hash,
            price: ticketPrice,
            purchasedAt: Math.floor(Date.now() / 1000),
          });
          newPurchasedTickets.push({
            ticketId: result.ticketId,
            qrCodeUrl: savedTicket.qrCodeUrl,
          });
        } else {
          console.warn(`Transaction ${i + 1} failed.`);
          break;
        }
      }

      if (newPurchasedTickets.length > 0) {
        setPurchasedTickets(newPurchasedTickets);
        setIsAlertOpen(true);
        closeModal();
      } else {
        setIsNoTicketsErrorOpen(true);
      }
    } catch (err) {
      console.error("Purchase error:", err);
      setPurchaseErrorMessage(`Purchase failed: ${err.message}`);
      setIsPurchaseFailedOpen(true);
    }
  };

  const purchaseTicketsOnBlockchain = async (ticketPrice) => {
    if (!window.ethereum) {
      setIsMetaMaskErrorOpen(true);
      return null;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();
      const balance = await provider.getBalance(walletAddress);
      const requiredEth = ethers.parseEther((ticketPrice + 0.01).toString());
      console.log("Wallet balance check:", {
        balance: ethers.formatEther(balance),
        required: ticketPrice + 0.01,
      });
      if (balance < requiredEth) {
        setFundsMessage(
          `Insufficient funds. Need ${ticketPrice + 0.01} ETH (including gas). Current balance: ${ethers.formatEther(balance)} ETH.`
        );
        setIsInsufficientFundsOpen(true);
        return null;
      }

      const nftMetadataUri =
        "ipfs://bafkreibpdgwh5beu3iwdm3ml6ox4y35dozmexrdo34vl4rwy6s36ydfthq";
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        TicketContractABI,
        signer
      );

      const parsedEventId = parseInt(eventData._id, 16);
      if (isNaN(parsedEventId) || parsedEventId <= 0) {
        console.error("Invalid event ID:", eventData._id);
        setIsInvalidEventIdOpen(true);
        return null;
      }

      if (!eventData.ticketType) {
        console.error("Ticket type is undefined:", eventData);
        setIsTicketTypeErrorOpen(true);
        return null;
      }

      console.log("Calling buyTicket:", {
        parsedEventId,
        ticketType: eventData.ticketType,
        nftMetadataUri,
        value: ethers.parseEther(ticketPrice.toString()).toString(),
      });

      const tx = await contract.buyTicket(
        parsedEventId,
        eventData.ticketType,
        nftMetadataUri,
        {
          value: ethers.parseEther(ticketPrice.toString()),
          gasLimit: 300000,
        }
      );

      const receipt = await tx.wait();
      const ticketIdEvent = receipt.logs
        .filter(
          (log) => log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()
        )
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find((event) => event && event.name === "TicketPurchased");

      const ticketId = ticketIdEvent
        ? ticketIdEvent.args.ticketId.toNumber()
        : null;
      if (!ticketId) {
        console.error("Failed to parse TicketPurchased event:", receipt.logs);
        setIsTicketIdErrorOpen(true);
        return { tx, ticketId: null, nftMetadataUri };
      }

      console.log("Transaction successful:", tx.hash, "Ticket ID:", ticketId);
      return { tx, ticketId, nftMetadataUri };
    } catch (err) {
      console.error("Smart contract error:", {
        message: err.message,
        reason: err.reason,
        code: err.code,
        data: err.data,
      });
      setTransactionErrorMessage(
        `Transaction failed: ${err.reason || err.message || "Unknown error"}`
      );
      setIsTransactionFailedOpen(true);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-16 px-6 flex items-center justify-center">
        <p className="text-white text-xl">Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-16 px-6 flex items-center justify-center">
        <p className="text-pink-400 text-xl">Error: {error}</p>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-16 px-6 flex items-center justify-center">
        <p className="text-white text-xl">Event not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-16 px-6 flex justify-center items-start font-sans">
      <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10 max-w-4xl w-full text-gray-300">
        <div className="relative bg-gray-800 h-[200px] md:h-[300px] rounded-lg mb-8 overflow-hidden">
          {eventData.images?.length > 0 ? (
            <>
              <img
                src={eventData.images[currentImageIndex].url}
                alt={`${eventData.eventTitle} ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 border border-white/30 rounded-full size-10 flex items-center justify-center text-white transition-colors"
              >
                ←
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 border border-white/30 rounded-full size-10 flex items-center justify-center text-white transition-colors"
              >
                →
              </button>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                {eventData.images.map((_, index) => (
                  <div
                    key={index}
                    className={`size-3 rounded-full ${
                      currentImageIndex === index ? "bg-white" : "bg-gray-500"
                    }`}
                  />
                ))}
              </div>
            </>
          ) : (
            <CiImageOn className="text-6xl text-gray-500" />
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-orange-400 text-transparent bg-clip-text">
          {eventData.eventTitle}
        </h1>

        <div className="mb-8 bg-gray-900/50 border border-white/20 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center hover:bg-gray-900/70 transition-colors duration-300">
          <div className="flex items-center gap-2">
            <CiFolderOn className="text-pink-500 text-xl flex-shrink-0" />
            <p className="text-base">
              <span className="font-semibold bg-gradient-to-r from-pink-500 to-orange-400 text-transparent bg-clip-text">
                Category:
              </span>{" "}
              <span className="text-gray-300">{eventData.category}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CiFilter className="text-pink-500 text-xl flex-shrink-0" />
            <p className="text-base">
              <span className="font-semibold bg-gradient-to-r from-pink-500 to-orange-400 text-transparent bg-clip-text">
                Type:
              </span>{" "}
              <span className="text-gray-300">{eventData.eventType}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-10 mb-8">
          <div className="flex-1 md:flex-[2] min-w-0">
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 pb-2 border-b border-white/20">
                Date and Time
              </h2>
              <p className="flex items-center mb-2.5 text-base text-gray-400">
                <CiCalendar className="mr-3 text-pink-500 text-xl flex-shrink-0" />{" "}
                {new Date(eventData.startDate).toLocaleDateString()}
              </p>
              <p className="flex items-center mb-2.5 text-base text-gray-400">
                <CiClock2 className="mr-3 text-pink-500 text-xl flex-shrink-0" />{" "}
                {eventData.startTime} - {eventData.endTime}
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 pb-2 border-b border-white/20">
                Location
              </h2>
              <p className="flex items-start mb-2.5 text-base text-gray-400">
                <CiLocationOn className="mr-3 text-pink-500 text-xl mt-1 flex-shrink-0" />
                <span>
                  {eventData.eventType === "virtual"
                    ? "Virtual Event"
                    : eventData.location}
                </span>
              </p>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 pb-2 border-b border-white/20">
                Ticket Information
              </h2>
              <p className="flex items-center mb-2.5 text-base text-gray-400">
                <CiBookmark className="mr-3 text-pink-500 text-xl flex-shrink-0" />{" "}
                {eventData.ticketPriceETH} ETH
              </p>
              <button
                onClick={openModal}
                className="mt-4 w-full md:w-auto bg-gradient-to-br from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
              >
                Buy Tickets
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 pb-2 border-b border-white/20">
                Hosted by
              </h2>
              <div className="flex items-center gap-4">
                <div className="size-14 md:size-16 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  <CiUser className="text-3xl text-gray-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-lg text-white">
                    {hostData.name}
                  </p>
                  <p className="font-semibold text-lg text-white">
                    {hostData.contactNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 pb-2 border-b border-white/20">
            Event Description
          </h2>
          <p className="text-base text-gray-400 leading-relaxed">
            {eventData.description}
          </p>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md text-white">
              <h3 className="text-xl font-semibold mb-4">Purchase Tickets</h3>
              <div className="mb-4">
                <label
                  htmlFor="ticketQuantity"
                  className="block text-sm font-medium mb-2"
                >
                  Number of Tickets
                </label>
                <input
                  type="number"
                  id="ticketQuantity"
                  value={ticketQuantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTicketQuantity(value ? Math.max(1, parseInt(value)) : 1);
                  }}
                  min="1"
                  className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBuyTickets}
                  className="bg-gradient-to-br from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
                >
                  Buy Tickets
                </button>
              </div>
            </div>
          </div>
        )}

        {isAlertOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md text-white shadow-lg">
              <p className="text-lg font-semibold text-center mb-4">
                Success! Purchased {purchasedTickets.length} ticket(s)!
              </p>
              <div className="mb-4">
                {purchasedTickets.map((ticket) => (
                  <div key={ticket.ticketId} className="mb-4 text-center">
                    <p>Ticket ID: {ticket.ticketId}</p>
                    <QRCodeSVG
                      value={ticket.qrCodeUrl}
                      size={128}
                      className="mx-auto my-2"
                      id={`qr-code-${ticket.ticketId}`}
                    />
                    <p className="text-sm text-gray-400">
                      Scan this QR code to verify the ticket or check "My
                      Tickets".
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={closeAlert}
                  className="bg-gradient-to-br from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {isInsufficientFundsOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md text-white shadow-lg">
              <p className="text-lg font-semibold text-center mb-4">
                Insufficient Funds
              </p>
              <p className="text-sm text-gray-400 mb-4 text-center">
                {fundsMessage}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={closeInsufficientFundsAlert}
                  className="bg-gradient-to-br from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {isEventDataErrorOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md text-white shadow-lg">
              <p className="text-lg font-semibold text-center mb-4">
                Event Data Error
              </p>
              <p className="text-sm text-gray-400 mb-4 text-center">
                Event data not available. Please try again later.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={closeEventDataError}
                  className="bg-gradient-to-br from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {isMetaMaskErrorOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md text-white shadow-lg">
              <p className="text-lg font-semibold text-center mb-4">
                MetaMask Required
              </p>
              <p className="text-sm text-gray-400 mb-4 text-center">
                Please install MetaMask to continue.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={closeMetaMaskError}
                  className="bg-gradient-to-br from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {isNoTicketsErrorOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md text-white shadow-lg">
              <p className="text-lg font-semibold text-center mb-4">
                Purchase Error
              </p>
              <p className="text-sm text-gray-400 mb-4 text-center">
                No tickets were purchased. Please check your wallet balance and
                try again.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={closeNoTicketsError}
                  className="bg-gradient-to-br from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {isPurchaseFailedOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md text-white shadow-lg">
              <p className="text-lg font-semibold text-center mb-4">
                Purchase Failed
              </p>
              <p className="text-sm text-gray-400 mb-4 text-center">
                {purchaseErrorMessage}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={closePurchaseFailed}
                  className="bg-gradient-to-br from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {isInvalidEventIdOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md text-white shadow-lg">
              <p className="text-lg font-semibold text-center mb-4">
                Invalid Event ID
              </p>
              <p className="text-sm text-gray-400 mb-4 text-center">
                Invalid event ID. Please contact support.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={closeInvalidEventId}
                  className="bg-gradient-to-br from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {isTicketTypeErrorOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md text-white shadow-lg">
              <p className="text-lg font-semibold text-center mb-4">
                Ticket Type Error
              </p>
              <p className="text-sm text-gray-400 mb-4 text-center">
                Ticket type unavailable. Please contact support.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={closeTicketTypeError}
                  className="bg-gradient-to-br from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {isTicketIdErrorOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 wVarsity Hackathon - 2025full max-w-md text-white shadow-lg">
              <p className="text-lg font-semibold text-center mb-4">
                Ticket ID Error
              </p>
              <p className="text-sm text-gray-400 mb-4 text-center">
                Transaction succeeded, but ticket ID could not be retrieved.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={closeTicketIdError}
                  className="bg-gradient-to-br from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {isTransactionFailedOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md text-white shadow-lg">
              <p className="text-lg font-semibold text-center mb-4">
                Transaction Failed
              </p>
              <p className="text-sm text-gray-400 mb-4 text-center">
                {transactionErrorMessage}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={closeTransactionFailed}
                  className="bg-gradient-to-br from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailsPageTailwind;