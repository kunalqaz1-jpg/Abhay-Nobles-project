import { useEffect, useState } from "react";
import { Link } from "wouter";
import { API_BASE_URL } from "@/shared/api-base";

interface GalleryImg {
  _id: string;
  title: string;
  alt: string;
  category: string;
  imageData: string;
}

const STATIC_FALLBACK: GalleryImg[] = [
  { _id: "s1", title: "School building", alt: "School building", category: "gallery-campus", imageData: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=900&q=80" },
  { _id: "s2", title: "Prize distribution", alt: "Prize distribution", category: "gallery-events", imageData: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80" },
  { _id: "s3", title: "Science lab", alt: "Science lab", category: "gallery-campus", imageData: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80" },
  { _id: "s4", title: "Sports on the ground", alt: "Sports on the ground", category: "gallery-sports", imageData: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80" },
  { _id: "s5", title: "Dance programme", alt: "Dance programme", category: "gallery-cultural", imageData: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=900&q=80" },
  { _id: "s6", title: "Library reading", alt: "Library reading", category: "gallery-campus", imageData: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80" },
  { _id: "s7", title: "Music class", alt: "Music class", category: "gallery-cultural", imageData: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=900&q=80" },
  { _id: "s8", title: "School function", alt: "School function", category: "gallery-events", imageData: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80" },
  { _id: "s9", title: "Sports day", alt: "Sports day", category: "gallery-sports", imageData: "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=900&q=80" },
  { _id: "s10", title: "Drawing activity", alt: "Drawing activity", category: "gallery-cultural", imageData: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=80" },
  { _id: "s11", title: "School bus", alt: "School bus", category: "gallery-campus", imageData: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80" },
  { _id: "s12", title: "Outdoor activity", alt: "Outdoor activity", category: "gallery-events", imageData: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=900&q=80" },
];

const FILTERS = [
  { label: "All", val: "all" },
  { label: "Campus", val: "gallery-campus" },
  { label: "Events", val: "gallery-events" },
  { label: "Sports", val: "gallery-sports" },
  { label: "Art & Culture", val: "gallery-cultural" },
];

function imgSrc(img: GalleryImg) {
  return img.imageData.startsWith("data:") || img.imageData.startsWith("http") ? img.imageData : `data:image/jpeg;base64,${img.imageData}`;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImg[]>([]);
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/gallery-images?section=gallery`)
      .then((r) => r.json())
      .then((data: GalleryImg[]) => {
        setImages(data.length ? data : STATIC_FALLBACK);
      })
      .catch(() => setImages(STATIC_FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const filtered = filter === "all" ? images : images.filter((img) => img.category === filter);

  return (
    <div style={{ minHeight: "100vh", background: "#0b1628", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      {/* Nav */}
      <header style={{ background: "rgba(11,22,40,0.97)", borderBottom: "1px solid rgba(201,168,76,0.15)", padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "1rem", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ color: "#c9a84c", textDecoration: "none", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          ← Back to School
        </Link>
        <span style={{ color: "rgba(255,255,255,0.3)" }}>|</span>
        <span style={{ fontWeight: 600, fontSize: "1rem" }}>Photo Gallery</span>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 1.5rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.12em", color: "#c9a84c", textTransform: "uppercase", marginBottom: "0.75rem" }}>Our Memories</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, margin: 0 }}>
            Photo <em style={{ fontStyle: "italic", color: "#d4b866" }}>Gallery</em>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", marginTop: "1rem", maxWidth: 480, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
            Memories from campus life, events, sports, and cultural celebrations at Shri Abhay Nobles School.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2.5rem" }}>
          {FILTERS.map((f) => (
            <button
              key={f.val}
              type="button"
              onClick={() => setFilter(f.val)}
              style={{
                padding: "0.5rem 1.5rem", borderRadius: 50, border: "1.5px solid",
                borderColor: filter === f.val ? "transparent" : "rgba(255,255,255,0.18)",
                background: filter === f.val ? "linear-gradient(135deg,#c9a84c,#d4b866)" : "transparent",
                color: filter === f.val ? "#0b1628" : "rgba(255,255,255,0.65)",
                fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "rgba(255,255,255,0.4)" }}>Loading photos…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "rgba(255,255,255,0.4)" }}>No photos in this category yet.</div>
        ) : (
          <div style={{ columns: "4 220px", gap: "1rem", columnFill: "balance" }}>
            {filtered.map((img, i) => (
              <div
                key={img._id}
                onClick={() => setLightbox({ src: imgSrc(img), alt: img.alt || img.title })}
                style={{
                  breakInside: "avoid", marginBottom: "1rem", borderRadius: 10, overflow: "hidden",
                  cursor: "zoom-in", position: "relative",
                  height: i % 3 === 0 ? 220 : i % 3 === 1 ? 160 : 260,
                }}
              >
                <img
                  src={imgSrc(img)}
                  alt={img.alt || img.title}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.35s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
                {img.title && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1rem 0.75rem 0.6rem", background: "linear-gradient(to top,rgba(11,22,40,0.9),transparent)", fontSize: "0.8rem", fontWeight: 500, color: "#fff" }}>
                    {img.title}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(5,10,20,0.95)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", cursor: "zoom-out" }}
        >
          <button
            onClick={() => setLightbox(null)}
            style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", width: 44, height: 44, borderRadius: "50%", fontSize: "1.5rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >×</button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "min(1100px,94vw)", maxHeight: "88vh", objectFit: "contain", borderRadius: 10, boxShadow: "0 24px 80px rgba(0,0,0,0.6)", cursor: "default" }}
          />
        </div>
      )}
    </div>
  );
}
