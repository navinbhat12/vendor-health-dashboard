import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import VendorDetail from "./pages/VendorDetail";
import VendorComparison from "./pages/VendorComparison";
import NotFound from "./pages/NotFound";
import { DynamicVendorsProvider } from "./contexts/DynamicVendorsContext";

function App() {
  return (
    <DynamicVendorsProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/comparison" element={<VendorComparison />} />
          <Route path="/vendor/:ticker" element={<VendorDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </DynamicVendorsProvider>
  );
}

export default App;
