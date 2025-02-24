# Blockchain-Event-Tracking-system
# Aptos NFT Ticketing System

This project is a blockchain-powered ticketing system built on the **Aptos blockchain** using **Move smart contracts**. Each ticket is minted as an **NFT**, preventing fraud and ensuring authenticity. A secondary marketplace enforces price controls and royalties for event organizers.

The frontend is built using **HTML, CSS, and JavaScript**, integrating **Petra Wallet** for Aptos blockchain interactions. The backend uses **SQLite3** for storing ticket metadata.

## Features

- **Move Smart Contracts**: Secure, Aptos-based NFT ticketing system.
- **Petra Wallet Integration**: Users can connect their Aptos wallets or create one if they are new.
- **Blockchain-Based Ownership**: Each ticket is a unique NFT (non-fungible token).
- **Secondary Marketplace**: Resale price limits and royalties for event organizers.
- **SQLite3 Database**: Stores ticket metadata for easy querying.

---

## External Dependencies

### **Aptos & Move Dependencies**
- **Aptos CLI** – To interact with the Aptos blockchain.
- **Move Prover & Framework** – To compile and deploy Move contracts.
- **Aptos SDK (JavaScript)** – Connects the frontend to Aptos.
- **Petra Wallet Extension** – Used for wallet authentication and creation.

### **Frontend (HTML, CSS, JS)**
Include the following in your HTML:
- **Aptos SDK (via CDN)**:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/@aptos-labs/aptos"></script>
Petra Wallet API:
<script src="https://unpkg.com/@aptos-labs/wallet-adapter"></script>
Backend / Database
Install via npm:
npm install express sqlite3


Installation
1. Install Aptos CLI
curl -sSfL https://aptos.dev/tools/install.sh

3. Set Up the Move Smart Contract
aptos init --profile dev
mkdir -p move/contracts
cd move/contracts

4. Create the Move Smart Contract

5. Compile & Deploy Move Contract
aptos move compile --named-addresses ticket_nft=default
aptos move publish --profile dev

5. Set Up the Frontend
Create the frontend directory and files:
mkdir -p public && cd public
touch index.html styles.css app.js

7. Configure Frontend (Connect to and Create a Petra Wallet)
In your public/app.js, include the following code to check for Petra Wallet installation and connect to it:

javascript
Copy
Edit
// Immediately invoked function to set up wallet connection
(async function() {
  // Check if Petra Wallet is available
  if (typeof window.aptos === "undefined") {
    alert("Petra Wallet is not installed. Please install it from https://petra.app/ to continue.");
    // Optionally, redirect to Petra Wallet download page:
    // window.location.href = "https://petra.app/";
    return;
  }

  // Create a client for Aptos
  const client = new Aptos.AptosClient("https://fullnode.devnet.aptoslabs.com");

  // Function to connect to Petra Wallet
  async function connectWallet() {
    try {
      const petra = window.aptos;
      // If not connected, request connection
      if (!petra.isConnected) {
        const response = await petra.connect();
        console.log("Connected with account:", response.address);
      }
      document.getElementById("status").innerText = "Wallet Connected";
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert("Failed to connect to Petra Wallet.");
    }
  }

  // Bind connectWallet to the button click
  document.getElementById("connectBtn").addEventListener("click", connectWallet);
})();
In your public/index.html, include:

html
Copy
Edit
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aptos NFT Ticketing</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Aptos NFT Ticketing</h1>
  <button id="connectBtn">Connect Wallet</button>
  <p id="status">Wallet Not Connected</p>
  <!-- Include necessary scripts -->
  <script src="https://cdn.jsdelivr.net/npm/@aptos-labs/aptos"></script>
  <script src="https://unpkg.com/@aptos-labs/wallet-adapter"></script>
  <script src="app.js"></script>
</body>
</html>
7. Set Up the Backend Server
Create a server.js file in the project root with the following content:

javascript
Copy
Edit
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 3000;

// Initialize SQLite3 database
const db = new sqlite3.Database("./tickets.db", (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    db.run(`CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tokenId INTEGER,
      owner TEXT,
      metadataURI TEXT
    )`, (err) => {
      if (err) console.error("Error creating table:", err);
    });
  }
});

// Middleware to parse JSON bodies
app.use(express.json());

// Example endpoint to store minted ticket details
app.post("/tickets", (req, res) => {
  const { tokenId, owner, metadataURI } = req.body;
  db.run(`INSERT INTO tickets (tokenId, owner, metadataURI) VALUES (?, ?, ?)`,
    [tokenId, owner, metadataURI],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).send("Database error");
      }
      res.send({ id: this.lastID });
    }
  );
});

// Serve static files from the 'public' directory
app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
8. Run the Backend Server
sh
Copy
Edit
node server.js
Usage
Open the Web App

Navigate to http://localhost:3000 in your browser.
If you are a first-time user, you will be prompted to install Petra Wallet. Follow the alert instructions or visit Petra Wallet to download it.
Once installed, click "Connect Wallet" to link your wallet to the web app.
Mint NFT Tickets

Use the provided interface to mint new NFT tickets by entering the metadata URI and maximum resale price.
The Move smart contract on Aptos handles the minting process.
Smart Contract Interaction

The Move smart contract manages minting and resale logic (price caps and royalties) on-chain.
Resale transactions can be initiated via Aptos transactions through the web interface or using developer tools.
Database Integration

The Express backend stores metadata for each minted ticket in a SQLite3 database.
Project Structure
bash
Copy
Edit
/nft-ticketing
│
├── move
│   ├── contracts
│   │   └── ticket_nft.move   # Move Smart Contract for NFT Tickets
│
├── public
│   ├── index.html            # Frontend HTML file
│   ├── styles.css            # Frontend CSS file
│   └── app.js                # Frontend JavaScript (Petra Wallet + Aptos integration)
│
├── server.js                 # Express backend server with SQLite3 integration
├── package.json              # Node.js dependencies and scripts
└── .env                      # Environment variables (e.g., Aptos network settings)
License
This project is licensed under the MIT License.

pgsql
Copy
Edit

You can now save the above content as `README.md` in your project root. This file contains all the necessary information, installation steps, and code examples to set up and run your Aptos NFT Ticketing System with Move smart contracts, Petra Wallet integration, a static frontend, and a SQLite3 backend.
