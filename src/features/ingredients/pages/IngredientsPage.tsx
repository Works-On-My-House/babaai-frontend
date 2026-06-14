import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ShoppingBasketOutlined } from "@mui/icons-material";
import { Button as MuiButton, Tooltip } from "@mui/material";
import { toast } from "sonner";

import { appEnv, ingredientPageSizeOptions } from "@/config/env";
import { FrostedPanel } from "@/components/FrostedPanel";
import type { PublicConfig } from "@/features/config/services/configApi";
import { ConfigGate } from "@/features/config/components/ConfigGate";
import { BulkDeleteConfirmDialog } from "@/features/ingredients/components/BulkDeleteConfirmDialog";
import { DeleteConfirmDialog } from "@/features/ingredients/components/DeleteConfirmDialog";
import { EmptyState } from "@/features/ingredients/components/EmptyState";
import { IngredientCard } from "@/features/ingredients/components/IngredientCard";
import { IngredientFilters } from "@/features/ingredients/components/IngredientFilters";
import { IngredientFormModal } from "@/features/ingredients/components/IngredientFormModal";
import { IngredientSelectionToolbar } from "@/features/ingredients/components/IngredientSelectionToolbar";
import { SkeletonList } from "@/features/ingredients/components/SkeletonList";
import { useIngredientMutations } from "@/features/ingredients/hooks/useIngredientMutations";
import { useIngredients } from "@/features/ingredients/hooks/useIngredients";
import type {
  Ingredient,
  IngredientCreatePayload,
  IngredientSortField,
  SortOrder,
} from "@/features/ingredients/types/ingredient";
import { PaginationControls } from "@/features/recipes/components/PaginationControls";
import { useApiMessage } from "@/lib/translation/useApiMessage";

const SEARCH_DEBOUNCE_MS = 350;

export function IngredientsPage() {
  const { t } = useTranslation();

  return (
    <ConfigGate>
      {(config) => <IngredientsPageContent config={config} t={t} />}
    </ConfigGate>
  );
}

function IngredientsPageContent({
  config,
  t,
}: {
  config: PublicConfig;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const pageSizeOptions = ingredientPageSizeOptions();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(appEnv.ingredientPageSize);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState<IngredientSortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [deleting, setDeleting] = useState<Ingredient | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const listParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      search: debouncedSearch || undefined,
      category: category || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
    }),
    [page, pageSize, debouncedSearch, category, sortBy, sortOrder],
  );

  const { data, loading, error, refetch } = useIngredients(listParams);
  const translatedError = useApiMessage(error);

  const handleMutationSuccess = useCallback(() => {
    void refetch();
    setFormOpen(false);
    setEditing(null);
    setDeleting(null);
    setBulkDeleteOpen(false);
    setSelectedIds(new Set());
    setSelectionMode(false);
  }, [refetch]);

  const { create, update, remove, removeMany, isSubmitting, isDeleting } =
    useIngredientMutations(handleMutationSuccess);

  useEffect(() => {
    if (translatedError) toast.error(translatedError);
  }, [translatedError]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(ingredient: Ingredient) {
    setEditing(ingredient);
    setFormOpen(true);
  }

  async function handleFormSubmit(payload: IngredientCreatePayload) {
    if (editing) {
      const result = await update(editing.id, payload);
      if (result) setFormOpen(false);
    } else {
      const result = await create(payload);
      if (result) setFormOpen(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleting) return;
    await remove(deleting.id, deleting.name);
  }

  async function handleBulkDeleteConfirm() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    const ok = await removeMany(ids);
    if (ok) setBulkDeleteOpen(false);
  }

  function toggleSelectionMode() {
    setSelectionMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  }

  function toggleSelect(ingredient: Ingredient) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(ingredient.id)) next.delete(ingredient.id);
      else next.add(ingredient.id);
      return next;
    });
  }

  function selectAllOnPage() {
    setSelectedIds(new Set(items.map((item) => item.id)));
  }

  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, pageSize, debouncedSearch, category, sortBy, sortOrder]);

  const hasFilters = Boolean(debouncedSearch || category);
  const items = data?.items ?? [];
  const showEmpty = !loading && items.length === 0;
  const totalPages = data?.pages ?? 1;
  const selectedCount = selectedIds.size;
  const allOnPageSelected = items.length > 0 && items.every((item) => selectedIds.has(item.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 drop-shadow-sm dark:text-stone-50 sm:text-3xl">
            {t("ingredients.title")}
          </h1>
          <p className="mt-1 text-sm text-stone-700 dark:text-stone-300">
            {t("ingredients.subtitle")}
          </p>
        </div>
        <Tooltip title={t("ingredients.add")}>
          <span className="inline-flex shrink-0">
            <MuiButton
              variant="contained"
              size="large"
              startIcon={<ShoppingBasketOutlined />}
              onClick={openCreate}
              sx={{ borderRadius: 2, px: 3 }}
            >
              {t("ingredients.add")}
            </MuiButton>
          </span>
        </Tooltip>
      </div>

      <FrostedPanel className="space-y-6 p-4 sm:p-6">
        <IngredientFilters
          search={searchInput}
          category={category}
          categories={config.ingredient_categories}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSearchChange={setSearchInput}
          onCategoryChange={(v) => {
            setCategory(v);
            setPage(1);
          }}
          onSortByChange={(v) => {
            setSortBy(v);
            setPage(1);
          }}
          onSortOrderChange={(v) => {
            setSortOrder(v);
            setPage(1);
          }}
        />

        {loading && <SkeletonList />}
        {showEmpty && <EmptyState onAdd={openCreate} hasFilters={hasFilters} />}

        {!loading && items.length > 0 && (
          <>
            <IngredientSelectionToolbar
              selectionMode={selectionMode}
              selectedCount={selectedCount}
              pageCount={items.length}
              allOnPageSelected={allOnPageSelected}
              onToggleSelectionMode={toggleSelectionMode}
              onSelectAllPage={selectAllOnPage}
              onClearSelection={() => setSelectedIds(new Set())}
              onDeleteSelected={() => setBulkDeleteOpen(true)}
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((ingredient) => (
                <IngredientCard
                  key={ingredient.id}
                  ingredient={ingredient}
                  onEdit={openEdit}
                  onDelete={setDeleting}
                  selectionMode={selectionMode}
                  selected={selectedIds.has(ingredient.id)}
                  onToggleSelect={toggleSelect}
                />
              ))}
            </div>

            <PaginationControls
              page={page}
              pages={totalPages}
              total={data?.total ?? 0}
              onPageChange={setPage}
              label={t("ingredients.paginationLabel")}
              pageSize={pageSize}
              pageSizeOptions={pageSizeOptions}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </>
        )}
      </FrostedPanel>

      <IngredientFormModal
        open={formOpen}
        ingredient={editing}
        isSubmitting={isSubmitting}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmDialog
        ingredient={deleting}
        open={deleting != null}
        isDeleting={isDeleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDeleteConfirm}
      />

      <BulkDeleteConfirmDialog
        count={selectedCount}
        open={bulkDeleteOpen}
        isDeleting={isDeleting}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
      />
    </div>
  );
}
