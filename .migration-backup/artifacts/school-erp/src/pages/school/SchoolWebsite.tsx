import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

const GALLERY_ITEMS = [
  { src: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=900&q=80", alt: "School building", cat: "campus" },
  { src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80", alt: "Prize distribution", cat: "events" },
  { src: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80", alt: "Science lab", cat: "campus" },
  { src: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80", alt: "Sports on the ground", cat: "sports" },
  { src: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=900&q=80", alt: "Dance programme", cat: "cultural" },
  { src: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80", alt: "Library reading", cat: "campus" },
  { src: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=900&q=80", alt: "Music class", cat: "cultural" },
  { src: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80", alt: "School function", cat: "events" },
  { src: "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=900&q=80", alt: "Sports day", cat: "sports" },
  { src: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=80", alt: "Drawing activity", cat: "cultural" },
  { src: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80", alt: "School bus", cat: "campus" },
  { src: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=900&q=80", alt: "Outdoor school activity", cat: "events" },
];

export default function SchoolWebsite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("Pre-Primary");
  const [galleryFilter, setGalleryFilter] = useState("all");
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [admitSubmitted, setAdmitSubmitted] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const barsAnimated = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const sy = window.scrollY;
      setScrolled(sy > 50);
      setShowBackTop(sy > 400);
      if (!barsAnimated.current && sy > 400) {
        barsAnimated.current = true;
        document.querySelectorAll<HTMLElement>(".result-bar-fill").forEach((el) => {
          el.style.width = el.dataset.width ?? "0%";
        });
      }
      document.querySelectorAll<HTMLElement>(".reveal,.reveal-left,.reveal-right").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight - 80) el.classList.add("visible");
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const t = testimonialIdx;
  const testimonials = [
    { stars: "★★★★★", text: "Enrolling our daughter at Abhay Nobles was the best decision we ever made. The teachers are incredibly dedicated, the facilities are outstanding, and she has grown not just academically but as a person. This school truly cares.", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80", name: "Ms. Nisha", role: "Mother of Priya Sharma · Class 10" },
    { stars: "★★★★★", text: "My son went from a shy student to a confident national-level science olympiad winner. The faculty here doesn't just teach — they mentor, they motivate, and they believe in every child's potential.", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80", name: "Mr. Vivek", role: "Father of Arjun Patel · Class 12" },
    { stars: "★★★★★", text: "I am proud to be an alumnus of Abhay Nobles. The discipline, values, and education I received here shaped my entire career. I secured IIT Bombay rank 142 — and I owe it all to this wonderful institution.", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80", name: "Mr. Lalit", role: "IIT Bombay · Batch of 2011 · Alumni" },
  ];

  const filteredGallery = galleryFilter === "all" ? GALLERY_ITEMS : GALLERY_ITEMS.filter((g) => g.cat === galleryFilter);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        :root {
          --navy:#0B1628;--navy-mid:#132040;--navy-light:#1E3060;
          --gold:#C9A84C;--gold-light:#E2C97E;--gold-pale:#F5E9C8;
          --cream:#FAF7F0;--white:#FFFFFF;--slate:#64748B;--slate-light:#94A3B8;
          --text-dark:#0F1C35;--text-body:#334155;
          --glass:rgba(255,255,255,0.07);--glass-border:rgba(201,168,76,0.2);
          --shadow-gold:0 8px 48px rgba(201,168,76,0.15);--shadow-navy:0 8px 48px rgba(11,22,40,0.18);
          --radius:16px;--radius-sm:8px;
          --transition:0.4s cubic-bezier(0.25,0.46,0.45,0.94);
          --font-display:'Cormorant Garamond',serif;--font-body:'Outfit',sans-serif;
        }
        .sw-root*,.sw-root*::before,.sw-root*::after{box-sizing:border-box;margin:0;padding:0;}
        .sw-root{font-family:var(--font-body);color:var(--text-body);background:var(--cream);overflow-x:hidden;}
        .sw-root a{text-decoration:none;color:inherit;}
        .sw-root ul{list-style:none;}
        .sw-root img{max-width:100%;display:block;}
        .display-xl{font-family:var(--font-display);font-size:clamp(2.8rem,6vw,5.5rem);font-weight:700;line-height:1.1;letter-spacing:-0.01em;}
        .display-lg{font-family:var(--font-display);font-size:clamp(2.2rem,4.5vw,4rem);font-weight:600;line-height:1.15;}
        .display-md{font-family:var(--font-display);font-size:clamp(1.8rem,3vw,2.8rem);font-weight:600;line-height:1.2;}
        .section-label{font-size:0.75rem;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold);display:flex;align-items:center;gap:0.75rem;}
        .section-label::before{content:'';width:32px;height:1.5px;background:var(--gold);flex-shrink:0;}
        .body-lg{font-size:1.125rem;line-height:1.7;}
        .body-md{font-size:1rem;line-height:1.65;}
        .container{max-width:1280px;margin:0 auto;padding:0 max(2rem,env(safe-area-inset-left));}
        .container-sm{max-width:900px;margin:0 auto;padding:0 2rem;}
        .section-pad{padding:100px 0;}
        .section-pad-lg{padding:140px 0;}
        .text-center{text-align:center;}
        .text-gold{color:var(--gold);}
        .text-white{color:var(--white);}
        .text-navy{color:var(--navy);}
        .gold-line{width:60px;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold-light));margin:1.25rem 0;}
        .gold-line.center{margin:1.25rem auto;}
        .btn{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0.85rem 2rem;border-radius:50px;font-family:var(--font-body);font-size:0.9rem;font-weight:600;cursor:pointer;transition:var(--transition);border:2px solid transparent;white-space:nowrap;touch-action:manipulation;}
        .btn-gold{background:linear-gradient(135deg,var(--gold),var(--gold-light));color:var(--navy);}
        .btn-gold:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(201,168,76,0.4);}
        .btn-outline{background:transparent;border-color:rgba(255,255,255,0.5);color:var(--white);}
        .btn-outline:hover{background:rgba(255,255,255,0.12);border-color:var(--white);transform:translateY(-2px);}
        .btn-outline-dark{background:transparent;border-color:var(--navy);color:var(--navy);}
        .btn-outline-dark:hover{background:var(--navy);color:var(--white);transform:translateY(-2px);}
        .btn-lg{padding:1rem 2.5rem;font-size:1rem;}
        .btn svg{width:18px;height:18px;}

        /* Navbar */
        #sw-navbar{position:fixed;top:0;left:0;right:0;z-index:1100;padding:0 2rem;transition:all 0.4s ease;}
        #sw-navbar .nav-inner{max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:1.25rem 0;transition:all 0.4s ease;}
        #sw-navbar.scrolled{background:rgba(11,22,40,0.97);backdrop-filter:blur(20px);box-shadow:0 2px 40px rgba(0,0,0,0.3);}
        .nav-logo{display:flex;align-items:center;gap:0.85rem;}
        .nav-logo-icon{width:48px;height:48px;border-radius:12px;object-fit:cover;border:2px solid rgba(255,255,255,0.2);background:#fcfcfc;}
        .nav-logo-name{font-family:var(--font-display);font-size:1.2rem;font-weight:700;color:var(--white);line-height:1.1;display:block;}
        .nav-logo-tag{font-size:0.65rem;color:var(--gold-light);letter-spacing:0.1em;text-transform:uppercase;font-weight:500;display:block;}
        .nav-links{display:flex;align-items:center;gap:0.25rem;list-style:none;}
        .nav-links>li{position:relative;}
        .nav-links>li>a{position:relative;padding:0.5rem 0.9rem;color:rgba(255,255,255,0.85);font-size:0.88rem;font-weight:500;border-radius:6px;transition:color 0.25s ease,background 0.25s ease;display:flex;align-items:center;gap:0.3rem;}
        .nav-links>li>a::after{content:'';position:absolute;left:0;right:0;top:100%;height:18px;}
        .nav-links>li>a:hover{color:var(--gold-light);background:rgba(255,255,255,0.08);}
        .sw-dropdown{position:absolute;top:calc(100% + 10px);left:0;background:var(--navy-mid);border:1px solid var(--glass-border);border-radius:12px;min-width:200px;padding:0.5rem;opacity:0;visibility:hidden;transform:translate3d(0,-12px,0) scale(0.97);transform-origin:top center;pointer-events:none;box-shadow:0 20px 60px rgba(0,0,0,0.4);transition:opacity 0.32s,transform 0.42s cubic-bezier(0.22,1,0.36,1),visibility 0s linear 0.45s;}
        .nav-links>li:hover .sw-dropdown{opacity:1;visibility:visible;transform:translate3d(0,0,0) scale(1);pointer-events:auto;transition:opacity 0.3s,transform 0.42s cubic-bezier(0.22,1,0.36,1),visibility 0s linear 0s;}
        .sw-dropdown a{display:block;padding:0.6rem 1rem;color:rgba(255,255,255,0.8);font-size:0.85rem;border-radius:8px;transition:background 0.2s,color 0.2s,transform 0.22s;}
        .sw-dropdown a:hover{background:rgba(201,168,76,0.12);color:var(--gold-light);transform:translateX(3px);}
        .nav-cta{display:flex;align-items:center;gap:0.75rem;}
        .nav-cta-btn{padding:0.6rem 1.25rem;font-size:0.82rem;}
        .nav-burger{display:none;width:44px;height:44px;padding:0;cursor:pointer;border:none;background:transparent;color:rgba(255,255,255,0.92);z-index:1110;flex-shrink:0;position:relative;}
        .nav-burger span{position:absolute;left:10px;right:10px;height:2px;background:currentColor;border-radius:2px;transition:transform 0.42s cubic-bezier(0.22,1,0.36,1),top 0.42s cubic-bezier(0.22,1,0.36,1),opacity 0.26s ease;}
        .nav-burger span:nth-child(1){top:14px;}
        .nav-burger span:nth-child(2){top:21px;}
        .nav-burger span:nth-child(3){top:28px;}
        .nav-burger.open span:nth-child(1){top:21px;transform:rotate(45deg);}
        .nav-burger.open span:nth-child(2){opacity:0;transform:scaleX(0);}
        .nav-burger.open span:nth-child(3){top:21px;transform:rotate(-45deg);}
        .mobile-menu{position:fixed;top:0;right:-100%;width:min(360px,100%);height:100vh;height:100dvh;background:var(--navy);z-index:1090;padding:5rem max(1.25rem,env(safe-area-inset-right)) 2rem max(1.25rem,env(safe-area-inset-left));transition:right 0.4s cubic-bezier(0.25,0.46,0.45,0.94);overflow-y:auto;box-shadow:-20px 0 60px rgba(0,0,0,0.5);}
        .mobile-menu.open{right:0;}
        .mobile-menu a,.mobile-menu button{display:block;padding:0.85rem 0;color:rgba(255,255,255,0.85);font-size:1rem;font-weight:500;border-bottom:1px solid rgba(255,255,255,0.08);transition:color 0.2s;background:none;border-top:none;border-left:none;border-right:none;text-align:left;cursor:pointer;font-family:inherit;width:100%;}
        .mobile-menu a:hover,.mobile-menu button:hover{color:var(--gold-light);}
        .mobile-menu-cta{margin-top:2rem;display:flex;flex-direction:column;gap:0.75rem;}
        .mobile-menu-cta .btn{width:100%;justify-content:center;}
        .sw-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:1080;opacity:0;visibility:hidden;transition:opacity 0.3s ease,visibility 0.3s ease;}
        .sw-overlay.open{opacity:1;visibility:visible;}

        /* Announcement Bar */
        .announcement-bar{background:linear-gradient(90deg,var(--navy-mid),var(--navy-light));border-bottom:1px solid rgba(201,168,76,0.2);padding:0.7rem 0;overflow:hidden;}
        .marquee-track{display:flex;align-items:center;gap:3rem;animation:swMarquee 30s linear infinite;white-space:nowrap;}
        .marquee-track:hover{animation-play-state:paused;}
        .marquee-item{font-size:0.82rem;color:rgba(255,255,255,0.75);display:flex;align-items:center;gap:0.75rem;flex-shrink:0;}
        .marquee-dot{width:5px;height:5px;background:var(--gold);border-radius:50%;flex-shrink:0;}
        @keyframes swMarquee{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}

        /* Hero */
        #hero{min-height:100vh;position:relative;display:flex;align-items:center;overflow:hidden;background:var(--navy);}
        .hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 80% at 60% 50%,rgba(30,48,96,0.8) 0%,transparent 70%),radial-gradient(ellipse 50% 60% at 20% 80%,rgba(201,168,76,0.08) 0%,transparent 60%),linear-gradient(135deg,#060e1e 0%,#0B1628 40%,#132040 100%);}
        .hero-grid-bg{position:absolute;inset:0;background-image:linear-gradient(rgba(201,168,76,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.04) 1px,transparent 1px);background-size:80px 80px;mask-image:radial-gradient(ellipse 70% 70% at 50% 50%,black,transparent);}
        .hero-orb{position:absolute;border-radius:50%;filter:blur(80px);animation:swFloat 8s ease-in-out infinite;}
        .hero-orb-1{width:600px;height:600px;background:radial-gradient(circle,rgba(201,168,76,0.12) 0%,transparent 70%);top:-200px;right:-100px;}
        .hero-orb-2{width:400px;height:400px;background:radial-gradient(circle,rgba(30,48,96,0.6) 0%,transparent 70%);bottom:-100px;left:10%;animation-delay:-4s;}
        @keyframes swFloat{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-30px) scale(1.05);}}
        .hero-content{position:relative;z-index:2;padding:160px 0 100px;width:100%;}
        .hero-grid-layout{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;}
        .hero-badge{display:inline-flex;align-items:center;gap:0.6rem;background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.3);border-radius:50px;padding:0.45rem 1.1rem;margin-bottom:1.5rem;font-size:0.78rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--gold-light);}
        .hero-badge span{width:6px;height:6px;background:var(--gold);border-radius:50%;animation:swPulse 2s ease-in-out infinite;}
        @keyframes swPulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(0.8);}}
        .hero-heading{margin-bottom:1.5rem;}
        .hero-heading em{font-style:italic;color:var(--gold-light);}
        .hero-sub{color:rgba(255,255,255,0.65);margin-bottom:2.5rem;max-width:520px;font-size:1.1rem;line-height:1.7;}
        .hero-btns{display:flex;flex-wrap:wrap;gap:1rem;margin-bottom:3rem;}
        .hero-trust{display:flex;align-items:center;gap:1.5rem;}
        .hero-trust-stars{color:var(--gold);font-size:0.9rem;}
        .hero-trust-text{font-size:0.85rem;color:rgba(255,255,255,0.55);}
        .hero-trust-text strong{color:rgba(255,255,255,0.85);}
        .hero-stats-card{background:rgba(255,255,255,0.04);border:1px solid rgba(201,168,76,0.15);border-radius:var(--radius);padding:2.5rem;backdrop-filter:blur(20px);position:relative;overflow:hidden;}
        .stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:2rem;}
        .stat-item{text-align:center;}
        .stat-number{font-family:var(--font-display);font-size:3rem;font-weight:700;color:var(--gold-light);line-height:1;}
        .stat-number span{font-size:1.5rem;}
        .stat-label{font-size:0.8rem;color:rgba(255,255,255,0.5);margin-top:0.35rem;letter-spacing:0.05em;text-transform:uppercase;}
        .scroll-indicator{position:absolute;bottom:2rem;left:50%;transform:translateX(-50%);z-index:2;display:flex;flex-direction:column;align-items:center;gap:0.5rem;color:rgba(255,255,255,0.4);font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;animation:swBounce 2.5s ease-in-out infinite;}
        .scroll-indicator svg{width:20px;height:20px;}
        @keyframes swBounce{0%,100%{transform:translateX(-50%) translateY(0);}50%{transform:translateX(-50%) translateY(8px);}}

        /* About */
        #about{background:var(--cream);}
        .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:5rem;align-items:center;}
        .about-img-wrap{position:relative;}
        .about-main-img{width:100%;aspect-ratio:4/5;border-radius:20px;position:relative;z-index:1;background:linear-gradient(135deg,var(--navy-mid),var(--navy-light));display:flex;align-items:center;justify-content:center;overflow:hidden;}
        .about-main-img img{width:100%;height:100%;object-fit:cover;}
        .about-float-card{position:absolute;bottom:-2rem;right:-2rem;z-index:2;background:var(--white);border-radius:16px;padding:1.5rem 2rem;box-shadow:0 20px 60px rgba(11,22,40,0.15);display:flex;align-items:center;gap:1.25rem;}
        .about-float-icon{width:52px;height:52px;background:linear-gradient(135deg,var(--gold),var(--gold-light));border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;}
        .about-float-num{font-family:var(--font-display);font-size:2rem;font-weight:700;color:var(--navy);line-height:1;}
        .about-float-label{font-size:0.8rem;color:var(--slate);}
        .about-accent-bar{position:absolute;top:-1.5rem;left:-1.5rem;width:120px;height:120px;border:2px solid var(--gold);border-radius:16px;opacity:0.2;z-index:0;}
        .about-pillars{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:2rem;}
        .about-pillar{display:flex;align-items:flex-start;gap:0.75rem;}
        .about-pillar-icon{width:36px;height:36px;background:linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.08));border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;margin-top:0.1rem;}
        .about-pillar-name{font-weight:600;font-size:0.9rem;color:var(--navy);}
        .about-pillar-desc{font-size:0.82rem;color:var(--slate);margin-top:0.2rem;}

        /* Why */
        #why{background:var(--navy);}
        .why-header{text-align:center;margin-bottom:4rem;}
        .why-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem;}
        .why-card{background:rgba(255,255,255,0.04);border:1px solid rgba(201,168,76,0.1);border-radius:var(--radius);padding:2rem 1.75rem;transition:var(--transition);cursor:default;position:relative;overflow:hidden;}
        .why-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(201,168,76,0.08) 0%,transparent 60%);opacity:0;transition:opacity 0.4s;}
        .why-card:hover{transform:translateY(-6px);border-color:rgba(201,168,76,0.3);box-shadow:var(--shadow-gold);}
        .why-card:hover::before{opacity:1;}
        .why-card-icon{font-size:2rem;margin-bottom:1.25rem;display:block;}
        .why-card-title{font-family:var(--font-display);font-size:1.25rem;font-weight:600;color:var(--white);margin-bottom:0.5rem;}
        .why-card-desc{font-size:0.88rem;color:rgba(255,255,255,0.5);line-height:1.6;}
        .why-card-num{position:absolute;top:1.5rem;right:1.75rem;font-family:var(--font-display);font-size:2.5rem;font-weight:700;color:rgba(201,168,76,0.07);}

        /* Academics */
        #academics{background:var(--cream);}
        .academics-grid{display:grid;grid-template-columns:1fr 1fr;gap:5rem;align-items:start;}
        .class-tabs{display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:2rem;}
        .class-tab{padding:0.5rem 1.25rem;border-radius:50px;font-size:0.85rem;font-weight:500;border:1.5px solid rgba(11,22,40,0.2);color:var(--navy);cursor:pointer;transition:all 0.25s;background:transparent;font-family:var(--font-body);}
        .class-tab.active,.class-tab:hover{background:var(--navy);color:var(--gold-light);border-color:var(--navy);}
        .acad-features{display:grid;gap:1rem;}
        .acad-feature{display:flex;align-items:flex-start;gap:1rem;padding:1.25rem;background:var(--white);border-radius:12px;box-shadow:0 2px 16px rgba(11,22,40,0.06);transition:all 0.25s;}
        .acad-feature:hover{transform:translateX(4px);box-shadow:0 4px 24px rgba(11,22,40,0.1);}
        .acad-feature-icon{width:44px;height:44px;background:linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.08));border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;}
        .acad-feature-title{font-weight:600;color:var(--navy);font-size:0.95rem;}
        .acad-feature-desc{font-size:0.82rem;color:var(--slate);margin-top:0.2rem;}
        .academics-visual{background:linear-gradient(135deg,var(--navy),var(--navy-mid));border-radius:20px;padding:3rem;position:sticky;top:100px;}
        .acad-result-title{font-family:var(--font-display);font-size:1.5rem;color:var(--white);margin-bottom:2rem;text-align:center;}
        .result-bars{display:grid;gap:1.5rem;}
        .result-bar-label{display:flex;justify-content:space-between;font-size:0.85rem;color:rgba(255,255,255,0.7);margin-bottom:0.5rem;}
        .result-bar-track{height:8px;background:rgba(255,255,255,0.08);border-radius:50px;overflow:hidden;}
        .result-bar-fill{height:100%;background:linear-gradient(90deg,var(--gold),var(--gold-light));border-radius:50px;width:0;transition:width 1.5s cubic-bezier(0.25,0.46,0.45,0.94);}
        .result-highlights{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:2rem;}
        .result-highlight{background:rgba(255,255,255,0.05);border-radius:12px;padding:1.25rem;text-align:center;}
        .result-highlight-num{font-family:var(--font-display);font-size:2rem;font-weight:700;color:var(--gold-light);}
        .result-highlight-label{font-size:0.75rem;color:rgba(255,255,255,0.5);margin-top:0.25rem;}

        /* Admission */
        #admission{background:linear-gradient(135deg,var(--navy-mid) 0%,var(--navy) 100%);position:relative;overflow:hidden;}
        #admission::before{content:'';position:absolute;top:-200px;right:-200px;width:600px;height:600px;background:radial-gradient(circle,rgba(201,168,76,0.08) 0%,transparent 70%);}
        .admission-header{text-align:center;margin-bottom:4rem;}
        .admission-steps{display:grid;grid-template-columns:repeat(5,1fr);gap:0;margin-bottom:4rem;position:relative;}
        .admission-steps::before{content:'';position:absolute;top:28px;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,var(--gold-light),transparent);opacity:0.3;z-index:0;}
        .adm-step{text-align:center;position:relative;z-index:1;}
        .adm-step-num{width:56px;height:56px;background:linear-gradient(135deg,var(--gold),var(--gold-light));border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-family:var(--font-display);font-size:1.25rem;font-weight:700;color:var(--navy);}
        .adm-step-title{font-size:0.9rem;font-weight:600;color:var(--white);margin-bottom:0.35rem;}
        .adm-step-desc{font-size:0.78rem;color:rgba(255,255,255,0.45);}
        .admission-bottom{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:start;}
        .adm-docs h3{font-family:var(--font-display);font-size:1.5rem;color:var(--white);margin-bottom:1.5rem;}
        .adm-doc-list{display:grid;gap:0.75rem;}
        .adm-doc-item{display:flex;align-items:center;gap:0.75rem;padding:0.85rem 1.25rem;background:rgba(255,255,255,0.04);border-radius:10px;border:1px solid rgba(255,255,255,0.06);}
        .adm-doc-check{width:22px;height:22px;background:linear-gradient(135deg,var(--gold),var(--gold-light));border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.65rem;color:var(--navy);flex-shrink:0;}
        .adm-doc-text{font-size:0.88rem;color:rgba(255,255,255,0.75);}
        .adm-form-card{background:rgba(255,255,255,0.05);border:1px solid rgba(201,168,76,0.2);border-radius:20px;padding:2.5rem;backdrop-filter:blur(20px);}
        .adm-form-card h3{font-family:var(--font-display);font-size:1.75rem;color:var(--white);margin-bottom:0.5rem;}
        .adm-form-card>p{font-size:0.88rem;color:rgba(255,255,255,0.5);margin-bottom:2rem;}
        .form-group{margin-bottom:1.25rem;}
        .form-group label{display:block;font-size:0.8rem;font-weight:600;color:rgba(255,255,255,0.6);margin-bottom:0.4rem;letter-spacing:0.05em;text-transform:uppercase;}
        .form-group input,.form-group select{width:100%;padding:0.85rem 1.1rem;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:var(--white);font-family:var(--font-body);font-size:0.9rem;transition:all 0.25s;outline:none;}
        .form-group input::placeholder{color:rgba(255,255,255,0.3);}
        .form-group input:focus,.form-group select:focus{border-color:var(--gold);background:rgba(201,168,76,0.06);}
        .form-group select option{background:var(--navy);color:var(--white);}
        .form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}

        /* Facilities */
        #facilities{background:var(--cream);}
        .facilities-header{text-align:center;margin-bottom:4rem;}
        .facilities-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;}
        .facility-card{background:var(--white);border-radius:var(--radius);overflow:hidden;box-shadow:0 4px 20px rgba(11,22,40,0.06);transition:var(--transition);border:1px solid transparent;}
        .facility-card:hover{transform:translateY(-8px);box-shadow:0 20px 60px rgba(11,22,40,0.12);border-color:rgba(201,168,76,0.2);}
        .facility-img{height:180px;background:linear-gradient(135deg,var(--navy-mid),var(--navy-light));display:flex;align-items:center;justify-content:center;font-size:3.5rem;position:relative;overflow:hidden;}
        .facility-img::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,transparent 60%,rgba(11,22,40,0.3));}
        .facility-img img{width:100%;height:100%;object-fit:cover;}
        .facility-body{padding:1.5rem;}
        .facility-title{font-family:var(--font-display);font-size:1.2rem;font-weight:600;color:var(--navy);margin-bottom:0.4rem;}
        .facility-desc{font-size:0.83rem;color:var(--slate);line-height:1.55;}

        /* Faculty */
        #faculty{background:var(--navy);}
        .faculty-header{text-align:center;margin-bottom:4rem;}
        .principal-card{display:grid;grid-template-columns:minmax(0,auto) minmax(0,1fr);gap:3rem;align-items:center;background:rgba(255,255,255,0.04);border:1px solid rgba(201,168,76,0.2);border-radius:20px;padding:3rem;margin-bottom:4rem;max-width:100%;min-width:0;box-sizing:border-box;}
        .principal-content{min-width:0;max-width:100%;}
        .principal-photo{width:180px;max-width:100%;height:220px;background:linear-gradient(135deg,var(--navy-light),var(--navy-mid));border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:5rem;flex-shrink:0;overflow:hidden;}
        .principal-photo img{width:100%;height:100%;object-fit:cover;border-radius:16px;}
        .principal-quote{font-family:var(--font-display);font-size:1.4rem;font-style:italic;color:rgba(255,255,255,0.85);line-height:1.5;margin-bottom:1.25rem;overflow-wrap:anywhere;word-wrap:break-word;}
        .principal-quote::before{content:'\u201C';color:var(--gold);font-size:3rem;line-height:0;vertical-align:-0.4em;margin-right:0.25rem;}
        .principal-name{font-weight:600;color:var(--gold-light);}
        .principal-title{font-size:0.85rem;color:rgba(255,255,255,0.45);margin-top:0.2rem;overflow-wrap:anywhere;word-wrap:break-word;line-height:1.45;}
        .principal-actions{display:flex;flex-wrap:wrap;gap:0.75rem;margin-top:1.5rem;max-width:100%;}
        .principal-actions .btn{flex:1 1 auto;min-width:0;justify-content:center;white-space:normal;text-align:center;padding-left:1rem;padding-right:1rem;}
        .teachers-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem;}
        .teacher-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:var(--radius);padding:2rem 1.5rem;text-align:center;transition:var(--transition);}
        .teacher-card:hover{border-color:rgba(201,168,76,0.25);transform:translateY(-4px);}
        .teacher-photo{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-light));margin:0 auto 1.25rem;display:flex;align-items:center;justify-content:center;font-size:1.75rem;overflow:hidden;}
        .teacher-photo img{width:100%;height:100%;object-fit:cover;border-radius:50%;}
        .teacher-name{font-family:var(--font-display);font-size:1.1rem;color:var(--white);margin-bottom:0.25rem;}
        .teacher-dept{font-size:0.8rem;color:var(--gold);font-weight:500;margin-bottom:0.2rem;}
        .teacher-qual{font-size:0.78rem;color:rgba(255,255,255,0.4);}

        /* Student Life */
        #student-life{background:var(--cream);}
        .student-life-header{text-align:center;margin-bottom:4rem;}
        .life-masonry{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:auto;gap:1.5rem;}
        .life-card{border-radius:var(--radius);overflow:hidden;position:relative;cursor:pointer;}
        .life-card-img{background:linear-gradient(135deg,var(--navy-mid),var(--navy-light));display:flex;align-items:center;justify-content:center;font-size:3rem;transition:transform 0.5s ease;overflow:hidden;}
        .life-card:hover .life-card-img{transform:scale(1.05);}
        .life-card-img img{width:100%;height:100%;object-fit:cover;}
        .life-card-1 .life-card-img{height:300px;}
        .life-card-2 .life-card-img{height:200px;}
        .life-card-3 .life-card-img{height:200px;}
        .life-card-4 .life-card-img{height:200px;}
        .life-card-5 .life-card-img{height:300px;}
        .life-card-6 .life-card-img{height:200px;}
        .life-card-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(11,22,40,0.85) 0%,transparent 50%);display:flex;flex-direction:column;justify-content:flex-end;padding:1.5rem;}
        .life-card-title{font-family:var(--font-display);font-size:1.2rem;color:var(--white);font-weight:600;}
        .life-card-sub{font-size:0.8rem;color:var(--gold-light);margin-top:0.25rem;}

        /* Gallery */
        #gallery{background:var(--navy);}
        .gallery-header{text-align:center;margin-bottom:3rem;}
        .gallery-filters{display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;margin-bottom:3rem;}
        .gallery-filter{padding:0.5rem 1.5rem;border-radius:50px;border:1.5px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.6);font-size:0.85rem;font-weight:500;cursor:pointer;transition:all 0.25s;background:transparent;font-family:var(--font-body);}
        .gallery-filter.active,.gallery-filter:hover{background:linear-gradient(135deg,var(--gold),var(--gold-light));border-color:transparent;color:var(--navy);}
        .gallery-masonry{columns:4;gap:1rem;column-fill:balance;}
        .gallery-item{break-inside:avoid;margin-bottom:1rem;border-radius:10px;overflow:hidden;position:relative;cursor:pointer;}
        .gallery-item-img{background:linear-gradient(135deg,var(--navy-mid),var(--navy-light));transition:transform 0.35s ease,box-shadow 0.25s ease;overflow:hidden;}
        .gallery-item-img img{width:100%;height:100%;object-fit:cover;display:block;}
        .gallery-item:nth-child(3n+1) .gallery-item-img{height:200px;}
        .gallery-item:nth-child(3n+2) .gallery-item-img{height:150px;}
        .gallery-item:nth-child(3n) .gallery-item-img{height:250px;}
        .gallery-item:hover .gallery-item-img{transform:scale(1.02);box-shadow:0 0 0 2px rgba(201,168,76,0.45);}
        .gallery-lightbox{position:fixed;inset:0;z-index:2000;background:rgba(5,10,20,0.94);display:flex;align-items:center;justify-content:center;padding:1rem;cursor:zoom-out;}
        .gallery-lightbox-inner{position:relative;max-width:min(1200px,96vw);max-height:90vh;cursor:default;}
        .gallery-lightbox-inner img{max-width:min(1200px,96vw);max-height:88vh;width:auto;height:auto;object-fit:contain;border-radius:10px;box-shadow:0 24px 80px rgba(0,0,0,0.5);}
        .gallery-lightbox-close{position:absolute;top:-2.75rem;right:0;width:44px;height:44px;border:none;border-radius:50%;background:rgba(255,255,255,0.12);color:var(--white);font-size:1.5rem;line-height:1;cursor:pointer;transition:background 0.2s;}
        .gallery-lightbox-close:hover{background:rgba(255,255,255,0.22);}

        /* Testimonials */
        #testimonials{background:var(--cream);}
        .testimonials-header{text-align:center;margin-bottom:4rem;}
        .testimonial-inner{max-width:750px;margin:0 auto;background:var(--white);border-radius:20px;padding:3rem;box-shadow:0 8px 48px rgba(11,22,40,0.08);border:1px solid rgba(201,168,76,0.15);text-align:center;}
        .testimonial-stars{color:var(--gold);font-size:1.1rem;margin-bottom:1.5rem;letter-spacing:0.2em;}
        .testimonial-text{font-family:var(--font-display);font-size:1.35rem;font-style:italic;color:var(--navy);line-height:1.65;margin-bottom:2rem;}
        .testimonial-author-photo{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-light));margin:0 auto 0.75rem;display:flex;align-items:center;justify-content:center;font-size:1.5rem;overflow:hidden;}
        .testimonial-author-photo img{width:100%;height:100%;object-fit:cover;border-radius:50%;}
        .testimonial-author-name{font-weight:600;color:var(--navy);}
        .testimonial-author-role{font-size:0.82rem;color:var(--slate);margin-top:0.2rem;}
        .slider-controls{display:flex;justify-content:center;align-items:center;gap:1.5rem;margin-top:2.5rem;}
        .slider-btn{width:44px;height:44px;border-radius:50%;border:1.5px solid rgba(11,22,40,0.2);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.25s;color:var(--navy);font-size:1.2rem;}
        .slider-btn:hover{background:var(--navy);color:var(--white);border-color:var(--navy);}
        .slider-dots{display:flex;gap:0.5rem;}
        .slider-dot{width:8px;height:8px;border-radius:50%;background:rgba(11,22,40,0.2);cursor:pointer;transition:all 0.25s;border:none;}
        .slider-dot.active{background:var(--navy);width:24px;border-radius:4px;}

        /* Notices */
        #notices{background:var(--navy);}
        .notices-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:2rem;}
        .notice-col h3{font-family:var(--font-display);font-size:1.5rem;color:var(--white);margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid rgba(201,168,76,0.2);}
        .notice-list{display:grid;gap:1rem;}
        .notice-item{display:flex;gap:1rem;padding:1.25rem;background:rgba(255,255,255,0.04);border-radius:12px;transition:all 0.25s;border:1px solid rgba(255,255,255,0.04);cursor:pointer;}
        .notice-item:hover{background:rgba(201,168,76,0.07);border-color:rgba(201,168,76,0.15);}
        .notice-date{text-align:center;flex-shrink:0;background:linear-gradient(135deg,var(--gold),var(--gold-light));border-radius:10px;padding:0.5rem 0.75rem;color:var(--navy);min-width:52px;}
        .notice-day{font-family:var(--font-display);font-size:1.4rem;font-weight:700;line-height:1;}
        .notice-month{font-size:0.7rem;font-weight:600;text-transform:uppercase;}
        .notice-title{font-size:0.88rem;font-weight:600;color:rgba(255,255,255,0.85);line-height:1.4;}
        .notice-cat{font-size:0.75rem;color:rgba(255,255,255,0.4);margin-top:0.3rem;}

        /* Contact */
        #contact{background:var(--cream);}
        .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:5rem;}
        .contact-details{display:grid;gap:1.25rem;margin-bottom:2.5rem;}
        .contact-detail{display:flex;align-items:flex-start;gap:1rem;}
        .contact-detail-icon{width:46px;height:46px;background:linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.08));border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;}
        .contact-detail-label{font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--slate);font-weight:600;}
        .contact-detail-value{font-weight:500;color:var(--navy);margin-top:0.15rem;font-size:0.95rem;}
        .map-placeholder{height:250px;background:linear-gradient(135deg,var(--navy-mid),var(--navy-light));border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:3rem;margin-top:1.5rem;overflow:hidden;}
        .map-placeholder iframe,.map-placeholder img{width:100%;height:100%;object-fit:cover;border:0;}
        .contact-form-card{background:var(--white);border-radius:20px;padding:3rem;box-shadow:0 8px 48px rgba(11,22,40,0.08);border:1px solid rgba(201,168,76,0.1);}
        .contact-form-card h3{font-family:var(--font-display);font-size:1.75rem;color:var(--navy);margin-bottom:0.5rem;}
        .contact-form-card>p{font-size:0.88rem;color:var(--slate);margin-bottom:2rem;}
        .contact-form{display:grid;gap:1rem;}
        .contact-form .form-group label{color:var(--slate);}
        .contact-form .form-group input,.contact-form .form-group select,.contact-form .form-group textarea{background:var(--cream);border:1.5px solid rgba(11,22,40,0.1);color:var(--text-dark);}
        .contact-form .form-group input:focus,.contact-form .form-group select:focus,.contact-form .form-group textarea:focus{border-color:var(--gold);background:var(--white);}
        .contact-form .form-group textarea{resize:vertical;min-height:100px;}
        .contact-form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}

        /* Footer */
        footer.sw-footer{background:#060e1e;border-top:1px solid rgba(201,168,76,0.15);}
        .footer-main{padding:80px 0 50px;}
        .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:4rem;}
        .footer-brand p{font-size:0.87rem;color:rgba(255,255,255,0.45);line-height:1.7;margin:1.25rem 0;}
        .footer-social{display:flex;gap:0.75rem;}
        .social-btn{width:38px;height:38px;background:rgba(255,255,255,0.06);border-radius:8px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.5);font-size:0.9rem;transition:all 0.25s;border:1px solid rgba(255,255,255,0.06);text-decoration:none;cursor:pointer;}
        .social-btn:hover{background:rgba(201,168,76,0.15);color:var(--gold-light);border-color:rgba(201,168,76,0.25);}
        .footer-col h4{font-family:var(--font-display);font-size:1.1rem;color:var(--white);margin-bottom:1.25rem;}
        .footer-links{display:grid;gap:0.6rem;}
        .footer-links a{font-size:0.85rem;color:rgba(255,255,255,0.45);transition:color 0.2s;}
        .footer-links a:hover{color:var(--gold-light);}
        .footer-newsletter input{width:100%;padding:0.75rem 1rem;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:var(--white);font-family:var(--font-body);font-size:0.85rem;margin-bottom:0.75rem;outline:none;}
        .footer-newsletter input::placeholder{color:rgba(255,255,255,0.3);}
        .footer-newsletter input:focus{border-color:var(--gold);}
        .footer-newsletter-sub{font-size:0.84rem;color:rgba(255,255,255,0.4);margin-bottom:1rem;}
        .footer-bottom{padding:1.5rem 0;border-top:1px solid rgba(255,255,255,0.06);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;}
        .footer-bottom p{font-size:0.8rem;color:rgba(255,255,255,0.35);}
        .footer-bottom-links{display:flex;gap:1.5rem;}
        .footer-bottom-links a{font-size:0.8rem;color:rgba(255,255,255,0.35);transition:color 0.2s;}
        .footer-bottom-links a:hover{color:var(--gold);}

        /* WhatsApp + Back to Top */
        .whatsapp-float{position:fixed;bottom:max(1rem,env(safe-area-inset-bottom));right:max(1rem,env(safe-area-inset-right));z-index:1070;}
        .whatsapp-btn{width:56px;height:56px;background:#25D366;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(37,211,102,0.4);transition:all 0.3s;animation:wapulse 3s ease-in-out infinite;}
        .whatsapp-btn:hover{transform:scale(1.1);box-shadow:0 12px 40px rgba(37,211,102,0.5);}
        @keyframes wapulse{0%,100%{box-shadow:0 8px 32px rgba(37,211,102,0.4);}50%{box-shadow:0 8px 32px rgba(37,211,102,0.4),0 0 0 12px rgba(37,211,102,0.1);}}
        .whatsapp-btn svg{width:28px;height:28px;fill:var(--white);}
        .whatsapp-label{position:absolute;right:calc(100% + 0.75rem);top:50%;transform:translateY(-50%);background:var(--navy);color:var(--white);font-size:0.8rem;font-weight:500;padding:0.4rem 0.85rem;border-radius:6px;white-space:nowrap;opacity:0;transition:opacity 0.25s;pointer-events:none;}
        .whatsapp-float:hover .whatsapp-label{opacity:1;}
        .back-top{position:fixed;bottom:max(5.5rem,calc(env(safe-area-inset-bottom) + 4.5rem));right:max(1rem,env(safe-area-inset-right));z-index:1070;width:44px;height:44px;background:rgba(11,22,40,0.8);border:1px solid rgba(201,168,76,0.3);border-radius:12px;display:flex;align-items:center;justify-content:center;color:var(--gold);cursor:pointer;opacity:0;transition:all 0.3s;backdrop-filter:blur(10px);}
        .back-top.visible{opacity:1;}
        .back-top:hover{background:var(--gold);color:var(--navy);transform:translateY(-2px);}

        /* Reveal animations */
        .reveal{opacity:0;transform:translateY(40px);transition:opacity 0.7s ease,transform 0.7s ease;}
        .reveal.visible{opacity:1;transform:translateY(0);}
        .reveal-left{opacity:0;transform:translateX(-40px);transition:opacity 0.7s ease,transform 0.7s ease;}
        .reveal-left.visible{opacity:1;transform:translateX(0);}
        .reveal-right{opacity:0;transform:translateX(40px);transition:opacity 0.7s ease,transform 0.7s ease;}
        .reveal-right.visible{opacity:1;transform:translateX(0);}
        .reveal-delay-1{transition-delay:0.1s;}
        .reveal-delay-2{transition-delay:0.2s;}
        .reveal-delay-3{transition-delay:0.3s;}
        .reveal-delay-4{transition-delay:0.4s;}

        /* Responsive */
        @media(max-width:1100px){
          .why-cards{grid-template-columns:repeat(2,1fr);}
          .facilities-grid{grid-template-columns:repeat(3,1fr);}
          .teachers-grid{grid-template-columns:repeat(2,1fr);}
          .gallery-masonry{columns:3;}
          .footer-grid{grid-template-columns:1fr 1fr;gap:3rem;}
          .notices-grid{grid-template-columns:1fr 1fr;}
        }
        @media(max-width:900px){
          .hero-grid-layout{grid-template-columns:1fr;}
          .about-grid{grid-template-columns:1fr;}
          .about-float-card{right:0;bottom:-3rem;}
          .academics-grid{grid-template-columns:1fr;}
          .academics-visual{position:static;}
          .admission-steps{grid-template-columns:repeat(3,1fr);row-gap:2.5rem;}
          .admission-steps::before{display:none;}
          .admission-bottom{grid-template-columns:1fr;}
          .facilities-grid{grid-template-columns:repeat(2,1fr);}
          .contact-grid{grid-template-columns:1fr;}
          .principal-card{grid-template-columns:1fr;gap:1.75rem;padding:2rem;}
          .principal-photo{margin:0 auto;width:min(180px,100%);height:auto;aspect-ratio:180/220;}
          .principal-quote{font-size:1.2rem;}
          .life-masonry{grid-template-columns:1fr 1fr;}
          .notices-grid{grid-template-columns:1fr;}
        }
        @media(max-width:768px){
          #sw-navbar{padding:0 max(1rem,env(safe-area-inset-left)) 0 max(1rem,env(safe-area-inset-right));}
          .nav-links,.nav-cta{display:none;}
          .nav-burger{display:flex;}
          .section-pad{padding:70px 0;}
          .section-pad-lg{padding:90px 0;}
          .why-cards{grid-template-columns:1fr;}
          .teachers-grid{grid-template-columns:repeat(2,1fr);}
          .gallery-masonry{columns:2;}
          .footer-grid{grid-template-columns:1fr;gap:2.5rem;}
          .footer-bottom{flex-direction:column;text-align:center;}
          .about-pillars{grid-template-columns:1fr;}
          .form-row{grid-template-columns:1fr;}
          .stats-grid{gap:1.5rem;}
          .admission-steps{grid-template-columns:1fr 1fr;}
          .facilities-grid{grid-template-columns:repeat(2,1fr);}
          .life-masonry{grid-template-columns:1fr;}
          .result-highlights{grid-template-columns:1fr 1fr;}
        }
        @media(max-width:640px){
          .principal-actions{flex-direction:column;align-items:stretch;}
          .principal-actions .btn{width:100%;flex:none;}
        }
        @media(max-width:480px){
          .principal-card{padding:1.35rem;gap:1.35rem;}
          .principal-quote{font-size:1.05rem;}
          .container,.container-sm{padding-left:max(1.25rem,env(safe-area-inset-left));padding-right:max(1.25rem,env(safe-area-inset-right));}
          .hero-btns{flex-direction:column;}
          .btn-lg{width:100%;justify-content:center;}
          .gallery-masonry{columns:1;}
          .stats-grid{grid-template-columns:1fr 1fr;}
          .facilities-grid{grid-template-columns:1fr;}
          .teachers-grid{grid-template-columns:1fr;}
          .admission-steps{grid-template-columns:1fr;}
          .contact-form-row{grid-template-columns:1fr;}
          .gallery-lightbox-close{top:auto;bottom:-3rem;right:50%;transform:translateX(50%);}
        }
      `}</style>

      <div className="sw-root">

        {/* ── NAVBAR ── */}
        <nav id="sw-navbar" className={scrolled ? "scrolled" : ""}>
          <div className="nav-inner">
            <a href="#hero" className="nav-logo">
              <img src="/school-logo.jpg" alt="Shri Abhay Nobles School Logo" className="nav-logo-icon" />
              <div>
                <span className="nav-logo-name">Shri Abhay Nobles</span>
                <span className="nav-logo-tag">Est. 2000 · RBSE Affiliated</span>
              </div>
            </a>
            <ul className="nav-links">
              <li><a href="#about">About</a></li>
              <li>
                <a href="#academics">Academics ▾</a>
                <div className="sw-dropdown">
                  <a href="#academics">Curriculum</a>
                  <a href="#academics">Classes &amp; Streams</a>
                  <a href="#academics">Exam System</a>
                  <a href="#academics">Results</a>
                </div>
              </li>
              <li><a href="#admission">Admissions</a></li>
              <li>
                <a href="#facilities">Campus ▾</a>
                <div className="sw-dropdown">
                  <a href="#facilities">Facilities</a>
                  <a href="#faculty">Faculty</a>
                  <a href="#student-life">Student Life</a>
                </div>
              </li>
              <li><a href="#notices">News</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
            <div className="nav-cta">
              <Link href="/student/portal" className="btn btn-outline nav-cta-btn">Student Login</Link>
              <a href="#admission" className="btn btn-gold nav-cta-btn">Apply Now</a>
            </div>
            <button type="button" className={`nav-burger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
          <a href="#about" onClick={closeMenu}>About Us</a>
          <a href="#academics" onClick={closeMenu}>Academics</a>
          <a href="#admission" onClick={closeMenu}>Admissions</a>
          <a href="#facilities" onClick={closeMenu}>Facilities</a>
          <a href="#faculty" onClick={closeMenu}>Faculty</a>
          <a href="#student-life" onClick={closeMenu}>Student Life</a>
          <a href="#gallery" onClick={closeMenu}>Gallery</a>
          <a href="#notices" onClick={closeMenu}>News &amp; Events</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
          <div className="mobile-menu-cta">
            <Link href="/student/portal" className="btn btn-outline" onClick={closeMenu}>Student Login</Link>
            <a href="#admission" className="btn btn-gold" onClick={closeMenu}>Apply Now</a>
          </div>
        </div>
        <div className={`sw-overlay ${menuOpen ? "open" : ""}`} onClick={closeMenu} />

        {/* ── ANNOUNCEMENT BAR ── */}
        <div className="announcement-bar" style={{ marginTop: 80 }}>
          <div className="marquee-track">
            {[
              "🎉 Admissions Open for 2026–27 Session — Apply Now",
              "📚 Board Results 2025: 98.5% Students Passed with Distinction",
              "🏆 Annual Sports Day — 22 September | All Are Welcome",
              "📝 Parent-Teacher Meeting Scheduled — 28 July",
              "🌟 Science Exhibition 2025 — Register Before 12 June",
              "🎉 Admissions Open for 2026–27 Session — Apply Now",
              "📚 Board Results 2025: 98.5% Students Passed with Distinction",
              "🏆 Annual Sports Day — 22 September | All Are Welcome",
              "📝 Parent-Teacher Meeting Scheduled — 28 July",
              "🌟 Science Exhibition 2025 — Register Before 12 June",
            ].map((text, i) => (
              <div key={i} className="marquee-item">
                <span className="marquee-dot" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* ── HERO ── */}
        <section id="hero">
          <div className="hero-bg" />
          <div className="hero-grid-bg" />
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-content">
            <div className="container">
              <div className="hero-grid-layout">
                <div>
                  <div className="hero-badge"><span />Admissions Open 2026–27</div>
                  <h1 className="display-xl text-white hero-heading reveal">
                    Shaping<br /><em>Future Leaders</em><br />of Tomorrow
                  </h1>
                  <p className="hero-sub reveal">
                    Where excellence meets opportunity. We nurture curious minds, build strong characters, and unlock every child's true potential in a world-class learning environment.
                  </p>
                  <div className="hero-btns reveal">
                    <a href="#admission" className="btn btn-gold btn-lg">
                      <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Apply Now
                    </a>
                    <a href="#contact" className="btn btn-outline btn-lg">
                      <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Book Campus Visit
                    </a>
                  </div>
                  <div className="hero-trust reveal">
                    <div className="hero-trust-stars">★★★★★</div>
                    <div className="hero-trust-text"><strong>4.9/5</strong> rating from 2,000+ parent reviews</div>
                  </div>
                </div>
                <div className="reveal-right">
                  <div className="hero-stats-card">
                    <div className="stats-grid">
                      {[
                        { num: "25+", label: "Years of Excellence" },
                        { num: "3200+", label: "Happy Students" },
                        { num: "35+", label: "Expert Teachers" },
                        { num: "98%", label: "Board Results" },
                      ].map((s) => (
                        <div key={s.label} className="stat-item">
                          <div className="stat-number">{s.num}</div>
                          <div className="stat-label">{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid rgba(201,168,76,0.15)" }}>
                      <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>Affiliated With</div>
                      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
                        {["RBSE Board", "ISO Certified", "NAAC Accredited"].map((a) => (
                          <div key={a} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "0.5rem 1rem", fontSize: "0.85rem", color: "var(--gold-light)", fontWeight: 600 }}>{a}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="scroll-indicator">
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
            Scroll to explore
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section id="about" className="section-pad-lg">
          <div className="container">
            <div className="about-grid">
              <div className="about-img-wrap reveal">
                <div className="about-accent-bar" />
                <div className="about-main-img">
                  <img src="/school-logo.jpg" alt="Shri Abhay Nobles School" />
                </div>
                <div className="about-float-card">
                  <div className="about-float-icon">🏆</div>
                  <div>
                    <div className="about-float-num">25+</div>
                    <div className="about-float-label">Years of Excellence</div>
                  </div>
                </div>
              </div>
              <div className="reveal-right">
                <div className="section-label">Who We Are</div>
                <h2 className="display-md" style={{ marginTop: "0.75rem", color: "var(--navy)" }}>
                  Building Excellence,<br /><em style={{ fontStyle: "italic", color: "var(--gold)" }}>One Student at a Time</em>
                </h2>
                <div className="gold-line" />
                <p className="body-lg" style={{ color: "var(--text-body)", marginTop: "1.25rem" }}>
                  Founded in 2000, Shri Abhay Nobles has been a beacon of academic brilliance and holistic development. Our world-class infrastructure, expert faculty, and a culture of discipline make us the most trusted institution in the region.
                </p>
                <p className="body-md" style={{ color: "var(--slate)", marginBottom: "2rem", marginTop: "0.75rem" }}>
                  We don't just educate — we inspire, empower, and elevate every child to achieve their highest potential while instilling values that last a lifetime.
                </p>
                <div className="about-pillars">
                  {[
                    { icon: "🎯", name: "Our Mission", desc: "Deliver quality education with character formation" },
                    { icon: "🌟", name: "Our Vision", desc: "Be India's most trusted school for holistic excellence" },
                    { icon: "💎", name: "Core Values", desc: "Integrity, Discipline, Innovation, Empathy" },
                    { icon: "🤝", name: "Parent Trust", desc: "98% parent satisfaction rate year over year" },
                  ].map((p) => (
                    <div key={p.name} className="about-pillar">
                      <div className="about-pillar-icon">{p.icon}</div>
                      <div>
                        <div className="about-pillar-name">{p.name}</div>
                        <div className="about-pillar-desc">{p.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <a href="#admission" className="btn btn-gold">Discover Our Story</a>
                  <a href="#contact" className="btn btn-outline-dark">Meet Our Principal</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY CHOOSE US ── */}
        <section id="why" className="section-pad-lg">
          <div className="container">
            <div className="why-header reveal">
              <div className="section-label" style={{ justifyContent: "center" }}>Why Choose Us</div>
              <h2 className="display-lg text-white" style={{ marginTop: "0.75rem" }}>The Abhay Nobles Advantage</h2>
              <div className="gold-line center" />
              <p className="body-md" style={{ color: "rgba(255,255,255,0.5)", maxWidth: 540, margin: "1rem auto 0" }}>Every aspect of our institution is designed to give your child the competitive edge they need to thrive in today's world.</p>
            </div>
            <div className="why-cards">
              {[
                { num: "01", icon: "🖥️", title: "Smart Classrooms", desc: "Well-planned classroom teaching with project-based activities, regular assessments, and focused mentor support for every student." },
                { num: "02", icon: "👨‍🏫", title: "Expert Faculty", desc: "Highly qualified teachers with post-graduate degrees, ongoing training, and deep passion for student success." },
                { num: "03", icon: "📊", title: "Outstanding Results", desc: "Consistent 98%+ board results with multiple district toppers every academic year." },
                { num: "04", icon: "🛡️", title: "Safety & Security", desc: "360° CCTV surveillance, biometric entry, trained security staff, and a strict safe-school policy." },
                { num: "05", icon: "⚽", title: "Sports Excellence", desc: "World-class sports infrastructure — cricket ground, football field, indoor courts, and professional coaches." },
                { num: "06", icon: "🧠", title: "Holistic Development", desc: "Arts, music, drama, yoga, coding, robotics — balanced education that nurtures every talent." },
                { num: "07", icon: "🚌", title: "Transport Facility", desc: "GPS-tracked school buses covering all major routes with trained drivers and lady attendants." },
                { num: "08", icon: "🎯", title: "Career Guidance", desc: "Dedicated counseling cell, aptitude testing, and mentorship for competitive exams like JEE, NEET, UPSC." },
              ].map((c) => (
                <div key={c.num} className="why-card reveal">
                  <div className="why-card-num">{c.num}</div>
                  <span className="why-card-icon">{c.icon}</span>
                  <div className="why-card-title">{c.title}</div>
                  <div className="why-card-desc">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ACADEMICS ── */}
        <section id="academics" className="section-pad-lg">
          <div className="container">
            <div className="academics-grid">
              <div>
                <div className="section-label reveal">Academics</div>
                <h2 className="display-md reveal" style={{ color: "var(--navy)", marginTop: "0.75rem" }}>
                  A Curriculum Built<br />for <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Tomorrow</em>
                </h2>
                <div className="gold-line reveal" />
                <p className="body-md reveal" style={{ color: "var(--text-body)", marginTop: "1rem" }}>
                  Our NCERT affiliated curriculum integrates critical thinking, practical application, and global perspectives to prepare students for a fast-evolving world.
                </p>
                <div className="class-tabs reveal" style={{ marginTop: "2rem" }}>
                  {["Pre-Primary", "Primary (1–5)", "Middle (6–8)", "Secondary (9–10)", "Senior Sec (11–12)"].map((tab) => (
                    <button key={tab} type="button" className={`class-tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>{tab}</button>
                  ))}
                </div>
                <div className="acad-features">
                  {[
                    { icon: "📚", title: "Core Subjects", desc: "Mathematics, Sciences, Languages, Social Studies — taught by subject specialists" },
                    { icon: "💻", title: "Digital Learning", desc: "Coding, AI basics, digital literacy integrated from Class 3 onwards" },
                    { icon: "🔬", title: "Lab-Based Learning", desc: "Physics, Chemistry, Biology, Computer labs with modern equipment" },
                    { icon: "🏅", title: "Olympiad Preparation", desc: "Dedicated coaching for NSO, IMO, SOF, and national-level competitions" },
                  ].map((f) => (
                    <div key={f.title} className="acad-feature reveal">
                      <div className="acad-feature-icon">{f.icon}</div>
                      <div>
                        <div className="acad-feature-title">{f.title}</div>
                        <div className="acad-feature-desc">{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <a href="#" className="btn btn-outline-dark" style={{ marginTop: "2rem" }}>Download Prospectus →</a>
              </div>
              <div className="academics-visual reveal-right">
                <div className="acad-result-title">Academic Excellence</div>
                <div className="result-bars">
                  {[
                    { label: "Class 10 Board Result", pct: 98.5 },
                    { label: "Class 12 Board Result", pct: 97.2 },
                    { label: "Students in Top Colleges", pct: 92 },
                    { label: "JEE/NEET Qualifiers", pct: 76 },
                  ].map((r) => (
                    <div key={r.label}>
                      <div className="result-bar-label"><span>{r.label}</span><span>{r.pct}%</span></div>
                      <div className="result-bar-track">
                        <div className="result-bar-fill" data-width={`${r.pct}%`} style={{ width: barsAnimated.current ? `${r.pct}%` : "0%" }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="result-highlights">
                  {[
                    { num: "47", label: "District Toppers\nin 5 Years" },
                    { num: "12", label: "State Rank\nHolders" },
                    { num: "200+", label: "IIT/Medical\nAdmissions" },
                    { num: "150+", label: "Awards Won\nThis Year" },
                  ].map((h) => (
                    <div key={h.label} className="result-highlight">
                      <div className="result-highlight-num">{h.num}</div>
                      <div className="result-highlight-label" style={{ whiteSpace: "pre-line" }}>{h.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── ADMISSION ── */}
        <section id="admission" className="section-pad-lg">
          <div className="container">
            <div className="admission-header reveal">
              <div className="section-label text-gold" style={{ justifyContent: "center" }}>Admissions</div>
              <h2 className="display-lg text-white" style={{ marginTop: "0.75rem" }}>
                Begin Your Child's<br /><em style={{ fontStyle: "italic", color: "var(--gold-light)" }}>Journey of Excellence</em>
              </h2>
              <div className="gold-line center" />
              <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 500, margin: "1rem auto 0", fontSize: "0.95rem" }}>
                Admissions for 2026–27 are open. Limited seats available — secure your child's future today.
              </p>
            </div>
            <div className="admission-steps reveal">
              {[
                { num: "1", title: "Online Inquiry", desc: "Fill the inquiry form or call our admission office" },
                { num: "2", title: "Campus Visit", desc: "Schedule a tour and meet the principal" },
                { num: "3", title: "Form Submission", desc: "Submit the application with required documents" },
                { num: "4", title: "Assessment", desc: "Interaction / basic assessment for the child" },
                { num: "5", title: "Confirmation", desc: "Fee payment & admission confirmation letter" },
              ].map((s) => (
                <div key={s.num} className="adm-step">
                  <div className="adm-step-num">{s.num}</div>
                  <div className="adm-step-title">{s.title}</div>
                  <div className="adm-step-desc">{s.desc}</div>
                </div>
              ))}
            </div>
            <div className="admission-bottom">
              <div className="adm-docs reveal-left">
                <h3>Documents Required</h3>
                <div className="adm-doc-list">
                  {[
                    "Birth Certificate (Original + Photocopy)",
                    "Previous School Transfer Certificate",
                    "Last Year's Report Card / Marksheet",
                    "Passport Size Photos (4 copies — student)",
                    "Aadhaar Card (Student + Parents)",
                    "Residence / Address Proof",
                    "Caste / Category Certificate (if applicable)",
                  ].map((d) => (
                    <div key={d} className="adm-doc-item">
                      <div className="adm-doc-check">✓</div>
                      <div className="adm-doc-text">{d}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", flexWrap: "wrap" }}>
                  <a href="#" className="btn btn-gold">Download Prospectus</a>
                  <a href="#" className="btn btn-outline">View Fee Structure</a>
                </div>
              </div>
              <div className="adm-form-card reveal-right">
                <h3>Quick Inquiry</h3>
                <p>Our admission team will contact you within 24 hours</p>
                <div className="form-row">
                  <div className="form-group">
                    <label>Parent Name</label>
                    <input type="text" placeholder="Your full name" />
                  </div>
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input type="tel" placeholder="+91 00000 00000" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Student Name</label>
                    <input type="text" placeholder="Child's name" />
                  </div>
                  <div className="form-group">
                    <label>Class Seeking</label>
                    <select>
                      <option value="">Select Class</option>
                      <option>Nursery / KG</option>
                      <option>Class 1–5</option>
                      <option>Class 6–8</option>
                      <option>Class 9–10</option>
                      <option>Class 11–12</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" placeholder="your@email.com" />
                </div>
                <button
                  type="button"
                  className="btn btn-gold"
                  style={{ width: "100%", justifyContent: "center", padding: "1rem" }}
                  onClick={() => { setAdmitSubmitted(true); setTimeout(() => setAdmitSubmitted(false), 4000); }}
                >
                  {admitSubmitted ? "✓ Inquiry Submitted! We'll Call You Soon" : "Submit Inquiry — We'll Call You Back 📞"}
                </button>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", textAlign: "center", marginTop: "1rem" }}>🔒 Your information is 100% safe and secure</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FACILITIES ── */}
        <section id="facilities" className="section-pad-lg">
          <div className="container">
            <div className="facilities-header reveal">
              <div className="section-label" style={{ justifyContent: "center" }}>Our Campus</div>
              <h2 className="display-lg" style={{ color: "var(--navy)", marginTop: "0.75rem" }}>
                World-Class <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Facilities</em>
              </h2>
              <div className="gold-line center" />
              <p style={{ color: "var(--slate)", maxWidth: 520, margin: "1rem auto 0" }}>A campus designed to inspire learning, creativity, and excellence — every corner tells a story of aspiration.</p>
            </div>
            <div className="facilities-grid">
              {[
                { img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80", alt: "Students studying in a well-organized classroom", title: "Smart Classrooms", desc: "Spacious, well-ventilated classrooms with structured teaching, activity-based learning, and personal attention for strong academic growth.", delay: "reveal-delay-1" },
                { img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80", alt: "Students doing science experiments in modern laboratory", title: "Science Laboratories", desc: "Fully equipped Physics, Chemistry, and Biology labs with modern instruments and safety standards.", delay: "reveal-delay-2" },
                { img: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80", alt: "Computer laboratory with students at workstations", title: "Computer Lab", desc: "Latest computers, high-speed internet, coding software, and experienced IT faculty for every student.", delay: "reveal-delay-3" },
                { img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80", alt: "School library with books and reading space", title: "Digital Library", desc: "10,000+ books, e-library access, reading rooms, and research resources for all age groups.", delay: "reveal-delay-4" },
                { img: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=900&q=80", alt: "Students practicing sports on school ground", title: "Sports Complex", desc: "Cricket, football, basketball, volleyball courts, athletics track, and indoor sports facilities.", delay: "reveal-delay-1" },
                { img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80", alt: "Comfortable and safe hostel room", title: "Hostel Facility", desc: "Separate boys & girls hostels with CCTV, healthy meals, study hours, and 24/7 warden supervision.", delay: "reveal-delay-2" },
              ].map((f) => (
                <div key={f.title} className={`facility-card reveal ${f.delay}`}>
                  <div className="facility-img">
                    <img src={f.img} alt={f.alt} loading="lazy" />
                  </div>
                  <div className="facility-body">
                    <div className="facility-title">{f.title}</div>
                    <div className="facility-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FACULTY ── */}
        <section id="faculty" className="section-pad-lg">
          <div className="container">
            <div className="faculty-header reveal">
              <div className="section-label" style={{ justifyContent: "center" }}>Our Team</div>
              <h2 className="display-lg text-white" style={{ marginTop: "0.75rem" }}>
                The Minds Behind<br /><em style={{ fontStyle: "italic", color: "var(--gold-light)" }}>Every Success</em>
              </h2>
              <div className="gold-line center" />
            </div>
            <div className="principal-card reveal">
              <div className="principal-photo">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=80" alt="School principal portrait" />
              </div>
              <div className="principal-content">
                <div className="principal-quote">
                  Education is not the filling of a pail, but the lighting of a fire. At Abhay Nobles, we ignite the spark of curiosity, discipline, and ambition in every young mind that enters our gates.
                </div>
                <div style={{ marginTop: "1.5rem" }}>
                  <div className="principal-name">Mr. Sambhoo Singh</div>
                  <div className="principal-title">Principal, Abhay Nobles | M.Ed., Ph.D. in Education | 25+ Years Experience</div>
                </div>
                <div className="principal-actions">
                  <a href="#" className="btn btn-gold" style={{ fontSize: "0.85rem", padding: "0.65rem 1.25rem" }}>Read Full Message</a>
                  <a href="#contact" className="btn btn-outline" style={{ fontSize: "0.85rem", padding: "0.65rem 1.25rem" }}>Book Appointment</a>
                </div>
              </div>
            </div>
            <div className="teachers-grid">
              {[
                { img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80", name: "Mr. Bhavesh Suthar", dept: "Head of Science", qual: "M.Sc. Physics · 15 Years Exp.", delay: "reveal-delay-1" },
                { img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80", name: "Mr. Kantilal", dept: "English & Literature", qual: "M.A. English · 12 Years Exp.", delay: "reveal-delay-2" },
                { img: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=300&q=80", name: "Mr. Pandey", dept: "Mathematics & Coding", qual: "M.Sc. Math · B.Tech · 10 Years", delay: "reveal-delay-3" },
                { img: "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?auto=format&fit=crop&w=300&q=80", name: "Mr. Nuton Singh", dept: "Social Studies", qual: "M.A. History · 18 Years Exp.", delay: "reveal-delay-4" },
              ].map((tc) => (
                <div key={tc.name} className={`teacher-card reveal ${tc.delay}`}>
                  <div className="teacher-photo">
                    <img src={tc.img} alt={`${tc.name} portrait`} loading="lazy" />
                  </div>
                  <div className="teacher-name">{tc.name}</div>
                  <div className="teacher-dept">{tc.dept}</div>
                  <div className="teacher-qual">{tc.qual}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── STUDENT LIFE ── */}
        <section id="student-life" className="section-pad-lg">
          <div className="container">
            <div className="student-life-header reveal">
              <div className="section-label" style={{ justifyContent: "center" }}>Student Life</div>
              <h2 className="display-lg" style={{ color: "var(--navy)", marginTop: "0.75rem" }}>
                Beyond the <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Classroom</em>
              </h2>
              <div className="gold-line center" />
              <p style={{ color: "var(--slate)", maxWidth: 520, margin: "1rem auto 0" }}>School life at Abhay Nobles is vibrant, enriching, and full of opportunities to discover passions and build friendships.</p>
            </div>
            <div className="life-masonry">
              {[
                { cls: "life-card-1", img: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=900&q=80", alt: "Students celebrating sports victory", title: "Sports & Athletics", sub: "National Level Champions · State Winners", delay: "" },
                { cls: "life-card-2", img: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80", alt: "Students performing in cultural festival", title: "Annual Cultural Festival", sub: "Drama · Music · Dance · Art", delay: "reveal-delay-1" },
                { cls: "life-card-5", img: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80", alt: "Educational tour and student travel experience", title: "Educational Tours", sub: "National & International Educational Trips", delay: "reveal-delay-2" },
                { cls: "life-card-3", img: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=900&q=80", alt: "Student science innovation activity", title: "Science & Innovation", sub: "Robotics · Olympiads · STEM Projects", delay: "reveal-delay-1" },
                { cls: "life-card-4", img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80", alt: "Music and arts practice by students", title: "Arts & Music", sub: "Painting · Classical Dance · Vocal Music", delay: "reveal-delay-2" },
                { cls: "life-card-6", img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=80", alt: "Students participating in eco club activity", title: "Eco & Social Clubs", sub: "Green Campus · Community Service", delay: "reveal-delay-3" },
              ].map((lc) => (
                <div key={lc.title} className={`life-card ${lc.cls} reveal ${lc.delay}`}>
                  <div className="life-card-img">
                    <img src={lc.img} alt={lc.alt} loading="lazy" />
                  </div>
                  <div className="life-card-overlay">
                    <div className="life-card-title">{lc.title}</div>
                    <div className="life-card-sub">{lc.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GALLERY ── */}
        <section id="gallery" className="section-pad-lg">
          <div className="container">
            <div className="gallery-header reveal">
              <div className="section-label" style={{ justifyContent: "center" }}>Gallery</div>
              <h2 className="display-lg text-white" style={{ marginTop: "0.75rem" }}>
                Photo <em style={{ fontStyle: "italic", color: "var(--gold-light)" }}>Gallery</em>
              </h2>
              <p className="text-white" style={{ marginTop: "0.75rem", opacity: 0.75, fontSize: "0.95rem", maxWidth: "28rem", margin: "0.75rem auto 0", lineHeight: 1.55 }}>
                A few pictures from our school — campus, classroom, events, sports, and activities.
              </p>
              <div className="gold-line center" />
            </div>
            <div className="gallery-filters reveal">
              {[
                { label: "All", val: "all" },
                { label: "Campus", val: "campus" },
                { label: "Events", val: "events" },
                { label: "Sports", val: "sports" },
                { label: "Art & Culture", val: "cultural" },
              ].map((gf) => (
                <button key={gf.val} type="button" className={`gallery-filter ${galleryFilter === gf.val ? "active" : ""}`} onClick={() => setGalleryFilter(gf.val)}>
                  {gf.label}
                </button>
              ))}
            </div>
            <div className="gallery-masonry">
              {filteredGallery.map((gi, i) => (
                <div key={i} className="gallery-item" role="button" tabIndex={0} aria-label="Enlarge photo"
                  onClick={() => setLightbox({ src: gi.src, alt: gi.alt })}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLightbox({ src: gi.src, alt: gi.alt }); } }}>
                  <div className="gallery-item-img">
                    <img src={gi.src} alt={gi.alt} loading="lazy" />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
              <a href="#" className="btn btn-outline btn-lg">More photos</a>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section id="testimonials" className="section-pad-lg">
          <div className="container-sm">
            <div className="testimonials-header reveal">
              <div className="section-label" style={{ justifyContent: "center" }}>Testimonials</div>
              <h2 className="display-lg" style={{ color: "var(--navy)", marginTop: "0.75rem" }}>
                What <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Families Say</em>
              </h2>
              <div className="gold-line center" />
            </div>
            <div className="reveal">
              <div className="testimonial-inner">
                <div className="testimonial-stars">{testimonials[t].stars}</div>
                <div className="testimonial-text">"{testimonials[t].text}"</div>
                <div className="testimonial-author-photo">
                  <img src={testimonials[t].photo} alt={testimonials[t].name} />
                </div>
                <div className="testimonial-author-name">{testimonials[t].name}</div>
                <div className="testimonial-author-role">{testimonials[t].role}</div>
              </div>
              <div className="slider-controls">
                <button type="button" className="slider-btn" onClick={() => setTestimonialIdx((p) => (p - 1 + testimonials.length) % testimonials.length)}>←</button>
                <div className="slider-dots">
                  {testimonials.map((_, i) => (
                    <button key={i} type="button" className={`slider-dot ${i === t ? "active" : ""}`} onClick={() => setTestimonialIdx(i)} />
                  ))}
                </div>
                <button type="button" className="slider-btn" onClick={() => setTestimonialIdx((p) => (p + 1) % testimonials.length)}>→</button>
              </div>
            </div>
          </div>
        </section>

        {/* ── NOTICES ── */}
        <section id="notices" className="section-pad-lg">
          <div className="container">
            <div className="text-center reveal" style={{ marginBottom: "3rem" }}>
              <div className="section-label text-gold" style={{ justifyContent: "center" }}>Stay Updated</div>
              <h2 className="display-lg text-white" style={{ marginTop: "0.75rem" }}>
                News &amp; <em style={{ fontStyle: "italic", color: "var(--gold-light)" }}>Announcements</em>
              </h2>
              <div className="gold-line center" />
            </div>
            <div className="notices-grid">
              <div className="notice-col reveal reveal-delay-1">
                <h3>📌 Important Notices</h3>
                <div className="notice-list">
                  {[
                    { day: "15", month: "May", title: "Admission form last date extended to 30th May 2026", cat: "Admissions" },
                    { day: "20", month: "May", title: "Summer vacation schedule announced for all classes", cat: "Academic" },
                    { day: "25", month: "May", title: "Fee payment due date for Q2 — June 30, 2026", cat: "Finance" },
                  ].map((n) => (
                    <div key={n.title} className="notice-item">
                      <div className="notice-date">
                        <div className="notice-day">{n.day}</div>
                        <div className="notice-month">{n.month}</div>
                      </div>
                      <div>
                        <div className="notice-title">{n.title}</div>
                        <div className="notice-cat">{n.cat}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="notice-col reveal reveal-delay-2">
                <h3>🗓️ Upcoming Events</h3>
                <div className="notice-list">
                  {[
                    { day: "05", month: "Jun", title: "World Environment Day — Plantation Drive on Campus", cat: "Events" },
                    { day: "12", month: "Jun", title: "New Academic Session Begins — Welcome Assembly", cat: "Academic" },
                    { day: "18", month: "Jun", title: "Parent-Teacher Meeting — Classes 9 to 12", cat: "Parent Connect" },
                  ].map((n) => (
                    <div key={n.title} className="notice-item">
                      <div className="notice-date">
                        <div className="notice-day">{n.day}</div>
                        <div className="notice-month">{n.month}</div>
                      </div>
                      <div>
                        <div className="notice-title">{n.title}</div>
                        <div className="notice-cat">{n.cat}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="notice-col reveal reveal-delay-3">
                <h3>🏆 Latest Achievements</h3>
                <div className="notice-list">
                  {[
                    { day: "10", month: "May", title: "Manmeet Suthar wins Gold at State Level Science Olympiad", cat: "Achievement" },
                    { day: "08", month: "May", title: "School wins Best Institution Award — District Education Fair", cat: "Award" },
                    { day: "02", month: "May", title: "5 Students selected for National Level Debate Competition", cat: "Achievement" },
                  ].map((n) => (
                    <div key={n.title} className="notice-item">
                      <div className="notice-date">
                        <div className="notice-day">{n.day}</div>
                        <div className="notice-month">{n.month}</div>
                      </div>
                      <div>
                        <div className="notice-title">{n.title}</div>
                        <div className="notice-cat">{n.cat}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section id="contact" className="section-pad-lg">
          <div className="container">
            <div className="contact-grid">
              <div className="reveal-left">
                <div className="section-label">Get In Touch</div>
                <h2 className="display-md" style={{ color: "var(--navy)", marginTop: "0.75rem" }}>
                  We'd Love to<br /><em style={{ fontStyle: "italic", color: "var(--gold)" }}>Hear From You</em>
                </h2>
                <div className="gold-line" style={{ margin: "1.25rem 0" }} />
                <p>Visit us, call us, or drop us a message. Our team is always ready to welcome you and answer all your questions about admissions, academics, and campus life.</p>
                <div className="contact-details" style={{ marginTop: "2rem" }}>
                  {[
                    { icon: "📍", label: "Address", value: "Near Ganpat Colony\nTakhatgarh, Rajasthan, 306901" },
                    { icon: "📞", label: "Phone", value: "9928613702\nMon–Sat: 9:00 AM – 2:00 PM" },
                    { icon: "💬", label: "WhatsApp", value: "+91 9928613702" },
                    { icon: "✉️", label: "Email", value: "kunal4642m@gmail.com" },
                  ].map((cd) => (
                    <div key={cd.label} className="contact-detail">
                      <div className="contact-detail-icon">{cd.icon}</div>
                      <div>
                        <div className="contact-detail-label">{cd.label}</div>
                        <div className="contact-detail-value" style={{ whiteSpace: "pre-line" }}>{cd.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="map-placeholder">
                  <iframe
                    src="https://www.google.com/maps?q=Abhay%20Nobles%20School%2C%20Ganpat%20Colony%2C%20Takhatgarh%2C%20Pali%2C%20Rajasthan&output=embed"
                    title="Abhay Nobles School Location Map"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--slate)", marginTop: "0.75rem", textAlign: "center" }}>Abhay Nobles School · Ganpat Colony, Takhatgarh, Pali, Rajasthan</p>
                <div style={{ textAlign: "center", marginTop: "0.75rem" }}>
                  <a href="https://maps.app.goo.gl/JiNJ5UtsD7LEBxrn7" target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark" style={{ padding: "0.6rem 1.2rem", fontSize: "0.82rem" }}>
                    Open Exact School Location
                  </a>
                </div>
              </div>
              <div className="reveal-right">
                <div className="contact-form-card">
                  <h3>Send a Message</h3>
                  <p>We'll respond within 24 business hours</p>
                  <div className="contact-form">
                    <div className="contact-form-row">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" placeholder="Your name" />
                      </div>
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input type="tel" placeholder="+91 9928613702" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input type="email" placeholder="kunal4642m@gmail.com" />
                    </div>
                    <div className="form-group">
                      <label>Subject</label>
                      <select>
                        <option value="">Select a topic</option>
                        <option>Admission Inquiry</option>
                        <option>Fee Structure</option>
                        <option>Campus Visit</option>
                        <option>Transport Information</option>
                        <option>Hostel Information</option>
                        <option>Career / Jobs at School</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Message</label>
                      <textarea placeholder="Write your message here..." />
                    </div>
                    <button
                      type="button"
                      className="btn btn-gold"
                      style={{ width: "100%", justifyContent: "center", padding: "1rem" }}
                      onClick={() => { setContactSubmitted(true); setTimeout(() => setContactSubmitted(false), 4000); }}
                    >
                      {contactSubmitted ? "✓ Message Sent Successfully!" : "Send Message →"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="sw-footer">
          <div className="footer-main">
            <div className="container">
              <div className="footer-grid">
                <div className="footer-brand">
                  <div className="nav-logo" style={{ marginBottom: "1.25rem" }}>
                    <img src="/school-logo.jpg" alt="Shri Abhay Nobles School Logo" className="nav-logo-icon" />
                    <div>
                      <span className="nav-logo-name">Abhay Nobles</span>
                      <span className="nav-logo-tag">Est. 2000 · RBSE Affiliated</span>
                    </div>
                  </div>
                  <p>Nurturing excellence, building character, and inspiring futures since 2000. A place where every child discovers their potential and every dream finds its wings.</p>
                  <div className="footer-social">
                    {[
                      { label: "f", title: "Facebook" },
                      { label: "📷", title: "Instagram" },
                      { label: "▶", title: "YouTube" },
                      { label: "𝕏", title: "Twitter" },
                      { label: "in", title: "LinkedIn" },
                    ].map((s) => (
                      <a key={s.title} href="#" className="social-btn" title={s.title}>{s.label}</a>
                    ))}
                  </div>
                </div>
                <div className="footer-col">
                  <h4>Quick Links</h4>
                  <div className="footer-links">
                    <a href="#about">About School</a>
                    <a href="#academics">Academics</a>
                    <a href="#admission">Admissions</a>
                    <a href="#facilities">Facilities</a>
                    <a href="#faculty">Faculty</a>
                    <a href="#gallery">Gallery</a>
                    <a href="#contact">Contact Us</a>
                  </div>
                </div>
                <div className="footer-col">
                  <h4>Portals</h4>
                  <div className="footer-links">
                    <Link href="/student/portal">Student Login</Link>
                    <a href="#">Parent Portal</a>
                    <Link href="/teacher/login">Teacher Portal</Link>
                    <Link href="/admin">Admin Login</Link>
                    <a href="#">Online Fee Payment</a>
                    <a href="#">Download Prospectus</a>
                    <a href="#">Results / Reports</a>
                  </div>
                </div>
                <div className="footer-col">
                  <h4>Newsletter</h4>
                  <p className="footer-newsletter-sub">Get latest news, events &amp; updates directly in your inbox.</p>
                  <div className="footer-newsletter">
                    <input type="email" placeholder="Enter your email" />
                    <button type="button" className="btn btn-gold" style={{ width: "100%", justifyContent: "center", fontSize: "0.85rem", padding: "0.75rem" }}>Subscribe →</button>
                  </div>
                  <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <a href="#" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.83rem", color: "rgba(255,255,255,0.4)" }}><span>📄</span>Privacy Policy</a>
                    <a href="#" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.83rem", color: "rgba(255,255,255,0.4)" }}><span>📋</span>Terms &amp; Conditions</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="footer-bottom">
              <p>© 2025 Abhay Nobles. All rights reserved. | Designed with ♥ for Excellence</p>
              <div className="footer-bottom-links">
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Sitemap</a>
                <a href="#">Careers</a>
              </div>
            </div>
          </div>
        </footer>

        {/* ── FLOATING WHATSAPP ── */}
        <div className="whatsapp-float">
          <a href="https://wa.me/919928613702" className="whatsapp-btn" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
          <span className="whatsapp-label">Chat with us</span>
        </div>

        {/* Back to Top */}
        <button
          type="button"
          className={`back-top ${showBackTop ? "visible" : ""}`}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
        >
          ↑
        </button>

        {/* ── GALLERY LIGHTBOX ── */}
        {lightbox && (
          <div className="gallery-lightbox" onClick={() => setLightbox(null)}>
            <div className="gallery-lightbox-inner" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="gallery-lightbox-close" onClick={() => setLightbox(null)} aria-label="Close">&times;</button>
              <img src={lightbox.src} alt={lightbox.alt} />
            </div>
          </div>
        )}

      </div>
    </>
  );
}
