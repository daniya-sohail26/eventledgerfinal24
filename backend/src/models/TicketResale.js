const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    tokenId: {
      type: Number,
      required: [true, "Token ID is required"],
      unique: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },
    ownerId: {
      type: String,
      default: null,
      trim: true,
    },
    originalOwnerId: {
      type: String,
      required: [true, "Original owner wallet address is required"],
      trim: true,
    },
    nftMetadataUri: {
      type: String,
      required: [true, "NFT metadata URI is required"],
      trim: true,
      match: [/^ipfs:\/\/.+$/, "NFT metadata URI must be a valid IPFS URI"],
    },
    transactionHash: {
      type: String,
      required: [true, "Transaction hash is required"],
      trim: true,
      match: [/^0x[a-fA-F0-9]{64}$/, "Transaction hash must be a valid Ethereum hash"],
    },
    originalPrice: {
      type: Number,
      required: [true, "Original price in wei is required"],
      min: [0, "Original price cannot be negative"],
    },
    resaleStatus: {
      type: String,
      enum: ["none", "listed", "sold"],
      default: "none",
    },
    resalePriceETH: {
      type: Number,
      min: [0, "Resale price cannot be negative"],
      default: null,
    },
    listedAt: {
      type: Date,
      default: null,
    },
    soldAt: {
      type: Date,
      default: null,
    },
    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
    },
    isResold: {
      type: Boolean,
      default: false,
    },
    qrCodeFlag: {
      type: Boolean,
      default: false,
    },
    qrCodeData: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Prevent OverwriteModelError in dev environments
module.exports = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
