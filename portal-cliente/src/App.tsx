import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CatalogoPage } from './presentation/pages/CatalogoPage';
import { ProductoDetallePage } from './presentation/pages/ProductoDetallePage';
import { LoginComerciante } from './presentation/pages/LoginComerciante';
import { PanelComerciante } from './presentation/pages/PanelComerciante';
import { GestionCatalogo } from './presentation/pages/GestionCatalogo';
import { AdminDashboard } from './presentation/pages/AdminDashboard';
import { SuperAdminDashboard } from './presentation/pages/SuperAdminDashboard';
import { LoginCliente } from './presentation/pages/LoginCliente';
import { RegistroCliente } from './presentation/pages/RegistroCliente';
import { EditarProducto } from './presentation/pages/EditarProducto';
import { PerfilCliente } from './presentation/pages/PerfilCliente';
import { useAuthController } from './application/useAuthController';

// Import Layouts
import { SuperAdminLayout } from './presentation/components/SuperAdminLayout';
import { AdminLayout } from './presentation/components/AdminLayout';

// Import Sub-pages
import { GestionAdministradores } from './presentation/pages/GestionAdministradores';
import { GestionComerciantes } from './presentation/pages/GestionComerciantes';
import { GestionCategorias } from './presentation/pages/GestionCategorias';

interface ProtectedRouteProps {
  element: React.ReactElement;
  roleRequired: 'comerciante' | 'admin' | 'superadmin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, roleRequired }) => {
  const { usuario, esComerciante, esAdmin, esSuperAdmin } = useAuthController();

  // Validamos si la sesión es válida (evitando el mock dummy de cliente id 500)
  const isUserAuthenticated = usuario !== null && usuario.id !== 500;

  if (!isUserAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roleRequired === 'comerciante' && !esComerciante) {
    return <Navigate to="/login" replace />;
  }

  if (roleRequired === 'admin' && !esAdmin) {
    return <Navigate to="/login" replace />;
  }

  if (roleRequired === 'superadmin' && !esSuperAdmin) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Vistas Públicas */}
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/productos/:id" element={<ProductoDetallePage />} />

          {/* Login de Comerciantes y Administradores */}
          <Route path="/login" element={<LoginComerciante />} />

          {/* Registro e Ingreso de Clientes */}
          <Route path="/login/cliente" element={<LoginCliente />} />
          <Route path="/registro/cliente" element={<RegistroCliente />} />
          <Route path="/perfil" element={<PerfilCliente />} />

          {/* Layout Admin (Protegido) */}
          <Route path="/admin" element={<ProtectedRoute roleRequired="admin" element={<AdminLayout />} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="comerciantes" element={<GestionComerciantes />} />
            <Route path="categorias" element={<GestionCategorias />} />
          </Route>

          {/* Layout SuperAdmin (Protegido) */}
          <Route path="/superadmin" element={<ProtectedRoute roleRequired="superadmin" element={<SuperAdminLayout />} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="administradores" element={<GestionAdministradores />} />
          </Route>

          {/* Layout Comerciante (Protegido) */}
          <Route 
            path="/panel" 
            element={<ProtectedRoute roleRequired="comerciante" element={<PanelComerciante />} />} 
          />
          <Route 
            path="/panel/catalogo" 
            element={<ProtectedRoute roleRequired="comerciante" element={<GestionCatalogo />} />} 
          />
          <Route 
            path="/panel/productos/:id/editar" 
            element={<ProtectedRoute roleRequired="comerciante" element={<EditarProducto />} />} 
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
