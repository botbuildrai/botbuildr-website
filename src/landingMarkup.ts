export const landingMarkup = `<!-- NAV -->
  <div class="navwrap">
    <nav class="nav glass">
      <a href="#top" class="logo" aria-label="BotBuildr.ai home">
        <span class="cursor">▋</span><span>BotBuildr<span class="dotai">.ai</span></span>
      </a>
      <div class="nav-links">
        <a href="#automate" class="lk hide-sm">what we automate</a>
        <a href="#how" class="lk hide-sm">how it works</a>
        <a href="#ship" class="lk hide-sm">what we create</a>
        <a href="#contact" class="nav-cta">&gt; book a call</a>
      </div>
    </nav>
  </div>

  <!-- HERO — SCROLL-VIDEO (Section 1) -->
  <section class="video-hero" id="video-hero" aria-label="Cinematic hero — scroll to play">
    <div class="video-hero-pin">
      <video
        id="hero-motion"
        data-src="/assets/botbuildr-iss-hero.mp4"
        muted
        playsinline
        preload="auto"
        aria-hidden="true"
      ></video>
      <div class="video-hero-hint" id="video-hero-hint" aria-hidden="true">
        <span>scroll</span>
        <span class="chev"></span>
      </div>
    </div>
  </section>

  <!-- HERO — EDITORIAL -->
  <a id="top"></a>
  <section class="hero video-handoff">
    <div class="editorial-stack cascade">
      <h1 style="--d: 120ms;">We <span class="hl">automate</span> your business and <span class="hl">build</span> what sells it.</h1>

      <div class="gold-rule" style="--d: 380ms;"></div>

      <p class="lede" style="--d: 500ms;">Customer service, invoicing, leads on autopilot
Plus the website, apps and pitch decks that match 
your brand


</p>

      <p class="lead" style="--d: 640ms;">
</p>

      <div class="actions" style="--d: 800ms;">
        <a href="#contact" class="btn btn-primary">&gt; book a build call</a>
        <a href="#how" class="btn-link">see the stack <span class="arr">→</span></a>
      </div>
    </div>

    <div class="fold-cue">
      <span class="arr">↓</span>continue reading
    </div>
  </section>

  <!-- PROOF BAR -->
  <div class="proof">
    <div class="wrap proof-grid">
      <div class="stat glass reveal"><div class="num"><span class="u">−</span><span data-count="80" data-suffix="%">0%</span></div><div class="lbl">support volume handled</div></div>
      <div class="stat glass reveal"><div class="num"><span data-count="1.4" data-dec="1" data-suffix="s">0s</span></div><div class="lbl">avg. response time</div></div>
      <div class="stat glass reveal"><div class="num"><span data-count="24" data-suffix="/7">0</span></div><div class="lbl">always on, no shifts</div></div>
      <div class="stat glass reveal"><div class="num"><span class="u">€</span><span data-count="11" data-suffix="k">0</span></div><div class="lbl">avg. monthly cost removed</div></div>
    </div>
  </div>

  <!-- WHAT WE AUTOMATE — show, don't tell -->
  <section class="block" id="automate">
    <div class="wrap">
      <div class="section-head reveal">
        <span class="eyebrow"><span class="num">01 /</span> what we automate</span>
        <h2>Whole processes. Not a chatbot bolted onto a page.</h2>
        <p>We map the workflow, wire it to your tools, and let it run. Here's what that actually looks like.</p>
      </div>

      <!-- Feature 1: customer service -->
      <div class="feature reveal">
        <div class="copy">
          <div class="tag">// customer service</div>
          <h3>Support that answers itself</h3>
          <p>Drafts, triages and resolves inbound across email, chat and WhatsApp — then escalates the 20% that actually needs you. Trained on your past tickets and your tone.</p>
          <span class="metric">→ <b>−80%</b> ticket load · <span class="hl">98%</span> auto-resolve confidence</span>
        </div>
        <div class="visual">
          <div class="mock glass">
            <div class="mock-top">
              <div class="mock-title">Support inbox <span class="live"><i></i>auto-pilot</span></div>
              <div class="mock-meta">today · 41 handled</div>
            </div>
            <div class="inbox">
              <div class="msg">
                <div class="ava" style="--c:#066377">M</div>
                <div class="msg-body"><div class="msg-subj">Where's my order #4021?</div><div class="msg-prev">Hi — checking on my parcel…</div></div>
                <div class="tag-ok">resolved · 98%</div>
              </div>
              <div class="msg">
                <div class="ava" style="--c:#4bbdf0">L</div>
                <div class="msg-body"><div class="msg-subj">Refund for a damaged item</div><div class="msg-prev">The mug arrived cracked…</div></div>
                <div class="tag-ok">resolved · 95%</div>
              </div>
              <div class="msg">
                <div class="ava" style="--c:#9c7a43">W</div>
                <div class="msg-body"><div class="msg-subj">Wholesale — 500 units?</div><div class="msg-prev">We'd like a bulk quote…</div></div>
                <div class="tag-esc">→ you</div>
              </div>
            </div>
            <div class="draft">
              <div class="dh"><span>bot draft · order #4021</span><span>98% confident</span></div>
              <div class="dt">Hi Marit — good news, #4021 shipped this morning via PostNL. Tracking: 3SABC… It'll arrive Thursday. Anything else? 📦</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature 2: invoicing -->
      <div class="feature rev reveal">
        <div class="copy">
          <div class="tag">// invoicing &amp; finance</div>
          <h3>Invoicing on autopilot</h3>
          <p>Generates, sends and chases invoices, reconciles payments against your bank feed, and flags only what's overdue. Your books stay current without you opening a spreadsheet.</p>
          <span class="metric">→ <b>0</b> invoices touched by hand this week</span>
        </div>
        <div class="visual">
          <div class="mock glass">
            <div class="mock-top">
              <div class="mock-title">Invoices <span class="live"><i></i>synced</span></div>
              <div class="mock-meta">this week</div>
            </div>
            <div class="inv">
              <div class="inv-row"><span class="inv-id">INV-2041</span><span class="inv-co">Acme Co.</span><span class="inv-amt">€1,240</span><span class="pill paid">paid</span></div>
              <div class="inv-row"><span class="inv-id">INV-2042</span><span class="inv-co">Lune BV</span><span class="inv-amt">€890</span><span class="pill sent">sent</span></div>
              <div class="inv-row"><span class="inv-id">INV-2043</span><span class="inv-co">Orbit Studio</span><span class="inv-amt">€2,100</span><span class="pill chase">chasing</span></div>
              <div class="inv-row"><span class="inv-id">INV-2044</span><span class="inv-co">Nord &amp; Co.</span><span class="inv-amt">€640</span><span class="pill paid">paid</span></div>
            </div>
            <div class="inv-foot"><span><b>12</b> sent automatically</span><span><b>0</b> touched by you</span></div>
          </div>
        </div>
      </div>

      <!-- Feature 3: leads -->
      <div class="feature reveal">
        <div class="copy">
          <div class="tag">// lead handling</div>
          <h3>No lead ever goes cold</h3>
          <p>Replies in seconds, qualifies against your criteria, books the call straight into your calendar, and writes the CRM note. Your pipeline runs while you sleep.</p>
          <span class="metric">→ <b>1.4s</b> first response · <span class="hl">24/7</span></span>
        </div>
        <div class="visual">
          <div class="mock glass">
            <div class="lead-head">
              <div class="ava" style="--c:#066377">S</div>
              <div><div class="lead-name">Sven de Vries</div><div class="lead-src">// source: website form · 14:02</div></div>
            </div>
            <div class="tl">
              <div class="tl-step done"><span class="tl-time">+1.4s</span><div class="tl-t">Replied instantly</div><div class="tl-m">personalised, in your tone</div></div>
              <div class="tl-step done"><span class="tl-time">+12s</span><div class="tl-t">Qualified — budget ✓ fit ✓</div><div class="tl-m">matched your ICP rules</div></div>
              <div class="tl-step done"><span class="tl-time">+38s</span><div class="tl-t">Call booked — Thu 14:00</div><div class="tl-m">straight into your calendar</div></div>
              <div class="tl-step"><span class="tl-time">+40s</span><div class="tl-t">CRM updated</div><div class="tl-m">note + tags written</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section class="block" id="how" style="padding-top:0;">
    <div class="wrap">
      <div class="section-head center reveal">
        <span class="eyebrow"><span class="num">02 /</span> how it works</span>
        <h2>Named mechanisms. No magic.</h2>
      </div>
      <div class="timeline reveal">
        <div class="tnode glass">
          <div class="dotw"></div>
          <div class="k">[ 01 ]</div>
          <h3>We map the workflow</h3>
          <p>One working session. We trace what happens today, where the hours go, and what's safe to hand off.</p>
          <div class="mech">output: a wiring diagram</div>
        </div>
        <div class="tnode glass">
          <div class="dotw"></div>
          <div class="k">[ 02 ]</div>
          <h3>We build &amp; wire it</h3>
          <p>We connect your stack — inbox, CRM, billing, Slack — and train the bots on your real data and tone.</p>
          <div class="mech">webhook → agent → action → log</div>
        </div>
        <div class="tnode glass">
          <div class="dotw"></div>
          <div class="k">[ 03 ]</div>
          <h3>It runs, you watch</h3>
          <p>Goes live behind a dashboard. You see every action, override anything, and we tune it as volume grows.</p>
          <div class="mech">status: live · fully auditable</div>
        </div>
      </div>
    </div>
  </section>

  <!-- WHAT ELSE WE SHIP -->
  <section class="block" id="ship">
    <div class="wrap">
      <div class="section-head reveal">
        <span class="eyebrow"><span class="num">03 /</span> what else we create</span>
        <h2>An agency, not a plugin.</h2>
        <p>The automation is the core. The front door matters too — so we build that as well.</p>
      </div>
      <div class="ship-grid reveal">
        <div class="ship-item glass">
          <div class="n">// web</div>
          <h3>Websites</h3>
          <p>Fast, sharp marketing sites that look like the company you're becoming — wired to the automations behind them.</p>
        </div>
        <div class="ship-item glass">
          <div class="n">// decks</div>
          <h3>Pitch decks</h3>
          <p>Investor-ready narrative and design. The same builder-to-builder clarity, on a slide.</p>
        </div>
        <div class="ship-item glass">
          <div class="n">// apps</div>
          <h3>Apps</h3>
          <p>Internal tools and customer-facing apps that sit on top of your automated infrastructure.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- CASE PROOF -->
  <section class="block" id="case" style="padding-top:0;">
    <div class="wrap">
      <div class="section-head reveal">
        <span class="eyebrow"><span class="num">04 /</span> proof</span>
      </div>
      <div class="case reveal">
        <div class="dash glass">
          <div class="dash-top">
            <div class="dash-title">Support load — 8 weeks</div>
            <span class="live"><i></i>live</span>
          </div>
          <div class="dash-tiles">
            <div class="dtile"><div class="v">42h</div><div class="c">/ week before</div></div>
            <div class="dtile"><div class="v up">7h</div><div class="c">/ week after</div></div>
          </div>
          <div class="chart">
            <div class="chart-h"><span>weekly support hours</span><span>−83%</span></div>
            <div class="bars">
              <div class="bar" style="height:96%"></div>
              <div class="bar" style="height:90%"></div>
              <div class="bar" style="height:78%"></div>
              <div class="bar" style="height:60%"></div>
              <div class="bar" style="height:44%"></div>
              <div class="bar" style="height:32%"></div>
              <div class="bar now" style="height:22%"></div>
              <div class="bar now" style="height:17%"></div>
            </div>
          </div>
        </div>
        <div>
          <p class="quote">"Our two-person support team was drowning. BotBuildr automated the inbox in a week — now we touch <span class="gold">one ticket in five</span>."</p>
          <div class="who">— founder, 14-person e-commerce brand · €9.4k saved / month</div>
        </div>
      </div>
    </div>
  </section>

  <!-- STORY / JOURNEY (inside → outside) -->
  
  <section class="block story" id="journey">
    <div class="wrap">
      <div class="section-head center reveal">
        <span class="eyebrow"><span class="num">05 /</span> the journey</span>
        <h2>From overload to one automated company.</h2>
        <p>The whole story in four beats — from the inside out.</p>
      </div>

      <div class="story-track">

        <!-- BEAT 1 — the problem -->
        <div class="beat reveal">
          <div class="beat-copy">
            <span class="beat-eyebrow"><b>beat 01</b> · the problem</span>
            <p class="beat-line">Support piles up, leads go cold, invoices slip — and the <span class="hl">founder becomes the bottleneck</span>.</p>
          </div>
          <div class="beat-node"><div class="beat-node-dot">01</div></div>
          <div class="beat-visual">
            <div class="ov glass">
              <div class="ov-top">
                <span class="ov-day">mon 09:04 — before botbuildr</span>
                <span class="ov-warn">⚠ overloaded</span>
              </div>
              <div class="ov-stats">
                <div class="ov-stat"><div class="ov-v">247</div><div class="ov-l">unread tickets</div></div>
                <div class="ov-stat"><div class="ov-v">14</div><div class="ov-l">overdue invoices</div></div>
                <div class="ov-stat"><div class="ov-v">31</div><div class="ov-l">leads gone cold</div></div>
              </div>
              <div class="ov-list">
                <div class="ov-row"><span>re: where is my order?</span><span class="ov-age">waiting 3d</span></div>
                <div class="ov-row"><span>invoice #2031 — still unpaid</span><span class="ov-age">+18d</span></div>
                <div class="ov-row"><span>quote request — no reply yet</span><span class="ov-age">waiting 5d</span></div>
                <div class="ov-more">+ 241 more in the queue</div>
              </div>
            </div>
          </div>
        </div>

        <!-- BEAT 2 — the engine (inside) -->
        <div class="beat reveal">
          <div class="beat-copy">
            <span class="beat-eyebrow"><b>beat 02</b> · the engine — inside</span>
            <p class="beat-line">So we automate the <span class="hl">engine room</span> — customer service, invoicing and leads, running themselves.</p>
          </div>
          <div class="beat-node"><div class="beat-node-dot">02</div></div>
          <div class="beat-visual">
            <div class="eng glass">
              <div class="eng-top">
                <div class="mock-title">automation engine</div>
                <span class="live"><i></i>running</span>
              </div>
              <div class="eng-mods">
                <div class="eng-mod"><div class="eng-ico">CS</div><div><div class="eng-name">customer service</div><div class="eng-sub">drafts · triages · resolves</div></div><div class="eng-m">−80%</div></div>
                <div class="eng-mod"><div class="eng-ico">IN</div><div><div class="eng-name">invoicing</div><div class="eng-sub">sends · chases · reconciles</div></div><div class="eng-m">0 by hand</div></div>
                <div class="eng-mod"><div class="eng-ico">LD</div><div><div class="eng-name">lead handling</div><div class="eng-sub">replies · qualifies · books</div></div><div class="eng-m">1.4s</div></div>
              </div>
              <div class="eng-foot">// wired to your inbox · CRM · billing</div>
            </div>
          </div>
        </div>

        <!-- BEAT 3 — the face (outside) -->
        <div class="beat reveal">
          <div class="beat-copy">
            <span class="beat-eyebrow"><b>beat 03</b> · the face — outside</span>
            <p class="beat-line">Then we build the <span class="hl">face it shows the world</span> — a site with real motion, an app, a pitch deck.</p>
          </div>
          <div class="beat-node"><div class="beat-node-dot">03</div></div>
          <div class="beat-visual">
            <div class="face">
              <div class="face-browser glass">
                <div class="fb-bar">
                  <span class="fb-dots"><i></i><i></i><i></i></span>
                  <span class="fb-url">yourbrand.com</span>
                </div>
                <div class="fb-body">
                  <div class="fb-nav"><span class="fb-logo">▋ brand</span><span class="fb-links"><b></b><b></b><b></b></span></div>
                  <div class="ph" data-cap="// 3D hero animation"></div>
                  <div class="fb-h"></div>
                  <div class="fb-rows"><span></span><span></span><span></span></div>
                </div>
              </div>
              <div class="face-row">
                <div class="face-deck glass">
                  <div class="fd-cap">// pitch deck</div>
                  <div class="fd-title"></div>
                  <div class="fd-mini"></div>
                </div>
                <div class="face-phone glass">
                  <div class="ph" data-cap="// app"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- BEAT 4 — the result -->
        <div class="beat reveal">
          <div class="beat-copy">
            <span class="beat-eyebrow"><b>beat 04</b> · the result</span>
            <p class="beat-line">One company, fully automated and <span class="hl">unmistakably on-brand</span> — inside and outside, as one.</p>
          </div>
          <div class="beat-node"><div class="beat-node-dot">04</div></div>
          <div class="beat-visual">
            <div class="res">
              <div class="res-head">
                <span class="res-tag">// status: one system</span>
                <span class="res-live"><i></i>live, end to end</span>
              </div>
              <div class="res-grid">
                <div class="res-side">
                  <div class="res-k">inside · back office</div>
                  <div class="res-item"><b>✓</b> support automated</div>
                  <div class="res-item"><b>✓</b> invoicing automated</div>
                  <div class="res-item"><b>✓</b> leads automated</div>
                </div>
                <div class="res-merge">→</div>
                <div class="res-side">
                  <div class="res-k">outside · the brand</div>
                  <div class="res-item"><b>✓</b> website shipped</div>
                  <div class="res-item"><b>✓</b> app shipped</div>
                  <div class="res-item"><b>✓</b> pitch deck shipped</div>
                </div>
              </div>
              <div class="res-foot">
                <div class="res-big">one company. fully automated.</div>
                <div class="res-sub">on-brand, every touchpoint</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- FINAL CTA -->
  <div class="final-wrap">
    <div class="wrap">
      <div class="final glass reveal" id="contact">
        <span class="eyebrow" style="justify-content:center;">ready when you are</span>
        <h2 style="margin-top:18px;">Tell us what's eating your week.</h2>
        <p>30 minutes. We'll map one process live and tell you exactly what we'd automate first — no deck, no fluff.</p>
        <a href="#" class="btn btn-primary">&gt; book a build call</a>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <footer>
    <div class="wrap foot-inner">
      <div class="logo"><span class="cursor">▋</span><span>BotBuildr<span class="dotai">.ai</span></span></div>
      <div class="foot-links">
        <a href="#automate">automate</a>
        <a href="#how">how it works</a>
        <a href="#ship">what we create</a>
        <a href="#contact">contact</a>
      </div>
      <div class="copyright">© 2026 BotBuildr.ai — automation infrastructure for founders. // built for builders.</div>
    </div>
  </footer>`;
