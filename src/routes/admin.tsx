import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { fetchCategories, fetchMenuItems, formatPrice } from "@/lib/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Menyu idarəetməsi — Coffee Co Bakı" },
      {
        name: "description",
        content: "Coffee Co menyusunu idarə edin: kateqoriya və məhsullar.",
      },
      { property: "og:title", content: "Menyu idarəetməsi — Coffee Co" },
      {
        property: "og:description",
        content: "Kateqoriya və məhsulları əlavə edin, redaktə edin, silin.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (!data.session) {
        navigate({ to: "/auth" });
        return;
      }
      const { data: adminCheck } = await supabase.rpc("has_role", {
        _user_id: data.session.user.id,
        _role: "admin",
      });
      if (!active) return;
      setIsAdmin(Boolean(adminCheck));
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    enabled: ready,
  });
  const itemsQuery = useQuery({
    queryKey: ["menu_items"],
    queryFn: fetchMenuItems,
    enabled: ready,
  });

  const categories = categoriesQuery.data ?? [];
  const items = itemsQuery.data ?? [];

  const [catName, setCatName] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category_id: "",
    is_available: true,
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["menu_items"] });
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase
      .from("categories")
      .insert({ name: catName, sort_order: categories.length });
    if (error) {
      toast.error(error.message);
      return;
    }
    setCatName("");
    toast.success("Kateqoriya əlavə olundu");
    refresh();
  }

  async function deleteCategory(id: string) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Kateqoriya silindi");
    refresh();
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("menu_items").insert({
      name: form.name,
      description: form.description || null,
      price: Number(form.price || 0),
      image_url: form.image_url || null,
      category_id: form.category_id || null,
      is_available: form.is_available,
      sort_order: items.length,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setForm({
      name: "",
      description: "",
      price: "",
      image_url: "",
      category_id: "",
      is_available: true,
    });
    toast.success("Məhsul əlavə olundu");
    refresh();
  }

  async function toggleAvailable(id: string, value: boolean) {
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: value })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    refresh();
  }

  async function deleteItem(id: string) {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Məhsul silindi");
    refresh();
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Yüklənir…</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="text-2xl font-semibold">Giriş icazəsi yoxdur</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Bu hesab admin deyil. Menyunu idarə etmək üçün hesabınıza admin rolu
            verilməlidir.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={signOut}>
              Çıxış
            </Button>
            <Button asChild>
              <Link to="/">Ana səhifə</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Menyu idarəetməsi</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/">Sayta bax</Link>
          </Button>
          <Button variant="outline" onClick={signOut}>
            Çıxış
          </Button>
        </div>
      </div>

      <section className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">Kateqoriyalar</h2>
        <form onSubmit={addCategory} className="mt-4 flex gap-2">
          <Input
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="Məsələn: Qəhvə"
            required
          />
          <Button type="submit">Əlavə et</Button>
        </form>
        <ul className="mt-4 divide-y divide-border">
          {categories.length === 0 && (
            <li className="py-3 text-sm text-muted-foreground">
              Hələ kateqoriya yoxdur.
            </li>
          )}
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-3">
              <span>{c.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteCategory(c.id)}
                aria-label={`${c.name} kateqoriyasını sil`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">Yeni məhsul</h2>
        <form onSubmit={addItem} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Ad</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Qiymət (₼)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Təsvir</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Şəkil linki</Label>
            <Input
              id="image"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kateqoriya</Label>
            <select
              id="category"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Seçilməyib</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Switch
              id="available"
              checked={form.is_available}
              onCheckedChange={(v) => setForm({ ...form, is_available: v })}
            />
            <Label htmlFor="available">Mövcuddur</Label>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit">Məhsulu əlavə et</Button>
          </div>
        </form>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">Məhsullar</h2>
        <ul className="mt-4 divide-y divide-border">
          {items.length === 0 && (
            <li className="py-3 text-sm text-muted-foreground">
              Hələ məhsul yoxdur.
            </li>
          )}
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(item.price)}
                  {item.category_id
                    ? ` · ${categories.find((c) => c.id === item.category_id)?.name ?? ""}`
                    : ""}
                </p>
              </div>
              <Switch
                checked={item.is_available}
                onCheckedChange={(v) => toggleAvailable(item.id, v)}
                aria-label="Mövcudluq"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteItem(item.id)}
                aria-label={`${item.name} məhsulunu sil`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
