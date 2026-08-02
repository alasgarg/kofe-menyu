import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Coffee, Instagram, MapPin, Clock, Phone } from "lucide-react";

import heroImage from "@/assets/hero-coffee.jpg";
import logo from "@/assets/logo.png";
import { fetchCategories, fetchMenuItems, formatPrice } from "@/lib/menu";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Coffee Co Bakı — Menyu, Qəhvə və Desertlər" },
      {
        name: "description",
        content:
          "Coffee Co Bakı menyusu: ixtisaslaşmış qəhvə, desertlər və yüngül yeməklər. Ünvan, iş saatları və əlaqə.",
      },
      { property: "og:title", content: "Coffee Co Bakı — Menyu" },
      {
        property: "og:description",
        content:
          "İxtisaslaşmış qəhvə, ev desertləri və rahat atmosfer. Menyumuza baxın.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const itemsQuery = useQuery({ queryKey: ["menu_items"], queryFn: fetchMenuItems });

  const categories = categoriesQuery.data ?? [];
  const items = itemsQuery.data ?? [];
  const visibleItems = activeCategory
    ? items.filter((i) => i.category_id === activeCategory)
    : items;

  return (
    <main>
      <header className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt="Fincana tökülən espresso"
          width={1600}
          height={900}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pt-24 pb-16 text-center">
          <img
            src={logo}
            alt="Coffee Co loqosu"
            width={816}
            height={816}
            className="h-24 w-24 rounded-full bg-card p-2 shadow-warm"
          />
          <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl">
            Coffee Co
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Qəhvə · Desert · Yüngül yeməklər
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2">
              <MapPin className="h-4 w-4 text-primary" aria-hidden />
              Bakı şəhəri
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2">
              <Clock className="h-4 w-4 text-primary" aria-hidden />
              09:00 – 23:00
            </span>
            <a
              href="https://www.instagram.com/coffeeco_baku/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 transition-colors hover:border-primary"
            >
              <Instagram className="h-4 w-4 text-primary" aria-hidden />
              @coffeeco_baku
            </a>
          </div>
          <Button asChild size="lg" className="mt-8 rounded-full px-8">
            <a href="#menyu">Menyuya bax</a>
          </Button>
        </div>
      </header>

      <section id="menyu" className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-semibold">Menyu</h2>
          <p className="mt-2 text-muted-foreground">
            Hər gün təzə dəmlənən qəhvə və evdə hazırlanan desertlər
          </p>
        </div>

        {categories.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`rounded-full border px-5 py-2 text-sm transition-colors ${
                activeCategory === null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary"
              }`}
            >
              Hamısı
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`rounded-full border px-5 py-2 text-sm transition-colors ${
                  activeCategory === c.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-10">
          {itemsQuery.isLoading ? (
            <p className="text-center text-muted-foreground">Yüklənir…</p>
          ) : visibleItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
              <Coffee className="mx-auto h-10 w-10 text-primary" aria-hidden />
              <p className="mt-4 text-lg font-medium">Menyu hazırlanır</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Məhsullar tezliklə əlavə olunacaq. İdarə panelindən menyunu
                doldura bilərsiniz.
              </p>
              <Button asChild variant="outline" className="mt-6 rounded-full">
                <Link to="/admin">İdarə paneli</Link>
              </Button>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {visibleItems.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-4"
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      loading="lazy"
                      className="h-24 w-24 shrink-0 rounded-xl object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="truncate text-lg font-semibold">
                        {item.name}
                      </h3>
                      <span className="shrink-0 font-semibold text-primary">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                    {!item.is_available && (
                      <p className="mt-2 text-xs text-destructive">
                        Hazırda mövcud deyil
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-10 text-center text-sm text-muted-foreground">
          <p className="inline-flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" aria-hidden />
            Rezervasiya üçün Instagram vasitəsilə yazın
          </p>
          <p>© {new Date().getFullYear()} Coffee Co Bakı</p>
          <Link to="/admin" className="underline-offset-4 hover:underline">
            İdarə paneli
          </Link>
        </div>
      </footer>
    </main>
  );
}
