export interface StockData {
  symbol: string;
  ltp: number;
  change: number;
  changePercent: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
}

export interface MarketData {
  nepseIndex: {
    value: string;
    change: string;
    changePercent: string;
  };
  subindices: Record<string, {
    value: string;
    change?: string;
    changePercent?: string;
  }>;
  topGainers: StockData[];
  topLosers: StockData[];
  marketSummary: {
    totalTradedVolume: string;
    totalTradedValue: string;
    totalTransactions: string;
    companiesAdvanced: string;
    companiesDeclined: string;
    companiesUnchanged: string;
    totalListedCompanies: string;
  };
  lastUpdated: string;
  warning?: string;
  lastError?: string;
}

// Interfaces for raw NEPSE API responses
export interface NEPSEIndexData {
  id: number;
  index: string;
  close: number;
  high: number;
  low: number;
  previousClose: number;
  change: number;
  perChange: number;
  currentValue: number;
}

export interface MarketSummaryItem {
  detail: string;
  value: number;
}

export interface StockItem {
  symbol: string;
  ltp: number;
  cp: number;
  pointChange: number;
  percentageChange: number;
  securityName: string;
  securityId: number;
}