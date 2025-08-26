#!/bin/bash

echo "启动RVO2演示HTTP服务器..."
echo "访问地址: http://localhost:3000/demo.html"
echo "按 Ctrl+C 停止服务器"
echo ""

# 检查Python3是否可用
if command -v python3 &> /dev/null; then
    python3 -m http.server 3000
elif command -v python &> /dev/null; then
    python -m http.server 3000
else
    echo "错误: 未找到Python，请安装Python3"
    exit 1
fi
