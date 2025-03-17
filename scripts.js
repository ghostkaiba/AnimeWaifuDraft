// Global Variables
let pool = [];
let currentNumber = null;
let removedNumber = null;
let players = [];
const maxPlayers = 10;
const roles = [
  "Captain", "Vice Captain", "Ace", "Flex 1", "Tank", 
  "Wildcard", "Mascot", "Flex 2", "Wife/Husband", "Crazy Ex"
];

// Random Number Generator Functions
function setRange() {
  const min = parseInt(document.getElementById("minValue").value) || 1;
  const max = parseInt(document.getElementById("maxValue").value) || 100;

  if (min >= max) {
    alert("Minimum value must be less than maximum value.");
    return;
  }

  pool = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  alert(`Range set: ${min} to ${max}`);
}

function generateNumber() {
  if (pool.length === 0) {
    alert("No numbers left! Set a valid range first.");
    return;
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  currentNumber = pool[randomIndex];
  // Display the number in the format $top #"generated number"
  document.getElementById("numberDisplay").textContent = `$top #\"${currentNumber}\"`;
  toggleButton("removeButton", true);
}


function removeNumber() {
  if (currentNumber !== null) {
    pool = pool.filter(num => num !== currentNumber);
    removedNumber = currentNumber;
    currentNumber = null;
    document.getElementById("numberDisplay").textContent = "#?";
    toggleButton("removeButton", false);
    toggleButton("addButton", true);
  }
}

function addNumberBack() {
  if (removedNumber !== null) {
    pool.push(removedNumber);
    removedNumber = null;
    toggleButton("addButton", false);
  }
}


// Player Draft Board Functions
function addPlayer() {
  if (players.length >= maxPlayers) {
    alert("Max players reached!");
    return;
  }

  players.push({ id: players.length + 1, name: `Player ${players.length + 1}`, roles: {} });
  renderPlayers();
}

function removePlayer() {
  if (players.length > 0) {
    players.pop();
    renderPlayers();
  }
}

function shufflePlayers() {
  for (let i = players.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [players[i], players[j]] = [players[j], players[i]];
  }
  renderPlayers();
}

function updatePlayerName(id, name) {
  const player = players.find(p => p.id === id);
  if (player) {
    player.name = name;
    renderSummary();
  }
}

function updateRole(id, role, value) {
  const player = players.find(p => p.id === id);
  if (player) {
    player.roles[role] = value;
    renderSummary();
  }
}

// Render Functions
function renderPlayers() {
  const board = document.getElementById("playerBoard");
  board.innerHTML = players.map(player => `
    <div class="player-card">
      <input type="text" value="${player.name}" 
        oninput="updatePlayerName(${player.id}, this.value)" placeholder="Player Name">
      ${roles.map(role => `
        <div class="role-input">
          <label>${role}:</label>
          <input type="text" 
            oninput="updateRole(${player.id}, '${role}', this.value)" placeholder="Assign Role">
        </div>
      `).join('')}
    </div>
  `).join('');
}

function renderSummary() {
  const summaryBoard = document.getElementById("summaryBoard");
  summaryBoard.innerHTML = players.map(player => `
    <div class="summary-card">
      <h3>${player.name}</h3>
      ${Object.entries(player.roles).map(([role, value]) => `
        <p><strong>${role}:</strong> ${value || "N/A"}</p>
      `).join('')}
    </div>
  `).join('');
}

// Utility Functions
function toggleButton(id, enable) {
  document.getElementById(id).disabled = !enable;
}

async function searchWaifu() {
  const query = document.getElementById("searchInput").value.trim();
  const resultsContainer = document.getElementById("searchResults");

  if (!query) {
    resultsContainer.innerHTML = "";
    return;
  }

  try {
    // Define GraphQL query
    const graphqlQuery = {
      query: `
        query ($search: String) {
          Page(perPage: 5) {
            characters(search: $search) {
              id
              name {
                full
                native
              }
              image {
                medium
              }
              media {
                nodes {
                  title {
                    romaji
                    english
                  }
                }
              }
            }
          }
        }
      `,
      variables: { search: query },
    };

    // Fetch data from AniList API
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    });

    const data = await response.json();
    const characters = data.data.Page.characters;

    // Render search results
    resultsContainer.innerHTML = characters.map(character => `
      <div>
        <img src="${character.image.medium}" alt="${character.name.full}" style="width:50px; border-radius:8px;">
        <h3>${character.name.full} (${character.name.native || "N/A"})</h3>
        <p><strong>Appears in:</strong> ${character.media.nodes.map(media => media.title.romaji).join(", ") || "Unknown"}</p>
      </div>
    `).join("");
  } catch (error) {
    resultsContainer.innerHTML = "<p>Failed to fetch data. Please try again later.</p>";
    console.error("Error fetching character data:", error);
  }
}


