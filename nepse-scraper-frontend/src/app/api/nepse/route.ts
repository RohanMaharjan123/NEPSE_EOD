import {NextResponse} from 'next/server';
import {
  MarketData,
  NEPSEIndexData,
  MarketSummaryItem,
  StockItem,
  StockData
} from '@/lib/types';


// Multiple API sources for comprehensive data
const API_ENDPOINTS = {
  marketSummary: 'https://nepalstock.onrender.com/market-summary',
  topGainers: 'https://nepalstock.onrender.com/top-ten/top-gainer?all=true',
  topLosers: 'https://nepalstock.onrender.com/top-ten/top-loser?all=true',
  turnover: 'https://nepalstock.onrender.com/top-ten/turnover?all=true',
  trades: 'https://nepalstock.onrender.com/top-ten/trade?all=true',
  transactions: 'https://nepalstock.onrender.com/top-ten/transaction?all=true',
  nepseIndex: 'https://nepalstock.onrender.com/nepse-index'
};

// Fallback data in case all APIs fail
const FALLBACK_DATA = {
  nepseIndex: {
    value: '2,845.67',
    change: '+15.23',
    changePercent: '+0.54%'
  },
  subindices: {
    'Banking': { value: '3,245.12', change: '+12.45', changePercent: '+0.38%' },
    'Hotels and Tourism': { value: '2,156.89', change: '-8.76', changePercent: '-0.41%' },
    'Hydropower': { value: '2,987.34', change: '+21.67', changePercent: '+0.73%' },
    'Finance': { value: '2,734.56', change: '+5.43', changePercent: '+0.20%' },
    'Manufacturing': { value: '4,123.78', change: '-15.32', changePercent: '-0.37%' },
    'Microfinance': { value: '3,567.90', change: '+18.45', changePercent: '+0.52%' }
  },
  topGainers: [
    { symbol: 'NABIL', ltp: 1284.50, change: 45.30, changePercent: 3.66 },
    { symbol: 'SCB', ltp: 428.90, change: 15.20, changePercent: 3.67 },
    { symbol: 'HBL', ltp: 635.80, change: 22.40, changePercent: 3.65 },
    { symbol: 'EBL', ltp: 789.60, change: 28.70, changePercent: 3.77 },
    { symbol: 'BOKL', ltp: 345.20, change: 12.30, changePercent: 3.69 }
  ],
  topLosers: [
    { symbol: 'UPPER', ltp: 612.30, change: -23.40, changePercent: -3.68 },
    { symbol: 'CHCL', ltp: 534.70, change: -19.80, changePercent: -3.57 },
    { symbol: 'AKPL', ltp: 423.90, change: -15.60, changePercent: -3.55 },
    { symbol: 'SHIVM', ltp: 1789.20, change: -65.40, changePercent: -3.53 },
    { symbol: 'API', ltp: 567.80, change: -20.70, changePercent: -3.52 }
  ],
  marketSummary: {
    totalTradedVolume: 'Rs. 4,567.89 Cr',
    totalTradedValue: 'Rs. 8,234.56 Cr',
    totalTransactions: '45,678',
    companiesAdvanced: '123',
    companiesDeclined: '87',
    companiesUnchanged: '45',
    totalListedCompanies: '255'
  },
  lastUpdated: new Date().toISOString()
};

// --- Utility Functions ---
const formatChange = (value: number, suffix: string = ''): string => {
  const formattedValue = value.toFixed(2);
  return value > 0 ? `+${formattedValue}${suffix}` : `${formattedValue}${suffix}`;
};

// Function to fetch data from a specific endpoint
const fetchFromEndpoint = async (url: string, endpointName: string) => {
  try {
    console.log(`Fetching ${endpointName}: ${url}`);
    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 1 minute
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const text = await response.text();
    
    // Check if response is HTML (error page)
    if (text.trim().startsWith('<')) {
      throw new Error('Received HTML instead of JSON');
    }
    
    const data = JSON.parse(text);
    console.log(`✅ Success with ${endpointName}`);
    return data;
    
  } catch (error) {
    console.log(`❌ ${endpointName} failed:`, error);
    throw error;
  }
};

// --- Data Processing Functions ---

