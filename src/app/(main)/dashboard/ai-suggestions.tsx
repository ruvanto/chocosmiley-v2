import { Lightbulb } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { getExpenses, getRevenue } from "@/app/lib/data"
import { suggestDashboardMetrics } from "@/ai/flows/dashboard-metric-suggestions"

export async function AISuggestions() {
    const revenueData = await getRevenue();
    const expenseData = await getExpenses();
    const profit = revenueData.reduce((acc, r) => acc + r.amount, 0) - expenseData.reduce((acc, e) => acc + e.amount, 0);
    // Simplified profit data for AI
    const profitData = [{ category: 'Total Profit', amount: profit }];

    const suggestions = await suggestDashboardMetrics({
        revenueData: JSON.stringify(revenueData.slice(0, 5)), // Limit data for prompt size
        expenseData: JSON.stringify(expenseData.slice(0, 5)),
        profitData: JSON.stringify(profitData),
    });

    return (
        <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="text-primary" />
                    <span>AI-Powered Suggestions</span>
                </CardTitle>
                <CardDescription>
                    Here are some suggestions to better visualize your business data.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {suggestions.suggestions.length > 0 ? (
                    <ul className="space-y-4">
                        {suggestions.suggestions.map((suggestion, index) => (
                            <li key={index} className="p-4 bg-secondary/50 rounded-lg border">
                                <p className="font-semibold text-lg">{suggestion.metric}</p>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Suggested Visualization: <span className="font-medium text-foreground">{suggestion.visualization}</span>
                                </p>
                                <p className="text-sm">{suggestion.reason}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground">No suggestions available at the moment.</p>
                )}
            </CardContent>
        </Card>
    )
}
