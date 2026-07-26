import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Archive, ArchiveRestore, Trash2, MoreVertical, Search, PenLine, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  useUpdateDocument,
  useDeleteDocument,
  DOC_TYPE_LABEL,
  UserDocType,
} from "@/hooks/useUserDocuments";
import { useWriterSearch, emptyWriterFilters, WriterSearchFilters } from "@/hooks/useWriterSearch";
import { BIBLE_BOOKS } from "@/lib/bible-books";
import SacredDivider from "@/components/SacredDivider";

const WriterList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [type, setType] = useState<UserDocType | "all">("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Init filters from URL (?book=&chapter=&verse=)
  const [filters, setFilters] = useState<WriterSearchFilters>(() => ({
    ...emptyWriterFilters,
    bookSlug: searchParams.get("book") ?? "",
    chapter: searchParams.get("chapter") ? Number(searchParams.get("chapter")) : null,
    verse: searchParams.get("verse") ? Number(searchParams.get("verse")) : null,
  }));

  const { data, isLoading } = useWriterSearch(filters, 100, 0);
  const updateDoc = useUpdateDocument();
  const deleteDoc = useDeleteDocument();

  // Client-side type filter (RPC doesn't take type; small dataset already scoped by user)
  const docs = useMemo(() => {
    const rows = data?.rows ?? [];
    if (type === "all") return rows;
    return rows.filter((d) => d.type === type);
  }, [data, type]);

  const total = data?.total ?? 0;
  const shown = docs.length;

  const hasRefFilter = !!filters.bookSlug;
  const activeFiltersCount =
    (filters.tag ? 1 : 0) +
    (filters.archived !== "active" ? 1 : 0) +
    (hasRefFilter ? 1 : 0);

  // Keep URL in sync with reference filter (for back/forward + deep links)
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (filters.bookSlug) next.set("book", filters.bookSlug);
    else next.delete("book");
    if (filters.chapter) next.set("chapter", String(filters.chapter));
    else next.delete("chapter");
    if (filters.verse) next.set("verse", String(filters.verse));
    else next.delete("verse");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.bookSlug, filters.chapter, filters.verse]);

  const clearRefFilter = () =>
    setFilters((f) => ({ ...f, bookSlug: "", chapter: null, verse: null }));

  const selectedBook = BIBLE_BOOKS.find((b) => b.slug === filters.bookSlug);

  return (
    <div className="min-h-screen pb-32">
      <div className="mx-auto max-w-lg px-5 pt-12">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Escritor</p>
            <h1 className="mt-2 flex items-center gap-2 font-serif text-3xl font-semibold">
              <PenLine size={26} className="text-accent" /> Meus documentos
            </h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="rounded-full">
                <Plus size={16} className="mr-1" /> Novo
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(DOC_TYPE_LABEL) as UserDocType[]).map((t) => (
                <DropdownMenuItem key={t} onClick={() => navigate(`/writer/new?type=${t}`)}>
                  {DOC_TYPE_LABEL[t]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <SacredDivider className="mt-5" />

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, tag ou conteúdo"
                value={filters.query}
                onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
                className="pl-9 rounded-full"
              />
            </div>
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full relative" aria-label="Filtros">
                  <SlidersHorizontal size={16} />
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-sm">
                <SheetHeader>
                  <SheetTitle className="font-serif">Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs">Tipo</Label>
                    <Select value={type} onValueChange={(v) => setType(v as UserDocType | "all")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {(Object.keys(DOC_TYPE_LABEL) as UserDocType[]).map((t) => (
                          <SelectItem key={t} value={t}>{DOC_TYPE_LABEL[t]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Status</Label>
                    <Select
                      value={filters.archived}
                      onValueChange={(v) => setFilters((f) => ({ ...f, archived: v as WriterSearchFilters["archived"] }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativos</SelectItem>
                        <SelectItem value="archived">Arquivados</SelectItem>
                        <SelectItem value="all">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Tag</Label>
                    <Input
                      placeholder="ex.: fé, esperança"
                      value={filters.tag}
                      onChange={(e) => setFilters((f) => ({ ...f, tag: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">Referência bíblica</Label>
                      {hasRefFilter && (
                        <button
                          type="button"
                          onClick={clearRefFilter}
                          className="text-[11px] text-muted-foreground hover:text-foreground"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                    <Select
                      value={filters.bookSlug || "__none__"}
                      onValueChange={(v) =>
                        setFilters((f) => ({
                          ...f,
                          bookSlug: v === "__none__" ? "" : v,
                          chapter: v === "__none__" ? null : f.chapter,
                          verse: v === "__none__" ? null : f.verse,
                        }))
                      }
                    >
                      <SelectTrigger><SelectValue placeholder="Livro" /></SelectTrigger>
                      <SelectContent className="max-h-72">
                        <SelectItem value="__none__">Qualquer livro</SelectItem>
                        {BIBLE_BOOKS.map((b) => (
                          <SelectItem key={b.slug} value={b.slug}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={selectedBook?.chapters}
                        placeholder="Capítulo"
                        disabled={!filters.bookSlug}
                        value={filters.chapter ?? ""}
                        onChange={(e) =>
                          setFilters((f) => ({ ...f, chapter: e.target.value ? Number(e.target.value) : null }))
                        }
                      />
                      <Input
                        type="number"
                        min={1}
                        placeholder="Verso (opc.)"
                        disabled={!filters.bookSlug || !filters.chapter}
                        value={filters.verse ?? ""}
                        onChange={(e) =>
                          setFilters((f) => ({ ...f, verse: e.target.value ? Number(e.target.value) : null }))
                        }
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => { setFilters(emptyWriterFilters); setType("all"); }}
                  >
                    Limpar todos
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {hasRefFilter && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                {selectedBook?.name ?? filters.bookSlug}
                {filters.chapter ? ` ${filters.chapter}` : ""}
                {filters.verse ? `:${filters.verse}` : ""}
                <button onClick={clearRefFilter} aria-label="Remover filtro">
                  <X size={12} />
                </button>
              </Badge>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {isLoading ? "Buscando…" : `${shown} de ${total} resultado${total === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {isLoading ? (
            <>
              <div className="h-24 animate-pulse rounded-2xl bg-muted/40" />
              <div className="h-24 animate-pulse rounded-2xl bg-muted/40" />
            </>
          ) : docs.length === 0 ? (
            <Card className="rounded-2xl p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum resultado. Ajuste os filtros ou toque em Novo.
              </p>
            </Card>
          ) : (
            docs.map((d) => (
              <Card key={d.id} className="rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <button className="flex-1 text-left" onClick={() => navigate(`/writer/${d.id}`)}>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {DOC_TYPE_LABEL[d.type as UserDocType]}
                      </Badge>
                      {d.is_archived && (
                        <Badge variant="outline" className="text-[10px]">Arquivado</Badge>
                      )}
                    </div>
                    <h3 className="mt-2 font-semibold text-foreground">
                      {d.title || "(sem título)"}
                    </h3>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Atualizado em{" "}
                      {new Date(d.updated_at).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                    {d.tags?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {d.tags.map((t) => (
                          <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                        ))}
                      </div>
                    )}
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Ações">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => updateDoc.mutate({ id: d.id, is_archived: !d.is_archived })}
                      >
                        {d.is_archived ? (
                          <><ArchiveRestore size={14} className="mr-2" /> Desarquivar</>
                        ) : (
                          <><Archive size={14} className="mr-2" /> Arquivar</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setToDelete(d.id)}
                      >
                        <Trash2 size={14} className="mr-2" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toDelete) deleteDoc.mutate(toDelete);
                setToDelete(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WriterList;
