/* Skill Passport page (passport.html) behaviour: tabs, phone prototype, crypto lab, dialogs. */

"use strict";
const $ = (id) => document.getElementById(id);
const icons = {
  passport:
    '<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 17h8M9 3v18"/>',
  scan: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M5 12h14"/>',
  task: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h4"/>',
  shield: '<path d="M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3z"/><path d="M8 12l3 3 5-6"/>',
  arrow: '<path d="M4 12h16m-6-6l6 6-6 6"/>',
  check: '<path d="M5 12l5 5L20 6"/>',
  camera:
    '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6l2-3h4l2 3"/><circle cx="12" cy="13" r="4"/>',
  wechat:
    '<path d="M21 11c0 5-5 8-9 8H8l-4 2 1-5c-2-2-3-4-2-7 1-4 5-6 9-6 5 0 9 3 9 8z"/><circle cx="8" cy="10" r=".7"/><circle cx="15" cy="10" r=".7"/>',
  link: '<path d="M10 7l2-2a5 5 0 017 7l-3 3a5 5 0 01-7 0M14 17l-2 2a5 5 0 01-7-7l3-3a5 5 0 017 0"/>',
};
const icon = (name) =>
  `<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.task}</svg>`;
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (x) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[x],
  );
let lang = "en",
  state,
  lastFocus = null,
  toastTimer;
