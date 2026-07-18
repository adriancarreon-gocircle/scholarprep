import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BLOG_POSTS } from '../data/blogPosts';

export default function BlogPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', 'DM Sans', sans-serif" }}>
      <Helmet>
        <title>Blog — Exam Prep Tips & Guides | ScholarPrep</title>
        <meta name="description" content="Practical guides and tips for ACER, NAPLAN, OC, SEHS, ASET/GATE, HAST and other Australian selective entry and scholarship exams." />
        <meta property="og:title" content="Blog — Exam Prep Tips & Guides | ScholarPrep" />
        <meta property="og:description" content="Practical guides and tips for Australian selective entry and scholarship exams." />
        <meta property="og:url" content="https://scholarprep.com.au/blog" />
        <link rel="canonical" href="https://scholarprep.com.au/blog" />
      </Helmet>

      <nav style={{ background: '#fff', borderBottom: '1px solid #F3F4F6', padding: '14px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 900, color: '#0F172A' }}>Scholar<span style={{ color: '#4338CA' }}>Prep</span></span>
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/login" style={{ fontSize: 14, color: '#64748B', textDecoration: 'none', fontWeight: 600 }}>Log in</Link>
          <Link to="/signup" style={{ fontSize: 14, fontWeight: 700, color: '#fff', background: '#4338CA', padding: '8px 20px', borderRadius: 100, textDecoration: 'none' }}>Start free trial</Link>
        </div>
      </nav>

      <header style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #fff 100%)', padding: '64px 40px 48px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 900, color: '#0F172A', letterSpacing: -1, marginBottom: 12 }}>The ScholarPrep Blog</h1>
          <p style={{ fontSize: 17, color: '#475569', lineHeight: 1.7 }}>Practical guides, exam breakdowns and preparation tips for Australian selective entry and scholarship exams.</p>
        </div>
      </header>

      <section style={{ maxWidth: 800, margin: '0 auto', padding: '48px 40px' }}>
        {posts.map(post => (
          <Link key={post.slug} to={`/blog/${post.slug}`} style={{ display: 'block', textDecoration: 'none', padding: '28px 0', borderBottom: '1px solid #F3F4F6' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#4338CA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{post.category}</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 8, lineHeight: 1.3 }}>{post.title}</h2>
            <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.7, marginBottom: 10 }}>{post.excerpt}</p>
            <div style={{ fontSize: 13, color: '#94A3B8' }}>
              {new Date(post.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })} · {post.readTime}
            </div>
          </Link>
        ))}
        {posts.length === 0 && (
          <p style={{ color: '#94A3B8', textAlign: 'center', padding: '40px 0' }}>New posts coming soon.</p>
        )}
      </section>

      <footer style={{ background: '#F8FAFC', borderTop: '1px solid #F3F4F6', padding: '32px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#94A3B8' }}>© {new Date().getFullYear()} Go Circle Pty Ltd · <Link to="/" style={{ color: '#94A3B8' }}>scholarprep.com.au</Link></p>
      </footer>
    </div>
  );
}
