# 16 - Continuous Delivery

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Pre-Lecture](#pre-lecture)
  - [Links](#links)
  - [Attendance Quiz](#attendance-quiz)
  - [News](#news)
- [Questions from Last Time](#questions-from-last-time)
  - [Have You Ever Fine-tuned an Llm? Under what Circumstance Would You Recommend Doing This?](#have-you-ever-fine-tuned-an-llm-under-what-circumstance-would-you-recommend-doing-this)
  - [If You Have an AI Component of an App (like the Improve Button on slido), what is the Best way to Test the Quality of the AI's Response?](#if-you-have-an-ai-component-of-an-app-like-the-improve-button-on-slido-what-is-the-best-way-to-test-the-quality-of-the-ais-response)
  - [What are your thoughts on Anthropic saying stuff like that (in relation to building Claude Cowork in 10 days) but then announcing massive engineering hire numbers. Why would they need so many new engineers?](#what-are-your-thoughts-on-anthropic-saying-stuff-like-that-in-relation-to-building-claude-cowork-in-10-days-but-then-announcing-massive-engineering-hire-numbers-why-would-they-need-so-many-new-engineers)
- [Keep it Simple](#keep-it-simple)
- [Containers](#containers)
- [Deployment Strategy](#deployment-strategy)
- [Managing Infrastructure](#managing-infrastructure)
- [Continuous Deployment](#continuous-deployment)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Pre-Lecture

<!-- vslide -->

### Links

- [Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLSdcu-u0LD5kB9rhOcA7E1ZCw6w05RlejzrFrRALEz7krkLjVQ/viewform?usp=sf_link)
- [Q&A Form](https://docs.google.com/forms/d/e/1FAIpQLSd4c3JqKFSybays7xUNk3EeiUaDak7XvRqRyosng0ATCZf2bQ/viewform?usp=sf_link)
- [Office Hours](https://calendly.com/hhenrichsen)

<!-- vslide -->

### Attendance Quiz

<!-- vslide -->

### News

<!-- slide -->

## Questions from Last Time

<!-- vslide -->

### Have You Ever Fine-tuned an Llm? Under what Circumstance Would You Recommend Doing This?

<!-- notes -->

Everything I've read on this indicates that you need a lot of data, and that
that's most of the work. You need good, clean data, and collecting or generating
that and verifying it all is time consuming. This has turned me off of doing
anything like that.

There's a compute cost associated as well, but I don't have enough experience
with this to put numbers to it.

As I understand it, the main benefits of a fine tune are things like style and
rules, where you can make a model respond closer to brand guidelines or set it
up for specific tasks. RAG and context engineering are what you want if you want
specific facts or context.

If I needed specific style or rules, a fine tune is something that I'd consider
doing but isn't something I've needed to do.

<!-- vslide -->

### If You Have an AI Component of an App (like the Improve Button on slido), what is the Best way to Test the Quality of the AI's Response?

<!-- notes -->

I'm a bit new to this, but I'm going to not be as new in the coming months since
I'm moving to the AI teams at Lucid.

Verify it in a number of different ways; LLM evals are a deep area and there are
lots of different approaches:

- Some people write tests and run them hundreds of times to verify that certain
  assertions are followed in the output.
- Some people log their traces with different tools, allowing them to sift
  through messages, tool calls, and see how well the AI is performing.
- With enough users, you can A/B test different prompts and context engineering.

<!-- vslide -->

### What are your thoughts on Anthropic saying stuff like that (in relation to building Claude Cowork in 10 days) but then announcing massive engineering hire numbers. Why would they need so many new engineers?

<!-- notes -->

I have a couple thoughts on this. Most of the senior engineers I know spend more
time reviewing, designing and consulting on code than actually coding. Some of
that is due to AI tools, some of that is the nature of how the work goes.

I think a big portion of that is due to taste.

As you read and write more code–and especially as you make more mistakes writing
code–you start to develop an instinct or intuition for what will work, what will
be maintainable, and what will be easy to use. The same applies to products,
too. I've built some really bad user flows, and that's fed into learning how to
build some kind-of-okay user flows.

I'm not anthropic, but I also imagine that there are a lot of different areas
that need specialization. The types of engineers I work with on the performance
team at Lucid are much more specialized, and I imagine the same is true for the
engineers who work on the Bun interpreter, the Bun compiler, the infrastructure
required to run the Claude models (and run all of the tasks that the Claude
models do), and the model teams all require different kinds of expertise. AI
agents are good in my experience for generic tasks, but need either careful
guidance or an actual engineer to go in and set the pattern for them. It's part
of why I don't worry too much about job security.

<!-- slide -->

## Keep it Simple

<!-- notes -->

My first advice before we talk about any deployment is to keep it simple. You
can host pretty complex software on free managed hosts; the vendor lock in is
worth being aware of, but it can take you pretty far.

I think Shayan's perspective is good in
[this article](https://shayy.org/posts/a-few-servers). You should be focused on
being a product engineer and solving your users' problems. You don't want to be
spending time fighting infrastructure that can scale to 1,000,000 concurrent
requests when you get 50 requests a day.

<!-- vslide -->

> I wrap everything with Docker, deploy it to a PaaS or a VPS, and voilà, I'm
> done.
>
> Need to scale? I go vertical; I add more memory and CPU to my server and call
> it a day. Need to scale even more? I add a few servers and a load balancer.

<!-- notes -->

Additionally, when you run into limitations, that doesn't need to mean you jump
several orders of magnitude elsewhere. A jump from Vercel to Hetzner is a lot
more straightforward than a jump from Vercel to a full, Terraform-managed AWS
Elastic Kubernetes Service deployment.

<!-- slide -->

## Containers

<!-- notes -->

Containers are cool. You should use them. It's super easy to find dockerfiles
created by the same people who
[maintain the libraries that you're using in your projects](https://github.com/vercel/next.js/blob/917ff14ce2a1dc60913dab436e8bddb8952ae93b/examples/with-docker/Dockerfile).

They abstract the dependency setup of your production application into a simple
set of steps that can be cached and rerun on any machine. Barring a couple
quirks, they tend to remove some of the "works on my machine" type issues. You
can even use volumes or connect VSCode to a codebase inside of a container,
allowing you to develop without ever needing to install the project's
dependencies on the host machine. All of these combine to make it easy for new
developers to come up to speed on your project.

They're also nearly ubiquitous to deploy. AWS has multiple services that can
deploy them. They're simple to set up on VPSes. Fly.io and Railway both operate
on containers.

Because they're so ubiquitous, most dependencies can also be run locally. You
can have an [s3 emulator](https://hub.docker.com/r/adobe/s3mock/),
[redis cache or queue](https://hub.docker.com/_/redis),
[postgres database](https://hub.docker.com/_/postgres),
[database admin tool](https://hub.docker.com/_/adminer), and
[email testing tool](https://hub.docker.com/r/axllent/mailpit) running along
with your development project. Or you can go all in and run the same
infrastructure you run in production on your dev machine, depending on what you
need.

<!-- slide -->

## Deployment Strategy

<!-- notes -->

There are lots of ways to deploy. You can go more traditional, with something
like a VPS or dedicated server. I've even heard of some people even hosting off
of things like Raspberry Pis or renting server racks, where you own the compute
and can upgrade it directly.

On another other hand, you can move towards more managed solutions, like Vercel,
Railway, and Fly.io. These will handle the infrastructure for you (and sometimes
will even let you scale to zero, so you only pay when your server's on), but can
come with tradeoffs.

There are also providers like AWS that range from more managed-style with things
like Lightsail and Fargate, to closer to just dedicated servers with EC2.

My general recommendation is go with a platform as a service until you find a
limitation that requires you to have more control over your application. You can
do a surprising amount of work with just a few gigabytes of ram and a CPU core
or two.

<!-- slide -->

## Managing Infrastructure

<!-- notes -->

It's probably worth looking into something like Terraform and Ansible to manage
your infrastructure and what's running on it. Checking that in as code and
running it as a part of the deployment process can make it much easier than
having to go navigate the AWS console.

<!-- slide -->

## Continuous Deployment

<!-- notes -->

Continuous Deployment is as varied as your tech stack. I like doing this on
GitHub actions, and most providers make that easy. For example, here's my deploy
runner for https://hvz.gg:

```yaml
name: Fly Deploy
on:
  push:
    branches:
      - main
jobs:
  deploy:
    name: Deploy app
    runs-on: ubuntu-latest
    concurrency: deploy-group # optional: ensure only one action runs at a time
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master

      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

You can go more complex, of course. Vercel allows you to trigger and deploy
builds from GitHub actions, which might be good to do if your build process is
more complex or you want to do additional verification steps in your build
process. Here's how I deploy https://audience.hx2.dev, where I want to push my
migrations to Supabase before I deploy to Vercel (and want to fail the deploy if
my migrations fail):

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
  SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
  SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
  CI: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - uses: supabase/setup-cli@v1
        with:
          version: latest
      - uses: actions/cache@v4
        with:
          path: |
            ~/.bun/install/cache
            ${{ github.workspace }}/.next/cache
          key:
            ${{ runner.os }}-nextjs-${{ hashFiles('**/bun.lock') }}-${{
            hashFiles('**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx') }}
          # If source files changed but packages didn't, rebuild from a prior cache.
          restore-keys: |
            ${{ runner.os }}-nextjs-${{ hashFiles('**/bun.lock') }}-

      - name: Install dependencies
        run: bun install

      - name: Run linting
        run: bun run lint

      - name: Install Vercel CLI
        run: bun install -g vercel@latest

      - name: Pull environment variables
        run:
          vercel env pull --environment=production --token=${{
          secrets.VERCEL_TOKEN }} .env

      - run: source .env && supabase link --project-ref $SUPABASE_PROJECT_ID
      - run: source .env && supabase db push

      - name: Deploy to Vercel
        run: |
          vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
          vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
          vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

That said, there are other tools out there. Coolify is one that comes up
frequently, which tries to emulate Vercel, Heroku, and Netlify in that it will
automatically deploy your app when you push to Git, but you can host it
yourself.

Some teams have even just had a GitHub action that SSHes into their production
machine, does a git pull, then restarts the server. It can be as complex or as
simple as you want.

My big caution goes back to last week's lecture: I think if you're doing
automated deploys, you need enough automated verification that you have
confidence that you're not breaking something critical. You can wait until a
customer complains, but a better response to "hey this is broken" is "yeah,
we've got a fix on the way out" rather than "thanks for letting us know, we're
looking into it".
