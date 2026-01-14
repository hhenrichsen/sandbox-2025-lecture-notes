# 15 - Continuous Integration

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

## Testing

<!-- vslide -->

### Business Logic Unit Tests

<!-- notes -->

Unit tests are the simplest, and should be the most plentiful in a well-tested
application. They should be fast to write and fast to run.

I've found these work best when patterns like Dependency Injection are used,
since that allows running tests without a database or backend connected,
depending on what you're testing.

If your project is modularized, with business logic separated into its own area
of the codebase, these should be really easy to write.

<!-- vslide -->

#### Mocking out Backing Services

<!-- notes -->

If you're building your project to isolate your dependencies via services,
mocking out backing services is something that makes writing unit tests a _ton_
easier. For example, I have an `EventQueries` that has this interface:

`src/core/features/events/adapters/queries.ts`

```ts
export interface IEventQueries {
  getById({ id }: { id: string }): Promise<Event | null>;
  getByCreatorId({ creatorId }: { creatorId: string }): Promise<Event[]>;
  getByShortId({ shortId }: { shortId: string }): Promise<Event | null>;
  create({
    createEvent,
    userId,
  }: {
    createEvent: CreateEvent;
    userId: string;
  }): Promise<Event>;
  updateShortId({
    eventId,
    shortId,
    userId,
  }: {
    eventId: string;
    shortId: string;
    userId: string;
  }): Promise<Event | null>;
  update({
    eventId,
    updateEvent,
    userId,
  }: {
    eventId: string;
    updateEvent: UpdateEvent;
    userId: string;
  }): Promise<Event | null>;
  delete({ id, userId }: { id: string; userId: string }): Promise<void>;
}
```

I can build a mocked queries like this for use in testing (not the full
implementation, but you get the idea):

`src/core/features/events/adapters/queries.mock.ts`

```ts
import { injectable } from "tsyringe";
import type { CreateEvent, Event, UpdateEvent } from "../types";

@injectable()
export class MockEventQueries {
  private events = new Map<string, Event>();

  async getById({ id }: { id: string }): Promise<Event | null> {
    const event = this.events.get(id);
    if (!event || event.deleted) {
      return null;
    }
    return event;
  }

  async create({
    createEvent,
    userId,
  }: {
    createEvent: CreateEvent;
    userId: string;
  }): Promise<Event> {
    const now = new Date();
    const event: Event = {
      id: crypto.randomUUID(),
      title: createEvent.title,
      description: createEvent.description,
      start: createEvent.start,
      end: createEvent.end,
      shortId: undefined,
      creatorId: userId,
      createdAt: now,
      updatedAt: now,
      updatedBy: userId,
      deleted: null,
    };
    this.events.set(event.id, event);
    return event;
  }
  seed(events: Event[]): void {
    for (const event of events) {
      this.events.set(event.id, event);
    }
  }

  reset(): void {
    this.events.clear();
  }
}
```

<!-- vslide -->

#### Testing with DI

<!-- notes -->

Now, I'm using a dependency container library that makes replacing these easier,
so in test setup I can do something like this:

`src/lib/test-container.ts`

```ts
import "reflect-metadata";
import { container } from "tsyringe";

import { EventQueriesSymbol } from "~/core/features/events/adapters/queries";
import { MockEventQueries } from "~/core/features/events/adapters/queries.mock";

export function setupContainer(): typeof container {
  container.reset();

  container.registerInstance(EventQueriesSymbol, new MockEventQueries());

  return container;
}
```

And then I can create an actual instance of my EventService that uses the
MockEventQueries automatically by asking the container for it:

`src/core/features/events/service.test.ts`

