"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { PROJECT_STATUSES } from "@portfolio/shared";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  PROJECT_CATALOG_SORT_OPTIONS,
  getActiveProjectFilterCount,
  getProjectCatalogSummaries,
  type ProjectCatalogOptions,
  type ProjectCatalogState,
  type ProjectCatalogSummaryKey,
  type ProjectStatusFilter,
  type ProjectTypeFilter,
} from "./project-catalog-state";

const DESKTOP_PANEL_ID = "project-filters-desktop-panel";
const MOBILE_SHEET_ID = "project-filters-mobile-sheet";

type Props = {
  state: ProjectCatalogState;
  options: ProjectCatalogOptions;
  resultCount: number;
  onSearchChange: (query: string) => void;
  onAdvancedStateChange: (state: ProjectCatalogState) => void;
  onRemoveSummary: (key: ProjectCatalogSummaryKey) => void;
  onResetFiltersAndSort: () => void;
};

type FilterFieldsProps = {
  idPrefix: string;
  state: ProjectCatalogState;
  options: ProjectCatalogOptions;
  layout: "desktop" | "sheet";
  onChange: (state: ProjectCatalogState) => void;
};

type FilterSelectProps = {
  id: string;
  label: string;
  value: string;
  children: React.ReactNode;
  onChange: (value: string) => void;
};

const FilterSelect = ({
  id,
  label,
  value,
  children,
  onChange,
}: FilterSelectProps) => (
  <label htmlFor={id} className="block min-w-0">
    <span className="mb-2 block text-xs font-semibold text-foreground">
      {label}
    </span>
    <span className="relative block">
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-border/70 bg-background px-3.5 pr-10 text-sm text-foreground outline-none transition-colors focus:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring/60 motion-reduce:transition-none"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </span>
  </label>
);

