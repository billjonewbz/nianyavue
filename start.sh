#!/bin/bash
# 一键启动脚本 - 复制这行命令即可启动项目
cd /home/z/my-project && timeout 580 bun run dev &>/home/z/my-project/dev.log &
sleep 6 && curl -sS -o /dev/null -w "✅ Next.js 已启动 HTTP %{http_code}\n" http://localhost:3000/
