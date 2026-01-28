# Appendix A: Tools

## Development Tools

- [Docker](https://www.docker.com/) and Docker Compose - Remove (most) "works on
  my machine", and as a bonus, make it work the same as in prod, too
- [Mailpit](https://github.com/axllent/mailpit) - Test email and SMTP without
  needing an actual email server or account
- [s3Mock](https://hub.docker.com/r/adobe/s3mock/) - S3-compatible, 
  locally-runnable object storage

## Libraries

### Testing

- [faker.js](https://github.com/faker-js/faker) - Faker.js is a library that
  allows you to generate fake data.
- [Testcontainers](https://testcontainers.org/) - Testcontainers is a library that
  allows you to create containers for testing.

### APIs and Type Safety

- [zod](https://github.com/colinhacks/zod) - Zod is a library that allows you to
  validate data.
- [tRPC](https://github.com/trpc/trpc) - tRPC is a library that allows you to
  create a API with type safety.

### Collaborative Editing

- [Yjs](https://github.com/yjs/yjs) - Yjs is a library that allows you to create
  collaborative documents.
- [Lexical DOM](https://github.com/facebook/lexical) - Rich text editor library.

### Infrastructure as Code

- [OpenTofu](https://opentofu.org/) - OpenTofu is a library that allows you to
  create a infrastructure as code; an open-source alternative to Terraform
  (which is a commercial product).
- [Ansible](https://www.ansible.com/) - Ansible is a library that allows you to
  define and manage what runs on your infrastructure.

### UI and UX

- [Tailwind CSS](https://tailwindcss.com/) - Tailwind CSS is a library that
  allows you to style your UI with CSS.
- [Shadcn UI](https://ui.shadcn.com/) - Shadcn UI is a component library that
  allows you to copy components into your own project, and modify them to your
  liking. Based on [Radix UI](https://www.radix-ui.com/).
- [TanStack](https://tanstack.com/) - TanStack is a collection of libraries that
  help you build good UX, using things like TanStack Query, to help you handle
  data fetching and caching, and TanStack Store to help you manage state.

## Hosting

- [Vultr](https://www.vultr.com/?ref=9583345) - Hunter's favorite infrastructure
  provider; fairly simple (you can get normal Linux servers), but with options
  to scale. This is a referral link.
- [Hetzner](https://www.hetzner.com/) - Another infrastructure provider that
  isn't as complex as AWS
- [Fly.io](https://fly.io/) - Deploy containers and scale them down to 0 or up
  to millions of requests

## Infrastructure

### Networking

- [TailScale](https://tailscale.com/) - Free VPN for up to 100 devices and 3
  users, making it easier to have devices talking to each other
- [Localhost.run](https://localhost.run/) - free, easy-to-use way to expose your
  localhost to the internet
- [Cloudflare Tunnel][1] - free, easy-to-use way to expose an application to the
  internet (if your domain is on Cloudflare)
- [Ngrok](https://ngrok.com/) and [LocalXpose](https://localxpose.io/) - reverse
  proxies that allow you to make `localhost` available to the internet

### Backend as a Service

- [Convex](https://www.convex.dev/) - document-based backend as a service
  focused around real-time data.
- [Pocketbase](https://pocketbase.io/), a simple, single-executable backend as a
  service.
- [Supabase](https://supabase.com/) backend-as-a-service that let you focus on 
  building features (Also, if you're using Supabase, I recommend giving 
  [this article][2] a read)
- [Infisical](https://infisical.com/) - secrets management 

### Continuous Deployment

- [Dokku](https://dokku.com/) - deploy your code on push
- [Coolify](https://coolify.io/) - FOSS Vercel

## Monitoring

- [Prometheus](https://prometheus.io/) - FOSS metrics and alerting
- [Grafana](https://grafana.com/) - logs, graphs, and other observability of
  your applications, with FOSS versions available

## Analytics

- [PostHog](https://posthog.com/startups) - Analytics, Feature Flags, AB
  Testing, Session Replay, and more to help you make more data-driven decisions
- [HotJar](https://www.hotjar.com/) - Heatmaps and Recordings to help you look
  at your users' behavior


## Prototyping

- [My JSON Server](https://my-json-server.typicode.com/) – turn a JSON file in
  your repo into a fake API.
- [JSON Placeholder API](https://jsonplaceholder.typicode.com/) - a preset fake
  API that can be used to grab data quickly.

[1]: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/
[2]: https://catjam.fi/articles/next-supabase-what-do-differently#supabase--database