```ts
mport "reflect-metadata";
import { setupContainer } from "~/lib/test-container";
import { EventQueriesSymbol } from "./adapters/queries";
import type { MockEventQueries } from "./adapters/queries.mock";
import { EventService } from "./service";
import { ForbiddenError, NotFoundError } from "~/core/common/error";
import type { Event } from "./types";

function createTestEvent(overrides: Partial<Event> = {}): Event {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    title: "Test Event",
    description: "Test Description",
    start: now,
    end: new Date(now.getTime() + 3600000),
    shortId: undefined,
    creatorId: "user-1",
    createdAt: now,
    updatedAt: now,
    updatedBy: "user-1",
    deleted: null,
    ...overrides,
  };
}

function setup() {
  const container = setupContainer();
  return {
    service: container.resolve(EventService),
    eventQueries: container.resolve<MockEventQueries>(EventQueriesSymbol),
  };
}

describe("EventService", () => {
  describe("getById", () => {
    it("should return event when found", async () => {
      const { service, eventQueries } = setup();
      const eventId = crypto.randomUUID();
      const event = createTestEvent({ id: eventId });
      eventQueries.seed([event]);

      const result = await service.getById(eventId);

      expect(result).toEqual(event);
    });

    it("should return null when not found", async () => {
      const { service } = setup();

      const result = await service.getById("nonexistent");

      expect(result).toBeNull();
    });

    it("should return null for deleted events", async () => {
      const { service, eventQueries } = setup();
      const eventId = crypto.randomUUID();
      const event = createTestEvent({ id: eventId, deleted: new Date() });
      eventQueries.seed([event]);

      const result = await service.getById("event-1");

      expect(result).toBeNull();
    });
  });
});
```

<!-- vslide -->

#### Alternatives

<!-- notes -->

One "budget" alternative that doesn't need specific project structure or DI
library management would be to isolate the logic you need to mock, and allow
providing different implementations to your code. For example, if you have a
route that looks like this:

`src/app/api/events/[id]/route.ts`

```ts
import { createSupabaseServerClient } from "~/core/adapters/auth/supabase-server";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "~/core/adapters/db/database.types";
import type { NextApiRequest } from "next";

export async function GET(
  _request: NextApiRequest,
  ctx: RouteContext<"/api/events/[id]">
) {
  const supabase = await createSupabaseServerClient();
  const { id } = await ctx.params;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: events, error: queryError } = await supabase
    .from("hx2-audience_event")
    .select("*")
    .eq("creatorId", user.id)
    .is("deleted", null)
    .order("createdAt", { ascending: false });

  if (queryError) {
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }

  return NextResponse.json(events);
}
```

My first step would be to extract as much of this to business logic functions as
I could:

`src/app/api/events/[id]/lib.ts`

```ts
import { createSupabaseServerClient } from "~/core/adapters/auth/supabase-server";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "~/core/adapters/db/database.types";
import type { NextApiRequest } from "next";

class EventNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EventNotFoundError";
  }
}

class UserNotAuthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserNotAuthorizedError";
  }
}

class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

export async function getEventById(
  client: SupabaseClient<Database>,
  id: string,
  userId: string | undefined
): Promise<Tables<"hx2-audience_event"> | null> {
  if (!userId) {
    throw new UserNotAuthorizedError("User ID is required");
  }

  if (!id) {
    throw new EventNotFoundError("Event ID is required");
  }

  const { data: event, error: queryError } = await client
    .from("hx2-audience_event")
    .select("*")
    .eq("creatorId", userId)
    .is("deleted", null)
    .eq("id", id)
    .maybeSingle();

  if (queryError) {
    throw new DatabaseError(queryError.message);
  }

  return event;
}

export async function GET(
  _request: NextApiRequest,
  ctx: RouteContext<"/api/events/[id]">
) {
  const supabase = await createSupabaseServerClient();
  const { id } = await ctx.params;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await getEventById(supabase, id, user?.id);

  return NextResponse.json(event);
}
```

In an ideal world, I'd also wrap my supabase client construction with something
that isolates the dependency, like this:

`src/app/api/events/[id]/lib.ts`

