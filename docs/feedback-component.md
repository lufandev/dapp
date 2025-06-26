# 反馈组件使用说明

## 概述

本项目已经实现了一个完整的反馈组件系统，包括 **Toast 消息提示** 和 **Confirm 确认对话框** 两个主要功能。该组件系统与项目的整体设计风格保持一致，支持主题切换和国际化。

## 主要特性

### Toast 消息提示
- **类型支持**：success（成功）、error（错误）、warning（警告）、info（信息）
- **自动消失**：默认 4 秒后自动关闭，可自定义时长
- **手动关闭**：用户可点击关闭按钮主动关闭
- **多条显示**：支持同时显示多条消息，自动堆叠
- **动画效果**：平滑的进入和退出动画

### Confirm 确认对话框
- **类型支持**：info（信息）、warning（警告）、error（错误）
- **自定义按钮**：可自定义确认和取消按钮文本
- **异步支持**：返回 Promise，支持 async/await
- **回调函数**：支持确认和取消的回调函数
- **模态设计**：点击背景可关闭对话框

## 安装和配置

### 1. 组件已集成
反馈组件已经集成到项目的根布局中（`src/app/layout.tsx`），无需额外配置。

### 2. 使用 Hook
在需要使用反馈功能的组件中引入 Hook：

```tsx
import { useFeedback } from "@/components/ui/Feedback";

const MyComponent = () => {
  const { toast, confirm } = useFeedback();
  
  // 使用 toast 和 confirm
};
```

## 使用方法

### Toast 消息提示

```tsx
// 成功消息
toast.success("操作成功", "您的NFT已成功上架！");

// 错误消息
toast.error("操作失败", "网络连接错误，请重试");

// 警告消息
toast.warning("注意", "您的钱包余额不足");

// 信息消息
toast.info("提示信息", "这是一条普通的提示消息");

// 自定义持续时间（单位：毫秒）
toast.success("操作成功", "消息内容", 6000);
```

### Confirm 确认对话框

#### 基础用法
```tsx
const handleDelete = async () => {
  const result = await confirm({
    title: "确认删除",
    message: "您确定要删除这个NFT吗？此操作不可撤销。",
    type: "warning",
    confirmText: "删除",
    cancelText: "取消",
  });

  if (result) {
    // 用户点击了确认
    toast.success("删除成功", "NFT已被删除");
  } else {
    // 用户点击了取消
    toast.info("已取消", "删除操作已取消");
  }
};
```

#### 带回调函数的用法
```tsx
const handleSubmit = async () => {
  const result = await confirm({
    title: "提交订单",
    message: "确认提交购买订单吗？订单提交后将扣除您的余额。",
    type: "info",
    confirmText: "提交",
    cancelText: "取消",
    onConfirm: async () => {
      // 确认时的异步操作
      await submitOrder();
    },
    onCancel: () => {
      // 取消时的操作
      console.log("用户取消了订单");
    },
  });

  if (result) {
    toast.success("订单提交成功", "您的订单已提交，请等待确认");
  }
};
```

## API 参考

### Toast 方法

| 方法 | 参数 | 说明 |
|------|------|------|
| `toast.success(title, message?, duration?)` | `title`: 标题, `message`: 消息内容(可选), `duration`: 持续时间(可选) | 显示成功消息 |
| `toast.error(title, message?, duration?)` | 同上 | 显示错误消息 |
| `toast.warning(title, message?, duration?)` | 同上 | 显示警告消息 |
| `toast.info(title, message?, duration?)` | 同上 | 显示信息消息 |

### Confirm 配置选项

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | - | 对话框标题 |
| `message` | `string` | - | 对话框内容 |
| `type` | `"info" \| "warning" \| "error"` | `"info"` | 对话框类型，影响图标和按钮颜色 |
| `confirmText` | `string` | `"确认"` | 确认按钮文本 |
| `cancelText` | `string` | `"取消"` | 取消按钮文本 |
| `onConfirm` | `() => void \| Promise<void>` | - | 确认时的回调函数 |
| `onCancel` | `() => void` | - | 取消时的回调函数 |

## 样式定制

组件使用项目的 CSS 变量系统，自动适配主题切换：

- `--primary-color`: 主色调
- `--success-color`: 成功状态色
- `--error-color`: 错误状态色
- `--warning-color`: 警告状态色
- `--card-background`: 卡片背景色
- `--foreground`: 前景文字色
- `--tab-inactive-color`: 次要文字色

## 实际应用示例

项目中已经在以下场景中使用了反馈组件：

1. **NFT 详情页面** (`src/app/nft/[id]/page.tsx`)
   - 收藏/取消收藏：使用 Toast 提示
   - 出售确认：使用 Confirm 对话框
   - 出租确认：使用 Confirm 对话框
   - 购买/租赁确认：使用 Confirm 对话框

2. **示例页面** (`src/components/examples/FeedbackExample.tsx`)
   - 完整的使用示例和说明

## 注意事项

1. **组件层级**：反馈组件在应用的最高层级，确保在所有内容之上显示
2. **异步操作**：Confirm 返回 Promise，记得使用 `await` 或 `.then()`
3. **性能考虑**：Toast 会自动管理内存，无需手动清理
4. **多语言支持**：消息内容支持使用国际化字符串

## 设计理念

该反馈组件遵循以下设计原则：

1. **一致性**：与项目整体 UI 风格保持一致
2. **可访问性**：支持键盘操作和屏幕阅读器
3. **响应式**：在不同屏幕尺寸下都有良好表现
4. **用户友好**：清晰的视觉反馈和交互逻辑
5. **开发友好**：简单易用的 API 设计 