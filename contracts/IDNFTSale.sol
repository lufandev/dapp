// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract IDNFTSale is Ownable {
    // 平台常量地址
    address public constant PLATFORM =
        0x3ac6D12628746E3E7c8a98f4188B7cf6e809F699;

    struct SaleInfo {
        string id;
        uint tokenId;
        uint price;
        uint amount;
        address payToken;
        address seller;
        address receiver;
        address nftAddr;
    }

    mapping(uint => SaleInfo) saleInfos;
    uint8 private feePercent; //平台抽成

    event SaleEvent(
        string id,
        uint tokenId,
        uint price,
        uint amount,
        address payToken,
        address seller,
        address buyer,
        address receiver,
        address nftAddr
    );

    event CancleSaleEvent(string id, uint tokenId, address nftAddr);

    constructor() Ownable(msg.sender) {}

    // 出售ID
    function listForSale(
        string memory id,
        uint tokenId,
        uint price,
        uint amount,
        address payToken,
        address receiver,
        address nftAddr
    ) public {
        // 检测当前是否ID持有人
        require(
            IERC1155(nftAddr).balanceOf(msg.sender, tokenId) > 0,
            "not owner"
        );
        receiver == address(0) ? msg.sender : receiver;

        saleInfos[tokenId] = SaleInfo({
            id: id,
            tokenId: tokenId,
            price: price,
            amount: amount,
            payToken: payToken,
            seller: msg.sender,
            receiver: receiver,
            nftAddr: nftAddr
        });

        emit SaleEvent(
            id,
            tokenId,
            price,
            amount,
            payToken,
            msg.sender,
            address(0),
            receiver,
            nftAddr
        );
    }

    // 取消出售：将出售数量置为0
    function cancleSale(uint tokenId) public {
        SaleInfo storage saleInfo = saleInfos[tokenId];

        // 操作为当前持有者
        require(
            IERC1155(saleInfo.nftAddr).balanceOf(msg.sender, tokenId) > 0,
            "not owner"
        );

        // 是否已取消或者已经出售
        require(saleInfo.amount > 0, "already sale or cancle");

        saleInfo.amount = 0;

        emit CancleSaleEvent(saleInfo.id, saleInfo.tokenId, saleInfo.nftAddr);
    }

    // 购买NFT
    function buy(address buyer, uint tokenId, uint amount) public {
        SaleInfo storage saleInfo = saleInfos[tokenId];

        // 是否有出售
        require(saleInfo.amount >= amount, "buy over amount");

        // 是否有余额
        require(
            IERC20(saleInfo.payToken).allowance(buyer, address(this)) >=
                saleInfo.price,
            "Insufficient payment token balance"
        );

        // 计算手续费和卖方所得
        uint256 fee = (saleInfo.price * feePercent) / 100;
        uint256 sellerAmount = saleInfo.price - fee;

        // 转移支付
        IERC20(saleInfo.payToken).transferFrom(
            buyer,
            saleInfo.receiver,
            sellerAmount
        );
        IERC20(saleInfo.payToken).transferFrom(buyer, PLATFORM, fee);

        // 转移NFT所有权
        IERC1155(saleInfo.nftAddr).safeTransferFrom(
            saleInfo.seller,
            buyer,
            tokenId,
            amount,
            ""
        );
        saleInfo.amount -= amount;

        emit SaleEvent(
            saleInfo.id,
            tokenId,
            saleInfo.price,
            saleInfo.amount,
            saleInfo.payToken,
            saleInfo.seller,
            buyer,
            saleInfo.receiver,
            saleInfo.nftAddr
        );
    }

    function setFeePercent(uint8 _feePercent) public onlyOwner {
        feePercent = _feePercent;
    }
}