```ts
import { createSupabaseServerClient } from "~/core/adapters/auth/supabase-server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/core/adapters/db/database.types";

export interface Event {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  shortId: string | null;
  creatorId: string;
}

export interface EventQueries {
  getById(id: string): Promise<Event | null>;
}

export class SupabaseEventQueries {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getById(id: string): Promise<Event | null> {
    const { data, error } = await this.client
      .from("hx2-audience_event")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) {
      throw DatabaseError(error.message);
    }
    return data;
  }
}
```

I would then update the lib file to use this:

`src/app/api/events/[id]/lib.ts`

```ts
export async function getEventById(
  queries: EventQueries,
  id: string,
  userId: string | undefined
): Promise<Event | null> {
  if (!userId) {
    throw new UserNotAuthorizedError("User ID is required");
  }

  if (!id) {
    throw new EventNotFoundError("Event ID is required");
  }

  return queries.getById(id);
}
```

I could then use this in my route like this:

`src/app/api/events/[id]/route.ts`

```ts
export async function GET(
  _request: NextApiRequest,
  ctx: RouteContext<"/api/events/[id]">
) {
  const supabase = await createSupabaseServerClient();
  const { id } = await ctx.params;
  try {
    const queries = new SupabaseEventQueries(supabase);
    const event = await getEventById(queries, id, user?.id);
    return NextResponse.json(event);
  } catch (error) {
    if (error instanceof DatabaseError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (error instanceof UserNotAuthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof EventNotFoundError) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    throw error;
  }
}
```

Using this, I'd be able to mock out the queries like this:

`src/app/api/events/[id]/lib.mock.ts`

```ts
export class MockEventQueries implements EventQueries {
  events = new Map<string, Event>();
  async getById(id: string): Promise<Event | null> {
    const event = events.get(id);
    if (!event) {
      return null;
    }
    return event;
  }

  seed(events: Event[]): void {
    for (const event of events) {
      events.set(event.id, event);
    }
  }

  reset(): void {
    events.clear();
  }
}
```

At the end of this all, I would be able to write a test for the library, and
trust that the route would work as expected:

`src/app/api/events/[id]/lib.test.ts`

```ts
describe("getEventById", () => {
  it("should return event when found", async () => {
    const queries = new MockEventQueries();
    const id = crypto.randomUUID();
    queries.seed([{ id, title: "Test Event" }]);
    const event = await getEventById(queries, id, "user-1");
    expect(event).toEqual({ id, title: "Test Event" });
  });
});
```

If I really wanted to, I could test the route like this:

`src/app/api/events/[id]/route.test.ts`

```ts
describe("GET /api/events/[id]", () => {
  it("should return event when found", async () => {
    const queries = new MockEventQueries();
    const id = crypto.randomUUID();
    queries.seed([{ id, title: "Test Event" }]);
    const result = await GET(null, { params: { id } });
    expect(result.status).toBe(200);
    expect(result.body).toEqual({ id, title: "Test Event" });
  });
});
```

You can also use testing libraries' mocking functionalities, but I try to avoid
those where I can in favor of having predictable internal manipulation for
mocks.

As an (expensive, and slightly complex) alternative, you could ensure that you
have a real supabase instance running and use that to test. I've found that's
not worth it for most projects, at least for unit tests.

<!-- vslide -->

### Component Unit Tests

These are normally run with a test runner like Jest:

```

npm i -D jest jest-environment-jsdom @testing-library/react @testing-library/dom
@testing-library/jest-dom @testing-library/user-event ts-node @types/jest

```

I use a config like this:

`jest.config.ts`

```ts
import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "~/(.*)": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

export default createJestConfig(config);
```

And a setup file like this (at least to start out with):

`jest.setup.ts`

```ts
import "@testing-library/jest-dom";
```

<!-- vslide -->

#### Mocking the Router

<!-- notes -->

Now, there's a little more setup that makes sense to do. Turns out the App
router is complicated. For example, tests that `useRouter` will fail with this
error:

```
invariant expected app router to be mounted
```

To support this, you can do the simplest thing which is to mock out the router
and do nothing with the functions called (and a bonus Geist Sans mock):

