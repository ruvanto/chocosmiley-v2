import { PageHeader } from "@/components/page-header"
import { DollarSign, Wallet, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getExpenses, getRevenue } from "@/app/lib/data"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

async function RevenueCard() {
    const revenue = await getRevenue();
    const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0);
    return (
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
        </Card>
    )
}

async function ExpensesCard() {
    const expenses = await getExpenses();
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    return (
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
                <p className="text-xs text-muted-foreground">+18.1% from last month</p>
            </CardContent>
        </Card>
    )
}

async function ProfitCard() {
    const revenue = await getRevenue();
    const expenses = await getExpenses();
    const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const totalProfit = totalRevenue - totalExpenses;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit</CardTitle>
                {totalProfit >= 0 ? <TrendingUp className="h-4 w-4 text-muted-foreground" /> : <TrendingDown className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-accent-foreground" : "text-destructive"}`}>{formatCurrency(totalProfit)}</div>
                <p className="text-xs text-muted-foreground">+5.2% from last month</p>
            </CardContent>
        </Card>
    )
}

function CardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-7 w-32 mb-2" />
                <Skeleton className="h-3 w-40" />
            </CardContent>
        </Card>
    )
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Here's a snapshot of your business performance."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<CardSkeleton />}>
            <RevenueCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
            <ExpensesCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
            <ProfitCard />
        </Suspense>
      </div>
    </>
  )
}
