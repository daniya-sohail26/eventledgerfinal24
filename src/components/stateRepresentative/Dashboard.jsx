import React, { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";

const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_eventHost", type: "address" },
      { internalType: "string", name: "_ipfsHash", type: "string" },
    ],
    name: "uploadBusinessDoc",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_eventHost", type: "address" }],
    name: "getDocument",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
];

const StateRepDashboard = () => {
  const [file, setFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState("");
  const [eventHost, setEventHost] = useState("");
  const [uploadedDocs, setUploadedDocs] = useState([]);

  const pinataApiKey = "YOUR_PINATA_API_KEY";
  const pinataSecretApiKey = "YOUR_PINATA_SECRET_API_KEY";

  const uploadToPinata = async () => {
    if (!file) return alert("Please select a file");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setIpfsHash(res.data.IpfsHash);
      alert("File uploaded to IPFS: " + res.data.IpfsHash);
    } catch (error) {
      console.error("Error uploading to Pinata", error);
    }
  };

  const uploadToBlockchain = async () => {
    if (!ipfsHash || !eventHost)
      return alert("Enter event host address and upload file first");

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      try {
        const tx = await contract.uploadBusinessDoc(eventHost, ipfsHash);
        await tx.wait();
        alert("Document successfully uploaded on blockchain!");
      } catch (error) {
        console.error("Blockchain upload error", error);
      }
    } else {
      alert("Install MetaMask to continue");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-black to-purple-900 text-white p-6">
      <h2 className="text-3xl font-bold mb-6">
        State Representative Dashboard
      </h2>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
        <input
          type="file"
          className="block w-full mb-4 p-2 border border-gray-600 rounded bg-gray-900"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button
          onClick={uploadToPinata}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Upload to Pinata
        </button>
        <input
          type="text"
          className="block w-full p-2 border border-gray-600 rounded bg-gray-900 text-white mb-4"
          placeholder="Enter Event Host Address"
          onChange={(e) => setEventHost(e.target.value)}
        />
        <button
          onClick={uploadToBlockchain}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Verify & Upload to Blockchain
        </button>
      </div>
      <h3 className="text-2xl font-semibold mt-8 mb-4">Uploaded Documents</h3>
      <div className="w-full max-w-2xl">
        <table className="w-full border border-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-purple-700 text-white">
            <tr>
              <th className="p-3">Event Host</th>
              <th className="p-3">IPFS Hash</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 text-gray-300">
            {uploadedDocs.map((doc, index) => (
              <tr key={index} className="border-b border-gray-700">
                <td className="p-3">{doc.eventHost}</td>
                <td className="p-3">{doc.ipfsHash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StateRepDashboard;
