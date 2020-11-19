pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract piUSDConflux777 is ERC777 {
// contract piUSDConflux is ERC20, ERC20Detailed {
  address[] slots;
  address lastWinner;

  function _addSlot(address addr) internal {
    slots.push(addr);
  }

  constructor(address[] memory defaultOperators) ERC777("Prize Interest Dollar", "piUSD", defaultOperators) public {
  }

  // constructor() ERC20Detailed("Prize Interest Dollar", "piUSD", 18) public {
  //   _mint(msg.sender, 1e24);
  // }

  function hack() public {
    _mint(msg.sender, msg.sender, 1e24, "", "");
  }

  function transfer(address recipient, uint256 amount) public returns (bool) {
    super.transfer(recipient, amount);
    _addSlot(_msgSender());
    return true;
  }

  function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
    super.transferFrom(sender, recipient, amount);
    _addSlot(sender);
    return true;
  }
  
  // function send(address recipient, uint256 amount, bytes memory data) public {
  //   super.send(recipient,amount,data);
  //   _addSlot(_msgSender());
  // }

  function getWinnerIndex() public view returns (uint256) {
    uint256 winnerIndex = 0;
    // should be from chainlink rnd api
    if( slots.length > 0 ) {
      uint256 rnd = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty)));
      winnerIndex = rnd % slots.length;
    }
    return winnerIndex;
  }
  
  function sendPrizeToLuckySpender(address prizeTokenAddress,uint256 amount) public {
    require(slots.length > 0,"!slots");
    uint256 winnerIndex = getWinnerIndex();
    address winner = slots[winnerIndex];
    IERC20(prizeTokenAddress).transferFrom(msg.sender, winner, amount);
    lastWinner = winner;
    delete slots;
  }

  function slotsCount() public view returns (uint256) {
    return slots.length;
  }

  function slotsAtIndex(uint256 index) public view returns (address) {
    return slots[index];
  }
  
  function getLastWinner() public view returns (address) {
    return lastWinner;
  }
}