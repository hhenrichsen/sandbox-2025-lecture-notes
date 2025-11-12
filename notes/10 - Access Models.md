<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [10 - Access Control](#10---access-control)
  - [Pre-Lecture](#pre-lecture)
    - [Links](#links)
    - [News](#news)
  - [Access Models](#access-models)
    - [Owner-Only (eCommerce Customers)](#owner-only-ecommerce-customers)
    - [Member and Admin (Slack, Notion)](#member-and-admin-slack-notion)
    - [Premade Roles (Google Docs, Lucid)](#premade-roles-google-docs-lucid)
    - [Custom Roles (Discord)](#custom-roles-discord)
  - [Accounts and Organizations](#accounts-and-organizations)
  - [GUIDs Vs Serial IDs](#guids-vs-serial-ids)
  - [Modelling Exercise](#modelling-exercise)
    - [Users<!-- .element: class="fragment fade-in-then-semi-out" -->](#users---element-classfragment-fade-in-then-semi-out---)
    - [Organizations<!-- .element: class="fragment fade-in-then-semi-out" -->](#organizations---element-classfragment-fade-in-then-semi-out---)
    - [Repositories<!-- .element: class="fragment fade-in-then-semi-out" -->](#repositories---element-classfragment-fade-in-then-semi-out---)
    - [Issues<!-- .element: class="fragment fade-in-then-semi-out" -->](#issues---element-classfragment-fade-in-then-semi-out---)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# 10 - Access Control

## Pre-Lecture

<!-- vslide -->

### Links

- [Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLSdcu-u0LD5kB9rhOcA7E1ZCw6w05RlejzrFrRALEz7krkLjVQ/viewform?usp=sf_link)
- [Q&A Form](https://docs.google.com/forms/d/e/1FAIpQLSd4c3JqKFSybays7xUNk3EeiUaDak7XvRqRyosng0ATCZf2bQ/viewform?usp=sf_link)
- [Office Hours](https://calendly.com/hhenrichsen)

<!-- vslide -->

### News

- <!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- slide -->

## Access Models

<!-- notes -->

Some apps require more complex role management. I recommend keeping things
simple for as long as possible since it makes it easier to keep things secure.
The same applies for the number of resources that affect access.

For example, most eCommerce software is pretty simple: users can join and manage
their own orders according to some rules. They can read their own data and write
some of it.

On the other hand, think of Google Drive. You have a nested folder structure
where each folder can give access to a different set of users. Each file can
also be shared individually. Businesses can even create shared drives that
belong to the whole account.

<!-- vslide -->

### Owner-Only (eCommerce Customers)

<!-- notes -->

This is the most common because it's the most simple, in terms of security,
system design, and UI design. In an owner-only model, users own their data and
can't access anyone else's. Everything is done through a single query based on
User ID.

<!-- vslide -->

#### Structure

| `Resource`       |
| ---------------- |
| `id: serial`     |
| `owner: user.id` |
| `content: text`  |
|                  |

<!-- notes -->

I recommend sticking with something like this for as long as you can; it makes
RLS easy should you chose to do it.

<!-- vslide -->

### Member and Admin (Slack, Notion)

<!-- notes -->

This is useful for when an app is designed for cooperative users without much
hierarchy, like Slack. Slack uses a system where admins have all capabilities,
and users within a workspace have some subset of those.

It adds complexity now because you need a many-to-many relationship between
resources and users. This one is one of the most common, and can be fairly
simple to implement. If you decide to do this on a system that requires RLS,
it's worth reading up on
[this](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv#5-always-optimize-join-queries-to-compare-row-columns-to-fixed-join-data)
(and also
[this](https://catjam.fi/articles/next-supabase-what-do-differently?utm_source=hhenrichsen-lecture-notes)).

<!-- vslide -->
<!-- .slide: class="multitable" -->

#### Structure

| Resource        |
| --------------- |
| `id: uuid`      |
| `owner: serial` |
| `content: text` |

| ResourceMembership         |
| -------------------------- |
| `id: serial`               |
| `resource_id: resource.id` |
| `user_id: user.id`         |
| `is_admin: bool`           |

<!-- vslide -->

### Premade Roles (Google Docs, Lucid)

<!-- notes -->

Where you need a little more granularity, premade roles can be a good solution
to the access control problem. Now users' relationships with resources also
include information about what permission level they have. A simple structure
like the following can work, but use caution when comparing roles. If you
compare the role IDs directly, you shoehorn yourself into not being able to add
lower or higher roles.

Instead, I recommend attaching a permissions structure to each role like the one
we'll talk about next, and explicitly inheriting each permission. This will
allow you more flexibility if you decide you need more roles.

<!-- vslide -->
<!-- .slide: class="multitable" -->

#### Structure

| Resource        |
| --------------- |
| `id: uuid`      |
| `owner: serial` |
| `content: text` |

| `Role` (enum) |
| ------------- |
| `editor`      |
| `commenter`   |
| `viewer`      |

| ResourceMembership         |
| -------------------------- |
| `id: serial`               |
| `resource_id: resource.id` |
| `user_id: user.id`         |
| `role_id: short?`          |

<!-- vslide -->

### Custom Roles (Discord)

<!-- notes -->

Complex problems (and customization) require complex solutions. Some things
(like online communities) generally need more hierarchy. Discord is an extreme
case here, but rather than premaking certain roles, instead you leave that up to
users. This is more flexible, but can be harder to understand and is one of the
most complicated systems to implement properly.

<!-- vslide -->
<!-- .slide: class="multitable" -->

#### Structure

| Resource        |
| --------------- |
| `id: uuid`      |
| `owner: serial` |
| `content: text` |

| `Role`                      |
| --------------------------- |
| `id: serial`                |
| `permissions: integer(128)` |
| `name: text`                |
| `color: varchar(6)`         |

| ResourceMembership                   |
| ------------------------------------ |
| `id: serial`                         |
| `resource_id: resource.id`           |
| `user_id: user.id`                   |
| `role_id: role.id`                   |
| `permission_overrides: integer(128)` |

<!-- notes -->

Permissions is a bit mapping that can then be used to determine quickly if a
user has permission. For example, here's what Discord's looks like:

<!-- vslide -->

| `Permission` (enum)   | Bits   | Binary        |
| --------------------- | ------ | ------------- |
| `CreateInstantInvite` | `1`    | `00000000001` |
| `KickMembers`         | `2`    | `00000000010` |
| `BanMembers`          | `4`    | `00000000100` |
| `Administrator`       | `8`    | `00000001000` |
| `ManageChannels`      | `16`   | `00000010000` |
| `ManageGuild`         | `32`   | `00000100000` |
| `AddReaction`         | `64`   | `00001000000` |
| `ViewAuditLog`        | `128`  | `00010000000` |
| `PrioritySpeaker`     | `256`  | `00100000000` |
| `Stream`              | `512`  | `01000000000` |
| `ViewChannel`         | `1024` | `10000000000` |
|                       |        |               |

<!-- vslide -->

```ts
if ((user.permissions & ViewChannel.bits) > 0) {
  // User has permission
}
```

<!-- slide -->

## Accounts and Organizations

<!-- notes -->

Sometimes you need larger groups of users than an individual user can supply. I
find these are pretty similar to user management, but get complex when they
share slugs like GitHub. For example, I own my `hhenrichsen` account, and am a
member of `motion-canvas`. One is an individual account, and one is an
organization.

You might need a structure like this to help resolve that, combined with a
unique constraint on slug and a check to make sure one of the org and user are
set:

<!-- vslide -->

| Slugs                      |
| -------------------------- |
| `id: serial`               |
| `org_id: organization.id?` |
| `user_id: user.id?`        |
| `slug: varchar(64)`        |

<!-- notes -->

Alternatively, you could build a structure where every user has an associated
organization, and the organization is the owner of the resources. This is a
little more complex, but it can result in less complexity and easier
consistency.

<!-- slide -->

## GUIDs Vs Serial IDs

<!-- notes -->

One question that I've been asked a couple times is "when should I use a
GUID/UUID versus a numeric ID?". To me, that comes down to how accessible the ID
is to the user. For things that become artifacts that other people get access to
(Notion Notes, Google Docs, Lucidchart Documents), I generally defer to some
GUID type (UUIDv7, ULID, or KSUID where available, if you care about scale and
being hard to guess, though Lucid uses UUIDv4 for document IDs). For internal
IDs, I generally defer to incrementing IDs.

<!-- vslide -->

| ID Type   | Example                                | Lexographically Sortable |
| --------- | -------------------------------------- | ------------------------ |
| UUIDv4    | `51328f97-6507-465e-9295-e629b4362180` | No                       |
| NanoID    | `UUtbEi4VWgG8oG-vT5vC-`                | No                       |
| Serial    | `1`                                    | Yes                      |
| UUIDv7    | `019a796f-dfd4-74e0-aa4b-83020d6caddb` | Yes                      |
| ULID      | `01K9WPZBN0CN4J64ZQN6253GM0`           | Yes                      |
| KSUID     | `35OGvumpWpB8TZgE8c60rMfNbOr`          | Yes                      |
| CUID      | `cmhwdax8n0001356iuwxkliuz`            | Yes                      |
| CUIDv2    | `cmhwdax8n0001356iuwxkliuz`            | Yes                      |
| Snowflake | `142007040000000000`                   | Yes                      |

<!-- slide -->

## Modelling Exercise

<!-- notes -->

Let's build GitHub (we'll do repository and issue management for now, not
worrying about the git server or other things)

<!-- vslide -->
<!-- .slide: class="text-heavy" -->

### Users<!-- .element: class="fragment fade-in-then-semi-out" -->

- Users have a name and a
  bio<!-- .element: class="fragment fade-in-then-semi-out" -->

### Organizations<!-- .element: class="fragment fade-in-then-semi-out" -->

- Organizations have a name and a
  bio<!-- .element: class="fragment fade-in-then-semi-out" -->
- Organizations have some number of admins and some number of
  members<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- vslide -->
<!-- .slide: class="text-heavy" -->

### Repositories<!-- .element: class="fragment fade-in-then-semi-out" -->

- Repositories can be public or
  private.<!-- .element: class="fragment fade-in-then-semi-out" -->
- Public repositories can be viewed by
  anyone.<!-- .element: class="fragment fade-in-then-semi-out" -->
- Repositories have a name and an owner, and are accessed by their URL
  ownername/repositoryname<!-- .element: class="fragment fade-in-then-semi-out" -->
- Repositories can be owned by either a user or an
  organization<!-- .element: class="fragment fade-in-then-semi-out" -->
- Repositories can have
  members<!-- .element: class="fragment fade-in-then-semi-out" -->
- Repositories inherit members from their owning organization (if you are a
  member or admin on the owning organization, you are a member or admin on the
  repos within the
  organization)<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- vslide -->
<!-- .slide: class="text-heavy" -->

### Issues<!-- .element: class="fragment fade-in-then-semi-out" -->

- Issues have a title and body, an assignee, and some number of
  labels<!-- .element: class="fragment fade-in-then-semi-out" -->
- Logged in users can add issues to any repository they can
  see<!-- .element: class="fragment fade-in-then-semi-out" -->
- Logged in users can add comments to any unlocked issue they can
  see<!-- .element: class="fragment fade-in-then-semi-out" -->
- Repository members can manage issues, deleting, locking, and closing
  them<!-- .element: class="fragment fade-in-then-semi-out" -->
- Repository owners can change the visibility of repositories and rename them in
  addition to managing
  issues<!-- .element: class="fragment fade-in-then-semi-out" -->
