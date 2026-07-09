import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Archive, ArchiveRestore, Trash2, MoreVertical, Search, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  useUserDocuments,
  useUpdateDocument,
  useDeleteDocument,
  DOC_TYPE_LABEL,
  UserDocType,
} from "@/hooks/useUserDocuments";
import SacredDivider from "@/components/SacredDivider";

const WriterList = () => {
  const navigate = useNavigate();
  const [type, setType] = useState<UserDocType | "all">("all");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<string | null>(null);

  const { data: docs, isLoading } = useUserDocuments({ type, includeArchived, search });
  const updateDoc = useUpdateDocument();
  const deleteDoc = useDeleteDocument();

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
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por título"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={type} onValueChange={(v) => setType(v as UserDocType | "all")}>
              <SelectTrigger className="h-9 flex-1">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {(Object.keys(DOC_TYPE_LABEL) as UserDocType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {DOC_TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch id="arch" checked={includeArchived} onCheckedChange={setIncludeArchived} />
              <Label htmlFor="arch" className="text-xs text-muted-foreground">
                Arquivados
              </Label>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {isLoading ? (
            <>
              <div className="h-24 animate-pulse rounded-2xl bg-muted/40" />
              <div className="h-24 animate-pulse rounded-2xl bg-muted/40" />
            </>
          ) : !docs || docs.length === 0 ? (
            <Card className="rounded-2xl p-8 text-center">
              <p className="text-sm text-muted-foreground">
                {search
                  ? "Nenhum resultado encontrado."
                  : "Você ainda não tem documentos. Toque em Novo para começar."}
              </p>
            </Card>
          ) : (
            docs.map((d) => (
              <Card key={d.id} className="rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <button
                    className="flex-1 text-left"
                    onClick={() => navigate(`/writer/${d.id}`)}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {DOC_TYPE_LABEL[d.type]}
                      </Badge>
                      {d.is_archived && (
                        <Badge variant="outline" className="text-[10px]">
                          Arquivado
                        </Badge>
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
                    {d.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {d.tags.map((t) => (
                          <Badge key={t} variant="outline" className="text-[10px]">
                            {t}
                          </Badge>
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
                        onClick={() =>
                          updateDoc.mutate({ id: d.id, is_archived: !d.is_archived })
                        }
                      >
                        {d.is_archived ? (
                          <>
                            <ArchiveRestore size={14} className="mr-2" /> Desarquivar
                          </>
                        ) : (
                          <>
                            <Archive size={14} className="mr-2" /> Arquivar
                          </>
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
            <AlertDialogDescription>
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
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
