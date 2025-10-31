// Import the 'fs/promises' for async file operations and 'path' for handling file paths.
const fs = require("fs").promises;
const path = require("path");

/**
 * The URL for the CS:GO music kits API.
 * @type {string}
 */
const MUSIC_KITS_API_URL =
  "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/music_kits.json";

/**
 * The name for the output file that will contain the filtered data.
 * @type {string}
 */
const OUTPUT_FILE_NAME = "music_kits.json";

/**
 * Fetches all music kits, removes StatTrak™ versions, and saves the result to a file.
 */
async function filterAndWriteMusicKits() {
  console.log("Starting the music kit filtering process...");

  try {
    // 1. Fetch the data from the URL
    console.log(`Fetching data from ${MUSIC_KITS_API_URL}...`);
    const response = await fetch(MUSIC_KITS_API_URL);

    // Check if the network request was successful
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    // Parse the JSON response into a JavaScript array
    const allMusicKits = await response.json();
    console.log(
      `Successfully fetched ${allMusicKits.length} total music kit entries.`
    );

    // 2. Filter the array to remove StatTrak™ items
    // We keep an item only if its name does NOT start with 'StatTrak™'.
    console.log("Filtering out StatTrak™ items...");
    const nonStatTrakKits = allMusicKits.filter((kit) => {
      // The `startsWith()` method is a clean way to check the beginning of a string.
      return !kit.name.startsWith("StatTrak™");
    });

    console.log(
      `Filtering complete. ${nonStatTrakKits.length} non-StatTrak™ items remain.`
    );

    // 3. Prepare the filtered data for writing
    // JSON.stringify with null and 2 "pretty-prints" the JSON for better readability.
    const fileContent = JSON.stringify(nonStatTrakKits, null, 2);

    // 4. Write the new JSON to a file
    const outputPath = path.join(process.cwd(), "data", OUTPUT_FILE_NAME);
    console.log(`Writing filtered data to ${outputPath}...`);

    await fs.writeFile(outputPath, fileContent, "utf8");

    console.log(
      `\n✅ Success! The filtered music kits have been saved to ${OUTPUT_FILE_NAME}.`
    );
  } catch (error) {
    console.error("\n❌ An error occurred during the process:", error);
  }
}

// Execute the main function
filterAndWriteMusicKits();
