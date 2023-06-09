// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor() ERC20("TestToken", "TEST") {
        _mint(msg.sender, 1000000000000000000000000); // Mint 1,000,000 tokens to the contract deployer
    }
}
