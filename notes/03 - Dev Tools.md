# 03 - Dev Tools<!-- .element: class="title" -->

_by Hunter Henrichsen_

<!-- vslide -->
<!-- prettier-ignore-start -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Pre-Lecture](#pre-lecture)
  - [Links](#links)
  - [News](#news)
- [Questions from Last Time](#questions-from-last-time)
  - [AI "bombs"](#ai-bombs)
- [Pseudo-Q&A](#pseudo-qa)
- [External Tools](#external-tools)
  - [Httpie](#httpie)
  - [Bruno](#bruno)
  - [Docker](#docker)
- [Off-the-shelf Tools](#off-the-shelf-tools)
  - [Posthog](#posthog)
  - [Supabase](#supabase)
  - [Sentry](#sentry)
- [Chrome Dev Tools](#chrome-dev-tools)
  - [Browser Console](#browser-console)
  - [Network Tab](#network-tab)
  - [Sources Tab](#sources-tab)
  - [Performance Tab](#performance-tab)
  - [Application Tab](#application-tab)
- [Group Activity](#group-activity)
- [For Next Time](#for-next-time)

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

<!-- slide -->

## Questions from Last Time

<!-- vslide -->

### AI "bombs"

<!-- slide -->

## Pseudo-Q&A

<!-- slide -->

## External Tools

<!-- notes -->
<!-- vslide -->

### Httpie

- Simple one-off HTTP
requests<!-- .element: class="fragment fade-in-then-semi-out" -->
<!-- notes -->

Get it [here](https://httpie.io/)

<!-- vslide -->

### Bruno

- Graphical interface for HTTP
  requests<!-- .element: class="fragment fade-in-then-semi-out" -->
- Can turn into basic integration tests depending on the
  setup<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- notes -->

Get it [here](https://www.usebruno.com/).

<!-- vslide -->

### Docker

- Declare and run service dependencies
  locally<!-- .element: class="fragment fade-in-then-semi-out" -->
- Make it easier for new engineers to join your
  team<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- notes -->
<!-- slide -->

## Off-the-shelf Tools

<!-- vslide -->

Note: You don't necessarily need any or all of these, but they tend to offer
free plans that can be useful and keep you focused on
building.<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- notes -->

<!-- vslide -->

### Posthog

- Metric Tracking<!-- .element: class="fragment fade-in-then-semi-out" -->
- Session Replay<!-- .element: class="fragment fade-in-then-semi-out" -->
- AB Testing<!-- .element: class="fragment fade-in-then-semi-out" -->
- Alternatives: HotJar,
  LogRocket<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- notes -->

<!-- vslide -->

### Supabase

- Database Hosting<!-- .element: class="fragment fade-in-then-semi-out" -->
- Authentication<!-- .element: class="fragment fade-in-then-semi-out" -->
- Realtime Updates<!-- .element: class="fragment fade-in-then-semi-out" -->
- Alternatives: Firebase, Convex,
  Pocketbase<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- notes -->

<!-- vslide -->

### Sentry

- Error Capture and
  Alerting<!-- .element: class="fragment fade-in-then-semi-out" -->
- Alternatives: LogRocket, Datadog,
  Grafana<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- notes -->

<!-- vslide -->

## Chrome Dev Tools

<!-- notes -->

<!-- vslide -->

### Browser Console

- Global Inspection
  Variables<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- notes -->

You can create global variables in your app (varying based on the build
process). Generally, you can do something like this:

<!-- vslide -->

```tsx
const [questions, setQuestions] = useState<Question[]>([]);

useEffect(() => {
  if (env.NODE_ENV === "development") {
    // @ts-expect-error: TS7015 -- creating a new global debug variable
    // eslint-disable-next-line @typescript-eslint/dot-notation -- Creating a new global
    window["questions"] = {
      getQuestions: () => {
        return questions;
      },
    };
  }
});
```

<!-- vslide -->

### Network Tab

<!-- notes -->

The network tab is an awesome tool for figuring out what's going on and what's
going between your browser and the client. You can debug SSE, WebSockets,
regular fetch requests, test with and without caching, and much more. It's one
of my favorite tools in my toolbox.

<!-- vslide -->

### Sources Tab

<!-- notes -->

Sometimes you need to dive in and see what's actually running on your browser.
The sources tab will let you do that and jump between files, and most
importantly: set breakpoints.

<!-- vslide -->

#### `debugger` Statement

<!-- notes -->

Sometimes setting a breakpoint is hard. JavaScript will let you do it in your
code with the `debugger;` statement, which will pause execution and bring you to
the location so long as you have the devtools open.

<!-- vslide -->

#### Conditional Breakpoints

<!-- notes -->

Sometimes you know whatever you're looking for occurs under certain
circumstances. That's when you'd use a conditional breakpoint, to only stop
execution when specific state matches. Useful for realtime communication or
rendering.

<!-- vslide -->

### Performance Tab

<!-- notes -->

Allows you to record a page and tell what's going on during each frame, then
explore a graph of what's happened. Useful for finding bottlenecks.

<!-- vslide -->

### Application Tab

<!-- notes -->

Mostly used for editing application storage, either in cookies, local storage,
or indexed DB.

<!-- vslide -->

## Group Activity

## For Next Time

We'll be talking about frontend state management and discussing the vibe coding
assignment.
