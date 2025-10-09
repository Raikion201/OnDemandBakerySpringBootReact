import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
  month?: string;
  [key: string]: any; // Allow additional properties for Recharts compatibility
}

interface SimpleChartProps {
  data: ChartDataPoint[];
  title: string;
  type: 'line' | 'bar' | 'pie';
  height?: number;
  color?: string;
}

export const SimpleChart: React.FC<SimpleChartProps> = ({
  data,
  title,
  type,
  height = 200,
  color = '#3B82F6'
}) => {
  // Memoize functions to prevent re-creation on every render
  const formatValue = useMemo(() => (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }, []);

  const getPieColor = useMemo(() => (index: number) => {
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    return colors[index % colors.length];
  }, []);

  const formatTooltip = useMemo(() => (value: number, name: string) => {
    return [formatValue(value), 'Revenue'];
  }, [formatValue]);

  // Validate data
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ensure data has required properties
  const validData = data.filter(item => 
    item && 
    typeof item === 'object' && 
    'label' in item && 
    'value' in item &&
    typeof item.value === 'number'
  );

  if (validData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            Invalid data format
          </div>
        </CardContent>
      </Card>
    );
  }

  try {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: `${height}px` }}>
          {type === 'bar' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={validData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="label" 
                  fontSize={12}
                  tick={{ fill: '#666' }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: '#666' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={formatTooltip}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill={color}
                  radius={[4, 4, 0, 0]}
                  stroke="#fff"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {type === 'line' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={validData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="label" 
                  fontSize={12}
                  tick={{ fill: '#666' }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: '#666' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={formatTooltip}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill={color}
                  radius={[4, 4, 0, 0]}
                  stroke="#fff"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {type === 'pie' && (
            <div className="h-full flex items-center">
              <div className="w-1/2">
                  <PieChart width={200} height={200}>
                    <Pie
                      data={validData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {validData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.value === 0 ? '#E5E7EB' : getPieColor(index)}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={formatTooltip}
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
              </div>
              <div className="w-1/2 space-y-2">
                {validData.map((item, index) => {
                  const totalValue = validData.reduce((sum, d) => sum + d.value, 0);
                  const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded mr-2"
                          style={{ 
                            backgroundColor: item.value === 0 ? '#E5E7EB' : getPieColor(index),
                            opacity: item.value === 0 ? 0.5 : 1
                          }}
                        />
                        <span className={`text-xs font-medium ${item.value === 0 ? 'text-gray-400' : ''}`}>
                          {item.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-medium ${item.value === 0 ? 'text-gray-400' : ''}`}>
                          {formatValue(item.value)}
                        </div>
                        <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          </div>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Chart rendering error:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-red-600">
            <div className="text-center">
              <p className="font-medium">Chart Error</p>
              <p className="text-sm text-muted-foreground mt-1">
                Failed to render chart
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
};

