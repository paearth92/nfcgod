import Link from 'next/link';
import { ArrowRight, MapPin, Smartphone, Star } from 'lucide-react';

const steps = [
  {
    icon: MapPin,
    title: 'Place it',
    description: 'Set your NFCPlate product where customers naturally finish their visit.',
  },
  {
    icon: Smartphone,
    title: 'Tap or scan',
    description: 'Customers use NFC or the QR code with their own phone.',
  },
  {
    icon: Star,
    title: 'Leave a review',
    description: 'Your genuine review page opens directly—no app or searching.',
  },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-[hsl(var(--navy))] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.3) 0, transparent 35%)",
        }}
      />
      <div className="container-np relative py-16 md:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Phone mockup */}
          <div className="relative order-2 lg:order-1">
            <div className="relative mx-auto flex w-full max-w-sm items-center justify-center">
              {/* NFC card approaching */}
              <div
                className="absolute -left-2 top-1/2 z-20 -translate-y-1/2 rotate-[-8deg] rounded-xl bg-gradient-to-br from-[#23262d] to-[#0b0d10] p-3 shadow-2xl sm:-left-6"
                aria-hidden="true"
              >
                <div className="flex w-24 flex-col items-center gap-1 text-white">
                  <span className="text-[9px] font-bold">NFCPlate</span>
                  <span className="text-[7px] font-semibold uppercase opacity-70">NFC</span>
                  <div className="my-1 flex gap-0.5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="h-2 w-2 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

              {/* NFC signal rings */}
              <div className="absolute left-1/2 top-1/2 -z-0 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
                {[0, 0.8, 1.6].map((delay, i) => (
                  <span
                    key={i}
                    className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 animate-nfc-pulse rounded-full border border-primary/40"
                    style={{ animationDelay: `${delay}s` }}
                  />
                ))}
              </div>

              {/* Phone */}
              <div className="relative z-10 h-[420px] w-[210px] rounded-[2.25rem] border-[6px] border-[#0b0d10] bg-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
                <div className="absolute left-1/2 top-2 z-20 h-1.5 w-16 -translate-x-1/2 rounded-full bg-[#0b0d10]" />
                <div className="flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-[#f6f8fc] to-white">
                  <div className="flex items-center justify-between px-4 pt-6 text-[9px] font-semibold text-[#1b2740]">
                    <span>9:41</span>
                    <span>Google</span>
                  </div>
                  <div className="mt-2 px-4">
                    <div className="flex items-center gap-2 rounded-lg bg-[#1b2740] px-3 py-2 text-white">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-white text-[8px] font-bold text-[#1b2740]">
                        G
                      </div>
                      <span className="text-[10px] font-semibold">Business Name</span>
                    </div>
                  </div>
                  <div className="mt-3 px-4">
                    <p className="text-[10px] font-bold text-[#1b2740]">Review us on Google</p>
                    <p className="text-[8px] text-muted-foreground">Your review helps us grow</p>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="mt-3 px-4">
                    <div className="h-2 w-full rounded bg-[#e7ecf3]" />
                    <div className="mt-1.5 h-2 w-3/4 rounded bg-[#e7ecf3]" />
                    <div className="mt-1.5 h-2 w-2/3 rounded bg-[#e7ecf3]" />
                  </div>
                  <div className="mt-auto mb-6 px-4">
                    <div className="flex h-7 items-center justify-center rounded-full bg-[#2b5bd7] text-[10px] font-semibold text-white">
                      Write a review
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="order-1 lg:order-2">
            <p className="eyebrow text-white/70">How it works</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl md:text-[2rem] md:leading-[1.15]">
              From happy customer to new review—in seconds.
            </h2>
            <ol className="mt-8 space-y-6">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-inset ring-primary/30">
                    <step.icon className="h-5 w-5" />
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/70">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link
              href="/how-it-works"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-white underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded"
            >
              Learn how NFCPlate works <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
