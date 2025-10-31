// Import the 'fs/promises' for async file operations and 'path' for handling file paths.
const fs = require("fs").promises;
const path = require("path");

/**
 * The URL for the CS:GO stickers API.
 * @type {string}
 */
const STICKERS_API_URL =
  "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/stickers.json";

/**
 * The name for the output file that will contain the stickers data.
 * @type {string}
 */
const OUTPUT_FILE_NAME = "stickers.json";

/**
 * Fetches all stickers and saves the result to a file.
 */
async function fetchAndWriteStickers() {
  console.log("Starting the stickers fetching process...");

  try {
    // 1. Fetch the data from the URL
    console.log(`Fetching data from ${STICKERS_API_URL}...`);
    const response = await fetch(STICKERS_API_URL);

    // Check if the network request was successful
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    // Parse the JSON response into a JavaScript array
    const allStickers = await response.json();
    console.log(
      `Successfully fetched ${allStickers.length} total sticker entries.`
    );

    // 2. Prepare the data for writing
    // JSON.stringify with null and 2 "pretty-prints" the JSON for better readability.
    const fileContent = JSON.stringify(allStickers, null, 2);

    // 3. Write the JSON to a file
    const outputPath = path.join(process.cwd(), "data", OUTPUT_FILE_NAME);
    console.log(`Writing stickers data to ${outputPath}...`);

    await fs.writeFile(outputPath, fileContent, "utf8");

    console.log(
      `\n✅ Success! The stickers have been saved to ${OUTPUT_FILE_NAME}.`
    );
  } catch (error) {
    console.error("\n❌ An error occurred during the process:", error);
  }
}

// Execute the main function
fetchAndWriteStickers();
