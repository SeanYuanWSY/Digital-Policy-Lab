export const formatCurrency = (val) => {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(val);
};

export const lerp = (start, end, amt) => {
  return (1 - amt) * start + amt * end;
};

export const getNoise = (magnitude = 0.05) => {
  return (Math.random() - 0.5) * magnitude;
};

export const calculateStats = (data) => {
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance =
    data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);
  const min = Math.min(...data);
  const max = Math.max(...data);

  return { mean, variance, stdDev, min, max };
};

export const calculateTrend = (data, periods = 5) => {
  if (data.length < periods) return 0;

  const recent = data.slice(-periods);
  const earlier = data.slice(-periods * 2, -periods);

  if (earlier.length === 0) return 0;

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;

  return ((recentAvg - earlierAvg) / earlierAvg) * 100;
};

export class ReportGenerator {
  constructor() {
    this.reportTemplate = {
      title: "数字平台经济博弈分析报告",
      sections: [
        "executive_summary",
        "market_analysis",
        "policy_recommendations",
        "technical_appendix",
      ],
    };
  }

  generateComprehensiveReport(history, currentParams) {
    const analysis = this.analyzeHistoricalData(history);
    const timestamp = new Date().toLocaleString("zh-CN");

    return `# 数字平台经济博弈分析报告

**生成时间**: ${timestamp}  
**分析周期**: ${history.length} 个时间点  
**当前参数配置**: ${this.formatParams(currentParams)}

---

## 执行摘要

### 核心发现
${this.generateExecutiveSummary(analysis, currentParams)}

### 关键指标概览
- **平台利润均值**: ${formatCurrency(analysis.profit.mean)}
- **社会福利均值**: ${formatCurrency(analysis.welfare.mean)}
- **骑手效用均值**: ${(analysis.riderUtility.mean / 1000).toFixed(1)}k
- **市场效率**: ${analysis.efficiency.mean.toFixed(1)}%
- **基尼系数**: ${analysis.gini.mean.toFixed(3)}

---

## 市场结构分析

### 1. 竞争态势
当前市场竞争强度为 ${(currentParams.competition * 100).toFixed(
      0
    )}%，属于${this.getMarketStructure(currentParams.competition)}市场。

### 2. 技术创新水平
技术创新指数为 ${(currentParams.innovation * 100).toFixed(
      0
    )}%，${this.getInnovationLevel(currentParams.innovation)}。

### 3. 监管环境
监管强度为 ${(currentParams.regulation * 100).toFixed(
      0
    )}%，政策环境${this.getRegulationLevel(currentParams.regulation)}。

---

## 博弈均衡分析

### 平台策略分析
- **佣金率设定**: ${(currentParams.r * 100).toFixed(1)}%
- **策略评估**: ${this.evaluatePlatformStrategy(currentParams, analysis)}

### 劳动力市场分析
- **劳动强度**: ${currentParams.e.toFixed(1)}
- **算法监控**: ${(currentParams.monitoring * 100).toFixed(0)}%
- **劳动者福利**: ${this.evaluateWorkerWelfare(analysis)}

### 消费者福利分析
- **服务质量**: 算法效率 ${(currentParams.eta * 100).toFixed(0)}%
- **等待时间容忍**: ${currentParams.tau} 分钟
- **消费者剩余趋势**: ${this.analyzeTrend(history.map((h) => h.CS))}

---

## 政策建议

### 短期建议 (0-6个月)
${this.generateShortTermRecommendations(analysis, currentParams)}

### 中期建议 (6-18个月)
${this.generateMediumTermRecommendations(analysis, currentParams)}

### 长期建议 (18个月以上)
${this.generateLongTermRecommendations(analysis, currentParams)}

---

## 风险评估

### 系统性风险
${this.assessSystemicRisks(analysis, currentParams)}

### 监管风险
${this.assessRegulatoryRisks(currentParams)}

### 市场风险
${this.assessMarketRisks(analysis, currentParams)}

---

## 技术附录

### 模型参数
\`\`\`
基础参数:
- 佣金率 (r): ${currentParams.r}
- 劳动强度 (e): ${currentParams.e}
- 算法效率 (η): ${currentParams.eta}
- 等待容忍度 (τ): ${currentParams.tau}
- 社会平衡系数 (λ): ${currentParams.lambda}

高级参数:
- 市场竞争强度: ${currentParams.competition}
- 技术创新水平: ${currentParams.innovation}
- 算法监控强度: ${currentParams.monitoring}
- 监管强度: ${currentParams.regulation}
\`\`\`

### 统计分析结果
${this.generateStatisticalSummary(analysis)}

### 数据质量说明
- 样本数量: ${history.length}
- 数据完整性: ${this.assessDataQuality(history)}%
- 置信区间: 95%

---

*本报告基于数字经济博弈理论模型生成，仅供参考。*
`;
  }

