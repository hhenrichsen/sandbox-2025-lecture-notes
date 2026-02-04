# 18 - Performance<!-- .element: class="title" -->

_by Hunter Henrichsen_

<!-- slide -->

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Pre-Lecture](#pre-lecture)
  - [Links](#links)
  - [Events](#events)
  - [Attendance Quiz](#attendance-quiz)
  - [News](#news)
- [Questions from Last Time](#questions-from-last-time)
- [Performance](#performance)
  - [Lighthouse Metrics and Why They Matter](#lighthouse-metrics-and-why-they-matter)
  - [Performance Strategies](#performance-strategies)
  - [Next.js Configuration for Performance](#nextjs-configuration-for-performance)
  - [Measuring](#measuring)
  - [Keeping Quality Up](#keeping-quality-up)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Pre-Lecture

<!-- vslide -->

### Links

- [Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLSdcu-u0LD5kB9rhOcA7E1ZCw6w05RlejzrFrRALEz7krkLjVQ/viewform?usp=sf_link)
- [Q&A Form](https://docs.google.com/forms/d/e/1FAIpQLSd4c3JqKFSybays7xUNk3EeiUaDak7XvRqRyosng0ATCZf2bQ/viewform?usp=sf_link)
- [Office Hours](https://calendly.com/hhenrichsen)

<!-- vslide -->

### Events

- [HackUSU](https://huntsman.usu.edu/hackusu/) is coming up on February
27th-28th. It's a hackathon hosted by USU up on their Logan campus and is a
great way to go find some like-minded folks. They have categories you can
compete in, or you can just go and work on your own projects. There's sometimes
a coupon code in the Slack, but I haven't seen it yet this year.

<!-- vslide -->

### Attendance Quiz

<!-- vslide -->

### News

<!-- slide -->

## Questions from Last Time

<!-- slide -->

## Performance

<!-- slide -->

### Lighthouse Metrics and Why They Matter

<!-- vslide -->

#### First Contentful Paint

<!-- notes -->

FCP measures how long it takes the browser to render the first piece of DOM
content after a user navigates to your page. It's a good indicator of how fast
your page takes to load at all.

<!-- vslide -->

#### Speed Index

<!-- notes -->

Speed Index measures how quickly content is visually displayed during page load.

<!-- vslide -->

#### Total Blocking Time

<!-- notes -->

TBT measures the total amount of time that a page is blocked from responding to
user input, such as mouse clicks, screen taps, or keyboard presses.

<!-- vslide -->

#### Largest Contentful Paint

<!-- notes -->

LCP measures how long it takes the browser to render the largest piece of DOM
content after a user navigates to your page. It's a good indicator of how fast
your page takes to load at all.

<!-- vslide -->

#### Cumulative Layout Shift

<!-- notes -->

CLS is a measure of the largest burst of layout shift scores for every
unexpected layout shift that occurs during the entire lifecycle of a page.

<!-- slide -->

### Performance Strategies

<!-- notes -->

I want to go over two websites that are super performant, and see how they
do it. We'll look at the inspiration first, with [McMaster-Carr](https://www.mcmaster.com/). Then we'll
look at [NextFaster](https://next-faster.vercel.app/), a Next.js implementation of the same site concept.

<!-- vslide -->

#### Waterfalling, Suspense, and Error Boundaries

<!-- notes -->

One of the most common early performance issues to fix is waterfalling. 
This is when you're stuck waiting for resources to load one after another,
when potentially you could be loading them in parallel. You can fix this
both by designing endpoints that return all of the data you need, and by
using Suspense and Error boundaries in parallel, rather than at a page level.

<!-- vslide -->

```typescript [1-3|5-9]
// Before (sequential - slow)
const products = await getProducts();
const categories = await getCategories();

// After (parallel - fast)
const [products, categories] = await Promise.all([
  getProducts(),
  getCategories(),
]);
```

<!-- notes -->

Using independent Suspense boundaries allows components to load in parallel rather
than waiting for each other:

<!-- vslide -->

```tsx
export default function Dashboard() {
  return (
    <section className="grid grid-cols-3 gap-4">
      {/* These load independently and in parallel */}
      <Suspense fallback={<CardsSkeleton />}>
        <Cards />
      </Suspense>
      
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>
      
      <Suspense fallback={<TableSkeleton />}>
        <DataTable />
      </Suspense>
    </section>
  );
}
```

<!-- notes -->

For the skeletons, use shimmer animations for better perceived performance:

<!-- vslide -->

```css
.skeleton {
  position: relative;
  background: #e2e8f0;
  overflow: hidden;
}

@media (prefers-reduced-motion: no-preference) {
  .skeleton::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      100deg,
      rgba(255, 255, 255, 0) 20%,
      rgba(255, 255, 255, 0.5) 50%,
      rgba(255, 255, 255, 0) 80%
    );
    animation: shimmer 2s infinite linear;
  }

  @keyframes shimmer {
    from { transform: translateX(-200%); }
    to { transform: translateX(200%); }
  }
}
```

<!-- notes -->

For error handling, wrap independent widgets separately so one failure doesn't
take down the whole page:

<!-- vslide -->

```tsx
import { ErrorBoundary } from "react-error-boundary";

function Dashboard() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AnalyticsWidget />
      </ErrorBoundary>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <NotificationsWidget />
      </ErrorBoundary>
    </div>
  );
}
```

<!-- vslide -->

#### Client Components

<!-- notes -->

Another very important piece is client components. Be very careful where you
put `"use client"` in your code. Ideally, it's only on small, individual
interactive components, rather than at a page level.

The benefit for this is that the server can cache parts of this page (especially
with PPR), which means for your users, the server components are effectively
free in terms of performance.

Keep `"use client"` as leaf nodes. Pass Server Components through slots to avoid
shipping unnecessary JS:

<!-- vslide -->

```tsx 
// Modal.tsx - Client Component (leaf node)
'use client'
export function Modal({ children }) {
  const [open, setOpen] = useState(false);
  return <dialog>{children}</dialog>;  // Server content passes through
}

// Page.tsx - Server Component
export default function Page() {
  return (
    <Modal>
      <HeavyServerData />  {/* Stays on server! */}
    </Modal>
  );
}
```

<!-- notes -->

For providers that need to wrap your app, use the children slot pattern:

<!-- vslide -->

```tsx
// providers.tsx - Client Component
'use client'
export function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}  {/* Server Components pass through */}
      </AuthProvider>
    </ThemeProvider>
  );
}

// layout.tsx - Server Component
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

<!-- vslide -->

#### Caching

<!-- notes -->

One of the simplest ways to improve performance is to only do the work once.
This can be done in a number of ways, including:

- **Static Generation**: Render pages at build time and just serve them. More useful for landing pages, blogs, product pages, etc.
- **Server-Side Caching**: Cache pages on the server for a short period of time.
- **Cache-Control Headers**: Set cache headers on your pages to control how long they're cached for, both on a CDN and client layer. [Here's a cheat sheet](https://shayy.org/posts/cache-control).
- **CDN / Edge Caching**: Cache pages at the edge of the network (usually not your network, but with a CDN like Cloudflare, CloudFront, Akamai, etc.), closer to the user.
- **Worker Caching**: Cache data locally in the browser using Service Workers.
- **Local Caching**: Cache data locally in the browser using IndexedDB, WASM SQLite, or other local storage solutions.

Stale-while-revalidate is also a great way to use caching, where you first return
the cached data, and then update the cache in the background. This is especially
useful for data that changes frequently, like news articles, or product prices.

In Next.js 16+, you can use the `"use cache"` directive for caching:

<!-- vslide -->

```typescript
import { cacheLife, cacheTag } from 'next/cache';

export async function getProducts() {
  'use cache'
  cacheLife('hours')  // Built-in profile: 'hours', 'days', etc.
  cacheTag('products')   // Tag for on-demand invalidation
  return db.query.products.findMany();
}

// Invalidate on-demand when data changes
'use server'
import { revalidateTag } from 'next/cache';

export async function updateProduct() {
  await db.products.update(...);
  revalidateTag('products');
}
```

<!-- notes -->

For API routes, add HTTP cache headers:

<!-- vslide -->

```typescript
// app/api/search/route.ts
return new Response(JSON.stringify(results), {
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=600", // 10 minutes
  },
});
```

<!-- notes -->

You can also look into Workbox for worker caching:

<!-- vslide -->

```javascript
// sw.js
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

precacheAndRoute(self.__WB_MANIFEST);

// Images: Cache-first (serve from cache, update in background never)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-v1',
    plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })],
  })
);

// API calls: Network-first (try network, fall back to cache)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-v1',
    networkTimeoutSeconds: 3,
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 60 * 60 })],
  })
);

// Static assets: Stale-while-revalidate (serve stale, update in background)
registerRoute(
  ({ request }) => ['style', 'script'].includes(request.destination),
  new StaleWhileRevalidate({ cacheName: 'static-v1' })
);
```

<!-- vslide -->

#### Prefetching

<!-- notes -->

Another option is to go and start fetching resources before they're needed.

You can do this with the `rel="preload"` attribute, which will tell the browser
to fetch and cache the resource before it's needed. This is especially useful
for images, fonts, and other assets that are needed early in the page load but
might not be triggered until later in the page load.

Most frameworks also have ways to prefetch resources, either on hover or by
proactively fetching resources then caching them before they're needed.

You can prefetch routes when links enter the viewport using IntersectionObserver:

<!-- vslide -->

```tsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function Link({ href, children }) {
  const router = useRouter();
  const ref = useRef<HTMLAnchorElement>(null);
  const prefetched = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !prefetched.current) {
          router.prefetch(href);
          prefetched.current = true;
        }
      },
      { rootMargin: "0px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [href, router]);

  return <a ref={ref} href={href}>{children}</a>;
}
```

<!-- notes -->

Or prefetch on hover for faster perceived navigation without preloading
everything:

<!-- vslide -->

```tsx
<a
  onMouseEnter={() => {
    router.prefetch(href);
    prefetchImages(href);
  }}
>
```

<!-- vslide -->

#### Chunking

<!-- notes -->

You can break your code down into just the parts that are needed for the current
page. Next.js does this by default, and you can do it with other frameworks by
using code splitting, or by using dynamic imports.

This keeps your page fast by reducing the amount of time spent on downloading,
parsing and executing code.

Another similar thing you can do is virtualize your data, so you're only loading
the data that's needed for the current page. This is especially useful for large
lists of data, like a list of products, users, or especially large tables.

For code splitting, use dynamic imports to load heavy components only when needed:

<!-- vslide -->

```typescript
'use client';
import dynamic from 'next/dynamic';

const HeavyModal = dynamic(() => import('../components/HeavyModal'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

export default function Page() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>Open Modal</button>
      {showModal && <HeavyModal onClose={() => setShowModal(false)} />}
    </>
  );
}
```

<!-- notes -->

For virtualization, use TanStack Virtual to only render visible items:

<!-- vslide -->

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedList({ items }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ItemComponent item={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

<!-- vslide -->

#### Do Less Work

<!-- notes -->

One of the biggest things I was doing at Lucid on the performance teams was
reducing the amount of work being done by the browser, especially our renderer.

Apps tend to load a lot of data that's not needed. It's easiest to start by
profiling your app and seeing what's taking the most time, and see where you 
can reduce the amount of work.

<!-- vslide -->

#### Perceived Performance

<!-- notes -->

Use `useDeferredValue` to keep the UI responsive during expensive operations
like filtering large lists:

<!-- vslide -->

```typescript
import { useState, useDeferredValue, useMemo } from 'react';

function ProductSearch({ products }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(deferredQuery.toLowerCase())
    );
  }, [deferredQuery, products]);

  const isStale = query !== deferredQuery;

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
      />
      <div style={{ opacity: isStale ? 0.7 : 1 }}>
        {filtered.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
```

<!-- notes -->

Use `useOptimistic` for instant UI feedback while mutations are in flight:

<!-- vslide -->

```tsx
'use client'
import { useOptimistic } from 'react';

export function MessageList({ messages }) {
  const [optimisticMessages, addOptimistic] = useOptimistic(
    messages,
    (state, newMsg) => [...state, { ...newMsg, sending: true }]
  );

  async function sendMessage(formData) {
    const text = formData.get('text');
    addOptimistic({ text, id: crypto.randomUUID() });  // Instant UI
    await addMessage(text);  // Background sync
  }

  return (
    <form action={sendMessage}>
      <ul>
        {optimisticMessages.map(msg => (
          <li key={msg.id} style={{ opacity: msg.sending ? 0.5 : 1 }}>
            {msg.text}
          </li>
        ))}
      </ul>
      <input name="text" />
      <button>Send</button>
    </form>
  );
}
```

<!-- vslide -->

#### Send Less Data

<!-- notes -->

A TCP packet is 1500 bytes. If your page can fit in one packet, it will 
[load much faster](https://endtimes.dev/why-your-website-should-be-under-14kb-in-size/).

<!-- vslide -->

#### Image Optimization

<!-- notes -->

Images are often the largest assets on a page. Use eager loading for above-the-fold
images, and lazy loading for everything else:

<!-- vslide -->

```tsx
{products.map((product, index) => (
  <Image
    src={product.image}
    alt={product.name}
    width={256}
    height={256}
    loading={index < 15 ? "eager" : "lazy"}
    decoding={index < 15 ? "sync" : "async"}
    quality={65}  // Lower quality for thumbnails
  />
))}
```

<!-- notes -->

Use `aspect-ratio` CSS to reserve space and prevent layout shift:

<!-- vslide -->

```css [2]
.image-container {
  aspect-ratio: 16 / 9;
  width: 100%;
  background-color: #f0f0f0;
}
```

<!-- notes -->

You can also prefetch images for links the user is likely to click:

<!-- vslide -->

```tsx
import { getImageProps } from "next/image";

function prefetchImage(src: string) {
  const { props } = getImageProps({
    src,
    width: 256,
    height: 256,
    quality: 80,
    alt: "",
  });
  
  const img = new Image();
  img.fetchPriority = "low";
  img.src = props.src;
  img.srcset = props.srcSet;
}
```

<!-- slide -->

### Next.js Configuration for Performance

<!-- notes -->

Enable these experimental features in `next.config.mjs` for better performance:

<!-- vslide -->

```javascript
// next.config.mjs
const nextConfig = {
  experimental: {
    ppr: true,           // Partial Prerendering - serve static shell instantly
    inlineCss: true,     // Inline critical CSS to reduce render-blocking
    reactCompiler: true, // Automatic memoization
  },
  images: {
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
  },
};

export default nextConfig;
```

<!-- notes -->

Use Turbopack for faster development builds:

<!-- vslide -->

```json
// package.json
{
  "scripts": {
    "dev": "next dev --turbo"
  }
}
```

<!-- notes -->

It can be worth comparing the bundle size of webpack and Turbopack to see which
one is better for your production builds.

<!-- slide -->

### Measuring

<!-- vslide -->

#### Lighthouse

Lighthouse is built into Chrome DevTools and provides scores for Performance,
Accessibility, Best Practices, and SEO. It measures the metrics we discussed earlier.

<!-- vslide -->

#### Chrome Dev Tools

The Performance panel in Chrome DevTools gives you a detailed timeline of your
page's loading and runtime performance. You can see paint events, JavaScript
execution, network requests, and more.

<!-- vslide -->

#### Node.js Profiling

For server-side performance, use Node's built-in profiler, or run with the
`NODE_OPTIONS='--inspect' next dev --turbo` flag to get a profiling session
that you can connect to with `chrome://inspect`.

<!-- vslide -->

#### Bundle Analysis

<!-- notes -->

Use `@next/bundle-analyzer` to visualize your JavaScript bundles (with webpack):

<!-- vslide -->

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react', 'lodash-es'],
  },
});
```

<!-- notes -->

Or use the turbopack bundle analyzer with `npx next experimental-analyze`.

<!-- notes -->

Run `ANALYZE=true npm run build` to generate visual treemaps.

<!-- vslide -->

#### Vercel Speed Insights

<!-- notes -->

Add performance monitoring to track Core Web Vitals in production:

<!-- vslide -->

```tsx
// app/layout.tsx
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
```

<!-- slide -->

### Keeping Quality Up

<!-- vslide -->

#### Lighthouse CI

<!-- notes -->

Run Lighthouse in CI to catch performance regressions before they ship. They
provide a GitHub Action that makes this easy.

<!-- vslide -->

#### Size Limit

<!-- notes -->

Configure size-limit to fail builds when bundles exceed thresholds:

```json
// package.json
{
  "size-limit": [
    { "path": ".next/static/**/*.js", "limit": "200 kB", "gzip": true }
  ]
}
```

Add a GitHub Actions workflow for automated PR checks:

<!-- vslide -->

```yaml
name: Bundle Size Check
on: [pull_request]

jobs:
  size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci && npm run build
      - uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

<!-- vslide -->

#### Tree Shaking

<!-- notes -->

Always import specific functions rather than entire libraries. The difference
is substantial:

```typescript
// ❌ Imports entire library (~70KB)
import _ from 'lodash';

// ✅ Tree-shakeable (~3KB)
import { filter } from 'lodash-es';

// ✅✅ Best - direct import (~1KB)
import filter from 'lodash/filter';
```