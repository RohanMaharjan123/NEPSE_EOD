// components/NepseDashboard.js
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchNepseData } from '../lib/api';

export default function NepseDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchNepseData();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <h1 className="text-5xl font-bold text-blue-600 mb-2 text-center">NEPSE Dashboard</h1>
        <p className="text-gray-600 text-lg text-center mb-10">Real-time Nepal Stock Exchange Data</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>NEPSE Index</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.nepse_index.value || 'N/A'}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-sm font-medium ${data?.nepse_index.change.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                  {data?.nepse_index.change || 'N/A'}
                </span>
                <Badge variant={data?.nepse_index.change_percent.startsWith('-') ? 'destructive' : 'default'}>
                  {data?.nepse_index.change_percent || 'N/A'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Add more cards for top gainers and losers */}
        </div>
      </div>
    </div>
  );
}