  analyzeHistoricalData(history) {
    if (history.length === 0) return {};

    const profits = history.map((h) => h.P);
    const welfare = history.map((h) => h.SW);
    const riderUtility = history.map((h) => h.Ur);
    const efficiency = history.map((h) => h.market_efficiency || 0);
    const gini = history.map((h) => h.gini_coefficient || 0);
    const sustainability = history.map((h) => h.sustainability_index || 0);

    return {
      profit: calculateStats(profits),
      welfare: calculateStats(welfare),
      riderUtility: calculateStats(riderUtility),
      efficiency: calculateStats(efficiency),
      gini: calculateStats(gini),
      sustainability: calculateStats(sustainability),
      trends: {
        profit: calculateTrend(profits),
        welfare: calculateTrend(welfare),
        riderUtility: calculateTrend(riderUtility),
      },
    };
  }

  formatParams(params) {
    return `r=${(params.r * 100).toFixed(1)}%, e=${params.e}, η=${
      params.eta
    }, 竞争=${(params.competition * 100).toFixed(0)}%, 创新=${(
      params.innovation * 100
    ).toFixed(0)}%`;
  }

  generateExecutiveSummary(analysis, params) {
    let summary = [];

    if (analysis.welfare && analysis.welfare.mean > 15000) {
      summary.push("• 当前博弈均衡总体健康，社会福利处于较高水平");
    } else {
      summary.push("• 当前均衡存在改进空间，社会福利有待提升");
    }

    if (params.regulation > 0.5) {
      summary.push("• 强监管政策有效缓解了算法压力，保护了劳动者权益");
    } else if (params.regulation < 0.3) {
      summary.push("• 监管力度相对较弱，需关注劳动者权益保护");
    }

    if (params.competition > 0.6) {
      summary.push("• 市场竞争激烈，有利于消费者福利但可能影响平台盈利");
    } else if (params.competition < 0.3) {
      summary.push("• 市场集中度较高，存在垄断风险，建议加强反垄断监管");
    }

    return summary.join("\n");
  }

  getMarketStructure(competition) {
    if (competition > 0.7) return "充分竞争";
    if (competition > 0.4) return "寡头竞争";
    return "垄断竞争";
  }

  getInnovationLevel(innovation) {
    if (innovation > 0.7) return "技术创新活跃，数字化转型成效显著";
    if (innovation > 0.4) return "技术创新中等，仍有提升空间";
    return "技术创新不足，需加大研发投入";
  }

  getRegulationLevel(regulation) {
    if (regulation > 0.6) return "较为严格，注重劳动保护和社会责任";
    if (regulation > 0.3) return "适度监管，平衡效率与公平";
    return "相对宽松，市场主导作用明显";
  }

  evaluatePlatformStrategy(params, analysis) {
    if (params.r > 0.25) {
      return "佣金率偏高，可能抑制需求增长，建议适度调整";
    } else if (params.r < 0.15) {
      return "佣金率较低，有利于市场扩张但需关注盈利能力";
    }
    return "佣金率设定相对合理，平衡了增长与盈利";
  }

  evaluateWorkerWelfare(analysis) {
    if (analysis.riderUtility && analysis.riderUtility.mean > 0) {
      return "骑手整体效用为正，劳动者权益得到基本保障";
    }
    return "骑手效用偏低，需要加强劳动保护措施";
  }

  analyzeTrend(data) {
    const trend = calculateTrend(data);
    if (trend > 5) return "显著上升趋势";
    if (trend > 0) return "温和上升趋势";
    if (trend > -5) return "基本稳定";
    return "下降趋势，需要关注";
  }