const processNepseIndexData = (data: NEPSEIndexData[]) => {
  let nepseIndex = { value: 'N/A', change: 'N/A', changePercent: 'N/A' };
  const subindices: MarketData['subindices'] = {};

  const mainIndex = data.find(item => item.index === 'NEPSE Index');
  if (mainIndex) {
    nepseIndex = {
      value: mainIndex.currentValue.toFixed(2),
      change: formatChange(mainIndex.change),
      changePercent: formatChange(mainIndex.perChange, '%')
    };
  }

  data.forEach(item => {
    if (item.index !== 'NEPSE Index') {
      subindices[item.index] = {
        value: item.currentValue.toFixed(2),
        change: formatChange(item.change),
        changePercent: formatChange(item.perChange, '%')
      };
    }
  });

  return { nepseIndex, subindices };
};

const processTopMoversData = (data: StockItem[]): StockData[] => {
  return data.slice(0, 10).map(stock => ({
    symbol: stock.symbol,
    ltp: stock.ltp,
    change: stock.pointChange,
    changePercent: stock.percentageChange,
  }));
};

const processMarketSummaryData = (data: MarketSummaryItem[], topGainers: StockData[], topLosers: StockData[]) => {
  const summary: MarketData['marketSummary'] = {
    totalTradedVolume: 'N/A',
    totalTradedValue: 'N/A',
    totalTransactions: 'N/A',
    companiesAdvanced: topGainers.length.toString(),
    companiesDeclined: topLosers.length.toString(),
    companiesUnchanged: '0', // This info is not in the summary API
    totalListedCompanies: 'N/A'
  };

  data.forEach(item => {
    switch (item.detail) {
      case 'Total Turnover Rs:':
        summary.totalTradedValue = `Rs. ${(item.value / 10000000).toFixed(2)} Cr`;
        break;
      case 'Total Traded Volume:':
        summary.totalTradedVolume = item.value.toLocaleString();
        break;
      case 'Total Transactions':
        summary.totalTransactions = item.value.toLocaleString();
        break;
      case 'Total Scrips Traded':
        summary.totalListedCompanies = item.value.toString();
        break;
      case 'Advanced':
        summary.companiesAdvanced = item.value.toString();
        break;
      case 'Declined':
        summary.companiesDeclined = item.value.toString();
        break;
    }
  });
  return summary;
};

export const GET = async () => {
  try {
    // Fetch data from multiple endpoints in parallel
    const [marketSummaryData, topGainersData, topLosersData, nepseIndexData] = await Promise.allSettled([
      fetchFromEndpoint(API_ENDPOINTS.marketSummary, 'Market Summary'),
      fetchFromEndpoint(API_ENDPOINTS.topGainers, 'Top Gainers'),
      fetchFromEndpoint(API_ENDPOINTS.topLosers, 'Top Losers'),
      fetchFromEndpoint(API_ENDPOINTS.nepseIndex, 'NEPSE Index')
    ]);

    // Process NEPSE Index data
    let nepseIndex = { value: 'N/A', change: 'N/A', changePercent: 'N/A' };
    let subindices: Record<string, { value: string; change?: string; changePercent?: string }> = {};

    if (nepseIndexData.status === 'fulfilled') {
      const processedIndexData = processNepseIndexData(nepseIndexData.value);
      nepseIndex = processedIndexData.nepseIndex;
      subindices = processedIndexData.subindices;
    }

    // Process Top Gainers
    let topGainers: StockData[] = [];
    if (topGainersData.status === 'fulfilled') {
      topGainers = processTopMoversData(topGainersData.value);
    }

    // Process Top Losers
    let topLosers: StockData[] = [];
    if (topLosersData.status === 'fulfilled') {
      topLosers = processTopMoversData(topLosersData.value);
    }

    // Process Market Summary
    let marketSummary = {
      totalTradedVolume: 'N/A',
      totalTradedValue: 'N/A',
      totalTransactions: 'N/A',
      companiesAdvanced: topGainers.length.toString(),
      companiesDeclined: topLosers.length.toString(),
      companiesUnchanged: '0',
      totalListedCompanies: (topGainers.length + topLosers.length).toString()
    };

    if (marketSummaryData.status === 'fulfilled') {
      marketSummary = processMarketSummaryData(marketSummaryData.value, topGainers, topLosers);
    }

    const data: MarketData = {
      nepseIndex,
      subindices,
      topGainers,
      topLosers,
      marketSummary,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(data);

  } catch (error) {
    console.error('API error:', error);
    
    // Return fallback data with warning
    return NextResponse.json({
      ...FALLBACK_DATA,
      warning: 'Using demo data - API endpoints unavailable',
      lastError: error instanceof Error ? error.message : 'API fetch failed'
    });
  }
};
