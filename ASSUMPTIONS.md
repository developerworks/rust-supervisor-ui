# Assumptions(假设)

1. 本目录只实现 dashboard client(看板客户端), 不实现 relay(中继) 服务端, mTLS(双向传输层安全协议认证) 握手, 目标进程 IPC(进程间通信) 或注册入口.
2. UI(用户界面) 必须通过 `VITE_SUPERVISOR_RELAY_URL=wss://...` 连接真实 relay(中继). 缺少地址或使用非 `wss://` 地址时, UI(用户界面) 只显示配置错误.
3. 真实生产连接必须使用 `VITE_SUPERVISOR_RELAY_URL=wss://...`, `ws://` 不允许进入完整控制能力.
4. client certificate(客户端证书) 由浏览器和操作系统处理, 前端代码不会读取证书文件或私钥.
5. `requested_by` 必须由 relay(中继) 根据 RemoteIdentity(远程身份) 派生, 前端只提交 command id(命令标识), target id(目标标识), command(命令), target(目标), reason(原因) 和 confirmed(确认状态).
6. `shutdown_tree`, `remove_child` 和 `add_child` 被视为 dangerous command(危险命令), 前端必须要求二次确认和非空 reason(原因).
7. event(事件) 和 log(日志) 的本地过滤不会改变同一 target process(目标进程) 内 sequence(序号) 的真实顺序.
8. shadcn-vue(组件库) 基线通过 `components.json`, Tailwind(样式框架) token(设计令牌), `src/components/ui/` 组件和浏览器测试共同验证.
