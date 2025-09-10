# 01 - Priorities of a Startup
## Pre-Lecture

### Links

* [Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLSdcu-u0LD5kB9rhOcA7E1ZCw6w05RlejzrFrRALEz7krkLjVQ/viewform?usp=sf_link)
* [Q&A Form](https://docs.google.com/forms/d/e/1FAIpQLSd4c3JqKFSybays7xUNk3EeiUaDak7XvRqRyosng0ATCZf2bQ/viewform?usp=sf_link)
* [Office Hours](https://calendly.com/hhenrichsen)

---
### Events and Announcements

*I mostly know about Lucid events, but feel free to slack me a day or two before class and I can get things added here.*

* Lucid Tech Talk - September 11th. Come and hear from alumni Andrew Peterson about how we deal with backwards compatibility at Lucid.

---
### News

*In the future, this will be a segment where we talk about things that are going on in the tech space that are worth knowing about. Please slack a link to a news article about it after you get called on.*

---
## Intro
### Introducing Hunter

<!-- notes -->
Howdy, I'm Hunter. I'm 26, and an Engineering Manager at Lucid Software. Some other interesting (or uninteresting) trivia about me:
* I'm the oldest of 6 boys
* I grew up in Connecticut
* I help maintain [motion-canvas](https://github.com/motion-canvas/motion-canvas) and spend too much time writing random components for it
* I've been programming since I was 14, but didn't take it seriously until I was 17 or 18 for a robotics class
* The first time I felt like a real programmer was when I built a webapp that let the Humans vs Zombies club at USU track their game of infection tag
* I'm building audience participation software this time around for my example project.

--

Please call me Hunter. <!-- .element: class="fragment fade-in-then-semi-out" -->

+ IntelliJ, VSCode, and vim <!-- .element: class="fragment fade-in-then-semi-out" -->
+ Catppuccin <!-- .element: class="fragment fade-in-then-semi-out" -->
+ Please ask questions <!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- notes -->
I use a combination of VSCode, IntelliJ (and variants), and Vim to write my code. I tend to go really quickly in demos because that's how I normally work, so please ask me questions to slow me down. I'm trying to go a little bit slower and introduce things at a higher level, but your help here is appreciated.

---
### Classroom Technology

+ Slido<!-- .element: class="fragment fade-in-then-semi-out" -->
+ Lucidchart<!-- .element: class="fragment fade-in-then-semi-out" -->
+ Lucidspark<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- notes -->
This semester, I'm going to be using a couple of tools to help me run the class. The primary ones are [Slido](https://www.slido.com/) (makes it easier to not lose questions), [Lucidchart](https://lucidchart.com) (diagrams), and [Lucidspark](https://lucidspark.com) (brainstorming). Some class activities (and participation) will be done through these. To that end, I recommend joining today's Slido and entering your name so I can count you for participation today.

---

### A Normal Day in Class

* News and pre-lecture<!-- .element: class="fragment fade-in-then-semi-out" -->
* Any outstanding Q&A from the last lecture<!-- .element: class="fragment fade-in-then-semi-out" -->
* Main lecture<!-- .element: class="fragment fade-in-then-semi-out" -->
* Workshop (if applicable)<!-- .element: class="fragment fade-in-then-semi-out" -->
* Participation Quiz<!-- .element: class="fragment fade-in-then-semi-out" -->

---

## Syllabus Review

See the 00-Fall-Syllabus.md file.

---
## Poll Results

---
## Priorities of a Startup

--

### Speed

<!-- notes -->
At a startup, one of the things that you have to do well is build, learn, and adapt quickly. As an engineer, that means that you need to set up an environment where you can make changes quickly, and see the results. I have two main points of advice here that are relevant starting out:

1. Speed means testing. There is no way to learn this better than by breaking things, but the ideal process is moving fast without breaking things. To me, that means you need ways to make sure that things are not broken, like unit and integration tests. I will have dedicated lectures on this, but making the effort early--especially around some of the critical flows that you are going to be writing early on--will have exponential returns in the future.
2. Speed means measuring. You should not waste development effort on flows that few users are going to use. You should not waste effort trying to make things faster that are rarely called. In order to determine what flows users are using, what flows aren't performing well, you need metrics. This is likely a second semester topic, but this is another thing that if you invest in early, it will pay dividends down the line.
3. Speed means working in an environment that encourages you to build features. If you are consistently fighting with a part of (or even the whole) tech stack, or spending more time building abstractions than features, it may be time to invest in a new one that encourages you to work more quickly.

I encourage you to build your apps in such a way that the above are respected, as well as writing your code in a way that can work well. There is lots of design advice out there on how to write clean code. Don't waste time by writing code quickly.

--
### Scale

<!-- notes -->
The whole goal of a startup is to acquire users. More users mean more problems, more features, and more server load, however. 

This warrants its own lecture, maybe multiple. There are lots of ways to deal with this, from increasing the number of servers or services available, to caching more frequently, to proactively computing things commonly computed together.

--
### Onboarding

<!-- notes -->
Eventually, you will want to enlist the help of another engineer, or pass the project off to another engineer. I'm going to call this process "Onboarding". Your ability to do this quickly an effectively should be a priority, and efforts you make little by little will be worth it when it comes time to bring another person up to speed.

Writing documentation and keeping design documents and records of decisions is important. Up-to-date system documentation does wonders for getting new engineers up to speed on what all the moving parts are and where in the codebase they would need to go to make a change. These should also include:

* Clear steps on how to get a development version of the site working
* What steps need to happen to get a change into production
* What standards need to be followed? Do tests need to be written before code is merged?
* Any contractual obligations you have--do you need specific accessibility requirements before code goes to production? What about security or certification?

One of the other things you can be doing day-to-day is doing good project management. That means keeping good records of what has been done and what needs to be done. That means keeping track of deadlines and what features need to be released together, or which work blocks other work.

---
## Project Management

### Stories / Issues / Tickets

<!-- notes -->
Stories, issues or tickets are the fundamental units of work in project management. These are the simple tasks that make everything else up. Generally larger than a commit, but as small a task that can generally be described.

Examples:
* Add google sign in option to authentication
* Allow storing and querying user subscription level
* Allow users to join and leave games

You will want to work with your team to get these designed and fleshed out in advance.

--

### Projects / Epics

<!-- notes -->
Projects or epics are the larger units of work. These are the larger units of work and are generally made up of stories.

Example:
* Game Management -- allow users to create, join, leave, and administer games. Games should allow joining via invitation links, or by searching in a public directory.

--

### Tech Debt

<!-- notes -->
Sometimes in the effort to develop something quickly, you will need to make a sacrifice in terms of quality. I recommend that you file these as their own stories, perhaps in their own epic or bucket as tech debt. That way you have a record and can address these as you go, rather than allowing it to pile up and eventually cause larger issues.

Tech Debt means that you're moving quick enough to make progress. That doesn't mean avoiding it at all costs–that means you're going too slow! Recording it strikes a balance of noting that a decision of both priority and implementation has been made, one that allows you to move forward for now while keeping track of the cost.


---

## Code Management

### Git Branch Management

<!-- notes -->
Generally, I keep a couple branches on my projects. I keep a `main` branch that runs on production (once it builds and tests successfully), a `develop` branch that contains changes that are near production ready but aren't quite there yet, and any number of branches for individual features. I'll merge `develop` into `main` when I want to do a deploy (until I'm satisfied enough with my testing and CI / CD to merge directly from a feature to `main`).

This way I can PR my changes as a cohesive unit, and then anyone else on my team can code review it.


--

### Code Review

<!-- notes -->
Here's a comment from one of your precursors from last year:

> "We didn't start doing code review for a little while, but it was really useful when we did start doing it. Not that I was catching issues in other people's code, but I was seeing what was being worked on and the changes going out".

I've found the biggest benefit is like this person says–by doing code review, each engineer is more aware of the current state of the codebase and what features are available.

I have a whole checklist of things that I go through when reviewing code; things like backwards compatibility, deploy order, potential bugs, naming / documentation improvements, and similar things are all things that I look for. If I can ask for that investment (or put the time in to fix things that others ask for), I've found that I'm the person that benefits most from that in the long run.

Don't let perfect be the enemy of good, however:

> In general, reviewers should favor approving a CL once it is in a state where it definitely improves the overall code health of the system being worked on, even if the CL isn’t perfect.

–Google's [Standard of Code Review](https://google.github.io/eng-practices/review/reviewer/standard.html).

--

### Tests

<!-- notes -->
I write tests for two reasons:
1. It lets me refactor my code
2. It lets me merge without manually testing every code path

Early on, it's probably only worth investing in for core flows; log in, onboarding, etc., to make sure that those work for prospective new users. 

Later on, automated testing is what eventually allows you to do automatic releases. Lucid used to do weekly or sprintly releases, prior to which the QA team would do a whole suite of manual regression tests. Doing these manually sucks. Having automation makes it easier.

The other benefit I find from testing is that automated tests force me to write more modular code. If a test can't set up my function in a way to isolate it and reuse it, it's unlikely that any other area of my codebase can do so.


---

## High Level Overview

### Common Elements

+ Authentication<!-- .element: class="fragment fade-in-then-semi-out" -->
+ Database<!-- .element: class="fragment fade-in-then-semi-out" -->
+ Backend<!-- .element: class="fragment fade-in-then-semi-out" -->
+ Frontend<!-- .element: class="fragment fade-in-then-semi-out" -->
+ Email<!-- .element: class="fragment fade-in-then-semi-out" -->
+ Observability<!-- .element: class="fragment fade-in-then-semi-out" -->
+ Notifications<!-- .element: class="fragment fade-in-then-semi-out" -->
+ Background Jobs<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- notes -->
If you're still looking for an idea, I recommend tackling these features in the meantime. These will give you some building blocks in your toolbox to use when you do find something to pursue. 


--

### Common Architectures

Some of the most common architectures that I hear talked about are: <!-- .element: class="fragment fade-in-then-semi-out" -->
* Monolith <!-- .element: class="fragment fade-in-then-semi-out" -->
* Service-Oriented<!-- .element: class="fragment fade-in-then-semi-out" -->
* Microservices<!-- .element: class="fragment fade-in-then-semi-out" -->
* Serverless<!-- .element: class="fragment fade-in-then-semi-out" -->

<!-- notes -->
Each has benefits and drawbacks. Monoliths are straightforward to understand and make changes to, but scale in unison. 

Service-oriented allows to scale individual components, but requires additional complexity around sharding and load balancing. 

Microservices can be fully independent modules, but requires understanding your domain in such a way that you can break it into fully independent modules. Most people and teams do not start with this understanding.

Serverless keeps infrastructure simple and allows scaling easily, but locks you into vendors and can end up being more expensive than a regular server.

---

## Random Advice
### Choosing a Tech Stack

<!-- notes -->
Lucid started out using CakePHP and now uses a much more complex stack with Angular and Scala. Choose something you can work quickly in. I tend to use a 50% rule for picking a project's stack:

No more than 50% of combined framework, and scope can be net new.

For example, if I'm learning a new language or framework, I have to build something that I've built before to focus on learning that new framework more fully.

Or, if I'm building a brand new project, I do best if I work in a language and framework that I'm familiar with. One thing to be cautious of when doing this, however, is that hiring engineers for niche frameworks is harder than getting someone into a codebase using a popular language. There's a steeper onboarding process there, so sometimes fronting the cost of learning something popular can pay off when you get to the point of needing more help.


--

### Infrastructure

<!-- notes -->
Start with something simple, like a server or two on a cloud provider. Scale up to more complex things as needed, but not because it's what everyone else is doing.

If Vercel + Neon meets your needs, why migrate to something more complex and costly? Most decisions can be changed later (although vendor lock-in is a real problem to be aware of).


--

### Chasing Trends

<!-- notes -->
There are a lot of buzzwords and trends that get tossed around that I think end up making building things way more confusing than they need to be.

* I've watched SSR come and go at least once.
* Native apps and web apps have traded at least once as well.
* NFTs and Crypto got big and then have been much quieter.
* Microservices get talked about a lot and then rarely implemented.

On the other hand, some things that were rarely talked about have become really important and useful to my own workflows:

* Containers are super useful, and I don't want to imagine working without them.
* CI / CD have made it way easier for me to ship features in my own projects and at work confidently.
* 

What I don't want to say is don't follow a promising trend. But also don't follow someone else's idea of "the right way" without pondering it yourself.


--

### On Asking Questions

> The man who asks a question is a fool for a minute, the man who does not ask is a fool for life.

–Confucius

---
## For Next Time
