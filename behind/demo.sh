#!/bin/bash

echo "============================="
echo "[DEBUG] 脚本开始执行"
# 输出当前时间
date "+%Y-%m-%d %H:%M:%S"
echo "Start"

# 验证WebHook参数
# 定义项目名称
projectName="fronthosting"
# GitLab 主机与端口（如端口非22请修改此变量）
gitHost="192.168.31.229"
gitPort="22"
echo "[DEBUG] 项目名称：$projectName"

# Git项目配置
echo "[DEBUG] 设置Git配置"

# 确保 .ssh 目录存在
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 添加 GitLab 主机指纹（增强调试输出，按类型依次尝试）
echo "[DEBUG] 添加 GitLab(${gitHost}:${gitPort}) 的主机指纹"
types="ed25519 ecdsa rsa"
added=""
for t in $types; do
    echo "[DEBUG] 执行: ssh-keyscan -p ${gitPort} -t ${t} ${gitHost}"
    scan_output=$(ssh-keyscan -p "${gitPort}" -t "${t}" "${gitHost}" 2>&1)
    scan_rc=$?
    echo "[DEBUG] ssh-keyscan 退出码: ${scan_rc}"
    echo "[DEBUG] ssh-keyscan 输出: ${scan_output}"
    if [ ${scan_rc} -eq 0 ] && echo "${scan_output}" | grep -E "^((${gitHost})|\\[${gitHost}\\])\\s" >/dev/null; then
        echo "${scan_output}" >> ~/.ssh/known_hosts
        echo "[DEBUG] 已写入 known_hosts，类型: ${t}"
        added="yes"
        break
    else
        echo "[DEBUG] 类型 ${t} 未获取到有效主机指纹，继续尝试下一类型"
    fi
done
if [ -z "${added}" ]; then
    echo "错误：写入 GitLab 主机指纹失败（可能端口/类型不匹配或网络问题）"
    echo "提示：可在服务器上手动执行 -> ssh-keyscan -p ${gitPort} ${gitHost}"
    echo "End"
    exit 1
fi
chmod 644 ~/.ssh/known_hosts

gitPath="/www/wwwroot/$projectName"
gitHttp="git@${gitHost}:caixukun/fronthosting.git"

echo "[DEBUG] Web站点路径：$gitPath"
echo "[DEBUG] Git URL：$gitHttp"

# 使用部署私钥并强制校验主机指纹
# 公钥复制位置：请将 ~/.ssh/id_ed25519_fronthosting.pub 的内容
# 复制到 GitLab 项目 → Settings → Repository → Deploy Keys（只读即可）
# 私钥保存在服务器：~/.ssh/id_ed25519_fronthosting（不要放到代码仓库）
if [ ! -f ~/.ssh/id_ed25519_fronthosting ]; then
    echo "错误：未找到私钥 ~/.ssh/id_ed25519_fronthosting"
    echo "请先在服务器执行 ssh-keygen 生成密钥，并在 GitLab 添加公钥"
    echo "示例：ssh-keygen -t ed25519 -C \"webhook-deploy@fronthosting\" -f ~/.ssh/id_ed25519_fronthosting"
    echo "End"
    exit 1
fi
export GIT_SSH_COMMAND="ssh -p ${gitPort} -i ~/.ssh/id_ed25519_fronthosting -o StrictHostKeyChecking=yes"

# 如果目录不存在则创建
echo "[DEBUG] 检查目录是否存在：$gitPath"
if [ ! -d "$gitPath" ]; then
    echo "[DEBUG] 该项目路径不存在"
    echo "[DEBUG] 尝试新建项目目录"
    mkdir -p "$gitPath" || {
        echo "错误：创建目录失败"
        echo "End"
        exit 1
    }
fi

# 切换到项目目录
echo "[DEBUG] 尝试切换到目录：$gitPath"
cd "$gitPath" || {
    echo "错误：无法切换到项目目录"
    echo "End"
    exit 1
}

# 将日志输出到项目根目录
LOG_FILE="$gitPath/deploy.log"
echo "[DEBUG] 日志文件：$LOG_FILE"
if command -v tee >/dev/null 2>&1; then
    exec > >(tee -a "$LOG_FILE") 2>&1
else
    echo "[DEBUG] 未找到 tee，采用直接重定向到日志文件"
    exec >> "$LOG_FILE" 2>&1
fi

# 配置 Git 安全目录，避免 dubious ownership 报错
echo "[DEBUG] 配置 Git safe.directory：$gitPath"
# 设置 HOME 以确保 global 配置可写；若未设置则按用户推断
if [ -z "$HOME" ]; then
  if [ "$(id -un)" = "root" ]; then
    export HOME="/root"
  else
    export HOME="/home/$(id -un)"
  fi
  echo "[DEBUG] 未检测到 HOME，已设置为：$HOME"
