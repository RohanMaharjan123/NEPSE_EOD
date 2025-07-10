'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, RefreshCw } from 'lucide-react';

interface StockData {
  symbol: string;
  price?: number;
  change: number;
  changePercent: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
  ltp: number;
}

interface NepseData {
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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const [data, setData] = useState<NepseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/nepse');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch data');
      }
      const result: NepseData = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) {
      return 'N/A';
    }
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatChange = (change: number) => {
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change.toFixed(2)}`;
  };

  const formatPercent = (percent: number) => {
    const prefix = percent > 0 ? '+' : '';
    return `${prefix}${percent.toFixed(2)}%`;
  };

  const getChangeColor = (value: number | string) => {
    if (typeof value === 'string') {
      return value.startsWith('-') ? 'text-red-600' : 'text-green-600';
    }
    return value < 0 ? 'text-red-600' : 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl border">
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-2">Loading NEPSE Data</div>
          <div className="text-gray-600">Fetching latest market information...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl border border-red-200 max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">⚠️</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</div>
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={fetchData} 
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-blue-600 mb-2">
            NEPSE EOD Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Real-time Nepal Stock Exchange Data</p>
          {data?.lastUpdated && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">
                Last updated: {new Date(data.lastUpdated).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Warning */}
        {data?.warning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚠️</span>
              <div>
                <p className="text-yellow-800 font-semibold">Using Demo Data</p>
                <p className="text-yellow-700 text-sm">{data.warning}</p>
              </div>
            </div>
          </div>
        )}

        {/* Market Summary Cards */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Market Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* NEPSE Index Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">NEPSE Index</CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.nepseIndex.value || 'N/A'}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-sm font-medium ${getChangeColor(data?.nepseIndex.change || '0')}`}>
                    {data?.nepseIndex.change || 'N/A'}
                  </span>
                  <Badge 
                    variant={data?.nepseIndex.changePercent?.startsWith('-') ? 'destructive' : 'default'}
                    className={data?.nepseIndex.changePercent?.startsWith('-') ? '' : 'bg-green-100 text-green-800'}
                  >
                    {data?.nepseIndex.changePercent || 'N/A'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Volume Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Volume</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.marketSummary.totalTradedVolume?.replace(/Rs\.?\s*/i, '') || 'N/A'}
                </div>
                <p className="text-xs text-gray-500 mt-2">Turnover</p>
              </CardContent>
            </Card>

            {/* Transactions Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <RefreshCw className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.marketSummary.totalTransactions || 'N/A'}
                </div>
                <p className="text-xs text-gray-500 mt-2">Total Trades</p>
              </CardContent>
            </Card>

            {/* Companies Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Companies</CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.marketSummary.totalListedCompanies || 'N/A'}
                </div>
                <div className="flex gap-2 text-xs mt-2">
                  <span className="text-green-600">↑{data?.marketSummary.companiesAdvanced || '0'}</span>
                  <span className="text-red-600">↓{data?.marketSummary.companiesDeclined || '0'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gainers and Losers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Top Gainers */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-green-600 text-white p-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top 10 Gainers
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {data?.topGainers?.slice(0, 10).map((stock, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-900">{stock.symbol}</div>
                      <div className="text-xs text-gray-500">Rank #{index + 1}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-gray-900">
                        {formatNumber(stock.price || stock.ltp)}
                      </div>
                      <div className="flex items-center gap-2 justify-end text-sm">
                        <span className="font-mono text-green-600">
                          {formatChange(stock.change)}
                        </span>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                          {formatPercent(stock.changePercent)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )) || <div className="p-8 text-center text-gray-500">No data available</div>}
            </div>
          </div>

          {/* Top Losers */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-red-600 text-white p-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Top 10 Losers
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {data?.topLosers?.slice(0, 10).map((stock, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-900">{stock.symbol}</div>
                      <div className="text-xs text-gray-500">Rank #{index + 1}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-gray-900">
                        {formatNumber(stock.price || stock.ltp)}
                      </div>
                      <div className="flex items-center gap-2 justify-end text-sm">
                        <span className="font-mono text-red-600">
                          {formatChange(stock.change)}
                        </span>
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                          {formatPercent(stock.changePercent)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )) || <div className="p-8 text-center text-gray-500">No data available</div>}
            </div>
          </div>
        </div>

        {/* Sub-indices */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-indigo-600 text-white p-6">
            <h2 className="text-2xl font-bold">Sub-Indices</h2>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.subindices && Object.entries(data.subindices).map(([name, { value, change, changePercent }]) => (
                <div key={name} className="bg-gray-50 p-6 rounded-xl border hover:shadow-lg transition-shadow">
                  <div className="font-bold text-gray-700 mb-2">{name}</div>
                  <div className={`text-xl font-bold mb-1 ${change?.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                    {value}
                  </div>
                  {change && changePercent && (
                    <div className={`text-sm font-semibold ${change.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                      {change} ({changePercent})
                    </div>
                  )}
                </div>
              ))}
            </div>
            {(!data?.subindices || Object.keys(data.subindices).length === 0) && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-500">No sub-indices data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}