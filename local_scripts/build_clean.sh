#!/bin/bash
##用于解决因为缓存问题编译不通过的问题
rm -rf .hvigor/cache
rm -rf .idea
rm -rf build

#删除所有子模块的build目录。若当前目录有oh-package.json5文件，则说明该目录是个模块
find . -type d -name "build" -exec sh -c 'if [ -e "$(dirname {})/oh-package.json5" ]; then rm -rf "{}"; fi' \;

#删除所有子目录的oh_modules目录
find . -name oh_modules -type d -exec rm -rf {} +

#删除所有子目录的lock文件
find . -name 'oh-package-lock.json5' -type f -delete