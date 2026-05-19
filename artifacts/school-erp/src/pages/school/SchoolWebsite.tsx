import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

export default function SchoolWebsite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const barsAnimated = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      if (!barsAnimated.current && window.scrollY > 400) {
        barsAnimated.current = true;
        document.querySelectorAll<HTMLElement>(".result-bar-fill").forEach((el) => {
          el.style.width = el.dataset.width || "0%";
        });
      }
      const reveals = document.querySelectorAll<HTMLElement>(".reveal, .reveal-left, .reveal-right");
      reveals.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 80) el.classList.add("visible");
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const testimonials = [
    {
      stars: "★★★★★",
      text: "Shri Abhay Nobles transformed my daughter's academic journey. The teachers are dedicated, the environment is nurturing, and the results speak for themselves.",
      name: "Rajesh Kumar Sharma",
      role: "Parent of Class XII student",
      emoji: "👨",
    },
    {
      stars: "★★★★★",
      text: "I secured 96% in board exams thanks to the exceptional teaching here. The faculty truly goes beyond textbooks to inspire critical thinking.",
      name: "Priya Agarwal",
      role: "Alumni, Batch 2024",
      emoji: "👩",
    },
    {
      stars: "★★★★★",
      text: "The holistic development approach at Abhay Nobles is outstanding. My son excels not just academically but in sports and arts too.",
      name: "Sunita & Mohan Verma",
      role: "Parents of Class X student",
      emoji: "👨‍👩‍👦",
    },
  ];

  return (
    <>
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        :root {
          --navy: #0B1628; --navy-mid: #132040; --navy-light: #1E3060;
          --gold: #C9A84C; --gold-light: #E2C97E; --gold-pale: #F5E9C8;
          --cream: #FAF7F0; --white: #FFFFFF; --slate: #64748B; --slate-light: #94A3B8;
          --text-dark: #0F1C35; --text-body: #334155;
          --glass: rgba(255,255,255,0.07); --glass-border: rgba(201,168,76,0.2);
          --shadow-gold: 0 8px 48px rgba(201,168,76,0.15); --shadow-navy: 0 8px 48px rgba(11,22,40,0.18);
          --radius: 16px; --radius-sm: 8px;
          --transition: 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
          --font-display: 'Cormorant Garamond', serif; --font-body: 'Outfit', sans-serif;
        }
        .sw-root *, .sw-root *::before, .sw-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .sw-root { font-family: var(--font-body); color: var(--text-body); background: var(--cream); overflow-x: hidden; }
        .sw-root a { text-decoration: none; color: inherit; }
        .sw-root ul { list-style: none; }
        .sw-root img { max-width: 100%; display: block; }
        .display-xl { font-family: var(--font-display); font-size: clamp(2.8rem, 6vw, 5.5rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.01em; }
        .display-lg { font-family: var(--font-display); font-size: clamp(2.2rem, 4.5vw, 4rem); font-weight: 600; line-height: 1.15; }
        .display-md { font-family: var(--font-display); font-size: clamp(1.8rem, 3vw, 2.8rem); font-weight: 600; line-height: 1.2; }
        .section-label { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); display: flex; align-items: center; gap: 0.75rem; }
        .section-label::before { content: ''; width: 32px; height: 1.5px; background: var(--gold); flex-shrink: 0; }
        .body-lg { font-size: 1.125rem; line-height: 1.7; }
        .container { max-width: 1280px; margin: 0 auto; padding: 0 max(2rem, env(safe-area-inset-left)); }
        .container-sm { max-width: 900px; margin: 0 auto; padding: 0 2rem; }
        .section-pad { padding: 100px 0; }
        .section-pad-lg { padding: 140px 0; }
        .text-center { text-align: center; }
        .text-gold { color: var(--gold); }
        .text-white { color: var(--white); }
        .text-navy { color: var(--navy); }
        .gold-line { width: 60px; height: 2px; background: linear-gradient(90deg, var(--gold), var(--gold-light)); margin: 1.25rem 0; }
        .gold-line.center { margin: 1.25rem auto; }
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem 2rem; border-radius: 50px; font-family: var(--font-body); font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: var(--transition); border: 2px solid transparent; white-space: nowrap; }
        .btn-gold { background: linear-gradient(135deg, var(--gold), var(--gold-light)); color: var(--navy); }
        .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(201,168,76,0.4); }
        .btn-outline { background: transparent; border-color: rgba(255,255,255,0.5); color: var(--white); }
        .btn-outline:hover { background: rgba(255,255,255,0.12); border-color: var(--white); transform: translateY(-2px); }
        .btn-outline-dark { background: transparent; border-color: var(--navy); color: var(--navy); }
        .btn-outline-dark:hover { background: var(--navy); color: var(--white); transform: translateY(-2px); }
        .btn-lg { padding: 1rem 2.5rem; font-size: 1rem; }
        .btn svg { width: 18px; height: 18px; }
        /* Navbar */
        #sw-navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 1100; padding: 0 2rem; transition: all 0.4s ease; }
        #sw-navbar .nav-inner { max-width: 1280px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 0; transition: all 0.4s ease; }
        #sw-navbar.scrolled { background: rgba(11,22,40,0.97); backdrop-filter: blur(20px); box-shadow: 0 2px 40px rgba(0,0,0,0.3); }
        .nav-logo { display: flex; align-items: center; gap: 0.85rem; }
        .nav-logo-icon { width: 48px; height: 48px; border-radius: 12px; object-fit: cover; border: 2px solid rgba(255,255,255,0.2); background: #fcfcfc; }
        .nav-logo-name { font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; color: var(--white); line-height: 1.1; display: block; }
        .nav-logo-tag { font-size: 0.65rem; color: var(--gold-light); letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500; display: block; }
        .nav-links { display: flex; align-items: center; gap: 0.25rem; list-style: none; }
        .nav-links > li { position: relative; }
        .nav-links > li > a { position: relative; padding: 0.5rem 0.9rem; color: rgba(255,255,255,0.85); font-size: 0.88rem; font-weight: 500; border-radius: 6px; transition: color 0.25s ease, background 0.25s ease; display: flex; align-items: center; gap: 0.3rem; }
        .nav-links > li > a::after { content: ''; position: absolute; left: 0; right: 0; top: 100%; height: 18px; }
        .nav-links > li > a:hover { color: var(--gold-light); background: rgba(255,255,255,0.08); }
        .sw-dropdown { position: absolute; top: calc(100% + 10px); left: 0; background: var(--navy-mid); border: 1px solid var(--glass-border); border-radius: 12px; min-width: 200px; padding: 0.5rem; opacity: 0; visibility: hidden; transform: translate3d(0,-12px,0) scale(0.97); transform-origin: top center; pointer-events: none; box-shadow: 0 20px 60px rgba(0,0,0,0.4); transition: opacity 0.32s, transform 0.42s cubic-bezier(0.22,1,0.36,1), visibility 0s linear 0.45s; }
        .nav-links > li:hover .sw-dropdown { opacity: 1; visibility: visible; transform: translate3d(0,0,0) scale(1); pointer-events: auto; transition: opacity 0.3s, transform 0.42s cubic-bezier(0.22,1,0.36,1), visibility 0s linear 0s; }
        .sw-dropdown a { display: block; padding: 0.6rem 1rem; color: rgba(255,255,255,0.8); font-size: 0.85rem; border-radius: 8px; transition: background 0.2s, color 0.2s; }
        .sw-dropdown a:hover { background: rgba(201,168,76,0.12); color: var(--gold-light); }
        .nav-cta { display: flex; align-items: center; gap: 0.75rem; }
        .nav-cta-btn { padding: 0.6rem 1.25rem; font-size: 0.82rem; }
        .nav-burger { display: none; width: 44px; height: 44px; padding: 0; cursor: pointer; border: none; background: transparent; color: rgba(255,255,255,0.92); z-index: 1110; flex-shrink: 0; position: relative; }
        .nav-burger span { position: absolute; left: 10px; right: 10px; height: 2px; background: currentColor; border-radius: 2px; transition: transform 0.42s cubic-bezier(0.22,1,0.36,1), top 0.42s cubic-bezier(0.22,1,0.36,1), opacity 0.26s ease; }
        .nav-burger span:nth-child(1) { top: 14px; }
        .nav-burger span:nth-child(2) { top: 21px; }
        .nav-burger span:nth-child(3) { top: 28px; }
        .nav-burger.open span:nth-child(1) { top: 21px; transform: rotate(45deg); }
        .nav-burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .nav-burger.open span:nth-child(3) { top: 21px; transform: rotate(-45deg); }
        /* Mobile menu */
        .mobile-menu { position: fixed; top: 0; right: -100%; width: min(360px, 100%); height: 100vh; background: var(--navy); z-index: 1090; padding: 5rem 1.25rem 2rem; transition: right 0.4s cubic-bezier(0.25,0.46,0.45,0.94); overflow-y: auto; box-shadow: -20px 0 60px rgba(0,0,0,0.5); }
        .mobile-menu.open { right: 0; }
        .mobile-menu a, .mobile-menu button { display: block; padding: 0.85rem 0; color: rgba(255,255,255,0.85); font-size: 1rem; font-weight: 500; border-bottom: 1px solid rgba(255,255,255,0.08); transition: color 0.2s; background: none; border-top: none; border-left: none; border-right: none; text-align: left; cursor: pointer; font-family: inherit; width: 100%; }
        .mobile-menu a:hover, .mobile-menu button:hover { color: var(--gold-light); }
        .mobile-menu-cta { margin-top: 2rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .mobile-menu-cta .btn { width: 100%; justify-content: center; }
        .sw-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1080; opacity: 0; visibility: hidden; transition: opacity 0.3s ease, visibility 0.3s ease; }
        .sw-overlay.open { opacity: 1; visibility: visible; }
        /* Hero */
        #hero { min-height: 100vh; position: relative; display: flex; align-items: center; overflow: hidden; background: var(--navy); }
        .hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 80% at 60% 50%, rgba(30,48,96,0.8) 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 20% 80%, rgba(201,168,76,0.08) 0%, transparent 60%), linear-gradient(135deg, #060e1e 0%, #0B1628 40%, #132040 100%); }
        .hero-grid-bg { position: absolute; inset: 0; background-image: linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px); background-size: 80px 80px; mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent); }
        .hero-orb { position: absolute; border-radius: 50%; filter: blur(80px); animation: swFloat 8s ease-in-out infinite; }
        .hero-orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%); top: -200px; right: -100px; }
        .hero-orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(30,48,96,0.6) 0%, transparent 70%); bottom: -100px; left: 10%; animation-delay: -4s; }
        @keyframes swFloat { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-30px) scale(1.05); } }
        .hero-content { position: relative; z-index: 2; padding: 160px 0 100px; width: 100%; }
        .hero-grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
        .hero-badge { display: inline-flex; align-items: center; gap: 0.6rem; background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.3); border-radius: 50px; padding: 0.45rem 1.1rem; margin-bottom: 1.5rem; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gold-light); }
        .hero-badge span { width: 6px; height: 6px; background: var(--gold); border-radius: 50%; animation: swPulse 2s ease-in-out infinite; }
        @keyframes swPulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }
        .hero-heading { margin-bottom: 1.5rem; }
        .hero-heading em { font-style: italic; color: var(--gold-light); }
        .hero-sub { color: rgba(255,255,255,0.65); margin-bottom: 2.5rem; max-width: 520px; font-size: 1.1rem; line-height: 1.7; }
        .hero-btns { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 3rem; }
        .hero-trust { display: flex; align-items: center; gap: 1.5rem; }
        .hero-trust-stars { color: var(--gold); font-size: 0.9rem; }
        .hero-trust-text { font-size: 0.85rem; color: rgba(255,255,255,0.55); }
        .hero-trust-text strong { color: rgba(255,255,255,0.85); }
        .hero-stats-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(201,168,76,0.15); border-radius: var(--radius); padding: 2.5rem; backdrop-filter: blur(20px); position: relative; overflow: hidden; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .stat-item { text-align: center; }
        .stat-number { font-family: var(--font-display); font-size: 3rem; font-weight: 700; color: var(--gold-light); line-height: 1; }
        .stat-number span { font-size: 1.5rem; }
        .stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-top: 0.35rem; letter-spacing: 0.05em; text-transform: uppercase; }
        /* Announcement bar */
        .announcement-bar { background: linear-gradient(90deg, var(--navy-mid), var(--navy-light)); border-bottom: 1px solid rgba(201,168,76,0.2); padding: 0.7rem 0; overflow: hidden; }
        .marquee-track { display: flex; align-items: center; gap: 3rem; animation: swMarquee 30s linear infinite; white-space: nowrap; }
        .marquee-track:hover { animation-play-state: paused; }
        .marquee-item { font-size: 0.82rem; color: rgba(255,255,255,0.75); display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
        .marquee-dot { width: 5px; height: 5px; background: var(--gold); border-radius: 50%; flex-shrink: 0; }
        @keyframes swMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        /* Scroll indicator */
        .scroll-indicator { position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: rgba(255,255,255,0.4); font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; animation: swBounce 2.5s ease-in-out infinite; }
        .scroll-indicator svg { width: 20px; height: 20px; }
        @keyframes swBounce { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(8px); } }
        /* About */
        #about { background: var(--cream); }
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
        .about-img-wrap { position: relative; }
        .about-main-img { width: 100%; aspect-ratio: 4/5; border-radius: 20px; position: relative; z-index: 1; background: linear-gradient(135deg, var(--navy-mid), var(--navy-light)); display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .about-main-img img { width: 100%; height: 100%; object-fit: cover; }
        .about-float-card { position: absolute; bottom: -2rem; right: -2rem; z-index: 2; background: var(--white); border-radius: 16px; padding: 1.5rem 2rem; box-shadow: 0 20px 60px rgba(11,22,40,0.15); display: flex; align-items: center; gap: 1.25rem; }
        .about-float-icon { width: 52px; height: 52px; background: linear-gradient(135deg, var(--gold), var(--gold-light)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; }
        .about-float-num { font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--navy); line-height: 1; }
        .about-float-label { font-size: 0.8rem; color: var(--slate); }
        .about-accent-bar { position: absolute; top: -1.5rem; left: -1.5rem; width: 120px; height: 120px; border: 2px solid var(--gold); border-radius: 16px; opacity: 0.2; z-index: 0; }
        .about-pillars { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 2rem; }
        .about-pillar { display: flex; align-items: flex-start; gap: 0.75rem; }
        .about-pillar-icon { width: 36px; height: 36px; background: rgba(201,168,76,0.12); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
        .about-pillar-name { font-weight: 600; font-size: 0.9rem; color: var(--navy); }
        .about-pillar-desc { font-size: 0.82rem; color: var(--slate); margin-top: 0.2rem; }
        /* Why */
        #why { background: var(--navy); }
        .why-header { text-align: center; margin-bottom: 4rem; }
        .why-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
        .why-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(201,168,76,0.1); border-radius: var(--radius); padding: 2rem 1.75rem; transition: var(--transition); cursor: default; position: relative; overflow: hidden; }
        .why-card:hover { transform: translateY(-6px); border-color: rgba(201,168,76,0.3); box-shadow: var(--shadow-gold); }
        .why-card-icon { font-size: 2rem; margin-bottom: 1.25rem; display: block; }
        .why-card-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; color: var(--white); margin-bottom: 0.5rem; }
        .why-card-desc { font-size: 0.88rem; color: rgba(255,255,255,0.5); line-height: 1.6; }
        .why-card-num { position: absolute; top: 1.5rem; right: 1.75rem; font-family: var(--font-display); font-size: 2.5rem; font-weight: 700; color: rgba(201,168,76,0.07); }
        /* Academics */
        #academics { background: var(--cream); }
        .academics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: start; }
        .acad-features { display: grid; gap: 1rem; }
        .acad-feature { display: flex; align-items: flex-start; gap: 1rem; padding: 1.25rem; background: var(--white); border-radius: 12px; box-shadow: 0 2px 16px rgba(11,22,40,0.06); transition: all 0.25s; }
        .acad-feature:hover { transform: translateX(4px); }
        .acad-feature-icon { width: 44px; height: 44px; background: rgba(201,168,76,0.12); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
        .acad-feature-title { font-weight: 600; color: var(--navy); font-size: 0.95rem; }
        .acad-feature-desc { font-size: 0.82rem; color: var(--slate); margin-top: 0.2rem; }
        .academics-visual { background: linear-gradient(135deg, var(--navy), var(--navy-mid)); border-radius: 20px; padding: 3rem; position: sticky; top: 100px; }
        .acad-result-title { font-family: var(--font-display); font-size: 1.5rem; color: var(--white); margin-bottom: 2rem; text-align: center; }
        .result-bars { display: grid; gap: 1.5rem; }
        .result-bar-label { display: flex; justify-content: space-between; font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-bottom: 0.5rem; }
        .result-bar-track { height: 8px; background: rgba(255,255,255,0.08); border-radius: 50px; overflow: hidden; }
        .result-bar-fill { height: 100%; background: linear-gradient(90deg, var(--gold), var(--gold-light)); border-radius: 50px; width: 0; transition: width 1.5s cubic-bezier(0.25,0.46,0.45,0.94); }
        .result-highlights { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 2rem; }
        .result-highlight { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 1.25rem; text-align: center; }
        .result-highlight-num { font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--gold-light); }
        .result-highlight-label { font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-top: 0.25rem; }
        /* Admission */
        #admission { background: linear-gradient(135deg, var(--navy-mid) 0%, var(--navy) 100%); position: relative; overflow: hidden; }
        .admission-header { text-align: center; margin-bottom: 4rem; }
        .admission-steps { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0; margin-bottom: 4rem; position: relative; }
        .adm-step { text-align: center; }
        .adm-step-num { width: 56px; height: 56px; background: linear-gradient(135deg, var(--gold), var(--gold-light)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; color: var(--navy); }
        .adm-step-title { font-size: 0.9rem; font-weight: 600; color: var(--white); margin-bottom: 0.35rem; }
        .adm-step-desc { font-size: 0.78rem; color: rgba(255,255,255,0.45); }
        .admission-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start; margin-top: 4rem; }
        .adm-docs h3 { font-family: var(--font-display); font-size: 1.5rem; color: var(--white); margin-bottom: 1.5rem; }
        .adm-doc-list { display: grid; gap: 0.75rem; }
        .adm-doc-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1.25rem; background: rgba(255,255,255,0.04); border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); font-size: 0.88rem; }
        .adm-form-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(201,168,76,0.2); border-radius: var(--radius); padding: 2.5rem; backdrop-filter: blur(20px); }
        .adm-form-card h3 { font-family: var(--font-display); font-size: 1.5rem; color: var(--white); margin-bottom: 2rem; }
        .adm-form { display: grid; gap: 1.25rem; }
        .adm-form input, .adm-form select { width: 100%; padding: 0.85rem 1.1rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; color: var(--white); font-family: var(--font-body); font-size: 0.9rem; outline: none; }
        .adm-form input::placeholder { color: rgba(255,255,255,0.35); }
        .adm-form input:focus, .adm-form select:focus { border-color: var(--gold); }
        .adm-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        /* Testimonials */
        #testimonials { background: var(--cream); }
        .testimonials-header { text-align: center; margin-bottom: 4rem; }
        .testimonial-inner { max-width: 750px; margin: 0 auto; background: var(--white); border-radius: 20px; padding: 3rem; box-shadow: 0 8px 48px rgba(11,22,40,0.08); border: 1px solid rgba(201,168,76,0.15); text-align: center; }
        .testimonial-stars { color: var(--gold); font-size: 1.1rem; margin-bottom: 1.5rem; letter-spacing: 0.2em; }
        .testimonial-text { font-family: var(--font-display); font-size: 1.35rem; font-style: italic; color: var(--navy); line-height: 1.65; margin-bottom: 2rem; }
        .testimonial-author-photo { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--gold), var(--gold-light)); margin: 0 auto 0.75rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
        .testimonial-author-name { font-weight: 600; color: var(--navy); }
        .testimonial-author-role { font-size: 0.82rem; color: var(--slate); margin-top: 0.2rem; }
        .slider-controls { display: flex; justify-content: center; align-items: center; gap: 1.5rem; margin-top: 2.5rem; }
        .slider-btn { width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid rgba(11,22,40,0.2); background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.25s; color: var(--navy); }
        .slider-btn:hover { background: var(--navy); color: var(--white); }
        .slider-dots { display: flex; gap: 0.5rem; }
        .slider-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(11,22,40,0.2); cursor: pointer; transition: all 0.25s; border: none; }
        .slider-dot.active { background: var(--navy); width: 24px; border-radius: 4px; }
        /* Notices */
        #notices { background: var(--navy); }
        .notices-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; }
        .notice-col h3 { font-family: var(--font-display); font-size: 1.5rem; color: var(--white); margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(201,168,76,0.2); }
        .notice-list { display: grid; gap: 1rem; }
        .notice-item { display: flex; gap: 1rem; padding: 1.25rem; background: rgba(255,255,255,0.04); border-radius: 12px; transition: all 0.25s; border: 1px solid rgba(255,255,255,0.04); cursor: pointer; }
        .notice-item:hover { background: rgba(201,168,76,0.07); border-color: rgba(201,168,76,0.15); }
        .notice-date { text-align: center; flex-shrink: 0; background: linear-gradient(135deg, var(--gold), var(--gold-light)); border-radius: 10px; padding: 0.5rem 0.75rem; color: var(--navy); min-width: 52px; }
        .notice-day { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; line-height: 1; }
        .notice-month { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; }
        .notice-title { font-size: 0.88rem; font-weight: 600; color: rgba(255,255,255,0.85); line-height: 1.4; }
        .notice-cat { font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-top: 0.3rem; }
        /* Contact */
        #contact { background: var(--cream); }
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; }
        .contact-details { display: grid; gap: 1.25rem; margin-bottom: 2.5rem; }
        .contact-detail { display: flex; align-items: flex-start; gap: 1rem; }
        .contact-detail-icon { width: 46px; height: 46px; background: rgba(201,168,76,0.12); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
        .contact-detail-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--slate); font-weight: 600; }
        .contact-detail-value { font-weight: 500; color: var(--navy); margin-top: 0.15rem; font-size: 0.95rem; }
        .contact-form-card { background: var(--white); border-radius: 20px; padding: 3rem; box-shadow: 0 8px 48px rgba(11,22,40,0.08); border: 1px solid rgba(201,168,76,0.1); }
        .contact-form { display: grid; gap: 1rem; }
        .contact-form input, .contact-form select, .contact-form textarea { width: 100%; padding: 0.85rem 1rem; background: var(--cream); border: 1.5px solid rgba(11,22,40,0.1); border-radius: 10px; color: var(--text-dark); font-family: var(--font-body); font-size: 0.9rem; outline: none; }
        .contact-form input:focus, .contact-form select:focus, .contact-form textarea:focus { border-color: var(--gold); background: var(--white); }
        .contact-form textarea { resize: vertical; min-height: 100px; }
        .contact-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        /* Footer */
        footer.sw-footer { background: #060e1e; border-top: 1px solid rgba(201,168,76,0.15); }
        .footer-main { padding: 80px 0 50px; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 4rem; }
        .footer-brand p { font-size: 0.87rem; color: rgba(255,255,255,0.45); line-height: 1.7; margin: 1.25rem 0; }
        .footer-social { display: flex; gap: 0.75rem; }
        .social-btn { width: 38px; height: 38px; background: rgba(255,255,255,0.06); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.5); font-size: 0.9rem; transition: all 0.25s; border: 1px solid rgba(255,255,255,0.06); }
        .social-btn:hover { background: rgba(201,168,76,0.15); color: var(--gold-light); }
        .footer-col h4 { font-family: var(--font-display); font-size: 1.1rem; color: var(--white); margin-bottom: 1.25rem; }
        .footer-links { display: grid; gap: 0.6rem; }
        .footer-links a { font-size: 0.85rem; color: rgba(255,255,255,0.45); transition: color 0.2s; }
        .footer-links a:hover { color: var(--gold-light); }
        .footer-bottom { padding: 1.5rem 0; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
        .footer-bottom p { font-size: 0.8rem; color: rgba(255,255,255,0.35); }
        /* Reveal animations */
        .reveal { opacity: 0; transform: translateY(40px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-right { opacity: 0; transform: translateX(40px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal-right.visible { opacity: 1; transform: translateX(0); }
        /* WhatsApp */
        .whatsapp-float { position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 1070; }
        .whatsapp-btn { width: 56px; height: 56px; background: #25D366; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 32px rgba(37,211,102,0.4); transition: all 0.3s; }
        .whatsapp-btn:hover { transform: scale(1.1); }
        .whatsapp-btn svg { width: 28px; height: 28px; fill: var(--white); }
        /* Responsive */
        @media (max-width: 1100px) { .why-cards { grid-template-columns: repeat(2, 1fr); } .footer-grid { grid-template-columns: 1fr 1fr; gap: 3rem; } .notices-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 900px) { .hero-grid-layout { grid-template-columns: 1fr; } .about-grid { grid-template-columns: 1fr; } .academics-grid { grid-template-columns: 1fr; } .academics-visual { position: static; } .admission-steps { grid-template-columns: repeat(3, 1fr); row-gap: 2.5rem; } .admission-bottom { grid-template-columns: 1fr; } .contact-grid { grid-template-columns: 1fr; } .notices-grid { grid-template-columns: 1fr; } }
        @media (max-width: 768px) { .nav-links, .nav-cta { display: none; } .nav-burger { display: flex; } .section-pad { padding: 70px 0; } .why-cards { grid-template-columns: 1fr; } .footer-grid { grid-template-columns: 1fr; gap: 2.5rem; } .footer-bottom { flex-direction: column; text-align: center; } .about-pillars { grid-template-columns: 1fr; } .admission-steps { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .hero-btns { flex-direction: column; } .btn-lg { width: 100%; justify-content: center; } .admission-steps { grid-template-columns: 1fr; } .adm-form-row { grid-template-columns: 1fr; } .contact-form-row { grid-template-columns: 1fr; } }
      `}</style>

      <div className="sw-root">
        {/* Navbar */}
        <nav id="sw-navbar" className={scrolled ? "scrolled" : ""}>
          <div className="nav-inner">
            <a href="#hero" className="nav-logo">
              <img src="/school-logo.jpg" alt="Shri Abhay Nobles School" className="nav-logo-icon" />
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
                  <a href="#about">Facilities</a>
                  <a href="#about">Faculty</a>
                  <a href="#about">Student Life</a>
                </div>
              </li>
              <li><a href="#notices">News</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
            <div className="nav-cta">
              <Link href="/student/portal" className="btn btn-outline nav-cta-btn">Student Login</Link>
              <a href="#admission" className="btn btn-gold nav-cta-btn">Apply Now</a>
            </div>
            <button
              type="button"
              className={`nav-burger ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
          <a href="#about" onClick={closeMenu}>About Us</a>
          <a href="#academics" onClick={closeMenu}>Academics</a>
          <a href="#admission" onClick={closeMenu}>Admissions</a>
          <a href="#about" onClick={closeMenu}>Facilities</a>
          <a href="#notices" onClick={closeMenu}>News &amp; Events</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
          <div className="mobile-menu-cta">
            <Link href="/student/portal" className="btn btn-outline" onClick={closeMenu}>Student Login</Link>
            <a href="#admission" className="btn btn-gold" onClick={closeMenu}>Apply Now</a>
          </div>
        </div>
        <div className={`sw-overlay ${menuOpen ? "open" : ""}`} onClick={closeMenu} />

        {/* Announcement Bar */}
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

        {/* Hero */}
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
                    Shaping<br />
                    <em>Future Leaders</em><br />
                    of Tomorrow
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

        {/* About */}
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
              <div className="reveal">
                <p className="section-label">About Our School</p>
                <h2 className="display-md text-navy" style={{ marginBottom: "0.75rem" }}>A Legacy of Academic Excellence</h2>
                <div className="gold-line" />
                <p className="body-lg" style={{ color: "var(--text-body)", marginBottom: "2rem" }}>
                  Founded with a vision to provide world-class education, Shri Abhay Nobles Senior Secondary School has been shaping young minds for over two decades. Our holistic approach combines rigorous academics with character development, sports, arts, and life skills.
                </p>
                <div className="about-pillars">
                  {[
                    { icon: "📚", name: "Academic Excellence", desc: "RBSE curriculum with proven results" },
                    { icon: "🏃", name: "Sports & Fitness", desc: "State-of-the-art sports facilities" },
                    { icon: "🎨", name: "Arts & Culture", desc: "Nurturing creative expression" },
                    { icon: "🤝", name: "Character Building", desc: "Values-based education" },
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
                <a href="#admission" className="btn btn-outline-dark">Learn More →</a>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section id="why" className="section-pad">
          <div className="container">
            <div className="why-header">
              <p className="section-label text-center" style={{ justifyContent: "center" }}>Why Choose Us</p>
              <h2 className="display-lg text-white" style={{ marginTop: "1rem" }}>The Abhay Nobles Advantage</h2>
              <div className="gold-line center" />
            </div>
            <div className="why-cards">
              {[
                { icon: "🎓", title: "Expert Faculty", desc: "Highly qualified, experienced teachers dedicated to student success", num: "01" },
                { icon: "🏛️", title: "Modern Infrastructure", desc: "State-of-the-art labs, library, and smart classrooms", num: "02" },
                { icon: "🌟", title: "Holistic Development", desc: "Beyond academics — sports, arts, and leadership programs", num: "03" },
                { icon: "📊", title: "Proven Results", desc: "Consistently 98%+ board results with top university placements", num: "04" },
              ].map((c) => (
                <div key={c.num} className="why-card">
                  <span className="why-card-icon">{c.icon}</span>
                  <div className="why-card-title">{c.title}</div>
                  <div className="why-card-desc">{c.desc}</div>
                  <div className="why-card-num">{c.num}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Academics */}
        <section id="academics" className="section-pad">
          <div className="container">
            <div className="academics-grid">
              <div className="reveal">
                <p className="section-label">Academics</p>
                <h2 className="display-md text-navy" style={{ margin: "1rem 0" }}>World-Class Curriculum</h2>
                <p style={{ color: "var(--text-body)", marginBottom: "2.5rem" }}>Our RBSE-affiliated curriculum is designed to nurture critical thinking, creativity, and academic excellence from Class I to XII.</p>
                <div className="acad-features">
                  {[
                    { icon: "🔬", title: "Science Stream", desc: "Physics, Chemistry, Biology, Mathematics" },
                    { icon: "📐", title: "Commerce Stream", desc: "Accountancy, Business Studies, Economics" },
                    { icon: "📖", title: "Arts Stream", desc: "History, Geography, Political Science, Hindi" },
                    { icon: "💻", title: "Technology Integration", desc: "Computer labs, digital learning tools" },
                  ].map((f) => (
                    <div key={f.title} className="acad-feature">
                      <div className="acad-feature-icon">{f.icon}</div>
                      <div>
                        <div className="acad-feature-title">{f.title}</div>
                        <div className="acad-feature-desc">{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="academics-visual reveal-right">
                <div className="acad-result-title">Board Exam Results 2025</div>
                <div className="result-bars">
                  {[
                    { label: "Class XII — Science", pct: 98 },
                    { label: "Class XII — Commerce", pct: 96 },
                    { label: "Class XII — Arts", pct: 97 },
                    { label: "Class X — Overall", pct: 99 },
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
                    { num: "47", label: "Distinction Students" },
                    { num: "12", label: "State Toppers" },
                  ].map((h) => (
                    <div key={h.label} className="result-highlight">
                      <div className="result-highlight-num">{h.num}</div>
                      <div className="result-highlight-label">{h.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Admissions */}
        <section id="admission" className="section-pad">
          <div className="container">
            <div className="admission-header">
              <p className="section-label" style={{ justifyContent: "center" }}>Admissions 2026–27</p>
              <h2 className="display-lg text-white" style={{ marginTop: "1rem" }}>Join the Abhay Nobles Family</h2>
              <div className="gold-line center" />
              <p style={{ color: "rgba(255,255,255,0.55)", marginTop: "1rem", fontSize: "1rem" }}>Simple, transparent, and merit-based admission process</p>
            </div>
            <div className="admission-steps">
              {[
                { num: "1", title: "Enquiry", desc: "Visit or call us" },
                { num: "2", title: "Application", desc: "Fill online form" },
                { num: "3", title: "Assessment", desc: "Age-appropriate test" },
                { num: "4", title: "Interview", desc: "Student & parent meet" },
                { num: "5", title: "Admission", desc: "Welcome aboard!" },
              ].map((s) => (
                <div key={s.num} className="adm-step">
                  <div className="adm-step-num">{s.num}</div>
                  <div className="adm-step-title">{s.title}</div>
                  <div className="adm-step-desc">{s.desc}</div>
                </div>
              ))}
            </div>
            <div className="admission-bottom">
              <div className="adm-docs">
                <h3>Documents Required</h3>
                <div className="adm-doc-list">
                  {[
                    "📋 Previous year mark sheet / report card",
                    "🆔 Birth certificate (Aadhaar card)",
                    "📸 4 passport-size photographs",
                    "🏫 Transfer certificate from previous school",
                    "📍 Proof of residence (any one)",
                    "💉 Vaccination records (Class I only)",
                  ].map((d) => (
                    <div key={d} className="adm-doc-item">{d}</div>
                  ))}
                </div>
              </div>
              <div className="adm-form-card">
                <h3>Express Interest</h3>
                <div className="adm-form">
                  <div className="adm-form-row">
                    <input placeholder="Student's Full Name" />
                    <input placeholder="Parent's Name" />
                  </div>
                  <div className="adm-form-row">
                    <select>
                      <option value="">Class Applying For</option>
                      {["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"].map((c) => (
                        <option key={c}>Class {c}</option>
                      ))}
                    </select>
                    <input placeholder="Mobile Number" />
                  </div>
                  <button
                    type="button"
                    className="btn btn-gold"
                    style={{ width: "100%" }}
                    onClick={() => alert("Thank you! Our admissions team will contact you shortly.")}
                  >
                    Submit Enquiry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="section-pad">
          <div className="container">
            <div className="testimonials-header">
              <p className="section-label" style={{ justifyContent: "center" }}>Testimonials</p>
              <h2 className="display-lg text-navy" style={{ marginTop: "1rem" }}>What Our Community Says</h2>
              <div className="gold-line center" />
            </div>
            <div className="testimonial-inner">
              <div className="testimonial-stars">{testimonials[testimonialIdx].stars}</div>
              <p className="testimonial-text">"{testimonials[testimonialIdx].text}"</p>
              <div className="testimonial-author-photo">{testimonials[testimonialIdx].emoji}</div>
              <div className="testimonial-author-name">{testimonials[testimonialIdx].name}</div>
              <div className="testimonial-author-role">{testimonials[testimonialIdx].role}</div>
            </div>
            <div className="slider-controls">
              <button
                type="button"
                className="slider-btn"
                onClick={() => setTestimonialIdx((i) => (i - 1 + testimonials.length) % testimonials.length)}
              >
                ←
              </button>
              <div className="slider-dots">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`slider-dot ${i === testimonialIdx ? "active" : ""}`}
                    onClick={() => setTestimonialIdx(i)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="slider-btn"
                onClick={() => setTestimonialIdx((i) => (i + 1) % testimonials.length)}
              >
                →
              </button>
            </div>
          </div>
        </section>

        {/* Notices */}
        <section id="notices" className="section-pad">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <p className="section-label" style={{ justifyContent: "center" }}>Latest Updates</p>
              <h2 className="display-lg text-white" style={{ marginTop: "1rem" }}>News &amp; Notices</h2>
              <div className="gold-line center" />
            </div>
            <div className="notices-grid">
              {[
                {
                  title: "Announcements",
                  items: [
                    { day: "18", mon: "May", title: "Annual Sports Day — All students to participate", cat: "Event" },
                    { day: "12", mon: "May", title: "PTM scheduled for Class X — Parents requested to attend", cat: "Meeting" },
                    { day: "08", mon: "May", title: "Summer uniform effective from 1st June 2026", cat: "Circular" },
                  ],
                },
                {
                  title: "Examinations",
                  items: [
                    { day: "22", mon: "May", title: "Pre-board examination — Science practical batch A", cat: "Exam" },
                    { day: "15", mon: "May", title: "Unit test schedule — Class IX & X released", cat: "Exam" },
                    { day: "02", mon: "May", title: "Board result analysis session for Class XII", cat: "Academic" },
                  ],
                },
                {
                  title: "Admissions",
                  items: [
                    { day: "01", mon: "Jun", title: "Admissions open for 2026–27 academic session", cat: "Admission" },
                    { day: "25", mon: "May", title: "Scholarship test for new entrants — Register Now", cat: "Scholarship" },
                    { day: "20", mon: "May", title: "Last date for Class XI stream selection form", cat: "Deadline" },
                  ],
                },
              ].map((col) => (
                <div key={col.title} className="notice-col">
                  <h3>{col.title}</h3>
                  <div className="notice-list">
                    {col.items.map((n) => (
                      <div key={n.title} className="notice-item">
                        <div className="notice-date">
                          <div className="notice-day">{n.day}</div>
                          <div className="notice-month">{n.mon}</div>
                        </div>
                        <div>
                          <div className="notice-title">{n.title}</div>
                          <div className="notice-cat">{n.cat}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="section-pad">
          <div className="container">
            <div className="contact-grid">
              <div className="reveal">
                <p className="section-label">Contact Us</p>
                <h2 className="display-md text-navy" style={{ margin: "1rem 0 0.75rem" }}>Get in Touch</h2>
                <div className="gold-line" />
                <p style={{ color: "var(--text-body)", marginBottom: "2.5rem" }}>We'd love to hear from you. Visit our campus or reach out through any of the channels below.</p>
                <div className="contact-details">
                  {[
                    { icon: "📍", label: "Address", value: "Shri Abhay Nobles School, Rajasthan, India" },
                    { icon: "📞", label: "Phone", value: "+91 12345 67890 / +91 98765 43210" },
                    { icon: "📧", label: "Email", value: "office@abhaynobles.edu.in" },
                    { icon: "🕐", label: "Office Hours", value: "Mon – Sat: 8:00 AM – 4:00 PM" },
                  ].map((d) => (
                    <div key={d.label} className="contact-detail">
                      <div className="contact-detail-icon">{d.icon}</div>
                      <div>
                        <div className="contact-detail-label">{d.label}</div>
                        <div className="contact-detail-value">{d.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="reveal-right">
                <div className="contact-form-card">
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", color: "var(--navy)", marginBottom: "0.5rem" }}>Send a Message</h3>
                  <p style={{ fontSize: "0.88rem", color: "var(--slate)", marginBottom: "2rem" }}>We'll get back to you within 24 hours.</p>
                  <div className="contact-form">
                    <div className="contact-form-row">
                      <input placeholder="Your Name" />
                      <input placeholder="Phone Number" />
                    </div>
                    <input placeholder="Email Address" />
                    <select>
                      <option value="">Purpose of Enquiry</option>
                      <option>Admission Enquiry</option>
                      <option>Fee Structure</option>
                      <option>Campus Visit</option>
                      <option>Other</option>
                    </select>
                    <textarea placeholder="Your Message" />
                    <button
                      type="button"
                      className="btn btn-gold"
                      style={{ width: "100%" }}
                      onClick={() => alert("Message sent! We will get back to you soon.")}
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="sw-footer">
          <div className="footer-main">
            <div className="container">
              <div className="footer-grid">
                <div className="footer-brand">
                  <div className="nav-logo">
                    <img src="/school-logo.jpg" alt="" className="nav-logo-icon" />
                    <div>
                      <span className="nav-logo-name">Shri Abhay Nobles</span>
                      <span className="nav-logo-tag">Senior Secondary School</span>
                    </div>
                  </div>
                  <p>Nurturing young minds since 2000. RBSE affiliated senior secondary school committed to holistic education and excellence.</p>
                  <div className="footer-social">
                    {["f", "t", "in", "yt"].map((s) => (
                      <a key={s} href="#" className="social-btn">{s}</a>
                    ))}
                  </div>
                </div>
                <div className="footer-col">
                  <h4>Quick Links</h4>
                  <div className="footer-links">
                    {["About Us", "Academics", "Admissions", "Facilities", "Contact"].map((l) => (
                      <a key={l} href="#">{l}</a>
                    ))}
                  </div>
                </div>
                <div className="footer-col">
                  <h4>Academics</h4>
                  <div className="footer-links">
                    {["Class I–V", "Class VI–X", "Class XI–XII Science", "Class XI–XII Commerce", "Class XI–XII Arts"].map((l) => (
                      <a key={l} href="#">{l}</a>
                    ))}
                  </div>
                </div>
                <div className="footer-col">
                  <h4>Student Portal</h4>
                  <div className="footer-links">
                    <Link href="/student/portal">Student Login</Link>
                    <Link href="/teacher/login">Teacher Login</Link>
                    <Link href="/admin/login">Admin Login</Link>
                    <a href="#">Results</a>
                    <a href="#">Notices</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="footer-bottom">
              <p>© 2026 Shri Abhay Nobles Senior Secondary School. All rights reserved.</p>
              <p>Made with ♥ for education</p>
            </div>
          </div>
        </footer>

        {/* WhatsApp float */}
        <div className="whatsapp-float">
          <a href="https://wa.me/911234567890" target="_blank" rel="noreferrer" className="whatsapp-btn" aria-label="WhatsApp">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          </a>
        </div>
      </div>
    </>
  );
}
