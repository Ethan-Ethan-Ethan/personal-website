---
title: "LTX-2：8GB 显卡也能跑的“全能型” AI音视频生成模型，老司机秒懂！"
source: "https://www.freedidi.com/22475.html"
author:
  - "[[admin]]"
published: 2026-01-14
created: 2026-06-14
description: "最近 AI 视频圈可以说是被一个名字刷屏了 —— LTX-2。它不仅完全免费开源，而且直接把现在最前沿的视频生成能力，一股脑塞进了一个模型里。LTX-2 是第一个基于 DiT 的音视频基础模型，它将现代视频生成的所有核心功能集成在一个模型中：同步音频和视频、高保真度、多种性能模式、可用于生产的输出、API"
tags:
  - domain/meta
type: reference
status: active
updated: 2026-07-18
verification_status: partial
---
最近 AI 视频圈可以说是被一个名字刷屏了 —— **LTX-2** 。它不仅完全免费开源，而且直接把现在最前沿的视频生成能力，一股脑塞进了一个模型里。LTX-2 是第一个基于 DiT 的音视频基础模型，它将现代视频生成的所有核心功能集成在一个模型中：同步音频和视频、高保真度、多种性能模式、可用于生产的输出、API 访问和开放访问！

![68f8cd36ad8c191e108758bd ltx 2 Open Graph](https://www.freedidi.com/wp-content/uploads/2026/01/68f8cd36ad8c191e108758bd_ltx-2-Open-Graph.webp "LTX-2：8GB 显卡也能跑的“全能型” AI音视频生成模型，老司机秒懂！ 1")

更离谱的是：8GB 显存的家用显卡就能跑本地生成，不用排队、不用云端、不怕限速想生成多少就生成多少！可以说，这是第一次，普通人真正有了“自己的视频生成工厂”。 **关键是它可以生成那种 “老司机” 秒懂的AI视频，本地生成没有任何限制……**

![2026 01 14 01 34 53.00 02 58 16.Still002 scaled](https://www.freedidi.com/wp-content/uploads/2026/01/2026-01-14-01-34-53.00_02_58_16.Still002-scaled.webp "LTX-2：8GB 显卡也能跑的“全能型” AI音视频生成模型，老司机秒懂！ 2")

对中文的提示词理解也超准确，生成的人物也非常适合我们亚洲人的审美标准，比如下方的生成效果，无论是男孩还是女孩，颜值确实很高！

![屏幕截图 2026 01 14 143422 1](https://www.freedidi.com/wp-content/uploads/2026/01/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2026-01-14-143422-1.webp "LTX-2：8GB 显卡也能跑的“全能型” AI音视频生成模型，老司机秒懂！ 3")

## 工作流下载：

## 【点击前往】

LTX-2 开源项目：https://github.com/Lightricks/LTX-2 或 【 **[备用下载](https://pan.quark.cn/s/377be4d1c4c8)** 】

## 快速部署：

\# Clone the repository

git clone https://github.com/Lightricks/LTX-2.git

cd LTX-2

\# Set up the environment

uv sync --frozen

source.venv/bin/activate

\# Clone the repository git clone https://github.com/Lightricks/LTX-2.git cd LTX-2 # Set up the environment uv sync --frozen source.venv/bin/activate

```js
# Clone the repository
git clone https://github.com/Lightricks/LTX-2.git
cd LTX-2

# Set up the environment
uv sync --frozen
source .venv/bin/activate
```

### 所需模型

[从LTX-2 HuggingFace 存储库](https://huggingface.co/Lightricks/LTX-2) 下载以下模型：

**LTX-2 型号检查点** （选择并下载以下其中一项）

- [`ltx-2-19b-dev-fp8.safetensors`](https://huggingface.co/Lightricks/LTX-2/blob/main/ltx-2-19b-dev-fp8.safetensors) – [下载](https://huggingface.co/Lightricks/LTX-2/resolve/main/ltx-2-19b-dev-fp8.safetensors)
- [`ltx-2-19b-dev.safetensors`](https://huggingface.co/Lightricks/LTX-2/blob/main/ltx-2-19b-dev.safetensors) – [下载](https://huggingface.co/Lightricks/LTX-2/resolve/main/ltx-2-19b-dev.safetensors)
- [`ltx-2-19b-distilled.safetensors`](https://huggingface.co/Lightricks/LTX-2/blob/main/ltx-2-19b-distilled.safetensors) – [下载](https://huggingface.co/Lightricks/LTX-2/resolve/main/ltx-2-19b-distilled.safetensors)
- [`ltx-2-19b-distilled-fp8.safetensors`](https://huggingface.co/Lightricks/LTX-2/blob/main/ltx-2-19b-distilled-fp8.safetensors) – [下载](https://huggingface.co/Lightricks/LTX-2/resolve/main/ltx-2-19b-distilled-fp8.safetensors)

**空间放大器** – 此存储库中当前两阶段流水线实现所必需的

- [`ltx-2-spatial-upscaler-x2-1.0.safetensors`](https://huggingface.co/Lightricks/LTX-2/blob/main/ltx-2-spatial-upscaler-x2-1.0.safetensors) – [下载](https://huggingface.co/Lightricks/LTX-2/resolve/main/ltx-2-spatial-upscaler-x2-1.0.safetensors)

**时间放大器** – 该模型支持此功能，并且是未来管道实现所必需的。

- [`ltx-2-temporal-upscaler-x2-1.0.safetensors`](https://huggingface.co/Lightricks/LTX-2/blob/main/ltx-2-temporal-upscaler-x2-1.0.safetensors) – [下载](https://huggingface.co/Lightricks/LTX-2/resolve/main/ltx-2-temporal-upscaler-x2-1.0.safetensors)

**精简版 LoRA** – 此存储库中当前两阶段流水线实现所必需的（DistilledPipeline 和 ICLoraPipeline 除外）

- [`ltx-2-19b-distilled-lora-384.safetensors`](https://huggingface.co/Lightricks/LTX-2/blob/main/ltx-2-19b-distilled-lora-384.safetensors) – [下载](https://huggingface.co/Lightricks/LTX-2/resolve/main/ltx-2-19b-distilled-lora-384.safetensors)

**Gemma文本编码器** （从存储库下载所有资源）

- [`Gemma 3`](https://huggingface.co/google/gemma-3-12b-it-qat-q4_0-unquantized/tree/main)

**LoRA**

- [`LTX-2-19b-IC-LoRA-Canny-Control`](https://huggingface.co/Lightricks/LTX-2-19b-IC-LoRA-Canny-Control) – [下载](https://huggingface.co/Lightricks/LTX-2-19b-IC-LoRA-Canny-Control/resolve/main/ltx-2-19b-ic-lora-canny-control.safetensors)
- [`LTX-2-19b-IC-LoRA-Depth-Control`](https://huggingface.co/Lightricks/LTX-2-19b-IC-LoRA-Depth-Control) – [下载](https://huggingface.co/Lightricks/LTX-2-19b-IC-LoRA-Depth-Control/resolve/main/ltx-2-19b-ic-lora-depth-control.safetensors)
- [`LTX-2-19b-IC-LoRA-Detailer`](https://huggingface.co/Lightricks/LTX-2-19b-IC-LoRA-Detailer) – [下载](https://huggingface.co/Lightricks/LTX-2-19b-IC-LoRA-Detailer/resolve/main/ltx-2-19b-ic-lora-detailer.safetensors)
- [`LTX-2-19b-IC-LoRA-Pose-Control`](https://huggingface.co/Lightricks/LTX-2-19b-IC-LoRA-Pose-Control) – [下载](https://huggingface.co/Lightricks/LTX-2-19b-IC-LoRA-Pose-Control/resolve/main/ltx-2-19b-ic-lora-pose-control.safetensors)
- [`LTX-2-19b-LoRA-Camera-Control-Dolly-In`](https://huggingface.co/Lightricks/LTX-2-19b-LoRA-Camera-Control-Dolly-In) – [下载](https://huggingface.co/Lightricks/LTX-2-19b-LoRA-Camera-Control-Dolly-In/resolve/main/ltx-2-19b-lora-camera-control-dolly-in.safetensors)
- [`LTX-2-19b-LoRA-Camera-Control-Dolly-Left`](https://huggingface.co/Lightricks/LTX-2-19b-LoRA-Camera-Control-Dolly-Left) – [下载](https://huggingface.co/Lightricks/LTX-2-19b-LoRA-Camera-Control-Dolly-Left/resolve/main/ltx-2-19b-lora-camera-control-dolly-left.safetensors)
- [`LTX-2-19b-LoRA-Camera-Control-Dolly-Out`](https://huggingface.co/Lightricks/LTX-2-19b-LoRA-Camera-Control-Dolly-Out) – [下载](https://huggingface.co/Lightricks/LTX-2-19b-LoRA-Camera-Control-Dolly-Out/resolve/main/ltx-2-19b-lora-camera-control-dolly-out.safetensors)
- [`LTX-2-19b-LoRA-Camera-Control-Dolly-Right`](https://huggingface.co/Lightricks/LTX-2-19b-LoRA-Camera-Control-Dolly-Right) – [下载](https://huggingface.co/Lightricks/LTX-2-19b-LoRA-Camera-Control-Dolly-Right/resolve/main/ltx-2-19b-lora-camera-control-dolly-right.safetensors)
- [`LTX-2-19b-LoRA-Camera-Control-Jib-Down`](https://huggingface.co/Lightricks/LTX-2-19b-LoRA-Camera-Control-Jib-Down) – [下载](https://huggingface.co/Lightricks/LTX-2-19b-LoRA-Camera-Control-Jib-Down/resolve/main/ltx-2-19b-lora-camera-control-jib-down.safetensors)
- [`LTX-2-19b-LoRA-Camera-Control-Jib-Up`](https://huggingface.co/Lightricks/LTX-2-19b-LoRA-Camera-Control-Jib-Up) – [下载](https://huggingface.co/Lightricks/LTX-2-19b-LoRA-Camera-Control-Jib-Up/resolve/main/ltx-2-19b-lora-camera-control-jib-up.safetensors)
- [`LTX-2-19b-LoRA-Camera-Control-Static`](https://huggingface.co/Lightricks/LTX-2-19b-LoRA-Camera-Control-Static) – [下载](https://huggingface.co/Lightricks/LTX-2-19b-LoRA-Camera-Control-Static/resolve/main/ltx-2-19b-lora-camera-control-static.safetensors)

### 可用管道

- **[TI2VidTwoStagesPipeline](https://github.com/Lightricks/LTX-2/blob/main/packages/ltx-pipelines/src/ltx_pipelines/ti2vid_two_stages.py)** – 生产级文本/图像转视频，支持 2 倍升频（推荐）
- **[TI2VidOneStagePipeline](https://github.com/Lightricks/LTX-2/blob/main/packages/ltx-pipelines/src/ltx_pipelines/ti2vid_one_stage.py)** – 用于快速原型设计的单阶段生成
- **[DistilledPipeline](https://github.com/Lightricks/LTX-2/blob/main/packages/ltx-pipelines/src/ltx_pipelines/distilled.py)** – 具有 8 个预定义 sigma 的最快推理
- **[ICLoraPipeline](https://github.com/Lightricks/LTX-2/blob/main/packages/ltx-pipelines/src/ltx_pipelines/ic_lora.py)** – 视频到视频和图像到视频的转换
- **[关键帧插值管道](https://github.com/Lightricks/LTX-2/blob/main/packages/ltx-pipelines/src/ltx_pipelines/keyframe_interpolation.py)** – 在关键帧图像之间进行插值

### 优化技巧

- **使用 DistilledPipeline** – 仅使用 8 个预定义 sigma 即可实现最快的推理（第一阶段 8 个步骤，第二阶段 4 个步骤）
- **启用 FP8 转换器** – 降低内存占用： `--enable-fp8` （CLI）或 `fp8transformer=True` （Python）
- **安装注意力机制优化** – 使用 xFormers ( `uv sync --extra xformers`) 或适用于 Hopper GPU 的 [Flash Attention 3](https://github.com/Dao-AILab/flash-attention)
- **使用梯度估计** ——在保持质量的前提下，将推理步骤从 40 步减少到 20-30 步（参见 [流程文档](https://github.com/Lightricks/LTX-2/blob/main/packages/ltx-pipelines/README.md#denoising-loop-optimization) ）。
- **跳过内存清理** – 如果您的显存足够，请禁用阶段间的自动内存清理，以加快处理速度。
- **选择单阶段流水线** ——适用 `TI2VidOneStagePipeline` 于不需要高分辨率时快速生成图像的情况。

**当然对于新手来说，我建议大家直接使用ComfyUI 进行一键部署，会超级方便！**

## ComfyUI 最新版：【点击下载】

![屏幕截图 2026 01 14 144611 scaled](https://www.freedidi.com/wp-content/uploads/2026/01/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2026-01-14-144611-scaled.webp "LTX-2：8GB 显卡也能跑的“全能型” AI音视频生成模型，老司机秒懂！ 4")

**【注意】：** 由于 ComfyUI 官方客户端所必须的环境安装包和AI模型的下载是需要外网环境，如果如果你无法下载的话，那么可以通过【 **[安全加密VPN](https://go.getproton.me/aff_c?offer_id=26&aff_id=1905&source=blog)** 】来进行解决【 **[点击下载](https://go.getproton.me/aff_c?offer_id=26&aff_id=1905&source=blog)** 】，并开启TUN全局模式！

![e84c703f6a20251207175410](https://www.freedidi.com/wp-content/uploads/2025/12/e84c703f6a20251207175410-scaled.webp "LTX-2：8GB 显卡也能跑的“全能型” AI音视频生成模型，老司机秒懂！ 5")

安装以后在模板中心，选择你对应的LTX-2 音视频模型，支持文生视频、图生视频、视频编辑等，如果显存比较小的，建议选择下方的量化版，这样可以避免爆显存的问题

![2026 01 14 01 34 53.00 08 56 07.Still003 scaled](https://www.freedidi.com/wp-content/uploads/2026/01/2026-01-14-01-34-53.00_08_56_07.Still003-scaled.webp "LTX-2：8GB 显卡也能跑的“全能型” AI音视频生成模型，老司机秒懂！ 6")

## 8G 显存版模型：

1、【 **[点击下载](https://huggingface.co/Kijai/LTXV2_comfy/tree/main/diffusion_models)** 】 或 【 **[网盘下载](https://pan.quark.cn/s/9e9f8379d34e)** 】由KJ大佬提供

直接选择里面的 ltx-2-19b-distilled\_Q4\_K\_M.gguf。当然，ltx-2-19b-distilled\_Q8\_0.gguf也可以！

![屏幕截图 2026 01 14 192704 scaled](https://www.freedidi.com/wp-content/uploads/2026/01/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2026-01-14-192704-scaled.webp "LTX-2：8GB 显卡也能跑的“全能型” AI音视频生成模型，老司机秒懂！ 7")

2、【 **[点击下载](https://huggingface.co/Lightricks/LTX-2/tree/main)** 】 适合8G以下显存

**其次，VAE模型** 使用KJ的 VAE！AUDIO VAE模型也是【 **[点击下载](https://huggingface.co/Kijai/LTXV2_comfy/tree/main/VAE)** 】；

![屏幕截图 2026 01 14 192845 scaled](https://www.freedidi.com/wp-content/uploads/2026/01/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2026-01-14-192845-scaled.webp "LTX-2：8GB 显卡也能跑的“全能型” AI音视频生成模型，老司机秒懂！ 8")

**然后，text\_encoders** ：我们去打开GGUF量化版的unsloth/gemma-3-12b-it-GGUF 【 **[点击下载](https://huggingface.co/unsloth/gemma-3-12b-it-GGUF/tree/main)** 】

![屏幕截图 2026 01 14 193020 scaled](https://www.freedidi.com/wp-content/uploads/2026/01/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2026-01-14-193020-scaled.webp "LTX-2：8GB 显卡也能跑的“全能型” AI音视频生成模型，老司机秒懂！ 9")

Q４版，Q２也可以。还有两个文件很重要，也要同时放到 **text\_encoders**

目录下：去ltx-2官方模型库中下载这个：

![屏幕截图 2026 01 14 193124](https://www.freedidi.com/wp-content/uploads/2026/01/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2026-01-14-193124.webp "LTX-2：8GB 显卡也能跑的“全能型” AI音视频生成模型，老司机秒懂！ 10")

以及，去KJ库中下载：

![屏幕截图 2026 01 14 193211](https://www.freedidi.com/wp-content/uploads/2026/01/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2026-01-14-193211.webp "LTX-2：8GB 显卡也能跑的“全能型” AI音视频生成模型，老司机秒懂！ 11")

也放在models\\text\_encoders下。

请将以下模型放入 ComfyUI 对应的目录下（文件名仅供参考，认准关键词）：

| 模型类型 | 存放路径 | 下载说明 |
| --- | --- | --- |
| 视频主模型 (UNET) | models/unet/ | 下载目标：LTX-Video 蒸馏模型的 GGUF 版本推荐版本：• 8G 显存推荐：ltx-2-19b-distilled\_Q4\_K\_M.gguf (兼顾质量与显存)• 极致节省：Q3\_K\_M.gguf（如果能找到的话） |
| 文本编码器 (CLIP) | models/clip/ | 注意：必须加载“双组件”，缺一不可！• 组件 A (理解语义)：gemma-3-12b-it-Q4\_K\_S.gguf（Gemma 3 的 GGUF 量化版）• 组件 B (负责翻译)：ltx-2-19b-embeddings\_connector\_distill\_bf16.safetensors（投影层文件，约 300~600MB，无此文件会直接报错）•tokenizer.model |
| VAE 模型 | models/vae/ | 下载目标：LTX-Video KJ版 VAE (LTX2\_video\_vae\_bf16.safetensors和LTX2\_audio\_vae\_bf16.safetensors) |

### 二、插件安装

确保安装了 `ComfyUI-GGUF` 插件（通常位于 `custom_nodes` 目录下）。

如果不是使用我的魔改版，可直接它的最新版试。

**三、启动器参数设置 (秋叶启动器)**

为了在 8G 显存上运行，必须严格限制显存使用并禁用不兼容的加速库：

打开秋叶启动器 → 高级选项

关键设置：

显存策略：选择 “低显存 (Low VRAM)”

Xformers：必须关闭 (取消勾选)

原因：LTX 的 Gemma 文本编码器太大，会被卸载到 CPU 内存。Xformers 不支持 CPU 运算，开启会导致 No operator found… device=cpu 报错

附加参数（切换到专家模式）：

plaintext

–lowvram –disable-xformers 或 “–disable-xformers”

## 测试文生视频提示词：

## 情侣中文对话（口型+情绪测试）

**用途：测试中文普通话 + 口型同步**

> 一对 20 多岁的亚洲年轻情侣坐在咖啡馆里聊天，女生微笑着说普通话：“你还记得我们第一次见面吗？”  
> 男生轻轻点头，用普通话回答：“当然记得，那天你穿着白色裙子，我一眼就喜欢上你了。”  
> 自然光，真实摄影风格，镜头轻微晃动，人物口型与语音完美同步，情绪温暖真实。

## 搞笑情侣短剧

**用途：测试表情变化 + 语音节奏**

> 亚洲年轻情侣在家里吵架，女生用普通话生气地说：“你又忘记洗碗了！”  
> 男生一脸无辜，用搞笑语气说：“我不是忘了，我是在等灵感。”  
> 轻喜剧风格，表情夸张但自然，口型同步，节奏轻快。

## 游戏实况风格

**用途：测试动态画面 + 解说同步**

> 第一人称射击游戏画面，玩家在城市废墟中战斗，一边玩一边用普通话解说：  
> “这把枪后坐力太大了，但伤害真的高，我要从右边绕过去。”  
> 画面流畅，枪声和语音同步，画面带轻微游戏 HUD。

## 主播带货风格

**用途：测试真人讲解 + 口播**

> 一位亚洲女主播面对镜头，用普通话热情介绍一款智能手表：  
> “这款手表不仅能测心率，还能监测睡眠，非常适合上班族。”  
> 电商直播风格，灯光明亮，口型精准。

## 搞笑新闻播报

**用途：测试长句 + 稳定语音**

> 一位男主播用普通话严肃播报：  
> “今天的头条新闻是一只猫成功打开了冰箱，并且吃光了所有的鱼。”  
> 新闻演播室背景，风格一本正经但内容搞笑。

## 自然风景纪录片

**用途：测试环境音 + 旁白**

> 航拍中国山川和湖泊，清晨薄雾环绕，一位男声普通话旁白：  
> “这里是大自然最宁静的角落，每一缕阳光都让人感到平静。”  
> 电影级自然纪录片风格，声音温柔清晰。

---

## 狮子打斗场面

**用途：测试动作 + 物理 + 音效**

> 非洲草原上，两只雄狮激烈打斗，尘土飞扬，低吼声和脚步声同步，  
> 镜头快速切换，真实野生动物纪录片风格，动作流畅有冲击力。

## 功夫打斗场景

**用途：测试人物动作+音效同步**

> 两名亚洲功夫高手在雨夜的街道上对决，拳脚相交，雨水飞溅，  
> 伴随呼吸声和打斗音效，电影级动作风格，慢动作穿插。

## AI科幻对话

**用途：测试多角色对话**

> 未来科幻实验室里，一名亚洲女科学家用普通话说：  
> “你真的认为自己有情感吗？”  
> 一个人形机器人用冷静的普通话回答：  
> “我正在学习理解人类的情绪。”  
> 灯光冷色调，科幻电影风格。

## 搞笑动物配音

**用途：测试配音贴合**

> 一只小狗坐在沙发上，用童趣普通话配音：  
> “我今天很乖，所以我要多吃一点零食。”  
> 可爱风格，口型自然贴合。

## LTX-2 是什么？为什么它突然爆火？

一句话概括：

> **LTX-2 是第一个真正意义上的“全能型”音视频生成大模型。**

它不是那种：

- 只能生成视频但没声音
- 或者画面和声音对不上
- 或者只能低分辨率
- 或者对显卡要求离谱

LTX-2 是基于 **最新 DiT（Diffusion Transformer）架构** 构建的，这是一种目前最先进的视频生成路线，它带来了几个质变级能力：

### 音画同步生成

不需要再后期配音，它可以直接：

- 生成画面
- 同时生成声音
- 并且嘴型、节奏说话完全同步

这在以前基本是只有商业级模型才能做到的。

### 高画质 + 多性能模式

LTX-2 不只有一种“画质”，它内置多种模式，比如：

- 极速模式（适合快速出草稿）
- 省显存模式（8GB 显卡也能跑）
- 高质量模式（细节拉满）

你可以根据自己显卡的能力，自由切换。

这意味着：

> 它不是为土豪准备的模型，而是为普通玩家准备的。

## 8GB 显卡也能跑，本地部署才是最大杀器

这一点，真的要单独说。

现在市面上很多 AI 视频模型，宣传得天花乱坠，但一看要求：

- 24GB 显存
- 48GB 显存
- 甚至 A100、H100

对普通人来说基本就是“看个热闹”。

而 **LTX-2 的杀手级优势是：**

> **哪怕只有 8GB 显存，你也能在自己电脑上跑它。**

这意味着什么？

你可以：

- 用 RTX 3060
- 用 3050
- 用 2060
- 甚至一些低功耗卡

直接本地生成视频。

不用：

- 排队
- 等云端
- 被限速
- 被计费
- 被封号

你就是你自己的 AI 视频工厂。

## 完全开源 + 无限生成，这才是真正的自由

LTX-2 是 **100% 开源模型** 。  
这点对创作者来说非常重要。

因为这意味着：

- 没有生成次数限制
- 没有内容审查锁死
- 没有“商用要额外付费”
- 你生成的视频，版权在你手里

你可以：

随你怎么玩。

## LTX-2 为什么会被称为“视频生成的转折点”？

过去，AI 视频是这样：

- 要么画面好但没声音
- 要么有声音但对不上嘴
- 要么要天价显卡
- 要么只能在云端被限制

而 LTX-2 把这些全部打通了：

> **音频 + 视频 + 高质量 + 本地运行 + 低门槛**

这在整个 AI 视频领域，是第一次真正意义上的“民用化”。

## 总之

如果你：

- 做短视频
- 做自媒体
- 做动画
- 做 YouTube
- 做 TikTok
- 或者只是想玩 AI 视频

那么 **LTX-2 就是你目前能用到的性价比之王。** 不是云端，不是订阅制，而是： **你自己的显卡 + 你自己的模型 + 无限的视频创作能力。**