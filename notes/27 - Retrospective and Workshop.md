# 27 - Retrospective and Workshop<!-- .element: class="title" -->

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
  - [Can you go over real quick your advice on backup databases and how we could do that in supabase. I remember you talked about it a while ago but I forgot.](#can-you-go-over-real-quick-your-advice-on-backup-databases-and-how-we-could-do-that-in-supabase-i-remember-you-talked-about-it-a-while-ago-but-i-forgot)
  - [What is AI.com?](#what-is-aicom)
  - [Any ideas on how to do CD for mobile apps? It feels like it needs to be manual, don't want to build every time we push.](#any-ideas-on-how-to-do-cd-for-mobile-apps-it-feels-like-it-needs-to-be-manual-dont-want-to-build-every-time-we-push)
  - [OpenClaw for customer facing prod? What are the risks?](#openclaw-for-customer-facing-prod-what-are-the-risks)
  - [Thoughts on Claude agent teams?](#thoughts-on-claude-agent-teams)
  - [Have you tried Openclaw yet?](#have-you-tried-openclaw-yet)
  - [Is OpenClaw as sketchy as it seems?](#is-openclaw-as-sketchy-as-it-seems)
  - [MoltHub is wild to me, any thoughts?](#molthub-is-wild-to-me-any-thoughts)
  - [Can you help me understand Kubernetes? All I personally know is Docker integrates/works w/ Kubernetes.](#can-you-help-me-understand-kubernetes-all-i-personally-know-is-docker-integratesworks-w-kubernetes)
  - [How do I know when I need to scale?](#how-do-i-know-when-i-need-to-scale)
  - [What do you think the future of SaaS as a viable business model is with AI accelerating as quick as it is?](#what-do-you-think-the-future-of-saas-as-a-viable-business-model-is-with-ai-accelerating-as-quick-as-it-is)
  - [Would you recommend using github actions or claude hooks & subagents for running tests on our code (or both)?](#would-you-recommend-using-github-actions-or-claude-hooks--subagents-for-running-tests-on-our-code-or-both)
  - [What do you think SWE will look like in the next few years?](#what-do-you-think-swe-will-look-like-in-the-next-few-years)
  - [Do you believe in AGI?](#do-you-believe-in-agi)
  - [Thoughts on Opus 4.6? And Sonnet 4.6?](#thoughts-on-opus-46-and-sonnet-46)
  - [Should context memories be larger or are we good where we are?](#should-context-memories-be-larger-or-are-we-good-where-we-are)
  - [Did you see the post from one builder likening the costs of AI tokens to ingredients in a restaurant and how it feels like a margin business instead of SaaS?](#did-you-see-the-post-from-one-builder-likening-the-costs-of-ai-tokens-to-ingredients-in-a-restaurant-and-how-it-feels-like-a-margin-business-instead-of-saas)
  - [What are your thoughts on codex?](#what-are-your-thoughts-on-codex)
- [Workshop Day 2](#workshop-day-2)

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
  compete in, or you can just go and work on your own projects. There's
  sometimes a coupon code in the Slack, but I haven't seen it yet this year. I'm
  planning on talking about collaborative software development, and on building
  animations with motion canvas.

<!-- vslide -->

### Attendance Quiz

<!-- vslide -->

### News

<!-- slide -->

## Retrospective

<!-- notes -->

Let's talk about what has gone well and what has not gone well so far this
semester.

Our goal from this is to learn from each other, not to place the blame on
people:

<!-- vslide -->

> **Regardless of what we discover, we understand and truly believe that
> everyone did the best job they could, given what they knew at the time, their
> skills and abilities, the resources available, and the situation at hand**

– Norm Kerth, Project Retrospectives: A Handbook for Team Review, quoted in
[the Retrospective Wiki](https://retrospectivewiki.org/index.php?title=The_Prime_Directive).<!-- .element: class="attribution" -->

<!-- vslide -->

### What Went Well?

<!-- vslide -->

### What Didn't Go Well?

<!-- vslide -->

### What Did You Learn?

<!-- slide -->

## Workshop Day 3

<!-- vslide -->

### Going Forward: Code Quality

<!-- notes -->
Most of you have been vibe coding for awhile now, and I think that's great; we
talked at length earlier in the year about how iterating quickly, even 
without writing code, is important.

We're at the end of the year now.

We'll talk a little bit later about ADRs and things you all would have changed
if you could start over. But I wanted to start with talking about code and
project quality, especially as some of you are getting to the point where you
have steady clients and can start to consider "oh, we could make a living off
of this."

To start, I wanted to mention a quote from Martin Fowler:
<!-- vslide -->

> **Any fool can write code that a computer can understand. Good programmers write code that humans can understand.**

– Martin Fowler<!-- .element: class="attribution" -->

<!-- notes -->

This is your job as the architects and founders of your projects. You need to 
set the patterns and abstractions that will determine the ability of your
codebase to be maintained and extended by others, hopefully for years to come.

I wanted to share a little bit about refactoring from Martin Fowler's book.
Before he gets into the details of refactoring, the individual patterns you can
apply to different parts of your codebase, he talks about a couple other things.

He mentions that before you can start refactoring, you need a couple things:

- You need tests that can verify that the code continues to work as expected.
- You need to make small, atomic changes, rather than large, sweeping changes.
- You need to do preparation before refactoring, including understanding the
  code and the changes you're making (See Chesterson's Fence).

There's still a place for doing large, sweeping changes, and AI agents make it
easier to generate all the code for that. But then you have to go and verify
that. I like Fowler's 
["preparatory refactoring"](https://martinfowler.com/articles/preparatory-refactoring-example.html)
idea on this, 
[explained by Kent Beck](https://x.com/KentBeck/status/250733358307500032?lang=en):

> **For each desired change, make the change easy (warning: this may be hard),
> then make the easy change easy**

– Kent Beck<!-- .element: class="attribution" -->

<!-- notes -->

There are approaches that help to do this that become aspirations for a project.
Mike Mason calls some of them out [here](https://www.thoughtworks.com/insights/blog/generative-ai/machines-rising-developers-hold-keys):

- Clear and Expressive Naming
- Reducing Duplicate Code
- Ensuring Modularity
- Effective Abstractions

AI is known to be really good at adding abstractions. Unfortunately, it has no
taste for if an abstraction is actually useful or not. It'll eagerly tell you
that what you're telling it to do is a good idea, and happily churn through your
entire codebase to do it.

<!-- vslide -->

### Comprehension Gap

<!-- notes -->

Some other advice that I think is worth sharing is one of the biggest footguns
I've seen in talking to you about your projects. The Comprehension Gap.

This is the gap between what the project is actually doing, and what you _think_
it's doing. I encourage you to spend time getting to know your project in its
current state, and think critically about what it'll need to go from there.
Predicting the future is hard, but you all have a year's worth of experience
working on your project at this point, and know your pain points.

If you're not already, review a full PR worth of code yourself this week. Take
the chance to write down what you already think a module in your code is doing
(ideally one you didn't write yourself), then read through and compare to your
predictions. 

<!-- vslide -->

### Small Changesets

<!-- notes -->
I've mentioned this before, but the ideal way to make changes to your codebase
is small, atomic changes. You want to be able to revert changes and have the 
system in a working state.

This yields itself well to both a CI/CD pipeline, and splitting tasks into small
chunks that can be written by AI, then reviewed quickly by a human.
<!-- vslide -->

### Discussion: ADRs

<!-- notes -->
What was the worst architectural decision you've made this year? Let's break
into groups and write up an [ADR](https://adr.github.io/) for it.
<!-- vslide -->

### Discussion: If You Could Start Over

<!-- notes -->
What would you change if you could start over? What would you do differently?
<!-- vslide -->

### Quality: 12 Factor App

<!-- notes -->
12 Factor App is a great way to think about your project. It's a set of 12
best practices that help you to build a project that is easy to deploy, scale,
and maintain.

You can find the 12 Factor App website [here](https://12factor.net/).
 <!-- vslide -->