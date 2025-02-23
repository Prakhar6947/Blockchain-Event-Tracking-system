const { AptosClient, AptosAccount, HexString } = require("aptos");

const APTOS_NODE_URL = process.env.APTOS_NODE_URL || "https://fullnode.devnet.aptoslabs.com";
const aptosClient = new AptosClient(APTOS_NODE_URL);

// Define or pass the admin account
const PRIVATE_KEY = process.env.PRIVATE_KEY; // Ensure this is set in your .env file
if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not set in the environment variables.");
}
const adminAccount = new AptosAccount(HexString.ensure(PRIVATE_KEY).toUint8Array());

// Fetch events from the blockchain
async function fetchEvents() {
    try {
        // Replace with the correct resource path
        const events = await aptosClient.getAccountResource(
            adminAccount.address(),
            "ticket_booking::event_tickets::EventStore" // Example resource path
        );
        return events;
    } catch (error) {
        console.error("Failed to fetch events:", error);
        throw new Error("Failed to fetch events");
    }
}

// Submit a signed transaction to the blockchain
async function submitTransaction(sender, payload) {
    try {
        // Sign and submit the transaction
        const response = await aptosClient.generateSignSubmitTransaction(sender, payload);
        return response;
    } catch (error) {
        console.error("Failed to submit transaction:", error);
        throw new Error("Failed to submit transaction");
    }
}

module.exports = {
    fetchEvents,
    submitTransaction,
};