`jest.setup.ts`

```ts
jest.mock("next/font/google", () => ({
  Geist: () => ({
    className: "mock-geist-font",
    variable: "--font-geist-sans",
    style: { fontFamily: "mock-geist" },
  }),
}));

export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
};

jest.mock("next/navigation", () => ({
  useRouter: jest.fn().mockReturnValue(mockRouter),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
  useParams: jest.fn(),
  useSelectedLayoutSegment: jest.fn(),
}));
```

You can get much more complicated than this, however. Storybook takes an
approach where they
[mock out all of the app router providers](https://github.com/storybookjs/storybook/blob/5111c16fe36846ca2e8ee37854a9a81214e97313/code/frameworks/nextjs/src/routing/app-router-provider.tsx).

There's also a
[`next-router-mock`](https://github.com/scottrippey/next-router-mock) which
keeps everything around in memory and can be used like this:

`jest.setup.ts`

```ts
import mockRouter from "next-router-mock";
import { createDynamicRouteParser } from "next-router-mock/dynamic-routes";

jest.mock("next/router", () => jest.requireActual("next-router-mock"));
jest.mock("next/navigation", () => require("next-router-mock/navigation"));

mockRouter.useParser(
  createDynamicRouteParser([
    // These paths should match those found in the `/pages` folder:
    "/[id]",
    "/static/path",
    "/[dynamic]/path",
    "/[...catchAll]/path",
  ])
);
```

I found this overkill for what I was doing, but figured I'd mention it for what
you might be doing.

I generally try to avoid mocking (especially implicitly like this) where I can,
since it removes some production factors from your tests, and can potentially
hide bugs. In this case, I'm going to rely on the fact that Next.js shouldn't
break the router or navigation, and hope that's good enough.

<!-- vslide -->

#### Dealing with ES Modules

<!-- notes -->

I also had some packages that refused to import because they were ES Modules.
For me, these were `superjson` (used for shadcn forms) and `@t3-oss/env`. I had
to tell Next.js to deal with `superjson`, and mock out my `env` import
respectively.

For `superjson`, adding it to my Next config worked out:

`next.config.js`

```ts
const config = {
  transpilePackages: ["superjson"],
};
```

And my env mock looked like this:

`jest.setup.ts`

```ts
jest.mock("~/env", () => ({
  env: {
    NODE_ENV: "test",
    AUTH_SECRET: "test-secret",
    AUTH_DISCORD_ID: "test-discord-id",
    AUTH_DISCORD_SECRET: "test-discord-secret",
    AUTH_GOOGLE_ID: "test-google-id",
    AUTH_GOOGLE_SECRET: "test-google-secret",
    CI: "false",
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    SUPABASE_SECRET_KEY: "test-supabase-secret",
    NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  },
}));
```

<!-- vslide -->

#### Mocking other APIs

<!-- notes -->

I also had to mock out some browser APIs that aren't in jsdom yet; `matchMedia`
for my theme provider, and ResizeObserver and elementFromPoint for my OTP
component, which is the one I'm testing.

`jest.setup.ts`

```ts
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

document.elementFromPoint = jest.fn().mockReturnValue(null);
```

<!-- vslide -->

#### Writing the Tests, Finally

<!-- notes -->

This lets me write tests like this one:

`src/components/features/event-join.test.tsx`

```tsx
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventJoinForm } from "./event-join";
import { renderWithProviders } from "~/lib/testing";
import { mockRouter } from "~/../jest.setup";

describe("EventJoinForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render without exploding", () => {
    renderWithProviders(<EventJoinForm />);
  });

  it("should submit when the 6th digit is entered manually", async () => {
    const user = userEvent.setup();
    const screen = renderWithProviders(<EventJoinForm />);

    const input = screen.getByRole("textbox");

    await user.type(input, "123456");

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/audience/123456/activity");
    });
  });

  it("should submit when a 6-digit event ID is pasted into the input", async () => {
    const user = userEvent.setup();
    const screen = renderWithProviders(<EventJoinForm />);

    const input = screen.getByRole("textbox");

    await user.click(input);
    await user.paste("123456");

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/audience/123456/activity");
    });
  });
});
```

<!-- vslide -->

### Component Catalog

<!-- notes -->

One technology that's popped up recently is the Component Catalog. The idea is
you put together an environment where you can test and validate components in
isolation, and then use them in your application. When your pages are written as
components, this can become really powerful without needing to run the entire
application.

Storybook is one of the most popular examples of this. Here's how I added it to
my project:

```
bun create storybook@latest
```

I stepped through, skipping onboarding and using the full default configuration.
I also have dark mode components, so I wanted to use the themes addon:

```
bun x storybook add @storybook/addon-themes
```

I wanted that to affect the backgrounds in the docs, so I had to do some
additional configuration:

`.storybook/preview.ts`

```ts
import type { Preview } from "@storybook/nextjs-vite";
import "../src/styles/globals.css";
import { withThemeByClassName } from "@storybook/addon-themes";

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
    docs: {
      canvas: {
        className: `!bg-background`,
      },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: "light",
        dark: "dark bg-slate-900",
      },
      defaultTheme: "light",
    }),
  ],
};

export default preview;
```

This lets me write stories like this:

`src/stories/core/input-otp.stories.tsx`

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { fn } from "storybook/test";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";

const meta = {
  title: "Core/InputOTP",
  component: InputOTP,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  args: {
    onComplete: fn(),
    onChange: fn(),
    maxLength: 6,
    children: (
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    ),
  },
} satisfies Meta<typeof InputOTP>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "",
  },
};