const t = (en, zh) => (lang === "zh" ? zh : en);
function reset(route = "invite") {
  state = {
    route,
    step: 0,
    max: 0,
    consent: false,
    logged: false,
    claimed: false,
    bound: false,
    session: false,
    measurement: false,
    vision: null,
    scenario: "valid",
    qc: false,
    skillRequested: false,
    observed: false,
    amended: false,
    guest: false,
  };
  render();
}
const steps = [
  ["Open invitation", "Keep the job context"],
  ["Confirm membership", "Account ≠ employee"],
  ["Start assigned task", "Bind station + part"],
  ["Capture inspection", "Instrument + camera"],
  ["Verify & review", "FDM keeps the original"],
  ["View skill passport", "Evidence, then assessment"],
];
function go(step) {
  state.step = step;
  state.max = Math.max(state.max, step);
  render();
  $("phonebody").scrollTop = 0;
}
function toast(msg) {
  clearTimeout(toastTimer);
  $("toast").textContent = msg;
  $("toast").classList.remove("hidden");
  toastTimer = setTimeout(() => $("toast").classList.add("hidden"), 4200);
}
function badge(text, type = "") {
  return `<span class="badge ${type}">${text}</span>`;
}
function kv(k, v) {
  return `<div class="keyvalue"><span>${k}</span><b>${v}</b></div>`;
}
function button(label, action, style = "", disabled = false) {
  return `<button class="btn full ${style}" data-action="${action}" ${disabled ? "disabled" : ""}>${label}</button>`;
}
function modal(title, content, eyebrow = "DEMO · REVIEWER VIEW") {
  lastFocus = document.activeElement;
  $("modalRoot").innerHTML =
    `<div class="modal-backdrop" id="modalBackdrop"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><div class="row"><div class="eyebrow muted">${eyebrow}</div><button class="close" data-action="close-modal" aria-label="Close dialog">×</button></div><h2 id="modalTitle">${title}</h2>${content}</div></div>`;
  $("modalRoot").querySelector(".close").focus();
}
function closeModal() {
  $("modalRoot").innerHTML = "";
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}
function render() {
  $("steps").innerHTML = steps
    .map(
      (s, i) =>
        `<button class="step ${state.step === i ? "active" : ""} ${state.max > i ? "done" : ""}" data-step="${i}" aria-label="Step ${i + 1}: ${s[0]}" ${i > state.max || (state.guest && i !== 0 && i !== 5) ? "disabled" : ""}><span class="stepnum">${state.max > i ? "✓" : String(i + 1).padStart(2, "0")}</span><span class="stepcopy"><b>${s[0]}</b><small>${s[1]}</small></span></button>`,
    )
    .join("");
  $("screen").innerHTML = screenHTML();
  $("bottomnav").innerHTML = [
    ["task", t("Tasks", "任务"), 2],
    ["shield", t("Evidence", "证据"), 4],
    ["passport", t("Passport", "护照"), 5],
  ]
    .map(
      ([i, l, s]) =>
        `<button data-step="${s}" ${s > state.max || (state.guest && s !== 5) ? "disabled" : ""} class="${state.step === s ? "active" : ""}">${icon(i)}${l}</button>`,
    )
    .join("");
  $("backend").innerHTML = backendHTML();
  $("langEn").classList.toggle("active", lang === "en");
  $("langZh").classList.toggle("active", lang === "zh");
}
function screenHTML() {
  if (state.step === 0) {
    const publicRoute = state.route === "public",
      returning = state.route === "returning";
    return `<div class="icon-tile">${icon("passport")}</div><div class="eyebrow">${t("Your work. Your evidence.", "工作有记录，技能有依据。")}</div><h2>${t("A skill passport,<br>built as you work.", "让日常工作<br>积累技能证据。")}</h2><p class="intro">${t("Inspect parts in FDM Quality. Build a traceable record of the tasks you have performed.", "在 FDM 品质中完成检验，积累可追溯的任务与技能记录。")}</p><div class="card"><div class="row"><b style="font-size:12px">${t(publicRoute ? "Public experience" : "Factory invitation", publicRoute ? "公开体验" : "企业邀请")}</b>${badge(t(publicRoute ? "Sample only" : returning ? "Already linked" : "Pending identity", publicRoute ? "仅演示" : returning ? "已绑定" : "待验证"), publicRoute ? "gray" : returning ? "" : "amber")}</div><div class="gap-small"></div>${kv(t("Factory", "工厂"), publicRoute ? t("No factory access", "无工厂权限") : "CKE · Demo tenant")}${kv(t("Landing destination", "进入页面"), publicRoute ? t("Sample passport", "示例技能护照") : t("Assigned inspection", "已分配检验任务"))}${kv(t("Entry", "入口"), returning ? t("Recognized account", "已识别账号") : t("Opaque invitation token", "无个人信息的邀请令牌"))}</div><label class="consent"><input id="consent" type="checkbox" ${state.consent ? "checked" : ""}><span>${t("I have read the workplace data notice. Only information needed for this workflow is collected.", "我已阅读工作数据说明，仅采集本流程所需信息。")} <button class="btntext" data-action="notice" style="font-size:10px">${t("Read notice", "查看说明")}</button></span></label>${button(icon(publicRoute ? "passport" : "wechat") + " " + t(publicRoute ? "Explore sample" : returning ? "Continue to my task" : "Continue with WeChat", publicRoute ? "体验示例" : returning ? "继续任务" : "通过微信继续"), "login", "green", !state.consent)}<div class="gap-small"></div><p style="font-size:10px;text-align:center">${t("No new password · No résumé · No app download", "无需新密码 · 无需简历 · 无需另装应用")}</p><div class="sample-label">${t("Demo entry — this is not a live invitation", "演示入口 — 非真实邀请链接")}</div>`;
  }
  if (state.step === 1) {
    return `<div class="eyebrow">${t("One-time factory binding", "首次企业绑定")}</div><h2>${t("Confirm your<br>workplace identity.", "确认你的<br>企业身份。")}</h2><p class="intro">${t("Your WeChat account is recognized. Your employer must confirm the employee link before factory records are available.", "微信账号已识别。企业确认员工绑定后，才能访问生产记录。")}</p><div class="card"><div class="row row-top"><div class="row"><div class="avatar">017</div><div><b>${t("Assigned employee", "受邀员工")}</b><p>CKE-W017 · Demo</p></div></div>${badge(t("Pending", "待确认"), "amber")}</div><div class="gap-small"></div>${kv(t("Assigned role", "分配角色"), t("Trainee · supervised tasks", "学员 · 受监督任务"))}${kv(t("Station scope", "工位范围"), "QC-V02")}${kv(t("Identity proof", "身份核验"), t("Employer verification required", "需企业核验"))}</div><div class="gap"></div>${state.claimed ? `<div class="notice amber">${t("Verification requested. Your supervisor checks the employee-to-account binding. An invitation or typed staff ID alone is not proof.", "已申请验证。主管需核对员工与账号绑定。邀请链接或填写工号本身并不能证明身份。")}</div><div class="gap"></div>${button(t("Open employer review · demo", "打开企业审核 · 演示"), "review-membership", "secondary")}` : button(t("Confirm & request verification", "确认并申请验证"), "claim", "green")}<div class="gap"></div><p style="font-size:10px">${t("The role is set by the factory, not selected by the worker. No phone number is required in this proposed flow.", "角色由企业设置，不由员工自行选择。本方案无需手机号即可发起验证。")}</p>`;
  }
  if (state.step === 2) {
    return `<div class="row"><div class="eyebrow">${t("FDM Quality · My tasks", "FDM 品质 · 我的任务")}</div>${badge(t("Member verified", "企业已验证"))}</div><h2>${t("Ready for your<br>first inspection?", "开始你的<br>检验任务。")}</h2><div class="row" style="margin-bottom:18px"><div class="row"><div class="avatar">017</div><div><b style="font-size:12px">${t("Operator 017", "操作员 017")}</b><p>${t("Supervised inspection role", "受监督检验角色")}</p></div></div></div><div class="card"><div class="mini-label">${t("Assigned work order", "已分配工单")}</div><h3 style="margin:6px 0 10px">WO-261006-042</h3>${kv(t("Part / revision", "零件 / 版本"), "P-042 / C")}${kv(t("Part instance", "零件实例"), "SN-0047")}${kv(t("Operation", "工序"), "OP20 · " + t("Finish turning", "精车"))}${kv(t("Inspection station", "检验工位"), "QC-V02")}${kv(t("Task scope", "任务范围"), t("Under supervision", "需在监督下执行"))}</div><div class="gap"></div><div class="card-soft"><b style="font-size:11px">${t("What builds your passport", "可积累的技能证据")}</b><p style="font-size:11px;margin-top:4px">${t("Task execution, measurement discipline and observed defect response—not just the part’s pass rate.", "任务执行、测量规范与缺陷响应记录，而非只看零件合格率。")}</p></div><div class="gap"></div>${button(icon("scan") + " " + t("Scan station & start task", "扫码绑定工位并开始"), "start", "green")}<div class="gap-small"></div><p style="font-size:10px">${t("Demo scan binds this operator, station, operation and part instance into one work session.", "演示扫码将人员、工位、工序与零件实例绑定到同一工作会话。")}</p>`;
  }
  if (state.step === 3) {
    const v = state.vision;
    return `<div class="row"><div class="eyebrow">${t("Capture once · use twice", "一次采集 · 关联品质与技能")}</div>${badge(t("Session active", "会话有效"))}</div><h2>${t("Inspect the part.", "完成零件检验。")}</h2><p class="intro">WO-261006-042 · SN-0047 · OP20<br>${t("Assigned to Operator 017 at QC-V02.", "已绑定操作员 017 与工位 QC-V02。")}</p><div class="card"><div class="row"><b style="font-size:12px">${t("01 / In-situ measurement", "01 / 在位测量")}</b>${badge(state.measurement ? t("Captured", "已采集") : t("Awaiting", "待采集"), state.measurement ? "" : "gray")}</div><div class="gap-small"></div><div class="mini-label">F-OD-01 · ${t("Outside diameter", "外径")}</div><div class="row" style="margin:9px 0"><div class="value">${state.measurement ? "25.012" : "—"} <small>mm</small></div><span class="muted" style="font-size:10px">25.000 ± 0.050</span></div><p style="font-size:10px">${t("BLE-07 · approved instrument in this sample", "BLE-07 · 示例中已批准使用的量具")}</p><div class="gap-small"></div>${button(t(state.measurement ? "Instrument reading captured" : "Receive instrument reading · demo", state.measurement ? "量具数据已采集" : "接收量具读数 · 演示"), "measure", state.measurement ? "subtle small" : "secondary small", state.measurement)}</div><div class="card"><div class="row"><b style="font-size:12px">${t("02 / Vision evidence", "02 / 视觉检验证据")}</b>${v ? badge(v === "valid" ? t("Gateway verified", "网关已验证") : v === "offline" ? t("Queued locally", "本地排队") : t("Quarantined", "已隔离"), v === "valid" ? "" : v === "offline" ? "amber" : "red") : badge(t("Awaiting", "待接收"), "gray")}</div><div class="gap-small"></div><p style="font-size:11px">${t("Surface / burr check · camera CAM-02", "表面 / 毛刺检查 · 相机 CAM-02")}</p><label class="fieldlabel" for="scenario" style="font-size:8px;margin-top:10px">${t("Test event · simulation", "测试事件 · 模拟")}</label><select class="select" id="scenario" style="font-size:10px;padding:9px">${[
      ["valid", t("Valid gateway-signed result", "有效网关签名结果")],
      ["tampered", t("Result changed after signing", "签名后结果被修改")],
      ["replay", t("Previously ingested event replay", "重复提交已接收事件")],
      ["unsigned", t("Unsigned manual image upload", "手工上传无签名图片")],
      ["offline", t("Gateway offline / upload pending", "网关离线 / 等待上传")],
    ]
      .map(([x, l]) => `<option value="${x}" ${state.scenario === x ? "selected" : ""}>${l}</option>`)
      .join(
        "",
      )}</select><div class="gap-small"></div>${button(icon("camera") + " " + t("Receive camera event · demo", "接收相机事件 · 演示"), "vision", "secondary small")}${v ? `<div class="gap-small"></div><div class="notice ${v === "valid" ? "" : v === "offline" ? "amber" : "red"}" style="font-size:10px">${visionMessage(v)}</div>` : ""}</div><div class="gap"></div>${button(t("Continue to evidence review", "进入证据审核"), "evidence", "green", !state.measurement || v !== "valid")}<div class="gap-small"></div><p style="font-size:10px">${t("A failed integrity check cannot be overridden into a verified record.", "完整性验证失败的记录不能被手工改为已验证。")}</p>`;
  }
  if (state.step === 4) {
    return `<div class="row"><div class="eyebrow">${t("Evidence record", "检验证据")}</div>${badge("EV-00047")}</div><h2>${t("Recorded.<br>Ready for review.", "证据已保存。<br>等待业务审核。")}</h2><p class="intro">${t("Integrity and quality are separate decisions. The original inspection result stays read-only.", "完整性与品质处置是两个独立判断。原始检验结果保持只读。")}</p><div class="card"><div class="evidence-item"><span class="tick">✓</span><div><b>${t("Instrument record captured", "量具记录已采集")}</b><p>F-OD-01 · 25.012 mm · BLE-07</p></div></div><div class="evidence-item"><span class="tick">✓</span><div><b>${t("Gateway signature verified", "网关签名验证通过")}</b><p>GW-CKE-02 · ${t("image hash matched", "图片哈希一致")}</p></div></div><div class="evidence-item"><span class="tick">✓</span><div><b>${t("Work session linked", "工作会话已关联")}</b><p>W017 · SN-0047 · OP20 · QC-V02</p></div></div><div class="evidence-item"><span class="tick ${state.qc ? "" : "warning-tick"}">${state.qc ? "✓" : "!"}</span><div><b>${t(state.qc ? "QA disposition accepted" : "QA disposition pending", state.qc ? "品质处置已批准" : "品质处置待审核")}</b><p>${t("Camera result: PASS. Acceptance requires the authorized quality workflow.", "相机结果：合格。业务接收仍需授权的品质审核流程。")}</p></div></div></div><div class="gap"></div><div class="notice neutral" style="font-size:10px">${t("Origin assurance: verified from gateway receipt onward. This sample camera does not sign its own images.", "来源保证：从网关接收时起已验证。示例相机本身不对图片签名。")}</div><div class="gap"></div>${button(t(state.qc ? "View my skill passport" : "Open FDM quality review · demo", state.qc ? "查看我的技能护照" : "打开 FDM 品质审核 · 演示"), state.qc ? "passport" : "review-quality", "green")}<div class="gap-small"></div>${button(t("View evidence details", "查看证据详情"), "details", "secondary small")}`;
  }
  if (state.step === 5) {
    const guest = state.guest;
    return `<div class="row"><div class="eyebrow">${t("Digital Skill Passport", "数字技能护照")}</div>${badge(t(guest ? "Sample only" : "Factory linked", guest ? "仅示例" : "已关联企业"), guest ? "gray" : "")}</div><div class="gap"></div><div class="skcard"><div class="eyebrow">${t("Task-based experience", "基于任务的经验记录")}</div><h3>${t("Operator 017", "操作员 017")}</h3><p style="font-size:11px">${t("In-process inspection · supervised scope", "过程检验 · 受监督范围")}</p><div class="gap-small"></div>${badge(t(state.observed ? "Observation issued" : "Evidence collected", state.observed ? "观察记录已签发" : "已积累证据"))}<div style="font-size:9px;margin-top:14px;color:#aebccc">DSP-DEMO-0017 · ${t("Employer: CKE (sample)", "签发企业：CKE（示例）")}</div></div><div class="metricrow"><div class="metric"><strong>${guest ? "2" : state.qc ? "2" : "0"}</strong><small>${t("accepted events", "已接收事件")}</small></div><div class="metric"><strong>1</strong><small>${t("task context", "任务上下文")}</small></div><div class="metric"><strong>${state.observed ? "1" : "0"}</strong><small>${t("observations", "已签发观察")}</small></div></div><div class="card"><div class="row row-top"><b style="font-size:12px">${t("Dimensional inspection", "尺寸检验")}</b>${badge(t("In training", "培训中"), "amber")}</div><p style="font-size:11px;margin-top:7px">${t("Evidence: instrument use + inspection workflow. A camera pass is not an operator qualification.", "证据：量具使用与检验流程。相机判定合格不等于人员已取得资格。")}</p><div class="divider"></div><div class="mini-label">${t("Next assessment step", "下一步评估")}</div><p style="font-size:11px;margin-top:5px">${t(state.observed ? "Supervisor observation recorded. Further assessment is required before independent inspection authorization." : "Supervisor observes setup, method and response to an abnormal result using the approved rubric.", state.observed ? "已记录主管观察。独立检验授权前仍需进一步评估。" : "主管按批准准则观察设置、方法及异常响应。")}</p></div><div class="gap"></div>${guest ? `<div class="notice amber">${t("Public sample. You have no production access and cannot claim this credential.", "公开示例。你没有生产访问权限，也不能领取此凭证。")}</div><div class="gap-small"></div>${button(t("Request a factory invitation", "申请企业邀请"), "request-invite", "secondary")}` : state.observed ? `${button(t("View issued observation", "查看已签发观察"), "view-observation", "green")}` : button(t("Request supervisor assessment", "申请主管评估"), "request-skill", "green")}<div class="gap-small"></div>${button(t("Preview a restricted share card", "预览受限分享卡"), "share", "secondary small")}<p style="font-size:9px;margin-top:12px">${t("No raw images, customer drawings, part IDs or detailed quality readings appear on the share card.", "分享卡不展示原图、客户图纸、零件编号或详细品质读数。")}</p>`;
  }
  return "";
}
function visionMessage(v) {
  return {
    valid: t(
      "PASS received. Signature and image digest matched in this simulation; quality review is still pending.",
      "已接收合格结果。模拟签名与图片摘要匹配；品质审核仍待完成。",
    ),
    tampered: t(
      "Signature mismatch. Preserve the rejected attempt; do not add it to accepted quality evidence.",
      "签名不匹配。保留拒绝记录，不计入已接收的品质证据。",
    ),
    replay: t(
      "Duplicate event ID / sequence. Return the prior receipt; do not create another skill event.",
      "事件编号或序列重复。返回原回执，不生成新的技能事件。",
    ),
    unsigned: t(
      "No trusted origin signature. Store as an unverified attachment, not as camera-verified evidence.",
      "没有可信来源签名。仅作为未验证附件保存，不能视为已验证视觉证据。",
    ),
    offline: t(
      "Signed record queued on the edge. Not server-verified and not eligible for passport credit yet.",
      "签名记录在边缘端排队。服务端尚未验证，暂不计入护照证据。",
    ),
  }[v];
}
function feed(title, desc, amber = false) {
  return `<div class="feedrow"><span class="feed-dot" style="${amber ? "background:var(--amber)" : ""}"></span><div><b>${title}</b><p>${desc}</p></div></div>`;
}
function backendHTML() {
  const valid = state.vision === "valid";
  let identity = !state.logged
    ? "Not authenticated"
    : state.guest
      ? "Public demo access"
      : state.bound
        ? "Employee binding verified"
        : state.claimed
          ? "Employer verification pending"
          : "Account recognized only";
  let events = feed(
    "Invitation resolved",
    state.route === "public"
      ? "Public sample · no tenant membership"
      : "Opaque token · server-side factory / destination scope",
  );
  if (state.logged)
    events += feed(
      "Account session established",
      "WeChat authentication is distinct from employee identity.",
    );
  if (state.claimed)
    events += feed(
      "Membership claim submitted",
      "No production record access until employer verification.",
      !state.bound,
    );
  if (state.bound)
    events += feed("Employer binding confirmed", "CKE-W017 · trainee role · supervised tasks only");
  if (state.session) events += feed("Work session created", "WS-0047 · W017 / QC-V02 / OP20 / SN-0047");
  if (state.measurement)
    events += feed("Instrument event captured", "F-OD-01 · 25.012 mm · direct-capture simulation");
  if (state.vision)
    events += feed(
      valid ? "Vision envelope verified" : "Vision event held",
      valid
        ? "Gateway signature + image digest; camera-origin signature absent."
        : {
            tampered: "Signature mismatch → quarantine",
            replay: "Duplicate → prior receipt only",
            unsigned: "Manual image → unverified attachment",
            offline: "Edge queued → pending upload",
          }[state.vision],
      !valid,
    );
  if (state.qc)
    events += feed(
      "Quality disposition appended",
      "QA reviewer accepted the inspection evidence. Raw result unchanged.",
    );
  if (state.observed)
    events += feed(
      "Supervised observation issued",
      "Evidence-backed task observation—not independent qualification.",
    );
  if (state.amended)
    events += feed("Amendment requested", "New audit event linked to EV-00047. Original is retained.", true);
  return `<div><div class="eyebrow muted">FDM Quality / Backend view</div><h2>One record. Two outcomes.</h2><p class="backend-intro">The factory gets traceable quality evidence. The worker gets a reviewed record of experience.</p></div><div class="panel"><div class="panel-head"><h3>Identity & work context</h3>${badge("DEMO", "gray")}</div><div class="panel-body">${kv("Membership", identity)}${kv("Work session", state.session ? "WS-0047 · active" : "Not started")}${kv("Factory role", state.bound ? "Trainee · supervised" : "Not granted")}${state.claimed && !state.bound ? `<div class="gap"></div>${button("Employer: verify binding · demo", "review-membership", "small")}` : ""}</div></div><div class="panel"><div class="panel-head"><h3>Evidence & decision trail</h3>${badge(state.qc ? "QA accepted" : "In progress", state.qc ? "" : "gray")}</div><div class="panel-body">${events}</div></div>${state.step >= 4 && !state.guest ? `<div class="panel"><div class="panel-head"><h3>Separate review decisions</h3></div><div class="panel-body"><div class="verification-check"><span class="tick">✓</span><span><b>Integrity:</b> gateway-verified receipt</span></div><div class="verification-check"><span class="tick ${state.qc ? "" : "warning-tick"}">${state.qc ? "✓" : "!"}</span><span><b>Quality:</b> ${state.qc ? "accepted by QA" : "awaiting disposition"}</span></div><div class="verification-check"><span class="tick ${state.observed ? "" : "warning-tick"}">${state.observed ? "✓" : "!"}</span><span><b>Skill:</b> ${state.observed ? "supervised observation issued" : "not yet assessed"}</span></div><div class="gap"></div>${!state.qc ? button("QA reviewer: inspect evidence", "review-quality", "small") : !state.observed ? button("Supervisor: review observation", "review-skill", "small") : button("Append correction request", "amend", "secondary small")}</div></div>` : ""}<div class="rule-box"><b>Never turn “PASS” into “competent”.</b>Source authenticity, valid inspection method, correct operator attribution and an approved assessment are different claims. Preserve each separately.</div>`;
}
function handle(action) {
  switch (action) {
    case "notice":
      modal(
        t("Workplace data notice", "工作数据说明"),
        `<p>This prototype uses synthetic data only. A production notice should explain the organization responsible, required identity and work-event data, purpose, access, retention, correction rights and contact route.</p><p>Proposed default: no contact list, facial recognition, résumé or mandatory phone number. Marketing permission and external credential sharing must not be bundled with factory access.</p><div class="notice">Workers see their own passport and have a correction / review route. Employers must establish the appropriate processing basis and retention policy for their jurisdiction.</div>`,
        "PROTOTYPE · NOTICE CONTENT",
      );
      break;
    case "login":
      if (!state.consent) return;
      state.logged = true;
      if (state.route === "public") {
        state.guest = true;
        state.max = 5;
        state.step = 5;
        render();
      } else if (state.route === "returning") {
        state.bound = true;
        go(2);
      } else go(1);
      break;
    case "claim":
      state.claimed = true;
      render();
      break;
    case "review-membership":
      modal(
        "Verify employee binding",
        `<p><b>Employer reviewer · not a worker action.</b> In production, verify against the company’s trusted identity process or an in-person roster check. Invitation possession alone is not enough.</p><div class="card">${kv("Employee", "CKE-W017 (synthetic)")}${kv("Account", "WeChat account recognized")}${kv("Role", "Trainee · supervised tasks")}${kv("Proof in this demo", "Simulated in-person employer check")}</div><div class="gap"></div>${button("Record verified binding · demo", "approve-membership", "green")}`,
      );
      break;
    case "approve-membership":
      state.bound = true;
      state.claimed = true;
      closeModal();
      go(2);
      toast("Demo employer binding recorded. No real account was linked.");
      break;
    case "start":
      if (!state.bound) return;
      state.session = true;
      go(3);
      break;
    case "measure":
      if (!state.session) return;
      state.measurement = true;
      render();
      toast("Synthetic instrument value captured; no hardware is connected.");
      break;
    case "vision":
      if (!state.session) return;
      state.vision = state.scenario;
      render();
      break;
    case "evidence":
      if (state.measurement && state.vision === "valid") go(4);
      break;
    case "review-quality":
      if (!state.measurement || state.vision !== "valid") return;
      modal(
        "Review inspection disposition",
        `<p><b>Quality reviewer · separate from the evidence signer.</b> Confirm the approved method, current calibration, correct part / revision, and inspection coverage. The signature alone does not establish measurement validity.</p><div class="card">${kv("Evidence", "EV-00047")}${kv("Instrument", "25.012 mm · within demo limits")}${kv("Vision result", "PASS · surface / burr scope only")}${kv("Origin", "Gateway receipt verified")}${kv("Human attribution", "WS-0047 · operator W017")}</div><div class="gap"></div>${button("Append QA acceptance · demo", "approve-quality", "green")}<div class="gap-small"></div>${button("Request reinspection · preserve original", "reinspect", "secondary")}`,
      );
      break;
    case "approve-quality":
      state.qc = true;
      closeModal();
      go(5);
      toast("QA acceptance appended. No competency was automatically awarded.");
      break;
    case "reinspect":
      state.amended = true;
      closeModal();
      render();
      toast("Reinspection request appended; original inspection remains unchanged.");
      break;
    case "passport":
      go(5);
      break;
    case "details":
      modal(
        "Evidence provenance",
        `<div class="card">${kv("Event", "EV-00047")}${kv("Origin assurance", "Gateway-verified; not camera-origin verified")}${kv("Gateway", "GW-CKE-02")}${kv("Camera", "CAM-02")}${kv("Feature", "F-SURFACE-01")}${kv("Recipe / model", "VIS-RECIPE-03 / burr-v1.4")}${kv("Original", "Private, version-bound artifact")}${kv("Hash / signature", "Simulated in this workflow")}${kv("Participant role", "Operator / supervised task")}</div><p>Original image and payload: immutable within the configured retention period. Correction: append a new event. Preview access: authorized and logged.</p><div class="notice amber">This is a conceptual record. The real signing demonstration is in the Secure vision tab.</div>`,
        "FDM · READ-ONLY EVIDENCE",
      );
      break;
    case "request-skill":
      state.skillRequested = true;
      render();
      handle("review-skill");
      break;
    case "review-skill":
      if (!state.qc || state.guest) return;
      modal(
        "Record supervised observation",
        `<p><b>Employer assessor · not self-certification.</b> This demonstration issues a narrow task observation after evidence review. It does not issue an independent-inspector qualification.</p><div class="card">${kv("Rubric", "OBS-DIM-01 · v1 (example)")}${kv("Scope", "Supervised dimensional inspection")}${kv("Evidence", "EV-00047 + task context")}${kv("Required observation", "Setup, method and abnormality response")}${kv("Outcome", "Task observed; training continues")}</div><div class="gap"></div>${button("Record assessor observation · demo", "approve-skill", "green")}<p>Production issuance records assessor identity, assessed criteria, scope, time, validity / reassessment policy and revocation status. Numeric qualification thresholds must be defined by the employer.</p>`,
      );
      break;
    case "approve-skill":
      if (!state.qc || state.guest) return;
      state.observed = true;
      state.skillRequested = true;
      closeModal();
      go(5);
      toast("Supervised observation issued. Independent authorization is still not granted.");
      break;
    case "view-observation":
      modal(
        "Supervised task observation",
        `<div class="card">${kv("Credential ID", "OBS-DEMO-00017")}${kv("Issuer", "CKE · demo employer assessor")}${kv("Subject", "Operator 017")}${kv("Scope", "Supervised dimensional inspection")}${kv("Rubric", "OBS-DIM-01 · v1")}${kv("Evidence reference", "EV-00047")}${kv("Issued", "6 Oct 2026 · synthetic")}${kv("Status", "Active · reviewed task observation")}</div><p>This record does not authorize unsupervised work. The employer defines reassessment and expiration. A future employer must make its own authorization decision.</p>`,
        "PASSPORT · EMPLOYER OBSERVATION",
      );
      break;
    case "share":
      modal(
        "Restricted passport share preview",
        `<div class="skcard"><div class="eyebrow">Restricted verification view</div><h3>Operator 017</h3><p>Supervised dimensional inspection</p><div class="gap"></div>${badge(state.guest ? "Sample only" : state.observed ? "Employer observation issued" : "Evidence pending assessment")}</div><p>Display only selected skill scope, issuer and current credential status. Do not expose raw images, drawings, part IDs, readings or another employer’s private records.</p><div class="notice">Production sharing needs an expiring, revocable authorization record and live status checks. This preview does not create a live link or QR.</div>`,
        "PASSPORT · PRIVACY-PRESERVING PREVIEW",
      );
      break;
    case "amend":
      modal(
        "Append correction request",
        `<p>The original evidence is retained. Corrections create a new linked event and may require dependent quality decisions or credentials to be reassessed.</p><label for="correction">Reason</label><textarea id="correction" placeholder="Describe the error and the proposed correction."></textarea>${button("Append correction request · demo", "save-amend", "green")}`,
        "FDM · APPEND, NEVER OVERWRITE",
      );
      break;
    case "save-amend":
      if (!$("correction").value.trim()) {
        toast("Enter a correction reason.");
        return;
      }
      state.amended = true;
      closeModal();
      render();
      toast("Correction request appended in this demonstration.");
      break;
    case "request-invite":
      modal(
        "Join your factory",
        `<p>Ask an authorized factory administrator to send an individual invitation or verify your membership. A public QR cannot grant access to private production records.</p><div class="notice">Demo only: no message or access request is sent.</div>`,
        "PUBLIC VISITOR · NO PRODUCTION ACCESS",
      );
      break;
    case "close-modal":
      closeModal();
      break;
  }
}
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-action]");
  if (a && !a.disabled) handle(a.dataset.action);
  const s = e.target.closest("[data-step]");
  if (s && !s.disabled && Number(s.dataset.step) <= state.max) go(Number(s.dataset.step));
  const v = e.target.closest("[data-view]");
  if (v) {
    document.querySelectorAll(".view").forEach((x) => x.classList.toggle("active", x.id === v.dataset.view));
    document.querySelectorAll(".tab").forEach((x) => {
      x.classList.toggle("active", x === v);
      x.setAttribute("aria-selected", x === v ? "true" : "false");
    });
  }
  if (e.target.id === "modalBackdrop") closeModal();
});
document.addEventListener("change", (e) => {
  if (e.target.id === "consent") {
    state.consent = e.target.checked;
    const b = $("screen").querySelector('[data-action="login"]');
    b.disabled = !state.consent;
  }
  if (e.target.id === "scenario") state.scenario = e.target.value;
});
document.addEventListener("keydown", (e) => {
  if (!$("modalRoot").firstChild) return;
  if (e.key === "Escape") {
    closeModal();
    return;
  }
  if (e.key === "Tab") {
    const focusable = Array.from(
      $("modalRoot").querySelectorAll('button:not(:disabled),[href],input,select,textarea,[tabindex="0"]'),
    );
    if (!focusable.length) return;
    const first = focusable[0],
      last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
$("route").addEventListener("change", (e) => reset(e.target.value));
$("resetFlow").addEventListener("click", () => reset($("route").value));
$("langEn").addEventListener("click", () => {
  lang = "en";
  render();
});
$("langZh").addEventListener("click", () => {
  lang = "zh";
  render();
});
// Real, strictly local cryptographic lab. Never use browser-owned signing keys
// or in-memory deduplication as the production camera trust implementation.
let lab = { keys: null, signature: null, original: null, seen: new Set() },
  labBusy = false;
const enc = new TextEncoder();
const bytesHex = (b) =>
  Array.from(new Uint8Array(b))
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
function labStatus(text, type = "neutral") {
  $("cryptoStatus").className = "notice " + type;
  $("cryptoStatus").textContent = text;
}
function setLabEnabled(ready) {
  ["tamperEvent", "verifyEvent", "restoreEvent"].forEach((id) => ($(id).disabled = !ready));
}
async function signSample() {
  if (labBusy) return;
  labBusy = true;
  $("signEvent").disabled = true;
  setLabEnabled(false);
  try {
    if (!globalThis.crypto?.subtle)
      throw new Error(
        "Web Crypto unavailable. Use a modern browser with file access allowed, or serve this file from localhost / HTTPS.",
      );
    lab = {
      keys: await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, false, [
        "sign",
        "verify",
      ]),
      signature: null,
      original: null,
      seen: new Set(),
    };
    const imageDigest = bytesHex(
      await crypto.subtle.digest("SHA-256", enc.encode("SYNTHETIC_DEMO_IMAGE_BYTES_NOT_A_CAMERA_FRAME")),
    );
    const payload = {
      schema_version: "ciq.vision.demo.v1",
      event_id: "EV-DEMO-00047",
      device_id: "GW-DEMO-02",
      sequence: 47,
      work_session_id: "WS-DEMO-0047",
      part_instance_id: "SN-DEMO-0047",
      participant_role: "operator",
      feature_id: "F-OD-DEMO-01",
      measurement_mm: "25.012",
      outcome: "PASS",
      image_sha256: imageDigest,
    };
    lab.original = JSON.stringify(payload, null, 2);
    lab.signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      lab.keys.privateKey,
      enc.encode(lab.original),
    );
    $("eventJson").value = lab.original;
    $("eventJson").readOnly = false;
    $("cryptoHash").textContent = "SHA-256 of synthetic image fixture: " + imageDigest;
    setLabEnabled(true);
    labStatus(
      "Signed locally. Verify the original once, then alter it or submit it a second time. No production device identity is proven.",
    );
  } catch (err) {
    labStatus(err.message, "red");
  } finally {
    labBusy = false;
    $("signEvent").disabled = false;
  }
}
async function verifySample() {
  if (labBusy || !lab.keys || !lab.signature) return;
  labBusy = true;
  $("verifyEvent").disabled = true;
  try {
    const text = $("eventJson").value;
    const valid = await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      lab.keys.publicKey,
      lab.signature,
      enc.encode(text),
    );
    if (!valid) {
      labStatus(
        "REJECTED · Digital signature mismatch. Signed bytes were changed. Do not accept this event or award evidence credit.",
        "red",
      );
      return;
    }
    const event = JSON.parse(text);
    const key = event.device_id + "|" + event.event_id;
    if (lab.seen.has(key)) {
      labStatus(
        "DUPLICATE · Signature is valid, but this event was already ingested. Return the prior receipt; no second record or skill credit.",
        "amber",
      );
      return;
    }
    lab.seen.add(key);
    labStatus(
      "ACCEPTED ONCE · Signature verified against this page’s temporary public key. Integrity passed in the lab; factual correctness and human skill are not established.",
      "",
    );
  } catch (err) {
    labStatus("Verification error: " + err.message, "red");
  } finally {
    labBusy = false;
    $("verifyEvent").disabled = false;
  }
}
$("signEvent").addEventListener("click", signSample);
$("verifyEvent").addEventListener("click", verifySample);
$("tamperEvent").addEventListener("click", () => {
  try {
    const event = JSON.parse($("eventJson").value);
    event.measurement_mm = "25.112";
    event.outcome = "FAIL";
    $("eventJson").value = JSON.stringify(event, null, 2);
    labStatus("Payload changed without re-signing. Press Verify / ingest to detect the change.", "amber");
  } catch {
    labStatus("The payload is not valid JSON. Restore the signed bytes before altering the sample.", "red");
  }
});
$("restoreEvent").addEventListener("click", () => {
  if (lab.original) {
    $("eventJson").value = lab.original;
    labStatus(
      "Original signed bytes restored. Previous ingestion history is retained, so a replay will not count twice.",
    );
  }
});
reset();

