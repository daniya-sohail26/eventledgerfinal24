import fs from "fs";
import { of as generateCID } from "ipfs-only-hash";

async function getCID(filePath) {
  try {
    // Read file correctly as a Buffer
    const fileBuffer = fs.readFileSync(filePath);

    // Generate CID using 'raw' format (same as Pinata)
    const cid = await generateCID(fileBuffer, {
      cidVersion: 1,
      rawLeaves: true,
    });

    console.log(`✅ Generated CID: ${cid}`);
  } catch (error) {
    console.error("❌ Error generating CID:", error);
  }
}

// Run for your file
getCID("DWH Lecture 07--ETL.pdf");