export const Filled: Story = {
  args: {
    value: "123456",
  },
};

export const Disabled: Story = {
  args: {
    value: "123456",
    disabled: true,
  },
};
```

And I can add page-level stories, too (though note that I'm importing a page
level component):

`src/stories/pages/join-event.stories.tsx`

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn, within, userEvent, expect } from "storybook/test";
import { EventJoinForm } from "~/components/features/event-join";

const meta = {
  title: "Pages/EventJoin",
  component: EventJoinForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  args: {
    onJoin: fn(),
  },
} satisfies Meta<typeof EventJoinForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FillDemo: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox"), "123456");
    expect(args.onJoin).toHaveBeenCalledWith("123456");
  },
};

export const PasteDemo: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("textbox"));
    await userEvent.paste("123456");
    expect(args.onJoin).toHaveBeenCalledWith("123456");
  },
};
```

<!-- vslide -->

### Integration Tests

<!-- notes -->

I've found these get more useful when you have a lot of business logic to test,
and are where you want to test that different units of logic work together as
expected. Unfortunately, my project isn't to the point where I have good
examples of this, but they tend to follow along the patterns of the unit tests,
just with larger sets of dependencies and services.

I still will try to avoid running the database for these, and let the end to end
tests handle that.

Some consider these to be tests that need to have the full backing services
running, but I find those work best for end to end tests, not integration tests.
If you do want to do something like this, you could use something like
testcontainers to spin up a full environment and run your tests against that.

<!-- vslide -->

### End-to-End Tests

<!-- notes -->

End-to-end tests are tests that simulate a user interacting with the
application. They tend to be fairly easy to write, and can be a great way to
test that the application works as expected as a whole.

That said, they can be slow to run, and getting all services in place can be
challenging.

There are several libraries that can help with this, including Playwright,
Cypress, and Puppeteer. I opted for Playwright because it has more tools built
in, where some features would have to be built on your own for the others.

Here's how I added it to my project:

```
bun create playwright@latest
```

That let me add a test file like this:

`src/e2e/test-join-by-id.test.ts`

```ts
import { test, expect } from "@playwright/test";

test("should navigate to the about page", async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto("/join");
  await page.fill("input[data-testid='event-id-input']", "123456");
  await page.waitForLoadState("networkidle");
  await expect(page).not.toHaveURL("/join");
});
```

<!-- vslide -->

