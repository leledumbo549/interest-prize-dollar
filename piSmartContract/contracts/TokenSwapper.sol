pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenSwapper {
  address public tokenV1;
  address public tokenV2;

  constructor(address v1, address v2) public {
    tokenV1 = v1;
    tokenV2 = v2;
  }

  function swapToV2(uint256 amount) public {
    IERC20(tokenV1).transferFrom(msg.sender,address(this), amount);
    IERC20(tokenV2).transfer(msg.sender, amount);
  }

  function swapToV1(uint256 amount) public {
    IERC20(tokenV2).transferFrom(msg.sender,address(this), amount);
    IERC20(tokenV1).transfer(msg.sender, amount);
  }

}