// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title NFTCore - 注册即铸造的核心合约（保持与原逻辑一致）
/// @notice 负责注册费、铸造、tokenURI 写入、平台授权与授权转移
contract NFTCore is ERC721URIStorage, Ownable {
    using SafeERC20 for IERC20;
    using Counters for Counters.Counter;

    IERC20 public paymentToken; // 支付代币
    uint256 public registerFee; // 注册费用
    address public platformWallet; // 平台收款地址

    Counters.Counter private _tokenIdCounter;

    mapping(string => uint256) public idRegistrationCount; // 某个 ID 注册次数
    mapping(uint256 => string) public idOfToken; // tokenId -> 最终 ID (例如 alice-1)
    mapping(uint256 => address) public platformOf; // tokenId -> 绑定平台（预留）
    mapping(address => bool) public authorizedPlatforms; // 授权平台（可调用授权转移/改URI）

    event Registered(
        address indexed user,
        uint256 indexed tokenId,
        string finalID
    );
    event MetadataUpdated(uint256 indexed tokenId, string metadataURI);
    event PlatformAuthorized(address indexed platform, bool status);
    event PaymentTokenChanged(address indexed token);
    event RegisterFeeChanged(uint256 fee);
    event PlatformWalletChanged(address wallet);

    constructor(
        address _paymentToken,
        uint256 _registerFee,
        address _platformWallet
    ) ERC721("AIPatrolNFT", "AIPNFT") Ownable(msg.sender) {
        require(_paymentToken != address(0), "Invalid token");
        require(_platformWallet != address(0), "Invalid wallet");
        paymentToken = IERC20(_paymentToken);
        registerFee = _registerFee;
        platformWallet = _platformWallet;
    }

    modifier onlyPlatform() {
        require(authorizedPlatforms[msg.sender], "Not authorized platform");
        _;
    }

    // --- 管理 ---

    function setPaymentToken(address _paymentToken) external onlyOwner {
        require(_paymentToken != address(0), "Invalid token");
        paymentToken = IERC20(_paymentToken);
        emit PaymentTokenChanged(_paymentToken);
    }

    function setRegisterFee(uint256 _fee) external onlyOwner {
        registerFee = _fee;
        emit RegisterFeeChanged(_fee);
    }

    function setPlatformWallet(address _wallet) external onlyOwner {
        require(_wallet != address(0), "Invalid wallet");
        platformWallet = _wallet;
        emit PlatformWalletChanged(_wallet);
    }

    /// @notice 授权/取消授权平台（例如 NFTRental、NFTSale）
    function authorizePlatform(
        address platform,
        bool status
    ) external onlyOwner {
        authorizedPlatforms[platform] = status;
        emit PlatformAuthorized(platform, status);
    }

    // --- 注册 & 铸造（与原逻辑一致） ---

    /// @notice 注册一个 ID，立即铸造 NFT，并将 finalID 写入 tokenURI
    function register(string memory id) external {
        bytes memory b = bytes(id);
        require(b.length >= 3 && b.length <= 10, "ID length invalid");
        require(_isAlphanumeric(b), "ID must be alphanumeric");
        require(idRegistrationCount[id] < 50, "ID max registration reached");

        // 支付注册费到平台钱包
        paymentToken.safeTransferFrom(msg.sender, platformWallet, registerFee);

        // 生成唯一 ID（如 alice-1）
        uint256 count = ++idRegistrationCount[id];
        string memory finalID = string(
            abi.encodePacked(id, "-", Strings.toString(count))
        );

        // 生成并递增 tokenId
        _tokenIdCounter.increment();
        uint256 newItemId = _tokenIdCounter.current();

        // 铸造并设置 URI 为 finalID（保持原行为）
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, finalID);

        idOfToken[newItemId] = finalID;
        platformOf[newItemId] = address(0);

        emit Registered(msg.sender, newItemId, finalID);
    }

    /// @notice 平台更新 metadata URI（如需把 URI 替换为真正的 JSON URL）
    function setMetadataURI(
        uint256 tokenId,
        string memory metadataURI
    ) external onlyPlatform {
        // 使用 _ownerOf 判断存在性（不存在则为 address(0)）
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        _setTokenURI(tokenId, metadataURI);
        emit MetadataUpdated(tokenId, metadataURI);
    }

    // --- 授权转移（供平台合约调用） ---

    /// @notice 授权的平台（如 NFTRental / NFTSale）可代用户安全转移
    function safeTransferFromAuthorized(
        address from,
        address to,
        uint256 tokenId
    ) external onlyPlatform {
        _safeTransfer(from, to, tokenId, "");
    }

    // --- 内部/工具 ---

    function _isAlphanumeric(bytes memory b) internal pure returns (bool) {
        for (uint256 i = 0; i < b.length; i++) {
            bytes1 c = b[i];
            bool isNum = (c >= 0x30 && c <= 0x39);
            bool isUp = (c >= 0x41 && c <= 0x5A);
            bool isLow = (c >= 0x61 && c <= 0x7A);
            if (!(isNum || isUp || isLow)) return false;
        }
        return true;
    }

    function getIDs() external view returns (string[] memory) {
        uint256 total = _tokenIdCounter.current();
        string[] memory result = new string[](total);
        for (uint256 i = 1; i <= total; i++) {
            result[i - 1] = idOfToken[i];
        }
        return result;
    }

    /// @notice 分页获取注册 ID 列表
    /// @param offset 起始索引（0 ~ total-1）
    /// @param limit  最大返回数量
    function getIDsPaginated(
        uint256 offset,
        uint256 limit
    ) external view returns (string[] memory) {
        uint256 total = _tokenIdCounter.current();
        if (offset >= total) {
            return new string[](0);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        uint256 size = end - offset;

        string[] memory result = new string[](size);
        for (uint256 i = 0; i < size; i++) {
            uint256 tokenId = offset + i + 1; // 因为 tokenId 从 1 开始
            result[i] = idOfToken[tokenId];
        }
        return result;
    }
}
