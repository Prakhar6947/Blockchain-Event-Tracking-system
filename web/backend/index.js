require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { AptosClient, AptosAccount, HexString } = require("aptos");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Aptos client setup
const APTOS_NODE_URL = process.env.APTOS_NODE_URL || "https://fullnode.devnet.aptoslabs.com";
const aptosClient = new AptosClient(APTOS_NODE_URL);

// Admin account for signing transactions
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not set in the environment variables. Please check your .env file.");
}
const adminAccount = new AptosAccount(HexString.ensure(PRIVATE_KEY).toUint8Array());

// SQLite database setup
const db = new sqlite3.Database("./tickets.db", (err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
    } else {
        console.log("Connected to the SQLite database.");
        db.run(`
            CREATE TABLE IF NOT EXISTS booked_tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                eventId TEXT NOT NULL,
                amount REAL NOT NULL,
                walletAddress TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }
});

// Root route (optional, since index.html will be served by default)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API: Fetch all events
app.get("/events", async (req, res) => {
    try {
        const events = await fetchEvents();
        res.json(events);
    } catch (error) {
        console.error("Failed to fetch events:", error);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});

// API: Book a ticket
app.post("/book-ticket", async (req, res) => {
    const { walletAddress, eventId, ticketPrice } = req.body;

    if (!walletAddress || !eventId || !ticketPrice) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Save the booked ticket details to the database
        db.run(
            "INSERT INTO booked_tickets (eventId, amount, walletAddress) VALUES (?, ?, ?)",
            [eventId, ticketPrice, walletAddress],
            (err) => {
                if (err) {
                    console.error("Failed to save ticket to database:", err);
                    return res.status(500).json({ error: "Failed to save ticket details" });
                }

                console.log("Ticket details saved to database.");
                res.json({ message: "Ticket booked successfully" });
            }
        );
    } catch (error) {
        console.error("Failed to book ticket:", error);
        res.status(500).json({ error: "Failed to book ticket" });
    }
});

// API: Fetch booked tickets
app.get("/booked-tickets", (req, res) => {
    db.all("SELECT * FROM booked_tickets ORDER BY timestamp DESC", (err, rows) => {
        if (err) {
            console.error("Failed to fetch booked tickets:", err);
            return res.status(500).json({ error: "Failed to fetch booked tickets" });
        }
        res.json(rows);
    });
});

// Fetch events from the blockchain
async function fetchEvents() {
    // Replace with the correct resource path or function to fetch events
    const events = await aptosClient.getAccountResource(
        adminAccount.address(),
        "ticket_booking::event_tickets::EventStore" // Example resource path
    );
    return events;
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});