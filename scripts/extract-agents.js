// Import the 'fs/promises' module for modern, async file system operations
const fs = require("fs").promises;
const path = require("path");

/**
 * The URL for the CS:GO agents API.
 * @type {string}
 */
const AGENTS_API_URL =
  "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/agents.json";

/**
 * The name of the output file.
 * @type {string}
 */
const OUTPUT_FILE_NAME = "agents.json";

/**
 * Fetches agent data, categorizes them by team name, and writes the result to a JSON file.
 */
async function fetchAndWriteCategorizedAgents() {
  console.log("Starting agent processing...");

  try {
    // 1. Fetch the data from the API
    console.log(`Fetching agent data from ${AGENTS_API_URL}...`);
    const response = await fetch(AGENTS_API_URL);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const agents = await response.json();
    console.log(`Successfully fetched ${agents.length} agents.`);

    // 2. Categorize the agents using team.name as the key
    // This is the main change from the previous script.
    const categorizedAgents = agents.reduce((accumulator, agent) => {
      // Get the team name, e.g., "Counter-Terrorist" or "Terrorist"
      const teamName = agent.team.name;

      // If a key for this team name doesn't exist in our object yet, create it as an empty array.
      if (!accumulator[teamName]) {
        accumulator[teamName] = [];
      }

      // Push the current agent into the array for that team.
      accumulator[teamName].push(agent);

      // Return the accumulator for the next iteration.
      return accumulator;
    }, {}); // Start with an empty object {} to dynamically create keys.

    // 3. Log the categorization results
    console.log("\nCategorization complete. Agent counts by team:");
    for (const teamName in categorizedAgents) {
      console.log(
        `- ${teamName}: ${categorizedAgents[teamName].length} agents`
      );
    }

    // 4. Prepare the data for writing to a file (pretty-printed JSON)
    const fileContent = JSON.stringify(categorizedAgents, null, 2);

    // 5. Define the output path and write the file
    const outputPath = path.join(process.cwd(), "public", OUTPUT_FILE_NAME);

    console.log(`\nWriting categorized data to ${outputPath}...`);
    await fs.writeFile(outputPath, fileContent, "utf8");

    console.log(
      "\n✅ Success! The categorized agent data has been written to agents.json."
    );
  } catch (error) {
    console.error("\n❌ An error occurred during the process:", error);
  }
}

// Run the main function
fetchAndWriteCategorizedAgents();