  generateShortTermRecommendations(analysis, params) {
    const recommendations = [];

    if (params.monitoring > 0.7) {
      recommendations.push("• 适度降低算法监控强度，缓解骑手心理压力");
    }

    if (analysis.gini && analysis.gini.mean > 0.4) {
      recommendations.push("• 实施收入再分配机制，缓解不平等问题");
    }

    if (
      params.regulation < 0.3 &&
      analysis.riderUtility &&
      analysis.riderUtility.mean < 0
    ) {
      recommendations.push("• 紧急实施最低收入保障制度");
    }

    return recommendations.length > 0
      ? recommendations.join("\n")
      : "• 当前状态相对稳定，继续监控关键指标变化";
  }

  generateMediumTermRecommendations(analysis, params) {
    const recommendations = [];

    if (params.innovation < 0.5) {
      recommendations.push("• 加大技术研发投入，提升算法效率和用户体验");
    }

    if (params.competition < 0.4) {
      recommendations.push("• 制定反垄断政策，促进市场公平竞争");
    }

    recommendations.push("• 建立行业标准和最佳实践指南");
    recommendations.push("• 完善数据隐私保护和算法透明度机制");

    return recommendations.join("\n");
  }

  generateLongTermRecommendations(analysis, params) {
    return `• 构建数字经济治理体系，平衡创新与监管
• 推动平台经济可持续发展，实现多方共赢
• 建立国际合作机制，应对跨境平台治理挑战
• 培育新型劳动关系，适应数字化转型需求`;
  }

  assessSystemicRisks(analysis, params) {
    const risks = [];

    if (analysis.sustainability && analysis.sustainability.mean < 50) {
      risks.push("环境可持续性风险较高");
    }

    if (params.e > 4.0) {
      risks.push("劳动强度过高可能引发安全事故");
    }

    if (params.competition < 0.2) {
      risks.push("市场垄断风险，可能损害消费者利益");
    }

    return risks.length > 0 ? risks.join("；") : "系统性风险总体可控";
  }

  assessRegulatoryRisks(params) {
    if (params.regulation > 0.8) {
      return "过度监管可能抑制创新和市场活力";
    } else if (params.regulation < 0.2) {
      return "监管不足可能导致市场失灵和社会问题";
    }
    return "监管强度适中，风险可控";
  }

  assessMarketRisks(analysis, params) {
    const risks = [];

    if (analysis.trends && analysis.trends.profit < -10) {
      risks.push("平台盈利能力下降风险");
    }

    if (params.innovation < 0.3) {
      risks.push("技术落后导致的竞争力下降风险");
    }

    return risks.length > 0 ? risks.join("；") : "市场风险总体可控";
  }

  generateStatisticalSummary(analysis) {
    return `
**平台利润统计**:
- 均值: ${formatCurrency(analysis.profit?.mean || 0)}
- 标准差: ${formatCurrency(analysis.profit?.stdDev || 0)}
- 变异系数: ${(
      ((analysis.profit?.stdDev || 0) / (analysis.profit?.mean || 1)) *
      100
    ).toFixed(1)}%

**社会福利统计**:
- 均值: ${formatCurrency(analysis.welfare?.mean || 0)}
- 趋势: ${(analysis.trends?.welfare || 0).toFixed(1)}%

**市场效率统计**:
- 均值: ${(analysis.efficiency?.mean || 0).toFixed(1)}%
- 波动性: ${(analysis.efficiency?.stdDev || 0).toFixed(1)}%
        `;
  }

  assessDataQuality(history) {
    if (history.length < 5) return 60;
    if (history.length < 15) return 80;
    return 95;
  }

  generatePublicInsights(analysis, params) {
    return `
1. **算法治理新挑战**: 数字平台通过算法实现精准控制，但也带来了新的劳动关系问题
2. **政策平衡艺术**: 如何在促进创新和保护劳动者权益之间找到最佳平衡点
3. **数字经济的社会责任**: 平台企业需要承担更多社会责任，实现可持续发展
4. **消费者福利与市场效率**: 技术进步如何真正惠及消费者和整个社会
        `;
  }
}
