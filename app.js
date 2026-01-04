import { PolicyModel } from "./model.js";
import { DashboardView } from "./view.js";
import { ReportGenerator } from "./utils.js";

class AdvancedPolicyLabApp {
  constructor() {
    this.model = new PolicyModel();
    this.view = new DashboardView();
    this.reportGenerator = new ReportGenerator();
    this.history = [];
    this.maxHistory = 30;
    this.paramsDirty = false;
    this.lastRunTimestamp = null;

    this.params = {

      r: 0.2,
      e: 2.5,
      eta: 0.85,
      tau: 30,
      lambda: 0.0,

      competition: 0.3,
      innovation: 0.6,
      monitoring: 0.5,

      regulation: 0.2,
    };

    this.latestResult = null;
    this.simulationFrame = null;
    this.orderFlowInterval = null;
    this.stagedParams = { ...this.params };

    this.scenarios = {
      baseline: {
        name: "基准情景",
        params: {
          r: 0.2,
          e: 2.5,
          eta: 0.85,
          competition: 0.3,
          innovation: 0.6,
          monitoring: 0.5,
          regulation: 0.2,
          lambda: 0.0,
        },
      },
      regulation: {
        name: "强监管情景",
        params: {
          r: 0.15,
          e: 2.0,
          eta: 0.8,
          competition: 0.4,
          innovation: 0.5,
          monitoring: 0.7,
          regulation: 0.8,
          lambda: 0.6,
        },
      },
      competition: {
        name: "激烈竞争情景",
        params: {
          r: 0.12,
          e: 3.5,
          eta: 0.9,
          competition: 0.8,
          innovation: 0.7,
          monitoring: 0.8,
          regulation: 0.1,
          lambda: 0.2,
        },
      },
      innovation: {
        name: "技术突破情景",
        params: {
          r: 0.18,
          e: 1.8,
          eta: 0.95,
          competition: 0.5,
          innovation: 0.9,
          monitoring: 0.3,
          regulation: 0.3,
          lambda: 0.4,
        },
      },
    };

    this.initEventListeners();
    this.commitAndRunSimulation(true);
    this.startOrderFlowLoop();
    lucide.createIcons();
  }

