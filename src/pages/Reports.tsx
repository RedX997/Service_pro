import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, Users, Clock, FileText, Loader2, FileSpreadsheet, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const revenueData = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 67000 },
];

const clientGrowthData = [
  { month: 'Jan', clients: 380 },
  { month: 'Feb', clients: 395 },
  { month: 'Mar', clients: 420 },
  { month: 'Apr', clients: 445 },
  { month: 'May', clients: 468 },
  { month: 'Jun', clients: 487 },
];

const serviceDistribution = [
  { name: 'GST Filing', value: 35, color: 'hsl(173, 58%, 39%)' },
  { name: 'ITR Filing', value: 28, color: 'hsl(213, 55%, 25%)' },
  { name: 'Audit', value: 18, color: 'hsl(38, 92%, 50%)' },
  { name: 'Registration', value: 12, color: 'hsl(0, 72%, 51%)' },
  { name: 'Consultation', value: 7, color: 'hsl(160, 84%, 39%)' },
];

const employeePerformance = [
  { name: 'Ankit S.', billable: 145, target: 160 },
  { name: 'Priya M.', billable: 162, target: 160 },
  { name: 'Rahul V.', billable: 128, target: 160 },
  { name: 'Kavita R.', billable: 136, target: 160 },
  { name: 'Suresh K.', billable: 98, target: 160 },
];

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const generateCSVData = () => {
    const summaryData = [
      ['Metric', 'Value', 'Change'],
      ['Total Revenue', '₹3,28,000', '+12%'],
      ['Active Clients', '487', '+19 new'],
      ['Billable Hours', '1,248h', '78% efficiency'],
      ['Completed Tasks', '342', '94% on time'],
      ['', '', ''],
      ['Revenue by Month', '', ''],
      ...revenueData.map(item => [item.month, `₹${item.revenue}`, '']),
      ['', '', ''],
      ['Client Growth', '', ''],
      ...clientGrowthData.map(item => [item.month, item.clients.toString(), '']),
      ['', '', ''],
      ['Service Distribution', '', ''],
      ...serviceDistribution.map(item => [item.name, `${item.value}%`, '']),
      ['', '', ''],
      ['Employee Performance', '', ''],
      ...employeePerformance.map(item => [item.name, `${item.billable}h`, `Target: ${item.target}h`]),
    ];
    return summaryData;
  };

  const downloadCSV = (data: string[][], filename: string) => {
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateJSONReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      period: selectedPeriod,
      summary: {
        totalRevenue: 328000,
        revenueChange: '+12%',
        activeClients: 487,
        newClients: 19,
        billableHours: 1248,
        efficiency: '78%',
        completedTasks: 342,
        onTimeRate: '94%'
      },
      revenueData,
      clientGrowthData,
      serviceDistribution,
      employeePerformance
    };
    return reportData;
  };

  const downloadJSON = (data: any, filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateHTMLReport = () => {
    const currentDate = new Date().toLocaleDateString('en-IN');
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ServicePro Business Report - ${currentDate}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #007acc; padding-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; background: #f9f9f9; }
        .card h3 { margin: 0 0 10px 0; color: #007acc; }
        .card .value { font-size: 24px; font-weight: bold; margin: 5px 0; }
        .card .change { color: #28a745; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #007acc; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .section { margin: 40px 0; }
        .section h2 { color: #007acc; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>ServicePro Business Report</h1>
        <p>Generated on ${currentDate} | Period: ${selectedPeriod}</p>
    </div>
    
    <div class="summary">
        <div class="card">
            <h3>Total Revenue</h3>
            <div class="value">₹3,28,000</div>
            <div class="change">+12% from last month</div>
        </div>
        <div class="card">
            <h3>Active Clients</h3>
            <div class="value">487</div>
            <div class="change">+19 new this month</div>
        </div>
        <div class="card">
            <h3>Billable Hours</h3>
            <div class="value">1,248h</div>
            <div class="change">78% efficiency</div>
        </div>
        <div class="card">
            <h3>Completed Tasks</h3>
            <div class="value">342</div>
            <div class="change">94% on time</div>
        </div>
    </div>

    <div class="section">
        <h2>Revenue Trend</h2>
        <table>
            <thead>
                <tr><th>Month</th><th>Revenue</th></tr>
            </thead>
            <tbody>
                ${revenueData.map(item => `<tr><td>${item.month}</td><td>₹${item.revenue.toLocaleString()}</td></tr>`).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Client Growth</h2>
        <table>
            <thead>
                <tr><th>Month</th><th>Total Clients</th></tr>
            </thead>
            <tbody>
                ${clientGrowthData.map(item => `<tr><td>${item.month}</td><td>${item.clients}</td></tr>`).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Service Distribution</h2>
        <table>
            <thead>
                <tr><th>Service</th><th>Percentage</th></tr>
            </thead>
            <tbody>
                ${serviceDistribution.map(item => `<tr><td>${item.name}</td><td>${item.value}%</td></tr>`).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Employee Performance</h2>
        <table>
            <thead>
                <tr><th>Employee</th><th>Billable Hours</th><th>Target</th><th>Achievement</th></tr>
            </thead>
            <tbody>
                ${employeePerformance.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.billable}h</td>
                        <td>${item.target}h</td>
                        <td>${Math.round((item.billable / item.target) * 100)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`;
    return html;
  };

  const downloadHTML = (html: string, filename: string) => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async (format: 'csv' | 'json' | 'html') => {
    setIsExporting(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const timestamp = new Date().toISOString().split('T')[0];
      const periodLabel = selectedPeriod.replace('days', 'd').replace('year', 'yr');
      
      switch (format) {
        case 'csv':
          const csvData = generateCSVData();
          downloadCSV(csvData, `servicepro-report-${periodLabel}-${timestamp}.csv`);
          break;
        case 'json':
          const jsonData = generateJSONReport();
          downloadJSON(jsonData, `servicepro-report-${periodLabel}-${timestamp}.json`);
          break;
        case 'html':
          const htmlData = generateHTMLReport();
          downloadHTML(htmlData, `servicepro-report-${periodLabel}-${timestamp}.html`);
          break;
      }
      
      toast({
        title: "Export Successful",
        description: `Report exported as ${format.toUpperCase()} file`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the report",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Business performance insights</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExporting}>
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('html')}>
                  <FileImage className="h-4 w-4 mr-2" />
                  Export as HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold mt-1">₹3,28,000</p>
                  <p className="text-sm text-success mt-1">+12% from last month</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Clients</p>
                  <p className="text-2xl font-bold mt-1">487</p>
                  <p className="text-sm text-success mt-1">+19 new this month</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Billable Hours</p>
                  <p className="text-2xl font-bold mt-1">1,248h</p>
                  <p className="text-sm text-success mt-1">78% efficiency</p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Tasks</p>
                  <p className="text-2xl font-bold mt-1">342</p>
                  <p className="text-sm text-muted-foreground mt-1">94% on time</p>
                </div>
                <div className="p-3 rounded-lg bg-success/10">
                  <FileText className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }} 
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={clientGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="clients" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {serviceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value}%`, 'Share']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 ml-4">
                  {serviceDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm text-muted-foreground ml-auto">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employee Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={employeePerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="billable" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} name="Billable Hours" />
                    <Bar dataKey="target" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
