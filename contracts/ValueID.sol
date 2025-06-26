// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// 导入 OpenZeppelin 的可升级访问控制和重入保护模块
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

/**
 * @title IDMarketplace
 * @dev 这是一个用于管理ID注册、出售和租赁的市场合约。
 *      它允许用户注册ID，设置出售和租赁条款，以及进行购买和租赁操作。
 */
contract IDMarketplace is
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20Upgradeable for IERC20Upgradeable;

    // 定义角色常量
    bytes32 public constant TOKEN_MANAGER_ROLE = keccak256("TOKEN_MANAGER");
    address public constant DEFAULT_ADMIN =
        0x3ac6D12628746E3E7c8a98f4188B7cf6e809F699;
    uint256 public constant MAX_REGISTRATIONS = 50;

    // 映射存储ID与平台的关联
    mapping(string => mapping(uint => address)) public idPlatformMapping;
    // 存储被允许的平台地址
    mapping(address => bool) public allowedPlatforms;

    // 定义ID信息结构体
    struct IDInfo {
        address owner; // ID所有者
        string ID; // ID字符串
        uint index; // ID索引
        uint256 price; // 出售价格
        address saleToken; // 出售所用的代币地址
        uint40 leaseEndTime; // 租赁结束时间（UNIX时间戳）
        uint256 leasePrice; // 租赁价格
        address leaseToken; // 租赁所用的代币地址
        uint16 leaseDurationDays; // 租赁持续时间（天）
        address currentLessee; // 当前租赁者地址
        uint256 securityDeposit; // 租赁保证金
    }

    // 映射存储ID与其信息的关联
    mapping(string => mapping(uint => IDInfo)) public idMapping;
    // 存储被允许的代币地址
    mapping(address => bool) public allowedTokens;

    // 事件定义
    event IDRegistered(string indexed id, uint index, address owner);
    event IDListedForSale(
        string indexed id,
        uint index,
        uint256 price,
        address saleToken
    );
    event IDSold(
        string indexed id,
        uint index,
        address buyer,
        uint256 price,
        address saleToken
    );
    event PlatformAuthorized(string indexed id, uint index, address platform);
    event LeaseTermsSet(
        string indexed id,
        uint index,
        uint256 leasePrice,
        address leaseToken,
        uint16 leaseDurationDays,
        uint256 securityDeposit
    );
    event IDLeased(
        string indexed id,
        uint index,
        uint40 leaseEndTime,
        uint256 leasePrice,
        address leaseToken,
        address lessee
    );
    event LeaseEnded(string indexed id, uint index, address owner);
    event PlatformAdded(address platform);
    event PlatformRemoved(address platform); // 新增事件：平台被移除
    event TokenAdded(address token);

    /**
     * @dev 初始化函数，设置初始角色和允许的代币。
     */
    function initialize() public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();

        // 授予默认管理员角色
        _grantRole(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN);
        _grantRole(TOKEN_MANAGER_ROLE, DEFAULT_ADMIN);

        // 添加默认允许的代币（USDT和USDC）
        allowedTokens[0xdAC17F958D2ee523a2206206994597C13D831ec7] = true; // USDT
        allowedTokens[0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48] = true; // USDC
    }

    /**
     * @dev 添加一个新的平台地址。
     * @param newPlatform 新平台的地址
     */
    function addPlatform(address newPlatform) external {
        require(msg.sender == DEFAULT_ADMIN, "Only admin can add platform");
        allowedPlatforms[newPlatform] = true;
        emit PlatformAdded(newPlatform);
    }

    /**
     * @dev 移除已添加的平台地址。
     * @param platform 要移除的平台地址
     */
    function removePlatform(address platform) external {
        require(msg.sender == DEFAULT_ADMIN, "Only admin can remove platform");
        require(allowedPlatforms[platform], "Platform not found");
        allowedPlatforms[platform] = false;
        emit PlatformRemoved(platform);
    }
    /**
     * @dev 注册一个新的ID。
     * @param ID 要注册的ID字符串
     * @param index ID的索引
     */
    function registerId(string calldata ID, uint index) external {
        require(
            bytes(ID).length >= 3 && bytes(ID).length <= 10,
            "Invalid ID length"
        );
        require(index < MAX_REGISTRATIONS, "Exceeded max registrations");

        IDInfo storage info = idMapping[ID][index];
        require(info.owner == address(0), "ID already registered");

        info.owner = msg.sender;
        info.ID = ID;
        info.index = index;

        emit IDRegistered(ID, index, msg.sender);
    }

    /**
     * @dev 设置ID的出售价格和代币。
     * @param ID 要出售的ID字符串
     * @param index ID的索引
     * @param price 出售价格
     * @param saleToken 出售所用的代币地址
     */
    function setSaleToken(
        string calldata ID,
        uint index,
        uint256 price,
        address saleToken
    ) external {
        IDInfo storage info = idMapping[ID][index];
        require(info.owner == msg.sender, "Not owner");
        require(allowedTokens[saleToken], "Token not allowed");
        require(info.leaseEndTime <= block.timestamp, "Lease active");
        require(
            info.currentLessee == address(0),
            "ID is leased, cannot be listed for sale"
        );

        info.price = price;
        info.saleToken = saleToken;

        emit IDListedForSale(ID, index, price, saleToken);
    }

    /**
     * @dev 设置ID关联的平台地址。
     * @param ID 要设置的平台的ID字符串
     * @param index ID的索引
     * @param newPlatform 新平台的地址
     */
    function setPlatform(
        string calldata ID,
        uint index,
        address newPlatform
    ) external {
        IDInfo storage info = idMapping[ID][index];
        require(info.owner == msg.sender, "Not owner");
        require(
            newPlatform == address(0) || allowedPlatforms[newPlatform],
            "Platform not allowed"
        );
        require(info.leaseEndTime <= block.timestamp, "Lease active");
        require(
            info.currentLessee == address(0),
            "ID is leased, cannot change platform"
        );

        if (newPlatform == address(0)) {
            // 如果 newPlatform 为 address(0)，自动解除授权
            delete idPlatformMapping[ID][index];
        } else {
            idPlatformMapping[ID][index] = newPlatform;
        }

        emit PlatformAuthorized(ID, index, newPlatform);
    }

    /**
     * @dev 设置ID的租赁条款。
     * @param ID 要租赁的ID字符串
     * @param index ID的索引
     * @param _leasePrice 租赁价格
     * @param _leaseToken 租赁所用的代币地址
     * @param _leaseDurationDays 租赁持续时间（天）
     * @param _securityDeposit 租赁保证金
     */
    function setLeaseDetails(
        string calldata ID,
        uint index,
        uint256 _leasePrice,
        address _leaseToken,
        uint16 _leaseDurationDays,
        uint256 _securityDeposit
    ) external {
        IDInfo storage info = idMapping[ID][index];
        require(info.owner == msg.sender, "Not owner");
        require(allowedTokens[_leaseToken], "Token not allowed");
        require(_leaseDurationDays > 0, "Invalid duration");
        require(info.leaseEndTime <= block.timestamp, "Active lease exists");

        info.leasePrice = _leasePrice;
        info.leaseToken = _leaseToken;
        info.leaseDurationDays = _leaseDurationDays;
        info.securityDeposit = _securityDeposit;

        emit LeaseTermsSet(
            ID,
            index,
            _leasePrice,
            _leaseToken,
            _leaseDurationDays,
            _securityDeposit
        );
    }
    /**
     * @dev 租赁一个ID。
     * @param ID 要租赁的ID字符串
     * @param index ID的索引
     */

    /**
     * @dev 结束ID的租赁。
     * @param ID 要结束租赁的ID字符串
     * @param index ID的索引
     */
    function endLease(string calldata ID, uint index) external {
        IDInfo storage info = idMapping[ID][index];
        require(info.leaseEndTime <= block.timestamp, "Lease not expired");
        require(info.currentLessee != address(0), "No active lease");

        info.leaseEndTime = 0;
        info.currentLessee = address(0);

        emit LeaseEnded(ID, index, info.owner);
    }
    /**
     * @dev 租赁一个ID。
     * @param ID 要租赁的ID字符串
     * @param index ID的索引
     */
    function leaseID(string calldata ID, uint index) external nonReentrant {
        IDInfo storage info = idMapping[ID][index];
        require(info.leasePrice > 0, "Not for lease");
        require(info.leaseEndTime <= block.timestamp, "Active lease");
        require(info.leaseDurationDays > 0, "Duration not set");
        require(info.price == 0, "ID is for sale, cannot lease");

        // 计算租金和保证金（例如保证金是租金的50%）
        uint256 totalPayment = info.leasePrice + info.leasePrice / 2; // 假设保证金是租金的50%
        IERC20Upgradeable leaseToken = IERC20Upgradeable(info.leaseToken);

        // 确保用户支付了正确的总金额（租金 + 保证金）
        leaseToken.safeTransferFrom(
            msg.sender,
            0x3ac6D12628746E3E7c8a98f4188B7cf6e809F699,
            totalPayment
        ); // 转到指定地址

        uint40 endTime = uint40(
            block.timestamp + info.leaseDurationDays * 86400
        );
        info.leaseEndTime = endTime;
        info.currentLessee = msg.sender;

        emit IDLeased(
            ID,
            index,
            endTime,
            info.leasePrice,
            info.leaseToken,
            msg.sender
        );
    }

    /**
     * @dev 购买一个ID。
     * @param ID 要购买的ID字符串
     * @param index ID的索引
     */
    function buyID(string calldata ID, uint index) external nonReentrant {
        IDInfo storage info = idMapping[ID][index];
        require(info.price > 0, "Not for sale");
        require(msg.sender != info.owner, "Cannot buy own ID");
        require(allowedTokens[info.saleToken], "Invalid sale token");
        require(info.leaseEndTime <= block.timestamp, "Active lease");

        // 确保用户支付了正确的金额
        IERC20Upgradeable saleToken = IERC20Upgradeable(info.saleToken);
        uint256 price = info.price;
        address saleTokenAddress = info.saleToken;
        address previousOwner = info.owner;

        // 检查用户支付的金额
        saleToken.safeTransferFrom(msg.sender, previousOwner, price);

        info.owner = msg.sender;
        info.price = 0;
        info.saleToken = address(0);
        info.leasePrice = 0;
        info.leaseToken = address(0);
        info.leaseDurationDays = 0;
        info.leaseEndTime = 0;
        info.currentLessee = address(0);

        address platform = idPlatformMapping[ID][index];
        if (platform != address(0)) {
            idPlatformMapping[ID][index] = msg.sender;
        }

        emit IDSold(ID, index, msg.sender, price, saleTokenAddress);
    }

    /**
     * @dev 获取ID的详细信息。
     * @param ID 要查询的ID字符串
     * @param index ID的索引
     * @return IDInfo 结构体，包含ID的所有信息
     */
    function getIDDetails(
        string calldata ID,
        uint index
    ) external view returns (IDInfo memory) {
        return idMapping[ID][index];
    }
    /**
     * @dev 添加允许的代币地址。
     * @param token 要添加的代币地址
     */
    function addAllowedToken(
        address token
    ) external onlyRole(TOKEN_MANAGER_ROLE) {
        allowedTokens[token] = true;
        emit TokenAdded(token);
    }

    /**
     * @dev 移除允许的代币地址。
     * @param token 要移除的代币地址
     */
    function removeAllowedToken(
        address token
    ) external onlyRole(TOKEN_MANAGER_ROLE) {
        allowedTokens[token] = false;
    }
}
