import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, TrendingUp, Building2, FileText, Info, Sliders } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const FutureForecastModule = () => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [selectedScenario, setSelectedScenario] = useState(0);
  
  // What-If Scenario Builder state
  const [whatIfOccupancy, setWhatIfOccupancy] = useState<number | null>(null);
  const [whatIfADR, setWhatIfADR] = useState<number | null>(null);
  const [whatIfExpenseMultiplier, setWhatIfExpenseMultiplier] = useState<number>(100); // percentage
  
  // Multi-Year Projection state
  const [projectionYears, setProjectionYears] = useState<number>(3);

  // Fetch monthly reports (Oct 2024 - Sep 2025) with expense breakdown
  const { data: monthlyReports, isLoading } = useQuery({
    queryKey: ["monthly-reports-forecast"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("monthly_reports")
        .select("*")
        .eq("user_id", user.id)
        .gte("month", "2024-10-01")
        .lte("month", "2025-09-30")
        .order("month", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Calculate forecast with REALISTIC EXPENSE SCALING
  const forecast = useMemo(() => {
    if (!monthlyReports || monthlyReports.length === 0) return null;

    // CRITICAL: Calculate FIXED COSTS as averages (NOT per-studio!)
    const avgSalaries = monthlyReports.reduce((sum, r) => sum + (r.salaries || 0), 0) / monthlyReports.length;
    const avgMarketing = monthlyReports.reduce((sum, r) => sum + (r.marketing || 0), 0) / monthlyReports.length;

    // Historical data (Oct 2024 - Sep 2025) - REAL DATA
    const historical = monthlyReports.map((report) => {
      const monthDate = new Date(report.month);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const studios = report.studio_count || 55;
      const revenue = report.total_revenue || 0;
      const expenses = report.total_expenses || 0;
      const profit = report.total_profit || 0;
      
      return {
        month: monthName,
        fullDate: report.month,
        monthIndex: monthDate.getMonth(), // 0-11
        studios,
        revenue,
        expenses,
        profit,
        companyProfit: report.company_profit || 0,
        ownersProfit: report.studio_owners_profit || 0,
        occupancy: report.occupancy || 0,
        adr: report.average_price || 0,
        daysOccupied: report.days_occupied || 0,
        // Expense breakdown
        utilities: report.utilities || 0,
        salaries: report.salaries || 0,
        cleaningTechnical: report.cleaning_technical || 0,
        marketing: report.marketing || 0,
        // CRITICAL: Calculate REAL per-studio metrics
        revenuePerStudio: revenue / studios,
        profitPerStudio: profit / studios,
      };
    });

    // Calculate REAL historical company income total
    const historicalCompanyIncome = historical.reduce((sum, m) => sum + m.companyProfit, 0);

    // Create FUTURE forecast (Oct 2025 - Sep 2026) based on historical patterns
    const forecastMonths = [
      { month: 'Oct', year: 2025, monthIndex: 9 },
      { month: 'Nov', year: 2025, monthIndex: 10 },
      { month: 'Dec', year: 2025, monthIndex: 11 },
      { month: 'Jan', year: 2026, monthIndex: 0 },
      { month: 'Feb', year: 2026, monthIndex: 1 },
      { month: 'Mar', year: 2026, monthIndex: 2 },
      { month: 'Apr', year: 2026, monthIndex: 3 },
      { month: 'May', year: 2026, monthIndex: 4 },
      { month: 'Jun', year: 2026, monthIndex: 5 },
      { month: 'Jul', year: 2026, monthIndex: 6 },
      { month: 'Aug', year: 2026, monthIndex: 7 },
      { month: 'Sep', year: 2026, monthIndex: 8 },
    ];

    // Map historical patterns to future months
    const forecastBase = forecastMonths.map((futureMonth, idx) => {
      const historicalMonth = historical[idx];
      if (!historicalMonth) return null;

      return {
        month: `${futureMonth.month} ${futureMonth.year}`,
        fullDate: `${futureMonth.year}-${String(futureMonth.monthIndex + 1).padStart(2, '0')}-01`,
        monthIndex: futureMonth.monthIndex,
        historicalStudios: historicalMonth.studios,
        historicalRevenue: historicalMonth.revenue,
        historicalExpenses: historicalMonth.expenses,
        historicalProfit: historicalMonth.profit,
        historicalUtilities: historicalMonth.utilities,
        historicalSalaries: historicalMonth.salaries,
        historicalCleaning: historicalMonth.cleaningTechnical,
        historicalMarketing: historicalMonth.marketing,
        // Use historical occupancy and ADR patterns
        occupancy: historicalMonth.occupancy,
        adr: historicalMonth.adr,
        // CRITICAL: Use REAL per-studio metrics from THIS specific month
        revenuePerStudio: historicalMonth.revenuePerStudio,
        // VARIABLE COSTS (scale per studio)
        utilitiesPerStudio: historicalMonth.utilities / historicalMonth.studios,
        cleaningPerStudio: historicalMonth.cleaningTechnical / historicalMonth.studios,
      };
    }).filter(Boolean);

    // Define 3 scenarios
    const scenarios = [
      { id: 0, name: 'Current Portfolio (55 Studios)', studios: 55, owned: 0 },
      { id: 1, name: 'Expanded Portfolio (70 Studios)', studios: 70, owned: 0 },
      { id: 2, name: 'Mixed Ownership (70 Studios, 5 Owned)', studios: 70, owned: 5 },
    ];

    // Calculate forecasts for FUTURE period (Oct 2025 - Sep 2026)
    const scenarioForecasts = scenarios.map(scenario => {
      const months = forecastBase.map((fb) => {
        // ✅ CORRECTED EXPENSE CALCULATION
        
        // VARIABLE COSTS (scale with studios):
        // Utilities: Scale proportionally with studio count
        const forecastUtilities = fb.utilitiesPerStudio * scenario.studios;
        
        // Cleaning/Technical: Scale proportionally with studio count
        const forecastCleaning = fb.cleaningPerStudio * scenario.studios;
        
        // FIXED COSTS (remain constant regardless of studio count):
        // Salaries: Fixed at average historical value
        const forecastSalaries = avgSalaries;
        
        // Marketing: Fixed at average historical value
        const forecastMarketing = avgMarketing;
        
        // Total forecast expenses
        const expenses = forecastUtilities + forecastSalaries + forecastCleaning + forecastMarketing;
        
        // Revenue: THIS month's per-studio revenue × new studio count
        const revenue = fb.revenuePerStudio * scenario.studios;
        const profit = revenue - expenses;
        const profitPerStudio = profit / scenario.studios;

        // Calculate company and owner shares based on scenario
        let companyShare = 0;
        let ownersShare = 0;
        let personalIncome = 0;

        if (scenario.owned > 0) {
          // Mixed ownership: company owns 5 apartments, manages 65 apartments
          const managedStudios = scenario.studios - scenario.owned;
          
          // Calculate per-studio profit
          const perStudioProfit = profit / scenario.studios;
          
          // Company gets 15% from managed apartments (65)
          const managedProfit = perStudioProfit * managedStudios;
          companyShare = managedProfit * 0.15;
          
          // Owners get 85% from managed apartments (65)
          ownersShare = managedProfit * 0.85;
          
          // Company also owns 5 apartments (100% of their profit)
          const ownedProfit = perStudioProfit * scenario.owned;
          personalIncome = companyShare + ownedProfit;
        } else {
          // Standard management: company gets 15% of all profit
          companyShare = profit * 0.15;
          ownersShare = profit * 0.85;
          personalIncome = companyShare;
        }

        return {
          month: fb.month,
          fullDate: fb.fullDate,
          studios: scenario.studios,
          owned: scenario.owned,
          occupancy: fb.occupancy,
          adr: fb.adr,
          revenue: Math.round(revenue),
          expenses: Math.round(expenses),
          profit: Math.round(profit),
          companyShare: Math.round(companyShare),
          ownersShare: Math.round(ownersShare),
          personalIncome: Math.round(personalIncome),
          profitPerStudio: Math.round(profitPerStudio),
          // Expense breakdown for transparency
          utilities: Math.round(forecastUtilities),
          salaries: Math.round(forecastSalaries),
          cleaningTechnical: Math.round(forecastCleaning),
          marketing: Math.round(forecastMarketing),
          // Store for comparison
          historicalStudios: fb.historicalStudios,
          historicalRevenue: fb.historicalRevenue,
          historicalExpenses: fb.historicalExpenses,
          historicalProfit: fb.historicalProfit,
          historicalUtilities: fb.historicalUtilities,
          historicalSalaries: fb.historicalSalaries,
          historicalCleaning: fb.historicalCleaning,
          historicalMarketing: fb.historicalMarketing,
        };
      });

      // Calculate annual totals
      const annual = months.reduce((acc, m) => ({
        revenue: acc.revenue + m.revenue,
        expenses: acc.expenses + m.expenses,
        profit: acc.profit + m.profit,
        companyShare: acc.companyShare + m.companyShare,
        ownersShare: acc.ownersShare + m.ownersShare,
        personalIncome: acc.personalIncome + m.personalIncome,
      }), { revenue: 0, expenses: 0, profit: 0, companyShare: 0, ownersShare: 0, personalIncome: 0 });

      const avgOccupancy = months.reduce((sum, m) => sum + m.occupancy, 0) / 12;
      const avgADR = months.reduce((sum, m) => sum + m.adr, 0) / 12;
      const profitMargin = annual.revenue > 0 ? (annual.profit / annual.revenue) * 100 : 0;

      return {
        scenario,
        months,
        annual: {
          ...annual,
          avgOccupancy,
          avgADR,
          profitMargin,
          avgMonthlyIncome: annual.personalIncome / 12,
        },
      };
    });

    // Calculate occupancy sensitivity analysis
    const sensitivityAnalysis = scenarioForecasts.map(sf => {
      const baseOccupancy = sf.annual.avgOccupancy;
      const scenarios = [
        { label: '-5%', occupancy: baseOccupancy - 5 },
        { label: 'Base', occupancy: baseOccupancy },
        { label: '+5%', occupancy: baseOccupancy + 5 }
      ];
      
      return {
        scenario: sf.scenario,
        scenarios: scenarios.map(s => {
          // Calculate revenue at different occupancy levels
          const occupancyMultiplier = s.occupancy / baseOccupancy;
          const revenue = sf.annual.revenue * occupancyMultiplier;
          const profit = revenue - sf.annual.expenses;
          
          // Calculate company income based on scenario type
          let companyIncome = 0;
          if (sf.scenario.owned > 0) {
            const managedStudios = sf.scenario.studios - sf.scenario.owned;
            const perStudioProfit = profit / sf.scenario.studios;
            const managedProfit = perStudioProfit * managedStudios;
            const ownedProfit = perStudioProfit * sf.scenario.owned;
            companyIncome = (managedProfit * 0.15) + ownedProfit;
          } else {
            companyIncome = profit * 0.15;
          }
          
          return {
            label: s.label,
            occupancy: s.occupancy,
            revenue: Math.round(revenue),
            profit: Math.round(profit),
            companyIncome: Math.round(companyIncome),
            profitChange: ((profit - sf.annual.profit) / sf.annual.profit) * 100,
            companyIncomeChange: ((companyIncome - sf.annual.personalIncome) / sf.annual.personalIncome) * 100
          };
        })
      };
    });

    // Calculate per-studio cost efficiency for different portfolio sizes
    const portfolioSizes = [
      { studios: 34, label: '34 Studios (Last Year Min)' },
      { studios: 55, label: '55 Studios (Current)' },
      { studios: 70, label: '70 Studios (Expansion)' }
    ];

    const efficiencyComparison = portfolioSizes.map(portfolio => {
      // Calculate monthly average costs for this portfolio size
      const avgUtilitiesPerStudio = forecastBase.reduce((sum, fb) => sum + fb.utilitiesPerStudio, 0) / forecastBase.length;
      const avgCleaningPerStudio = forecastBase.reduce((sum, fb) => sum + fb.cleaningPerStudio, 0) / forecastBase.length;
      
      // Variable costs scale with studios
      const monthlyUtilities = avgUtilitiesPerStudio * portfolio.studios;
      const monthlyCleaning = avgCleaningPerStudio * portfolio.studios;
      
      // Fixed costs stay the same
      const monthlySalaries = avgSalaries;
      const monthlyMarketing = avgMarketing;
      
      const totalMonthlyExpenses = monthlyUtilities + monthlyCleaning + monthlySalaries + monthlyMarketing;
      const perStudioExpenses = totalMonthlyExpenses / portfolio.studios;
      
      return {
        studios: portfolio.studios,
        label: portfolio.label,
        totalMonthly: Math.round(totalMonthlyExpenses),
        perStudio: Math.round(perStudioExpenses),
        utilities: Math.round(monthlyUtilities),
        cleaning: Math.round(monthlyCleaning),
        salaries: Math.round(monthlySalaries),
        marketing: Math.round(monthlyMarketing),
        // Calculate efficiency gain vs 34 studios
        efficiencyGain: portfolio.studios === 34 ? 0 : 
          ((totalMonthlyExpenses / portfolio.studios) / (portfolioSizes[0].studios === 34 ? 
            ((avgUtilitiesPerStudio * 34 + avgCleaningPerStudio * 34 + avgSalaries + avgMarketing) / 34) : 1)) * 100 - 100
      };
    });

    // Break-Even Analysis
    const breakEvenAnalysis = scenarioForecasts.map(sf => {
      // Annual fixed costs
      const annualFixedCosts = (avgSalaries + avgMarketing) * 12;
      
      // Calculate variable cost per night from historical data
      const totalHistoricalNights = historical.reduce((sum, h) => sum + h.daysOccupied, 0);
      const totalHistoricalVariableCosts = historical.reduce((sum, h) => sum + (h.utilities + h.cleaningTechnical), 0);
      const variableCostPerNight = totalHistoricalVariableCosts / totalHistoricalNights;
      
      // Total possible nights per year
      const totalPossibleNights = sf.scenario.studios * 365;
      
      // Average ADR for this scenario
      const avgADR = sf.annual.avgADR;
      
      // Breakeven calculation:
      // At breakeven: Revenue = Fixed Costs + Variable Costs
      // ADR × Nights = Fixed Costs + (Variable per night × Nights)
      // ADR × Total Possible × Occ = Fixed + (Variable per night × Total Possible × Occ)
      // Solving for Occupancy:
      // Occ × (ADR - Variable per night) × Total Possible = Fixed
      // Occ = Fixed / ((ADR - Variable per night) × Total Possible)
      
      const breakEvenOccupancy = annualFixedCosts / ((avgADR - variableCostPerNight) * totalPossibleNights);
      const breakEvenOccupancyPercent = breakEvenOccupancy * 100;
      
      // Calculate metrics at breakeven point
      const breakEvenNights = Math.round(totalPossibleNights * breakEvenOccupancy);
      const breakEvenRevenue = avgADR * breakEvenNights;
      const breakEvenVariableCosts = variableCostPerNight * breakEvenNights;
      const breakEvenTotalCosts = annualFixedCosts + breakEvenVariableCosts;
      
      // Safety margin - how much above breakeven we are
      const currentOccupancy = sf.annual.avgOccupancy;
      const occupancyBuffer = currentOccupancy - breakEvenOccupancyPercent;
      const bufferPercentage = (occupancyBuffer / breakEvenOccupancyPercent) * 100;
      
      // Days until breakeven in the year
      const daysToBreakEven = Math.ceil(breakEvenNights / sf.scenario.studios);
      
      return {
        scenario: sf.scenario,
        breakEvenOccupancy: breakEvenOccupancyPercent,
        currentOccupancy: currentOccupancy,
        occupancyBuffer: occupancyBuffer,
        bufferPercentage: bufferPercentage,
        breakEvenNights: breakEvenNights,
        breakEvenRevenue: Math.round(breakEvenRevenue),
        breakEvenTotalCosts: Math.round(breakEvenTotalCosts),
        annualFixedCosts: Math.round(annualFixedCosts),
        variableCostPerNight: Math.round(variableCostPerNight),
        avgADR: Math.round(avgADR),
        daysToBreakEven: daysToBreakEven,
      };
    });

    return {
      historical,
      forecastBase,
      scenarioForecasts,
      historicalCompanyIncome, // Real total from Oct 2024 - Sep 2025
      avgSalaries, // Average fixed salaries
      avgMarketing, // Average fixed marketing
      sensitivityAnalysis,
      efficiencyComparison,
      breakEvenAnalysis
    };
  }, [monthlyReports]);

  // Multi-Year Projection (3-5 years ahead)
  const multiYearProjection = useMemo(() => {
    if (!forecast || !forecast.scenarioForecasts[selectedScenario]) return null;
    
    const baseScenario = forecast.scenarioForecasts[selectedScenario];
    const baseYear = {
      year: 2026,
      revenue: baseScenario.annual.revenue,
      expenses: baseScenario.annual.expenses,
      profit: baseScenario.annual.profit,
      companyIncome: baseScenario.annual.personalIncome,
      occupancy: baseScenario.annual.avgOccupancy,
      adr: baseScenario.annual.avgADR,
      studios: baseScenario.scenario.studios
    };

    // Define 3 growth scenarios
    const growthScenarios = [
      {
        name: 'Conservative Growth',
        nameKa: 'კონსერვატიული ზრდა',
        color: 'blue',
        occupancyGrowth: 0.5, // 0.5% per year
        adrGrowth: 2.0, // 2% per year
        expenseGrowth: 3.0, // 3% per year (inflation)
        studioGrowth: 0 // no expansion
      },
      {
        name: 'Moderate Growth',
        nameKa: 'მოდერატული ზრდა',
        color: 'emerald',
        occupancyGrowth: 1.5, // 1.5% per year
        adrGrowth: 4.0, // 4% per year
        expenseGrowth: 3.5, // 3.5% per year
        studioGrowth: 5 // +5 studios per year
      },
      {
        name: 'Aggressive Growth',
        nameKa: 'აგრესიული ზრდა',
        color: 'purple',
        occupancyGrowth: 2.5, // 2.5% per year
        adrGrowth: 6.0, // 6% per year
        expenseGrowth: 4.0, // 4% per year
        studioGrowth: 10 // +10 studios per year
      }
    ];

    const projections = growthScenarios.map(scenario => {
      const years = [baseYear]; // Start with 2026 (Year 1)
      
      for (let i = 1; i <= projectionYears; i++) {
        const prevYear = years[i - 1];
        const yearNumber = baseYear.year + i;
        
        // Calculate new studios
        const newStudios = prevYear.studios + scenario.studioGrowth;
        
        // Calculate occupancy (capped at 95%)
        const newOccupancy = Math.min(
          prevYear.occupancy + scenario.occupancyGrowth,
          95
        );
        
        // Calculate ADR with growth
        const newADR = prevYear.adr * (1 + scenario.adrGrowth / 100);
        
        // Calculate revenue
        // Revenue = Studios × 365 days × Occupancy × ADR
        const totalPossibleNights = newStudios * 365;
        const occupiedNights = totalPossibleNights * (newOccupancy / 100);
        const newRevenue = occupiedNights * newADR;
        
        // Calculate expenses
        // Fixed costs grow with inflation
        const annualFixedCosts = (forecast.avgSalaries + forecast.avgMarketing) * 12;
        const newFixedCosts = annualFixedCosts * Math.pow(1 + scenario.expenseGrowth / 100, i);
        
        // Variable costs scale with studios and occupancy
        const totalHistoricalNights = forecast.historical.reduce((sum, h) => sum + h.daysOccupied, 0);
        const totalHistoricalVariableCosts = forecast.historical.reduce((sum, h) => sum + (h.utilities + h.cleaningTechnical), 0);
        const variableCostPerNight = totalHistoricalVariableCosts / totalHistoricalNights;
        const newVariableCosts = variableCostPerNight * occupiedNights * Math.pow(1 + scenario.expenseGrowth / 100, i);
        
        const newExpenses = newFixedCosts + newVariableCosts;
        const newProfit = newRevenue - newExpenses;
        
        // Calculate company income
        let newCompanyIncome = 0;
        if (baseScenario.scenario.owned > 0) {
          const managedStudios = newStudios - baseScenario.scenario.owned;
          const perStudioProfit = newProfit / newStudios;
          const managedProfit = perStudioProfit * managedStudios;
          const ownedProfit = perStudioProfit * baseScenario.scenario.owned;
          newCompanyIncome = (managedProfit * 0.15) + ownedProfit;
        } else {
          newCompanyIncome = newProfit * 0.15;
        }
        
        years.push({
          year: yearNumber,
          revenue: Math.round(newRevenue),
          expenses: Math.round(newExpenses),
          profit: Math.round(newProfit),
          companyIncome: Math.round(newCompanyIncome),
          occupancy: parseFloat(newOccupancy.toFixed(1)),
          adr: Math.round(newADR),
          studios: newStudios
        });
      }
      
      return {
        scenario,
        years
      };
    });

    // Calculate cumulative company income over the projection period
    const cumulativeIncome = projections.map(proj => ({
      scenario: proj.scenario,
      total: proj.years.reduce((sum, y) => sum + y.companyIncome, 0),
      years: proj.years
    }));

    return {
      projections,
      cumulativeIncome,
      baseYear
    };
  }, [forecast, selectedScenario, projectionYears]);

  // What-If Scenario Calculator
  const whatIfResults = useMemo(() => {
    if (!forecast || selectedScenario === null) return null;
    
    const selectedForecast = forecast.scenarioForecasts[selectedScenario];
    const baseOccupancy = selectedForecast.annual.avgOccupancy;
    const baseADR = selectedForecast.annual.avgADR;
    const baseExpenses = selectedForecast.annual.expenses;
    const baseRevenue = selectedForecast.annual.revenue;
    const baseProfit = selectedForecast.annual.profit;
    const baseCompanyIncome = selectedForecast.annual.personalIncome;
    
    // Use custom values if set, otherwise use base values
    const adjustedOccupancy = whatIfOccupancy !== null ? whatIfOccupancy : baseOccupancy;
    const adjustedADR = whatIfADR !== null ? whatIfADR : baseADR;
    const expenseAdjustment = whatIfExpenseMultiplier / 100;
    
    // Calculate new metrics
    const occupancyMultiplier = adjustedOccupancy / baseOccupancy;
    const adrMultiplier = adjustedADR / baseADR;
    
    // New revenue = base revenue × occupancy change × ADR change
    const newRevenue = baseRevenue * occupancyMultiplier * adrMultiplier;
    
    // Adjust expenses (variable costs scale with occupancy, fixed costs remain)
    const totalHistoricalNights = forecast.historical.reduce((sum, h) => sum + h.daysOccupied, 0);
    const totalHistoricalVariableCosts = forecast.historical.reduce((sum, h) => sum + (h.utilities + h.cleaningTechnical), 0);
    const variableCostPerNight = totalHistoricalVariableCosts / totalHistoricalNights;
    
    const annualFixedCosts = (forecast.avgSalaries + forecast.avgMarketing) * 12;
    const totalPossibleNights = selectedForecast.scenario.studios * 365;
    const newOccupiedNights = totalPossibleNights * (adjustedOccupancy / 100);
    const newVariableCosts = variableCostPerNight * newOccupiedNights;
    
    // Apply expense multiplier to all costs
    const newExpenses = (annualFixedCosts + newVariableCosts) * expenseAdjustment;
    
    const newProfit = newRevenue - newExpenses;
    
    // Calculate company income based on scenario type
    let newCompanyIncome = 0;
    if (selectedForecast.scenario.owned > 0) {
      const managedStudios = selectedForecast.scenario.studios - selectedForecast.scenario.owned;
      const perStudioProfit = newProfit / selectedForecast.scenario.studios;
      const managedProfit = perStudioProfit * managedStudios;
      const ownedProfit = perStudioProfit * selectedForecast.scenario.owned;
      newCompanyIncome = (managedProfit * 0.15) + ownedProfit;
    } else {
      newCompanyIncome = newProfit * 0.15;
    }
    
    // Calculate changes
    const revenueChange = ((newRevenue - baseRevenue) / baseRevenue) * 100;
    const expenseChange = ((newExpenses - baseExpenses) / baseExpenses) * 100;
    const profitChange = newProfit - baseProfit;
    const profitChangePercent = ((newProfit - baseProfit) / Math.abs(baseProfit)) * 100;
    const companyIncomeChange = newCompanyIncome - baseCompanyIncome;
    const companyIncomeChangePercent = ((newCompanyIncome - baseCompanyIncome) / baseCompanyIncome) * 100;
    
    return {
      base: {
        occupancy: baseOccupancy,
        adr: baseADR,
        revenue: baseRevenue,
        expenses: baseExpenses,
        profit: baseProfit,
        companyIncome: baseCompanyIncome,
        profitMargin: (baseProfit / baseRevenue) * 100
      },
      adjusted: {
        occupancy: adjustedOccupancy,
        adr: adjustedADR,
        revenue: Math.round(newRevenue),
        expenses: Math.round(newExpenses),
        profit: Math.round(newProfit),
        companyIncome: Math.round(newCompanyIncome),
        profitMargin: (newProfit / newRevenue) * 100,
        expenseMultiplier: whatIfExpenseMultiplier
      },
      changes: {
        revenue: revenueChange,
        expense: expenseChange,
        profit: profitChange,
        profitPercent: profitChangePercent,
        companyIncome: companyIncomeChange,
        companyIncomePercent: companyIncomeChangePercent
      }
    };
  }, [forecast, selectedScenario, whatIfOccupancy, whatIfADR, whatIfExpenseMultiplier]);
  
  // Reset What-If values to baseline
  const resetWhatIf = () => {
    setWhatIfOccupancy(null);
    setWhatIfADR(null);
    setWhatIfExpenseMultiplier(100);
  };

  const formatCurrency = (value: number) => {
    return `₾${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Export to PDF - Comprehensive professional format
  const exportToPDF = async () => {
    if (!forecast) return;

    try {
      toast({
        title: "Generating PDF",
        description: "Creating comprehensive forecast report...",
      });

      const selected = forecast.scenarioForecasts[selectedScenario];
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = margin;

      const addPageNumber = (pageNum: number) => {
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
        doc.text(`Orbi City - Confidential`, pageWidth - margin, pageHeight - 8, { align: 'right' });
      };

      const checkPageBreak = (spaceNeeded: number) => {
        if (yPos + spaceNeeded > pageHeight - 20) {
          doc.addPage();
          currentPage++;
          addPageNumber(currentPage);
          yPos = margin;
          return true;
        }
        return false;
      };

      // ==== PAGE 1: Cover & Executive Summary ====
      let currentPage = 1;
      
      // Professional Header with Blue Background
      doc.setFillColor(0, 78, 146);
      doc.rect(0, 0, pageWidth, 50, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text("ORBI CITY", pageWidth / 2, 22, { align: "center" });
      
      doc.setFontSize(18);
      doc.setFont("helvetica", "normal");
      doc.text("Financial Forecast Report", pageWidth / 2, 34, { align: "center" });
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("October 2025 - September 2026", pageWidth / 2, 42, { align: "center" });
      
      yPos = 60;
      doc.setTextColor(0, 0, 0);
      
      // Scenario Info
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Forecast Scenario", margin, yPos);
      yPos += 8;
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`${selected.scenario.name}`, margin, yPos);
      yPos += 6;
      doc.text(`Portfolio: ${selected.scenario.studios} studios${selected.scenario.owned > 0 ? ` (${selected.scenario.owned} owned)` : ''}`, margin, yPos);
      
      // Executive Summary
      yPos += 15;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Executive Summary", margin, yPos);
      yPos += 3;
      
      const summaryData = [
        ["Annual Revenue", formatCurrency(selected.annual.revenue)],
        ["Annual Expenses", formatCurrency(selected.annual.expenses)],
        ["Net Profit", formatCurrency(selected.annual.profit)],
        ["Profit Margin", `${selected.annual.profitMargin.toFixed(1)}%`],
        ["Company Income (Annual)", formatCurrency(selected.annual.personalIncome)],
        ["Company Income (Monthly)", formatCurrency(selected.annual.avgMonthlyIncome)],
        ["Average Occupancy", `${selected.annual.avgOccupancy.toFixed(1)}%`],
        ["Average ADR", formatCurrency(selected.annual.avgADR)],
      ];

      autoTable(doc, {
        startY: yPos + 5,
        head: [['Financial Metric', 'Value']],
        body: summaryData,
        theme: 'striped',
        headStyles: { 
          fillColor: [0, 78, 146], 
          fontStyle: 'bold',
          fontSize: 11
        },
        styles: { 
          fontSize: 10,
          cellPadding: 4
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 100 },
          1: { halign: 'right', cellWidth: 75 }
        },
        margin: { left: margin, right: margin }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Expense Structure Overview
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Annual Expense Breakdown", margin, yPos);
      yPos += 3;

      const avgUtilities = selected.months.reduce((sum, m) => sum + m.utilities, 0);
      const avgSalaries = selected.months.reduce((sum, m) => sum + m.salaries, 0);
      const avgCleaning = selected.months.reduce((sum, m) => sum + m.cleaningTechnical, 0);
      const avgMarketing = selected.months.reduce((sum, m) => sum + m.marketing, 0);
      const totalExpenses = selected.annual.expenses;

      const expenseData = [
        ["Utilities (Variable)", formatCurrency(avgUtilities), `${((avgUtilities / totalExpenses) * 100).toFixed(1)}%`],
        ["Salaries (Fixed)", formatCurrency(avgSalaries), `${((avgSalaries / totalExpenses) * 100).toFixed(1)}%`],
        ["Cleaning/Technical (Variable)", formatCurrency(avgCleaning), `${((avgCleaning / totalExpenses) * 100).toFixed(1)}%`],
        ["Marketing (Fixed)", formatCurrency(avgMarketing), `${((avgMarketing / totalExpenses) * 100).toFixed(1)}%`],
        ["TOTAL", formatCurrency(totalExpenses), "100.0%"],
      ];

      autoTable(doc, {
        startY: yPos + 5,
        head: [['Expense Category', 'Annual Amount', '% of Total']],
        body: expenseData,
        theme: 'grid',
        headStyles: { 
          fillColor: [214, 168, 90],
          fontStyle: 'bold',
          fontSize: 10
        },
        styles: { 
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 85 },
          1: { halign: 'right', cellWidth: 55 },
          2: { halign: 'center', cellWidth: 35 }
        },
        margin: { left: margin, right: margin },
        footStyles: {
          fillColor: [250, 240, 220],
          fontStyle: 'bold'
        }
      });

      addPageNumber(currentPage);

      // ==== PAGE 2: Monthly Breakdown Table ====
      doc.addPage();
      currentPage++;
      yPos = margin;

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("12-Month Detailed Forecast", margin, yPos);
      yPos += 10;

      const monthlyData = selected.months.map(m => ([
        m.month,
        m.studios.toString(),
        `${m.occupancy.toFixed(1)}%`,
        formatCurrency(m.adr),
        formatCurrency(m.revenue),
        formatCurrency(m.expenses),
        formatCurrency(m.profit),
        formatCurrency(m.personalIncome),
      ]));

      // Add total row
      monthlyData.push([
        'TOTAL',
        '-',
        `${selected.annual.avgOccupancy.toFixed(1)}%`,
        formatCurrency(selected.annual.avgADR),
        formatCurrency(selected.annual.revenue),
        formatCurrency(selected.annual.expenses),
        formatCurrency(selected.annual.profit),
        formatCurrency(selected.annual.personalIncome),
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [[
          'Month', 
          'Studios', 
          'Occ %', 
          'ADR', 
          'Revenue', 
          'Expenses', 
          'Profit',
          'Co Income'
        ]],
        body: monthlyData,
        theme: 'striped',
        headStyles: { 
          fillColor: [0, 78, 146],
          fontStyle: 'bold',
          fontSize: 9
        },
        styles: { 
          fontSize: 8,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 22, fontStyle: 'bold' },
          1: { cellWidth: 16, halign: 'right' },
          2: { cellWidth: 16, halign: 'right' },
          3: { cellWidth: 20, halign: 'right' },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 25, halign: 'right' },
          6: { cellWidth: 24, halign: 'right' },
          7: { cellWidth: 24, halign: 'right' },
        },
        margin: { left: margin, right: margin },
        footStyles: {
          fillColor: [240, 240, 240],
          fontStyle: 'bold',
          fontSize: 9
        }
      });

      addPageNumber(currentPage);

      // ==== PAGE 3: Monthly Expense Breakdown ====
      doc.addPage();
      currentPage++;
      yPos = margin;

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Monthly Expense Analysis", margin, yPos);
      yPos += 10;

      const expenseMonthlyData = selected.months.map(m => ([
        m.month,
        `₾${m.utilities.toLocaleString()}`,
        `${((m.utilities / m.expenses) * 100).toFixed(1)}%`,
        `₾${m.salaries.toLocaleString()}`,
        `${((m.salaries / m.expenses) * 100).toFixed(1)}%`,
        `₾${m.cleaningTechnical.toLocaleString()}`,
        `${((m.cleaningTechnical / m.expenses) * 100).toFixed(1)}%`,
        `₾${m.marketing.toLocaleString()}`,
        `${((m.marketing / m.expenses) * 100).toFixed(1)}%`,
        `₾${m.expenses.toLocaleString()}`,
      ]));

      // Add average row
      expenseMonthlyData.push([
        'AVERAGE',
        `₾${Math.round(avgUtilities / 12).toLocaleString()}`,
        `${((avgUtilities / totalExpenses) * 100).toFixed(1)}%`,
        `₾${Math.round(avgSalaries / 12).toLocaleString()}`,
        `${((avgSalaries / totalExpenses) * 100).toFixed(1)}%`,
        `₾${Math.round(avgCleaning / 12).toLocaleString()}`,
        `${((avgCleaning / totalExpenses) * 100).toFixed(1)}%`,
        `₾${Math.round(avgMarketing / 12).toLocaleString()}`,
        `${((avgMarketing / totalExpenses) * 100).toFixed(1)}%`,
        `₾${Math.round(totalExpenses / 12).toLocaleString()}`,
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [[
          'Month', 
          'Utilities', '%',
          'Salaries', '%',
          'Cleaning', '%',
          'Marketing', '%',
          'Total'
        ]],
        body: expenseMonthlyData,
        theme: 'grid',
        headStyles: { 
          fillColor: [214, 168, 90],
          fontStyle: 'bold',
          fontSize: 7
        },
        styles: { 
          fontSize: 7,
          cellPadding: 1.5
        },
        columnStyles: {
          0: { cellWidth: 18, fontStyle: 'bold' },
          1: { cellWidth: 16, halign: 'right' },
          2: { cellWidth: 10, halign: 'center', fontSize: 6 },
          3: { cellWidth: 16, halign: 'right' },
          4: { cellWidth: 10, halign: 'center', fontSize: 6 },
          5: { cellWidth: 16, halign: 'right' },
          6: { cellWidth: 10, halign: 'center', fontSize: 6 },
          7: { cellWidth: 16, halign: 'right' },
          8: { cellWidth: 10, halign: 'center', fontSize: 6 },
          9: { cellWidth: 18, halign: 'right', fontStyle: 'bold' },
        },
        margin: { left: margin, right: margin }
      });

      addPageNumber(currentPage);

      // ==== PAGE 4: Occupancy Sensitivity Analysis ====
      doc.addPage();
      currentPage++;
      yPos = margin;

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Occupancy Sensitivity Analysis", margin, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Impact of ±5% occupancy change on financial performance", margin, yPos);
      yPos += 12;

      forecast.sensitivityAnalysis.forEach((sa, idx) => {
        checkPageBreak(50);
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(sa.scenario.name, margin, yPos);
        yPos += 8;

        const sensitivityData = sa.scenarios.map(s => [
          s.label,
          `${s.occupancy.toFixed(1)}%`,
          `₾${s.revenue.toLocaleString()}`,
          `₾${s.profit.toLocaleString()}`,
          s.label === 'Base' ? '-' : `${s.profitChange > 0 ? '+' : ''}${s.profitChange.toFixed(1)}%`,
          `₾${s.companyIncome.toLocaleString()}`,
          s.label === 'Base' ? '-' : `${s.companyIncomeChange > 0 ? '+' : ''}${s.companyIncomeChange.toFixed(1)}%`
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Scenario', 'Occupancy', 'Revenue', 'Profit', 'Profit Δ', 'Co. Income', 'Income Δ']],
          body: sensitivityData,
          theme: 'grid',
          headStyles: { 
            fillColor: [147, 51, 234],
            fontStyle: 'bold',
            fontSize: 8
          },
          styles: { 
            fontSize: 8,
            cellPadding: 2
          },
          columnStyles: {
            0: { fontStyle: 'bold' },
            2: { halign: 'right' },
            3: { halign: 'right' },
            4: { halign: 'center' },
            5: { halign: 'right' },
            6: { halign: 'center' }
          },
          margin: { left: margin, right: margin }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
      });

      addPageNumber(currentPage);

      // ==== PAGE 5: Expense Efficiency Comparison ====
      doc.addPage();
      currentPage++;
      yPos = margin;

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Expense Efficiency Comparison", margin, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Per-studio cost analysis across different portfolio sizes", margin, yPos);
      yPos += 12;

      const efficiencyData = forecast.efficiencyComparison.map(ec => [
        ec.label,
        `₾${ec.totalMonthly.toLocaleString()}`,
        `₾${ec.perStudio.toLocaleString()}`,
        `₾${ec.utilities.toLocaleString()}`,
        `₾${ec.cleaning.toLocaleString()}`,
        `₾${ec.salaries.toLocaleString()}`,
        `₾${ec.marketing.toLocaleString()}`,
        ec.studios === 34 ? 'Base' : `${ec.efficiencyGain.toFixed(1)}%`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Portfolio Size', 'Total/Month', 'Per Studio', 'Utilities', 'Cleaning', 'Salaries', 'Marketing', 'Efficiency']],
        body: efficiencyData,
        theme: 'grid',
        headStyles: { 
          fillColor: [59, 130, 246],
          fontStyle: 'bold',
          fontSize: 8
        },
        styles: { 
          fontSize: 8,
          cellPadding: 2
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'right' },
          2: { halign: 'right', fontStyle: 'bold' },
          3: { halign: 'right' },
          4: { halign: 'right' },
          5: { halign: 'right' },
          6: { halign: 'right' },
          7: { halign: 'center', fontStyle: 'bold' }
        },
        margin: { left: margin, right: margin }
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
      checkPageBreak(30);

      // Key insight box
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 25, 2, 2, 'F');
      yPos += 5;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("💡 Economies of Scale", margin + 3, yPos);
      yPos += 6;

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const insight = `As portfolio size increases, per-studio expenses decrease due to fixed costs (salaries, marketing) being spread across more units. At 70 studios, per-studio costs are ${forecast.efficiencyComparison[2].efficiencyGain.toFixed(1)}% lower than at 34 studios, demonstrating the financial advantage of portfolio expansion.`;
      const splitInsight = doc.splitTextToSize(insight, pageWidth - 2 * margin - 6);
      doc.text(splitInsight, margin + 3, yPos);

      addPageNumber(currentPage);

      // ==== PAGE 6: Break-Even Analysis ====
      doc.addPage();
      currentPage++;
      yPos = margin;

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Break-Even Analysis", margin, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Minimum occupancy required to cover all expenses", margin, yPos);
      yPos += 12;

      const breakEvenData = forecast.breakEvenAnalysis.map(be => [
        be.scenario.name,
        `${be.breakEvenOccupancy.toFixed(1)}%`,
        `${be.currentOccupancy.toFixed(1)}%`,
        `${be.occupancyBuffer.toFixed(1)}%`,
        `${be.bufferPercentage.toFixed(0)}%`,
        `${be.daysToBreakEven} days`,
        `₾${be.breakEvenRevenue.toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Scenario', 'Break-Even Occ.', 'Current Occ.', 'Safety Margin', 'Buffer %', 'Days to B/E', 'B/E Revenue']],
        body: breakEvenData,
        theme: 'grid',
        headStyles: { 
          fillColor: [220, 38, 38],
          fontStyle: 'bold',
          fontSize: 8
        },
        styles: { 
          fontSize: 8,
          cellPadding: 2.5
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'center', fillColor: [254, 226, 226] },
          2: { halign: 'center', fillColor: [220, 252, 231] },
          3: { halign: 'center', fontStyle: 'bold' },
          4: { halign: 'center' },
          5: { halign: 'center' },
          6: { halign: 'right' }
        },
        margin: { left: margin, right: margin }
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
      checkPageBreak(50);

      // Selected scenario detailed breakdown
      const selectedBE = forecast.breakEvenAnalysis[selectedScenario];
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`${selectedBE.scenario.name} - Detailed Breakdown`, margin, yPos);
      yPos += 8;

      const detailedBEData = [
        ['Metric', 'Value'],
        ['Annual Fixed Costs', `₾${selectedBE.annualFixedCosts.toLocaleString()}`],
        ['Variable Cost per Night', `₾${selectedBE.variableCostPerNight.toLocaleString()}`],
        ['Average ADR', `₾${selectedBE.avgADR.toLocaleString()}`],
        ['Break-Even Occupancy', `${selectedBE.breakEvenOccupancy.toFixed(1)}%`],
        ['Current Occupancy', `${selectedBE.currentOccupancy.toFixed(1)}%`],
        ['Safety Margin', `${selectedBE.occupancyBuffer.toFixed(1)}% (${selectedBE.bufferPercentage.toFixed(0)}% buffer)`],
        ['Break-Even Nights/Year', `${selectedBE.breakEvenNights.toLocaleString()} nights`],
        ['Days to Break-Even', `${selectedBE.daysToBreakEven} days`],
        ['Break-Even Revenue', `₾${selectedBE.breakEvenRevenue.toLocaleString()}`],
      ];

      autoTable(doc, {
        startY: yPos,
        body: detailedBEData,
        theme: 'striped',
        styles: { 
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 60 },
          1: { halign: 'right', cellWidth: 70 }
        },
        margin: { left: margin, right: margin }
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
      checkPageBreak(30);

      // Key insight box
      doc.setFillColor(254, 226, 226);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 30, 2, 2, 'F');
      yPos += 5;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("🎯 Break-Even Insight", margin + 3, yPos);
      yPos += 6;

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const beInsight = `At ${selectedBE.breakEvenOccupancy.toFixed(1)}% occupancy, the business covers all expenses. Current occupancy of ${selectedBE.currentOccupancy.toFixed(1)}% provides a ${selectedBE.occupancyBuffer.toFixed(1)}% safety margin (${selectedBE.bufferPercentage.toFixed(0)}% buffer), meaning the business reaches break-even in approximately ${selectedBE.daysToBreakEven} days per year and remains profitable for the remaining ${365 - selectedBE.daysToBreakEven} days. Fixed costs of ₾${selectedBE.annualFixedCosts.toLocaleString()} must be covered regardless of occupancy.`;
      const splitBEInsight = doc.splitTextToSize(beInsight, pageWidth - 2 * margin - 6);
      doc.text(splitBEInsight, margin + 3, yPos);

      addPageNumber(currentPage);

      // ==== PAGE 7: Scenario Comparison ====
      doc.addPage();
      currentPage++;
      yPos = margin;

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("All Scenarios Comparison", margin, yPos);
      yPos += 10;

      const scenarioData = forecast.scenarioForecasts.map(sf => ([
        sf.scenario.name,
        sf.scenario.studios.toString(),
        formatCurrency(sf.annual.revenue),
        formatCurrency(sf.annual.expenses),
        formatCurrency(sf.annual.profit),
        `${sf.annual.profitMargin.toFixed(1)}%`,
        formatCurrency(sf.annual.personalIncome),
        formatCurrency(sf.annual.avgMonthlyIncome),
      ]));

      autoTable(doc, {
        startY: yPos,
        head: [[
          'Scenario',
          'Studios',
          'Revenue',
          'Expenses',
          'Profit',
          'Margin',
          'Annual Income',
          'Monthly Income'
        ]],
        body: scenarioData,
        theme: 'grid',
        headStyles: { 
          fillColor: [52, 152, 219],
          fontStyle: 'bold',
          fontSize: 8
        },
        styles: { 
          fontSize: 8,
          cellPadding: 2.5
        },
        columnStyles: {
          0: { cellWidth: 35, fontStyle: 'bold' },
          1: { cellWidth: 18, halign: 'center' },
          2: { cellWidth: 24, halign: 'right' },
          3: { cellWidth: 24, halign: 'right' },
          4: { cellWidth: 22, halign: 'right' },
          5: { cellWidth: 16, halign: 'center' },
          6: { cellWidth: 24, halign: 'right' },
          7: { cellWidth: 24, halign: 'right' },
        },
        margin: { left: margin, right: margin }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Key Insights
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Key Insights", margin, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const insights = [
        `• Fixed costs (Salaries + Marketing) remain stable regardless of portfolio size`,
        `• Variable costs (Utilities + Cleaning) scale proportionally with studio count`,
        `• Stable 55-studio portfolio enables better cost control and profit predictability`,
        `• Company receives 15% of total profit as management fee`,
        `• Projected ${((selected.annual.personalIncome - forecast.historicalCompanyIncome) / forecast.historicalCompanyIncome * 100).toFixed(1)}% growth vs previous year`,
      ];

      insights.forEach(insight => {
        doc.text(insight, margin + 2, yPos);
        yPos += 6;
      });

      yPos += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("IMPORTANT NOTES:", margin, yPos);
      yPos += 6;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const notes = [
        "• Salaries and Marketing are FIXED costs - do not scale with studio count",
        "• Utilities and Cleaning are VARIABLE costs - scale proportionally with studios",
        `• Company receives 15% management fee${selected.scenario.owned > 0 ? ' + 100% from owned studios' : ''}`,
        "• Forecast based on historical patterns (Oct 2024 - Sep 2025)",
      ];
      notes.forEach(note => {
        doc.text(note, margin + 2, yPos);
        yPos += 5;
      });

      addPageNumber(currentPage);

      // Save PDF
      const fileName = `Orbi_City_Forecast_${selected.scenario.studios}studios_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "PDF Exported",
        description: `${currentPage} pages saved successfully`,
      });

    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: "Could not generate PDF",
        variant: "destructive",
      });
    }
  };

  // Export to Excel - Complete data export
  const exportToExcel = () => {
    if (!forecast) return;

    try {
      const wb = XLSX.utils.book_new();
      const selected = forecast.scenarioForecasts[selectedScenario];

      // Sheet 1: Executive Summary
      const summaryData = [
        ['ORBI CITY - FINANCIAL FORECAST'],
        ['October 2025 - September 2026'],
        [''],
        ['Scenario', selected.scenario.name],
        ['Portfolio Size', `${selected.scenario.studios} studios`],
        ['Owned by Company', selected.scenario.owned || 0],
        [''],
        ['ANNUAL SUMMARY'],
        ['Total Revenue', selected.annual.revenue],
        ['Total Expenses', selected.annual.expenses],
        ['Net Profit', selected.annual.profit],
        ['Profit Margin', `${selected.annual.profitMargin.toFixed(1)}%`],
        ['Company Annual Income', selected.annual.personalIncome],
        ['Company Monthly Income', selected.annual.avgMonthlyIncome],
        ['Average Occupancy', `${selected.annual.avgOccupancy.toFixed(1)}%`],
        ['Average ADR', selected.annual.avgADR],
      ];
      
      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws1, "Summary");

      // Sheet 2: Monthly Breakdown
      const monthlyData = selected.months.map(m => ({
        'Month': m.month,
        'Date': m.fullDate,
        'Studios': m.studios,
        'Occupancy %': parseFloat(m.occupancy.toFixed(1)),
        'ADR': m.adr,
        'Revenue': m.revenue,
        'Utilities': m.utilities,
        'Salaries': m.salaries,
        'Cleaning': m.cleaningTechnical,
        'Marketing': m.marketing,
        'Total Expenses': m.expenses,
        'Net Profit': m.profit,
        'Company Income': m.personalIncome,
      }));
      
      const ws2 = XLSX.utils.json_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(wb, ws2, "Monthly Forecast");

      // Sheet 3: Expense Analysis
      const expenseData = selected.months.map(m => ({
        'Month': m.month,
        'Utilities': m.utilities,
        'Utilities %': parseFloat(((m.utilities / m.expenses) * 100).toFixed(1)),
        'Salaries': m.salaries,
        'Salaries %': parseFloat(((m.salaries / m.expenses) * 100).toFixed(1)),
        'Cleaning': m.cleaningTechnical,
        'Cleaning %': parseFloat(((m.cleaningTechnical / m.expenses) * 100).toFixed(1)),
        'Marketing': m.marketing,
        'Marketing %': parseFloat(((m.marketing / m.expenses) * 100).toFixed(1)),
        'Total Expenses': m.expenses,
      }));
      
      const ws3 = XLSX.utils.json_to_sheet(expenseData);
      XLSX.utils.book_append_sheet(wb, ws3, "Expense Breakdown");

      // Sheet 4: All Scenarios Comparison
      const comparisonData = forecast.scenarioForecasts.map(sf => ({
        'Scenario': sf.scenario.name,
        'Studios': sf.scenario.studios,
        'Owned': sf.scenario.owned,
        'Annual Revenue': sf.annual.revenue,
        'Annual Expenses': sf.annual.expenses,
        'Net Profit': sf.annual.profit,
        'Profit Margin %': parseFloat(sf.annual.profitMargin.toFixed(1)),
        'Annual Company Income': sf.annual.personalIncome,
        'Monthly Company Income': sf.annual.avgMonthlyIncome,
        'Avg Occupancy %': parseFloat(sf.annual.avgOccupancy.toFixed(1)),
        'Avg ADR': sf.annual.avgADR,
      }));
      
      const ws4 = XLSX.utils.json_to_sheet(comparisonData);
      XLSX.utils.book_append_sheet(wb, ws4, "Scenarios");

      // Sheet 5: Occupancy Sensitivity Analysis
      const sensitivityData: any[] = [];
      forecast.sensitivityAnalysis.forEach(sa => {
        sensitivityData.push({
          'Scenario': sa.scenario.name,
          'Occupancy': '',
          'Revenue': '',
          'Profit': '',
          'Profit Change %': '',
          'Company Income': '',
          'Income Change %': ''
        });
        
        sa.scenarios.forEach(s => {
          sensitivityData.push({
            'Scenario': s.label,
            'Occupancy': `${s.occupancy.toFixed(1)}%`,
            'Revenue': s.revenue,
            'Profit': s.profit,
            'Profit Change %': s.label === 'Base' ? '-' : `${s.profitChange > 0 ? '+' : ''}${s.profitChange.toFixed(1)}%`,
            'Company Income': s.companyIncome,
            'Income Change %': s.label === 'Base' ? '-' : `${s.companyIncomeChange > 0 ? '+' : ''}${s.companyIncomeChange.toFixed(1)}%`
          });
        });
        
        sensitivityData.push({
          'Scenario': '',
          'Occupancy': '',
          'Revenue': '',
          'Profit': '',
          'Profit Change %': '',
          'Company Income': '',
          'Income Change %': ''
        });
      });
      
      const ws5 = XLSX.utils.json_to_sheet(sensitivityData);
      XLSX.utils.book_append_sheet(wb, ws5, "Occupancy Sensitivity");

      // Sheet 6: Expense Efficiency Comparison
      const efficiencyData = forecast.efficiencyComparison.map(ec => ({
        'Portfolio Size': ec.label,
        'Studios': ec.studios,
        'Total Monthly Expenses': ec.totalMonthly,
        'Per Studio Cost': ec.perStudio,
        'Utilities': ec.utilities,
        'Cleaning': ec.cleaning,
        'Salaries': ec.salaries,
        'Marketing': ec.marketing,
        'Efficiency Gain %': ec.studios === 34 ? 'Base' : `${ec.efficiencyGain.toFixed(1)}%`
      }));
      
      const ws6 = XLSX.utils.json_to_sheet(efficiencyData);
      XLSX.utils.book_append_sheet(wb, ws6, "Expense Efficiency");

      // Sheet 7: Break-Even Analysis
      const breakEvenData = forecast.breakEvenAnalysis.map(be => ({
        'Scenario': be.scenario.name,
        'Studios': be.scenario.studios,
        'Break-Even Occupancy %': parseFloat(be.breakEvenOccupancy.toFixed(1)),
        'Current Occupancy %': parseFloat(be.currentOccupancy.toFixed(1)),
        'Safety Margin %': parseFloat(be.occupancyBuffer.toFixed(1)),
        'Buffer %': parseFloat(be.bufferPercentage.toFixed(1)),
        'Break-Even Nights': be.breakEvenNights,
        'Days to Break-Even': be.daysToBreakEven,
        'Break-Even Revenue': be.breakEvenRevenue,
        'Annual Fixed Costs': be.annualFixedCosts,
        'Variable Cost per Night': be.variableCostPerNight,
        'Average ADR': be.avgADR
      }));

      const ws7 = XLSX.utils.json_to_sheet(breakEvenData);
      XLSX.utils.book_append_sheet(wb, ws7, "Break-Even Analysis");

      const fileName = `Orbi_City_Forecast_${selected.scenario.studios}studios_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast({
        title: "Excel Exported",
        description: "7 sheets with complete analysis",
      });

    } catch (error) {
      console.error('Excel export error:', error);
      toast({
        title: "Export Failed",
        description: "Could not generate Excel file",
        variant: "destructive",
      });
    }
  };

  // Export Multi-Year Projection to PDF
  const exportMultiYearToPDF = async () => {
    if (!multiYearProjection) return;

    try {
      toast({
        title: language === 'ka' ? "PDF გენერირება" : "Generating PDF",
        description: language === 'ka' ? "იქმნება მრავალწლიანი პროგნოზის ანგარიში..." : "Creating multi-year projection report...",
      });

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPos = 20;

      // Page 1: Cover and Summary
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, pageWidth, 50, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('ORBI CITY APARTHOTEL', pageWidth / 2, 25, { align: 'center' });
      doc.setFontSize(16);
      doc.text(`${projectionYears}-Year Financial Projection`, pageWidth / 2, 38, { align: 'center' });

      yPos = 60;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text(`Projection Period: 2026-${2026 + projectionYears}`, 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      doc.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy')}`, 20, yPos);
      
      yPos += 15;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', 20, yPos);
      yPos += 10;

      // Scenario comparison table
      const summaryTableData = multiYearProjection.cumulativeIncome.map(item => {
        const finalYear = item.years[item.years.length - 1];
        return [
          language === 'ka' ? item.scenario.nameKa : item.scenario.name,
          `₾${(item.total / 1000000).toFixed(2)}M`,
          `₾${(finalYear.companyIncome / 1000000).toFixed(2)}M`,
          `${item.years.length} years`
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [[
          'Scenario',
          `${projectionYears}-Yr Total Income`,
          `Year ${2026 + projectionYears} Income`,
          'Period'
        ]],
        body: summaryTableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], fontSize: 10, fontStyle: 'bold' },
        styles: { fontSize: 9 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Key Insight
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }

      const aggressive = multiYearProjection.cumulativeIncome[2];
      const conservative = multiYearProjection.cumulativeIncome[0];
      const difference = aggressive.total - conservative.total;
      const percentDiff = ((difference / conservative.total) * 100).toFixed(0);

      doc.setFillColor(79, 70, 229, 0.1);
      doc.rect(15, yPos - 5, pageWidth - 30, 25, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Strategic Insight:', 20, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const insightText = `Over ${projectionYears} years, aggressive growth generates ₾${(difference / 1000000).toFixed(2)}M (${percentDiff}%) more income than conservative approach.`;
      const splitText = doc.splitTextToSize(insightText, pageWidth - 40);
      doc.text(splitText, 20, yPos);

      // Page 2: Detailed Year-by-Year Analysis
      doc.addPage();
      yPos = 20;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Year-by-Year Detailed Analysis', 20, yPos);
      yPos += 10;

      multiYearProjection.projections.forEach((proj, projIdx) => {
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(language === 'ka' ? proj.scenario.nameKa : proj.scenario.name, 20, yPos);
        yPos += 5;

        const yearTableData = proj.years.map(year => [
          year.year.toString(),
          year.studios.toString(),
          `${year.occupancy}%`,
          `₾${year.adr}`,
          `₾${(year.revenue / 1000000).toFixed(2)}M`,
          `₾${(year.expenses / 1000000).toFixed(2)}M`,
          `₾${(year.profit / 1000000).toFixed(2)}M`,
          `₾${(year.companyIncome / 1000000).toFixed(2)}M`
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [[
            'Year',
            'Studios',
            'Occ %',
            'ADR',
            'Revenue',
            'Expenses',
            'Profit',
            'Company'
          ]],
          body: yearTableData,
          theme: 'striped',
          headStyles: { fillColor: [41, 128, 185], fontSize: 8 },
          styles: { fontSize: 8 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 12;
      });

      // Page 3: Growth Assumptions
      doc.addPage();
      yPos = 20;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Growth Assumptions & Parameters', 20, yPos);
      yPos += 15;

      const assumptionsData = multiYearProjection.projections.map(proj => [
        language === 'ka' ? proj.scenario.nameKa : proj.scenario.name,
        `+${proj.scenario.occupancyGrowth}%`,
        `+${proj.scenario.adrGrowth}%`,
        proj.scenario.studioGrowth === 0 ? 'None' : `+${proj.scenario.studioGrowth}`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [[
          'Scenario',
          'Annual Occupancy Growth',
          'Annual ADR Growth',
          'Annual Studio Growth'
        ]],
        body: assumptionsData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], fontSize: 10 },
        styles: { fontSize: 9, cellPadding: 5 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Methodology notes
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Methodology:', 20, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const methodologyText = [
        '• Revenue: Calculated based on projected occupancy, ADR, and studio count',
        '• Expenses: Fixed costs (salaries, marketing) with 3% inflation; Variable costs scaled by occupancy',
        '• Company Income: 15% management fee on managed studios + 100% profit on owned studios',
        '• Growth rates are applied annually and compounded over the projection period'
      ];
      methodologyText.forEach(line => {
        doc.text(line, 20, yPos);
        yPos += 6;
      });

      // Footer on all pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Orbi City Aparthotel - Multi-Year Projection | Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      doc.save(`Orbi_City_MultiYear_Projection_${projectionYears}years_${format(new Date(), 'yyyy-MM-dd')}.pdf`);

      toast({
        title: language === 'ka' ? "PDF წარმატებით გენერირდა" : "PDF Generated Successfully",
        description: language === 'ka' ? `${projectionYears} წლის პროგნოზის ანგარიში` : `${projectionYears}-year projection report`,
      });

    } catch (error) {
      console.error('Multi-year PDF export error:', error);
      toast({
        title: language === 'ka' ? "PDF გენერირება ვერ მოხერხდა" : "PDF Generation Failed",
        description: language === 'ka' ? "შეცდომა PDF-ის შექმნისას" : "Error generating PDF",
        variant: "destructive",
      });
    }
  };

  // Export Multi-Year Projection to Excel
  const exportMultiYearToExcel = () => {
    if (!multiYearProjection) return;

    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Summary Comparison
      const summaryData = [
        ['ORBI CITY - MULTI-YEAR PROJECTION'],
        [`${projectionYears}-Year Forecast (2026-${2026 + projectionYears})`],
        ['Generated:', format(new Date(), 'yyyy-MM-dd HH:mm')],
        [''],
        ['SCENARIO COMPARISON'],
        ['Scenario', 'Occupancy Growth', 'ADR Growth', 'Studio Growth', `${projectionYears}-Yr Total Income`, `Year ${2026 + projectionYears} Income`],
        ...multiYearProjection.cumulativeIncome.map(item => {
          const finalYear = item.years[item.years.length - 1];
          return [
            language === 'ka' ? item.scenario.nameKa : item.scenario.name,
            `+${item.scenario.occupancyGrowth}%`,
            `+${item.scenario.adrGrowth}%`,
            item.scenario.studioGrowth === 0 ? 'No expansion' : `+${item.scenario.studioGrowth}/year`,
            item.total,
            finalYear.companyIncome
          ];
        })
      ];

      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws1, "Summary");

      // Sheet 2-4: Detailed data for each scenario
      multiYearProjection.projections.forEach((proj, idx) => {
        const scenarioData = proj.years.map(year => ({
          'Year': year.year,
          'Studios': year.studios,
          'Occupancy %': year.occupancy,
          'ADR': year.adr,
          'Revenue': year.revenue,
          'Expenses': year.expenses,
          'Profit': year.profit,
          'Company Income': year.companyIncome,
          'Profit Margin %': ((year.profit / year.revenue) * 100).toFixed(1),
        }));

        const ws = XLSX.utils.json_to_sheet(scenarioData);
        const sheetName = (language === 'ka' ? proj.scenario.nameKa : proj.scenario.name).substring(0, 30);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });

      // Sheet 5: Growth Parameters
      const parametersData = multiYearProjection.projections.map(proj => ({
        'Scenario': language === 'ka' ? proj.scenario.nameKa : proj.scenario.name,
        'Occupancy Growth Rate': `${proj.scenario.occupancyGrowth}%`,
        'ADR Growth Rate': `${proj.scenario.adrGrowth}%`,
        'Studio Growth Rate': proj.scenario.studioGrowth === 0 ? '0' : `${proj.scenario.studioGrowth}`,
        'Base Year': 2026,
        'Projection Years': projectionYears
      }));

      const ws5 = XLSX.utils.json_to_sheet(parametersData);
      XLSX.utils.book_append_sheet(wb, ws5, "Growth Parameters");

      // Sheet 6: Year-over-Year Growth Analysis
      const yoyData: any[] = [];
      multiYearProjection.projections.forEach(proj => {
        yoyData.push({
          'Scenario': language === 'ka' ? proj.scenario.nameKa : proj.scenario.name,
          'Year': '',
          'Revenue Growth': '',
          'Profit Growth': '',
          'Company Income Growth': ''
        });

        proj.years.forEach((year, idx) => {
          if (idx > 0) {
            const prevYear = proj.years[idx - 1];
            const revenueGrowth = ((year.revenue - prevYear.revenue) / prevYear.revenue) * 100;
            const profitGrowth = ((year.profit - prevYear.profit) / prevYear.profit) * 100;
            const incomeGrowth = ((year.companyIncome - prevYear.companyIncome) / prevYear.companyIncome) * 100;

            yoyData.push({
              'Scenario': '',
              'Year': year.year,
              'Revenue Growth': `${revenueGrowth.toFixed(1)}%`,
              'Profit Growth': `${profitGrowth.toFixed(1)}%`,
              'Company Income Growth': `${incomeGrowth.toFixed(1)}%`
            });
          }
        });

        yoyData.push({
          'Scenario': '',
          'Year': '',
          'Revenue Growth': '',
          'Profit Growth': '',
          'Company Income Growth': ''
        });
      });

      const ws6 = XLSX.utils.json_to_sheet(yoyData);
      XLSX.utils.book_append_sheet(wb, ws6, "YoY Growth Analysis");

      const fileName = `Orbi_City_MultiYear_${projectionYears}years_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: language === 'ka' ? "Excel წარმატებით გენერირდა" : "Excel Generated Successfully",
        description: language === 'ka' ? "6 sheet-ით სრული ანალიზი" : "6 sheets with complete analysis",
      });

    } catch (error) {
      console.error('Multi-year Excel export error:', error);
      toast({
        title: language === 'ka' ? "Excel გენერირება ვერ მოხერხდა" : "Excel Generation Failed",
        description: language === 'ka' ? "შეცდომა Excel-ის შექმნისას" : "Error generating Excel",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading forecast data...</p>
        </div>
      </div>
    );
  }

  if (!forecast) {
    return (
      <Alert>
        <AlertDescription>
          No financial data found. Please add monthly reports for Oct 2024 - Sep 2025.
        </AlertDescription>
      </Alert>
    );
  }

  const selected = forecast.scenarioForecasts[selectedScenario];

  return (
    <div className="space-y-6">
      {/* Professional Header with Bank-Ready Branding */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-10 w-10" />
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">ORBI CITY APARTHOTEL</h1>
                  <p className="text-white/90 text-lg">Financial Forecast 2025-2026</p>
                </div>
              </div>
              <p className="text-white/80 text-sm max-w-2xl">
                12-month projection (October 2025 - September 2026) • Based on verified historical performance (October 2024 - September 2025)
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedScenario.toString()} onValueChange={(v) => setSelectedScenario(parseInt(v))}>
                <SelectTrigger className="w-[300px] bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {forecast.scenarioForecasts.map(sf => (
                    <SelectItem key={sf.scenario.id} value={sf.scenario.id.toString()}>
                      {sf.scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={exportToPDF} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Button onClick={exportToExcel} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Company Income Growth Comparison - Highlight the improvement */}
      <Card className="border-2 border-success/30 shadow-2xl bg-gradient-to-br from-success/5 via-white to-primary/5 dark:from-success/10 dark:via-background dark:to-primary/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-success" />
            Company Income Growth Analysis
          </CardTitle>
          <CardDescription className="text-base">
            Comparing Oct 2024 - Sep 2025 (actual) vs Oct 2025 - Sep 2026 (forecast)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Last Year - REAL DATA */}
            <div className="p-6 rounded-xl bg-muted/50 border-2 border-muted">
              <div className="text-sm text-muted-foreground mb-2 font-medium">Last Year Performance (ACTUAL)</div>
              <div className="text-sm text-muted-foreground mb-1">Oct 2024 - Sep 2025</div>
              <div className="flex items-baseline gap-2 mb-3">
                <div className="text-4xl font-bold text-foreground">{formatCurrency(forecast.historicalCompanyIncome)}</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Studios:</span>
                  <span className="font-semibold">34-55 (varied monthly)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Income:</span>
                  <span className="font-semibold">{formatCurrency(forecast.historicalCompanyIncome / 12)}</span>
                </div>
              </div>
            </div>

            {/* This Year Forecast */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-success/20 to-primary/20 border-2 border-success relative overflow-hidden">
              <div className="absolute top-0 right-0 text-8xl opacity-10">📈</div>
              <div className="relative z-10">
                <div className="text-sm text-success-foreground mb-2 font-medium flex items-center gap-2">
                  Next Year Forecast
                  <span className="bg-success text-white text-xs px-2 py-0.5 rounded-full">GROWTH</span>
                </div>
                <div className="text-sm text-foreground/80 mb-1">Oct 2025 - Sep 2026</div>
                <div className="flex items-baseline gap-2 mb-3">
                  <div className="text-5xl font-bold text-success">{formatCurrency(selected.annual.personalIncome)}</div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Studios:</span>
                    <span className="font-semibold text-success">{selected.scenario.studios} studios</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Monthly Company Income:</span>
                    <span className="font-semibold text-success">{formatCurrency(selected.annual.avgMonthlyIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Profit per Studio:</span>
                    <span className="font-semibold text-success">₾{Math.round(selected.annual.profit / selected.scenario.studios / 12).toLocaleString()}/month</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-success/20">
                    <span className="text-foreground/60">Company Share (15%):</span>
                    <span className="font-medium text-success/70">₾{Math.round(selected.annual.personalIncome / selected.scenario.studios / 12)}/studio</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Metrics with Visual Bars */}
          <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-amber-50 to-success-50 dark:from-amber-950/20 dark:to-success-950/20 border-2 border-amber-200 dark:border-amber-800">
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              💰 Growth Breakdown
            </h4>
            
            <div className="space-y-4">
              {/* Annual Income Growth */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Annual Company Income</div>
                  <div className="text-right">
                    <div className="font-bold text-success text-lg">
                      +{formatCurrency(selected.annual.personalIncome - forecast.historicalCompanyIncome)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(((selected.annual.personalIncome - forecast.historicalCompanyIncome) / forecast.historicalCompanyIncome) * 100).toFixed(1)}% growth
                    </div>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-success-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((selected.annual.personalIncome / forecast.historicalCompanyIncome) * 100, 100)}%` }}>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatCurrency(forecast.historicalCompanyIncome)} (Last Year ACTUAL)</span>
                  <span>{formatCurrency(selected.annual.personalIncome)} (Forecast)</span>
                </div>
              </div>

              {/* Monthly Income Growth */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Monthly Company Income</div>
                  <div className="text-right">
                    <div className="font-bold text-success text-lg">
                      +{formatCurrency(selected.annual.avgMonthlyIncome - (forecast.historicalCompanyIncome / 12))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(((selected.annual.avgMonthlyIncome - (forecast.historicalCompanyIncome / 12)) / (forecast.historicalCompanyIncome / 12)) * 100).toFixed(1)}% growth
                    </div>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((selected.annual.avgMonthlyIncome / (forecast.historicalCompanyIncome / 12)) * 100, 100)}%` }}>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatCurrency(forecast.historicalCompanyIncome / 12)} (Last Year Avg ACTUAL)</span>
                  <span>{formatCurrency(selected.annual.avgMonthlyIncome)} (Forecast Avg)</span>
                </div>
              </div>

              {/* Studio Count Growth */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Portfolio Size</div>
                  <div className="text-right">
                    <div className="font-bold text-primary text-lg">
                      Growing to {selected.scenario.studios} studios
                    </div>
                    <div className="text-xs text-muted-foreground">
                      From 34-55 range (varied monthly)
                    </div>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-primary rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((selected.scenario.studios / 55) * 100, 100)}%` }}>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>34-55 studios (Last Year Range)</span>
                  <span>{selected.scenario.studios} studios (Forecast Stable)</span>
                </div>
              </div>
            </div>

            {/* Key Insight */}
            <div className="mt-4 p-4 rounded-lg bg-white/60 dark:bg-black/20 border border-amber-300 dark:border-amber-700">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✨</div>
                <div>
                  <div className="font-semibold text-sm mb-1">
                    {language === 'ka' ? 'მთავარი ინსაითი' : 'Key Insight'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {language === 'ka' 
                      ? `გასულ წელს (ოქტ 2024-სექ 2025) ცვლილებადი სტუდიოების რაოდენობით (34-55) კომპანიამ გამოიმუშავა ${formatCurrency(forecast.historicalCompanyIncome)} (თვეში საშუალოდ ${formatCurrency(forecast.historicalCompanyIncome / 12)}). ${selected.scenario.studios} სტაბილური სტუდიოთი მომდევნო წელს პროგნოზირებულია ${formatCurrency(selected.annual.avgMonthlyIncome)} თვეში (წელიწადში ${formatCurrency(selected.annual.personalIncome)}) - ეს არის ${(((selected.annual.personalIncome - forecast.historicalCompanyIncome) / forecast.historicalCompanyIncome) * 100).toFixed(0)}% ზრდა! სტაბილური პორტფოლიო + რეალისტური ხარჯების გაანგარიშება = პროგნოზირებადი შემოსავლის ზრდა.`
                      : `Last year (Oct 2024-Sep 2025) with varying studio count (34-55), company earned ${formatCurrency(forecast.historicalCompanyIncome)} (${formatCurrency(forecast.historicalCompanyIncome / 12)} monthly avg). With ${selected.scenario.studios} stable studios next year, forecast shows ${formatCurrency(selected.annual.avgMonthlyIncome)} monthly (${formatCurrency(selected.annual.personalIncome)} annually) - that's ${(((selected.annual.personalIncome - forecast.historicalCompanyIncome) / forecast.historicalCompanyIncome) * 100).toFixed(0)}% growth! Stable portfolio + realistic expense scaling = predictable income growth.`
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expense Structure Breakdown - Fixed vs Variable */}
          <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-blue-200 dark:border-blue-800">
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              💼 {language === 'ka' ? 'ხარჯების სტრუქტურა' : 'Expense Structure'}
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/70 dark:bg-black/30 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                  📊 {language === 'ka' ? 'ცვლადი ხარჯები (სტუდიო-პროპორციული)' : 'Variable Costs (Per-Studio)'}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-muted">
                    <span className="text-muted-foreground">{language === 'ka' ? 'კომუნალური' : 'Utilities'}:</span>
                    <span className="font-bold">{formatCurrency(selected.months.reduce((sum, m) => sum + (m.utilities || 0), 0) / 12)}/თვე</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{language === 'ka' ? 'დასუფთავება/ტექნიკური' : 'Cleaning/Technical'}:</span>
                    <span className="font-bold">{formatCurrency(selected.months.reduce((sum, m) => sum + (m.cleaningTechnical || 0), 0) / 12)}/თვე</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 italic">
                    * {language === 'ka' ? 'იზრდება პროპორციულად სტუდიოების რაოდენობასთან' : 'Scales proportionally with studio count'}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white/70 dark:bg-black/30 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
                  🔒 {language === 'ka' ? 'ფიქსირებული ხარჯები' : 'Fixed Costs'}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-muted">
                    <span className="text-muted-foreground">{language === 'ka' ? 'ხელფასები' : 'Salaries'}:</span>
                    <div className="text-right">
                      <span className="font-bold">{formatCurrency(forecast.avgSalaries * 1.20)}/თვე</span>
                      <div className="text-xs text-success">+20%</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{language === 'ka' ? 'მარკეტინგი' : 'Marketing'}:</span>
                    <div className="text-right">
                      <span className="font-bold">{formatCurrency(forecast.avgMarketing * 1.30)}/თვე</span>
                      <div className="text-xs text-success">+30%</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 italic">
                    * {language === 'ka' ? 'არ იზრდება სტუდიოების რაოდენობასთან' : 'Does not scale with studio count'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-700">
              <div className="text-xs text-muted-foreground">
                <strong>{language === 'ka' ? 'მნიშვნელოვანი:' : 'Important:'}</strong> {language === 'ka' 
                  ? 'ხელფასები და მარკეტინგი ფიქსირებული ხარჯებია - არ იზრდება პროპორციულად სტუდიოების რაოდენობასთან. მხოლოდ კომუნალური და დასუფთავება იზრდება per-studio საფუძველზე.'
                  : 'Salaries and Marketing are fixed costs - they do NOT scale proportionally with studio count. Only Utilities and Cleaning scale on a per-studio basis.'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary - Bank-Ready */}
      <Card className="border-2 border-primary/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Executive Summary
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {selected.scenario.name} • Key Performance Indicators
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Forecast Period</div>
              <div className="text-lg font-semibold">Oct 2025 - Sep 2026</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="relative p-5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-800 overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 text-6xl opacity-10">🏢</div>
              <div className="relative z-10">
                <div className="text-sm text-blue-700 dark:text-blue-300 mb-1 font-medium">Portfolio Size</div>
                <div className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-1">{selected.scenario.studios}</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  {selected.scenario.owned > 0 && `${selected.scenario.owned} owned + ${selected.scenario.studios - selected.scenario.owned} managed`}
                  {selected.scenario.owned === 0 && "All managed studios"}
                </div>
              </div>
            </div>

            <div className="relative p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-2 border-emerald-200 dark:border-emerald-800 overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 text-6xl opacity-10">💰</div>
              <div className="relative z-10">
                <div className="text-sm text-emerald-700 dark:text-emerald-300 mb-1 font-medium">Annual Revenue</div>
                <div className="text-4xl font-bold text-emerald-900 dark:text-emerald-100 mb-1">{formatCurrency(selected.annual.revenue)}</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">
                  Avg Occupancy: {selected.annual.avgOccupancy.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="relative p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-2 border-purple-200 dark:border-purple-800 overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 text-6xl opacity-10">📈</div>
              <div className="relative z-10">
                <div className="text-sm text-purple-700 dark:text-purple-300 mb-1 font-medium">Net Profit</div>
                <div className="text-4xl font-bold text-purple-900 dark:text-purple-100 mb-1">{formatCurrency(selected.annual.profit)}</div>
                <div className="text-xs text-purple-600 dark:text-purple-400">
                  Margin: {selected.annual.profitMargin.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="relative p-5 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-2 border-amber-200 dark:border-amber-800 overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 text-6xl opacity-10">⭐</div>
              <div className="relative z-10">
                <div className="text-sm text-amber-700 dark:text-amber-300 mb-1 font-medium">Monthly Income</div>
                <div className="text-4xl font-bold text-amber-900 dark:text-amber-100 mb-1">{formatCurrency(selected.annual.avgMonthlyIncome)}</div>
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  Annual: {formatCurrency(selected.annual.personalIncome)}
                </div>
              </div>
            </div>
          </div>

          {/* Key Assumptions */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Key Assumptions & Methodology
            </h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Historical Base</div>
                <div className="font-medium">Oct 2024 - Sep 2025 actual performance</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Occupancy & Pricing</div>
                <div className="font-medium">Same patterns as historical period</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Expense Scaling</div>
                <div className="font-medium">Realistic per-studio profit model</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Comparison - Visual & Impactful */}
      <Card className="border-2 border-primary/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-xl font-bold">Investment Scenarios Comparison</CardTitle>
          <CardDescription>Compare financial outcomes across different growth strategies</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {forecast.scenarioForecasts.map((sf, idx) => (
              <div
                key={sf.scenario.id}
                className={`relative overflow-hidden rounded-xl border-2 p-6 transition-all cursor-pointer ${
                  sf.scenario.id === selectedScenario 
                    ? 'border-primary bg-gradient-to-r from-primary/10 to-primary/5 shadow-lg scale-[1.02]' 
                    : 'border-border hover:border-primary/50 hover:shadow-md'
                }`}
                onClick={() => setSelectedScenario(sf.scenario.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        idx === 0 ? 'bg-blue-100 text-blue-700' :
                        idx === 1 ? 'bg-purple-100 text-purple-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{sf.scenario.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {sf.scenario.studios} studios
                          {sf.scenario.owned > 0 && ` (${sf.scenario.owned} owned + ${sf.scenario.studios - sf.scenario.owned} managed)`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Monthly Income</div>
                    <div className="text-3xl font-bold text-primary">
                      {formatCurrency(sf.annual.avgMonthlyIncome)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Annual: {formatCurrency(sf.annual.personalIncome)}
                    </div>
                  </div>
                </div>

                {/* Visual Metrics Bars */}
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Annual Revenue</div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${(sf.annual.revenue / Math.max(...forecast.scenarioForecasts.map(s => s.annual.revenue))) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm font-semibold">{formatCurrency(sf.annual.revenue)}</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Annual Expenses</div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
                        style={{ width: `${(sf.annual.expenses / Math.max(...forecast.scenarioForecasts.map(s => s.annual.expenses))) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm font-semibold">{formatCurrency(sf.annual.expenses)}</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Net Profit</div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${(sf.annual.profit / Math.max(...forecast.scenarioForecasts.map(s => s.annual.profit))) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm font-semibold text-success">{formatCurrency(sf.annual.profit)}</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Profit Margin</div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${sf.annual.profitMargin}%` }}
                      ></div>
                    </div>
                    <div className="text-sm font-semibold">{sf.annual.profitMargin.toFixed(1)}%</div>
                  </div>
                </div>

                {sf.scenario.id === selectedScenario && (
                  <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                    SELECTED
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Revenue & Profit Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue and Profit Forecast</CardTitle>
          <CardDescription>October 2025 - September 2026 (based on Oct 2024 - Sep 2025 patterns)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={selected.months}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                fill="hsl(var(--primary))"
                stroke="hsl(var(--primary))"
                fillOpacity={0.3}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                name="Net Profit"
              />
              <Line
                type="monotone"
                dataKey="personalIncome"
                stroke="hsl(var(--chart-3))"
                strokeWidth={3}
                strokeDasharray="5 5"
                name={selected.scenario.owned > 0 ? "Company Income" : "Company Share"}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Occupancy & ADR Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Occupancy % & Average Daily Rate</CardTitle>
          <CardDescription>Historical occupancy and pricing trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={selected.months}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" label={{ value: 'Occupancy %', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'ADR ₾', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="occupancy" fill="hsl(var(--chart-1))" name="Occupancy %" />
              <Line yAxisId="right" type="monotone" dataKey="adr" stroke="hsl(var(--chart-3))" strokeWidth={2} name="ADR ₾" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Scenario Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Comparison</CardTitle>
          <CardDescription>Compare annual metrics across all three scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forecast.scenarioForecasts.map(sf => (
              <div
                key={sf.scenario.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  sf.scenario.id === selectedScenario ? 'border-primary bg-primary/5 shadow-lg' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{sf.scenario.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {sf.scenario.studios} studios
                      {sf.scenario.owned > 0 && ` (${sf.scenario.owned} owned by company)`}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {formatCurrency(sf.annual.avgMonthlyIncome)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Monthly Income
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-4 text-sm mt-3 pt-3 border-t">
                  <div>
                    <div className="text-muted-foreground text-xs">Annual Revenue</div>
                    <div className="font-semibold">{formatCurrency(sf.annual.revenue)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Annual Expenses</div>
                    <div className="font-semibold">{formatCurrency(sf.annual.expenses)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Net Profit</div>
                    <div className="font-semibold text-success">{formatCurrency(sf.annual.profit)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Profit Margin</div>
                    <div className="font-semibold">{sf.annual.profitMargin.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Annual Income</div>
                    <div className="font-semibold text-primary">{formatCurrency(sf.annual.personalIncome)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Occupancy Sensitivity Analysis */}
      <Card className="border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📊</span>
            Occupancy Sensitivity Analysis
          </CardTitle>
          <CardDescription>
            Impact of ±5% occupancy change on profit and company income
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {forecast.sensitivityAnalysis.map((sa, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-muted">
                <h4 className="font-semibold text-sm mb-4">{sa.scenario.name}</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {sa.scenarios.map((s, sIdx) => (
                    <div 
                      key={sIdx} 
                      className={`p-4 rounded-lg ${
                        s.label === 'Base' 
                          ? 'bg-primary/10 border-2 border-primary' 
                          : 'bg-muted/50 border border-muted'
                      }`}
                    >
                      <div className="text-center mb-3">
                        <div className="text-xs text-muted-foreground">Occupancy</div>
                        <div className="text-2xl font-bold">{s.occupancy.toFixed(1)}%</div>
                        <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-muted-foreground">Revenue:</span>
                          <span className="font-semibold">{formatCurrency(s.revenue)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-muted-foreground">Profit:</span>
                          <div className="text-right">
                            <div className="font-semibold text-success">{formatCurrency(s.profit)}</div>
                            {s.label !== 'Base' && (
                              <div className={`text-xs ${s.profitChange > 0 ? 'text-success' : 'text-destructive'}`}>
                                {s.profitChange > 0 ? '+' : ''}{s.profitChange.toFixed(1)}%
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Company Income:</span>
                          <div className="text-right">
                            <div className="font-semibold text-primary">{formatCurrency(s.companyIncome)}</div>
                            {s.label !== 'Base' && (
                              <div className={`text-xs ${s.companyIncomeChange > 0 ? 'text-success' : 'text-destructive'}`}>
                                {s.companyIncomeChange > 0 ? '+' : ''}{s.companyIncomeChange.toFixed(1)}%
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expense Efficiency Comparison */}
      <Card className="border-2 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>💰</span>
            Expense Efficiency Comparison
          </CardTitle>
          <CardDescription>
            Per-studio cost analysis across different portfolio sizes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={forecast.efficiencyComparison}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="label" 
                  className="text-xs"
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  yAxisId="left"
                  className="text-xs"
                  tickFormatter={(value) => `₾${(value / 1000).toFixed(0)}K`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  className="text-xs"
                  tickFormatter={(value) => `₾${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="totalMonthly" fill="hsl(var(--primary))" name="Total Monthly Expenses" />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="perStudio" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={3}
                  name="Per-Studio Cost"
                  dot={{ fill: 'hsl(var(--destructive))', r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Detailed Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-primary">
                    <th className="text-left p-2 font-semibold">Portfolio Size</th>
                    <th className="text-right p-2 font-semibold">Total/Month</th>
                    <th className="text-right p-2 font-semibold">Per Studio</th>
                    <th className="text-right p-2 font-semibold">Utilities</th>
                    <th className="text-right p-2 font-semibold">Cleaning</th>
                    <th className="text-right p-2 font-semibold">Salaries</th>
                    <th className="text-right p-2 font-semibold">Marketing</th>
                    <th className="text-right p-2 font-semibold">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.efficiencyComparison.map((ec, idx) => (
                    <tr key={idx} className={`border-b hover:bg-muted/50 transition-colors ${ec.studios === 55 ? 'bg-primary/5 font-semibold' : ''}`}>
                      <td className="p-2">{ec.label}</td>
                      <td className="text-right p-2">{formatCurrency(ec.totalMonthly)}</td>
                      <td className="text-right p-2 font-bold text-primary">{formatCurrency(ec.perStudio)}</td>
                      <td className="text-right p-2 text-blue-600 dark:text-blue-400">{formatCurrency(ec.utilities)}</td>
                      <td className="text-right p-2 text-blue-600 dark:text-blue-400">{formatCurrency(ec.cleaning)}</td>
                      <td className="text-right p-2 text-purple-600 dark:text-purple-400">{formatCurrency(ec.salaries)}</td>
                      <td className="text-right p-2 text-purple-600 dark:text-purple-400">{formatCurrency(ec.marketing)}</td>
                      <td className="text-right p-2">
                        {ec.studios === 34 ? (
                          <span className="text-muted-foreground">Base</span>
                        ) : (
                          <span className="text-success font-semibold">
                            {ec.efficiencyGain.toFixed(1)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Key Insight */}
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-700">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div className="text-sm">
                  <div className="font-semibold mb-1">Economies of Scale</div>
                  <div className="text-muted-foreground">
                    As portfolio size increases, per-studio expenses decrease due to fixed costs (salaries, marketing) being spread across more units. 
                    At 70 studios, per-studio costs are {forecast.efficiencyComparison[2].efficiencyGain.toFixed(1)}% lower than at 34 studios, 
                    even though total expenses increase. This demonstrates the financial advantage of portfolio expansion.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Break-Even Analysis */}
      <Card className="border-2 border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🎯</span>
            Break-Even Analysis
          </CardTitle>
          <CardDescription>
            Minimum occupancy required to cover all expenses and safety margins
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Comparison Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={forecast.breakEvenAnalysis}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="scenario.name" 
                  className="text-xs"
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  className="text-xs"
                  label={{ value: 'Occupancy %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                />
                <Legend />
                <Bar 
                  dataKey="breakEvenOccupancy" 
                  fill="hsl(var(--destructive))" 
                  name="Break-Even Occupancy"
                />
                <Bar 
                  dataKey="currentOccupancy" 
                  fill="hsl(var(--chart-2))" 
                  name="Current Occupancy"
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Detailed Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {forecast.breakEvenAnalysis.map((be, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-lg border-2 transition-all ${
                    idx === selectedScenario 
                      ? 'border-primary bg-primary/5 shadow-lg' 
                      : 'border-muted bg-muted/20'
                  }`}
                >
                  <h4 className="font-semibold text-sm mb-4">{be.scenario.name}</h4>
                  
                  {/* Break-Even vs Current */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Break-Even Occupancy</div>
                      <div className="text-2xl font-bold text-destructive">
                        {be.breakEvenOccupancy.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {be.daysToBreakEven} days to cover expenses
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Current Occupancy</div>
                      <div className="text-2xl font-bold text-chart-2">
                        {be.currentOccupancy.toFixed(1)}%
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="text-xs text-muted-foreground mb-1">Safety Margin</div>
                      <div className="text-xl font-bold text-primary">
                        +{be.occupancyBuffer.toFixed(1)}%
                      </div>
                      <div className="text-xs text-chart-2 font-medium mt-1">
                        {be.bufferPercentage.toFixed(0)}% buffer above break-even
                      </div>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="space-y-2 pt-3 border-t text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fixed Costs/Year:</span>
                      <span className="font-semibold">{formatCurrency(be.annualFixedCosts)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Variable Cost/Night:</span>
                      <span className="font-semibold">{formatCurrency(be.variableCostPerNight)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg ADR:</span>
                      <span className="font-semibold">{formatCurrency(be.avgADR)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-muted-foreground">B/E Revenue:</span>
                      <span className="font-semibold text-destructive">{formatCurrency(be.breakEvenRevenue)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Key Insight */}
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-700">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🎯</div>
                <div className="text-sm">
                  <div className="font-semibold mb-1">Financial Safety Analysis</div>
                  <div className="text-muted-foreground">
                    {(() => {
                      const selectedBE = forecast.breakEvenAnalysis[selectedScenario];
                      return `With current occupancy at ${selectedBE.currentOccupancy.toFixed(1)}% and break-even at ${selectedBE.breakEvenOccupancy.toFixed(1)}%, the business maintains a healthy ${selectedBE.occupancyBuffer.toFixed(1)}% safety margin (${selectedBE.bufferPercentage.toFixed(0)}% buffer). This means expenses are covered in approximately ${selectedBE.daysToBreakEven} days per year, with the remaining ${365 - selectedBE.daysToBreakEven} days generating pure profit. Fixed costs of ${formatCurrency(selectedBE.annualFixedCosts)} per year must be covered regardless of occupancy levels.`;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What-If Scenario Builder */}
      <Card className="border-2 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            What-If Scenario Builder
          </CardTitle>
          <CardDescription>
            {language === 'ka' 
              ? 'შეცვალე occupancy, ADR და ხარჯები რომ დაუყოვნებლივ იხილო ეფექტი profit-სა და company income-ზე'
              : 'Adjust occupancy, ADR, and expenses to see immediate impact on profit and company income'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {whatIfResults && (
            <div className="space-y-6">
              {/* Controls */}
              <div className="grid md:grid-cols-3 gap-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700">
                {/* Occupancy Adjuster */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">
                      {language === 'ka' ? 'Occupancy %' : 'Occupancy %'}
                    </Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setWhatIfOccupancy(null)}
                      className="h-6 text-xs"
                    >
                      {language === 'ka' ? 'Reset' : 'Reset'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Slider
                      value={[whatIfOccupancy ?? whatIfResults.base.occupancy]}
                      onValueChange={(value) => setWhatIfOccupancy(value[0])}
                      min={30}
                      max={100}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={whatIfOccupancy ?? whatIfResults.base.occupancy}
                        onChange={(e) => setWhatIfOccupancy(parseFloat(e.target.value))}
                        min={30}
                        max={100}
                        step={0.5}
                        className="h-8"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {language === 'ka' ? 'საბაზო' : 'Base'}: {whatIfResults.base.occupancy.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* ADR Adjuster */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">
                      {language === 'ka' ? 'საშუალო ფასი (ADR)' : 'Average Daily Rate'}
                    </Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setWhatIfADR(null)}
                      className="h-6 text-xs"
                    >
                      {language === 'ka' ? 'Reset' : 'Reset'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Slider
                      value={[whatIfADR ?? whatIfResults.base.adr]}
                      onValueChange={(value) => setWhatIfADR(value[0])}
                      min={50}
                      max={300}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={whatIfADR ?? whatIfResults.base.adr}
                        onChange={(e) => setWhatIfADR(parseFloat(e.target.value))}
                        min={50}
                        max={300}
                        step={1}
                        className="h-8"
                      />
                      <span className="text-sm text-muted-foreground">₾</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {language === 'ka' ? 'საბაზო' : 'Base'}: ₾{Math.round(whatIfResults.base.adr)}
                    </div>
                  </div>
                </div>

                {/* Expense Multiplier */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">
                      {language === 'ka' ? 'ხარჯების კორექტირება' : 'Expense Adjustment'}
                    </Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setWhatIfExpenseMultiplier(100)}
                      className="h-6 text-xs"
                    >
                      {language === 'ka' ? 'Reset' : 'Reset'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Slider
                      value={[whatIfExpenseMultiplier]}
                      onValueChange={(value) => setWhatIfExpenseMultiplier(value[0])}
                      min={70}
                      max={130}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={whatIfExpenseMultiplier}
                        onChange={(e) => setWhatIfExpenseMultiplier(parseFloat(e.target.value))}
                        min={70}
                        max={130}
                        step={1}
                        className="h-8"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {language === 'ka' ? '100% = საბაზო დონე' : '100% = baseline'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reset All Button */}
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={resetWhatIf}
                  className="gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  {language === 'ka' ? 'ყველას დაბრუნება საბაზოზე' : 'Reset All to Baseline'}
                </Button>
              </div>

              {/* Results Comparison */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Baseline */}
                <div className="p-4 rounded-lg border-2 border-muted bg-muted/20">
                  <h4 className="font-semibold text-center mb-4 text-muted-foreground">
                    {language === 'ka' ? '📊 საბაზო სცენარი' : '📊 Baseline Scenario'}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm text-muted-foreground">
                        {language === 'ka' ? 'Occupancy:' : 'Occupancy:'}
                      </span>
                      <span className="font-semibold">{whatIfResults.base.occupancy.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm text-muted-foreground">ADR:</span>
                      <span className="font-semibold">{formatCurrency(whatIfResults.base.adr)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm text-muted-foreground">
                        {language === 'ka' ? 'შემოსავალი:' : 'Revenue:'}
                      </span>
                      <span className="font-semibold">{formatCurrency(whatIfResults.base.revenue)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm text-muted-foreground">
                        {language === 'ka' ? 'ხარჯები:' : 'Expenses:'}
                      </span>
                      <span className="font-semibold">{formatCurrency(whatIfResults.base.expenses)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm text-muted-foreground">
                        {language === 'ka' ? 'მოგება:' : 'Profit:'}
                      </span>
                      <span className="font-semibold text-chart-2">{formatCurrency(whatIfResults.base.profit)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm text-muted-foreground">
                        {language === 'ka' ? 'მოგების მარჟა:' : 'Profit Margin:'}
                      </span>
                      <span className="font-semibold">{whatIfResults.base.profitMargin.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t-2">
                      <span className="text-sm font-semibold">
                        {language === 'ka' ? 'კომპანიის შემოსავალი:' : 'Company Income:'}
                      </span>
                      <span className="font-bold text-lg text-primary">{formatCurrency(whatIfResults.base.companyIncome)}</span>
                    </div>
                  </div>
                </div>

                {/* Adjusted Scenario */}
                <div className="p-4 rounded-lg border-2 border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/30 shadow-lg">
                  <h4 className="font-semibold text-center mb-4 text-amber-700 dark:text-amber-400">
                    {language === 'ka' ? '🎯 What-If სცენარი' : '🎯 What-If Scenario'}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-amber-300 dark:border-amber-700">
                      <span className="text-sm text-muted-foreground">
                        {language === 'ka' ? 'Occupancy:' : 'Occupancy:'}
                      </span>
                      <span className="font-semibold">{whatIfResults.adjusted.occupancy.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-amber-300 dark:border-amber-700">
                      <span className="text-sm text-muted-foreground">ADR:</span>
                      <span className="font-semibold">{formatCurrency(whatIfResults.adjusted.adr)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-amber-300 dark:border-amber-700">
                      <span className="text-sm text-muted-foreground">
                        {language === 'ka' ? 'შემოსავალი:' : 'Revenue:'}
                      </span>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(whatIfResults.adjusted.revenue)}</div>
                        <div className={`text-xs ${whatIfResults.changes.revenue >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                          {whatIfResults.changes.revenue >= 0 ? '+' : ''}{whatIfResults.changes.revenue.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-amber-300 dark:border-amber-700">
                      <span className="text-sm text-muted-foreground">
                        {language === 'ka' ? 'ხარჯები:' : 'Expenses:'}
                      </span>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(whatIfResults.adjusted.expenses)}</div>
                        <div className={`text-xs ${whatIfResults.changes.expense <= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                          {whatIfResults.changes.expense >= 0 ? '+' : ''}{whatIfResults.changes.expense.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-amber-300 dark:border-amber-700">
                      <span className="text-sm text-muted-foreground">
                        {language === 'ka' ? 'მოგება:' : 'Profit:'}
                      </span>
                      <div className="text-right">
                        <div className={`font-semibold ${whatIfResults.adjusted.profit >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                          {formatCurrency(whatIfResults.adjusted.profit)}
                        </div>
                        <div className={`text-xs font-semibold ${whatIfResults.changes.profit >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                          {whatIfResults.changes.profit >= 0 ? '+' : ''}{formatCurrency(whatIfResults.changes.profit)} ({whatIfResults.changes.profitPercent.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-amber-300 dark:border-amber-700">
                      <span className="text-sm text-muted-foreground">
                        {language === 'ka' ? 'მოგების მარჟა:' : 'Profit Margin:'}
                      </span>
                      <span className="font-semibold">{whatIfResults.adjusted.profitMargin.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t-2 border-amber-400 dark:border-amber-600">
                      <span className="text-sm font-semibold">
                        {language === 'ka' ? 'კომპანიის შემოსავალი:' : 'Company Income:'}
                      </span>
                      <div className="text-right">
                        <div className="font-bold text-lg text-primary">{formatCurrency(whatIfResults.adjusted.companyIncome)}</div>
                        <div className={`text-sm font-semibold ${whatIfResults.changes.companyIncome >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                          {whatIfResults.changes.companyIncome >= 0 ? '+' : ''}{formatCurrency(whatIfResults.changes.companyIncome)} ({whatIfResults.changes.companyIncomePercent.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Impact Bars */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800">
                <h5 className="font-semibold mb-4 text-center">
                  {language === 'ka' ? '📈 ცვლილების ვიზუალური წარმოდგენა' : '📈 Visual Impact Representation'}
                </h5>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{language === 'ka' ? 'შემოსავლის ცვლილება' : 'Revenue Change'}</span>
                      <span className={`font-semibold ${whatIfResults.changes.revenue >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                        {whatIfResults.changes.revenue >= 0 ? '+' : ''}{whatIfResults.changes.revenue.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${whatIfResults.changes.revenue >= 0 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}
                        style={{ width: `${Math.min(Math.abs(whatIfResults.changes.revenue), 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{language === 'ka' ? 'მოგების ცვლილება' : 'Profit Change'}</span>
                      <span className={`font-semibold ${whatIfResults.changes.profitPercent >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                        {whatIfResults.changes.profitPercent >= 0 ? '+' : ''}{whatIfResults.changes.profitPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${whatIfResults.changes.profitPercent >= 0 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}
                        style={{ width: `${Math.min(Math.abs(whatIfResults.changes.profitPercent), 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{language === 'ka' ? 'კომპანიის შემოსავლის ცვლილება' : 'Company Income Change'}</span>
                      <span className={`font-semibold ${whatIfResults.changes.companyIncomePercent >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                        {whatIfResults.changes.companyIncomePercent >= 0 ? '+' : ''}{whatIfResults.changes.companyIncomePercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${whatIfResults.changes.companyIncomePercent >= 0 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}
                        style={{ width: `${Math.min(Math.abs(whatIfResults.changes.companyIncomePercent), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-sm">
                  <strong>{language === 'ka' ? '💡 მნიშვნელოვანი:' : '💡 Key Insight:'}</strong>{' '}
                  {language === 'ka' 
                    ? `${whatIfResults.changes.companyIncomePercent >= 0 ? 'გაზრდით' : 'შემცირდით'} კომპანიის წლიურ შემოსავალს ${formatCurrency(Math.abs(whatIfResults.changes.companyIncome))}-ით (${Math.abs(whatIfResults.changes.companyIncomePercent).toFixed(1)}%) შეცვლილი პარამეტრებით. ხარჯების კორექტირება არის ${whatIfExpenseMultiplier}% საბაზოსთან შედარებით.`
                    : `This adjustment ${whatIfResults.changes.companyIncomePercent >= 0 ? 'increases' : 'decreases'} annual company income by ${formatCurrency(Math.abs(whatIfResults.changes.companyIncome))} (${Math.abs(whatIfResults.changes.companyIncomePercent).toFixed(1)}%) with adjusted parameters. Expense adjustment is set at ${whatIfExpenseMultiplier}% of baseline.`
                  }
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Multi-Year Projection */}
      {multiYearProjection && (
        <Card className="border-2 border-indigo-200 dark:border-indigo-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {language === 'ka' ? 'მრავალწლიანი პროგნოზი' : 'Multi-Year Projection'}
                </CardTitle>
                <CardDescription>
                  {language === 'ka' 
                    ? `${projectionYears} წლის ფინანსური პროგნოზი სხვადასხვა ზრდის სცენარებით (2026-${2026 + projectionYears})`
                    : `${projectionYears}-year financial projection with different growth scenarios (2026-${2026 + projectionYears})`
                  }
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={exportMultiYearToPDF}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {language === 'ka' ? 'PDF' : 'PDF'}
                </Button>
                <Button
                  onClick={exportMultiYearToExcel}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {language === 'ka' ? 'Excel' : 'Excel'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Years Selector */}
              <div className="flex items-center justify-center gap-4">
                <Label className="font-semibold">
                  {language === 'ka' ? 'პროგნოზის პერიოდი:' : 'Projection Period:'}
                </Label>
                <div className="flex gap-2">
                  {[3, 4, 5].map(years => (
                    <Button
                      key={years}
                      variant={projectionYears === years ? "default" : "outline"}
                      size="sm"
                      onClick={() => setProjectionYears(years)}
                    >
                      {years} {language === 'ka' ? 'წელი' : 'Years'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Scenario Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {multiYearProjection.cumulativeIncome.map((item, idx) => {
                  const finalYear = item.years[item.years.length - 1];
                  const firstYear = item.years[0];
                  const totalGrowth = ((finalYear.companyIncome - firstYear.companyIncome) / firstYear.companyIncome) * 100;
                  
                  return (
                    <div 
                      key={idx}
                      className={`p-4 rounded-lg border-2 ${
                        item.scenario.color === 'blue' ? 'border-blue-300 bg-blue-50 dark:bg-blue-950/20' :
                        item.scenario.color === 'emerald' ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20' :
                        'border-purple-300 bg-purple-50 dark:bg-purple-950/20'
                      }`}
                    >
                      <h4 className="font-bold text-center mb-3">
                        {language === 'ka' ? item.scenario.nameKa : item.scenario.name}
                      </h4>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between pb-2 border-b">
                          <span className="text-muted-foreground">
                            {language === 'ka' ? 'Occupancy ზრდა:' : 'Occupancy Growth:'}
                          </span>
                          <span className="font-semibold">+{item.scenario.occupancyGrowth}%/წელი</span>
                        </div>
                        
                        <div className="flex justify-between pb-2 border-b">
                          <span className="text-muted-foreground">
                            {language === 'ka' ? 'ADR ზრდა:' : 'ADR Growth:'}
                          </span>
                          <span className="font-semibold">+{item.scenario.adrGrowth}%/წელი</span>
                        </div>
                        
                        <div className="flex justify-between pb-2 border-b">
                          <span className="text-muted-foreground">
                            {language === 'ka' ? 'სტუდიოს ზრდა:' : 'Studio Growth:'}
                          </span>
                          <span className="font-semibold">
                            {item.scenario.studioGrowth === 0 ? 
                              (language === 'ka' ? 'არ იზრდება' : 'No expansion') : 
                              `+${item.scenario.studioGrowth}/წელი`
                            }
                          </span>
                        </div>

                        <div className="pt-3 mt-3 border-t-2">
                          <div className="text-center mb-2">
                            <div className="text-xs text-muted-foreground mb-1">
                              {language === 'ka' ? `${projectionYears} წლის ჯამური შემოსავალი` : `${projectionYears}-Year Total Income`}
                            </div>
                            <div className="text-2xl font-bold text-primary">
                              {formatCurrency(item.total)}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">
                              {language === 'ka' ? `წლიური შემოსავალი ${2026 + projectionYears}-ში` : `Annual Income in ${2026 + projectionYears}`}
                            </div>
                            <div className="text-lg font-bold text-chart-2">
                              {formatCurrency(finalYear.companyIncome)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              ({totalGrowth > 0 ? '+' : ''}{totalGrowth.toFixed(0)}% vs {firstYear.year})
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Multi-Scenario Comparison Chart */}
              <div className="space-y-4">
                <h5 className="font-semibold text-center">
                  {language === 'ka' ? '📊 კომპანიის შემოსავლის პროგნოზი' : '📊 Company Income Projection'}
                </h5>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="year"
                      type="number"
                      domain={[2026, 2026 + projectionYears]}
                      ticks={Array.from({length: projectionYears + 1}, (_, i) => 2026 + i)}
                    />
                    <YAxis 
                      tickFormatter={(value) => `₾${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                    />
                    <Legend />
                    
                    {multiYearProjection.projections.map((proj, idx) => {
                      const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-4))'];
                      return (
                        <Line
                          key={idx}
                          data={proj.years}
                          type="monotone"
                          dataKey="companyIncome"
                          stroke={colors[idx]}
                          strokeWidth={3}
                          name={language === 'ka' ? proj.scenario.nameKa : proj.scenario.name}
                          dot={{ fill: colors[idx], r: 5 }}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue & Profit Trends */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Revenue Chart */}
                <div>
                  <h5 className="font-semibold text-center mb-3 text-sm">
                    {language === 'ka' ? 'შემოსავლის პროგნოზი' : 'Revenue Projection'}
                  </h5>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="year"
                        type="number"
                        domain={[2026, 2026 + projectionYears]}
                        ticks={Array.from({length: projectionYears + 1}, (_, i) => 2026 + i)}
                      />
                      <YAxis tickFormatter={(value) => `₾${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      
                      {multiYearProjection.projections.map((proj, idx) => {
                        const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-4))'];
                        return (
                          <Area
                            key={idx}
                            data={proj.years}
                            type="monotone"
                            dataKey="revenue"
                            fill={colors[idx]}
                            fillOpacity={0.3}
                            stroke={colors[idx]}
                            strokeWidth={2}
                          />
                        );
                      })}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Profit Chart */}
                <div>
                  <h5 className="font-semibold text-center mb-3 text-sm">
                    {language === 'ka' ? 'მოგების პროგნოზი' : 'Profit Projection'}
                  </h5>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="year"
                        type="number"
                        domain={[2026, 2026 + projectionYears]}
                        ticks={Array.from({length: projectionYears + 1}, (_, i) => 2026 + i)}
                      />
                      <YAxis tickFormatter={(value) => `₾${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      
                      {multiYearProjection.projections.map((proj, idx) => {
                        const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-4))'];
                        return (
                          <Area
                            key={idx}
                            data={proj.years}
                            type="monotone"
                            dataKey="profit"
                            fill={colors[idx]}
                            fillOpacity={0.3}
                            stroke={colors[idx]}
                            strokeWidth={2}
                          />
                        );
                      })}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detailed Year-by-Year Table */}
              <div className="space-y-4">
                <h5 className="font-semibold text-center">
                  {language === 'ka' ? '📋 წლიური დეტალური ანალიზი' : '📋 Year-by-Year Detailed Analysis'}
                </h5>
                
                {multiYearProjection.projections.map((proj, projIdx) => (
                  <div key={projIdx} className="overflow-x-auto">
                    <h6 className="font-semibold mb-2 text-sm">
                      {language === 'ka' ? proj.scenario.nameKa : proj.scenario.name}
                    </h6>
                    <table className="w-full text-xs border rounded-lg">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left font-semibold">{language === 'ka' ? 'წელი' : 'Year'}</th>
                          <th className="p-2 text-right font-semibold">{language === 'ka' ? 'სტუდიო' : 'Studios'}</th>
                          <th className="p-2 text-right font-semibold">Occ %</th>
                          <th className="p-2 text-right font-semibold">ADR</th>
                          <th className="p-2 text-right font-semibold">{language === 'ka' ? 'შემოსავალი' : 'Revenue'}</th>
                          <th className="p-2 text-right font-semibold">{language === 'ka' ? 'ხარჯები' : 'Expenses'}</th>
                          <th className="p-2 text-right font-semibold">{language === 'ka' ? 'მოგება' : 'Profit'}</th>
                          <th className="p-2 text-right font-semibold text-primary">{language === 'ka' ? 'კომპანია' : 'Company'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proj.years.map((year, yearIdx) => (
                          <tr key={yearIdx} className={`border-t hover:bg-muted/30 ${yearIdx === 0 ? 'bg-primary/5' : ''}`}>
                            <td className="p-2 font-semibold">{year.year}</td>
                            <td className="p-2 text-right">{year.studios}</td>
                            <td className="p-2 text-right">{year.occupancy}%</td>
                            <td className="p-2 text-right">₾{year.adr}</td>
                            <td className="p-2 text-right">{formatCurrency(year.revenue)}</td>
                            <td className="p-2 text-right">{formatCurrency(year.expenses)}</td>
                            <td className="p-2 text-right text-chart-2">{formatCurrency(year.profit)}</td>
                            <td className="p-2 text-right font-semibold text-primary">{formatCurrency(year.companyIncome)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>

              {/* Key Insights */}
              <Alert className="border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30">
                <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <AlertDescription className="text-sm">
                  <strong>{language === 'ka' ? '💡 სტრატეგიული ინსაითი:' : '💡 Strategic Insight:'}</strong>{' '}
                  {(() => {
                    const aggressive = multiYearProjection.cumulativeIncome[2];
                    const conservative = multiYearProjection.cumulativeIncome[0];
                    const difference = aggressive.total - conservative.total;
                    const percentDiff = ((difference / conservative.total) * 100).toFixed(0);
                    
                    return language === 'ka' 
                      ? `${projectionYears} წლის განმავლობაში, აგრესიული ზრდის სცენარი მოიტანს ${formatCurrency(difference)} (${percentDiff}%) მეტ შემოსავალს კონსერვატიულ სცენართან შედარებით. პორტფოლიოს გაფართოება და ფასების ოპტიმიზაცია გამოიწვევს ექსპონენციალურ ზრდას გრძელვადიან პერსპექტივაში.`
                      : `Over ${projectionYears} years, aggressive growth strategy generates ${formatCurrency(difference)} (${percentDiff}%) more income compared to conservative approach. Portfolio expansion combined with price optimization creates exponential long-term growth.`;
                  })()}
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
          <CardDescription>{selected.scenario.name} - Detailed monthly forecast</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-primary">
                  <th className="text-left p-2 font-semibold">Month</th>
                  <th className="text-right p-2 font-semibold">Studios</th>
                  <th className="text-right p-2 font-semibold">Occ %</th>
                  <th className="text-right p-2 font-semibold">ADR</th>
                  <th className="text-right p-2 font-semibold">Revenue</th>
                  <th className="text-right p-2 font-semibold">Expenses</th>
                  <th className="text-right p-2 font-semibold">Profit</th>
                  <th className="text-right p-2 font-semibold text-primary">
                    {selected.scenario.owned > 0 ? "Income" : "Company"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {selected.months.map((month, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-2 font-medium">{month.month}</td>
                    <td className="text-right p-2">{month.studios}</td>
                    <td className="text-right p-2">{month.occupancy.toFixed(1)}%</td>
                    <td className="text-right p-2">{formatCurrency(month.adr)}</td>
                    <td className="text-right p-2">{formatCurrency(month.revenue)}</td>
                    <td className="text-right p-2">{formatCurrency(month.expenses)}</td>
                    <td className="text-right p-2 font-semibold text-success">{formatCurrency(month.profit)}</td>
                    <td className="text-right p-2 font-semibold text-primary">
                      {formatCurrency(month.personalIncome)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-primary bg-primary/5 font-bold">
                  <td className="p-2">TOTAL</td>
                  <td className="text-right p-2">-</td>
                  <td className="text-right p-2">
                    {selected.annual.avgOccupancy.toFixed(1)}%
                  </td>
                  <td className="text-right p-2">
                    {formatCurrency(selected.annual.avgADR)}
                  </td>
                  <td className="text-right p-2">{formatCurrency(selected.annual.revenue)}</td>
                  <td className="text-right p-2">{formatCurrency(selected.annual.expenses)}</td>
                  <td className="text-right p-2 text-success">{formatCurrency(selected.annual.profit)}</td>
                  <td className="text-right p-2 text-primary">
                    {formatCurrency(selected.annual.personalIncome)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Expense Breakdown Table */}
      <Card className="border-2 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📊</span>
            {language === 'ka' ? 'თვიური ხარჯების დეტალური ანალიზი' : 'Monthly Expense Breakdown Analysis'}
          </CardTitle>
          <CardDescription>
            {language === 'ka' 
              ? 'ყოველი თვის ხარჯების კატეგორიები და მათი პროცენტული წილი' 
              : 'Detailed expense categories and percentages for each month'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-amber-500">
                  <th className="text-left p-3 font-bold bg-amber-50 dark:bg-amber-950/30">
                    {language === 'ka' ? 'თვე' : 'Month'}
                  </th>
                  <th className="text-right p-3 font-semibold bg-blue-50 dark:bg-blue-950/30">
                    {language === 'ka' ? 'კომუნალური' : 'Utilities'}
                  </th>
                  <th className="text-center p-3 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30">%</th>
                  <th className="text-right p-3 font-semibold bg-purple-50 dark:bg-purple-950/30">
                    {language === 'ka' ? 'ხელფასები' : 'Salaries'}
                  </th>
                  <th className="text-center p-3 text-xs text-muted-foreground bg-purple-50 dark:bg-purple-950/30">%</th>
                  <th className="text-right p-3 font-semibold bg-green-50 dark:bg-green-950/30">
                    {language === 'ka' ? 'დასუფთავება' : 'Cleaning'}
                  </th>
                  <th className="text-center p-3 text-xs text-muted-foreground bg-green-50 dark:bg-green-950/30">%</th>
                  <th className="text-right p-3 font-semibold bg-orange-50 dark:bg-orange-950/30">
                    {language === 'ka' ? 'მარკეტინგი' : 'Marketing'}
                  </th>
                  <th className="text-center p-3 text-xs text-muted-foreground bg-orange-50 dark:bg-orange-950/30">%</th>
                  <th className="text-right p-3 font-bold bg-amber-100 dark:bg-amber-900/30">
                    {language === 'ka' ? 'ჯამი' : 'Total'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {selected.months.map((month, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{month.month}</td>
                    <td className="text-right p-3 text-blue-700 dark:text-blue-400">
                      ₾{month.utilities.toLocaleString()}
                    </td>
                    <td className="text-center p-3 text-xs text-muted-foreground">
                      {((month.utilities / month.expenses) * 100).toFixed(1)}%
                    </td>
                    <td className="text-right p-3 text-purple-700 dark:text-purple-400">
                      ₾{month.salaries.toLocaleString()}
                    </td>
                    <td className="text-center p-3 text-xs text-muted-foreground">
                      {((month.salaries / month.expenses) * 100).toFixed(1)}%
                    </td>
                    <td className="text-right p-3 text-green-700 dark:text-green-400">
                      ₾{month.cleaningTechnical.toLocaleString()}
                    </td>
                    <td className="text-center p-3 text-xs text-muted-foreground">
                      {((month.cleaningTechnical / month.expenses) * 100).toFixed(1)}%
                    </td>
                    <td className="text-right p-3 text-orange-700 dark:text-orange-400">
                      ₾{month.marketing.toLocaleString()}
                    </td>
                    <td className="text-center p-3 text-xs text-muted-foreground">
                      {((month.marketing / month.expenses) * 100).toFixed(1)}%
                    </td>
                    <td className="text-right p-3 font-bold">
                      ₾{month.expenses.toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30 font-bold text-base">
                  <td className="p-3">{language === 'ka' ? 'საშუალო' : 'AVERAGE'}</td>
                  <td className="text-right p-3 text-blue-700 dark:text-blue-400">
                    ₾{Math.round(selected.months.reduce((sum, m) => sum + m.utilities, 0) / 12).toLocaleString()}
                  </td>
                  <td className="text-center p-3 text-xs">
                    {((selected.months.reduce((sum, m) => sum + m.utilities, 0) / selected.annual.expenses) * 100).toFixed(1)}%
                  </td>
                  <td className="text-right p-3 text-purple-700 dark:text-purple-400">
                    ₾{Math.round(selected.months.reduce((sum, m) => sum + m.salaries, 0) / 12).toLocaleString()}
                  </td>
                  <td className="text-center p-3 text-xs">
                    {((selected.months.reduce((sum, m) => sum + m.salaries, 0) / selected.annual.expenses) * 100).toFixed(1)}%
                  </td>
                  <td className="text-right p-3 text-green-700 dark:text-green-400">
                    ₾{Math.round(selected.months.reduce((sum, m) => sum + m.cleaningTechnical, 0) / 12).toLocaleString()}
                  </td>
                  <td className="text-center p-3 text-xs">
                    {((selected.months.reduce((sum, m) => sum + m.cleaningTechnical, 0) / selected.annual.expenses) * 100).toFixed(1)}%
                  </td>
                  <td className="text-right p-3 text-orange-700 dark:text-orange-400">
                    ₾{Math.round(selected.months.reduce((sum, m) => sum + m.marketing, 0) / 12).toLocaleString()}
                  </td>
                  <td className="text-center p-3 text-xs">
                    {((selected.months.reduce((sum, m) => sum + m.marketing, 0) / selected.annual.expenses) * 100).toFixed(1)}%
                  </td>
                  <td className="text-right p-3">
                    ₾{Math.round(selected.annual.expenses / 12).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Insights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <div className="text-xs text-muted-foreground mb-1">
                {language === 'ka' ? 'კომუნალური (ცვლადი)' : 'Utilities (Variable)'}
              </div>
              <div className="font-bold text-blue-700 dark:text-blue-400">
                {((selected.months.reduce((sum, m) => sum + m.utilities, 0) / selected.annual.expenses) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ₾{Math.round(selected.months.reduce((sum, m) => sum + m.utilities, 0) / 12).toLocaleString()}/თვე
              </div>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
              <div className="text-xs text-muted-foreground mb-1">
                {language === 'ka' ? 'ხელფასები (ფიქსირებული)' : 'Salaries (Fixed)'}
              </div>
              <div className="font-bold text-purple-700 dark:text-purple-400">
                {((selected.months.reduce((sum, m) => sum + m.salaries, 0) / selected.annual.expenses) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ₾{Math.round(selected.months.reduce((sum, m) => sum + m.salaries, 0) / 12).toLocaleString()}/თვე
              </div>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <div className="text-xs text-muted-foreground mb-1">
                {language === 'ka' ? 'დასუფთავება (ცვლადი)' : 'Cleaning (Variable)'}
              </div>
              <div className="font-bold text-green-700 dark:text-green-400">
                {((selected.months.reduce((sum, m) => sum + m.cleaningTechnical, 0) / selected.annual.expenses) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ₾{Math.round(selected.months.reduce((sum, m) => sum + m.cleaningTechnical, 0) / 12).toLocaleString()}/თვე
              </div>
            </div>
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
              <div className="text-xs text-muted-foreground mb-1">
                {language === 'ka' ? 'მარკეტინგი (ფიქსირებული)' : 'Marketing (Fixed)'}
              </div>
              <div className="font-bold text-orange-700 dark:text-orange-400">
                {((selected.months.reduce((sum, m) => sum + m.marketing, 0) / selected.annual.expenses) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ₾{Math.round(selected.months.reduce((sum, m) => sum + m.marketing, 0) / 12).toLocaleString()}/თვე
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Comprehensive 12-Month Side-by-Side Comparison */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Full Year Comparison: 2024-2025 vs 2025-2026</CardTitle>
          <CardDescription>Complete month-by-month analysis with detailed expense breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-primary">
                  <th className="sticky left-0 bg-background p-2 text-left font-bold z-10" rowSpan={2}>Month</th>
                  <th className="p-2 text-center border-x" colSpan={3}>Studios & KPIs</th>
                  <th className="p-2 text-center border-x" colSpan={3}>Revenue</th>
                  <th className="p-2 text-center border-x" colSpan={6}>Expenses Breakdown</th>
                  <th className="p-2 text-center border-x" colSpan={3}>Profit</th>
                </tr>
                <tr className="border-b text-[10px] text-muted-foreground bg-muted/30">
                  <th className="p-1 border-l">Studios</th>
                  <th className="p-1">Occ%</th>
                  <th className="p-1 border-r">ADR</th>
                  <th className="p-1 border-l">2024-25</th>
                  <th className="p-1">2025-26</th>
                  <th className="p-1 border-r">Growth</th>
                  <th className="p-1 border-l">Utilities</th>
                  <th className="p-1">Salaries</th>
                  <th className="p-1">Clean/Tech</th>
                  <th className="p-1">Marketing</th>
                  <th className="p-1">Total 24-25</th>
                  <th className="p-1 border-r">Total 25-26</th>
                  <th className="p-1 border-l">2024-25</th>
                  <th className="p-1">2025-26</th>
                  <th className="p-1 border-r">Growth</th>
                </tr>
              </thead>
              <tbody>
                {selected.months.map((month, idx) => {
                  const revenueGrowth = ((month.revenue - month.historicalRevenue) / month.historicalRevenue) * 100;
                  const profitGrowth = ((month.profit - month.historicalProfit) / month.historicalProfit) * 100;
                  
                  return (
                    <tr key={idx} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="sticky left-0 bg-background p-2 font-semibold z-10">{month.month}</td>
                      
                      {/* Studios & KPIs */}
                      <td className="text-center p-1 border-l">
                        <div className="text-muted-foreground text-[10px]">{month.historicalStudios}</div>
                        <div className="font-semibold text-primary">{month.studios}</div>
                      </td>
                      <td className="text-center p-1">{month.occupancy.toFixed(0)}%</td>
                      <td className="text-right p-1 border-r">{formatCurrency(month.adr)}</td>
                      
                      {/* Revenue */}
                      <td className="text-right p-1 border-l text-muted-foreground">{formatCurrency(month.historicalRevenue)}</td>
                      <td className="text-right p-1 font-semibold">{formatCurrency(month.revenue)}</td>
                      <td className="text-right p-1 border-r">
                        <span className="text-success text-[10px]">+{revenueGrowth.toFixed(0)}%</span>
                      </td>
                      
                      {/* Expenses Breakdown */}
                      <td className="text-right p-1 border-l">
                        <div className="text-muted-foreground text-[10px]">{formatCurrency(month.historicalUtilities)}</div>
                        <div className="font-medium">{formatCurrency(month.utilities)}</div>
                      </td>
                      <td className="text-right p-1">
                        <div className="text-muted-foreground text-[10px]">{formatCurrency(month.historicalSalaries)}</div>
                        <div className="font-medium">{formatCurrency(month.salaries)}</div>
                      </td>
                      <td className="text-right p-1">
                        <div className="text-muted-foreground text-[10px]">{formatCurrency(month.historicalCleaning)}</div>
                        <div className="font-medium">{formatCurrency(month.cleaningTechnical)}</div>
                      </td>
                      <td className="text-right p-1">
                        <div className="text-muted-foreground text-[10px]">{formatCurrency(month.historicalMarketing)}</div>
                        <div className="font-medium">{formatCurrency(month.marketing)}</div>
                      </td>
                      <td className="text-right p-1 text-muted-foreground">{formatCurrency(month.historicalExpenses)}</td>
                      <td className="text-right p-1 border-r font-semibold">{formatCurrency(month.expenses)}</td>
                      
                      {/* Profit */}
                      <td className="text-right p-1 border-l text-muted-foreground">{formatCurrency(month.historicalProfit)}</td>
                      <td className="text-right p-1 font-bold text-success">{formatCurrency(month.profit)}</td>
                      <td className="text-right p-1 border-r">
                        <span className="text-success text-[10px]">+{profitGrowth.toFixed(0)}%</span>
                      </td>
                    </tr>
                  );
                })}
                
                {/* Annual Totals */}
                <tr className="border-t-2 border-primary bg-primary/10 font-bold">
                  <td className="sticky left-0 bg-primary/10 p-2 z-10">ANNUAL</td>
                  <td className="text-center p-1 border-l">-</td>
                  <td className="text-center p-1">{selected.annual.avgOccupancy.toFixed(0)}%</td>
                  <td className="text-right p-1 border-r">{formatCurrency(selected.annual.avgADR)}</td>
                  
                  <td className="text-right p-1 border-l">
                    {formatCurrency(selected.months.reduce((sum, m) => sum + m.historicalRevenue, 0))}
                  </td>
                  <td className="text-right p-1">{formatCurrency(selected.annual.revenue)}</td>
                  <td className="text-right p-1 border-r text-success text-xs">
                    +{(((selected.annual.revenue - selected.months.reduce((sum, m) => sum + m.historicalRevenue, 0)) / selected.months.reduce((sum, m) => sum + m.historicalRevenue, 0)) * 100).toFixed(0)}%
                  </td>
                  
                  <td className="text-right p-1 border-l">{formatCurrency(selected.months.reduce((sum, m) => sum + m.utilities, 0))}</td>
                  <td className="text-right p-1">{formatCurrency(selected.months.reduce((sum, m) => sum + m.salaries, 0))}</td>
                  <td className="text-right p-1">{formatCurrency(selected.months.reduce((sum, m) => sum + m.cleaningTechnical, 0))}</td>
                  <td className="text-right p-1">{formatCurrency(selected.months.reduce((sum, m) => sum + m.marketing, 0))}</td>
                  <td className="text-right p-1">
                    {formatCurrency(selected.months.reduce((sum, m) => sum + m.historicalExpenses, 0))}
                  </td>
                  <td className="text-right p-1 border-r">{formatCurrency(selected.annual.expenses)}</td>
                  
                  <td className="text-right p-1 border-l">
                    {formatCurrency(selected.months.reduce((sum, m) => sum + m.historicalProfit, 0))}
                  </td>
                  <td className="text-right p-1 text-success">{formatCurrency(selected.annual.profit)}</td>
                  <td className="text-right p-1 border-r text-success text-xs">
                    +{(((selected.annual.profit - selected.months.reduce((sum, m) => sum + m.historicalProfit, 0)) / selected.months.reduce((sum, m) => sum + m.historicalProfit, 0)) * 100).toFixed(0)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Expense Analysis Insights */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <div className="text-xs text-muted-foreground mb-1">💡 Utilities (კომუნალურები)</div>
              <div className="text-sm font-semibold">Per studio × {selected.scenario.studios}</div>
              <div className="text-xs text-muted-foreground mt-1">Electricity & Water only</div>
            </div>
            
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <div className="text-xs text-muted-foreground mb-1">👥 Salaries (ხელფასი)</div>
              <div className="text-sm font-semibold">+20% Growth</div>
              <div className="text-xs text-muted-foreground mt-1">Planned salary increases</div>
            </div>
            
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <div className="text-xs text-muted-foreground mb-1">🧹 Cleaning/Technical</div>
              <div className="text-sm font-semibold">Efficiency gains</div>
              <div className="text-xs text-muted-foreground mt-1">10% per-studio savings on scale</div>
            </div>
            
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
              <div className="text-xs text-muted-foreground mb-1">📢 Marketing</div>
              <div className="text-sm font-semibold">+30% Investment</div>
              <div className="text-xs text-muted-foreground mt-1">Growth-focused spending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Realistic Expense Forecasting:</strong> This forecast uses category-based expense scaling for accuracy:
          • <strong>Utilities</strong> (electricity & water): Scales per studio based on historical average
          • <strong>Salaries</strong>: +20% increase to account for growth and inflation
          • <strong>Cleaning/Technical</strong>: Scales with 10% efficiency gains from economies of scale
          • <strong>Marketing</strong>: +30% increase to support expansion strategy
        </AlertDescription>
      </Alert>
    </div>
  );
};
