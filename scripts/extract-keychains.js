// Import the 'fs/promises' for async file operations and 'path' for handling file paths.
const fs = require("fs").promises;
const path = require("path");

/**
 * The URL for the CS:GO keychains API.
 * @type {string}
 */
const KEYCHAINS_API_URL =
  "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/keychains.json";

/**
 * The name for the output file that will contain the keychains data.
 * @type {string}
 */
const OUTPUT_FILE_NAME = "keychains.json";

/**
 * Fetches all keychains and saves the result to a file.
 */
async function fetchAndWriteKeychains() {
  console.log("Starting the keychains fetching process...");

  try {
    // 1. Fetch the data from the URL
    console.log(`Fetching data from ${KEYCHAINS_API_URL}...`);
    const response = await fetch(KEYCHAINS_API_URL);

    // Check if the network request was successful
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    // Parse the JSON response into a JavaScript array
    const allKeychains = await response.json();
    console.log(
      `Successfully fetched ${allKeychains.length} total keychain entries.`
    );

    // 2. Prepare the data for writing
    // JSON.stringify with null and 2 "pretty-prints" the JSON for better readability.
    const fileContent = JSON.stringify(allKeychains, null, 2);

    // 3. Write the JSON to a file
    const outputPath = path.join(process.cwd(), "data", OUTPUT_FILE_NAME);
    console.log(`Writing keychains data to ${outputPath}...`);

    await fs.writeFile(outputPath, fileContent, "utf8");

    console.log(
      `\n✅ Success! The keychains have been saved to ${OUTPUT_FILE_NAME}.`
    );
  } catch (error) {
    console.error("\n❌ An error occurred during the process:", error);
  }
}

// Execute the main function
fetchAndWriteKeychains();
