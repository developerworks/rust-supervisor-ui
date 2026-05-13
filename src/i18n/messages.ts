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
      actions: "操作",
      reconnect: "重新连接",
      repository: "GitHub 仓库"
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
    common: {
      apply: "应用",
      clear: "清除",
      cancel: "取消",
      confirmSubmit: "确认提交"
    },
    blockingAlert: {
      invalidRelayTitle: "中继服务未配置",
      invalidRelayDescription: "VITE_SUPERVISOR_RELAY_URL 必须使用 wss:// 地址. 当前无法加载目标和监督树状态.",
      drawerLabel: "中继阻塞提示",
      copyEnvironment: "复制环境变量名",
      showDiagnostics: "查看诊断",
      expand: "展开",
      collapse: "收起",
      copied: "环境变量名已复制",
      copyFailed: "环境变量名复制失败"
    },
    statusStrip: {
      relay: "中继状态",
      identity: "身份状态",
      targets: "目标数量",
      events: "事件数量",
      failedNodes: "异常节点 {count}",
      targetCount: "目标 {count}",
      eventCount: "事件 {count}"
    },
    inspectorTabs: {
      targets: "目标",
      node: "节点",
      command: "命令",
      runtime: "运行",
      diagnostics: "诊断"
    },
    sections: {
      inspector: "检查器",
      inspectorTitle: "上下文检查器",
      logWorkspace: "日志工作区",
      logWorkspaceTitle: "日志过滤和事件流",
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
      emptyTitle: "暂无目标",
      emptyDescription: "当 Rust 任务节点连接后, 这里会显示目标身份和生命周期.",
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
      child_running: "子任务运行中",
      child_failed: "子任务失败",
      child_restarted: "子任务已重启",
      child_paused: "子任务已暂停",
      child_resumed: "子任务已恢复",
      child_quarantined: "子任务已隔离",
      child_removed: "子任务已移除",
      child_added: "子任务已添加",
      tree_stopped: "监督树已停止",
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
      unavailableTitle: "命令暂不可用",
      unavailableDescription: "需要已连接的目标和已建立的控制会话.",
      chooseNodeTitle: "请选择一个可操作节点",
      chooseNodeDescription: "选择监督者或工作者后可以执行命令.",
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
      dependencyLabel: "依赖",
      emptyTitle: "暂无监督树状态",
      emptyDescription: "中继服务未连接, 或目标进程尚未上报状态.",
      searchPlaceholder: "搜索节点名称或路径",
      fitView: "适应视图",
      relayout: "重新布局",
      showFailedOnly: "只看异常",
      showAll: "显示全部",
      legend: "图例",
      legendSupervisor: "监督者",
      legendWorker: "工作者",
      noMatchTitle: "没有匹配节点",
      noMatchDescription: "可以调整搜索条件, 或关闭只看异常."
    },
    eventLog: {
      droppedEvents: "丢弃事件 {count}",
      droppedLogs: "丢弃日志 {count}",
      empty: "当前过滤条件没有匹配记录.",
      emptyTitle: "当前没有匹配事件",
      emptyDescription: "可以清空筛选条件, 或等待目标上报新事件.",
      clearFilters: "清空筛选",
      logTitle: "日志记录",
      auditTitle: "命令审计: {command}",
      eventDetail: "路径: {path}, 关联标识: {correlationId}",
      lifecycleTransition: "状态转移: {from} -> {to}",
      auditDetail: "路径: {path}, 原因: {reason}",
      previousPage: "上一页",
      nextPage: "下一页",
      paginationSummary: "第 {page}/{pages} 页, 显示 {start}-{end}, 共 {total} 条",
      columns: {
        sequence: "序列",
        kind: "类型",
        severity: "严重级别",
        target: "目标",
        summary: "摘要",
        detail: "详情"
      },
      kind: {
        event: "事件",
        log: "日志",
        audit: "审计"
      }
    },
    nodeDetail: {
      chooseNode: "请选择监督节点.",
      emptyTitle: "请选择一个节点",
      emptyDescription: "选中拓扑中的监督者或工作者后, 这里会显示运行状态和最近事件.",
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
      empty: "当前没有结构化错误.",
      emptyTitle: "当前没有诊断信息",
      emptyDescription: "连接错误, 命令校验错误和目标异常会显示在这里."
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
      actions: "Actions",
      reconnect: "Reconnect",
      repository: "GitHub repository"
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
    common: {
      apply: "Apply",
      clear: "Clear",
      cancel: "Cancel",
      confirmSubmit: "Confirm submit"
    },
    blockingAlert: {
      invalidRelayTitle: "Relay is not configured",
      invalidRelayDescription: "VITE_SUPERVISOR_RELAY_URL must use a wss:// URL. Targets and supervisor tree state cannot load right now.",
      drawerLabel: "Relay blocking alert",
      copyEnvironment: "Copy variable name",
      showDiagnostics: "View diagnostics",
      expand: "Expand",
      collapse: "Collapse",
      copied: "Environment variable name copied",
      copyFailed: "Environment variable name copy failed"
    },
    statusStrip: {
      relay: "Relay status",
      identity: "Identity status",
      targets: "Target count",
      events: "Event count",
      failedNodes: "Failed nodes {count}",
      targetCount: "Targets {count}",
      eventCount: "Events {count}"
    },
    inspectorTabs: {
      targets: "Targets",
      node: "Node",
      command: "Command",
      runtime: "Runtime",
      diagnostics: "Diagnostics"
    },
    sections: {
      inspector: "Inspector",
      inspectorTitle: "Context inspector",
      logWorkspace: "Log workspace",
      logWorkspaceTitle: "Log filters and event stream",
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
      emptyTitle: "No targets",
      emptyDescription: "Connected Rust task nodes will appear here with identity and lifecycle details.",
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
      child_running: "Child running",
      child_failed: "Child failed",
      child_restarted: "Child restarted",
      child_paused: "Child paused",
      child_resumed: "Child resumed",
      child_quarantined: "Child quarantined",
      child_removed: "Child removed",
      child_added: "Child added",
      tree_stopped: "Tree stopped",
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
      unavailableTitle: "Commands are unavailable",
      unavailableDescription: "A connected target and established control session are required.",
      chooseNodeTitle: "Select an actionable node",
      chooseNodeDescription: "Select a supervisor or worker before executing a command.",
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
      dependencyLabel: "depends",
      emptyTitle: "No supervisor tree state",
      emptyDescription: "The relay is disconnected, or the target process has not reported state yet.",
      searchPlaceholder: "Search node name or path",
      fitView: "Fit view",
      relayout: "Relayout",
      showFailedOnly: "Failed only",
      showAll: "Show all",
      legend: "Legend",
      legendSupervisor: "Supervisor",
      legendWorker: "Worker",
      noMatchTitle: "No matching nodes",
      noMatchDescription: "Adjust the search query, or turn off failed-only mode."
    },
    eventLog: {
      droppedEvents: "Dropped events {count}",
      droppedLogs: "Dropped logs {count}",
      empty: "No records match the current filters.",
      emptyTitle: "No matching events",
      emptyDescription: "Clear the filters, or wait for targets to report new events.",
      clearFilters: "Clear filters",
      logTitle: "Log record",
      auditTitle: "Command audit: {command}",
      eventDetail: "{path}, correlation ID: {correlationId}",
      lifecycleTransition: "Lifecycle transition: {from} -> {to}",
      auditDetail: "{path}, reason: {reason}",
      previousPage: "Previous",
      nextPage: "Next",
      paginationSummary: "Page {page} of {pages}, showing {start}-{end} of {total}",
      columns: {
        sequence: "Sequence",
        kind: "Type",
        severity: "Severity",
        target: "Target",
        summary: "Summary",
        detail: "Detail"
      },
      kind: {
        event: "Event",
        log: "Log",
        audit: "Audit"
      }
    },
    nodeDetail: {
      chooseNode: "Select a supervisor node.",
      emptyTitle: "Select a node",
      emptyDescription: "Select a supervisor or worker in the topology to view runtime state and recent events.",
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
      empty: "There are no structured errors.",
      emptyTitle: "No diagnostics",
      emptyDescription: "Connection errors, command validation errors and target failures will appear here."
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