const FilterFields = ({
  idPrefix,
  state,
  options,
  layout,
  onChange,
}: FilterFieldsProps) => (
  <fieldset>
    <legend className="sr-only">Filter and sort projects</legend>
    <div
      className={cn(
        "grid gap-4",
        layout === "desktop"
          ? "lg:grid-cols-2 xl:grid-cols-4"
          : "grid-cols-1 sm:grid-cols-2",
      )}
    >
      <FilterSelect
        id={`${idPrefix}-type`}
        label="Project type"
        value={state.type}
        onChange={(type) =>
          onChange({ ...state, type: type as ProjectTypeFilter })
        }
      >
        <option value="all">All types</option>
        {options.projectTypes.map((projectType) => (
          <option key={projectType.value} value={projectType.value}>
            {projectType.label}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        id={`${idPrefix}-technology`}
        label="Technology"
        value={state.tech}
        onChange={(tech) => onChange({ ...state, tech })}
      >
        {options.techOptions.map((technology) => (
          <option key={technology} value={technology}>
            {technology === "All" ? "All technologies" : technology}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        id={`${idPrefix}-status`}
        label="Status"
        value={state.status}
        onChange={(status) =>
          onChange({ ...state, status: status as ProjectStatusFilter })
        }
      >
        <option value="all">All statuses</option>
        {PROJECT_STATUSES.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        id={`${idPrefix}-sort`}
        label="Sort"
        value={state.sort}
        onChange={(sort) =>
          onChange({
            ...state,
            sort: sort as ProjectCatalogState["sort"],
          })
        }
      >
        {PROJECT_CATALOG_SORT_OPTIONS.map((sortOption) => (
          <option key={sortOption.value} value={sortOption.value}>
            {sortOption.label}
          </option>
        ))}
      </FilterSelect>
    </div>
  </fieldset>
);

const FilterTriggerContent = ({ count }: { count: number }) => (
  <>
    <SlidersHorizontal className="size-4" />
    <span>Filters</span>
    {count > 0 ? (
      <span
        aria-hidden="true"
        className="inline-flex min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-semibold leading-4 text-background"
      >
        {count}
      </span>
    ) : null}
    <ChevronDown className="size-4 transition-transform duration-150 group-aria-expanded/button:rotate-180 motion-reduce:transition-none" />
  </>
);

const ProjectCatalogToolbar = ({
  state,
  options,
  resultCount,
  onSearchChange,
  onAdvancedStateChange,
  onRemoveSummary,
  onResetFiltersAndSort,
}: Props) => {
  const [desktopOpen, setDesktopOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const desktopOpenRef = React.useRef(desktopOpen);
  const mobileOpenRef = React.useRef(mobileOpen);
  const desktopPanelRef = React.useRef<HTMLDivElement>(null);
  const desktopTriggerRef = React.useRef<HTMLButtonElement>(null);
  const mobileTriggerRef = React.useRef<HTMLButtonElement>(null);
  const breakpointClosingMobileRef = React.useRef(false);
  const moveFocusAfterMobileCloseRef = React.useRef(false);
  const shouldReduceMotion = useReducedMotion() ?? false;

  const filterCount = getActiveProjectFilterCount(state);
  const summaries = getProjectCatalogSummaries(state);
  const resultLabel = `${resultCount} project${resultCount === 1 ? "" : "s"} found`;
  const triggerLabel =
    filterCount > 0 ? `Filters, ${filterCount} active` : "Filters and sort";

  React.useEffect(() => {
    desktopOpenRef.current = desktopOpen;
  }, [desktopOpen]);

  React.useEffect(() => {
    mobileOpenRef.current = mobileOpen;
  }, [mobileOpen]);

  React.useEffect(() => {
    const breakpoint = window.matchMedia("(min-width: 1024px)");

    const handleBreakpointChange = (event: MediaQueryListEvent) => {
      const activeElement = document.activeElement;

      if (event.matches && mobileOpenRef.current) {
        const mobileSheet = document.getElementById(MOBILE_SHEET_ID);
        breakpointClosingMobileRef.current = true;
        moveFocusAfterMobileCloseRef.current =
          activeElement instanceof Node &&
          mobileSheet?.contains(activeElement) === true;
        setMobileOpen(false);
      }

      if (!event.matches && desktopOpenRef.current) {
        const shouldMoveFocus =
          activeElement instanceof Node &&
          desktopPanelRef.current?.contains(activeElement) === true;
        setDesktopOpen(false);

        if (shouldMoveFocus) {
          window.requestAnimationFrame(() => mobileTriggerRef.current?.focus());
        }
      }
    };

    breakpoint.addEventListener("change", handleBreakpointChange);
    return () =>
      breakpoint.removeEventListener("change", handleBreakpointChange);
  }, []);

  const handleDesktopPanelKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key !== "Escape") return;

    event.preventDefault();
    setDesktopOpen(false);
    window.requestAnimationFrame(() => desktopTriggerRef.current?.focus());
  };

  const surfacesAreOpen = desktopOpen || mobileOpen;

  return (
    <section aria-label="Project search and filters">
      <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:flex">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="project-search" className="sr-only">
            Search projects
          </label>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="project-search"
            type="search"
            placeholder="Search projects..."
            value={state.q}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-11 w-full rounded-xl border border-border/70 bg-background pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/80 focus:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring/60 motion-reduce:transition-none"
          />
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              ref={mobileTriggerRef}
              type="button"
              variant="outline"
              aria-label={triggerLabel}
              className="h-11 w-full gap-2 rounded-xl px-4 sm:w-auto lg:hidden"
            >
              <FilterTriggerContent count={filterCount} />
            </Button>
          </SheetTrigger>

          <SheetContent
            id={MOBILE_SHEET_ID}
            side="bottom"
            className="max-h-[min(88dvh,44rem)] gap-0 overflow-hidden rounded-t-3xl p-0 motion-reduce:transition-none motion-reduce:data-open:animate-none motion-reduce:data-closed:animate-none"
            onCloseAutoFocus={(event) => {
              if (!breakpointClosingMobileRef.current) return;

              event.preventDefault();
              if (moveFocusAfterMobileCloseRef.current) {
                desktopTriggerRef.current?.focus();
              }
              breakpointClosingMobileRef.current = false;
              moveFocusAfterMobileCloseRef.current = false;
            }}
          >
            <SheetHeader className="shrink-0 border-b border-border/60 px-5 pb-4 pt-5 pr-14 sm:px-6 sm:pr-14">
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Refine and sort the projects shown below. Changes apply
                immediately.
              </SheetDescription>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-5 sm:px-6">
              <FilterFields
                idPrefix="mobile-project-filter"
                state={state}
                options={options}
                layout="sheet"
                onChange={onAdvancedStateChange}
              />
            </div>

            <SheetFooter className="shrink-0 border-t border-border/60 px-5 pt-4 [padding-bottom:calc(1rem+env(safe-area-inset-bottom))] sm:flex-row sm:px-6">
              <Button
                type="button"
                variant="outline"
                onClick={onResetFiltersAndSort}
                className="h-11 w-full rounded-xl sm:flex-1"
              >
                Reset filters &amp; sort
              </Button>
              <SheetClose asChild>
                <Button
                  type="button"
                  className="h-11 w-full rounded-xl sm:flex-1"
                >
                  View {resultCount} project{resultCount === 1 ? "" : "s"}
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Button
          ref={desktopTriggerRef}
          type="button"
          variant="outline"
          aria-label={triggerLabel}
          aria-expanded={desktopOpen}
          aria-controls={DESKTOP_PANEL_ID}
          onClick={() => setDesktopOpen((open) => !open)}
          className="hidden h-11 gap-2 rounded-xl px-4 lg:inline-flex"
        >
          <FilterTriggerContent count={filterCount} />
        </Button>
      </div>

      <div
        id={DESKTOP_PANEL_ID}
        ref={desktopPanelRef}
        aria-hidden={!desktopOpen}
        className="hidden lg:block"
      >
        <AnimatePresence initial={false}>
          {desktopOpen ? (
            <motion.div
              key="desktop-project-filters"
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : -6,
                transition: { duration: shouldReduceMotion ? 0 : 0.14 },
              }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
              onKeyDown={handleDesktopPanelKeyDown}
              className="mt-4 rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm"
            >
              <FilterFields
                idPrefix="desktop-project-filter"
                state={state}
                options={options}
                layout="desktop"
                onChange={onAdvancedStateChange}
              />
              <div className="mt-4 flex justify-end border-t border-border/50 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onResetFiltersAndSort}
                  className="h-11 rounded-xl px-4"
                >
                  Reset filters &amp; sort
                </Button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {!surfacesAreOpen && summaries.length > 0 ? (
        <div
          className="mt-4 flex flex-wrap items-center gap-2"
          aria-label="Active project filters and sorting"
        >
          {summaries.map((summary) => (
            <button
              key={summary.key}
              type="button"
              aria-label={summary.removeLabel}
              onClick={() => onRemoveSummary(summary.key)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 motion-reduce:transition-none"
            >
              {summary.label}
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ))}
          <Button
            type="button"
            variant="ghost"
            onClick={onResetFiltersAndSort}
            className="h-11 rounded-full px-3 text-xs"
          >
            Reset filters &amp; sort
          </Button>
        </div>
      ) : null}

      <p
        className="mt-4 text-sm text-muted-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        {resultLabel}
      </p>
    </section>
  );
};

export default ProjectCatalogToolbar;
