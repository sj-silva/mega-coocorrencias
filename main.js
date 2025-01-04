let currentNumber = -1;
let currentFilter = "historical";

async function getDatabase() {
  try {
    // Define the path to the JSON file in the 'database' folder
    const dataPath =
      "https://sj-silva.github.io/mega-sena-consulta/database/lottery-results.json";

    // Fetch the file
    const response = await fetch(dataPath);

    // Check if the fetch was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch database: ${response.statusText}`);
    }
    // Parse and return the JSON content
    return await response.json();
  } catch (error) {
    console.error("Error fetching the database file:", error);
    throw error; // Re-throw the error for the caller to handle
  }
}

function setDefaultFilter() {
  // Find and activate the historical filter button
  const historicalButton = document.querySelector('[data-filter="historical"]');
  if (historicalButton) {
    historicalButton.classList.add("active");
  }
}

function createNumberBoard() {
  const board = document.getElementById("board");

  // Generate the numbers dynamically
  for (let n = 1; n <= 60; n++) {
    const btn = document.createElement("button");
    btn.textContent = n;
    btn.classList.add("number");
    btn.onclick = () => toggleSelectedNumber(btn, n);
    btn.addEventListener("click", () => handleNumberClick(n));
    board.appendChild(btn);
  }
  setDefaultFilter();
}

function toggleSelectedNumber(button, number) {
  // Remove a classe 'selected-number' de todos os botões
  document.querySelectorAll(".number").forEach((btn) => {
    btn.classList.remove("selected-number");
  });
  button.classList.add("selected-number");
}

// Handle board's number click
function handleNumberClick(number) {
  currentNumber = number;

  // Simulate fetching data or update UI with coocorrence data
  calculateCorrelation(currentFilter, currentNumber);
  updateTableTitle(currentNumber, currentFilter);
}

function updateTableTitle(number, filter) {
  let filterText = "";

  // Definir o texto do filtro com base na seleção
  switch (filter) {
    case "historical":
      filterText = "Histórico Completo";
      break;
    case "last100":
      filterText = "Últimos 100 Sorteios";
      break;
    case "last50":
      filterText = "Últimos 50 Sorteios";
      break;
    case "last10":
      filterText = "Últimos 10 Sorteios";
      break;
    case "currentYear":
      filterText = "Últimos 12 Meses";
      break;
    case "last3Years":
      filterText = "Últimos 3 Anos";
      break;
    case "last5Years":
      filterText = "Últimos 5 Anos";
      break;
    case "last10Years":
      filterText = "Últimos 10 Anos";
      break;
    default:
      filterText = "Intervalo Desconhecido";
  }
  // Atualizar o título da tabela
  const tableTitle = document.querySelector("#table-title");
  tableTitle.textContent = `Tabela de Coocorrências do número ${number} (${filterText})`;
}

async function calculateCorrelation(filter, selectedNumber) {
  let frequencies = Array(60).fill(0); // Reset frequencies
  const data = await getDatabase();

  let filteredResults = data.allResults;

  switch (filter) {
    case "last100":
      filteredResults = filteredResults.slice(-100);
      break;
    case "last50":
      filteredResults = filteredResults.slice(-50);
      break;
    case "last10":
      filteredResults = filteredResults.slice(-10);
      break;
    case "currentYear":
      filteredResults = filteredResults.slice(-104);
      break;
    case "last3Years":
      // 3 anos: 312 sorteios
      filteredResults = filteredResults.slice(-312);
      break;
    case "last5Years":
      // 5 anos: 520 sorteios
      filteredResults = filteredResults.slice(-520);
      break;
    case "last10Years":
      // 10 anos: 1040 sorteios
      filteredResults = filteredResults.slice(-1040);
      break;
    default:
      break;
  }

  filteredResults.forEach((result) => {
    const balls = [
      result.Bola1,
      result.Bola2,
      result.Bola3,
      result.Bola4,
      result.Bola5,
      result.Bola6,
    ];
    if (balls.includes(selectedNumber)) {
      balls.forEach((num) => {
        if (num !== selectedNumber) {
          frequencies[num - 1]++;
        }
      });
    }
  });

  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = ""; // Clear existing rows

  // Combine numbers with frequencies and sort by frequency
  const frequencyData = frequencies.map((frequency, index) => ({
    number: index + 1,
    frequency: frequency,
  }));

  frequencyData.sort((a, b) => b.frequency - a.frequency); // descending order

  frequencyData.forEach((data, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}º</td> <!-- Posição -->
      <td>${data.number}</td>
      <td>${data.frequency}</td>
    `;
    tableBody.appendChild(row);
  });

  const tableResult = document.querySelector("#table-section");
  tableResult.style.display = "block";
  // Scroll to the table section
  tableResult.scrollIntoView({
    behavior: "smooth", // For smooth scrolling
    block: "start", // Aligns the section to the start of the viewport
  });
}

async function fetchLastResult() {
  data = await getDatabase();

  // Extract the last result
  const lastResult = data.allResults[data.allResults.length - 1];
  lastMegaGame = [
    lastResult.Bola1,
    lastResult.Bola2,
    lastResult.Bola3,
    lastResult.Bola4,
    lastResult.Bola5,
    lastResult.Bola6,
  ];
  // Update HTML elements with the last result
  document.getElementById("concurso").textContent = lastResult.Concurso;
  document.getElementById("date").textContent = formatDateToPortuguese(
    lastResult["Data do Sorteio"]
  );
  document.getElementById("bola1").textContent = lastResult.Bola1;
  document.getElementById("bola2").textContent = lastResult.Bola2;
  document.getElementById("bola3").textContent = lastResult.Bola3;
  document.getElementById("bola4").textContent = lastResult.Bola4;
  document.getElementById("bola5").textContent = lastResult.Bola5;
  document.getElementById("bola6").textContent = lastResult.Bola6;
  document.getElementById("lastConcurso").textContent = lastResult.Concurso;
}

function formatDateToPortuguese(dateString) {
  // Split the dateString (DD/MM/YYYY) to extract day, month, and year
  const [day, month, year] = dateString.split("/");

  // Create a new Date object using the extracted values
  const date = new Date(`${year}-${month}-${day}`);

  // Format the date to the desired string in Portuguese
  const formattedDate = date.toLocaleDateString("pt-BR", {
    weekday: "long", // Full name of the day (e.g., "Sábado")
    day: "numeric", // Numeric day (e.g., "28")
    month: "long", // Full name of the month (e.g., "Setembro")
    year: "numeric", // Full year (e.g., "2024")
  });

  // Capitalize the first letter of the weekday
  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}

// Handle all Filter's Buttons
document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", (event) => {
    if (currentNumber > 0) {
      // Remove active class from all buttons
      document
        .querySelectorAll(".filter-button")
        .forEach((btn) => btn.classList.remove("active"));

      // Add active class to the clicked button
      event.target.classList.add("active");

      // Get the filter type from the data attribute
      currentFilter = event.target.getAttribute("data-filter");

      // Call calculateCorrelation with the selected filter
      calculateCorrelation(currentFilter, currentNumber);
      updateTableTitle(currentNumber, currentFilter);
    } else {
      showToast();
    }
  });
});

function showToast() {
  // Show the toast
  const toastElement = document.getElementById("alertToast");
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}

// -- Load Functions --
createNumberBoard();
fetchLastResult();
