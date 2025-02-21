import fs from "fs";
import path from "path";

export default function handler(req, res) {
  // Define the path to the JSON file
  const jsonFilePath = path.join(process.cwd(), "public", "scraped_auction_data.json");

  try {
    // Read the JSON file
    const jsonData = fs.readFileSync(jsonFilePath, "utf8");
    const auctions = JSON.parse(jsonData);

    // Return the data as JSON
    res.status(200).json(auctions);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    res.status(500).json({ error: "Failed to load auction data" });
  }
}