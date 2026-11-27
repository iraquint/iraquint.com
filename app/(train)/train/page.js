import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import SprintStrip from "./SprintStrip";

const TITLE = "Training · Ira Quint";
const DESCRIPTION =
  "Sprint coaching for adults in Arlington, VA and the DC area. Two paths: build the foundation, or learn to sprint.";

// The preview image itself is opengraph-image.jpg beside this file; Next adds
// the og:image tags. metadataBase makes its URL absolute on the real domain
// rather than a Vercel deployment URL.
export const metadata = {
  metadataBase: new URL("https://iraquint.com"),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/train" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/train", siteName: "Ira Quint", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

// How many training spots are left. The nav badge and the Details row both
// read from this, so filling a spot is a one-number change.
const SPOTS_OPEN = 2;
const spotsBadge = SPOTS_OPEN === 0 ? "Waitlist open" : `${SPOTS_OPEN} spot${SPOTS_OPEN === 1 ? "" : "s"} open`;
const spotsDetail = SPOTS_OPEN === 0 ? "Full for now. Apply to join the waitlist." : `${SPOTS_OPEN}. That's it.`;

// Every apply link opens the same pre-filled email. The pricing cards add the
// plan to the subject, so it's clear which one someone picked.
//
// Line breaks are CRLF, as the mailto spec (RFC 6068) requires: some mail
// apps, Gmail on iOS among them, drop bare LFs and run the questions together.
// They're numbered too, so even an app that flattens the body still reads
// "1. … 2. … 3. …" rather than one run-on line.
const APPLY_BODY = [
  "1. What I'm training for:",
  "",
  "2. What I do now:",
  "",
  "3. One number I want to move:",
  "",
].join("\r\n");
const applyHref = (plan) =>
  "mailto:ira.j.quint@gmail.com?subject=" +
  encodeURIComponent(plan ? `Training application: ${plan}` : "Training application") +
  "&body=" +
  encodeURIComponent(APPLY_BODY).replace(/'/g, "%27");
const APPLY = applyHref();

const BENEFITS = [
  ["Makes you capable", "Catch the bus, chase your kids, and play pickup without worrying about getting hurt. Being fast and resilient shows up everywhere."],
  ["Strong muscle", "Short, hard efforts build strength and power instead of wearing you down."],
  ["A sharper nervous system", "Sprinting teaches your body to fire fast, so you react quicker and move with more snap."],
  ["Mobile and coordinated", "Moving fast through a full range keeps your hips, ankles, and arms loose and working together."],
];

const STEPS = [
  ["01", "Movement screen", "Day one is low-key. We check how your feet, ankles, knees, and hips move. That tells us which path you start on."],
  ["02", "Foundation (4 weeks, if you need it)", "Strength and mobility for the joints that keep you from running fast. Path 1 starts here."],
  ["03", "Speed (8 weeks)", "Drills and build-ups, then real sprints and jumps, with strength work to keep your hamstrings happy. Path 2 starts here."],
  ["04", "Test, then retest every 4 weeks", "Once you are ready, we run the four performance tests. Then we retest so you see exactly how much faster and more explosive you got."],
];

const SCREEN = [
  ["Feet", "How your arches hold up when you move"],
  ["Ankles", "How far your knee can bend past your toes"],
  ["Calves", "Slow calf raises on one leg"],
  ["Hips & hamstrings", "Range and strength"],
  ["Balance", "Standing and stepping down on one leg"],
  ["Bounce", "Easy hops and skips, if they feel okay"],
];

const STATS = [
  ["Marathon", "3:38", "Marine Corps"],
  ["Vertical", "31\"", "Goal: dunk"],
  ["Squat", "315 × 5", "Back squat"],
  ["Power clean", "225", "Explosive pull"],
];

const DETAILS = [
  ["Where", "Washington-Liberty track or other Arlington / DC fields"],
  ["When", "Around your schedule: early mornings or evenings"],
  ["Billing", "Every 4 weeks"],
  ["Spots", spotsDetail],
];

/* ---------- animated figures for the performance tests ---------- */

function Figure({ children }) {
  return (
    <svg className="sf" viewBox="0 0 80 60" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="56" x2="78" y2="56" strokeWidth="1.5" opacity="0.35" />
      {children}
    </svg>
  );
}

const TESTS = [
  {
    unit: "Seconds",
    name: "40-yard dash",
    figure: (
      <Figure>
        <g className="wind">
          <line x1="10" y1="22" x2="20" y2="22" strokeWidth="1.5" />
          <line x1="6" y1="32" x2="18" y2="32" strokeWidth="1.5" />
          <line x1="10" y1="42" x2="20" y2="42" strokeWidth="1.5" />
        </g>
        <g className="bob">
          <circle cx="45" cy="12" r="5" />
          <line x1="43" y1="18" x2="38" y2="32" />
          <polyline className="arm1" points="42,20 37,27 33,23" />
          <polyline className="arm2" points="42,20 47,27 52,24" />
          <polyline className="leg1" points="38,32 46,42 44,54" />
          <polyline className="leg2" points="38,32 32,43 25,49" />
        </g>
      </Figure>
    ),
  },
  {
    unit: "Feet",
    name: "Overhead med ball toss",
    figure: (
      <Figure>
        <g className="tbody">
          {/* Backward toss. Faces left, toes forward; the legs stay planted
              while everything above the hips moves. */}
          <polyline points="26,34 25,51 21,55" />
          <polyline points="26,34 28,51 24,55" />
          {/* Upper body pivots at the hip: hinged forward with the ball in
              front, then extends back. */}
          <g className="lean">
            <circle cx="18" cy="14" r="5" />
            <polyline points="26,34 24,26 22,20" />
            {/* Arms pivot at the shoulder: low in front, then past
                overhead into a reach behind. */}
            <g className="toss">
              <line x1="23" y1="21" x2="32" y2="3" />
              <line x1="23" y1="21" x2="30" y2="3" />
              <circle className="held" cx="31" cy="-1" r="4" fill="currentColor" stroke="none" />
            </g>
          </g>
        </g>
        {/* Takes over from the held ball at release and arcs off behind. */}
        <circle className="ball" r="4" fill="currentColor" stroke="none" />
      </Figure>
    ),
  },
  {
    unit: "Inches",
    name: "Approach vertical",
    figure: (
      <Figure>
        <line className="mark" x1="58" y1="2" x2="58" y2="14" strokeWidth="2" strokeDasharray="2 3" />
        <g className="vj">
          <circle cx="40" cy="12" r="5" />
          <line x1="40" y1="18" x2="40" y2="36" />
          <line x1="40" y1="21" x2="52" y2="8" />
          <line x1="40" y1="21" x2="32" y2="30" />
          <line x1="40" y1="36" x2="35" y2="54" />
          <line x1="40" y1="36" x2="45" y2="54" />
        </g>
      </Figure>
    ),
  },
  {
    unit: "Inches",
    name: "Standing broad jump",
    figure: (
      <Figure>
        <line x1="56" y1="52" x2="56" y2="59" strokeWidth="1.5" opacity="0.6" />
        <g className="bj">
          <g>
            <circle cx="24" cy="14" r="5" />
            <line x1="23" y1="20" x2="21" y2="34" />
            <line x1="23" y1="23" x2="35" y2="19" />
            <line x1="23" y1="23" x2="34" y2="26" />
            {/* Each leg is a thigh with a shin hinged at the knee, drawn
                straight down and bent by CSS. The second is set a few
                degrees off so the two read as a pair. */}
            <g className="thigh">
              <line x1="21" y1="34" x2="21" y2="45" />
              <line className="shin" x1="21" y1="45" x2="21" y2="56" />
            </g>
            <g transform="rotate(-8 21 34)">
              <g className="thigh">
                <line x1="21" y1="34" x2="21" y2="45" />
                <line className="shin" x1="21" y1="45" x2="21" y2="56" />
              </g>
            </g>
          </g>
        </g>
      </Figure>
    ),
  },
];

function Rows({ items, roomy }) {
  return (
    <dl className={roomy ? "rows roomy" : "rows"}>
      {items.map(([term, value]) => (
        <div className="row" key={term}>
          <dt className="label">{term}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function TrainPage() {
  return (
    <div className="page">
      <div className="col">
        <nav className="nav">
          <Link href="/" className="brand">Ira Quint</Link>
          <div className="nav-right">
            <span className="eyebrow muted">{spotsBadge}</span>
            <ThemeToggle />
          </div>
        </nav>

        <header className="hero">
          <div className="hero-meta">
            <p className="eyebrow">Training</p>
            <p className="eyebrow muted loc">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
                <circle cx="12" cy="9.5" r="2.5" />
              </svg>
              Arlington, VA · DC area
            </p>
          </div>
          <h1 className="display hero-title">When&apos;s the last time you sprinted?</h1>
          <SprintStrip />
          {/* The sprint clip above is the introduction now, so the story
              stands alone. */}
          <p className="lede">Three years ago, I told myself I couldn&apos;t run at all. Now, at 30, I&apos;ve addressed my body&apos;s imbalances, changed my mindset, and I&apos;m sprinting twice a week and training to dunk a basketball.</p>
          <p className="tagline">Write your own sprint story with me.</p>
          <div className="ctas">
            <a href={APPLY} className="btn btn-solid">Apply for a spot</a>
            <a href="#paths" className="btn btn-ghost">See the two paths</a>
          </div>
        </header>

        <section className="section loose">
          <h2 className="eyebrow">Why sprint?</h2>
          <p className="display section-title">Build your capacity.</p>
          <p className="why">Sprinting is the fullest expression of what your body can do. It takes strong muscles, a sharp nervous system, flexibility, and coordination, all at once. Train it, and you become a more resilient, capable human. And it doesn&apos;t take hours.</p>
          <figure className="quote">
            <blockquote>&quot;Running fast is the ultimate human activity.&quot;</blockquote>
            <figcaption className="label">Stuart McMillan, Olympic sprint coach · Rich Roll Podcast</figcaption>
          </figure>
          <div className="grid">
            {BENEFITS.map(([title, body]) => (
              <div className="benefit" key={title}>
                <p className="benefit-title">{title}</p>
                <p className="benefit-body">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="paths" className="section">
          <h2 className="eyebrow">Two ways in</h2>
          <div className="grid">
            <div className="card">
              <p className="eyebrow">Path 1</p>
              <p className="display card-title">Build the foundation</p>
              <p className="copy">Your knees, ankles, or feet aren&apos;t ready to run fast yet. We find the imbalances and spend 4 weeks building strength and mobility, then move into the speed block. This is exactly how I got back.</p>
            </div>
            <div className="card">
              <p className="eyebrow">Path 2</p>
              <p className="display card-title">Learn to sprint</p>
              <p className="copy">You can jog without pain and you want to feel fast again. You go straight into the 8-week speed block, with retests at weeks 4 and 8.</p>
            </div>
          </div>
          <p className="note">Hurt right now? See a physical therapist first. Once you&apos;re cleared, we start with Path 1.</p>
        </section>

        <section id="how" className="section">
          <h2 className="eyebrow">How it works</h2>
          <div className="steps">
            {STEPS.map(([num, title, body]) => (
              <div className="step" key={num}>
                <span className="step-num">{num}</span>
                <div className="step-text">
                  <p className="step-title">{title}</p>
                  <p className="copy">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="eyebrow">What we&apos;ll measure</h2>
          <p className="subhead">Movement screen <span>· Everyone, day one</span></p>
          <Rows items={SCREEN} />
          <p className="subhead spaced">Performance tests <span>· When you&apos;re ready</span></p>
          <div className="grid tests">
            {TESTS.map((t) => (
              <div className="test" key={t.name}>
                <span className="label sm">{t.unit}</span>
                {t.figure}
                <span className="test-name">{t.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="eyebrow">Who&apos;s coaching</h2>
          <div className="stack-m coach">
            <Image
              className="coach-photo"
              src="/assets/train-coach.jpg"
              alt="Ira, shirtless in a park, grinning with his tongue out"
              width={192}
              height={240}
            />
            <div className="bio">
              <p className="display coach-name">Ira Quint</p>
              <p className="bio-copy">A few years ago, sports injuries left my knees too injured to run, and my feet and ankles weren&apos;t built for it. I dropped the &quot;I&apos;m not a runner&quot; story, rebuilt my body, and ran the Marine Corps Marathon in 3:38.</p>
              <p className="bio-copy">Now I&apos;m 30 and learning to dunk at 5&apos;8&quot;. I&apos;ve trained in the gym for 15+ years, and I&apos;m only beginning to tap into my athletic potential. I also teach yoga at Down Dog Yoga in Georgetown, so mobility is built in.</p>
            </div>
          </div>
          <div className="grid stats">
            {STATS.map(([label, value, note]) => (
              <div className="stat" key={label}>
                <span className="label sm">{label}</span>
                <span className="stat-value">{value}</span>
                <span className="stat-note">{note}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="eyebrow">Details</h2>
          <div className="grid">
            <div className="card price featured">
              <div className="price-head">
                <p className="display card-title">Hybrid</p>
                <span className="eyebrow sm">Most people</span>
              </div>
              <p className="copy">1 in-person session a week, plus a sprint + strength program for 1–2 solo sessions (gym or outdoor), with video check-ins.</p>
              <div className="price-foot">
                <p className="price-amount">$480 / 4 weeks</p>
                <p className="price-founding">Founding rate: $360</p>
              </div>
              <a href={applyHref("Hybrid")} className="price-apply">Apply for Hybrid →</a>
            </div>
            <div className="card price">
              <div className="price-head">
                <p className="display card-title">Full</p>
                <span className="eyebrow sm">Most hands-on</span>
              </div>
              <p className="copy">2 in-person sessions a week, plus a sprint + strength program and video check-ins.</p>
              <div className="price-foot">
                <p className="price-amount">$880 / 4 weeks</p>
                <p className="price-founding">Founding rate: $660</p>
              </div>
              <a href={applyHref("Full")} className="price-apply">Apply for Full →</a>
            </div>
          </div>
          <p className="note">Founding rate is 25% off for my first 2 clients, in exchange for your before-and-after numbers and a short testimonial.</p>
          <Rows items={DETAILS} roomy />
        </section>

        <section className="apply">
          <h2 className="display apply-title">Want in?</h2>
          <p className="apply-copy">Send me what you&apos;re training for, what you do now, and one number you want to move.</p>
          <div className="ctas">
            <a href={APPLY} className="btn btn-accent">Apply for a spot</a>
            <a href="https://instagram.com/ira.does.things" className="btn btn-ghost icon">
              {/* Instagram's own glyph: white camera on the brand gradient. */}
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <defs>
                  <radialGradient id="ig-gradient" cx="30%" cy="107%" r="150%">
                    <stop offset="0" stopColor="#fdf497" />
                    <stop offset="0.05" stopColor="#fdf497" />
                    <stop offset="0.45" stopColor="#fd5949" />
                    <stop offset="0.6" stopColor="#d6249f" />
                    <stop offset="0.9" stopColor="#285aeb" />
                  </radialGradient>
                </defs>
                <rect x="1" y="1" width="22" height="22" rx="6.5" fill="url(#ig-gradient)" />
                <g fill="none" stroke="#fff" strokeWidth="1.7">
                  <rect x="5.5" y="5.5" width="13" height="13" rx="4" />
                  <circle cx="12" cy="12" r="3.2" />
                </g>
                <circle cx="15.9" cy="8.1" r="0.95" fill="#fff" />
              </svg>
              DM @ira.does.things
            </a>
          </div>
        </section>

        <footer className="footer label">
          <span>Arlington, VA</span>
          <span className="plain">let&apos;s get it</span>
        </footer>
      </div>
    </div>
  );
}
