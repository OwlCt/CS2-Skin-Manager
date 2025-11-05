# 端口配置指南 / Port Configuration Guide

## 中文说明

### 如何修改应用端口

Next.js 应用默认运行在 `3000` 端口。如果您需要修改端口，请按照以下步骤操作：

#### 1. 编辑 `.env` 文件

在项目根目录找到 `.env` 文件（如果没有，从 `.env.example` 复制一份）：

```bash
cp .env.example .env
```

#### 2. 设置 PORT 变量

在 `.env` 文件中添加或修改 `PORT` 变量：

```env
# 修改为您想要的端口号
PORT=8080
```

#### 3. 更新 NEXT_PUBLIC_URL

**重要**：如果您修改了端口，必须同时更新 `NEXT_PUBLIC_URL`，否则 Steam 登录将无法正常工作：

```env
PORT=8080
NEXT_PUBLIC_URL="http://localhost:8080"
```

#### 4. 重启应用

```bash
# 开发模式
bun run dev

# 生产模式
bun run start
```

应用现在会在您指定的端口启动！

### 常见端口选择

- **3000** - Next.js 默认端口
- **8080** - 常用的备用 HTTP 端口
- **4000** - 另一个常见的开发端口
- **5000** - 适合多项目开发环境

### 注意事项

1. ⚠️ **修改端口后必须更新 `NEXT_PUBLIC_URL`**，否则 Steam OpenID 回调会失败
2. 🔥 确保选择的端口没有被其他程序占用
3. 🛡️ 在生产环境中，建议使用反向代理（如 Nginx）而不是直接暴露应用端口

### 检查端口是否被占用

```bash
# Linux/Mac
lsof -i :8080

# Windows
netstat -ano | findstr :8080
```

---

## English Instructions

### How to Change Application Port

The Next.js application runs on port `3000` by default. To change the port:

#### 1. Edit `.env` File

Locate the `.env` file in the project root (copy from `.env.example` if it doesn't exist):

```bash
cp .env.example .env
```

#### 2. Set PORT Variable

Add or modify the `PORT` variable in your `.env` file:

```env
# Change to your desired port number
PORT=8080
```

#### 3. Update NEXT_PUBLIC_URL

**Important**: If you change the port, you must also update `NEXT_PUBLIC_URL`, or Steam login will fail:

```env
PORT=8080
NEXT_PUBLIC_URL="http://localhost:8080"
```

#### 4. Restart the Application

```bash
# Development mode
bun run dev

# Production mode
bun run start
```

The application will now start on your specified port!

### Common Port Choices

- **3000** - Next.js default port
- **8080** - Common alternative HTTP port
- **4000** - Another popular development port
- **5000** - Good for multi-project development environments

### Important Notes

1. ⚠️ **You must update `NEXT_PUBLIC_URL` after changing the port** or Steam OpenID callback will fail
2. 🔥 Ensure the chosen port is not already in use by another program
3. 🛡️ In production, it's recommended to use a reverse proxy (like Nginx) instead of exposing the application port directly

### Check if Port is in Use

```bash
# Linux/Mac
lsof -i :8080

# Windows
netstat -ano | findstr :8080
```

---

## Examples / 示例

### Development with Custom Port / 自定义端口开发

**.env**
```env
PORT=4000
NEXT_PUBLIC_URL="http://localhost:4000"
DATABASE_URL="mysql://user:pass@localhost:3306/wpui"
SESSION_PASSWORD="your-32-character-password-here"
STEAM_API_KEY="your-steam-api-key"
```

### Production with Domain / 生产环境使用域名

**.env**
```env
# Port can still be custom, but users access via domain
PORT=8080
NEXT_PUBLIC_URL="https://skins.example.com"
DATABASE_URL="mysql://user:pass@db-server:3306/wpui"
SESSION_PASSWORD="your-32-character-password-here"
STEAM_API_KEY="your-steam-api-key"
```

Then configure Nginx to proxy port 8080:

```nginx
server {
    listen 80;
    server_name skins.example.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Troubleshooting / 故障排查

### Issue: Port already in use / 端口已被占用

**Error message:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
1. Change to a different port in `.env`
2. Or kill the process using the port:
```bash
# Find process
lsof -i :3000

# Kill it (replace PID with actual process ID)
kill -9 PID
```

### Issue: Steam login fails after port change / 修改端口后 Steam 登录失败

**Cause:** `NEXT_PUBLIC_URL` doesn't match the actual port

**Solution:** Ensure both match:
```env
PORT=8080
NEXT_PUBLIC_URL="http://localhost:8080"  # ✅ Correct
# NOT http://localhost:3000  # ❌ Wrong
```

### Issue: Cannot access from other devices / 无法从其他设备访问

**Solution:** Bind to all interfaces:
```bash
# In package.json or command line
next dev -H 0.0.0.0 -p 3000
```

Update `.env`:
```env
PORT=3000
NEXT_PUBLIC_URL="http://192.168.1.100:3000"  # Use your local IP
```
