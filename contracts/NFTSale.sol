// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./NFTCore.sol";
import "./NFTRental.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title NFTSale - 独立的出售合约（使用 ETH 支付）
/// @notice 出售前会检查 NFTRental 的租赁状态，租赁中不可出售
contract NFTSale is Ownable, ReentrancyGuard {
    struct SaleInfo {
        address seller;
        uint256 price; // 以 wei 计价
    }

    mapping(uint256 => SaleInfo) public sales;

    NFTCore public immutable nftCore;
    NFTRental public immutable nftRental;

    event ListedForSale(uint256 indexed tokenId, address indexed seller, uint256 price);
    event SaleCancelled(uint256 indexed tokenId);
    event Bought(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);

    constructor(address _nftCore, address _nftRental, address initialOwner) Ownable(initialOwner) {
        require(_nftCore != address(0) && _nftRental != address(0), "Invalid addr");
        nftCore = NFTCore(_nftCore);
        nftRental = NFTRental(_nftRental);
    }

    /// @notice 上架出售（租赁中禁止）
    function listForSale(uint256 tokenId, uint256 price) external {
        require(nftCore.ownerOf(tokenId) == msg.sender, "Not NFT owner");
        require(price > 0, "Price=0");

        // 查询租赁状态：若正在租赁则不可上架
        (address renter,,) = nftRental.activeRentals(tokenId);
        require(renter == address(0), "NFT is rented");

        sales[tokenId] = SaleInfo({seller: msg.sender, price: price});
        emit ListedForSale(tokenId, msg.sender, price);
    }

    /// @notice 取消出售
    function cancelSale(uint256 tokenId) external {
        SaleInfo memory s = sales[tokenId];
        require(s.seller == msg.sender, "Not seller");
        delete sales[tokenId];
        emit SaleCancelled(tokenId);
    }

    /// @notice 购买 NFT（租赁中禁止）
    function buy(uint256 tokenId) external payable nonReentrant {
        SaleInfo memory s = sales[tokenId];
        require(s.price > 0, "Not for sale");
        require(msg.value >= s.price, "Insufficient payment");

        // 确认仍未处于租赁中且卖家仍持有
        (address renter,,) = nftRental.activeRentals(tokenId);
        require(renter == address(0), "NFT is rented");
        require(nftCore.ownerOf(tokenId) == s.seller, "Seller not owner");

        // 先删状态再转账/转 NFT，避免可重入利用
        delete sales[tokenId];

        // 结算
        (bool ok, ) = payable(s.seller).call{value: s.price}("");
        require(ok, "Pay failed");
        // 退款多余 ETH（如有）
        if (msg.value > s.price) {
            (ok, ) = payable(msg.sender).call{value: msg.value - s.price}("");
            require(ok, "Refund failed");
        }

        // 授权平台转移（需要在 NFTCore 中将本合约加入 authorizedPlatforms）
        nftCore.safeTransferFromAuthorized(s.seller, msg.sender, tokenId);

        emit Bought(tokenId, s.seller, msg.sender, s.price);
    }
}
