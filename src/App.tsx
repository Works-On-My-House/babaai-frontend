import { Navigate, Route, Routes } from "react-router-dom";

import { ModerationQueuePage } from "./features/admin-moderation/pages/ModerationQueuePage";
import { DashboardPage } from "./features/auth/DashboardPage";
import { LoginPage } from "./features/auth/LoginPage";
import { PERMISSIONS } from "./features/auth/permissions";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { RegisterPage } from "./features/auth/RegisterPage";
import { RequirePermission } from "./features/auth/RequirePermission";
import { HomePage } from "./features/home/pages/HomePage";
import { IngredientsPage } from "./features/ingredients/pages/IngredientsPage";
import { MealPlanPage } from "./features/mealPlan/pages/MealPlanPage";
import { PreferencesPage } from "./features/preferences/pages/PreferencesPage";
import { SubmitRecipePage } from "./features/recipeImports/pages/SubmitRecipePage";
import { FavoritesPage } from "./features/recipes/pages/FavoritesPage";
import { RecipesPage } from "./features/recipes/pages/RecipesPage";
import { SuggestionHistoryPage } from "./features/recipes/pages/SuggestionHistoryPage";
import { ShoppingListPage } from "./features/shoppingList/pages/ShoppingListPage";
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
            <Route path="preferences" element={<PreferencesPage />} />
            <Route path="recipes" element={<RecipesPage />} />
            <Route path="recipes/history" element={<SuggestionHistoryPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="submit-recipe" element={<SubmitRecipePage />} />
            <Route path="shopping-list" element={<ShoppingListPage />} />
            <Route path="meal-plan" element={<MealPlanPage />} />
            <Route element={<RequirePermission permission={PERMISSIONS.RECIPE_MODERATE} />}>
              <Route path="admin/moderation" element={<ModerationQueuePage />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
