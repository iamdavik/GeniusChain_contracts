pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";

contract TicketSystem {
    IERC20 public tokenContract; // ERC20 Token contract instance
    AggregatorV3Interface public priceFeed; // Chainlink price feed

    event TicketsIssued(
        address indexed user,
        uint256 amount,
        uint256 ticketAmount
    );

    // Set the token contract address in the constructor
    constructor(address _tokenContract, address _priceFeed) {
        tokenContract = IERC20(_tokenContract);
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function getLatestPrice() public view returns (int) {
        (
            uint80 roundID, 
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return price;
    }

    function deposit(uint256 _amount) public {
        // Check that the amount is greater than zero
        require(_amount > 0, "Token amount provided must be greater than 0");

        // Check that user has sufficient balance
        require(
            tokenContract.balanceOf(msg.sender) >= _amount,
            "Insufficient token balance"
        );

        // Transfer tokens from the user to the contract
        tokenContract.transferFrom(msg.sender, address(this), _amount);

        // Get the latest price
        int price = getLatestPrice();

        // Check if price is greater than zero
        require(price > 0, "Price must be greater than 0");

        // Calculate the USD value of the deposited tokens (ignoring decimals for simplicity)
        // Convert the price to a uint256 and adjust for the price feed's 8 decimal places
        uint256 usdValue = _amount * uint256(price) / 10**8;

        // Issue tickets based on the USD value
        uint256 ticketAmount = usdValue * 10; // Assuming that a user gets 10 tickets for every USD

        // Emit an event to communicate the ticket issuance to the off-chain system
        emit TicketsIssued(msg.sender, _amount, ticketAmount);
    }
}
