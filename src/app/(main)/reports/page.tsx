import { PageHeader } from "@/components/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfitChart } from "./profit-chart"
import { getExpenses, getRevenue } from "@/app/lib/data"

// In a real app, this data would be fetched and aggregated based on the selected time period.
const monthlyData = [
    { month: "Jan", revenue: 1860, expenses: 800 },
    { month: "Feb", revenue: 3050, expenses: 1200 },
    { month: "Mar", revenue: 2370, expenses: 950 },
    { month: "Apr", revenue: 730, expenses: 400 },
    { month: "May", revenue: 2090, expenses: 880 },
    { month: "Jun", revenue: 2140, expenses: 1100 },
  ]
  
  const weeklyData = [
      { month: "Week 1", revenue: 450, expenses: 200 },
      { month: "Week 2", revenue: 600, expenses: 250 },
      { month: "Week 3", revenue: 550, expenses: 220 },
      { month: "Week 4", revenue: 700, expenses: 300 },
  ]
  
  const quarterlyData = [
      { month: "Q1", revenue: 7280, expenses: 2950 },
      { month: "Q2", revenue: 5960, expenses: 2380 },
  ]
  
  const annualData = [
      { month: "2023", revenue: 13240, expenses: 5330 },
  ]

export default function ReportsPage() {
    return (
        <>
            <PageHeader 
                title="Reports"
                description="Analyze your financial performance over different periods."
            />
            <Tabs defaultValue="monthly">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 md:w-fit">
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
                    <TabsTrigger value="annually">Annually</TabsTrigger>
                </TabsList>
                <TabsContent value="weekly" className="mt-4">
                    <ProfitChart 
                        data={weeklyData}
                        title="Weekly Performance"
                        description="Your revenue and expenses for the last 4 weeks."
                    />
                </TabsContent>
                <TabsContent value="monthly" className="mt-4">
                    <ProfitChart 
                        data={monthlyData}
                        title="Monthly Performance"
                        description="Your revenue and expenses for the last 6 months."
                    />
                </TabsContent>
                <TabsContent value="quarterly" className="mt-4">
                    <ProfitChart 
                        data={quarterlyData}
                        title="Quarterly Performance"
                        description="Your revenue and expenses for the last two quarters."
                    />
                </TabsContent>
                <TabsContent value="annually" className="mt-4">
                    <ProfitChart 
                        data={annualData}
                        title="Annual Performance"
                        description="Your revenue and expenses for the current year."
                    />
                </TabsContent>
            </Tabs>
        </>
    )
}
