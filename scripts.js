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
  document.getElementById("numberDisplay").textContent = `$top #${currentNumber}`;
  toggleButton("removeButton", true);
}

function removeNumber() {
  if (currentNumber !== null) {
    pool = pool.filter(num => num !== currentNumber);
    removedNumber = currentNumber;
    currentNumber = null;
    document.getElementById("numberDisplay").textContent = "$top #?";
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
    <div>
      <input type="text" value="${player.name}" 
        oninput="updatePlayerName(${player.id}, this.value)" placeholder="Player Name">
      ${roles.map(role => `
        <div>
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
    <div>
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
