export class DashboardView {
  constructor() {
    this.mainChart = null;
    this.radarChart = null;
    this.costBenefitChart = null;
    this.orderFlowDots = [];
    this.orderFlowTrails = [];
    this.initCharts();
    this.initOrderGrid();
  }

  initCharts() {

    const ctxMain = document.getElementById("mainChart").getContext("2d");
    this.mainChart = new Chart(ctxMain, {
      type: "line",
      data: {
        labels: Array.from({ length: 30 }, (_, i) => i),
        datasets: [
          {
            label: "平台利润 P",
            borderColor: "#00D4FF",
            backgroundColor: "rgba(0, 212, 255, 0.1)",
            borderWidth: 2,
            tension: 0.4,
            data: [],
            fill: false,
          },
          {
            label: "社会福利 SW",
            borderColor: "#00E676",
            backgroundColor: "rgba(0, 230, 118, 0.1)",
            borderWidth: 2,
            tension: 0.4,
            data: [],
            fill: false,
          },
          {
            label: "骑手效用 Ur",
            borderColor: "#FF6B6B",
            backgroundColor: "rgba(255, 107, 107, 0.1)",
            borderWidth: 2,
            tension: 0.4,
            data: [],
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: {
          intersect: false,
          mode: "index",
        },
        scales: {
          y: {
            grid: { color: "rgba(255,255,255,0.05)" },
            ticks: { color: "#8b949e", font: { size: 10 } },
          },
          x: {
            display: false,
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(22, 27, 34, 0.9)",
            titleColor: "#E6EDF3",
            bodyColor: "#E6EDF3",
            borderColor: "#00D4FF",
            borderWidth: 1,
          },
        },
      },
    });

    const ctxRadar = document.getElementById("radarChart").getContext("2d");
    this.radarChart = new Chart(ctxRadar, {
      type: "radar",
      data: {
        labels: ["利润", "公平性", "效率", "用户体验", "可持续性", "创新"],
        datasets: [
          {
            label: "当前均衡",
            backgroundColor: "rgba(0, 212, 255, 0.2)",
            borderColor: "#00D4FF",
            borderWidth: 2,
            data: [0, 0, 0, 0, 0, 0],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
          r: {
            grid: { color: "rgba(255,255,255,0.1)" },
            angleLines: { color: "rgba(255,255,255,0.1)" },
            pointLabels: {
              color: "#8b949e",
              font: { size: 9 },
            },
            ticks: {
              display: false,
              max: 100,
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(22, 27, 34, 0.9)",
            titleColor: "#E6EDF3",
            bodyColor: "#E6EDF3",
          },
        },
      },
    });

    const ctxCostBenefit = document.getElementById("costBenefitChart");
    if (ctxCostBenefit) {
      this.costBenefitChart = new Chart(ctxCostBenefit.getContext("2d"), {
        type: "doughnut",
        data: {
          labels: [
            "环境成本",
            "交通拥堵",
            "不平等成本",
            "算法偏见",
            "就业收益",
            "创新溢出",
            "数字化收益",
          ],
          datasets: [
            {
              data: [0, 0, 0, 0, 0, 0, 0],
              backgroundColor: [
                "#FF4D4D",
                "#FF6B6B",
                "#FF8E53",
                "#FFB74D",
                "#00E676",
                "#00D4FF",
                "#4DD0E1",
              ],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: "rgba(22, 27, 34, 0.9)",
              titleColor: "#E6EDF3",
              bodyColor: "#E6EDF3",
            },
          },
        },
      });
    }
  }

  initOrderGrid() {
    const container = document.getElementById("order-grid");
    if (container) {
      container.innerHTML = "";
      container.classList.add("order-flow-container");

      const dotLayer = document.createElement("div");
      dotLayer.className = "grid grid-cols-16 gap-1 h-full";
      container.appendChild(dotLayer);

      this.orderFlowDots = [];
      for (let i = 0; i < 64; i++) {
        const dot = document.createElement("div");
        dot.className =
          "order-dot bg-[#161B22] w-2 h-2 rounded-full transition-all duration-300";
        dotLayer.appendChild(dot);
        this.orderFlowDots.push(dot);
      }

      const trailsLayer = document.createElement("div");
      trailsLayer.className = "order-flow-trails";
      container.appendChild(trailsLayer);

      this.orderFlowTrails = [];
      for (let i = 0; i < 3; i++) {
        const trail = document.createElement("div");
        trail.className = "flow-trail";
        trail.style.top = `${20 + i * 25}%`;
        trail.style.animationDelay = `${i * 0.4}s`;
        trailsLayer.appendChild(trail);
        this.orderFlowTrails.push(trail);
      }
    }
  }

  updateMetrics(data, history) {

    document.getElementById("metric-p").innerText = `¥ ${Math.round(
      data.P
    ).toLocaleString()}`;
    document.getElementById("metric-ur").innerText =
      (data.Ur / 1000).toFixed(1) + "k";
    document.getElementById("metric-sw").innerText = `¥ ${Math.round(
      data.SW
    ).toLocaleString()}`;

    if (history.length > 1) {
      const prev = history[history.length - 2];
      const pTrend = (((data.P - prev.P) / Math.abs(prev.P)) * 100).toFixed(1);
      const urTrend = (((data.Ur - prev.Ur) / Math.abs(prev.Ur)) * 100).toFixed(
        1
      );
      const swTrend = (((data.SW - prev.SW) / Math.abs(prev.SW)) * 100).toFixed(
        1
      );

      document.getElementById("trend-p").innerText = `${
        pTrend > 0 ? "+" : ""
      }${pTrend}%`;
      document.getElementById("trend-ur").innerText = `${
        urTrend > 0 ? "+" : ""
      }${urTrend}%`;
      document.getElementById("trend-sw").innerText = `${
        swTrend > 0 ? "+" : ""
      }${swTrend}%`;

      this.updateTrendColor("trend-p", parseFloat(pTrend));
      this.updateTrendColor("trend-ur", parseFloat(urTrend));
      this.updateTrendColor("trend-sw", parseFloat(swTrend));
    }

    const stressBar = document.getElementById("stress-bar");
    const stressVal = document.getElementById("stress-val");
    if (stressBar && stressVal) {
      stressBar.style.width = `${Math.min(data.p * 100, 100)}%`;
      stressVal.innerText = data.p.toFixed(3);

      if (data.p > 0.7) {
        stressBar.className =
          "h-full bg-gradient-to-r from-red-500 to-red-700 transition-all duration-500";
      } else if (data.p > 0.5) {
        stressBar.className =
          "h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500";
      } else {
        stressBar.className =
          "h-full bg-gradient-to-r from-green-500 to-yellow-500 transition-all duration-500";
      }
    }

    if (this.mainChart) {
      this.mainChart.data.datasets[0].data = history.map((h) => h.P);
      this.mainChart.data.datasets[1].data = history.map((h) => h.SW);
      this.mainChart.data.datasets[2].data = history.map((h) => h.Ur);
      this.mainChart.update("none");
    }

    if (this.radarChart) {
      const maxP = Math.max(...history.map((h) => h.P));
      const maxSW = Math.max(...history.map((h) => h.SW));
      const maxUr = Math.max(...history.map((h) => h.Ur));

      this.radarChart.data.datasets[0].data = [
        Math.min((data.P / maxP) * 100, 100),
        Math.min((1 - data.gini_coefficient) * 100, 100),
        Math.min(data.market_efficiency, 100),
        Math.min((data.CS / 1000) * 100, 100),
        Math.max(0, Math.min(data.sustainability_index || 0, 100)),
        Math.min(data.innovation_index, 100),
      ];
      this.radarChart.update("none");
    }

    if (this.costBenefitChart && data.costs && data.benefits) {
      const totalCosts =
        (data.costs.environmental ?? 0) +
        (data.costs.traffic ?? 0) +
        (data.costs.inequality ?? 0) +
        (data.costs.algorithmic_bias ?? 0);
      const totalBenefits =
        (data.benefits.employment ?? 0) +
        (data.benefits.innovation_spillover ?? 0) +
        (data.benefits.digitalization ?? 0);

      this.costBenefitChart.data.datasets[0].data = [
        data.costs.environmental ?? 0,
        data.costs.traffic ?? 0,
        data.costs.inequality ?? 0,
        data.costs.algorithmic_bias ?? 0,
        data.benefits.employment ?? 0,
        data.benefits.innovation_spillover ?? 0,
        data.benefits.digitalization ?? 0,
      ];
      this.costBenefitChart.update("none");
    }

    this.updateParetoStatus(data);
  }

  updateTrendColor(elementId, trend) {
    const element = document.getElementById(elementId);
    if (!element) return;

    if (trend > 0) {
      element.className = "trend text-[#00E676]";
    } else if (trend < 0) {
      element.className = "trend text-[#FF6B6B]";
    } else {
      element.className = "trend text-gray-400";
    }
  }

  updateOrderFlow(data) {
    const dots = this.orderFlowDots;
    const activityLevel = Math.min(data.D / 1500, 1); 

    dots.forEach((dot) => {
      const isActive = Math.random() < activityLevel;
      const intensity = Math.random();

      if (isActive) {
        dot.style.backgroundColor = `rgba(0, 212, 255, ${
          0.3 + intensity * 0.7
        })`;
        dot.style.transform = `scale(${0.8 + intensity * 0.4})`;



      } else {
        dot.style.backgroundColor = "#161B22";
        dot.style.transform = "scale(1)";

      }

      if (Math.random() < 0.05) {
        dot.style.animation = "pulse 0.5s ease-in-out";
        setTimeout(() => {
          dot.style.animation = "";
        }, 500);
      }
    });

    this.orderFlowTrails.forEach((trail, index) => {
      const baseDuration = 4 - activityLevel * 2;
      const duration = Math.max(1.4, baseDuration - index * 0.15);
      trail.style.animationDuration = `${duration}s`;
      trail.style.opacity = `${0.25 + activityLevel * 0.6}`;
      trail.style.filter = `blur(${2 + activityLevel * 4}px)`;
    });
  }

  updateParetoStatus(data) {
    const label = document.getElementById("pareto-label");
    if (!label) return;

    if (data.labels.isPareto) {
      label.innerText = "帕累托最优";
      label.className = "text-[#00E676]";
    } else if (data.labels.stressLevel === "CRITICAL") {
      label.innerText = "临界风险";
      label.className = "text-[#FF4D4D]";
    } else if (data.labels.stressLevel === "HIGH") {
      label.innerText = "高压状态";
      label.className = "text-[#FF6B6B]";
    } else if (data.market_efficiency > 60) {
      label.innerText = "次优均衡";
      label.className = "text-[#FFD700]";
    } else {
      label.innerText = "低效均衡";
      label.className = "text-gray-500";
    }
  }
}
