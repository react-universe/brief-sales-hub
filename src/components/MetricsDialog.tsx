import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, Target, TrendingUp, DollarSign, Percent, Calendar } from 'lucide-react';

interface Prospect {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  stage: 'new' | 'in_talks' | 'closed';
  value?: number;
  notes?: string;
  created_at: string;
}

interface MetricsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospects: Prospect[];
}

const stageColors = {
  new: '#3B82F6',
  in_talks: '#F59E0B',
  closed: '#10B981',
};

const stageLabels = {
  new: 'New Prospects',
  in_talks: 'In Talks',
  closed: 'Closed Deals',
};

export function MetricsDialog({ open, onOpenChange, prospects }: MetricsDialogProps) {
  // Calculate metrics
  const totalProspects = prospects.length;
  const newProspects = prospects.filter(p => p.stage === 'new').length;
  const inTalksProspects = prospects.filter(p => p.stage === 'in_talks').length;
  const closedProspects = prospects.filter(p => p.stage === 'closed').length;

  const conversionRate = totalProspects > 0 ? ((closedProspects / totalProspects) * 100).toFixed(1) : '0';
  
  const totalValue = prospects.reduce((sum, p) => sum + (p.value || 0), 0);
  const closedValue = prospects
    .filter(p => p.stage === 'closed')
    .reduce((sum, p) => sum + (p.value || 0), 0);

  // Prepare data for charts
  const barData = [
    { stage: 'New', count: newProspects, color: stageColors.new },
    { stage: 'In Talks', count: inTalksProspects, color: stageColors.in_talks },
    { stage: 'Closed', count: closedProspects, color: stageColors.closed },
  ];

  const pieData = [
    { name: 'New Prospects', value: newProspects, color: stageColors.new },
    { name: 'In Talks', value: inTalksProspects, color: stageColors.in_talks },
    { name: 'Closed Deals', value: closedProspects, color: stageColors.closed },
  ].filter(item => item.value > 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRecentProspects = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return prospects.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Sales Metrics Dashboard</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Prospects</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{totalProspects}</div>
                <p className="text-xs text-muted-foreground">
                  {getRecentProspects()} added this month
                </p>
              </CardContent>
            </Card>

            <Card className="border-status-closed/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-status-closed" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-status-closed">{conversionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {closedProspects} of {totalProspects} prospects
                </p>
              </CardContent>
            </Card>

            <Card className="border-status-in-talks/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
                <DollarSign className="h-4 w-4 text-status-in-talks" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-status-in-talks">
                  {formatCurrency(totalValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total potential value
                </p>
              </CardContent>
            </Card>

            <Card className="border-status-closed/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Closed Value</CardTitle>
                <Target className="h-4 w-4 text-status-closed" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-status-closed">
                  {formatCurrency(closedValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Revenue generated
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Prospects by Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="stage" 
                      tick={{ fontSize: 12 }}
                      tickLine={{ stroke: '#94a3b8' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickLine={{ stroke: '#94a3b8' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pipeline Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <p>No data to display</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stage Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stage Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(stageLabels).map(([stage, label]) => {
                  const count = prospects.filter(p => p.stage === stage).length;
                  const percentage = totalProspects > 0 ? ((count / totalProspects) * 100).toFixed(1) : '0';
                  
                  return (
                    <div key={stage} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">{percentage}% of total</p>
                      </div>
                      <Badge 
                        style={{ backgroundColor: stageColors[stage as keyof typeof stageColors] }}
                        className="text-white border-0"
                      >
                        {count}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}