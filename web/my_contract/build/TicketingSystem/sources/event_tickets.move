module ticket_booking::event_tickets {
    use std::signer;
    use std::string;
    use std::vector;
    use std::bcs; // Import the bcs module

    // Event structure
    struct Event has key {
        id: u64,
        name: string::String,
        price: u64,
        total_tickets: u64,
        sold_tickets: u64,
    }

    // Ticket structure
    struct Ticket has key {
        owner: address,
        event_id: u64,
        nft_id: u64,
    }

    // NFT structure
    struct NFT has key {
        id: u64,
        metadata: string::String,
    }

    // Constants
    const E_NO_TICKETS: u64 = 1001; // Error code for no tickets available
    const E_INSUFFICIENT_FUNDS: u64 = 1002; // Error code for insufficient funds

    // Create a new event
    public fun create_event(
        creator: &signer,
        name: string::String,
        price: u64,
        total_tickets: u64,
    ) {
        let event_id = generate_event_id(creator);
        let event = Event {
            id: event_id,
            name,
            price,
            total_tickets,
            sold_tickets: 0,
        };
        move_to(creator, event); // Store the event in the creator's account
    }

    // Buy a ticket and mint an NFT
    public fun buy_ticket(
        buyer: &signer,
        event: &mut Event,
    ): Ticket {
        // Check if tickets are available
        assert!(event.sold_tickets < event.total_tickets, E_NO_TICKETS);

        // Check if the buyer has enough funds
        //let buyer_balance = coin::balance<coin::CoinStore>(signer::address_of(buyer));
        //assert!(buyer_balance >= event.price, E_INSUFFICIENT_FUNDS);

        // Increment sold tickets
        event.sold_tickets = event.sold_tickets + 1;

        // Mint an NFT for the ticket
        let nft_id = mint_nft(buyer, event.id);

        // Create and return the ticket
        Ticket {
            owner: signer::address_of(buyer),
            event_id: event.id,
            nft_id,
        }
    }

    // Mint an NFT for a ticket
    fun mint_nft(
        buyer: &signer,
        event_id: u64,
    ): u64 {
        let nft_id = generate_nft_id(buyer, event_id);
        let metadata = string::utf8(b"Ticket for Event ID: "); // Simple metadata
        move_to(buyer, NFT { id: nft_id, metadata }); // Store the NFT in the buyer's account
        nft_id
    }

    // Generate a unique event ID
    fun generate_event_id(creator: &signer): u64 {
        // Convert the creator's address to a u64
        address_to_u64(signer::address_of(creator))
    }

    // Generate a unique NFT ID
    fun generate_nft_id(
        buyer: &signer,
        event_id: u64,
    ): u64 {
        // Convert the buyer's address to a u64 and combine with event_id
        let buyer_u64 = address_to_u64(signer::address_of(buyer));
        buyer_u64 + event_id
    }

    // Helper function to convert address to u64
    fun address_to_u64(addr: address): u64 {
        let addr_bytes = address_to_bytes(addr);
        let hex_string = remove_0x_prefix(addr_bytes);
        parse_hex_to_u64(hex_string)
    }

    // Helper function to convert address to bytes
    fun address_to_bytes(addr: address): vector<u8> {
        bcs::to_bytes(&addr)
    }

    // Helper function to remove "0x" prefix
    fun remove_0x_prefix(bytes: vector<u8>): vector<u8> {
        let mut_bytes = bytes; // Create a mutable copy of the vector
        if (vector::length(&mut_bytes) >= 2 && *vector::borrow(&mut_bytes, 0) == 48 && *vector::borrow(&mut_bytes, 1) == 120) {
            vector::remove(&mut mut_bytes, 0); // Remove '0'
            vector::remove(&mut mut_bytes, 0); // Remove 'x'
        };
        mut_bytes
    }

    // Helper function to parse hex string into u64
    fun parse_hex_to_u64(hex_bytes: vector<u8>): u64 {
        let result: u64 = 0;
        let i = 0;
        while (i < vector::length(&hex_bytes)) {
            let byte = *vector::borrow(&hex_bytes, i);
            let digit = hex_char_to_u8(byte);
            result = result * 16 + (digit as u64);
            i = i + 1;
        };
        result
    }

    // Helper function to convert a hex character to its numeric value
    fun hex_char_to_u8(char: u8): u8 {
        if (char >= 48 && char <= 57) { // '0' to '9'
            char - 48
        } else if (char >= 97 && char <= 102) { // 'a' to 'f'
            char - 97 + 10
        } else if (char >= 65 && char <= 70) { // 'A' to 'F'
            char - 65 + 10
        } else {
            abort 1 // Invalid hex character
        }
    }
}