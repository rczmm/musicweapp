# 音乐播客小程序

## 项目简介

本项目是一个基于 Taro 和 Vue3 开发的跨平台音乐播客小程序。旨在为用户提供一个简洁、流畅的界面来发现、收听和分享他们喜欢的播客节目。

主要功能包括：

*   浏览推荐播客和热门榜单
*   搜索特定播客或单集
*   在线播放播客音频
*   查看播客详情和剧集列表
*   （可选）用户评论、点赞和分享等社交功能
*   （可选）用户个人中心，管理收藏和收听历史

## 技术栈

*   **框架:** [Taro](https://taro.jd.com/) (使用 Vue3 模式)
*   **UI 框架:** Taro UI (或其他 Vue3 兼容 UI 库，如果使用的话)
*   **状态管理:** [Pinia](https://pinia.vuejs.org/) (推荐，如果需要复杂状态管理) 或 Vuex 4
*   **编程语言:** [TypeScript](https://www.typescriptlang.org/)
*   **样式:** SCSS/Sass

## 项目结构

```
├── config                   # Taro 项目配置目录
│   ├── dev.ts               # 开发环境配置
│   ├── index.ts             # 默认配置
│   └── prod.ts              # 生产环境配置
├── src                      # 源代码目录
│   ├── app.config.ts        # 全局配置文件
│   ├── app.scss             # 全局样式文件
│   ├── app.ts               # 项目入口文件
│   ├── index.html           # H5 模板文件
│   ├── components           # 可复用组件目录
│   │   └── MiniPlayer       # 示例：迷你播放器组件
│   ├── pages                # 页面目录
│   │   ├── index            # 首页
│   │   ├── player           # 播放页
│   │   ├── podcast          # 播客详情页
│   │   ├── search           # 搜索页
│   │   └── ...              # 其他页面
│   ├── services             # 服务层 (API 请求等)
│   │   ├── audioService.ts  # 音频服务
│   │   └── musicService.ts  # 音乐/播客数据服务
│   ├── store                # 状态管理 (Pinia/Vuex) 目录 (如果使用)
│   ├── types                # TypeScript 类型定义目录
│   └── utils                # 工具函数目录
├── package.json             # 项目依赖和脚本配置
├── project.config.json      # 微信小程序项目配置文件
├── project.tt.json          # 抖音小程序项目配置文件 (如果需要)
├── tsconfig.json            # TypeScript 配置文件
└── README.md                # 项目说明文档
```

**主要目录说明:**

*   `config/`: 存放 Taro 的编译配置。
*   `src/`: 包含所有业务逻辑和 UI 代码。
*   `src/app.ts`/`app.config.ts`: 小程序全局入口和配置。
*   `src/components/`: 存放跨页面复用的 UI 组件。
*   `src/pages/`: 存放各个页面的代码，每个子目录代表一个页面。
*   `src/services/`: 封装与后端 API 的交互逻辑。
*   `src/store/`: (可选) 存放 Pinia 或 Vuex 的状态管理模块。
*   `src/types/`: 存放共享的 TypeScript 类型定义。

## 安装指南

1.  **克隆项目:**
    ```bash
    git clone <your-repository-url>
    cd <project-directory>
    ```

2.  **安装依赖:**
    推荐使用 `yarn` 或 `npm`。

    使用 `yarn`:
    ```bash
    yarn install
    ```

    或者使用 `npm`:
    ```bash
    npm install
    ```

## 运行项目

Taro 支持将项目编译到不同平台（微信小程序、H5、React Native 等）。

**开发环境:**

*   **运行到微信小程序:**
    ```bash
    yarn dev:weapp
    # 或 npm run dev:weapp
    ```
    然后在微信开发者工具中导入项目根目录。

*   **运行到 H5:**
    ```bash
    yarn dev:h5
    # 或 npm run dev:h5
    ```
    然后在浏览器中打开 `http://localhost:10086` (或指定的端口)。

*   **运行到其他平台 (如抖音小程序):**
    ```bash
    yarn dev:tt
    # 或 npm run dev:tt
    ```

**生产环境构建:**

*   **构建微信小程序:**
    ```bash
    yarn build:weapp
    # 或 npm run build:weapp
    ```
    构建产物在 `dist` 目录下。

*   **构建 H5:**
    ```bash
    yarn build:h5
    # 或 npm run build:h5
    ```
    构建产物在 `dist` 目录下。

*   **构建其他平台:**
    ```bash
    yarn build:tt
    # 或 npm run build:tt
    ```

## 主要功能

*   **首页浏览:** 展示推荐播客、最新单集、排行榜等。
*   **播客详情:** 查看播客的封面、名称、作者、描述以及所有单集列表。
*   **音频播放:**
    *   支持在线播放播客单集。
    *   提供播放/暂停、进度条拖动、上一首/下一首等基本控制。
    *   (可选) 后台播放能力。
    *   全局迷你播放器，方便在浏览其他页面时控制播放。
*   **搜索功能:** 根据关键词搜索播客或单集。
*   **（可选）社交互动:**
    *   评论功能：用户可以对单集发表评论。
    *   点赞/收藏：用户可以标记喜欢的播客或单集。
*   **（可选）个人中心:**
    *   管理用户收藏的播客。
    *   查看收听历史。

## 贡献指南

欢迎参与项目贡献！(此处可以添加具体的贡献流程和规范，或暂时留空)

## 许可证

[MIT](LICENSE) (或其他许可证，请根据实际情况修改)