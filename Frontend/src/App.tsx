import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "notistack";
import Dashboard from "./pages/Dashboard";
import AddBook from "./pages/AddBook";
import EditBook from "./pages/EditBook";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="add" element={<AddBook />} />
              <Route path="edit/:bookId" element={<EditBook />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </QueryClientProvider>
  );
}

export default App;
