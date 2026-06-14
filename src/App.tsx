import { Navigate, Route, Routes } from "react-router-dom";

import { DashboardPage } from "./features/auth/DashboardPage";
import { LoginPage } from "./features/auth/LoginPage";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { RegisterPage } from "./features/auth/RegisterPage";
import { HomePage } from "./features/home/pages/HomePage";
import { IngredientsPage } from "./features/ingredients/pages/IngredientsPage";
import { RecipesPage } from "./features/recipes/pages/RecipesPage";
import { SuggestionHistoryPage } from "./features/recipes/pages/SuggestionHistoryPage";
import { AppLayout } from "./layouts/AppLayout";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/">
        <Route index element={<HomePage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="ingredients" element={<IngredientsPage />} />
            <Route path="recipes" element={<RecipesPage />} />
            <Route path="recipes/history" element={<SuggestionHistoryPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
