import { getExpenses } from "@/app/lib/data";
import { PageHeader } from "@/components/page-header";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default async function ExpensesPage() {
    const data = await getExpenses();
    
    return (
        <>
            <PageHeader title="Expenses" description="Track and manage your business costs.">
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Expense
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Expense</DialogTitle>
                            <DialogDescription>
                                Fill in the details of the new expense. A full form with server actions would be implemented here.
                            </DialogDescription>
                        </DialogHeader>
                        {/* Placeholder for the form */}
                        <div className="py-4">
                            <p className="text-sm text-muted-foreground">Expense form fields would go here.</p>
                        </div>
                    </DialogContent>
                </Dialog>
            </PageHeader>
            <DataTable columns={columns} data={data} />
        </>
    );
}
