# 19 - Scaling<!-- .element: class="title" -->

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
- [Scaling](#scaling)
  - [Vertical Scaling](#vertical-scaling)
  - [Horizontal Scaling](#horizontal-scaling)

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
  sometimes a coupon code in the Slack, but I haven't seen it yet this year.

<!-- vslide -->

### Attendance Quiz

<!-- vslide -->

### News

<!-- slide -->

## Questions from Last Time

<!-- slide -->

## Scaling

<!-- notes -->

I tend to hear a lot of concern about scaling. And that's valid, given recent
events, like the AI.com launch during the superbowl. That said, you can get a
surprising amount of scale out of a single server.

If you're worried about that still, you might look at tools like `JMeter` or
`k6` to test your application's scalability under load. I recommend pairing this
with observability tools like we'll be talking about later this semester.

We'll be working out of
[this document](https://lucid.app/lucidchart/5e2ee4b0-6354-49e3-ae0e-636572458a16/view)
today.

<!-- vslide -->

### Vertical Scaling

<!-- notes -->

Vertical scaling is the process of adding more resources to a single server.
This tends to be the easiest and most cost-effective way to scale, since you
remain just running a single instance of your application.

<!-- vslide -->

### Horizontal Scaling

<!-- notes -->

Horizontal scaling is the process of adding more servers to your application.
This lets you handle more than a single server can work with, but also normally
requires more than just "another server".

<!-- vslide -->

#### Load Balancing

<!-- notes -->

One of the complicated bits of scaling is load balancing. You need to be able to
route traffic to the appropriate server, which normally needs... you guessed it,
a load balancing server.

This will vary a lot depending on your application, and there are a bunch of
different strategies for routing traffic. There's a lot of theory here; both
[GitHub](https://github.blog/engineering/introducing-glb/) and
[Cloudflare](https://blog.cloudflare.com/high-availability-load-balancers-with-maglev/)
have interesting articles on their load balancers. Normally, at the scale you're
at and approaching, the worst you'll need is a proxy like Nginx, HAProxy, Caddy,
or Traefik.

Briefly:

- Round Robin - send traffic to the next server in the list. Simple, one-way,
  but not very efficient.
- Power of Two Choices - pick two random servers and send traffic to the one
  with the least connections. Simple, and doesn't require monitorring the state
  of all of the servers at once.
- Least Connections - send traffic to the server with the fewest connections.
  More efficient especially under load, but requires communication between the
  load balancer and the servers.
- Resource-Based - send traffic to the server with the least resource usage.
  More efficient especially under load, but requires monitoring the servers'
  resource usage.

<!-- vslide -->

#### Message Queues

<!-- notes -->

For longer-running work, it can make sense to process them asynchronously. This
can be done with a message queue. This way your server remains responsive while
processing can happen in the background. At high load the queue can get long,
but then as load falls off the queue can be processed faster.

<!-- vslide -->

##### Dead Letter Queues

<!-- notes -->

If a message is not processed successfully, it can be moved to a dead letter
queue. This can be used to retry the message, or to alert the user that the
message was not processed successfully. It also can be a great place to inspect
the jobs that are failing and resolve them.

<!-- vslide -->

#### Sharding

<!-- notes -->

Another common way to scale and load balance is to shard your data. This is not
something you should do from the beginning, but when you get to the point where
you're overwhelming a single database, it's an option.

Sharding is where you split your data into multiple databases, each of which is
called a shard. You then can route requests to the appropriate shard based on
the data you're querying. The way I've seen this done is to split up data into
ranges, and then route requests to the appropriate shard based on the range of
the data you're querying.

 <!-- vslide -->
