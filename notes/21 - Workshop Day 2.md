# 21 - Workshop Day 2<!-- .element: class="title" -->

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

## Questions from Last Time

<!-- slide -->

### Can you go over real quick your advice on backup databases and how we could do that in supabase. I remember you talked about it a while ago but I forgot.

<!-- notes -->

Easiest way is probably to just use the backup feature in Supabase. They'll
retain a couple of them for you and that should be enough. More complex, you can
schedule a cron job to backup your database to a cloud storage service like S3
or Azure Blob Storage, running `pg_dump` to get the data out of the database.

<!-- vslide -->

### What is AI.com?

<!-- notes -->

AI.com is a kind of vague website by the creator of crypto.com. They played an
ad during the Super Bowl and failed to meet the demand that it introduced due to
their call to action being "reserve your handle now". At first, it didn't even
have Cloudflare in front of it and was returning a generic 503 page. Then that
switched over to Cloudflare's 503 page, then eventually it came back.

One of the things they talked about was that they were _also_ hitting Google's
OAuth rate limits, which was one of the only ways to log into the site. We
talked about this in Lecture 19, and some of the strategies that they could have
used.

<!-- vslide -->

### Any ideas on how to do CD for mobile apps? It feels like it needs to be manual, don't want to build every time we push.

<!-- notes -->

Depends on your stack. You can do over-the-air updates, and there are services
that will build and push the updates to the app stores.

<!-- vslide -->

### OpenClaw for customer facing prod? What are the risks?

<!-- notes -->

Please don't.

<!-- vslide -->

### Thoughts on Claude agent teams?

<!-- notes -->

I think they're an interesting concept, but I'd want to have a lot of
documentation and specs to give them for something like this. I also found that
even Anthropic talks about how they hit limits when a project reaches a certain
complexity. I still think that AI use is most useful when you have a detailed
spec that you thoroughly review, then ensure that it's followed as expected. As
a human, I can only really research so much of these and so I prefer using them
in that regard, rather than to do super large undefined tasks where the AI is
more likely to make mistakes.

<!-- vslide -->

### Have you tried Openclaw yet?

<!-- notes -->

I tried installing it. Something bugged out with my Tailscale setup and it
didn't really work. I'll try it again, but I think it's something that I'd
gradually allow access to.

<!-- vslide -->

### Is OpenClaw as sketchy as it seems?

<!-- notes -->

PaloAlto Networks says that it not only meets but extends the
"[Lethal Trifecta](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/)"
for AI agents, because it has persistent memory.

> But what if there’s a fourth capability that expands this attack surface and
> makes it easier to attack your AI agent? The rapid surge of popularity with
> OpenClaw brought a new capability that’s desired by users of autonomous
> agents: persistent memory.
>
> With persistent memory, attacks are no longer just point-in-time exploits.
> They become stateful, delayed-execution attacks.

- [PaloAlto Networks](https://www.paloaltonetworks.com/blog/network-security/why-moltbot-may-signal-ai-crisis/)

That's sketchy to me. I think if you restrict it heavily, it's going to be less
of an issue.

<!-- vslide -->

### MoltHub is wild to me, any thoughts?

<!-- notes -->

Seems like an interesting way to burn a lot of tokens. Maybe that can do
interesting things given persistent memory, but I wouldn't put my OpenClaw there
if I had one.

<!-- vslide -->

### Can you help me understand Kubernetes? All I personally know is Docker integrates/works w/ Kubernetes.

<!-- notes -->

It's like a more complex version of Docker, built with tools that allow you to
scale applications in response to load, normally across multiple machines. I
don't think it's worth managing if you're not at a certain scale that demands
it, and normally starts to demand "infrastructure engineer" type work, rather
than the "product engineer" type work you should be doing.

<!-- vslide -->

### How do I know when I need to scale?

<!-- notes -->

Observe and test. We'll talk about observability, but you should know when your
servers are under load, and should know when you're not able to keep up. You can
use tools like `JMeter` or `k6` to test your application's scalability under
load, or can even write simple scripts to just simulate load and high requests
per second.

The best thing you can do in advance is make sure that your features are modular
(i.e., can I replace a database with a cache or queue?) and stateless (i.e., can
a different server handle the request than the original one?).

<!-- vslide -->

### What do you think the future of SaaS as a viable business model is with AI accelerating as quick as it is?

<!-- notes -->

I think there's something to be said for the up-front cost and maintenance
belonging to someone else who is experiencing the problem and has spent time
solving it. I think
[bespoke applications](https://secondthoughts.ai/p/the-new-model-of-software-development)
will become more common, and that the industry will slowly move in a direction
where apps are more modular and can be wired together using APIs, MCP, and
agents sitting in the middle.

<!-- vslide -->

### Would you recommend using github actions or claude hooks & subagents for running tests on our code (or both)?

<!-- notes -->

I would run three:

- Claude Hooks (when writing the code)
- Git Hooks (before committing)
- CI/CD (after committing)
<!-- vslide -->

### What do you think SWE will look like in the next few years?

<!-- notes -->

There's an odd thing where engineers who have built more without AI get better
results from AI based on their experience explaining and reasoning about code
and problems. I think it's important to have training on that type of reasoning
and critical thinking, but I think we'll generally move more towards having more
product engineers, and solution engineers. Solution engineers will help
integrate different systems or products, and product engineers will focus on the
user experience and the business goals. Both will still work with code but will
have skill sets that overlap with different parts of the business.

<!-- vslide -->

### Do you believe in AGI?

<!-- notes -->

I don't think we should build it without serious thought put into regulation and
how it would affect the economy. It's ultimately a national security issue, so I
don't think we can afford to not be trying to build toward it, but at the same
time it could potentially have a super negative impact on the economy if it was
released too quickly.

<!-- vslide -->

### Thoughts on Opus 4.6? And Sonnet 4.6?

<!-- notes -->

They're nice improvements. I'm seeing them do less of the things that I dislike
without having to prompt them not to do it or call them out on it.

<!-- vslide -->

### Should context memories be larger or are we good where we are?

<!-- notes -->

I don't see us making them smaller. But I see less returns on "reasoning" or
other similar things with larger windows. I do think it would be cool to be able
to put an epub or transcript into them and use it to effectively query or do
rough analysis with larger windows. Some can already do that.

<!-- vslide -->

### Did you see the post from one builder likening the costs of AI tokens to ingredients in a restaurant and how it feels like a margin business instead of SaaS?

<!-- notes -->

I think it's interesting in that it makes those with more token budget more able
to try experiments and churn out code. I think there are limitations in
businesses that want to be successful with how much you can generate, (see the
Anthropic article about their C compiler), but it's an amazing way to test and
iterate quickly on business ideas.

I do think it's a shame that it's not really democratizing the costs of building
something, and like many other things leads to a "rich get richer" effect.

<!-- vslide -->

### What are your thoughts on codex?

<!-- notes -->

I haven't used it, I mainly use a small Cursor plan and large Claude plan.

<!-- slide -->

## Workshop Day 2
