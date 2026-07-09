import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { syncDocumentRefs, bookOrderIndex } from "@/lib/document-refs";

export interface UserDocumentRef {
  id: string;
  document_id: string;
  user_id: string;
  ref_raw: string;
  book_slug: string;
  chapter: number;
  verse_start: number | null;
  verse_end: number | null;
  created_at: string;
}

export type UserDocType = "sermon" | "devotional" | "study" | "note";

export interface UserDocument {
  id: string;
  user_id: string;
  type: UserDocType;
  title: string;
  content_md: string;
  tags: string[];
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export const DOC_TYPE_LABEL: Record<UserDocType, string> = {
  sermon: "Sermão",
  devotional: "Devocional",
  study: "Estudo",
  note: "Nota",
};

export const useUserDocuments = (opts?: {
  type?: UserDocType | "all";
  includeArchived?: boolean;
  search?: string;
}) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user_documents", user?.id, opts],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase
        .from("user_documents")
        .select("*")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
      if (opts?.type && opts.type !== "all") q = q.eq("type", opts.type);
      if (!opts?.includeArchived) q = q.eq("is_archived", false);
      if (opts?.search && opts.search.trim()) q = q.ilike("title", `%${opts.search.trim()}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as UserDocument[];
    },
  });
};

export const useUserDocument = (id: string | undefined) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user_document", id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_documents")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as UserDocument | null;
    },
  });
};

export const useCreateDocument = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { type: UserDocType; title?: string; content_md?: string; tags?: string[] }) => {
      const { data, error } = await supabase
        .from("user_documents")
        .insert({
          user_id: user!.id,
          type: input.type,
          title: input.title ?? "",
          content_md: input.content_md ?? "",
          tags: input.tags ?? [],
        })
        .select()
        .single();
      if (error) throw error;
      const doc = data as UserDocument;
      try {
        await syncDocumentRefs(doc.id, user!.id, doc.content_md);
      } catch (e) {
        console.error("syncDocumentRefs failed:", e);
      }
      return doc;
    },
    onSuccess: (doc) => {
      qc.invalidateQueries({ queryKey: ["user_documents"] });
      qc.invalidateQueries({ queryKey: ["user_document_refs", doc.id] });
      toast.success("Documento criado");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao criar"),
  });
};

export const useUpdateDocument = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; title?: string; content_md?: string; tags?: string[]; is_archived?: boolean }) => {
      const { id, ...patch } = input;
      const { data, error } = await supabase
        .from("user_documents")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      const doc = data as UserDocument;
      if (user && typeof input.content_md === "string") {
        try {
          await syncDocumentRefs(doc.id, user.id, doc.content_md);
        } catch (e) {
          console.error("syncDocumentRefs failed:", e);
        }
      }
      return doc;
    },
    onSuccess: (doc) => {
      qc.invalidateQueries({ queryKey: ["user_documents"] });
      qc.invalidateQueries({ queryKey: ["user_document", doc.id] });
      qc.invalidateQueries({ queryKey: ["user_document_refs", doc.id] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao salvar"),
  });
};

export const useDocumentRefs = (documentId: string | undefined) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user_document_refs", documentId],
    enabled: !!user && !!documentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_document_refs")
        .select("*")
        .eq("document_id", documentId!);
      if (error) throw error;
      const rows = (data ?? []) as UserDocumentRef[];
      rows.sort((a, b) => {
        const ao = bookOrderIndex(a.book_slug);
        const bo = bookOrderIndex(b.book_slug);
        if (ao !== bo) return ao - bo;
        if (a.chapter !== b.chapter) return a.chapter - b.chapter;
        return (a.verse_start ?? 0) - (b.verse_start ?? 0);
      });
      return rows;
    },
  });
};

export const useDeleteDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_documents").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_documents"] });
      toast.success("Documento excluído");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao excluir"),
  });
};