/* Site nav: links with data-tab open that tab of the prototype */
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[data-tab]");
  if (!link) return;
  e.preventDefault();
  const tab = document.querySelector('.tab[data-view="' + link.dataset.tab + '"]');
  if (tab) {
    tab.click();
    document.querySelector(".tabsbar").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

/* Auto demo: presses the walkthrough buttons by itself so visitors can just watch.
   Starts when the onboarding section comes into view, loops, and stops as soon as the visitor
   clicks or types anywhere in the walkthrough. */
const AUTO_SCRIPT = [
  // [what to press, pause before the next press in ms]
  ["#consent", 900],
  ['[data-action="login"]', 1600],
  ['[data-action="claim"]', 1600],
  ['#screen [data-action="review-membership"]', 1700],
  ['[data-action="approve-membership"]', 1800],
  ['[data-action="start"]', 1700],
  ['[data-action="measure"]', 1500],
  ['[data-action="vision"]', 1700],
  ['[data-action="evidence"]', 1800],
  ['#screen [data-action="review-quality"]', 1700],
  ['[data-action="approve-quality"]', 1800],
  ['[data-action="request-skill"]', 1700],
  ['[data-action="approve-skill"]', 2400],
];
const auto = { on: false, timer: null, index: 0, userStopped: false };
const autoButton = $("autoDemo"),
  autoStatus = $("autoStatus");
const wait = (ms) => new Promise((done) => (auto.timer = setTimeout(done, ms)));

function setAutoUI() {
  autoButton.innerHTML = auto.on ? "❚❚ &nbsp; Pause auto demo" : "▶ &nbsp; Play auto demo";
  autoButton.setAttribute("aria-pressed", String(auto.on));
  autoStatus.textContent = auto.on ? "Auto demo running · click anywhere in the demo to take over." : "";
}
// Scroll inside the phone (not the page) so the next button is visible
function revealInPhone(el) {
  const body = $("phonebody");
  if (!body.contains(el)) return;
  const r = el.getBoundingClientRect(),
    b = body.getBoundingClientRect();
  if (r.top < b.top || r.bottom > b.bottom) body.scrollTop += r.top - b.top - b.height / 2 + r.height / 2;
}
async function runAuto() {
  while (auto.on) {
    if (auto.index === 0) {
      closeModal();
      $("route").value = "invite";
      reset("invite");
      await wait(1200);
    }
    const [selector, pause] = AUTO_SCRIPT[auto.index];
    const el = document.querySelector(selector);
    if (!auto.on) return;
    if (el && !el.disabled) {
      revealInPhone(el);
      el.classList.add("auto-click");
      await wait(850);
      if (!auto.on) return el.classList.remove("auto-click");
      el.classList.remove("auto-click");
      el.click();
    }
    await wait(pause);
    auto.index = (auto.index + 1) % AUTO_SCRIPT.length;
    if (auto.index === 0) {
      closeModal();
      await wait(3500); // let the finished passport sit on screen before looping
    }
  }
}
function startAuto() {
  if (auto.on) return;
  auto.on = true;
  setAutoUI();
  runAuto();
}
function stopAuto() {
  auto.on = false;
  clearTimeout(auto.timer);
  document.querySelectorAll(".auto-click").forEach((el) => el.classList.remove("auto-click"));
  setAutoUI();
}
autoButton.addEventListener("click", () => {
  if (auto.on) {
    auto.userStopped = true;
    stopAuto();
  } else {
    auto.userStopped = false;
    if (auto.index === 0 || state.step === 0) auto.index = 0;
    startAuto();
  }
});
// A real click or key press inside the walkthrough hands control back to the visitor
["pointerdown", "keydown"].forEach((type) =>
  document.addEventListener(type, (e) => {
    if (!auto.on || !e.isTrusted || e.target.closest("#autoDemo")) return;
    if (e.target.closest("#workflow") || e.target.closest("#modalRoot")) {
      auto.userStopped = true;
      auto.index = 0;
      stopAuto();
    }
  }),
);
// Start automatically the first time the onboarding section is on screen
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !auto.userStopped && $("workflow").classList.contains("active"))
          startAuto();
        if (!entry.isIntersecting && auto.on) stopAuto();
      });
    },
    { threshold: 0.35 },
  ).observe($("workflow"));
}
setAutoUI();
