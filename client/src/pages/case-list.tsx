import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Case } from "@shared/schema";
import { FileText, Plus, Pencil, Trash, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function CaseList() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [caseToDelete, setCaseToDelete] = useState<Case | null>(null);
  
  // Fetch cases
  const { data: cases, isLoading, error } = useQuery({
    queryKey: ["/api/cases"],
  });
  
  // Delete case mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cases/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Case deleted",
        description: "The case has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
    },
    onError: (error) => {
      console.error("Error deleting case:", error);
      toast({
        title: "Error deleting case",
        description: "There was an error deleting the case. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (caseToDelete) {
      deleteMutation.mutate(caseToDelete.id);
      setCaseToDelete(null);
    }
  };
  
  // Filter cases based on search term
  const filteredCases = cases?.filter((caseItem: Case) => {
    const searchLower = searchTerm.toLowerCase();
    const caseNumber = caseItem.caseNumber?.toLowerCase() || "";
    const claimantName = caseItem.claimantDetails?.fullName?.toLowerCase() || "";
    
    return caseNumber.includes(searchLower) || claimantName.includes(searchLower);
  });
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-[#0E7C7B]" />
            <h1 className="ml-2 text-xl font-semibold text-[#0E7C7B]">Medical-Legal Report Generator</h1>
          </div>
          <div className="flex space-x-4">
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Link href="/cases/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Case
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#1A202C]">Case List</h2>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search cases..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Cases</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <p className="text-red-600 mb-2">Error loading cases</p>
                <Button 
                  variant="outline" 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/cases"] })}
                >
                  Retry
                </Button>
              </div>
            ) : filteredCases?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case Number</TableHead>
                    <TableHead>Claimant</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Completion</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((caseItem: Case) => (
                    <TableRow key={caseItem.id}>
                      <TableCell className="font-medium">{caseItem.caseNumber}</TableCell>
                      <TableCell>{caseItem.claimantDetails?.fullName || "Not specified"}</TableCell>
                      <TableCell>{formatDate(caseItem.createdAt)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          caseItem.status === "completed" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {caseItem.status === "completed" ? "Completed" : "In Progress"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={caseItem.completionPercentage} className="h-2 w-24" />
                          <span className="text-xs text-gray-500">{caseItem.completionPercentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/cases/${caseItem.id}`)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => setCaseToDelete(caseItem)}
                              >
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete case {caseItem.caseNumber}?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setCaseToDelete(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteConfirm}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No cases found{searchTerm ? " matching your search" : ""}.</p>
                <Link href="/cases/new">
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create New Case
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
