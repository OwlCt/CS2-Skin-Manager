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
 * Converts team string ID to numeric ID
 * @param {string} teamId - "terrorists" or "counter-terrorists"
 * @returns {number} - 2 for Terrorists, 3 for Counter-Terrorists
 */
function convertTeamId(teamId) {
  if (teamId === "terrorists") return 2;
  if (teamId === "counter-terrorists") return 3;
  return 0; // Unknown
}

/**
 * Transforms API agent data to match the app's expected format
 */
function transformAgentsData(apiAgents) {
  return apiAgents.map((agent) => ({
    team: convertTeamId(agent.team?.id),
    image: agent.image,
    model: agent.model,
    agent_name: agent.name,
  }));
}

/**
 * Fetches agent data, transforms it, and writes the result to a JSON file.
 */
async function fetchAndWriteAgents() {
  console.log("Starting agent processing...");

  try {
    // 1. Fetch the data from the API
    console.log(`Fetching agent data from ${AGENTS_API_URL}...`);
    const response = await fetch(AGENTS_API_URL);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const apiAgents = await response.json();
    console.log(`Successfully fetched ${apiAgents.length} agents.`);

    // 2. Transform the agents to match app format
    const transformedAgents = transformAgentsData(apiAgents);
    console.log(`Transformed ${transformedAgents.length} agents.`);

    // 3. Log team statistics
    const teamCounts = transformedAgents.reduce((acc, agent) => {
      const teamId = agent.team;
      const teamName = teamId === 2 ? "Terrorists (T)" : teamId === 3 ? "Counter-Terrorists (CT)" : "Unknown";
      acc[teamName] = (acc[teamName] || 0) + 1;
      return acc;
    }, {});

    console.log("\nAgent counts by team:");
    for (const [teamName, count] of Object.entries(teamCounts)) {
      console.log(`- ${teamName}: ${count} agents`);
    }

    // 4. Prepare the data for writing to a file (pretty-printed JSON)
    const fileContent = JSON.stringify(transformedAgents, null, 2);

    // 5. Define the output path and write the file
    const outputPath = path.join(process.cwd(), "data", OUTPUT_FILE_NAME);

    console.log(`\nWriting agent data to ${outputPath}...`);
    await fs.writeFile(outputPath, fileContent, "utf8");

    console.log(
      "\n✅ Success! The agent data has been written to agents.json."
    );
  } catch (error) {
    console.error("\n❌ An error occurred during the process:", error);
  }
}

// Run the main function
fetchAndWriteAgents();
