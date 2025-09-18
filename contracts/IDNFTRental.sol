// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC1155.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract IDNFTRent is Ownable {
    // 租赁信息结构体
    struct RentInfo {
        address nftAddr;
        address lender; // 出租人地址
        address renter; // 承租人地址
        uint256 endTime; // 租赁结束时间戳
        address rentReceiver; // 租金接收地址
        address payToken; // 支付代币合约
        uint256 rentFee; // 总的租金
        uint rentAmount; // 出租的数量（默认持有该ID的所有）
    }

    mapping(uint => RentInfo) public rentInfos; // 租赁信息存储
    mapping(string => address) authorizedPlatforms;
    mapping(uint => bool) isListForRent; // 是否被挂出租
    uint8 private feePercent; //平台抽成
    // 平台常量地址
    address public constant PLATFORM =
        0x3ac6D12628746E3E7c8a98f4188B7cf6e809F699;

    event RentEvent(
        string id,
        uint256 tokenId,
        address nftAddr,
        address lender, // 出租人地址
        address renter, // 承租人地址
        uint256 endTime, // 租赁结束时间戳
        address rentReceiver, // 租金接收地址
        address payToken, // 支付代币合约
        uint256 rentFee, //总的租金
        uint rentAmount //出租的数量（默认持有该ID的所有）
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev 授权平台
     * @param platform 平台地址
     */
    function authorizePlatform(
        address platform,
        string memory id
    ) external onlyOwner {
        authorizedPlatforms[id] = platform;
    }

    // 取消授权
    function cancleAuthPlatform(string memory id) external onlyOwner {
        authorizedPlatforms[id] = address(0);
    }

    function setFeePercent(uint8 _feePercent) public onlyOwner {
        feePercent = _feePercent;
    }

    // 出租
    function listForRent(
        uint tokenId,
        string memory id,
        address nftAddr,
        uint256 durationDays,
        address rentReceiver,
        address token,
        uint256 rentFee
    ) public {
        // 检测当前是否ID持有人
        uint balance = IERC1155(nftAddr).balanceOf(msg.sender, tokenId);
        require(balance > 0, "not owner");

        // 要先授权才能租赁
        require(
            authorizedPlatforms[id] != address(0),
            "Platform not authorized"
        );

        rentReceiver == address(0) ? msg.sender : rentReceiver;
        address lender = isListForRent[tokenId]
            ? rentInfos[tokenId].lender
            : msg.sender;
        address renter = isListForRent[tokenId]
            ? rentInfos[tokenId].renter
            : address(0);
        uint256 endTime = block.timestamp + durationDays * 1 days;

        RentInfo storage rentInfo = rentInfos[tokenId];
        rentInfo.nftAddr = nftAddr;
        rentInfo.lender = lender;
        rentInfo.renter = renter;
        rentInfo.endTime = endTime;
        rentInfo.rentReceiver = rentReceiver;
        rentInfo.payToken = token;
        rentInfo.rentFee = rentFee;
        rentInfo.rentAmount = balance;

        isListForRent[tokenId] = true;

        emit RentEvent(
            id,
            tokenId,
            nftAddr,
            lender,
            renter,
            endTime,
            rentReceiver,
            token,
            rentFee,
            balance
        );
    }

    function rent(uint tokenId, string memory id) public {
        require(isListForRent[tokenId], "id is not list for rent");

        RentInfo storage rentInfo = rentInfos[tokenId];
        uint rentFee = rentInfo.rentFee;
        address token = rentInfo.payToken;
        address rentReceiver = rentInfo.rentReceiver;

        // 是否有余额
        require(
            IERC20(rentInfo.payToken).balanceOf(msg.sender) >= rentInfo.rentFee,
            "Insufficient payment token balance"
        );

        // 计算手续费和净租金
        uint256 fee = (rentFee * feePercent) / 100;
        uint256 netRent = rentFee - fee;

        // 转移租金
        IERC20(token).transfer(rentReceiver, netRent);
        IERC20(token).transfer(PLATFORM, fee);

        // 转移NFT给承租人
        IERC1155(rentInfo.nftAddr).safeTransferFrom(
            rentInfo.lender,
            msg.sender,
            tokenId,
            rentInfo.rentAmount,
            ""
        );

        emit RentEvent(
            id,
            tokenId,
            rentInfo.nftAddr,
            rentInfo.lender,
            msg.sender,
            rentInfo.endTime,
            rentInfo.rentReceiver,
            rentInfo.payToken,
            rentFee,
            rentInfo.rentAmount
        );
    }
}
