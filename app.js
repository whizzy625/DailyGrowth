    const DAILY_ITEMS = [
      { name: "做每日计划", score: 10, count: 0, type: "single" },
      { name: "学习", score: null, count: 0, type: "study" },
      { name: "健身", score: null, count: 0, type: "fitness" },
      { name: "早起", score: null, count: 0, type: "wake" },
      { name: "冥想10分钟", score: 10, count: 0, type: "single" },
      { name: "吃早饭", score: 20, count: 0, type: "single" },
      { name: "吃补品", score: 10, count: 0, type: "single" },
      { name: "清洁护肤", score: 20, count: 0, type: "single" },
      { name: "打扫房间15分钟", score: 20, count: 0, type: "single" },
      { name: "家庭沟通30分钟", score: 30, count: 0, type: "single" }
    ];

    const FITNESS_ITEMS = [
      { name: "小臂训练10分钟", score: 10, count: 0 },
      { name: "二头肌训练10分钟", score: 10, count: 0 },
      { name: "三头肌训练10分钟", score: 10, count: 0 },
      { name: "胸部训练20分钟", score: 20, count: 0 },
      { name: "腿部训练20分钟", score: 20, count: 0 }
    ];

    const STUDY_ITEMS = [
      { name: "学习1小时", score: 30, count: 0 },
      { name: "学习2小时", score: 60, count: 0 },
      { name: "学习3小时", score: 90, count: 0 },
      { name: "学习4小时", score: 120, count: 0 },
      { name: "学习5小时", score: 150, count: 0 },
      { name: "学习6小时", score: 180, count: 0 }
    ];

    const WAKE_ITEMS = [
      { name: "6点起床", score: 30, count: 0 },
      { name: "7点起床", score: 20, count: 0 },
      { name: "8点起床", score: 10, count: 0 }
    ];

    let totalScore = 0;
    let tasks = clone(DAILY_ITEMS);
    let fitnessItems = clone(FITNESS_ITEMS);
    let studyItems = clone(STUDY_ITEMS);
    let wakeItems = clone(WAKE_ITEMS);
    let logs = [];
    let studyCustomCount = 0;

    const scoreEl = document.getElementById("score");
    const scoreSubEl = document.getElementById("scoreSub");
    const taskEl = document.getElementById("tasks");
    const logEl = document.getElementById("log");
    const gainTodayEl = document.getElementById("gainToday");
    const wasteTodayEl = document.getElementById("wasteToday");
    const netTodayEl = document.getElementById("netToday");
    const fitnessListEl = document.getElementById("fitnessList");
    const studyListEl = document.getElementById("studyList");
    const wakeListEl = document.getElementById("wakeList");
    const historyDateEl = document.getElementById("historyDate");
    const historyContentEl = document.getElementById("historyContent");
    const wasteInputEl = document.getElementById("wasteInput");

    function clone(data) {
      return JSON.parse(JSON.stringify(data));
    }

    function getTodayKey(date = new Date()) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }

    function formatTime(date = new Date()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    function recalcTotalScore() {
      totalScore = logs.reduce((sum, item) => sum + item.scoreChange, 0);
    }

    function save() {
      localStorage.setItem("tasks", JSON.stringify(tasks));
      localStorage.setItem("fitnessItems", JSON.stringify(fitnessItems));
      localStorage.setItem("studyItems", JSON.stringify(studyItems));
      localStorage.setItem("wakeItems", JSON.stringify(wakeItems));
      localStorage.setItem("studyCustomCount", String(studyCustomCount));
      localStorage.setItem("logs", JSON.stringify(logs));
    }

    function load() {
      const savedTasks = JSON.parse(localStorage.getItem("tasks") || "null");
      const savedFitness = JSON.parse(localStorage.getItem("fitnessItems") || "null");
      const savedStudy = JSON.parse(localStorage.getItem("studyItems") || "null");
      const savedWake = JSON.parse(localStorage.getItem("wakeItems") || "null");
      const savedCustom = Number(localStorage.getItem("studyCustomCount"));
      const savedLogs = JSON.parse(localStorage.getItem("logs") || "[]");

      if (Array.isArray(savedTasks) && savedTasks.length === DAILY_ITEMS.length) tasks = savedTasks;
      if (Array.isArray(savedFitness) && savedFitness.length === FITNESS_ITEMS.length) fitnessItems = savedFitness;
      if (Array.isArray(savedStudy) && savedStudy.length === STUDY_ITEMS.length) studyItems = savedStudy;
      if (Array.isArray(savedWake) && savedWake.length === WAKE_ITEMS.length) wakeItems = savedWake;
      if (Number.isFinite(savedCustom)) studyCustomCount = savedCustom;
      logs = Array.isArray(savedLogs) ? savedLogs : [];
      recalcTotalScore();
    }

    function addLog(text, scoreChange, kind, meta = {}, date = new Date()) {
      logs.unshift({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        scoreChange,
        kind,
        meta,
        dateKey: getTodayKey(date),
        time: formatTime(date),
        timestamp: date.toISOString()
      });
      recalcTotalScore();
    }

    function removeLog(logId) {
      const idx = logs.findIndex(item => item.id === logId);
      if (idx === -1) return;

      const log = logs[idx];
      const meta = log.meta || {};

      if (meta.group === "task" && Number.isInteger(meta.index) && tasks[meta.index]) {
        tasks[meta.index].count = Math.max(0, (tasks[meta.index].count || 0) - 1);
      }

      if (meta.group === "fitness" && Number.isInteger(meta.index) && fitnessItems[meta.index]) {
        fitnessItems[meta.index].count = Math.max(0, (fitnessItems[meta.index].count || 0) - 1);
      }

      if (meta.group === "study-fixed" && Number.isInteger(meta.index) && studyItems[meta.index]) {
        studyItems[meta.index].count = Math.max(0, (studyItems[meta.index].count || 0) - 1);
      }

      if (meta.group === "study-custom") {
        studyCustomCount = Math.max(0, studyCustomCount - 1);
      }

      if (meta.group === "wake" && Number.isInteger(meta.index) && wakeItems[meta.index]) {
        wakeItems[meta.index].count = Math.max(0, (wakeItems[meta.index].count || 0) - 1);
      }

      logs.splice(idx, 1);
      recalcTotalScore();
    }

    function openLayer(id) {
      document.getElementById(id).classList.add("show");
    }

    function closeLayer(id) {
      document.getElementById(id).classList.remove("show");
    }

    function calcTodaySummary() {
      const today = getTodayKey();
      const todayLogs = logs.filter(item => item.dateKey === today);
      const gain = todayLogs.filter(item => item.scoreChange > 0).reduce((sum, item) => sum + item.scoreChange, 0);
      const waste = todayLogs.filter(item => item.scoreChange < 0).reduce((sum, item) => sum + Math.abs(item.scoreChange), 0);
      return { gain, waste, net: gain - waste };
    }

    function renderSummary() {
      const { gain, waste, net } = calcTodaySummary();
      scoreEl.textContent = net;
      gainTodayEl.textContent = gain;
      wasteTodayEl.textContent = waste;
      netTodayEl.textContent = net;
      scoreSubEl.textContent = `累计总分：${totalScore}`;
    }

    function renderTasks() {
      taskEl.innerHTML = "";

      tasks.forEach((task, index) => {
        const div = document.createElement("div");
        div.className = "card task-card";

        let displayCount = task.count || 0;
        let scoreText = `+${task.score}`;

        if (task.type === "fitness") {
          displayCount = fitnessItems.reduce((sum, item) => sum + (item.count || 0), 0);
          scoreText = "展开选择";
        } else if (task.type === "study") {
          displayCount = studyItems.reduce((sum, item) => sum + (item.count || 0), 0) + studyCustomCount;
          scoreText = "展开选择";
        } else if (task.type === "wake") {
          displayCount = wakeItems.reduce((sum, item) => sum + (item.count || 0), 0);
          scoreText = "展开选择";
        }

        div.innerHTML = `
          <div class="task-name">${task.name}</div>
          <div class="task-meta">
            <span>已完成 ${displayCount} 次</span>
            <span class="points">${scoreText}</span>
          </div>
        `;

        div.onclick = () => {
          if (task.type === "fitness") {
            renderFitnessItems();
            openLayer("fitnessModal");
            return;
          }

          if (task.type === "study") {
            renderStudyItems();
            openLayer("studyModal");
            return;
          }

          if (task.type === "wake") {
            renderWakeItems();
            openLayer("wakeModal");
            return;
          }

          tasks[index].count = (tasks[index].count || 0) + 1;
          addLog(`完成任务：${task.name}`, task.score, "gain", { group: "task", index });
          update();
        };

        taskEl.appendChild(div);
      });
    }

    function renderFitnessItems() {
      fitnessListEl.innerHTML = "";

      fitnessItems.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "subtask";
        div.innerHTML = `
          <div class="name">${item.name}</div>
          <div class="meta">+${item.score} 分 · 已完成 ${item.count || 0} 次</div>
        `;

        div.onclick = () => {
          fitnessItems[index].count = (fitnessItems[index].count || 0) + 1;
          addLog(`完成健身：${item.name}`, item.score, "gain", { group: "fitness", index });
          update();
          closeLayer("fitnessModal");
        };

        fitnessListEl.appendChild(div);
      });
    }

    function renderStudyItems() {
      studyListEl.innerHTML = "";

      studyItems.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "subtask";
        div.innerHTML = `
          <div class="name">${item.name}</div>
          <div class="meta">+${item.score} 分 · 已完成 ${item.count || 0} 次</div>
        `;

        div.onclick = () => {
          studyItems[index].count = (studyItems[index].count || 0) + 1;
          addLog(`完成学习：${item.name}`, item.score, "gain", { group: "study-fixed", index });
          update();
          closeLayer("studyModal");
        };

        studyListEl.appendChild(div);
      });

      const customDiv = document.createElement("div");
      customDiv.className = "subtask";
      customDiv.innerHTML = `
        <div class="name">自定义</div>
        <div class="meta">输入小时数，按 30 分 / 小时自动计分，例如 2.5 小时 = 75 分</div>
      `;
      customDiv.onclick = () => {
        const raw = prompt("输入学习小时数，例如 2.5");
        if (raw === null) return;
        const hours = Number(raw);
        if (!hours || hours <= 0) {
          alert("请输入正确的小时数");
          return;
        }
        const score = Math.round(hours * 30);
        studyCustomCount += 1;
        addLog(`完成学习：自定义 ${hours} 小时`, score, "gain", { group: "study-custom", hours });
        update();
        closeLayer("studyModal");
      };
      studyListEl.appendChild(customDiv);
    }

    function renderWakeItems() {
      wakeListEl.innerHTML = "";

      wakeItems.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "subtask";
        div.innerHTML = `
          <div class="name">${item.name}</div>
          <div class="meta">+${item.score} 分 · 已完成 ${item.count || 0} 次</div>
        `;

        div.onclick = () => {
          wakeItems[index].count = (wakeItems[index].count || 0) + 1;
          addLog(`完成早起：${item.name}`, item.score, "gain", { group: "wake", index });
          update();
          closeLayer("wakeModal");
        };

        wakeListEl.appendChild(div);
      });
    }

    function bindUndoButtons(scope) {
      scope.querySelectorAll(".undo-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          removeLog(btn.dataset.id);
          update();
        });
      });
    }

    function renderTodayLog() {
      const today = getTodayKey();
      const todayLogs = logs.filter(item => item.dateKey === today).slice(0, 30);

      if (!todayLogs.length) {
        logEl.innerHTML = `<div class="empty">今天还没有记录</div>`;
        return;
      }

      logEl.innerHTML = todayLogs.map(item => `
        <div class="log-item">
          <div class="log-time">${item.time}</div>
          <div class="log-row">
            <div class="log-text">${item.text}（${item.scoreChange > 0 ? "+" : ""}${item.scoreChange}）</div>
            <button class="icon-btn undo-btn" data-id="${item.id}" title="撤销">↩</button>
          </div>
        </div>
      `).join("");

      bindUndoButtons(logEl);
    }

    function renderHistory(dateKey) {
      const target = dateKey || getTodayKey();
      const items = logs.filter(item => item.dateKey === target);

      if (!items.length) {
        historyContentEl.innerHTML = `<div class="empty">这一天没有记录</div>`;
        return;
      }

      const gain = items.filter(i => i.scoreChange > 0).reduce((s, i) => s + i.scoreChange, 0);
      const waste = items.filter(i => i.scoreChange < 0).reduce((s, i) => s + Math.abs(i.scoreChange), 0);

      historyContentEl.innerHTML = `
        <div class="history-summary">
          <div class="summary">
            <div class="pill">
              <div class="small">成长</div>
              <div class="big">${gain}</div>
            </div>
            <div class="pill">
              <div class="small">浪费</div>
              <div class="big">${waste}</div>
            </div>
            <div class="pill">
              <div class="small">净值</div>
              <div class="big">${gain - waste}</div>
            </div>
          </div>
        </div>
        <div style="display:grid; gap:8px;">
          ${items.map(item => `
            <div class="log-item">
              <div class="log-time">${item.time}</div>
              <div class="log-row">
                <div class="log-text">${item.text}（${item.scoreChange > 0 ? "+" : ""}${item.scoreChange}）</div>
                <button class="icon-btn undo-btn" data-id="${item.id}" title="撤销">↩</button>
              </div>
            </div>
          `).join("")}
        </div>
      `;

      bindUndoButtons(historyContentEl);
    }

    function addWaste() {
      const minutes = Number(wasteInputEl.value);
      if (!minutes || minutes <= 0) {
        alert("请输入时间");
        return;
      }
      const units = Math.ceil(minutes / 30);
      const cost = units * 30;
      addLog(`浪费时间 ${minutes} 分钟`, -cost, "waste", { group: "waste", minutes });
      wasteInputEl.value = "";
      update();
    }

    function update() {
      renderSummary();
      renderTasks();
      renderTodayLog();
      const selectedDate = historyDateEl.value || getTodayKey();
      historyDateEl.value = selectedDate;
      renderHistory(selectedDate);
      save();
    }

    document.getElementById("addWasteBtn").addEventListener("click", addWaste);

    wasteInputEl.addEventListener("keydown", e => {
      if (e.key === "Enter") addWaste();
    });

    document.getElementById("historyBtn").addEventListener("click", () => {
      historyDateEl.value = historyDateEl.value || getTodayKey();
      renderHistory(historyDateEl.value);
      openLayer("historyDrawer");
    });

    historyDateEl.addEventListener("change", e => {
      renderHistory(e.target.value);
    });

    document.querySelectorAll("[data-close]").forEach(el => {
      el.addEventListener("click", () => closeLayer(el.dataset.close));
    });

    load();
    update();