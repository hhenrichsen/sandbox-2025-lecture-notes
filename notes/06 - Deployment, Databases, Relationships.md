# 06 - Deployment, Databases, Relationships<!-- .element: class="title" -->

_by Hunter Henrichsen_

<!-- vslide -->
<!-- prettier-ignore-start -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Pre-Lecture](#pre-lecture)
  - [Links](#links)
  - [News](#news)
- [Questions from Last Time](#questions-from-last-time)
- [Deployment](#deployment)
  - [Serverless](#serverless)
  - [Managed](#managed)
  - [Unmanaged](#unmanaged)
  - [On-Premise](#on-premise)
  - [Containers](#containers)
  - [Networking](#networking)
- [Databases](#databases)
  - [Relational](#relational)
  - [Document](#document)
  - [Graph](#graph)
- [Relationships](#relationships)
- [Group Activity](#group-activity)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
<!-- prettier-ignore-end -->

<!-- slide -->

## Pre-Lecture

<!-- vslide -->

### Links

- [Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLSdcu-u0LD5kB9rhOcA7E1ZCw6w05RlejzrFrRALEz7krkLjVQ/viewform?usp=sf_link)
- [Q&A Form](https://docs.google.com/forms/d/e/1FAIpQLSd4c3JqKFSybays7xUNk3EeiUaDak7XvRqRyosng0ATCZf2bQ/viewform?usp=sf_link)
- [Office Hours](https://calendly.com/hhenrichsen)

<!-- vslide -->

### News

- Discord and Oracle data
  breaches<!-- .element: class="fragment fade-in-then-semi-out" -->
- Unity and Azure
  vulnerabilities<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- slide -->

## Questions from Last Time

<!-- slide -->

## Deployment

<!-- notes -->

A lot of my philosophy comes down to Shayy's advice
[here](https://shayy.org/posts/a-few-servers); keep things simple, and when
simple doesn't work anymore make small increments. The following will be
attributes; its possible to be bother serverless and container-focused.

<!-- vslide -->

### Serverless

- _Examples: Lambda, Supabase
  Functions_<!-- .element: class="fragment fade-in-then-semi-out" -->
- Easy scale-to-zero<!-- .element: class="fragment fade-in-then-semi-out" -->
- Heavy limitations (duration, bundle
  size)<!-- .element: class="fragment fade-in-then-semi-out" -->
- Heavier lock-in<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- notes -->

Serverless is the idea that your code is running on a server that you don't own
or manage. It also normally means that the infrastructure can scale with demand,
and has a collection of constraints.

I know some people who swear by serverless, and insist that with Lambdas, S3 and
DynamoDB you can build whatever you need to get off the ground. I also have
[read about](https://web.archive.org/web/20230303095313/https://world.hey.com/dhh/don-t-be-fooled-by-serverless-776cd730)
some people not liking serverless due to the substantial overhead (both in
compute and cost);
[even Amazon](https://web.archive.org/web/20230505021023/https://www.primevideotech.com/video-streaming/scaling-up-the-prime-video-audio-video-monitoring-service-and-reducing-costs-by-90)
moved some of their services off of Lambda.

<!-- vslide -->

### Managed

- _Examples: Vercel, Netlify,
  Fly.io_<!-- .element: class="fragment fade-in-then-semi-out" -->
- Pay a premium<!-- .element: class="fragment fade-in-then-semi-out" -->
- Varying limitations<!-- .element: class="fragment fade-in-then-semi-out" -->
- Generally the easiest<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- notes -->

Managed services are a good place to start and should be what you're using if
you don't have a good reason not to be. They tend to have free tiers, and
provide a lot of the tools for you.

<!-- vslide -->

### Unmanaged

- _Examples: Vultr,
  EC2_<!-- .element: class="fragment fade-in-then-semi-out" -->
- Always online<!-- .element: class="fragment fade-in-then-semi-out" -->
- Full control<!-- .element: class="fragment fade-in-then-semi-out" -->
- More work and
  administration<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- notes -->

The other end of managed is unmanaged. You get an empty linux distro and get to
set up everything yourself; the server stays online so long as there's not an
issue in the data center. If you have consistent demand, these can be much more
affordable than managed options.

The catch is that you have to do all of the administration yourself, but that
doesn't need to be super complex; Lucid's pipeline for awhile was to ssh into
the servers, download the latest version of the code, then restart the running
server, and an approach like that will handle a surprising amount of traffic.

These servers tend to be easy to scale vertically as well, and you can toss a
load balancer in front of them fairly easily when you outgrow vertical scale.

<!-- vslide -->

### On-Premise

- Hardware control<!-- .element: class="fragment fade-in-then-semi-out" -->
- Most work<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- notes -->

Some data centers will let you rent rack space, or sometimes your site will deal
with a surprising amount of traffic running on a Raspberry Pi on your home
network. You can also manage your own hardware, though the up-front investment
tends to make it trickier.

[Some people](https://web.archive.org/web/20221026063000/https://world.hey.com/dhh/why-we-re-leaving-the-cloud-654b47e0)
have found that it works well for them, and that they save a lot of money by
doing that.
[Chick-fil-a](https://medium.com/chick-fil-atech/observability-at-the-edge-b2385065ab6e)
also does an absolutely insane edge network in-store using on-prem machines.

<!-- vslide -->

### Containers

- Run your app in a consistent
  environment<!-- .element: class="fragment fade-in-then-semi-out" -->
- Cache work<!-- .element: class="fragment fade-in-then-semi-out" -->
- Easy deployment<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- notes -->

Containers aren't really a deployment option on their own (though there are
managed and unmanaged ways to do it). I strongly recommend using them, though,
as they make it easy to have a portable environment.

Docker containers are assembled in layers from a relatively simple grammar;
everything unchanged is cached, so the primary layers you want to be aware of
are the ones that work with files, like `COPY`. You can use multiple distinct
layers to isolate dependencies and produce smaller containers.

Here's an example Next.js dockerfile (albeit more complex than strictly
necessary), from their
[example repo](https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile).

<!-- vslide -->

```dockerfile
# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

Certain providers (fly.io, Railway, AWS fargate, etc.) make it easy to deploy
and manage containers without needing to set up a whole server to do it
yourself. This is my preferred way to deploy applications, and how I deploy
things like https://hvz.gg.

<!-- vslide -->

### Networking

<!-- notes -->

As you start to do more complex networking, it can make sense to incorporate
something like Tailscale or Warp to manage networking for you. This will let
your machines talk to each other through tunnels, rather than needing to invest
a long time in setting up a VPC or other similar tools.

<!-- slide -->

## Databases

<!-- vslide -->

### Relational

- _Examples: MySQL, PostgreSQL,
  Supabase_<!-- .element: class="fragment fade-in-then-semi-out" -->
- Atomic Data: Rows<!-- .element: class="fragment fade-in-then-semi-out" -->
- Connect rows to other tables and query across them, constrain columns; rigid,
  enforced<!-- .element: class="fragment fade-in-then-semi-out" -->
- Migrations provide a record of
  change<!-- .element: class="fragment fade-in-then-semi-out" -->
- Migrating large tables can be
  difficult<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- notes -->
<!-- vslide -->

### Document

- _Examples: DynamoDB, MongoDB,
  Convex_<!-- .element: class="fragment fade-in-then-semi-out" -->
- Atomic Data:
  Documents<!-- .element: class="fragment fade-in-then-semi-out" -->
- Scale via Sharding and
  Indices<!-- .element: class="fragment fade-in-then-semi-out" -->
- No constraints;
  flexible<!-- .element: class="fragment fade-in-then-semi-out" -->
- Must account for backwards compatibility or write migration
  scripts<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- notes -->
<!-- vslide -->

### Graph

- _Examples: Neo4j_<!-- .element: class="fragment fade-in-then-semi-out" -->
- Atomic Data: Nodes,
  Edges<!-- .element: class="fragment fade-in-then-semi-out" -->
- Scale via Sharding and
  Indices<!-- .element: class="fragment fade-in-then-semi-out" -->
- They look neat for specific problems, but many of those problems can also be
  expressed relationally. I haven't used these much besides just trying them
  out, though.<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- notes -->

<!-- slide -->

## Relationships

<!-- notes -->

- Relationships and your schema are some of the things I think you should spend
  the most time designing up-front. You'll want to make sure you can iterate on
  them, but a good foundation here allows you to iterate more quickly.
- Often times, it makes sense to have meta-relationship information as well;
  Many-to-many tables give you a table for this automatically.

<!-- slide -->

## Group Activity

Let's build GitHub gist:

- Users can create gists
- Users can read public gists
- Users can allow other users to edit their gists
- Users can create private gists
- Private gists can only be accessed by the link
- Public gists are shown in a list view
