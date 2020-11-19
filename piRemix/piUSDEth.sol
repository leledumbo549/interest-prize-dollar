pragma solidity ^0.5.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.1/contracts/token/ERC20/IERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.1/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.1/contracts/token/ERC20/ERC20Detailed.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.1/contracts/math/SafeMath.sol";
import "https://github.com/mrdavey/ez-flashloan/blob/remix/contracts/aave/ILendingPool.sol";
import "https://github.com/mrdavey/ez-flashloan/blob/remix/contracts/aave/ILendingPoolAddressesProvider.sol";

interface IAToken {
    function redeem(uint256 _amount) external;
}

contract piUSDEth is ERC20, ERC20Detailed {
    using SafeMath for uint256;
    
    address dev = address(0xA21fD8F0FaaaB4407B17429c1b53A6C5b9b6e6Ad);
    
    // kovan usdt
    address usdt = address(0x13512979ADE267AB5100878E2e0f485B568328a4);
    address ausdt = address(0xA01bA9fB493b851F4Ac5093A324CB081A909C34B);
    
    // kovan dai
    address dai = address(0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD);
    address adai = address(0x58AD4cB396411B691A9AAb6F74545b2C5217FE6a);
    
    // kovan link
    address link = address(0xAD5ce863aE3E4E9394Ab43d4ba0D80f419F61789);
    address alink = address(0xEC23855Ff01012E1823807CE19a790CeBc4A64dA);
    
    address baseTokenAddress = link;
    address interestTokenAddress = alink;
    
    ILendingPoolAddressesProvider provider = ILendingPoolAddressesProvider(address(0x506B0B2CF20FAA8f38a4E2B524EE43e1f4458Cc5));
    ILendingPool lendingPool = ILendingPool(provider.getLendingPool());
    
    // conflux receiver wallet
    address poolPrizeAddress = address(0x604cCd4Ef1fD80A01eB4A4a8A3fC8275A880e3Ca);
    uint256 totalDeposit = 0;
    
    constructor() ERC20Detailed("Prize Interest Dollar", "piUSD", 18) public {
    }
    
    function refresh() public {
        require(msg.sender == dev,"!dev");
        IERC20(baseTokenAddress).approve(provider.getLendingPoolCore(), uint256(-1));
    }
    
    function setNewPoolPrizeAddress(address addr) public {
        require(msg.sender == dev,"!dev");
        poolPrizeAddress = addr;
    }

    function wrap(uint256 amount,address receiver) public {
        IERC20(baseTokenAddress).transferFrom(msg.sender,address(this), amount);
        uint16 referral = 0;
        lendingPool.deposit(baseTokenAddress, amount, referral);
        totalDeposit = totalDeposit.add(amount);
        _mint(receiver, amount);
    }
    
    function unwrap(uint256 amount) public {
        _burn(msg.sender,amount);
        IAToken(interestTokenAddress).redeem(amount);
        IERC20(baseTokenAddress).transfer(msg.sender,amount);
        totalDeposit = totalDeposit.sub(amount);
    }
    
    function baseTokenBalance() public view returns (uint256) {
        return IERC20(baseTokenAddress).balanceOf(address(this));
    }
    
    function interestTokenBalance() public view returns (uint256) {
        return IERC20(interestTokenAddress).balanceOf(address(this));
    }
    
    function getTotalDeposit() public view returns (uint256) {
        return totalDeposit;
    }
    
    function getInterest() public view returns (uint256) {
        uint256 iBalance = interestTokenBalance();
        if(iBalance > totalDeposit) {
            return iBalance.sub(totalDeposit);
        }
        return 0;
    }

    function sendInterestToConflux() public {
        uint256 interest = getInterest();
        require(interest > 0,"!interest");
        IERC20(interestTokenAddress).transfer(poolPrizeAddress,interest);
    }

}
