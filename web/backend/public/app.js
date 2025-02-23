let walletAddress = null;
const connectWalletBtn = document.getElementById("connectWalletBtn");
const walletAddressSpan = document.getElementById("walletAddress");
const ticketForm = document.getElementById("ticketForm");
const eventList = document.getElementById("eventList");
const bookedTicketsList = document.getElementById("bookedTicketsList");
const messageDiv = document.getElementById("message");
const bookTicketBtn = document.getElementById("bookTicketBtn");

// Connect to Petra Wallet
async function connectWallet() {
    if (typeof window.aptos === "undefined") {
        alert("Petra Wallet not detected. Please install it.");
        window.open("https://petra.app/", "_blank"); // Open Petra Wallet website
        return;
    }

    try {
        const response = await window.aptos.connect();
        walletAddress = response.address;
        walletAddressSpan.textContent = `Connected: ${walletAddress}`;
        connectWalletBtn.textContent = "Disconnect Wallet";
        messageDiv.textContent = "Wallet connected successfully!";
        messageDiv.style.color = "green";
        console.log("Wallet Connected:", walletAddress);
    } catch (error) {
        console.error("Failed to connect wallet:", error);
        messageDiv.textContent = "Failed to connect wallet. Please try again.";
        messageDiv.style.color = "red";
    }
}

// Disconnect Petra Wallet
async function disconnectWallet() {
    if (typeof window.aptos === "undefined") {
        console.log("Petra Wallet not found.");
        return;
    }

    try {
        await window.aptos.disconnect();
        walletAddress = null;
        walletAddressSpan.textContent = "Not Connected";
        connectWalletBtn.textContent = "Connect Wallet";
        messageDiv.textContent = "Wallet disconnected successfully!";
        messageDiv.style.color = "green";
        console.log("Wallet Disconnected");
    } catch (error) {
        console.error("Failed to disconnect wallet:", error);
        messageDiv.textContent = "Failed to disconnect wallet. Please try again.";
        messageDiv.style.color = "red";
    }
}

// Fetch events from the backend
async function fetchEvents() {
    try {
        const response = await fetch("/events");
        const events = await response.json();
        eventList.innerHTML = ""; // Clear previous events

        events.forEach(event => {
            const li = document.createElement("li");
            li.textContent = `Event ID: ${event.id}, Name: ${event.name}, Price: ${event.price} APT`;
            eventList.appendChild(li);
        });
    } catch (error) {
        console.error("Failed to fetch events:", error);
        messageDiv.textContent = "Failed to fetch events. Please try again.";
        messageDiv.style.color = "red";
    }
}

// Fetch and display booked tickets
async function fetchBookedTickets() {
    try {
        const response = await fetch("/booked-tickets");
        const tickets = await response.json();
        bookedTicketsList.innerHTML = ""; // Clear previous tickets

        tickets.forEach(ticket => {
            const li = document.createElement("li");
            li.textContent = `Event ID: ${ticket.eventId}, Amount: ${ticket.amount} APT, Wallet: ${ticket.walletAddress}, Date: ${ticket.timestamp}`;
            bookedTicketsList.appendChild(li);
        });
    } catch (error) {
        console.error("Failed to fetch booked tickets:", error);
        messageDiv.textContent = "Failed to fetch booked tickets. Please try again.";
        messageDiv.style.color = "red";
    }
}

// Handle ticket booking
ticketForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!walletAddress) {
        alert("Please connect your wallet first.");
        return;
    }

    const eventId = document.getElementById("eventId").value; // Event ID is the recipient's wallet address
    const ticketPrice = parseFloat(document.getElementById("ticketPrice").value);

    if (!eventId || isNaN(ticketPrice) || ticketPrice <= 0) {
        alert("Please fill in all fields correctly.");
        return;
    }

    try {
        // Disable button and show loading state
        bookTicketBtn.disabled = true;
        bookTicketBtn.textContent = "Processing...";

        // Step 1: Transfer APT for the ticket
        const transferPayload = {
            type: "entry_function_payload",
            function: "0x1::coin::transfer",
            arguments: [eventId, ticketPrice], // Send APT to the event ID (recipient's wallet address)
            type_arguments: ["0x1::aptos_coin::AptosCoin"],
        };

        console.log("Transfer Payload:", transferPayload);

        const transferResponse = await window.aptos.signAndSubmitTransaction(transferPayload);
        console.log("APT Transferred Successfully:", transferResponse);

        // Step 2: Save the booked ticket details to the database
        const saveResponse = await fetch("/book-ticket", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ walletAddress, eventId, ticketPrice }),
        });

        if (!saveResponse.ok) {
            throw new Error("Failed to save ticket details.");
        }

        // Show success message
        messageDiv.textContent = "Ticket booked successfully! APT transferred to the event organizer.";
        messageDiv.style.color = "green";

        // Refresh the booked tickets list
        fetchBookedTickets();
    } catch (error) {
        console.error("Failed to book ticket:", error);
        messageDiv.textContent = "Failed to book ticket. Please try again.";
        messageDiv.style.color = "red";
    } finally {
        // Re-enable button
        bookTicketBtn.disabled = false;
        bookTicketBtn.textContent = "Book Ticket";
    }
});

// Connect/Disconnect wallet button
connectWalletBtn.addEventListener("click", () => {
    if (walletAddress) {
        disconnectWallet();
    } else {
        connectWallet();
    }
});

// Fetch events and booked tickets when the page loads
window.onload = () => {
    fetchEvents();
    fetchBookedTickets();
};