fi

# 记录当前用户与目录所有者
currentUser="$(id -un)"
repoOwner="$(stat -c %U "$gitPath" 2>/dev/null || echo unknown)"
echo "[DEBUG] 当前用户：$currentUser，仓库目录所有者：$repoOwner"

# 优先尝试 global，其次尝试 system（需要有权限）
git config --global --add safe.directory "$gitPath" 2>&1 || echo "[DEBUG] global safe.directory 设置失败"
git config --system --add safe.directory "$gitPath" 2>&1 || echo "[DEBUG] system safe.directory 设置失败（可能无权限）"

# 初始化或更新git仓库
echo "[DEBUG] 检查是否存在.git目录"
if [ ! -d ".git" ]; then
    echo "[DEBUG] .git目录不存在，开始克隆"
    echo "[DEBUG] 执行: git clone $gitHttp ."
    # 添加 -v 参数来显示详细信息
    git clone -v "$gitHttp" . 2>&1 || {
        echo "[DEBUG] 克隆失败的详细错误信息："
        echo "$?"
        echo "错误：Git克隆失败"
        echo "End"
        exit 1
    }
else
    # 获取最新代码并重置到master分支
    echo "[DEBUG] 仓库已存在，开始更新"
    # 显示当前远程地址
    currentRemote=$(git -c safe.directory="$gitPath" remote get-url origin 2>/dev/null || echo "")
    echo "[DEBUG] 当前 origin 远程：${currentRemote}"
    if [ -z "${currentRemote}" ]; then
        echo "[DEBUG] 未检测到 origin，设置为：${gitHttp}"
        git -c safe.directory="$gitPath" remote add origin "${gitHttp}" 2>&1 || {
            echo "错误：无法添加 origin 远程"
            echo "End"
            exit 1
        }
    elif [ "${currentRemote}" != "${gitHttp}" ]; then
        echo "[DEBUG] origin 与目标不一致，修正为：${gitHttp}"
        git -c safe.directory="$gitPath" remote set-url origin "${gitHttp}" 2>&1 || {
            echo "错误：设置 origin 远程失败"
            echo "End"
            exit 1
        }
    fi

    # 事先测试：是否可读取远程仓库
    echo "[DEBUG] 执行: git ls-remote ${gitHttp} -h HEAD"
    git -c safe.directory="$gitPath" ls-remote "${gitHttp}" -h HEAD 2>&1 || {
        echo "错误：无法访问远程仓库（ls-remote 失败）。请检查 Deploy Key 或权限。"
        echo "End"
        exit 1
    }

    echo "[DEBUG] 执行: git fetch --prune origin"
    git -c safe.directory="$gitPath" fetch --prune origin 2>&1 || {
        echo "错误：Git fetch失败（请检查上面的错误输出）"
        echo "End"
        exit 1
    }

    # 获取默认分支名称（更稳健：从远程解析 HEAD）
    echo "[DEBUG] 解析远程默认分支（ls-remote --symref）"
    headRef=$(git -c safe.directory="$gitPath" ls-remote --symref "${gitHttp}" HEAD 2>&1)
    echo "[DEBUG] symref 输出：${headRef}"
    defaultBranch=$(echo "$headRef" | awk '/^ref:/ {print $2}' | sed 's@^refs/heads/@@')
    if [ -z "$defaultBranch" ]; then
        echo "[DEBUG] 未从 symref 解析到默认分支，尝试探测 main/master"
        if git -c safe.directory="$gitPath" ls-remote "${gitHttp}" refs/heads/main | grep -q .; then
            defaultBranch="main"
        elif git -c safe.directory="$gitPath" ls-remote "${gitHttp}" refs/heads/master | grep -q .; then
            defaultBranch="master"
        else
            echo "警告：远程未发现 main/master 分支，回退使用 main"
            defaultBranch="main"
        fi
    fi
    echo "[DEBUG] 默认分支：$defaultBranch"

    git -c safe.directory="$gitPath" reset --hard "origin/$defaultBranch" || {
        echo "错误：Git reset失败"
        echo "End"
        exit 1
    }

    echo "[DEBUG] 拉取分支：$defaultBranch"
    git -c safe.directory="$gitPath" pull origin "$defaultBranch" || {
        echo "错误：Git pull失败"
        echo "End"
        exit 1
    }
fi

# 设置目录权限
echo "设置目录权限"
chown -R www:www "$gitPath" || {
    echo "错误：设置权限失败"
    echo "End"
    exit 1
}

echo "End"
exit 0