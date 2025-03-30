import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ClipboardList, Plus, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-[#0E7C7B]" />
            <h1 className="ml-2 text-xl font-semibold text-[#0E7C7B]">Medical-Legal Report Generator</h1>
          </div>
          <div className="hidden md:flex space-x-4">
            <Link href="/cases">
              <Button variant="outline" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                View Cases
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

      <main className="max-w-7xl mx-auto px-4 py-12 md:px-6 lg:px-8">
        <section className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1A202C] mb-4">Professional Medical-Legal Reports</h2>
          <p className="text-xl text-[#4A5568] max-w-3xl mx-auto">
            Generate comprehensive road traffic accident case documentation and reports for legal and medical professionals.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-[#0E7C7B]" />
                Comprehensive Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#4A5568]">
                Document all aspects of road traffic accident cases with structured forms and intuitive navigation.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#0E7C7B]" />
                Professional PDF Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#4A5568]">
                Generate professional PDF reports with all case details formatted for medical-legal purposes.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#0E7C7B]" />
                Intuitive Case Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#4A5568]">
                Easily save, edit, and manage cases with a user-friendly interface designed for medical and legal professionals.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="text-center">
          <h3 className="text-2xl font-semibold text-[#1A202C] mb-6">Ready to get started?</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/cases/new">
              <Button size="lg" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Case
              </Button>
            </Link>
            <Link href="/cases">
              <Button size="lg" variant="outline" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                View Existing Cases
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 px-6 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[#4A5568]">&copy; {new Date().getFullYear()} Medical-Legal Report Generator</p>
        </div>
      </footer>
    </div>
  );
}
