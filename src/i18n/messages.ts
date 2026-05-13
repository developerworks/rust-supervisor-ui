export const messages = {
  "zh-CN": {
    app: {
      title: "监督看板",
      description: "看板客户端通过 {connectionLabel} 消费中继会话契约.",
      missingRelay: "中继地址未配置",
      waitingIdentity: "等待身份",
      connectionState: {
        idle: "空闲",
        connecting: "连接中",
        established: "已建立",
        closed: "已关闭"
      }
    },
    menu: {
      settings: "设置",
      language: "语言",
      theme: "主题",
      layout: "布局",
      actions: "操作",
      reconnect: "重新连接"
    },
    language: {
      zh: "中文",
      en: "英文"
    },
    theme: {
      system: "跟随系统",
      time: "本地时间",
      light: "亮色",
      dark: "暗色"
    },
    layout: {
      standard: "标准布局",
      sidebar07: "侧边栏 07",
      tools: "工具"
    },
    common: {
      apply: "应用",
      clear: "清除",
      cancel: "取消",
      confirmSubmit: "确认提交"
    },
    sections: {
      targetList: "目标列表",
      targetTitle: "目标进程",
      controlPanel: "控制面板",
      controlTitle: "监督命令",
      filters: "过滤器",
      filterTitle: "日志过滤",
      topologyCanvas: "拓扑画布",
      topologyTitle: "监督拓扑",
      eventLog: "事件日志",
      eventTitle: "事件和日志流",
      nodeDetail: "节点详情",
      nodeTitle: "运行状态",
      diagnostics: "诊断",
      diagnosticsTitle: "会话诊断"
    },
    targetList: {
      waiting: "等待目标列表消息.",
      commands: "命令: {commands}",
      status: {
        registered: "已注册",
        disconnected: "未连接",
        connecting: "连接中",
        connected: "已连接",
        reconnecting: "重连中",
        unavailable: "不可用",
        expired: "已过期"
      }
    },
    filters: {
      targetIdentity: "目标进程身份",
      childTask: "子任务路径",
      lifecycleState: "生命周期状态",
      eventType: "事件类型",
      severity: "严重程度",
      sequenceMinimum: "最小序号",
      correlationId: "关联标识",
      allTargets: "全部目标",
      allChildTasks: "全部子任务",
      allLifecycleStates: "全部生命周期",
      allEventTypes: "全部事件类型",
      allSeverities: "全部严重程度"
    },
    lifecycle: {
      starting: "启动中",
      running: "运行中",
      failed: "失败",
      restarting: "重启中",
      paused: "暂停",
      quarantined: "隔离",
      stopping: "停止中",
      stopped: "已停止",
      completed: "已完成"
    },
    severity: {
      trace: "跟踪",
      debug: "调试",
      info: "信息",
      warning: "警告",
      error: "错误"
    },
    health: {
      unknown: "未知",
      healthy: "健康",
      stale: "已过期",
      unhealthy: "不健康"
    },
    readiness: {
      unknown: "未知",
      ready: "就绪",
      not_ready: "未就绪"
    },
    criticality: {
      critical: "关键",
      standard: "标准",
      best_effort: "尽力而为"
    },
    nodeState: {
      root: "根节点"
    },
    eventType: {
      child_started: "子任务已启动",
      child_failed: "子任务失败",
      child_restarted: "子任务已重启",
      command_audit: "命令审计"
    },
    commandStatus: {
      accepted: "已接受",
      rejected: "已拒绝",
      completed: "已完成",
      failed: "失败"
    },
    control: {
      command: "命令",
      target: "目标",
      reason: "原因",
      selectCommand: "选择命令",
      noNode: "未选择节点",
      reasonPlaceholder: "说明本次控制命令原因",
      reasonRequired: "原因必填.",
      notReady: "需要已连接目标和已建立控制会话.",
      submit: "提交命令",
      submitting: "正在提交",
      commands: {
        restart_child: "重启子任务",
        pause_child: "暂停子任务",
        resume_child: "恢复子任务",
        quarantine_child: "隔离子任务",
        remove_child: "移除子任务",
        add_child: "添加子任务",
        shutdown_tree: "关闭监督树"
      }
    },
    confirmCommand: {
      title: "确认危险命令",
      description: "{command} 将作用于 {targetPath}. 提交前必须填写原因并完成二次确认.",
      reasonPlaceholder: "说明本次控制操作原因",
      missingConfirmation: "必须完成二次确认.",
      confirmation: "我确认该命令会改变目标生命周期."
    },
    topology: {
      waitingState: "等待状态.",
      dependencyLabel: "依赖"
    },
    eventLog: {
      droppedEvents: "丢弃事件 {count}",
      droppedLogs: "丢弃日志 {count}",
      empty: "当前过滤条件没有匹配记录.",
      logTitle: "日志记录",
      auditTitle: "命令审计: {command}",
      eventDetail: "路径: {path}, 关联标识: {correlationId}",
      auditDetail: "路径: {path}, 原因: {reason}"
    },
    nodeDetail: {
      chooseNode: "请选择监督节点.",
      health: "健康状态",
      readiness: "就绪状态",
      restartCount: "重启次数",
      shutdownState: "关闭状态",
      recentDiagnostics: "最近诊断",
      lastFailure: "最近失败: {value}",
      lastPolicyDecision: "最近策略决定: {value}",
      recentEvents: "最近事件",
      noRecentEvents: "当前节点没有最近事件.",
      sequenceAndCorrelation: "序号: {sequence}, 关联标识: {correlationId}"
    },
    diagnostics: {
      commandResult: "命令结果: {result}",
      empty: "当前没有结构化错误."
    },
    toast: {
      connecting: "正在重新连接",
      commandSent: "命令已提交",
      commandCompleted: "命令已完成",
      commandRejected: "命令未通过校验",
      connectionError: "连接发生错误"
    }
  },
  "en-US": {
    app: {
      title: "Supervisor Dashboard",
      description: "The dashboard client consumes the relay session contract through {connectionLabel}.",
      missingRelay: "relay URL is not configured",
      waitingIdentity: "Waiting for identity",
      connectionState: {
        idle: "Idle",
        connecting: "Connecting",
        established: "Established",
        closed: "Closed"
      }
    },
    menu: {
      settings: "Settings",
      language: "Language",
      theme: "Theme",
      layout: "Layout",
      actions: "Actions",
      reconnect: "Reconnect"
    },
    language: {
      zh: "Chinese",
      en: "English"
    },
    theme: {
      system: "System",
      time: "Local time",
      light: "Light",
      dark: "Dark"
    },
    layout: {
      standard: "Standard",
      sidebar07: "Sidebar 07",
      tools: "Tools"
    },
    common: {
      apply: "Apply",
      clear: "Clear",
      cancel: "Cancel",
      confirmSubmit: "Confirm submit"
    },
    sections: {
      targetList: "Target list",
      targetTitle: "Targets",
      controlPanel: "Control panel",
      controlTitle: "Supervisor commands",
      filters: "Filters",
      filterTitle: "Log filters",
      topologyCanvas: "Topology canvas",
      topologyTitle: "Supervisor topology",
      eventLog: "Event log",
      eventTitle: "Events and logs",
      nodeDetail: "Node detail",
      nodeTitle: "Runtime state",
      diagnostics: "Diagnostics",
      diagnosticsTitle: "Session diagnostics"
    },
    targetList: {
      waiting: "Waiting for targets.",
      commands: "Commands: {commands}",
      status: {
        registered: "Registered",
        disconnected: "Disconnected",
        connecting: "Connecting",
        connected: "Connected",
        reconnecting: "Reconnecting",
        unavailable: "Unavailable",
        expired: "Expired"
      }
    },
    filters: {
      targetIdentity: "Target identity",
      childTask: "Child path",
      lifecycleState: "Lifecycle state",
      eventType: "Event type",
      severity: "Severity",
      sequenceMinimum: "Sequence minimum",
      correlationId: "Correlation ID",
      allTargets: "All targets",
      allChildTasks: "All child tasks",
      allLifecycleStates: "All lifecycle states",
      allEventTypes: "All event types",
      allSeverities: "All severities"
    },
    lifecycle: {
      starting: "Starting",
      running: "Running",
      failed: "Failed",
      restarting: "Restarting",
      paused: "Paused",
      quarantined: "Quarantined",
      stopping: "Stopping",
      stopped: "Stopped",
      completed: "Completed"
    },
    severity: {
      trace: "Trace",
      debug: "Debug",
      info: "Info",
      warning: "Warning",
      error: "Error"
    },
    health: {
      unknown: "Unknown",
      healthy: "Healthy",
      stale: "Stale",
      unhealthy: "Unhealthy"
    },
    readiness: {
      unknown: "Unknown",
      ready: "Ready",
      not_ready: "Not ready"
    },
    criticality: {
      critical: "Critical",
      standard: "Standard",
      best_effort: "Best effort"
    },
    nodeState: {
      root: "Root"
    },
    eventType: {
      child_started: "Child started",
      child_failed: "Child failed",
      child_restarted: "Child restarted",
      command_audit: "Command audit"
    },
    commandStatus: {
      accepted: "Accepted",
      rejected: "Rejected",
      completed: "Completed",
      failed: "Failed"
    },
    control: {
      command: "Command",
      target: "Target",
      reason: "Reason",
      selectCommand: "Select command",
      noNode: "No node selected",
      reasonPlaceholder: "Explain the reason for this control command",
      reasonRequired: "Reason is required.",
      notReady: "A connected target and established control session are required.",
      submit: "Submit command",
      submitting: "Submitting",
      commands: {
        restart_child: "Restart child",
        pause_child: "Pause child",
        resume_child: "Resume child",
        quarantine_child: "Quarantine child",
        remove_child: "Remove child",
        add_child: "Add child",
        shutdown_tree: "Shutdown tree"
      }
    },
    confirmCommand: {
      title: "Confirm dangerous command",
      description: "{command} will act on {targetPath}. A reason and second confirmation are required before submission.",
      reasonPlaceholder: "Explain the reason for this control operation",
      missingConfirmation: "Second confirmation is required.",
      confirmation: "I confirm this command changes the target lifecycle."
    },
    topology: {
      waitingState: "Waiting for state.",
      dependencyLabel: "depends"
    },
    eventLog: {
      droppedEvents: "Dropped events {count}",
      droppedLogs: "Dropped logs {count}",
      empty: "No records match the current filters.",
      logTitle: "Log record",
      auditTitle: "Command audit: {command}",
      eventDetail: "{path}, correlation ID: {correlationId}",
      auditDetail: "{path}, reason: {reason}"
    },
    nodeDetail: {
      chooseNode: "Select a supervisor node.",
      health: "Health",
      readiness: "Readiness",
      restartCount: "Restart count",
      shutdownState: "Shutdown state",
      recentDiagnostics: "Recent diagnostics",
      lastFailure: "Last failure: {value}",
      lastPolicyDecision: "Last policy decision: {value}",
      recentEvents: "Recent events",
      noRecentEvents: "This node has no recent event.",
      sequenceAndCorrelation: "Sequence: {sequence}, correlation ID: {correlationId}"
    },
    diagnostics: {
      commandResult: "Command result: {result}",
      empty: "There are no structured errors."
    },
    toast: {
      connecting: "Reconnecting",
      commandSent: "Command submitted",
      commandCompleted: "Command completed",
      commandRejected: "Command validation failed",
      connectionError: "Connection error"
    }
  }
} as const;
