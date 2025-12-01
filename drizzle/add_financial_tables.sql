-- Financial Data Tables for ORBI City

-- Monthly Financial Data
CREATE TABLE IF NOT EXISTS monthly_financials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  month VARCHAR(50) NOT NULL,
  year INT NOT NULL,
  studios INT NOT NULL,
  days_available INT NOT NULL,
  days_occupied INT NOT NULL,
  occupancy_percent DECIMAL(5,2) NOT NULL,
  avg_price DECIMAL(10,2) NOT NULL,
  total_revenue DECIMAL(12,2) NOT NULL,
  cleaning_tech DECIMAL(10,2) NOT NULL,
  marketing DECIMAL(10,2) NOT NULL,
  salaries DECIMAL(10,2) NOT NULL,
  utilities DECIMAL(10,2) NOT NULL,
  total_expenses DECIMAL(12,2) NOT NULL,
  total_profit DECIMAL(12,2) NOT NULL,
  company_profit DECIMAL(12,2) NOT NULL,
  owners_profit DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_month_year (month, year)
);

-- Financial Summary
CREATE TABLE IF NOT EXISTS financial_summary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue DECIMAL(12,2) NOT NULL,
  total_expenses DECIMAL(12,2) NOT NULL,
  total_profit DECIMAL(12,2) NOT NULL,
  company_profit DECIMAL(12,2) NOT NULL,
  owners_profit DECIMAL(12,2) NOT NULL,
  profit_margin DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Revenue Analysis
CREATE TABLE IF NOT EXISTS revenue_analysis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  month VARCHAR(50) NOT NULL,
  year INT NOT NULL,
  total_revenue DECIMAL(12,2) NOT NULL,
  avg_price DECIMAL(10,2) NOT NULL,
  occupancy_percent DECIMAL(5,2) NOT NULL,
  days_occupied INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_month_year_revenue (month, year)
);

-- Expense Breakdown
CREATE TABLE IF NOT EXISTS expense_breakdown (
  id INT AUTO_INCREMENT PRIMARY KEY,
  month VARCHAR(50) NOT NULL,
  year INT NOT NULL,
  cleaning_tech DECIMAL(10,2) NOT NULL,
  marketing DECIMAL(10,2) NOT NULL,
  salaries DECIMAL(10,2) NOT NULL,
  utilities DECIMAL(10,2) NOT NULL,
  total_expenses DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_month_year_expense (month, year)
);
