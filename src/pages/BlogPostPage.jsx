import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getPostBySlug, BLOG_POSTS } from '../data/blogPosts';

function Block({ block }) {
  if (block.type === 'p') {
    return <p style={{ fontSize: 16, color: '#334155', lineHeight: 1.85, marginBottom: 20 }}>{block.text}</p>;
  }
  if (block.type === 'h2') {
    return <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 36, marginBottom: 16 }}>{block.text}</h2>;
  }
  if (block.type === 'list') {
    return (
      <ul style={{ marginBottom: 20, paddingLeft: 0, listStyle: 'none' }}>
        {block.items.map((item, i) => (
          <li key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 16, color: '#334155', lineHeight: 1.7 }}>
            <span style={{ color: '#4338CA', fontWeight: 700, flexShrink: 0 }}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === 'quote') {
    return (
      <div style={{ background: '#EEF2FF', borderLeft: '3px solid #4338CA', borderRadius: 8, padding: '18px 22px', marginBottom: 24 }}>
        <p style={{ fontSize: 15, color: '#3730A3', lineHeight: 1.75, fontStyle: 'italic', margin: 0 }}>{block.text}</p>
      </div>
    );
  }
  return null;
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
          <h1 style={{ fontSize: 24, color: '#0F172A', marginBottom: 8 }}>Post not found</h1>
          <Link to="/blog" style={{ color: '#4338CA', fontWeight: 700, textDecoration: 'none' }}>← Back to blog</Link>
        </div>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.metaDescription,
    "datePublished": post.date,
    "author": { "@type": "Organization", "name": "ScholarPrep" },
    "publisher": { "@type": "Organization", "name": "ScholarPrep", "url": "https://scholarprep.com.au" },
  };

  const related = BLOG_POSTS.filter(p => p.slug !== slug).slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', 'DM Sans', sans-serif" }}>
      <Helmet>
        <title>{post.title} | ScholarPrep Blog</title>
        <meta name="description" content={post.metaDescription} />
        <meta name="keywords" content={post.keywords} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:url" content={`https://scholarprep.com.au/blog/${slug}`} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://scholarprep.com.au/blog/${slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
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

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '56px 40px' }}>
        <Link to="/blog" style={{ fontSize: 13, color: '#4338CA', fontWeight: 700, textDecoration: 'none' }}>← All articles</Link>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#4338CA', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 20, marginBottom: 10 }}>{post.category}</div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 900, color: '#0F172A', letterSpacing: -0.8, lineHeight: 1.2, marginBottom: 16 }}>{post.title}</h1>
        <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 40, paddingBottom: 24, borderBottom: '1px solid #F3F4F6' }}>
          {post.author} · {new Date(post.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })} · {post.readTime}
        </div>

        {post.body.map((block, i) => <Block key={i} block={block} />)}

        <div style={{ marginTop: 48, padding: '32px', background: '#F8FAFC', borderRadius: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ready to start practising?</div>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 20 }}>7-day free trial. No credit card required.</p>
          <Link to="/signup" style={{ display: 'inline-block', padding: '13px 28px', borderRadius: 100, fontSize: 15, fontWeight: 700, color: '#fff', background: '#4338CA', textDecoration: 'none' }}>
            Start free trial →
          </Link>
        </div>

        {related.length > 0 && (
          <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #F3F4F6' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>More articles</div>
            {related.map(p => (
              <Link key={p.slug} to={`/blog/${p.slug}`} style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#0F172A', textDecoration: 'none', padding: '10px 0' }}>{p.title} →</Link>
            ))}
          </div>
        )}
      </article>

      <footer style={{ background: '#F8FAFC', borderTop: '1px solid #F3F4F6', padding: '32px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#94A3B8' }}>© {new Date().getFullYear()} Go Circle Pty Ltd · <Link to="/" style={{ color: '#94A3B8' }}>scholarprep.com.au</Link></p>
      </footer>
    </div>
  );
}
