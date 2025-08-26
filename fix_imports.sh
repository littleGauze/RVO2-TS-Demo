#!/bin/bash

echo "修复JavaScript文件中的导入语句..."

# 进入dist目录
cd dist

# 修复所有.js文件中的导入语句，添加.js扩展名
echo "修复导入语句..."

# 修复相对路径导入（不包含.js扩展名的）
find . -name "*.js" -exec sed -i '' 's/from '\''\.\/\([^'\'']*\)'\''/from '\''\.\/\1\.js'\''/g' {} \;

# 修复index导入
find . -name "*.js" -exec sed -i '' 's/from '\''\.\/index'\''/from '\''\.\/index\.js'\''/g' {} \;

echo "导入语句修复完成！"
echo "现在可以重新测试演示程序了。"
