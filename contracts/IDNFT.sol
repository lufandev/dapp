// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract IDNFT is ERC1155, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    event IDNFTMint(
        address account,
        string id,
        uint tokenId,
        uint256 amount,
        address nftAddr
    );

    mapping(string => uint256) id_tokenIds;
    mapping(string => bool) id_exits;

    address private paymentToken;
    uint private registerFee;
    address private receiveAddr;
    uint private totalAmount = 100;

    address private saleAddr;
    address private rentAddr;

    // uri : 元数据URI
    constructor(
        string memory uri,
        address _saleAddr,
        address _rentAddr
    ) ERC1155(uri) Ownable(msg.sender) {
        saleAddr = _saleAddr;
        rentAddr = _rentAddr;
    }

    function initial(
        address _paymentToken,
        uint _registerFee,
        address _receiveAddr
    ) public {
        paymentToken = _paymentToken;
        registerFee = _registerFee;
        receiveAddr = _receiveAddr;
    }

    function mint(
        address account,
        string memory id,
        uint256 amount,
        bytes memory data
    ) public {
        uint256 token_id = _tokenIds.current();

        require(!id_exits[id], "ID already exists");
        require(
            IERC20(paymentToken).balanceOf(msg.sender) >= registerFee,
            "Insufficient payment token balance"
        );
        require(
            balanceOf(account, token_id) + amount <= totalAmount,
            "the amount over then totalAmount"
        );

        // 付注册费
        IERC20(paymentToken).transfer(receiveAddr, registerFee);

        // 铸造
        _mint(account, token_id, amount, data);
        id_tokenIds[id] = token_id;
        id_exits[id] = true;

        // 授权出售合约和租赁合约
        setApprovalForAll(saleAddr, true);
        setApprovalForAll(rentAddr, true);

        emit IDNFTMint(account, id, token_id, amount, address(this));
        _tokenIds.increment();
    }

    function setPaymentToken(address _paymentToken) public onlyOwner {
        paymentToken = _paymentToken;
    }

    function setRegisterFee(uint _registerFee) public onlyOwner {
        registerFee = _registerFee;
    }

    function setReceiveAddr(address _receiveAddr) public onlyOwner {
        receiveAddr = _receiveAddr;
    }

    function setTotalAmount(uint _totalAmount) public onlyOwner {
        totalAmount = _totalAmount;
    }
}
