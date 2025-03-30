import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CaseList from "@/pages/case-list";
import CaseEditor from "@/pages/case-editor";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cases" component={CaseList} />
      <Route path="/cases/:id" component={CaseEditor} />
      <Route path="/cases/new" component={CaseEditor} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
