// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title NFT租赁合约
 * @dev 处理NFT的租赁功能，包括出租、收回过期租赁等
 */
contract NFTRental is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // 租赁信息结构体
    struct RentInfo {
        address lender;       // 出租人地址
        address renter;       // 承租人地址
        uint256 endTime;      // 租赁结束时间戳
        address rentReceiver; // 租金接收地址
        IERC20 payToken;      // 支付代币合约
    }

    // 租赁信息映射（tokenId => RentInfo）
    mapping(uint256 => RentInfo) public rentInfo;

    // 主合约地址
    address public nftContract;

    // 仅主合约可调用的修饰符
    modifier onlyNFTContract() {
        require(msg.sender == nftContract, "Caller is not NFT contract");
        _;
    }

    constructor(address _nftContract) {
        nftContract = _nftContract;
    }

    /**
     * @dev 租赁NFT（仅供主合约调用）
     * @param tokenId NFT ID
     * @param lender 出租人地址
     * @param renter 承租人地址
     * @param durationDays 租赁天数
     * @param rentReceiver 租金接收地址
     * @param token 支付代币地址
     */
    function rent(
        uint256 tokenId,
        address lender,
        address renter,
        uint256 durationDays,
        address rentReceiver,
        address token
    ) external onlyNFTContract nonReentrant {
        rentInfo[tokenId] = RentInfo({
            lender: lender,
            renter: renter,
            endTime: block.timestamp + durationDays * 1 days,
            rentReceiver: rentReceiver,
            payToken: IERC20(token)
        });
    }

    /**
     * @dev 检查NFT是否在租赁中
     * @param tokenId NFT ID
     * @return 是否在租赁期内
     */
    function isRented(uint256 tokenId) external view returns (bool) {
        return rentInfo[tokenId].endTime >= block.timestamp;
    }

    /**
     * @dev 收回过期租赁的NFT
     * @param tokenId NFT ID
     * @param currentOwner 当前持有人地址
     * @return 新的持有人地址
     */
    function claimExpiredRental(
        uint256 tokenId,
        address currentOwner
    ) external nonReentrant returns (address) {
        RentInfo storage info = rentInfo[tokenId];
        require(info.endTime > 0 && block.timestamp >= info.endTime, "Not expired");
        require(
            msg.sender == info.lender || msg.sender == info.renter,
            "Not authorized"
        );
        require(currentOwner == info.renter, "Not in renter's wallet");

        delete rentInfo[tokenId];
        return info.lender; // 返回物主地址以便转移
    }
}

/**
 * @title NFT主合约
 * @dev 处理NFT注册、出售、平台绑定等核心功能
 */
