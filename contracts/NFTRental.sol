// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./NFTCore.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title NFTRental - 独立的租赁合约（使用 ETH 支付）
/// @notice 自行维护租赁状态；与 NFTCore 通过授权转移解耦
contract NFTRental is Ownable, ReentrancyGuard {
    struct RentalInfo {
        address lender;      // 出租人（上架者）
        uint256 pricePerDay; // 每日租金（wei）
        uint256 maxDays;     // 最大可租天数
    }

    struct ActiveRental {
        address renter;  // 当前租客
        address lender;  // 原出租人（到期归还）
        uint256 endTime; // 到期时间戳
    }

    // tokenId => 挂单信息
    mapping(uint256 => RentalInfo) public rentals;
    // tokenId => 租赁中信息
    mapping(uint256 => ActiveRental) public activeRentals;

    NFTCore public immutable nftCore;

    event ListedForRent(uint256 indexed tokenId, address indexed lender, uint256 pricePerDay, uint256 maxDays);
    event RentCancelled(uint256 indexed tokenId);
    event Rented(uint256 indexed tokenId, address indexed lender, address indexed renter, uint256 daysCount, uint256 totalCost);
    event RentalClaimed(uint256 indexed tokenId, address indexed lender);

    constructor(address _nftCore, address initialOwner) Ownable(initialOwner) {
        require(_nftCore != address(0), "Invalid core");
        nftCore = NFTCore(_nftCore);
    }

    /// @notice 上架出租（仅 NFT 当前拥有者）
    function listForRent(uint256 tokenId, uint256 pricePerDay, uint256 maxDays) external {
        require(nftCore.ownerOf(tokenId) == msg.sender, "Not NFT owner");
        require(pricePerDay > 0, "PricePerDay=0");
        require(maxDays > 0, "MaxDays=0");
        // 不允许在租期中再次上架
        ActiveRental memory ar = activeRentals[tokenId];
        require(ar.renter == address(0), "Already rented");

        rentals[tokenId] = RentalInfo({
            lender: msg.sender,
            pricePerDay: pricePerDay,
            maxDays: maxDays
        });

        emit ListedForRent(tokenId, msg.sender, pricePerDay, maxDays);
    }

    /// @notice 取消出租（仅出租方）
    function cancelRentOffer(uint256 tokenId) external {
        RentalInfo memory info = rentals[tokenId];
        require(info.lender == msg.sender, "Not lender");
        delete rentals[tokenId];
        emit RentCancelled(tokenId);
    }

    /// @notice 支付 ETH 租赁 NFT，期间将 NFT 授权转移给租客
    function rentToken(uint256 tokenId, uint256 daysCount) external payable nonReentrant {
        RentalInfo memory info = rentals[tokenId];
        require(info.pricePerDay > 0, "Not for rent");
        require(daysCount > 0 && daysCount <= info.maxDays, "Invalid days");
        // 再次确认当前实际持有人仍是出租方
        require(nftCore.ownerOf(tokenId) == info.lender, "Lender not owner");
        // 不允许在租期中再次出租
        ActiveRental memory ar = activeRentals[tokenId];
        require(ar.renter == address(0), "Already rented");

        uint256 totalCost = info.pricePerDay * daysCount;
        require(msg.value >= totalCost, "Insufficient payment");

        // 状态更新
        delete rentals[tokenId];
        activeRentals[tokenId] = ActiveRental({
            renter: msg.sender,
            lender: info.lender,
            endTime: block.timestamp + daysCount * 1 days
        });

        // 资金结算（先状态后转账）
        (bool ok, ) = payable(info.lender).call{value: totalCost}("");
        require(ok, "Pay failed");
        // 退款多余 ETH（如有）
        if (msg.value > totalCost) {
            (ok, ) = payable(msg.sender).call{value: msg.value - totalCost}("");
            require(ok, "Refund failed");
        }

        // NFT 转给租客（需要在 NFTCore 中将本合约加入 authorizedPlatforms）
        nftCore.safeTransferFromAuthorized(info.lender, msg.sender, tokenId);

        emit Rented(tokenId, info.lender, msg.sender, daysCount, totalCost);
    }

    /// @notice 到期后归还给出租人（任何人可触发）
    function claimExpiredRental(uint256 tokenId) external nonReentrant {
        ActiveRental memory ar = activeRentals[tokenId];
        require(ar.renter != address(0), "Not rented");
        require(block.timestamp > ar.endTime, "Rental active");

        delete activeRentals[tokenId];
        // 从租客转回出租人
        nftCore.safeTransferFromAuthorized(ar.renter, ar.lender, tokenId);

        emit RentalClaimed(tokenId, ar.lender);
    }
}
