---
title: "注册永久免费域名，托管到 CloudFlare ，自动免费续订、提醒！"
source: "https://www.freedidi.com/20033.html"
author:
  - "[[admin]]"
published: 2025-07-07
created: 2026-06-14
description: "今天给大家推荐一个稳定又非常不错的免费域名注册方案，来自非盈利组织：digitalplat，申请注册后可以直接托管到CloudFlare 平台上进行管理使用。"
tags:
  - domain/meta
type: reference
status: active
updated: 2026-07-18
verification_status: partial
---
今天给大家推荐一个稳定又非常不错的免费域名注册方案，来自非盈利组织：digitalplat，申请注册后可以直接托管到CloudFlare 平台上进行管理使用。

![9e9397d45820250707123542](https://www.freedidi.com/wp-content/uploads/2025/07/9e9397d45820250707123542-scaled.webp "注册永久免费域名，托管到 CloudFlare ，自动免费续订、提醒！ 1")

1、免费域名申请：【 **[链接直达](https://digitalplat.org/)** 】

目前免费的后缀是.dpdns.org ，比如我输入域名：lingdu8.dpdns.org 是可以直接免费注册的

![bb0189695920250707123827](https://www.freedidi.com/wp-content/uploads/2025/07/bb0189695920250707123827-scaled.webp "注册永久免费域名，托管到 CloudFlare ，自动免费续订、提醒！ 2")

2、接下来只需注册一个账号就能获取到免费域名， 【 **[注册链接](https://dash.domain.digitalplat.org/auth/register)** 】 注册好以后通过这个 [链接](https://dash.domain.digitalplat.org/auth/login) 进行登入【 **[点击登录](https://dash.domain.digitalplat.org/auth/login)** 】

![66bc5bc51f20250707123941](https://www.freedidi.com/wp-content/uploads/2025/07/66bc5bc51f20250707123941.webp "注册永久免费域名，托管到 CloudFlare ，自动免费续订、提醒！ 3")

注册用户的时候，务必使用自己常用的邮箱，否则将来忘记密码或者免费续订的时候不会出现问题。

3、把域名托管到 CloudFlare ，方便统一管理 【 **[点击前往](https://www.cloudflare.com/zh-cn/)** 】

4、免费域名需要每 180 天续期一次。可以使用 SubsTracker 来进行订阅提醒，不至于忘记续订，虽然是免费续订的，但是每隔180天需要续订下。

![00dfda6cd920250707124914](https://www.freedidi.com/wp-content/uploads/2025/07/00dfda6cd920250707124914.webp "注册永久免费域名，托管到 CloudFlare ，自动免费续订、提醒！ 4")

**订阅提醒部署：**

1\. 登陆Cloudflare,创建worker,粘贴本项目中的js代码,【 [**点击获取**](https://github.com/wangwangit/SubsTracker) 】或 【 **[直接下载](https://intl.ozabc.com/page/12.html)** 】

2\. 在Cloudflare 点击左侧：存储和数据库 – KV -创建KV – 用户和键值都填写： SUBSCRIPTIONS\_KV

3\. **给worker绑定上键值对,【以及设置定时执行时间!】 注意：这里的名称一定是：SUBSCRIPTIONS\_KV 否则后面需修改参数无法保存！**

![a1633f053b20250707125553](https://www.freedidi.com/wp-content/uploads/2025/07/a1633f053b20250707125553.webp "注册永久免费域名，托管到 CloudFlare ，自动免费续订、提醒！ 5")

最后打开worker提供的域名地址,输入默认账号密码: admin password 就可以访问，当然建议绑定到免费域名上，海内外都可以畅通访问！

![e1ae11177020250707130151](https://www.freedidi.com/wp-content/uploads/2025/07/e1ae11177020250707130151.webp "注册永久免费域名，托管到 CloudFlare ，自动免费续订、提醒！ 6")

提醒发送支持: 通过 Telegram,微信等发送及时提醒。

![e2756ed88a20250707130426](https://www.freedidi.com/wp-content/uploads/2025/07/e2756ed88a20250707130426.webp "注册永久免费域名，托管到 CloudFlare ，自动免费续订、提醒！ 7")

#### Telegram 配置：

Bot Token 获取：@BotFather  
Chat ID 获取：@VersaToolsBot

在Telegram新建一个频道，将频道里的任意信息转发到 @VersaToolsBot 机器人上就可以获取到 Chat ID，具体的配置过程看零度的教程演示！