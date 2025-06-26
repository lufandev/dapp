"use client";

import React from "react";
import { useFeedback } from "@/components/ui/Feedback";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const FeedbackExample: React.FC = () => {
  const { toast, confirm } = useFeedback();

  // Toast消息示例
  const handleSuccessToast = () => {
    toast.success("操作成功", "您的NFT已成功上架！");
  };

  const handleErrorToast = () => {
    toast.error("操作失败", "网络连接错误，请重试");
  };

  const handleWarningToast = () => {
    toast.warning("注意", "您的钱包余额不足");
  };

  const handleInfoToast = () => {
    toast.info("提示信息", "这是一条普通的提示消息");
  };

  // 确认对话框示例
  const handleConfirm = async () => {
    const result = await confirm({
      title: "确认删除",
      message: "您确定要删除这个NFT吗？此操作不可撤销。",
      type: "warning",
      confirmText: "删除",
      cancelText: "取消",
    });

    if (result) {
      toast.success("删除成功", "NFT已被删除");
    } else {
      toast.info("已取消", "删除操作已取消");
    }
  };

  const handleDangerConfirm = async () => {
    const result = await confirm({
      title: "危险操作",
      message: "这个操作可能会导致数据丢失，请谨慎操作！",
      type: "error",
      confirmText: "继续",
      cancelText: "取消",
    });

    if (result) {
      toast.error("操作已执行", "危险操作已完成");
    }
  };

  const handleInfoConfirm = async () => {
    const result = await confirm({
      title: "信息确认",
      message: "您确定要继续这个操作吗？",
      type: "info",
      confirmText: "确定",
      cancelText: "取消",
    });

    if (result) {
      toast.info("已确认", "您选择了继续操作");
    }
  };

  // 带回调的确认示例
  const handleConfirmWithCallback = async () => {
    const result = await confirm({
      title: "提交订单",
      message: "确认提交购买订单吗？订单提交后将扣除您的余额。",
      type: "info",
      confirmText: "提交",
      cancelText: "取消",
      onConfirm: async () => {
        // 模拟异步操作
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("订单提交中...");
      },
      onCancel: () => {
        console.log("用户取消了订单");
      },
    });

    if (result) {
      toast.success("订单提交成功", "您的订单已提交，请等待确认");
    }
  };

  return (
    <div className="p-[16px] space-y-[16px]">
      <h2 className="text-[1.25rem] font-[700] mb-[16px]" style={{ color: "var(--foreground)" }}>
        反馈组件使用示例
      </h2>

      {/* Toast消息示例 */}
      <Card>
        <h3 className="text-[1rem] font-[600] mb-[12px]" style={{ color: "var(--foreground)" }}>
          Toast 消息提示
        </h3>
        <p className="text-[0.875rem] mb-[16px]" style={{ color: "var(--tab-inactive-color)" }}>
          用于显示操作结果反馈，会自动消失。支持成功、错误、警告、信息四种类型。
        </p>
        <div className="grid grid-cols-2 gap-[8px]">
          <Button variant="primary" size="sm" onClick={handleSuccessToast}>
            成功提示
          </Button>
          <Button variant="secondary" size="sm" onClick={handleErrorToast}>
            错误提示
          </Button>
          <Button variant="outline" size="sm" onClick={handleWarningToast}>
            警告提示
          </Button>
          <Button variant="text" size="sm" onClick={handleInfoToast}>
            信息提示
          </Button>
        </div>
      </Card>

      {/* 确认对话框示例 */}
      <Card>
        <h3 className="text-[1rem] font-[600] mb-[12px]" style={{ color: "var(--foreground)" }}>
          Confirm 确认对话框
        </h3>
        <p className="text-[0.875rem] mb-[16px]" style={{ color: "var(--tab-inactive-color)" }}>
          用于重要操作的确认，需要用户主动确认或取消。支持不同的严重程度和自定义回调。
        </p>
        <div className="space-y-[8px]">
          <Button variant="outline" fullWidth onClick={handleConfirm}>
            删除确认 (警告类型)
          </Button>
          <Button variant="secondary" fullWidth onClick={handleDangerConfirm}>
            危险操作 (错误类型)
          </Button>
          <Button variant="primary" fullWidth onClick={handleInfoConfirm}>
            普通确认 (信息类型)
          </Button>
          <Button variant="text" fullWidth onClick={handleConfirmWithCallback}>
            带回调的确认
          </Button>
        </div>
      </Card>

      {/* 使用说明 */}
      <Card>
        <h3 className="text-[1rem] font-[600] mb-[12px]" style={{ color: "var(--foreground)" }}>
          使用方法
        </h3>
        <div className="text-[0.875rem] space-y-[8px]" style={{ color: "var(--tab-inactive-color)" }}>
          <p><strong>1. 引入 Hook：</strong></p>
          <code className="block bg-[var(--search-background)] p-[8px] rounded-[4px] text-[0.75rem]">
            import &#123; useFeedback &#125; from &quot;@/components/ui/Feedback&quot;;
          </code>
          
          <p><strong>2. 使用 Toast：</strong></p>
          <code className="block bg-[var(--search-background)] p-[8px] rounded-[4px] text-[0.75rem]">
            const &#123; toast &#125; = useFeedback();<br/>
            toast.success(&quot;标题&quot;, &quot;消息内容&quot;, 4000);
          </code>
          
          <p><strong>3. 使用 Confirm：</strong></p>
          <code className="block bg-[var(--search-background)] p-[8px] rounded-[4px] text-[0.75rem]">
            const &#123; confirm &#125; = useFeedback();<br/>
            const result = await confirm(&#123; title: &quot;确认&quot;, message: &quot;内容&quot; &#125;);
          </code>
        </div>
      </Card>
    </div>
  );
};

export default FeedbackExample; 