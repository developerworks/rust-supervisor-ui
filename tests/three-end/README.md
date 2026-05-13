# 三端协同端到端测试

这个目录只放真实三端协同测试. 它不会启动 `tests/support/relay-protocol-server.mjs`.

测试链路固定为:

```text
rust-supervisor-ui
-> rust-supervisor-relay
-> rust-supervisor demo
-> dashboard IPC socket
-> DashboardIpcService
```

运行命令:

```bash
npm run test:e2e:three-end
```

本测试会生成本地 mTLS(双向传输层安全) 测试证书, 启动真实 relay(中继) 和真实 supervisor(监督器) demo(演示程序), 然后通过 Playwright(端到端测试框架) 的 `clientCertificates` 连接 `wss://localhost:9443/supervisor`.
