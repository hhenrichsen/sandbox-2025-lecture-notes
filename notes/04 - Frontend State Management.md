# 04 - AI, Frontend State Management<!-- .element: class="title" -->

_by Hunter Henrichsen_

<!-- vslide -->
<!-- prettier-ignore-start -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Pre-Lecture](#pre-lecture)
  - [Links](#links)
  - [News](#news)
- [Questions from Last Time](#questions-from-last-time)
- [AI Discussion](#ai-discussion)
  - [Instructions](#instructions)
  - [MCP](#mcp)
  - [Prompting](#prompting)
  - [Agentic Loop](#agentic-loop)
  - [Things to Watch out for](#things-to-watch-out-for)
- [Frontend State Management](#frontend-state-management)
  - [Normal React](#normal-react)
  - [Stores](#stores)
  - [Signals](#signals)
  - [The URL](#the-url)
- [Project Structure](#project-structure)
  - [Domain / Feature Organization](#domain--feature-organization)
  - [Service Isolation](#service-isolation)

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

<!-- slide -->

## AI Discussion

<!-- vslide -->

### Instructions

<!-- vslide -->

[![anthropic prompting.png](https://pbs.twimg.com/media/GzIeKvPaUAAKx6g?format=jpg&name=4096x4096)](https://www.youtube.com/watch?v=ysPbXH0LpIE)
https://www.youtube.com/watch?v=ysPbXH0LpIE

<!-- vslide -->

### MCP

<!-- vslide -->

### Prompting

<!-- notes -->

Prompting works best when you understand the problem and how you'd like to solve
it, or at least when you know some of the things you'd like to take into
account.

<!-- vslide -->

### Agentic Loop

<!-- notes -->

Something common to training and building agents is feedback. Anthropic talks a
lot about this in their resources on Claude. This also applies to running
agents. I've found agents work best when they can get feedback quickly; using
unit tests, or compiler errors, or other similar tools.

<!-- vslide -->

### Things to Watch out for

- Reinventing the wheel
-

<!-- slide -->

## Frontend State Management

### Normal React

_Props down, events up, context to teleport._

<!-- vslide -->

### Stores

_As seen in [Zustand](https://zustand.docs.pmnd.rs/getting-started/introduction)
and [Redux](https://redux.js.org/)_

- Top down<!-- .element: class="fragment fade-in-then-semi-out" -->
- Everything in one
  place<!-- .element: class="fragment fade-in-then-semi-out" -->
- Easier to work with distinct
  state<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- notes -->

Stores are a top-down approach to state management; you declare the full state
(at least, the full state for a single store) and update that state to change
things.

<!-- vslide -->

```ts
import { create } from "zustand";

export enum ActivityType {
  Welcome = "welcome",
  Break = "break",
  Timer = "timer",
}

const useActivity = create((set) => ({
  activityType: ActivityType.Welcome,
  activityData: {
    title: "Welcome to the presentation!",
    subtitle: "We'll get started in a moment.",
  },
  startTimer: (seconds: number) => {
    set({
      activityType: ActivityType.Timer,
      activityData: {
        duration: seconds,
      },
    });
  },
}));
```

<!-- notes -->

Normally, changes to state are also well-defined when the store is created.
Redux calls these reducers. Zustand just has these as functions on the store
object.

These are top-down. You set up your state and the possible mutations to it in
one place, which makes it easy to understand the big picture. With patterns like
this it's easy to take advantage of things like the Command pattern for undo /
redo.

However, these can lead to more boilerplate and poor performance if the full
state isn't considered when updating it. These also can couple components
tightly to one store.

<!-- vslide -->

### Signals

_As seen in [Jotai](https://jotai.org/) and
[Signals](https://preactjs.com/guide/v10/signals/) (this is a preact link, but
they have a port to react)_

- Bottom up<!-- .element: class="fragment fade-in-then-semi-out" -->
- Distributed<!-- .element: class="fragment fade-in-then-semi-out" -->
- Simpler and
  Incremental<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- notes -->

Signals are a smaller, bottom-up approach to state management. You can build
state with super small pieces and derive state from those core atoms. They work
best when your features and state are more independent, but can be a useful
advantage over default react state management utilities.

<!-- vslide -->

![](https://github.com/hhenrichsen/intro-to-pipes/releases/download/latest/output-big.gif)

<!-- vslide -->

```ts
import { atom } from "jotai";

export enum ActivityType {
  Welcome = "welcome",
  Break = "break",
  Timer = "timer",
}

const activityState = atom({
  activityType: ActivityType.Welcome,
  activityData: {
    title: "Welcome to the presentation!",
    subtitle: "We'll get started in a moment.",
  },
});

// Only recalculated when activityType changes
const activityType = atom((get) => {
  return get(activityState).activityType;
});

// Only recalculated when activityState changes
const activityData = atom((get) => {
  return get(activityState).activityData;
});
```

<!-- notes -->

These can be more performant by default because the pieces of state tend to be
smaller, and it's much easier to check for changes on a computed piece of state.
These are also simpler to use and are easy to combine together where needed.

That said, it's not as easy to see the big picture for state and it's easy for
parts of state to become scattered or duplicated.

<!-- vslide -->

### The URL

_As seen in [TanStack Router](https://tanstack.com/router/latest)_

<!-- notes -->

Ideally, someone with the same link should render a similar page to another
person with the same link. On complicated pages, this is not always
(automatically) the case. You might have different graphs, or scales, or panes
toggled, or other things like that.

<!-- slide -->

## Project Structure

<!-- vslide -->

### Domain / Feature Organization

<!-- vslide -->

### Service Isolation

<!-- notes -->

Sometimes I've seen things like this:

<!-- vslide -->

```typescript
import { db } from "@/lib/db";
import { todos } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { useState, useEffect } from "react";

export default function TodoList() {
  const allTodos = await db.select().from(todos);

  return (
    <div>
      {allTodos.map((todo) => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </div>
  );
}
```

<!-- notes -->

That's reasonable while you're experimenting, but I've found sometimes I need to
swap libraries or backends for one reason or another. Ideally, you're building
something like this:

<!-- vslide -->

```ts
import { db } from '@/lib/db';
import { todos } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { singleton } from "tsyringe";

export interface Todo {
  id: string;
  text: string;
  done: boolean;
}

@singleton()
export class TodoService() {
  public getAllTodos(): Promise<Todo[]> {
    return  db.select().from(todos);
  }
}
```

<!-- notes -->

That way, if you ever have to replace the library you're using, you can do
something like this without needing to update any of the components that are
using that one query:

<!-- vslide -->

```ts
import { supabaseServiceClient } from "~/core/adapters/db/supabase";
import { singleton } from "tsyringe";

export interface Todo {
  id: string;
  text: string;
  done: boolean;
}

@singleton()
export class TodoService() {
  public getAllTodos(): Promise<Todo[]> {
    const { data, error } = await supabaseServiceClient
      .from("todo")
      .select("*");
    if (!error) {
      return data;
    }
  }
}
```
