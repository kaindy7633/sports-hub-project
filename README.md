# SportsHub

## 项目结构

```text
.
├── sports-hub-app/    # React Native移动端应用
├── sports-hub-project/ # Nestjs后端服务
└── design/            # 设计文档和原型
```

## 技术栈

### 移动端 (sports-hub-app)

- React Native - 跨平台移动应用开发框架
- React Navigation - 路由导航
- Redux Toolkit - 状态管理
- React Native Elements - UI组件库

### 后端 (sports-hub-project)

- Nestjs - Node.js后端框架
- TypeORM - 数据库ORM
- PostgreSQL - 主数据库
- Redis - 缓存和会话管理
- JWT - 身份认证

## 开发环境要求

- Node.js >= 16
- npm >= 8
- PostgreSQL >= 14
- Redis >= 6

## 快速开始

### 安装依赖

使用以下命令同时安装前后端项目依赖：

```bash
npm run install:all
```

### 启动项目

使用以下命令可以启动前后端项目：

```bash
npm start
```

### 移动端

```bash
cd mobile
npm install
npm run ios     # 运行iOS模拟器
npm run android # 运行Android模拟器
```

### 后端

```bash
cd server
npm install
npm run start:dev # 开发模式启动
```