  initEventListeners() {

    const paramIds = [
      "r",
      "e",
      "eta",
      "tau",
      "lambda",
      "competition",
      "innovation",
      "monitoring",
      "regulation",
    ];
    paramIds.forEach((id) => {
      const el = document.getElementById(`param-${id}`);
      if (el) {
        el.addEventListener("input", (e) => {
          const val = parseFloat(e.target.value);
          this.stagedParams[id] = val;

          const displayVal =
            id === "r"
              ? `${Math.round(val * 100)}%`
              : id === "tau"
              ? `${val} min`
              : val.toFixed(2);
          const displayEl = document.getElementById(`val-${id}`);
          if (displayEl) displayEl.innerText = displayVal;

          this.markParamsDirty();
        });
      }
    });

    document
      .getElementById("exportBtn")
      .addEventListener("click", () => this.exportData());
    document
      .getElementById("reportBtn")
      .addEventListener("click", () => this.generateReport());
    document
      .getElementById("scenarioBtn")
      .addEventListener("click", () => this.showScenarioModal());
    document
      .getElementById("runSimulationBtn")
      .addEventListener("click", () => this.commitAndRunSimulation());

    document
      .getElementById("closeScenario")
      .addEventListener("click", () => this.hideScenarioModal());
    document.querySelectorAll(".scenario-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const scenario = e.currentTarget.dataset.scenario;
        this.loadScenario(scenario);
        this.hideScenarioModal();
      });
    });
  }

  runSimulation() {
    const result = this.model.calculate(
      this.params.r,
      this.params.e,
      this.params.eta,
      this.params.tau,
      this.params.lambda,
      this.params.monitoring,
      this.params.competition,
      this.params.regulation,
      this.params.innovation
    );

    this.history.push({
      ...result,
      timestamp: Date.now(),
      params: { ...this.params },
    });

    this.latestResult = result;

    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    this.view.updateMetrics(result, this.history);
    this.updateAdvancedMetrics(result);
    this.updatePolicyRecommendations(result);
    this.updateFooterMetrics(result);
  }

  startOrderFlowLoop() {
    if (this.orderFlowInterval) return;

    const tick = () => {
      if (this.latestResult) {
        this.view.updateOrderFlow(this.latestResult);
      }
    };

    if (typeof window !== "undefined") {
      tick();
      this.orderFlowInterval = window.setInterval(tick, 800);
    } else {
      tick();
      this.orderFlowInterval = setInterval(tick, 800);
    }
  }

  updateAdvancedMetrics(data) {

    document.getElementById("metric-efficiency").innerText = `${Math.round(
      data.market_efficiency
    )}%`;
    document.getElementById("metric-gini").innerText =
      data.gini_coefficient.toFixed(3);

    const sustainabilityBar = document.getElementById("sustainability-bar");
    const sustainabilityVal = document.getElementById("sustainability-val");
    if (sustainabilityBar && sustainabilityVal) {
      const normalizedSustainability = Math.max(
        0,
        Math.min(100, data.sustainability_index || 0)
      );
      sustainabilityBar.style.width = `${normalizedSustainability}%`;
      sustainabilityVal.innerText = `${Math.round(normalizedSustainability)}%`;
    }

    const concentrationEl = document.getElementById("market-concentration");
    const innovationIndexEl = document.getElementById("innovation-index");
    const regulatoryEffectivenessEl = document.getElementById(
      "regulatory-effectiveness"
    );

    if (concentrationEl)
      concentrationEl.innerText = `${Math.round(
        this.model.market_concentration * 100
      )}%`;
    if (innovationIndexEl)
      innovationIndexEl.innerText = data.innovation_index.toFixed(2);
    if (regulatoryEffectivenessEl)
      regulatoryEffectivenessEl.innerText = `${Math.round(
        data.regulatory_effectiveness
      )}%`;
  }

  updatePolicyRecommendations(data) {
    const container = document.getElementById("policy-recommendations");
    if (!container) return;

    if (data.policy_recommendations && data.policy_recommendations.length > 0) {
      container.innerHTML = data.policy_recommendations
        .map(
          (rec) => `
                <div class="p-2 bg-${this.getRecommendationColor(
                  rec.type
                )}/10 border border-${this.getRecommendationColor(
            rec.type
          )}/20 rounded text-[10px]">
                    <div class="font-semibold text-${this.getRecommendationColor(
                      rec.type
                    )} mb-1">${rec.title}</div>
                    <div class="text-gray-400">${rec.description}</div>
                </div>
            `
        )
        .join("");
    } else {
      container.innerHTML = `
                <p class="text-[10px] text-gray-400 leading-relaxed">
                    当前参数配置相对均衡，继续监控关键指标变化。
                </p>
            `;
    }
  }

  getRecommendationColor(type) {
    const colors = {
      URGENT: "[#FF4D4D]",
      POLICY: "[#FF6B6B]",
      ECONOMIC: "[#00E676]",
      SOCIAL: "[#00D4FF]",
    };
    return colors[type] || "[#00D4FF]";
  }

  updateFooterMetrics(data) {
    const footerGini = document.getElementById("footer-gini");
    const footerEfficiency = document.getElementById("footer-efficiency");

    if (footerGini) footerGini.innerText = data.gini_coefficient.toFixed(3);
    if (footerEfficiency)
      footerEfficiency.innerText = (
        this.params.eta *
        (1 + this.params.innovation * 0.02)
      ).toFixed(3);
  }

  showScenarioModal() {
    document.getElementById("scenarioModal").classList.remove("hidden");
  }

  hideScenarioModal() {
    document.getElementById("scenarioModal").classList.add("hidden");
  }

  loadScenario(scenarioKey) {
    const scenario = this.scenarios[scenarioKey];
    if (!scenario) return;

    Object.assign(this.stagedParams, scenario.params);

    Object.keys(scenario.params).forEach((key) => {
      const input = document.getElementById(`param-${key}`);
      const display = document.getElementById(`val-${key}`);

      if (input) {
        input.value = scenario.params[key];

        if (display) {
          const displayVal =
            key === "r"
              ? `${Math.round(scenario.params[key] * 100)}%`
              : key === "tau"
              ? `${scenario.params[key]} min`
              : scenario.params[key].toFixed(2);
          display.innerText = displayVal;
        }
      }
    });

    this.markParamsDirty();
    this.showNotification(`已加载 ${scenario.name}，点击开始推演`, "success");
  }

  showNotification(message, type = "info") {

    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 p-4 rounded-lg border z-50 transition-all duration-300 ${
      type === "success"
        ? "bg-[#00E676]/10 border-[#00E676]/20 text-[#00E676]"
        : type === "error"
        ? "bg-[#FF4D4D]/10 border-[#FF4D4D]/20 text-[#FF4D4D]"
        : "bg-[#00D4FF]/10 border-[#00D4FF]/20 text-[#00D4FF]"
    }`;
    notification.innerText = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  generateReport() {
    const report = this.reportGenerator.generateComprehensiveReport(
      this.history,
      this.params
    );
    this.downloadReport(report, "comprehensive_policy_analysis_report.md");
    this.showNotification("政策分析报告已生成", "success");
  }

  downloadReport(content, filename) {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", filename);
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportData() {
    const headers = [
      "timestamp",
      "r",
      "e",
      "eta",
      "tau",
      "lambda",
      "competition",
      "innovation",
      "monitoring",
      "regulation",
      "D",
      "P",
      "Ur",
      "SW",
      "CS",
      "market_efficiency",
      "gini_coefficient",
      "sustainability_index",
      "stress_level",
    ];
    const csvRows = [headers.join(",")];

    this.history.forEach((h) => {
      csvRows.push(
        [
          h.timestamp,
          h.params.r,
          h.params.e,
          h.params.eta,
          h.params.tau,
          h.params.lambda,
          h.params.competition,
          h.params.innovation,
          h.params.monitoring,
          h.params.regulation,
          h.D.toFixed(2),
          h.P.toFixed(2),
          h.Ur.toFixed(2),
          h.SW.toFixed(2),
          h.CS.toFixed(2),
          h.market_efficiency.toFixed(2),
          h.gini_coefficient.toFixed(4),
          h.sustainability_index.toFixed(2),
          h.p.toFixed(4),
        ].join(",")
      );
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `advanced_simulation_data_${Date.now()}.csv`);
    a.click();
    window.URL.revokeObjectURL(url);

    this.showNotification("数据已导出", "success");
  }

  markParamsDirty() {
    this.paramsDirty = true;
    this.updateSimulationStatus();
  }

  commitAndRunSimulation(initial = false) {
    this.params = { ...this.stagedParams };
    this.paramsDirty = false;
    this.runSimulation();
    this.lastRunTimestamp = Date.now();
    this.updateSimulationStatus(initial);
  }

  updateSimulationStatus(initial = false) {
    const statusEl = document.getElementById("simulation-status");
    const runBtn = document.getElementById("runSimulationBtn");
    if (!statusEl || !runBtn) return;

    if (this.paramsDirty) {
      statusEl.innerText = "参数已更新，点击“开始推演”查看新走势";
      statusEl.className = "text-[11px] text-[#FFD700]";
      runBtn.classList.add("animate-pulse");
    } else {
      const timeLabel = this.lastRunTimestamp
        ? new Date(this.lastRunTimestamp).toLocaleTimeString()
        : "刚刚";
      statusEl.innerText = `正在展示：${timeLabel} 的推演结果`;
      statusEl.className = "text-[11px] text-gray-400";
      runBtn.classList.remove("animate-pulse");
      if (initial && !this.lastRunTimestamp) {
        statusEl.innerText = "正在展示：当前默认推演结果";
      }
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new AdvancedPolicyLabApp();
});
