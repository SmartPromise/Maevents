// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EventTicketing {
    uint256 public eventId;
    /// @notice Counter for the next available ticket ID. Starts at 1.
    /// @dev Ticket ID 0 is reserved to indicate a non-existent ticket.
    uint256 public ticketId;


    struct Event {
        string name;
        string description; // Event description
        string imageUrl;    // Event image URL
        uint256 date;
        bool isOpen;
        uint256 totalTickets;
        uint256 ticketsSold;
        address owner;
        uint256 ticketPrice; // Price of each ticket in wei
        uint256 balance;     // Balance specific to this event
    }

    struct Ticket {
        uint256 eventId;
        address owner;
        bool hasEntered;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;

    /// @notice Emitted when a new event is created.
    /// @param eventId The ID of the newly created event.
    /// @param owner The address of the event creator.
    /// @param name The name of the event.
    /// @param date The timestamp of the event date.
    /// @param totalTickets The total number of tickets available for the event.
    /// @param ticketPrice The price of a single ticket in wei.
    event EventCreated(uint256 indexed eventId, address indexed owner, string name, uint256 date, uint256 totalTickets, uint256 ticketPrice);

    /// @notice Emitted when a ticket is successfully purchased.
    /// @param ticketId The ID of the purchased ticket.
    /// @param eventId The ID of the event the ticket belongs to.
    /// @param buyer The address of the ticket buyer.
    /// @param price The price paid for the ticket in wei.
    event TicketPurchased(uint256 indexed ticketId, uint256 indexed eventId, address buyer, uint256 price);

    /// @notice Emitted when a ticket holder successfully enters the event (marks the ticket as used).
    /// @param ticketId The ID of the ticket used for entry.
    event TicketEntered(uint256 indexed ticketId);

    constructor() {
        eventId = 1;
        ticketId = 1;
    }

    function createEvent(string memory _name, string memory _description, string memory _imageUrl, uint256 _date, uint256 _totalTickets, uint256 _ticketPrice) external{
        /// @notice Creates a new event.
        /// @dev The caller becomes the owner of the event.
        /// @param _name Name of the event.
        /// @param _description Description of the event.
        /// @param _imageUrl URL for the event's image.
        /// @param _date Unix timestamp for the event date. Must be in the future.
        /// @param _totalTickets Total number of tickets available. Must be greater than 0.
        /// @param _ticketPrice Price per ticket in wei. Must be greater than 0.
        require(_date > block.timestamp, "Event must be in the future");
        require(_totalTickets > 0, "Total tickets must be greater than 0");
        require(_ticketPrice > 0, "Ticket price must be greater than 0");

        events[eventId] = Event(_name, _description, _imageUrl, _date, true, _totalTickets, 0, msg.sender, _ticketPrice, 0);
        // Emit event with indexed owner
        emit EventCreated(eventId, msg.sender, _name, _date, _totalTickets, _ticketPrice);
        eventId++;
    }

    function purchaseTicket(uint256 _eventId) external payable returns (uint256) {
        /// @notice Allows a user to purchase a ticket for a specific event.
        /// @dev Requires the exact ticket price to be sent with the transaction.
        /// @param _eventId The ID of the event to purchase a ticket for.
        /// @return purchasedTicketId The ID of the newly purchased ticket.
        Event storage eventInfo = events[_eventId];
        require(eventInfo.isOpen, "Event is not open for ticket sales");
        require(eventInfo.ticketsSold < eventInfo.totalTickets, "No more tickets available");
        require(msg.value == eventInfo.ticketPrice, "Incorrect ticket price");

        tickets[ticketId] = Ticket(_eventId, msg.sender, false);
        eventInfo.ticketsSold++;
        eventInfo.balance += msg.value; // Update the event's balance
        emit TicketPurchased(ticketId, _eventId, msg.sender, msg.value);
        uint256 purchasedTicketId = ticketId;
        ticketId++;
        return purchasedTicketId;
    }

    function enterEvent(uint256 _ticketId) external {
        /// @notice Marks a ticket as used for event entry.
        /// @dev Can only be called by the owner of the ticket. Ticket cannot be already used.
        /// @param _ticketId The ID of the ticket to mark as entered.
        require(tickets[_ticketId].owner == msg.sender, "You don't own this ticket");
        require(!tickets[_ticketId].hasEntered, "Ticket has already been used");

        tickets[_ticketId].hasEntered = true;
        emit TicketEntered(_ticketId);
    }

    function closeEvent(uint256 _eventId) external {
        /// @notice Closes an event, preventing further ticket sales.
        /// @dev Can only be called by the event owner.
        /// @param _eventId The ID of the event to close.
        require(events[_eventId].owner == msg.sender, "Only the event owner can close the event");
        events[_eventId].isOpen = false;
    }

    function withdrawFunds(uint256 _eventId) external {
        /// @notice Allows the event owner to withdraw the funds collected from ticket sales for a specific event.
        /// @dev The event must be closed before funds can be withdrawn.
        /// @param _eventId The ID of the event to withdraw funds from.
        Event storage eventInfo = events[_eventId];
        // Checks
        require(msg.sender == eventInfo.owner, "Only the event owner can withdraw funds");
        require(!eventInfo.isOpen, "Event must be closed before withdrawing funds");
        uint256 balanceToWithdraw = eventInfo.balance;
        require(balanceToWithdraw > 0, "No funds to withdraw");

        // Effects
        eventInfo.balance = 0; // Reset the event's balance

        // Interaction
        payable(msg.sender).transfer(balanceToWithdraw);
    }

    function updateEventDetails(uint256 _eventId, string memory _name, string memory _description, string memory _imageUrl, uint256 _date, uint256 _totalTickets, uint256 _ticketPrice) external {
        /// @notice Allows the event owner to update the details of an event.
        /// @dev It's recommended to only allow updates when the event is closed to avoid inconsistencies.
        /// @param _eventId The ID of the event to update.
        /// @param _name New name for the event.
        /// @param _description New description for the event.
        /// @param _imageUrl New image URL for the event.
        /// @param _date New Unix timestamp for the event date. Must be in the future.
        /// @param _totalTickets New total number of tickets. Cannot be less than tickets already sold.
        /// @param _ticketPrice New price per ticket in wei. Must be greater than 0.
        Event storage eventInfo = events[_eventId];
        require(!eventInfo.isOpen, "Event must be closed for updates"); // Changed from isOpen to !isOpen
        require(msg.sender == eventInfo.owner, "Only the event owner can update event details");
        require(_date > block.timestamp, "New event date must be in the future");
        require(_totalTickets >= eventInfo.ticketsSold, "New total tickets cannot be less than already sold");
        require(_ticketPrice > 0, "Ticket price must be greater than 0");

        eventInfo.name = _name;
        eventInfo.description = _description;
        eventInfo.imageUrl = _imageUrl;
        eventInfo.date = _date;
        eventInfo.totalTickets = _totalTickets;
        eventInfo.ticketPrice = _ticketPrice;
    }

    function getAllEvents() external view returns (Event[] memory) {
        /// @notice Retrieves all created events.
        /// @dev WARNING: This function can become very expensive in terms of gas if there are many events.
        /// @return An array containing all Event structs.
        Event[] memory allEvents = new Event[](eventId - 1);
        for (uint256 i = 1; i < eventId; i++) {
            allEvents[i - 1] = events[i];
        }
        return allEvents;
    }
}
