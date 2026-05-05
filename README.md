# Rust Supervisor Dashboard Client(看板客户端)

这个目录实现 `specs/003-supervisor-dashboard` 中的 dashboard client(看板客户端). 生产代码只放在 `/Users/0x00/Documents/rust-supervisor-ui`, 并且只通过 `wss://` WebSocket(网络套接字协议) contract(契约) 消费 relay(中继) 暴露的 session(会话), snapshot(快照), event(事件), log(日志), state delta(状态增量), command result(命令结果) 和 error(错误).

## 技术基线

- Vite(前端构建工具) 负责开发服务器和构建.
- Vue(网页界面框架) 3 负责 dashboard client(看板客户端) 界面.
- TypeScript(类型脚本语言) 负责协议类型和状态层.
- shadcn-vue(组件库) 思路用于 `src/components/ui/` 中的 Button(按钮), Card(面板), Input(输入框), Select(选择框), Textarea(多行输入框), Checkbox(复选框) 和 Badge(标记).
- Tailwind(样式框架) 负责布局, 颜色和交互状态.
- Vue Flow(流程图组件) 负责 supervisor topology(监督拓扑) 画布.
- Vitest(前端测试工具) 负责状态层和协议校验测试.
- Playwright(浏览器测试工具) 负责首屏, 过滤器, 控制命令和前端基线测试.

## 启动

```bash
npm install
npm run dev
```

默认情况下, 页面使用 `mock://dashboard` 静态模拟会话, 用于本地开发和端到端测试. 连接真实 relay(中继) 时设置 `VITE_SUPERVISOR_RELAY_URL`.

```bash
VITE_SUPERVISOR_RELAY_URL=wss://localhost:9443/supervisor npm run dev
```

浏览器中的 client certificate(客户端证书) 由操作系统或浏览器证书库管理. 页面脚本不会读取证书私钥.

## 验证

```bash
npm run test
npm run build
npm run test:e2e
```

`npm run test:e2e` 会先执行 production build(生产构建), 再通过 Vite preview(构建预览服务器) 启动浏览器测试.

## 功能范围

当前实现提供以下可交互界面.

- target list(目标列表), 展示 registered(已注册), connected(已连接), reconnecting(重连中), unavailable(不可用) 和 expired(已过期) 状态.
- topology canvas(拓扑画布), 使用 Vue Flow(流程图组件) 展示 root supervisor(根监督器), child task(子任务) 和 dependency(依赖).
- node detail(节点详情), 展示 lifecycle state(生命周期状态), health(健康状态), readiness(就绪状态), restart count(重启次数), last failure(最近失败), last policy decision(最近策略决定) 和 shutdown state(关闭状态).
- event log(事件日志), 展示 supervisor event(监督器事件), log record(日志记录), command audit(命令审计), dropped count(丢弃数量) 和 sequence(序号).
- filters(过滤器), 支持 target process identity(目标进程身份), child task(子任务), lifecycle state(生命周期状态), event type(事件类型), severity(严重程度), sequence(序号) 和 correlation id(关联标识).
- control panel(控制面板), 支持 restart child(重启子任务), pause child(暂停子任务), resume child(恢复子任务), quarantine child(隔离子任务), remove child(移除子任务), add child(添加子任务) 和 shutdown tree(关闭监督树).
- confirm dialog(确认对话框), 对 shutdown tree(关闭监督树), remove child(移除子任务) 和 add child(添加子任务) 强制二次确认和非空 reason(原因).

## 协议边界

`src/types/protocol.ts` 与 `contracts/wss-session.md` 对齐. 客户端会拒绝以下情况.

- control session(控制会话) 未建立时提交命令.
- `ws://` 作为完整控制传输.
- command(命令) 不在本功能契约范围内.
- 客户端尝试提供 `requested_by`.
- reason(原因) 为空.
- 危险命令缺少二次确认.

`src/api/session.ts` 提供真实 `wss://` WebSocket(网络套接字协议) 适配和 `mock://dashboard` 模拟适配. 模拟适配只用于本地 UI(用户界面) 和测试, 不表达 relay(中继) 生产行为.