### Performance Testing

<!-- notes -->

It can be worthwhile to test the performance of your application. Normally,
these are done with benchmarks, where you run a series of tests and measure how
long it takes to complete.

A super common one that's worth running on at least your landing page (and
ideally other critical pages) is Lighthouse. This measures things like:

- First Contentful Paint
- Largest Contentful Paint
- Time to Interactive
- Cumulative Layout Shift
- Total Blocking Time
- First Input Delay

There are GitHub actions that can help with this, where you configure a budget
and verify that your application stays within that budget.

<!-- slide -->

## Continuous Integration

<!-- notes -->

Testing is most useful when you're using it to build confidence in your code, or
to prevent bugs from being reintroduced. That means running tests automatically.
At Lucid, we were doing a manual regression test every sprint, which was a pain
for our developers and QA. After the regression, we'd cut fixes and do a release
to production.

That kind of sucked.

Instead, we decided to build up a suite of automated tests that would give us
the same confidence that the list of tasks we'd have to run for the regression.
To me, CI comes before CD for a reason. You need to have confidence that you or
anyone else working on the project can make changes without breaking things for
users.

<!-- vslide -->

### GitHub Actions

<!-- notes -->

GitHub Actions is a super simple way to run tests and other CI tasks. You
basically give it a list of commands to run, and it'll run them until one of
them fails. These can range from simple stuff like running an `npm` script, to
building and even running supabase containers for end to end tests.

Here's a simple example that'll build a Next.js application:

`.github/workflows/build.yml`

```yaml
name: Build

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Build
        run: bun run build
```

<!-- vslide -->

### Linting and Formatting

<!-- notes -->

One of the easiest things you can do to get started is to set up linting and
formatting. Especially when using AI code tools, having a consistent style and
standards can help the tools work better.

I use ESLint and Prettier for this. Most frameworks have built-in support for
these, and it's usually pretty easy to add.

<!-- vslide -->

### Testing

<!-- notes -->

I've just spent all this time talking about testing, so these steps are also
worth setting up in your CI pipeline. Here's an example of my end to end test
running in CI, including a bunch of supabase setup:

`.github/workflows/playwright.yml`

```yaml
name: Playwright Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  CI: true

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Install Vercel CLI
        run: bun install -g vercel@latest

      - name: Pull environment variables
        run:
          vercel env pull --environment=production --token=${{
          secrets.VERCEL_TOKEN }} .env

      - uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Start Supabase
        run:
          supabase start
          -x=storage-api,imgproxy,inbucket,edge-runtime,logflare,vector

      - name: Setup local supabase environment variables
        # Grab the environment variables from the supabase project and merge them with the local .env file
        # https://stackoverflow.com/q/57691556
        # Then transform them to match the environment variables expected by the app
        run: |
          supabase status -o env >> .env.supabase
          sed -i 's/^ANON_KEY=/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=/' .env.supabase
          sed -i 's/^API_URL=/NEXT_PUBLIC_SUPABASE_URL=/' .env.supabase
          sed -i 's/^DB_URL=/DATABASE_URL=/' .env.supabase
          sed -i 's/^SERVICE_ROLE_KEY=/SUPABASE_SECRET_KEY=/' .env.supabase
          sort -u -t '=' -k 1,1 .env .env.supabase | grep -v '^$\|^\s*\#' > .env.deduplicated
          mv .env.deduplicated .env

      - name: Build the app
        run: bun run build

      - name: Install Playwright Browsers
        run: bun run playwright install --with-deps

      - name: Run Playwright tests
        run: bun test:e2e

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

This one's a bit more complex, but it's a great way to get a full end to end
test suite running in CI.

<!-- vslide -->

### AI Code Review

<!-- notes -->

Another neat thing you can do with CI is use AI to review your code. This can
help catch issues, usually before a human reviewer goes through the code.

Anthropic has documentation on how to set up a GitHub Actions workflow to use
claude [here](https://code.claude.com/docs/en/github-actions).
