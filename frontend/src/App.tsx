import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ClientsPage from './pages/ClientsPage'
import ClientDetailPage from './pages/ClientDetailPage'
import TechniciansPage from './pages/TechniciansPage'
import TechnicianDetailPage from './pages/TechnicianDetailPage'
import WorkOrdersPage from './pages/WorkOrdersPage'
import WorkOrderDetailPage from './pages/WorkOrderDetailPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/clients" replace />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/:id" element={<ClientDetailPage />} />
        <Route path="technicians" element={<TechniciansPage />} />
        <Route path="technicians/:id" element={<TechnicianDetailPage />} />
        <Route path="work-orders" element={<WorkOrdersPage />} />
        <Route path="work-orders/:id" element={<WorkOrderDetailPage />} />
      </Route>
    </Routes>
  )
}
