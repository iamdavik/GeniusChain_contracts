// Import necessary dependencies
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TicketSystem", () => {
  const deployTicketSystem = async () => {
    const [owner, user] = await ethers.getSigners();

    // Deploy the ERC20 token contract
    const TokenContract = await ethers.getContractFactory("TestToken");
    const tokenContract = await TokenContract.deploy();

    const TicketSystem = await ethers.getContractFactory("TicketSystem");

    const ticketSystem = await TicketSystem.deploy(tokenContract.address);

    return { ticketSystem, tokenContract, owner, user };
  };

  // Test the deposit function
  describe("deposit", () => {
    it("should issue correct number of tickets for a given token amount", async () => {
      const { ticketSystem, tokenContract, owner, user } = await loadFixture(
        deployTicketSystem
      );
      // Transfer tokens to the user
      const tokenAmount = 10;
      await tokenContract.transfer(user.address, ethers.utils.parseEther("10"));
      console.log(
        "balance of user account",
        await tokenContract.balanceOf(user.address)
      );
      // Approve the TicketSystem contract to spend the user's tokens
      await tokenContract
        .connect(user)
        .approve(ticketSystem.address, ethers.utils.parseEther("10"));

      console.log(
        "allowance",
        await tokenContract.allowance(user.address, ticketSystem.address)
      );

      // Deposit tokens and get the ticket issuance event
      const depositTx = await ticketSystem.connect(user).deposit(tokenAmount);
      const depositReceipt = await depositTx.wait();
      const events = depositReceipt.events;
      const ticketsIssuedEvent = events.find(
        (event) => event.event === "TicketsIssued"
      );

      console.log(ticketsIssuedEvent.args.user);
      console.log(ticketsIssuedEvent.args.amount);

      // Assert the ticket issuance event and number of tickets issued
      expect(ticketsIssuedEvent).to.exist;
      expect(ticketsIssuedEvent.args.user).to.equal(user.address);
      expect(ticketsIssuedEvent.args.amount).to.equal(tokenAmount);

      // Calculate the expected number of tickets
      const expectedTicketAmount = tokenAmount * 10;

      // Convert the returned ticket amount to BigNumber and assert
      const returnedTicketAmount = ticketsIssuedEvent.args.ticketAmount;
      expect(returnedTicketAmount).to.equal(expectedTicketAmount);
    });
  });
});
