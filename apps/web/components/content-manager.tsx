"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@classroom/ui/button";
import { Card } from "@classroom/ui/card";
import { Input } from "@classroom/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@classroom/ui/tabs";
import { env } from "@classroom/config/env";
import { z } from "zod";
import { signIn, useSession } from "next-auth/react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const ContentSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  body: z.string(),
  published: z.boolean()
});

type Content = z.infer<typeof ContentSchema>;
type EditableContent = Partial<Content> & { id?: string };

async function fetchContents(accessToken: string): Promise<Content[]> {
  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/content/manage`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    credentials: "include"
  });
  if (!res.ok) throw new Error("Failed to fetch content");
  const json = await res.json();
  const parsed = z.array(ContentSchema).safeParse(json);
  if (!parsed.success) throw parsed.error;
  return parsed.data;
}

export function ContentManager() {
  const { data: session, status } = useSession();
  const [activeContent, setActiveContent] = useState<EditableContent | null>(null);
  const accessToken = session?.accessToken;
  const contents = useQuery({
    queryKey: ["content"],
    queryFn: () => fetchContents(accessToken!),
    enabled: !!accessToken
  });

  const mutation = useMutation({
    mutationFn: async (payload: EditableContent) => {
      if (!accessToken) throw new Error("Tidak terautentikasi");
      const endpoint = payload.id ? `${env.NEXT_PUBLIC_API_URL}/content/${payload.id}` : `${env.NEXT_PUBLIC_API_URL}/content`;
      const response = await fetch(endpoint, {
        method: payload.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Gagal menyimpan konten");
      return response.json();
    },
    onSuccess: () => {
      contents.refetch();
    }
  });

  if (status === "loading") {
    return <div className="p-6 text-sm text-muted-foreground">Memuat sesi pengguna...</div>;
  }

  if (!accessToken) {
    return (
      <Card className="p-10 text-center">
        <h2 className="text-xl font-semibold">Masuk diperlukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">Silakan masuk dengan akun GEMA Classroom untuk mengelola konten.</p>
        <div className="mt-6 flex justify-center">
          <Button onClick={() => signIn("google")}>Masuk dengan Google</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Manajemen Konten</h1>
          <p className="text-sm text-muted-foreground">Kelola pengumuman, kegiatan, dan materi landing page.</p>
        </div>
        <Button onClick={() => setActiveContent({ id: undefined, title: "", slug: "", body: "", published: false })}>
          Konten Baru
        </Button>
      </div>
      <Tabs defaultValue="list" className="grid gap-6" orientation="horizontal">
        <TabsList>
          <TabsTrigger value="list">Daftar</TabsTrigger>
          <TabsTrigger value="editor" disabled={!activeContent}>
            Editor
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="grid gap-4">
          {contents.isLoading ? (
            <p className="text-sm text-muted-foreground">Memuat konten...</p>
          ) : contents.isError ? (
            <p className="text-sm text-destructive">Gagal memuat konten, coba lagi.</p>
          ) : (
            contents.data?.map((item) => (
              <Card key={item.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-lg font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">/{item.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setActiveContent(item)}>
                    Edit
                  </Button>
                  <Button
                    variant={item.published ? "default" : "outline"}
                    onClick={() => mutation.mutate({ id: item.id, published: !item.published })}
                  >
                    {item.published ? "Unpublish" : "Publish"}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="editor">
          {activeContent ? (
            <Card className="space-y-4 p-6">
              <Input
                placeholder="Judul"
                value={activeContent.title ?? ""}
                onChange={(event) => setActiveContent({ ...activeContent, title: event.target.value })}
              />
              <Input
                placeholder="Slug"
                value={activeContent.slug ?? ""}
                onChange={(event) => setActiveContent({ ...activeContent, slug: event.target.value })}
              />
              <MonacoEditor
                height="400px"
                defaultLanguage="markdown"
                value={activeContent.body ?? ""}
                onChange={(value) => setActiveContent({ ...activeContent, body: value ?? "" })}
                options={{ minimap: { enabled: false } }}
              />
              <Button
                onClick={() =>
                  mutation.mutate({
                    id: activeContent.id,
                    title: activeContent.title ?? "",
                    slug: activeContent.slug ?? "",
                    body: activeContent.body ?? "",
                    published: activeContent.published ?? false
                  })
                }
              >
                Simpan
              </Button>
            </Card>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