contract NFT is ERC721URIStorage, ERC721Enumerable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;
    using SafeERC20 for IERC20;

    Counters.Counter private _tokenIds; // Token ID计数器

    // 平台常量地址
    address public constant PLATFORM = 0x3ac6D12628746E3E7c8a98f4188B7cf6e809F699;
    address public owner; // 合约所有者

    // 支付代币设置
    IERC20 public paymentToken = IERC20(0xdAC17F958D2ee523a2206206994597C13D831ec7); // 默认USDT
    uint256 public registerFee = 10 * 10**6; // 注册费（默认10 USDT）
    uint256 public feePercent = 5; // 平台手续费百分比
    uint256 public constant MAX_FEE = 10; // 最大手续费限制

    // ID注册管理
    mapping(string => uint8) public idRegistrationCount; // ID注册次数
    mapping(uint256 => string) public idOfToken; // Token对应的最终ID

    // 出售信息结构体
    struct SaleInfo {
        address seller;   // 出售人
        uint256 price;    // 出售价格
        IERC20 payToken;  // 支付代币
        address receiver; // 收款地址
    }

    // 出售信息映射（tokenId => SaleInfo）
    mapping(uint256 => SaleInfo) public saleInfo;

    // 平台绑定管理
    mapping(address => bool) public authorizedPlatforms; // 授权平台
    mapping(uint256 => address) public platformOf;       // Token绑定的平台

    // 支持的支付代币
    mapping(address => bool) public supportedTokens;

    // 租赁合约实例
    NFTRental public rentalContract;
    
    // === 修饰符 ===
    
    // 仅合约所有者修饰符
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    /**
     * @dev 检查NFT是否未出租的修饰符
     * @param tokenId 要检查的NFT ID
     */
    modifier notRented(uint256 tokenId) {
        // 使用租赁合约检查租赁状态
        require(!rentalContract.isRented(tokenId), "Token is rented");
        _;
    }

    constructor() ERC721("NFT", "NFT") {
        owner = msg.sender;
        supportedTokens[address(paymentToken)] = true;
        
        // 部署租赁合约
        rentalContract = new NFTRental(address(this));
    }

    // ========== 管理功能 ==========
    
    /**
     * @dev 设置注册费
     * @param fee 新的注册费
     */
    function setRegisterFee(uint256 fee) external onlyOwner {
        registerFee = fee;
    }

    /**
     * @dev 设置支付代币
     * @param token 新的支付代币地址
     */
    function setPaymentToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token");
        paymentToken = IERC20(token);
    }

    /**
     * @dev 设置手续费百分比
     * @param _feePercent 新的手续费百分比
     */
    function setFeePercent(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= MAX_FEE, "Exceeds max fee");
        feePercent = _feePercent;
    }

    /**
     * @dev 添加支持的支付代币
     * @param token 代币地址
     */
    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token");
        supportedTokens[token] = true;
    }

    /**
     * @dev 移除支持的支付代币
     * @param token 代币地址
     */
    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }

    // ========== NFT注册功能 ==========
    
    /**
     * @dev 注册新NFT
     * @param id 基础ID字符串
     * @return tokenId 新生成的NFT ID
     */
    function register(string calldata id) external nonReentrant returns (uint256 tokenId) {
        bytes memory idBytes = bytes(id);
        require(idBytes.length >= 3 && idBytes.length <= 10, "ID length must be 3~10");
        
        // 检查ID是否为字母数字组合
        for (uint i = 0; i < idBytes.length; i++) {
            bytes1 char = idBytes[i];
            require(
                (char >= 0x30 && char <= 0x39) || // 0-9
                (char >= 0x41 && char <= 0x5A) || // A-Z
                (char >= 0x61 && char <= 0x7A),   // a-z
                "ID must be alphanumeric"
            );
        }

        // 检查ID注册次数
        require(idRegistrationCount[id] < 50, "Max 50 registrations per ID");
        
        // 转移注册费
        paymentToken.safeTransferFrom(msg.sender, PLATFORM, registerFee);

        // 生成唯一ID
        idRegistrationCount[id]++;
        string memory finalID = string(abi.encodePacked(id, "-", uint256(idRegistrationCount[id]).toString()));

        // 铸造NFT
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, finalID);
        idOfToken[newItemId] = finalID;

        _tokenIds.increment();
        return newItemId;
    }

    // ========== NFT出售功能 ==========
    
    /**
     * @dev 列出NFT出售
     * @param tokenId NFT ID
     * @param price 出售价格
     * @param payToken 支付代币地址
     * @param receiver 收款地址
     */
    function listForSale(
        uint256 tokenId,
        uint256 price,
        address payToken,
        address receiver
    ) external notRented(tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(price > 0, "Price must be > 0");
        require(supportedTokens[payToken], "Token not supported");
        require(receiver != address(0), "Invalid receiver");

        saleInfo[tokenId] = SaleInfo({
            seller: msg.sender,
            price: price,
            payToken: IERC20(payToken),
            receiver: receiver
        });
    }

    /**
     * @dev 取消出售
     * @param tokenId NFT ID
     */
    function cancelSale(uint256 tokenId) external {
        require(saleInfo[tokenId].seller == msg.sender, "Not seller");
        delete saleInfo[tokenId];
    }

    /**
     * @dev 购买NFT
     * @param tokenId NFT ID
     */
    function buy(uint256 tokenId) external nonReentrant notRented(tokenId) {
        SaleInfo memory sale = saleInfo[tokenId];
        require(sale.price > 0, "Not for sale");

        // 计算手续费和卖方所得
        uint256 fee = (sale.price * feePercent) / 100;
        uint256 sellerAmount = sale.price - fee;

        // 转移支付
        sale.payToken.safeTransferFrom(msg.sender, sale.receiver, sellerAmount);
        sale.payToken.safeTransferFrom(msg.sender, PLATFORM, fee);

        // 转移NFT所有权
        _transfer(sale.seller, msg.sender, tokenId);
        delete saleInfo[tokenId];
    }

    // ========== NFT租赁功能 ==========
    
    /**
     * @dev 租赁NFT
     * @param tokenId NFT ID
     * @param durationDays 租赁天数
     * @param rentAmount 租金金额
     * @param rentReceiver 租金接收地址
     * @param token 支付代币地址
     */
    function rent(
        uint256 tokenId,
        uint256 durationDays,
        uint256 rentAmount,
        address rentReceiver,
        address token
    ) external nonReentrant notRented(tokenId) {
        require(ownerOf(tokenId) != address(0), "Invalid token");
        require(platformOf[tokenId] != address(0), "Not bound to platform");
        require(durationDays >= 7 && durationDays <= 300, "Days must be 7~300");
        require(supportedTokens[token], "Unsupported token");

        address lender = ownerOf(tokenId);
        require(lender != msg.sender, "Cannot rent to yourself");

        // 计算手续费和净租金
        uint256 fee = (rentAmount * feePercent) / 100;
        uint256 netRent = rentAmount - fee;

        // 转移租金
        IERC20(token).safeTransferFrom(msg.sender, rentReceiver, netRent);
        IERC20(token).safeTransferFrom(msg.sender, PLATFORM, fee);

        // 通过租赁合约创建租赁记录
        rentalContract.rent(
            tokenId,
            lender,
            msg.sender,
            durationDays,
            rentReceiver,
            token
        );

        // 转移NFT给承租人
        _transfer(lender, msg.sender, tokenId);
    }

    /**
     * @dev 收回过期租赁的NFT
     * @param tokenId NFT ID
     */
    function claimExpiredRental(uint256 tokenId) external nonReentrant {
        // 通过租赁合约处理收回逻辑
        address newOwner = rentalContract.claimExpiredRental(tokenId, ownerOf(tokenId));
        
        // 转移NFT回物主
        _transfer(ownerOf(tokenId), newOwner, tokenId);
    }

    // ========== 平台绑定功能 ==========
    event PlatformAuthorized(address platform);
    event PlatformDeauthorized(address platform);
    event PlatformBound(uint256 tokenId, address platform);
    event PlatformUnbound(uint256 tokenId);

    /**
     * @dev 授权平台
     * @param platform 平台地址
     */
    function authorizePlatform(address platform) external onlyOwner {
        require(platform != address(0), "Invalid platform");
        authorizedPlatforms[platform] = true;
        emit PlatformAuthorized(platform);
    }

    /**
     * @dev 取消平台授权
     * @param platform 平台地址
     */
    function deauthorizePlatform(address platform) external onlyOwner {
        require(authorizedPlatforms[platform], "Not authorized");
        authorizedPlatforms[platform] = false;
        emit PlatformDeauthorized(platform);
        
        // 解除所有绑定该平台的NFT
        for (uint256 i = 0; i < _tokenIds.current(); i++) {
            if (platformOf[i] == platform) {
                platformOf[i] = address(0);
                emit PlatformUnbound(i);
            }
        }
    }

    /**
     * @dev 绑定NFT到平台
     * @param tokenId NFT ID
     * @param platform 平台地址
     */
    function bindPlatform(uint256 tokenId, address platform) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(authorizedPlatforms[platform], "Not authorized");
        require(platformOf[tokenId] == address(0), "Already bound");
        platformOf[tokenId] = platform;
        emit PlatformBound(tokenId, platform);
    }

    // ========== 兼容性重写 ==========
    function _increaseBalance(address account, uint128 value)
        internal override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721URIStorage, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}