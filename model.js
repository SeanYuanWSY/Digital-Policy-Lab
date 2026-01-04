

export class PolicyModel {
  constructor() {

    this.A = 14000; 
    this.alpha = 2.0; 
    this.beta = 1.5; 
    this.gamma = 0.8; 
    this.delta = 1.2; 

    this.C_ops = 2.5; 
    this.C_tech = 800; 
    this.C_marketing = 1200; 
    this.P_order = 35; 

    this.R_count = 100; 
    this.R_reserve = 0.15; 
    this.c1 = 1.5; 
    this.c2 = 0.8; 
    this.rider_income_factor = 0.035; 

    this.s0 = 12; 
    this.s1 = 0.3; 
    this.algo_bias = 0.05; 

    this.e0 = 6; 
    this.e1 = 2.2; 
    this.safety_cost = 0.8; 

    this.tax_rate = 0.25; 
    this.min_wage = 15; 
    this.social_insurance = 0.12; 

    this.innovation_rate = 0.02; 
    this.market_concentration = 0.65; 
    this.entry_barrier = 5000; 

    this.price_sensitivity = 1.8; 
    this.quality_preference = 0.7; 
    this.loyalty_factor = 0.4; 

    this.data_value = 0.15; 
    this.privacy_cost = 0.08; 

    this.gdp_growth = 0.06; 
    this.inflation_rate = 0.03; 
    this.unemployment_rate = 0.05; 
  }

  
  calculate(
    r,
    e,
    eta,
    tau,
    lambda_bal,
    monitoring = 0.5,
    competition = 0.3,
    regulation = 0.2,
    innovation = 0.6
  ) {

    const competition_factor = Math.max(
      0.2,
      1 - competition * this.delta * 0.5
    ); 
    const macro_factor = Math.max(
      0.5,
      1 + this.gdp_growth - this.inflation_rate
    ); 

    const e_social_optimal = e * (0.75 - regulation * 0.2); 
    const e_eff = (1 - lambda_bal) * e + lambda_bal * e_social_optimal;

    const eta_adjusted =
      eta * (1 + innovation * this.innovation_rate) * (1 - regulation * 0.1);

    const base_time = tau * (1 - eta_adjusted) * (1 + monitoring * this.s1);
    const congestion_time =
      (5 / (0.16 * e_eff)) * (1 + this.e1 * Math.pow(e_eff / 3, 1.5));
    const T = base_time + congestion_time;

    const p_base = Math.max(0, (T - tau) / Math.max(tau, 1));
    const p_monitoring = monitoring * this.s1;
    const p_bias = this.algo_bias * (1 - regulation * 0.5);
    const p = Math.min(1, p_base + p_monitoring + p_bias);

    const price_factor = Math.pow(
      Math.max(0.2, 1 - r * this.price_sensitivity),
      this.alpha
    );
    const wait_factor = Math.pow(
      Math.max(0.2, Math.min(1.2, tau / Math.max(T, 1))),
      this.quality_preference
    );
    const network_effect =
      1 + this.loyalty_factor * Math.log1p(Math.max(0.01, eta_adjusted));
    const capacity_factor = Math.max(
      0.3,
      Math.min(1.2, (eta_adjusted * e_eff) / 3)
    );

    const D =
      this.A *
      price_factor *
      wait_factor *
      network_effect *
      competition_factor *
      macro_factor *
      capacity_factor;

    const orders_per_rider = (eta_adjusted * D) / this.R_count;
    const base_income =
      (1 - r) * this.P_order * orders_per_rider * this.rider_income_factor;

    const revenue = D * r * this.P_order;
    const variable_costs = D * this.C_ops;
    const fixed_costs = this.C_tech + this.C_marketing * (1 - innovation * 0.2);
    const tax_burden = Math.max(
      0,
      (revenue - variable_costs - fixed_costs) * this.tax_rate
    );
    const data_revenue = D * this.data_value * (1 - regulation * 0.3); 
    const social_benefits = regulation * this.social_insurance * base_income;
    const employer_social_cost = social_benefits * this.R_count;
    const P =
      revenue +
      data_revenue -
      variable_costs -
      fixed_costs -
      tax_burden -
      employer_social_cost;


    const physical_cost = this.c1 * Math.pow(e_eff, 2);
    const stress_cost = this.s0 * Math.pow(p, 1.5) * (1 + monitoring * 0.3);
    const training_cost = this.c2 * innovation; 
    const safety_risk_cost = this.safety_cost * Math.pow(e_eff, 1.8);

    const wage_subsidy =
      Math.max(0, this.min_wage - base_income) * regulation;

    const Ur_single =
      base_income +
      social_benefits +
      wage_subsidy -
      physical_cost -
      stress_cost -
      training_cost -
      safety_risk_cost;
    const Ur = Ur_single * this.R_count;

    const privacy_cost_consumer = this.privacy_cost * (1 - regulation * 0.4);
    const perceived_price = this.P_order * (1 + r * 0.6);
    const reservation_price =
      this.P_order * (1 + this.quality_preference * eta_adjusted);
    const price_surplus = Math.max(0, reservation_price - perceived_price);
    const wait_bonus = Math.max(0, tau - T) * 0.5;
    const experience_penalty =
      privacy_cost_consumer +
      Math.max(0, (T - tau) / Math.max(tau, 1)) * 12;
    const CS = Math.max(
      0,
      (price_surplus + wait_bonus - experience_penalty) * (D / 100)
    );


    const environmental_cost = this.e0 * Math.pow(e_eff, this.e1);
    const traffic_congestion = 2.5 * Math.pow(D / 1000, 1.3);
    const inequality_cost =
      5 * Math.pow(Math.max(0, P / 1000 - Ur / 1000), 1.2); 
    const algorithmic_bias_cost = this.algo_bias * D * (1 - regulation * 0.6);

    const rider_utilization = Math.min(
      1,
      (eta_adjusted * D) / (this.R_count * 120)
    );
    const employment_benefit =
      this.R_count * rider_utilization * 8 * (1 - this.unemployment_rate);
    const innovation_spillover = innovation * D * 0.02;
    const digitalization_benefit = eta_adjusted * D * 0.015;
    const subsidy_cost = wage_subsidy * this.R_count;

    const total_externality =
      environmental_cost +
      traffic_congestion +
      inequality_cost +
      algorithmic_bias_cost +
      subsidy_cost -
      employment_benefit -
      innovation_spillover -
      digitalization_benefit;

    const SW = P + Ur + CS - total_externality;

    const market_efficiency = Math.max(
      0,
      Math.min(100, (SW / Math.max(P + Ur + CS, 1e-6)) * 100)
    );
    const gini_coefficient = this.calculateGini(P, Ur, CS, D);
    const sustainability_ratio =
      environmental_cost / Math.max(Math.abs(SW), 1e-6);
    const sustainability_index = Math.max(
      0,
      Math.min(100, 100 - sustainability_ratio * 100)
    );
    const innovation_index = innovation * eta_adjusted * 100;
    const regulatory_effectiveness = regulation * (SW / 20000) * 100;

    const policy_recommendations = this.generatePolicyRecommendations({
      r,
      e_eff,
      p,
      SW,
      Ur,
      competition,
      regulation,
      innovation,
    });

    return {

      D,
      P,
      Ur,
      SW,
      CS,
      T,
      p,
      e_eff,

      market_efficiency,
      gini_coefficient,
      sustainability_index,
      innovation_index,
      regulatory_effectiveness,

      costs: {
        environmental: environmental_cost,
        traffic: traffic_congestion,
        inequality: inequality_cost,
        algorithmic_bias: algorithmic_bias_cost,
        total_externality,
      },

      benefits: {
        employment: employment_benefit,
        innovation_spillover,
        digitalization: digitalization_benefit,
      },

      policy_recommendations,

      labels: {
        isPareto: SW > 15000 && Ur > 0 && market_efficiency > 75,
        stressLevel: p > 0.7 ? "CRITICAL" : p > 0.5 ? "HIGH" : "STABLE",
        marketStatus:
          competition > 0.7
            ? "COMPETITIVE"
            : competition > 0.4
            ? "OLIGOPOLY"
            : "MONOPOLISTIC",
        regulationStatus:
          regulation > 0.6
            ? "STRICT"
            : regulation > 0.3
            ? "MODERATE"
            : "LAISSEZ_FAIRE",
        sustainabilityLevel:
          sustainability_index > 80
            ? "EXCELLENT"
            : sustainability_index > 60
            ? "GOOD"
            : "POOR",
      },
    };
  }

  
  calculateGini(platformProfit, riderUtility, consumerSurplus, demand) {
    const incomes = [
      Math.max(0, platformProfit),
      Math.max(0, riderUtility),
      Math.max(0, consumerSurplus),
    ];
    const populations = [
      1,
      this.R_count,
      Math.max(1, Math.round(demand)),
    ];

    const totalIncome = incomes.reduce((acc, value) => acc + value, 0);
    const totalPopulation = populations.reduce((acc, value) => acc + value, 0);
    if (totalIncome <= 0 || totalPopulation <= 0) {
      return 1;
    }

    const groups = incomes.map((income, idx) => ({
      perCapita: income / populations[idx],
      incomeShare: income / totalIncome,
      popShare: populations[idx] / totalPopulation,
    }));

    groups.sort((a, b) => a.perCapita - b.perCapita);

    let prevIncomeShare = 0;
    let prevPopShare = 0;
    let lorenzArea = 0;

    groups.forEach((group) => {
      const newPopShare = prevPopShare + group.popShare;
      const newIncomeShare = prevIncomeShare + group.incomeShare;
      lorenzArea +=
        ((prevIncomeShare + newIncomeShare) / 2) * group.popShare;
      prevPopShare = newPopShare;
      prevIncomeShare = newIncomeShare;
    });

    const gini = 1 - 2 * lorenzArea;
    return Math.max(0, Math.min(1, gini));
  }

  
  generatePolicyRecommendations(metrics) {
    const recommendations = [];

    if (metrics.p > 0.7) {
      recommendations.push({
        type: "URGENT",
        category: "劳动保护",
        title: "降低算法压力",
        description: "当前算法压力过高，建议实施工作时间限制和强制休息制度",
        impact: "HIGH",
      });
    }

    if (metrics.r > 0.25 && metrics.competition < 0.4) {
      recommendations.push({
        type: "POLICY",
        category: "反垄断",
        title: "促进市场竞争",
        description: "佣金率过高且市场竞争不足，建议引入反垄断措施",
        impact: "MEDIUM",
      });
    }

    if (metrics.SW < 10000) {
      recommendations.push({
        type: "ECONOMIC",
        category: "效率提升",
        title: "优化资源配置",
        description: "社会总福利偏低，建议通过技术创新和制度改革提升效率",
        impact: "HIGH",
      });
    }

    if (metrics.Ur < 0) {
      recommendations.push({
        type: "SOCIAL",
        category: "劳动权益",
        title: "保障骑手收入",
        description: "骑手效用为负，建议实施最低收入保障和社会保险制度",
        impact: "CRITICAL",
      });
    }

    return recommendations;
  }
}
