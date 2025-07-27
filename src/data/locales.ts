export type Locale = "en" | "zh";

export type Translations = {
  [key: string]: string;
};

export type LocaleData = {
  [key in Locale]: Translations;
};

const locales: LocaleData = {
  en: {
    // Common
    "app.name": "QF-NFT",
    "app.description": "Digital Collection Trading Platform",
    "common.search": "Search NFT...",
    "common.searchRental": "Search rental NFT...",
    "common.searchResults": "Search Results",
    "common.back": "Back",
    "common.noResults": "No matching NFTs found",
    "common.connectWallet": "Connect Wallet",

    // TabBar
    "tabbar.home": "Value ID",
    "tabbar.rental": "Rental",
    "tabbar.inventory": "Inventory",
    "tabbar.profile": "Profile",

    // Home Page
    "home.all": "All",
    "home.recommended": "Recommended",
    "home.latest": "Latest",

    // Rental Page
    "rental.market": "Rental Market",
    "rental.forRent": "For Rent",
    "rental.myRentals": "My Rentals",
    "rental.noRentals": "You don't have any NFTs for rent",
    "rental.listForRent": "List for Rent",

    // Inventory Page
    "inventory.title": "My Inventory",
    "inventory.owned": "Owned",
    "inventory.rented": "Rented",
    "inventory.favorites": "Favorites",
    "inventory.total": "Total: {count} NFTs",
    "inventory.filter": "Filter",
    "inventory.sell": "Sell",
    "inventory.rent": "Rent",
    "inventory.noOwned": "You don't own any NFTs",
    "inventory.buy": "Buy Now",
    "inventory.noRented": "You haven't rented any NFTs",
    "inventory.goRent": "Rent Now",

    // NFT Detail Page
    "nft.detail": "NFT Detail",
    "nft.notFound": "NFT not found",
    "nft.returnHome": "Return to Home",
    "nft.share": "Share",
    "nft.details": "Details",
    "nft.attributes": "Attributes",
    "nft.createdAt": "Created At",
    "nft.owner": "Owner",
    "nft.buyNow": "Buy Now",
    "nft.rentNow": "Rent Now",
    "nft.sellNow": "Sell",
    "nft.rentOut": "Rent Out",
    "nft.rentalPrice": "Rental: ¥{price}/day",

    // Sell Modal
    "sell.price": "Price",
    "sell.currency": "Currency",
    "sell.address": "Receiving Address",
    "sell.submit": "Submit",
    "sell.cancel": "Cancel",
    "sell.success":
      "Listing submitted:\nPrice: {price} {currency}\nAddress: {address}",

    // Rent Modal
    "rent.price": "Price per Day",
    "rent.deposit": "Deposit",
    "rent.duration": "Duration (days)",
    "rent.currency": "Currency",
    "rent.address": "Receiving Address",
    "rent.submit": "Submit",
    "rent.cancel": "Cancel",
    "rent.success":
      "Rental listing submitted:\nPrice: {price} {currency}/day\nDeposit: {deposit} {currency}\nDuration: {duration} days\nAddress: {address}",

    // Currency Options
    "currency.eth": "Ethereum (ETH)",
    "currency.cny": "Chinese Yuan (CNY)",
    "currency.usdt": "USDT",
    "currency.btc": "Bitcoin (BTC)",

    // Profile Page
    "profile.registerID": "Register ID",
    "profile.walletAddress": "Wallet Address",
    "profile.platformAuth": "Platform Authorization",
    "profile.aboutUs": "About Us",
    "profile.helpCenter": "Help Center",
    "profile.settings": "Settings",
    "profile.language": "Language",
    "profile.theme": "Theme",
    "profile.owned": "Owned",
    "profile.rented": "Rented",
    "profile.favorites": "Favorites",
    "profile.sellOrders": "Sale Records",
    "profile.rentalOrders": "Rental Records",
    "profile.buyOrders": "My Purchases",
    "profile.leaseOrders": "My Rentals",
    "profile.walletBalance": "Wallet Balance",

    // Language Settings
    "language.english": "English",
    "language.chinese": "中文",

    // Theme Settings
    "theme.light": "Light",
    "theme.dark": "Dark",

    // Finance Page
    "finance.title": "My Finance",
    "finance.balance": "Current Balance",
    "finance.withdraw": "Withdraw",
    "finance.records": "Transaction Records",

    // Register ID
    "register.title": "Register ID",
    "register.paymentTitle": "Payment Required",
    "register.paymentDesc":
      "To register an ID, you need to pay 10 USDT registration fee",
    "register.paymentAmount": "Payment Amount: 10 USDT",
    "register.payNow": "Confirm",
    "register.inputTitle": "Enter ID to Register",
    "register.inputDesc":
      "Please enter the ID you want to register (3-10 characters, alphanumeric only)",
    "register.inputPlaceholder": "Enter ID (e.g., ABC123)",
    "register.register": "Register",
    "register.processing": "Processing...",
    "register.success": "Registration Successful!",
    "register.successDesc": "Your ID '{id}' has been successfully registered",
    "register.failed": "Registration Failed",
    "register.failedDesc":
      "The ID '{id}' already exists, please try another one",
    "register.invalidId": "Invalid ID format",
    "register.invalidIdDesc":
      "ID must be 3-10 characters and contain only letters and numbers",
    "register.paymentSuccess": "Payment successful! You can now register an ID",
    "register.cancel": "Cancel",
    "register.close": "Close",
  },
  zh: {
    // Common
    "app.name": "QF-NFT",
    "app.description": "数字藏品交易平台",
    "common.search": "搜索NFT...",
    "common.searchRental": "搜索租赁NFT...",
    "common.searchResults": "搜索结果",
    "common.back": "返回",
    "common.noResults": "未找到匹配的NFT",
    "common.connectWallet": "连接钱包",

    // TabBar
    "tabbar.home": "Value ID",
    "tabbar.rental": "租赁",
    "tabbar.inventory": "库存",
    "tabbar.profile": "我的",

    // Home Page
    "home.all": "全部",
    "home.recommended": "推荐",
    "home.latest": "最新上架",

    // Rental Page
    "rental.market": "租赁市场",
    "rental.forRent": "出租",
    "rental.myRentals": "挂租",
    "rental.noRentals": "您还没有挂租的NFT",
    "rental.listForRent": "去挂租",

    // Inventory Page
    "inventory.title": "我的库存",
    "inventory.owned": "持有",
    "inventory.rented": "已租",
    "inventory.favorites": "收藏",
    "inventory.total": "共 {count} 个NFT",
    "inventory.filter": "筛选",
    "inventory.sell": "出售",
    "inventory.rent": "出租",
    "inventory.noOwned": "您还没有持有的NFT",
    "inventory.buy": "去购买",
    "inventory.noRented": "您还没有租赁的NFT",
    "inventory.goRent": "去租赁",

    // NFT Detail Page
    "nft.detail": "NFT详情",
    "nft.notFound": "未找到该NFT",
    "nft.returnHome": "返回首页",
    "nft.share": "分享功能",
    "nft.details": "详情",
    "nft.attributes": "属性",
    "nft.createdAt": "创建时间",
    "nft.owner": "拥有者",
    "nft.buyNow": "立即购买",
    "nft.rentNow": "租赁",
    "nft.sellNow": "出售",
    "nft.rentOut": "出租",
    "nft.rentalPrice": "租赁: ¥{price}/天",

    // Sell Modal
    "sell.price": "价格",
    "sell.currency": "币种",
    "sell.address": "收款地址",
    "sell.submit": "提交",
    "sell.cancel": "取消",
    "sell.success":
      "出售信息已提交：\n价格: {price} {currency}\n收款地址: {address}",

    // Rent Modal
    "rent.price": "每天价格",
    "rent.deposit": "押金",
    "rent.duration": "租赁时间(天)",
    "rent.currency": "币种",
    "rent.address": "收款地址",
    "rent.submit": "提交",
    "rent.cancel": "取消",
    "rent.success":
      "出租信息已提交：\n价格: {price} {currency}/天\n押金: {deposit} {currency}\n租赁时间: {duration}天\n收款地址: {address}",

    // Currency Options
    "currency.eth": "以太坊 (ETH)",
    "currency.cny": "人民币 (CNY)",
    "currency.usdt": "USDT",
    "currency.btc": "比特币 (BTC)",

    // Profile Page
    "profile.registerID": "注册ID",
    "profile.walletAddress": "钱包地址",
    "profile.platformAuth": "平台授权",
    "profile.aboutUs": "关于我们",
    "profile.helpCenter": "帮助中心",
    "profile.settings": "设置",
    "profile.language": "语言",
    "profile.theme": "主题",
    "profile.owned": "持有",
    "profile.rented": "已租",
    "profile.favorites": "收藏",
    "profile.sellOrders": "出售记录",
    "profile.rentalOrders": "出租记录",
    "profile.buyOrders": "我的购买",
    "profile.leaseOrders": "我的租赁",
    "profile.walletBalance": "钱包余额",

    // Language Settings
    "language.english": "English",
    "language.chinese": "中文",

    // Theme Settings
    "theme.light": "浅色",
    "theme.dark": "深色",

    // Finance Page
    "finance.title": "我的资金",
    "finance.balance": "当前余额",
    "finance.withdraw": "提现",
    "finance.records": "资金流水",

    // Register ID
    "register.title": "注册ID",
    "register.paymentTitle": "需要支付费用",
    "register.paymentDesc": "注册ID需要支付10 USDT注册费用",
    "register.paymentAmount": "支付金额：10 USDT",
    "register.payNow": "确定",
    "register.inputTitle": "输入要注册的ID",
    "register.inputDesc": "请输入您要注册的ID（3-10位字符，仅限字母和数字）",
    "register.inputPlaceholder": "输入ID（如：ABC123）",
    "register.register": "注册",
    "register.processing": "处理中...",
    "register.success": "注册成功！",
    "register.successDesc": "您的ID '{id}' 已成功注册",
    "register.failed": "注册失败",
    "register.failedDesc": "ID '{id}' 已存在，请尝试其他ID",
    "register.invalidId": "ID格式无效",
    "register.invalidIdDesc": "ID必须是3-10位字符，且只能包含字母和数字",
    "register.paymentSuccess": "支付成功！现在可以注册ID",
    "register.cancel": "取消",
    "register.close": "关闭",
  },
};

export default locales;
