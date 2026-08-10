---
title: "Z-Image Turbo 本地安装教程！最近非常火的文生图AI模型，到底怎么样？"
source: "https://www.freedidi.com/22006.html"
author:
  - "[[admin]]"
published: 2025-12-07
created: 2026-06-14
description: "今天给大家分享 Z-Image Turbo 的本地运行方法。这是一款支持 中文图片文字、无审查限制、可生成 NSFW 内容的开源文生图模型，对显存要求比较低，8G就能跑，关键是速度极快极快！！ 而且官方也提供了本地部署方案。只需要 ComfyUI  + 官方 Workflow 工作区，无论是 Windows 还是"
tags:
  - domain/meta
type: reference
status: active
updated: 2026-07-18
verification_status: partial
---
今天给大家分享 Z-Image Turbo 的本地运行方法。这是一款支持 中文图片文字、无审查限制、可生成 NSFW 内容的开源文生图模型，对显存要求比较低，8G就能跑，关键是速度极快极快！！ 而且官方也提供了本地部署方案。只需要 ComfyUI + 官方 Workflow 工作区，无论是 Windows 还是 Mac 都能轻松上手！

![46e81731cc20251207172932](https://www.freedidi.com/wp-content/uploads/2025/12/46e81731cc20251207172932-scaled.webp "Z-Image Turbo 本地安装教程！最近非常火的文生图AI模型，到底怎么样？ 1")

**本地安装方式：**

**1、免安装部署（一键赖人包）**

如果你没时间想看教程，不想通过手动下载安装，或者网络环境不允许，那么你可以选择直接打开下方的模型整合包，进行免手动部署

**Z-Image 模型整合包下载： 【 [点击前往](https://pan.quark.cn/s/6d5b085a3ede) 】**

**2、手动部署**

**部署前的准备：**

1、Python （推荐3.10~3.11版本）：【 **[点击前往](https://intl.ozabc.com/page/31.html)** 】

2、Git 最新版：【 **[点击前往](https://git-scm.com/)** 】

**步骤2：安装最新版的ComfyUI客户端**

**1、Windows 版：【 [点击下载](https://intl.ozabc.com/page/29.html) 】或 下载【 [免安装版](https://speed.ozabc.com/view.php?id=8e388060) 】**

**2、AMD显卡用户专用版：【 [点击下载](https://speed.ozabc.com/view.php?id=96d23e78) 】**

**3、Mac 版：【 [点击下载](https://intl.ozabc.com/page/29.html) 】**

![2fb8e3381a20251207132317](https://www.freedidi.com/wp-content/uploads/2025/12/2fb8e3381a20251207132317.webp "Z-Image Turbo 本地安装教程！最近非常火的文生图AI模型，到底怎么样？ 2")

注意：目前Windows支持N卡和CPU解码，Mac 版仅限M系列的芯片，如果你的A卡的话只能通过CPU解码，是支持输出的，只不过输入会大打折扣！

**【注意】：** 由于 ComfyUI 官方客户端所必须的环境安装包和AI模型的下载是需要外网环境的，如果你无法下载的话，

那么可以通过【 **[安全加密VPN](https://go.getproton.me/aff_c?offer_id=26&aff_id=1905)** 】来进行解决【 **[点击下载](https://go.getproton.me/aff_c?offer_id=26&aff_id=1905)** 】，并开启TUN全局模式！

![e84c703f6a20251207175410](https://www.freedidi.com/wp-content/uploads/2025/12/e84c703f6a20251207175410-scaled.webp "Z-Image Turbo 本地安装教程！最近非常火的文生图AI模型，到底怎么样？ 3")

**步骤3：获取工作流**

点击下载【 **[生图工作流](https://docs.comfy.org/tutorials/image/z-image/z-image-turbo)** 】或 【 **[备用下载](https://intl.ozabc.com/page/30.html)** 】，然后往下拉找到「Download JSON Workflow File」按钮，如果你按下这个按钮会直接打开 JSON 档案（也就是显示一堆代码），鼠标右键另存为到桌面即可。

![d1c8300cca20251207132830](https://www.freedidi.com/wp-content/uploads/2025/12/d1c8300cca20251207132830.webp "Z-Image Turbo 本地安装教程！最近非常火的文生图AI模型，到底怎么样？ 4")

下载好工作流以后将其拖入ComfyUI工作区，它会提示你下载安装必备的AI模型，等它下载安装完成以后就可以使用！

当然如果你电脑硬件不达标，那么可以使用免费的在线平台来使用，比如使用通过托管在Huggingface上的也可以生成！它是完全免费的，但是在晚高峰期间，使用的人比较多，可能需要排队！

【 **[点击前往](https://huggingface.co/spaces/mrfakename/Z-Image-Turbo)** 】Z-Image Turbo 免费在线平台

![6504561b5220251207133937](https://www.freedidi.com/wp-content/uploads/2025/12/6504561b5220251207133937-scaled.webp "Z-Image Turbo 本地安装教程！最近非常火的文生图AI模型，到底怎么样？ 5")

**生图提示词分享：**

**写实写真风（自然光高颜值）**

```js
一张超逼真的东亚美女照片，肌肤自然光滑，乌黑亮丽，笑容甜美，环境光线温暖柔和，营造出电影般的肖像效果。照片采用浅景深，双眼细节丰富，8K超高清分辨率，照片级真实感，专业摄影，面部细节极其清晰，构图完美，背景虚化柔和，时尚大片风格。
```

**甜美日系风**

```js
可爱的日本女孩，身穿校服风格的休闲装，柔和的粉彩色调，甜美的笑容，精致的妆容，棕色的眼睛，蓬松的发型，明亮的日光，可爱至极的审美，杂志封面风格，细腻的肌肤纹理，清晰的五官，完美的光线，HDR
```

**韩风冷淡高级感**

```js
韩国时尚模特，优雅简约的美貌，柔顺的直发，水润的双唇，完美对称的脸型，中性色调的影棚灯光，Vogue风格的摄影手法，精致的妆容，锐利的眼神，高端人像镜头效果，超高清画质，时尚现代的造型
```

**特殊的内容：**

```js
beautiful adult East Asian woman, sensual artistic portrait, soft warm lighting, delicate skin texture, alluring eyes, subtle seductive expression, elegant pose, smooth body curve, fashion lingerie style, cinematic shadow, high-resolution photography, detailed composition, intimate mood, magazine photoshoot
```