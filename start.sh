#!/bin/bash
# 开发服务器启动脚本
# 在沙箱中，后台进程会在 Bash 调用结束后被清理
# 使用 timeout 570 保持服务运行约 9.5 分钟
# 
# 用法: 在一个单独的 Bash 调用中执行此脚本
# Bash 工具参数 timeout 设为 600000 (10分钟)

cd "$(dirname "$0")/../mini-services/vue3-server"

# 停止旧实例
pkill -f "bun.*hot|next-server" 2>/dev/null
sleep 1

# 启动新实例
bun run dev > /home/z/my-project/dev.log 2>&1 &
echo "✅ 服务器已启动 PID: $!"

# 等待启动
sleep 4
curl -sS -o /dev/null -w "   HTTP %{http_code} ← http://localhost:3000\n" http://localhost:3000/

# 保持 Bash 调用活跃（服务运行期间进程不会被清理）
echo "⏳ 服务运行中... 请在 Preview Panel 查看（约 9 分钟内有效）"
sleep 565
echo "⏰ 维护时间结束"
