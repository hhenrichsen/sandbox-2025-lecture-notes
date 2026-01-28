# 17 - Workshop Day 1

_by Hunter Henrichsen_

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Pre-Lecture](#pre-lecture)
  - [Links](#links)
  - [Attendance Quiz](#attendance-quiz)
  - [News](#news)
- [Questions from Last Time](#questions-from-last-time)
  - [What are your thoughts on ChatGPT Atlas and Perplexity Comet? How are you using these daily?](#what-are-your-thoughts-on-chatgpt-atlas-and-perplexity-comet-how-are-you-using-these-daily)
  - [Which would you say is more important: Continuous Integration or Continuous Delivery?](#which-would-you-say-is-more-important-continuous-integration-or-continuous-delivery)
  - [What are your favorite tools for CI and CD?](#what-are-your-favorite-tools-for-ci-and-cd)
  - [What you recommend for hosting backend(like express or something like that)](#what-you-recommend-for-hosting-backendlike-express-or-something-like-that)
  - [When you have a big application that doesn’t have any tests how do you prioritize what to test first?](#when-you-have-a-big-application-that-doesnt-have-any-tests-how-do-you-prioritize-what-to-test-first)
  - [I know it's not a CI/CD question, but could someone point me to some resources for embedded document editing, version control, etc. for document control?](#i-know-its-not-a-cicd-question-but-could-someone-point-me-to-some-resources-for-embedded-document-editing-version-control-etc-for-document-control)
  - [Do you have experience with RAGs? In what situations would this be better than training your own model on your domain?](#do-you-have-experience-with-rags-in-what-situations-would-this-be-better-than-training-your-own-model-on-your-domain)
  - [Is there a place we can see all your recommended tools and dependencies? It can be hard to keep track of all of the tools out there.](#is-there-a-place-we-can-see-all-your-recommended-tools-and-dependencies-it-can-be-hard-to-keep-track-of-all-of-the-tools-out-there)
  - [Do you have any experience with merkle trees? Had someone recommend them the other day but I'm not sure what a good use case for them would be](#do-you-have-any-experience-with-merkle-trees-had-someone-recommend-them-the-other-day-but-im-not-sure-what-a-good-use-case-for-them-would-be)
  - [What is one thing you would do differently work-wise or programming-wise if you could go back in time a few years?](#what-is-one-thing-you-would-do-differently-work-wise-or-programming-wise-if-you-could-go-back-in-time-a-few-years)
- [EC2 Demo](#ec2-demo)
  - [Basic Tech Stack](#basic-tech-stack)
  - [Basic Provisioning and Hardening](#basic-provisioning-and-hardening)
  - [Networking](#networking)
  - [Setting up some Software](#setting-up-some-software)
  - [Setting up the GitHub Action](#setting-up-the-github-action)

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

### What are your thoughts on ChatGPT Atlas and Perplexity Comet? How are you using these daily?

<!-- notes -->

I don't think the security implications have been solved for these yet, same
with Clawdbot/Moltbot. I'm not using them daily. I don't have tasks that would
really require them, either.

<!-- vslide -->

### Which would you say is more important: Continuous Integration or Continuous Delivery?

<!-- notes -->

I think CI is more important, since it enables you to do CD with confidence.
Otherwise, you might be releasing broken code.

<!-- vslide -->

### What are your favorite tools for CI and CD?

<!-- notes -->

I'm a big fan of GitHub Actions. I set up a Jenkins server a while ago, but
GitHub Actions is much simpler and easier to set up.

For CD, I'm a big fan of Fly.io and most managed services. Things get more
complex when you have more moving parts to your infrastructure.

<!-- vslide -->

### What you recommend for hosting backend(like express or something like that)

<!-- notes -->

Fly.io, but also go look at my Tools note.

<!-- vslide -->

### When you have a big application that doesn’t have any tests how do you prioritize what to test first?

<!-- notes -->

Test what users are using, and add regression tests for bugs that you fix.
Ideally, your tests should make sure bugs aren't introduced again. To some
extent, you know that your other code is working already.

<!-- vslide -->

### I know it's not a CI/CD question, but could someone point me to some resources for embedded document editing, version control, etc. for document control?

<!-- notes -->

This is a big area. Most things like this are proper products, not really
something you can pull off the shelf. yjs and lexical dom are libraries that
I've heard about being useful blocks for this, but there are a lot of problems
to solve especially for collaboration.

<!-- vslide -->

### Do you have experience with RAGs? In what situations would this be better than training your own model on your domain?

<!-- notes -->

RAG is better for getting accurate information into context. Fine tunes are
better for tasks for style and rules training. You always want some amount of
context engineering to get data into your model.

<!-- vslide -->

### Is there a place we can see all your recommended tools and dependencies? It can be hard to keep track of all of the tools out there.

<!-- notes -->

I added a Tools note to the appendix.

<!-- vslide -->

### Do you have any experience with merkle trees? Had someone recommend them the other day but I'm not sure what a good use case for them would be

<!-- notes -->

Nothing practical. I haven't had a problem that I would use them for.

<!-- vslide -->

### What is one thing you would do differently work-wise or programming-wise if you could go back in time a few years?

<!-- notes -->

Programming-wise, I wish I'd have looked a bit more into other paradigms that
are out there. We talked about functional-reactive programming last time, and
I'm aware of some other interesting things like aspect-oriented programming, but
I haven't really tried them out enough.

Projects-wise, I wish I would have spent more time seeing my side projects
through to completion. I have a bunch of them that do different things, and they
get to an okay state, but I don't do much to really market or promote them. I
think that's okay when I'm the only user, but I bet I could make cooler things
if I spent the time to get the word out about them, and forced myself to scale
and maintain them.

Work-wise, I wish I had delegated more and eliminated more distractions, so that
I could get deeper into problems. I tend to do a lot of small emergency fixes
(given, I have less time as a manager than I do as an individual contributor),
but those are also good opportunities to delegate to others so they can learn. I
started that habit even before I was a manager, and I think one of the best
things I could have done would have been to set time to deal with those
distractions, but keep a larger block of focus time to make real progress on
bigger things.

Management-wise, I wish I had been a stronger advocate for making change when I
was introduced to new areas. Recently I've moved teams at work and I feel like I
was just getting started with them, and found that I had a lot of things kind of
half-implemented. Now that I've been going back over my time on the teams, I
wish I had accelerated some of those ideas and used them to help my people
develop more ambitiously.

<!-- slide -->

## EC2 Demo

<!-- notes -->

Votes in Slack said we wanted to see an EC2 demo. I'm going to try to do a CD
demo as well, but I really want to keep this simple. Again, my recommendation if
at all possible is to keep it simple and stick with a PaaS. Most of the time,
they'll serve what you're trying to do just fine. If you run up against a
limitation, you can look into something simple like a VPS.

There are a lot of sysadmin things that you need to get into to do this
"properly". I'll do some of them, but this puddle is a mile deep and I'm by no
means an expert here.

That said, you all requested it, so here we go.

<!-- vslide -->

### Basic Tech Stack

- PM2 (Process Manager)
- Caddy (Proxy)
- Tailscale (SSH, VPC)
- Cloudflare (TLS, Tunnel)

<!-- vslide -->

### Basic Provisioning and Hardening

I'm gonna stick with a t3-micro because it's on the free tier and will do enough
for this demo. I set it up with a new key pair and the default security group,
with HTTP and SSH traffic allowed.

Next, I'm gonna set the hostname to `hx2-deploy` and install tailscale.

```bash
sudo hostnamectl set-hostname hx2-deploy
sudo vim /etc/hosts # (to add hx2-deploy.localhost to 127.0.0.1)
sudo reboot
```

After the reboot, I'm going to do an update and add a user for the application
to run as.

```bash
sudo dnf update -y

sudo useradd -m -s /bin/bash deploy

sudo mkdir -p /var/www/app/{current,shared}
sudo mkdir -p /var/log/{app,caddy}
sudo chown -R deploy:deploy /var/www/app /var/log/app
```

And some SSH hardening:

```bash
sudo tee /etc/ssh/sshd_config.d/99-hardening.conf << 'EOF'
# Disable root and password auth
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3

# Disable forwarding (not needed, reduces attack surface)
X11Forwarding no
AllowAgentForwarding no
AllowTcpForwarding no

# Timeouts
ClientAliveInterval 300
ClientAliveCountMax 2

# Modern crypto only
KexAlgorithms sntrup761x25519-sha512@openssh.com,curve25519-sha256,curve25519-sha256@libssh.org
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com
EOF

sudo systemctl restart sshd
```

Finally, I'll enable automatic security updates.

```bash
sudo dnf install dnf-automatic -y

# Configure for security updates only
sudo tee /etc/dnf/automatic.conf << 'EOF'
[commands]
upgrade_type = security
random_sleep = 360
download_updates = yes
apply_updates = yes

[emitters]
emit_via = stdio

[email]
email_from = root@localhost
email_to = root
email_host = localhost
EOF

sudo systemctl enable --now dnf-automatic.timer
```

<!-- vslide -->

### Networking

<!-- vslide -->

#### Tailscale

<!-- notes -->

Tailscale is neat because it simplifies IP management; I don't need an IP for
the github action that we're going to set up. It also reduces the attack surface
of your machine by only allowing SSH access via Tailscale.

Alternatives: AWS VPC, Cloudflare Warp, etc.

To start, I'll install tailscale and join the tailscale network.

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up \
     --authkey <your-auth-key> \
    --hostname hx2-deploy \
    --advertise-tags=tag:external,tag:ssh \
    --ssh
```

I'll also need some ACL rules:

```json
{
  "groups": {
    "group:developers": ["email@example.com"]
  },
  "tagOwners": {
    // Used to mark machines that are trusted to access the network
    "tag:trusted": ["group:developers"],
    // Used to mark machines that are valid SSH destinations
    "tag:ssh": ["group:developers"],
    // Used to mark machines that are external and should be locked down
    "tag:external": ["group:developers"],
    // Used to mark machines that are used for CI/CD
    "tag:ci": ["autogroup:admin"]
  },
  "acls": [
    { "action": "accept", "src": ["tag:trusted"], "dst": ["*:*"] },
    {
      "action": "accept",
      "src": ["group:developers"],
      "dst": ["tag:external:*"]
    },
    { "action": "accept", "src": ["tag:ci"], "dst": ["tag:external:22"] }
  ],
  "ssh": [
    {
      "action": "accept",
      "src": ["tag:trusted"],
      "dst": ["tag:ssh"],
      "users": ["autogroup:nonroot"]
    },
    {
      "action": "accept",
      "src": ["group:developers"],
      "dst": ["tag:external"],
      "users": ["ec2-user", "deploy"]
    },
    {
      "action": "accept",
      "src": ["tag:ci"],
      "dst": ["tag:external"],
      "users": ["deploy"]
    }
  ]
}
```

Finally, I'm going to make it so the machine is only accessible to SSH via
Tailscale.

```bash
# Get Tailscale IP
TAILSCALE_IP=$(tailscale ip -4)

# Configure sshd to only listen on Tailscale interface
echo "ListenAddress $TAILSCALE_IP" | sudo tee -a /etc/ssh/sshd_config
sudo systemctl restart sshd

# Test from your machine (must be on same tailnet)
ssh deploy@hx2-deploy # Uses Tailscale's magic DNS
```

<!-- vslide -->

#### Cloudflare Tunnel

<!-- notes -->

Alternatives: AWS ALB, Pointing your domain right at the server, etc.

Next, I'm going to set up a Cloudflare Tunnel to expose the machine to the
internet. Honestly, this just makes my demo easier (I don't need to know the EC2
IP address to access it in advance), but it's a good thing to know, and could
enable you to do things like subdomain deploys.

```bash
sudo dnf install -y https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm

cloudflared login

cloudflared tunnel create deploy

sudo mkdir -p /etc/cloudflared
sudo mv ~/.cloudflared/*.json /etc/cloudflared/
sudo vim /etc/cloudflared/config.yml
```

And set up the config.yml:

```yaml
tunnel: <tunnel-id>
credentials-file: /etc/cloudflared/<tunnel-id>.json

ingress:
  # Route all traffic to local Caddy
  - hostname: deploy.hx2.dev
    service: http://localhost:8080
  # Catch-all (required)
  - service: http_status:404
```

Then set cloudflared to run on startup and start it.

```bash
sudo cloudflared service install
sudo systemctl enable --now cloudflared
sudo systemctl status cloudflared
```

<!-- vslide -->

### Setting up some Software

<!-- vslide -->

#### Caddy Setup

<!-- notes -->

First, I'm gonna grab caddy.

```bash
sudo yum -y install yum-plugin-copr
sudo yum -y copr enable @caddy/caddy epel-8-$(arch)
sudo yum -y install caddy

sudo mkdir -p /etc/caddy
sudo chown -R /caddy:caddy /etc/caddy
sudo vim /etc/caddy/Caddyfile

sudo systemctl enable caddy
sudo systemctl start caddy
```

And set up the Caddyfile:

```caddyfile
# Global options
{
    # No automatic HTTPS - Cloudflare handles TLS
    auto_https off

    # Admin API disabled for security
    admin off
}

# Security headers snippet
(security-headers) {
    header {
        # HSTS handled by Cloudflare, but redundancy is good
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "accelerometer=(), camera=(), geolocation=(), microphone=()"
        # Remove server identification
        -Server
    }
}

# Main site - listens on 8080 for Cloudflare tunnel
:8080 {
    import security-headers

    # Compression
    encode zstd gzip

    # Structured logging
    log {
        output file /var/log/caddy/access.log {
            roll_size 50mb
            roll_keep 10
        }
        format json
    }

    # Health check endpoint (bypasses Next.js for faster response)
    handle /proxy-health {
        respond "OK" 200
    }

    # Everything else goes to Next.js
    # Next.js handles its own static asset serving from .next/static
    reverse_proxy localhost:3000 {
        # Pass real client IP from Cloudflare
        header_up X-Real-IP {header.CF-Connecting-IP}
        header_up X-Forwarded-For {header.CF-Connecting-IP}
        header_up X-Forwarded-Proto https
    }
}
```

I can then test it by going to https://deploy.hx2.dev/proxy-health.

<!-- vslide -->

#### The Node Stuff

<!-- notes -->

Then I'm going to grab nvm. pm2 supports bun for some things, but some things in
pm2 don't quite work with bun yet.

```bash
sudo -u deploy -i

# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# Pick up bun and nvm changes:
source ~/.bashrc
# Download and install Node.js:
nvm install 24
# Verify the Node.js version:
node -v # Should print "v24.13.0".
# Verify npm version:
npm -v # Should print "11.6.2".
```

And set up pm2:

```bash
npm install -g pm2
pm2 --version

pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:retain 7
```

Then add it to startup:

```bash
pm2 startup systemd

# back to ec2-user, which has sudo
exit
sudo env PATH=$PATH:/home/deploy/.nvm/versions/node/v24.13.0/bin /home/deploy/.bun/install/global/node_modules/pm2/bin/pm2 startup systemd -u deploy --hp /home/deploy
```

Back in the deploy user, I'm going to set up the app structure:

```bash
sudo -u deploy -i
tee shared/.env << 'EOF'
NODE_ENV=production
PORT=3000
EOF
```

<!-- vslide -->

### Setting up the GitHub Action

<!-- notes -->

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  NODE_VERSION: "24"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test -- --passWithNoTests

      - name: Build application
        run: npm run build
        env:
          NEXT_TELEMETRY_DISABLED: 1

      - name: Package standalone output
        run: |
          cd .next/standalone
          cp -r ../../public ./public
          cp -r ../.next/static ./.next/static
          echo "${{ github.sha }}" > VERSION
          tar -czf ../../release.tar.gz .

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: release-${{ github.run_number }}
          path: release.tar.gz
          retention-days: 30

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: release-${{ github.run_number }}

      - name: Connect to Tailscale
        uses: tailscale/github-action@v3
        with:
          oauth-client-id: ${{ secrets.TS_OAUTH_CLIENT_ID }}
          oauth-secret: ${{ secrets.TS_OAUTH_SECRET }}
          tags: tag:ci

      - name: Deploy to server
        env:
          HOST: ${{ secrets.EC2_TAILSCALE_IP }}
          RUN_NUMBER: ${{ github.run_number }}
        run: |
          # Setup SSH
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H $HOST >> ~/.ssh/known_hosts 2>/dev/null || true

          # Copy artifact to server
          scp -i ~/.ssh/deploy_key release.tar.gz deploy@$HOST:/tmp/

          # Deploy on server
          ssh -i ~/.ssh/deploy_key deploy@$HOST << DEPLOY_SCRIPT
            set -e
            
            APP_DIR="/var/www/app"
            
            echo "Extracting release (run #${RUN_NUMBER})..."
            rm -rf \${APP_DIR}/current-new
            mkdir -p \${APP_DIR}/current-new
            tar -xzf /tmp/release.tar.gz -C \${APP_DIR}/current-new
            rm /tmp/release.tar.gz
            
            echo "Linking environment..."
            ln -sf \${APP_DIR}/shared/.env \${APP_DIR}/current-new/.env.local
            
            echo "Switching release..."
            rm -rf \${APP_DIR}/current-old
            mv \${APP_DIR}/current \${APP_DIR}/current-old 2>/dev/null || true
            mv \${APP_DIR}/current-new \${APP_DIR}/current
            
            # Track which run is deployed
            echo "${RUN_NUMBER}" > \${APP_DIR}/current/WORKFLOW_RUN
            
            echo "Reloading application..."
            cd \${APP_DIR}/current
            
            export NVM_DIR="\$HOME/.nvm"
            [ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
            
            if pm2 describe app > /dev/null 2>&1; then
              pm2 reload app --update-env
            else
              pm2 start server.js --name app --wait-ready --listen-timeout 30000
            fi
            
            echo "Health check..."
            sleep 3
            for i in {1..10}; do
              if curl -sf http://localhost:3000/api/health | grep -q "healthy"; then
                echo "Deployed run #${RUN_NUMBER}"
                pm2 save
                rm -rf \${APP_DIR}/current-old
                exit 0
              fi
              echo "Attempt \$i/10..."
              sleep 2
            done
            
            echo "Health check failed, restoring previous..."
            rm -rf \${APP_DIR}/current
            mv \${APP_DIR}/current-old \${APP_DIR}/current
            pm2 reload app
            exit 1
          DEPLOY_SCRIPT

      - name: Deployment failed
        if: failure()
        run: echo "::error::Deployment failed! Check the logs above."
```
