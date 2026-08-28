'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CircleCheck,
  MoveUpRight,
  Nfc,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Star,
  Truck,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
const productCollections = [
  {
    label: 'Review stands',
    description: 'Your best reviews, one tap away.',
    href: '/collections/review-stands',
    image: '/images/products/nfcplate-google-review-stand-black-front.png',
    tone: 'bg-[#e7e3da]',
  },
  {
    label: 'Social stands',
    description: 'Turn visitors into followers.',
    href: '/collections/social-products',
    image: '/images/products/nfcplate-instagram-nfc-stand-gradient-front.png',
    tone: 'bg-[#dedfd8]',
  },
  {
    label: 'Review bundles',
    description: 'Cover every customer touchpoint.',
    href: '/collections/bundles',
    image: '/images/products/nfcplate-reputation-review-stand-bundle.png',
    tone: 'bg-[#e5e1d9]',
  },
  {
    label: 'Multi-link',
    description: 'One tap. Every important link.',
    href: '/collections/multi-link-products',
    image: '/images/products/nfcplate-multi-link-nfc-stand-black-front.png',
    tone: 'bg-[#dfe1dd]',
  },
];

const testimonials = [
  {
    quote: 'Our customers tap it without being asked. It made reviews part of the experience instead of another thing to remember.',
    name: 'Marcus T.',
    business: 'Independent restaurant owner',
    image: '/images/products/nfcplate-google-review-stand-black-front.png',
  },
  {
    quote: 'It looks premium on the counter and the setup took less than five minutes. The QR backup is a thoughtful touch.',
    name: 'Diana R.',
    business: 'Salon owner',
    image: '/images/products/nfcplate-google-review-stand-white-front.png',
  },
  {
    quote: 'We use stands at the counter and cards with our staff. Every customer gets an easy way to share their experience.',
    name: 'Nina P.',
    business: 'Retail business owner',
    image: '/images/products/nfcplate-social-growth-stand-bundle.png',
  },
];

const trustItems = [
  { icon: Nfc, label: 'One tap connection' },
  { icon: Smartphone, label: 'Works with all phones' },
  { icon: ShieldCheck, label: 'Premium quality' },
  { icon: Truck, label: 'Fast shipping worldwide' },
];

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Stars() {
  return (
    <span className="inline-flex gap-0.5" aria-label="5 out of 5 stars">
      {[0, 1, 2, 3, 4].map((star) => (
        <Star key={star} className="h-3.5 w-3.5 fill-[#a68b61] text-[#a68b61]" />
      ))}
    </span>
  );
}

export function PremiumHome() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="overflow-hidden bg-[#fbfaf7] text-[#171717]">
      <section className="relative isolate overflow-hidden bg-[#071120] text-white">
        <div className="absolute inset-0 -z-10 bg-[#071120] bg-[image:linear-gradient(90deg,rgba(5,14,27,1)_0%,rgba(5,14,27,1)_42%,rgba(5,14,27,0.72)_58%,rgba(5,14,27,0.08)_100%),url('/image.png')] bg-[length:auto_100%,auto_100%] bg-[position:left,center_right] bg-no-repeat" />
        <div className="container-np relative flex min-h-[620px] items-center pb-28 pt-28 sm:min-h-[680px] sm:pb-32 sm:pt-32 lg:min-h-[710px] lg:pt-36">
          <motion.div
            initial={{ opacity: 0, y: reducedMotion ? 0 : 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-w-[360px] sm:max-w-[400px]"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">NFCPlate</p>
            <h1 className="mt-5 max-w-[7ch] font-display text-[3.15rem] font-extrabold leading-[0.94] tracking-[-0.065em] sm:text-[4.25rem] lg:text-[4.75rem]">
              <span className="block text-white">Tiny tap.</span>
              <span className="block text-[#cda15a]">Big impact.</span>
            </h1>
            <p className="mt-5 max-w-[310px] text-sm leading-6 text-white/70 sm:mt-6 sm:text-base">
              NFCPlate review tools make it effortless for your customers to leave reviews that grow your business.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row">
              <Link href="/shop" className="group inline-flex h-11 items-center justify-center rounded-md bg-[#cda15a] px-5 text-xs font-bold text-[#1d2430] transition hover:-translate-y-0.5 hover:bg-[#e2bb78]">
                Shop products <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/how-it-works" className="inline-flex h-11 items-center justify-center rounded-md border border-white/35 bg-white/5 px-5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:border-white/65 hover:bg-white/10">
                View how it works
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-3 text-[11px] font-semibold text-white/75 sm:mt-7">
              <Truck className="h-4 w-4 text-[#cda15a]" />
              <span>Free shipping on orders $35+</span>
            </div>
          </motion.div>

          <div className="absolute inset-x-0 bottom-0 z-10 border-t border-white/15 bg-[#f5f3ed]/95 text-[#202328] backdrop-blur-sm">
            <div className="container-np grid grid-cols-2 divide-x divide-[#d9d5ce] sm:grid-cols-4">
              {trustItems.map((item) => (
                <div key={item.label} className="flex min-h-[72px] items-center gap-2 px-3 py-3 text-[10px] font-semibold leading-4 sm:min-h-[78px] sm:justify-center sm:px-4 sm:text-xs">
                  <item.icon className="h-4 w-4 shrink-0 text-[#8e744c]" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e4e0d8] bg-[#fbfaf7] py-7 sm:py-9">
        <div className="container-np flex flex-col items-center gap-5 sm:flex-row sm:gap-10">
          <p className="shrink-0 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#67645e] sm:text-left">Trusted by businesses of all sizes</p>
          <div className="relative w-full overflow-hidden">
            <div className="flex min-w-max animate-[marquee_26s_linear_infinite] items-center gap-10 text-[#aaa8a2] sm:gap-14">
              {['The Barbershop', 'TASTE', 'URBAN FITNESS', 'Bella', 'GRILL HOUSE', 'Coffee Corner', 'The Barbershop', 'TASTE', 'URBAN FITNESS', 'Bella'].map((brand, index) => (
                <span key={`${brand}-${index}`} className="whitespace-nowrap font-display text-sm font-bold uppercase tracking-[0.14em] sm:text-base">{brand}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#171717] py-20 text-white sm:py-28">
        <div className="container-np">
          <Reveal className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b39b76]">Find your fit</p>
              <h2 className="mt-4 max-w-[13ch] font-display text-4xl font-black leading-[0.98] tracking-[-0.06em] sm:text-6xl">Choose your review experience.</h2>
            </div>
            <Link href="/shop" className="group inline-flex items-center text-sm font-bold text-[#d7c6a9]">Shop all products <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productCollections.map((collection, index) => (
              <Reveal key={collection.label} delay={index * 0.06}>
                <Link href={collection.href} className="group block">
                  <div className={`relative aspect-[0.82] overflow-hidden rounded-sm ${collection.tone}`}>
                    <Image src={collection.image} alt={collection.label} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-contain p-3 transition duration-700 group-hover:scale-105" />
                    <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#171717] transition group-hover:bg-[#b39b76] group-hover:text-white"><MoveUpRight className="h-4 w-4" /></span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold tracking-[-0.02em]">{collection.label}</h3>
                  <p className="mt-1 text-sm text-white/55">{collection.description}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf7] py-20 sm:py-28">
        <div className="container-np grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8f7958]">How it works</p>
            <h2 className="mt-4 max-w-[12ch] font-display text-4xl font-black leading-[0.98] tracking-[-0.06em] sm:text-6xl">Simple for you. Effortless for your customers.</h2>
            <p className="mt-6 max-w-md text-base leading-7 text-[#65615a]">Give happy customers the shortest path from a great experience to the review your business earned.</p>
            <Link href="/how-it-works" className="group mt-8 inline-flex items-center text-sm font-bold text-[#171717]">See how it works <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
          </Reveal>
          <Reveal delay={0.12} className="relative">
            <div className="relative overflow-hidden rounded-sm bg-[#e8e5dc] p-5 sm:p-10">
              <div className="absolute left-8 top-8 h-28 w-28 rounded-full border border-white/70" />
              <div className="relative mx-auto aspect-[1.3] max-w-[560px]">
                <Image src="/images/products/nfcplate-google-review-stand-white-front.png" alt="White NFCPlate review stand" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain drop-shadow-[0_22px_22px_rgba(32,29,24,0.2)]" />
              </div>
            </div>
            <div className="absolute -bottom-5 right-4 max-w-[230px] rounded-sm bg-[#171717] p-5 text-white shadow-xl sm:right-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b39b76]">Three easy steps</p>
              <p className="mt-2 text-sm font-bold leading-5">Tap. Open. Share the experience.</p>
            </div>
          </Reveal>
        </div>
        <div className="container-np mt-20 grid gap-4 border-t border-[#ded9cf] pt-8 sm:grid-cols-3">
          {[
            { icon: ScanLine, title: 'Tap or scan', body: 'NFC and QR work together on every product.' },
            { icon: Smartphone, title: 'Open the right page', body: 'Customers land directly where you want them.' },
            { icon: CircleCheck, title: 'Leave a review', body: 'Less friction means more genuine feedback.' },
          ].map((step, index) => (
            <Reveal key={step.title} delay={index * 0.06} className="flex gap-4 border-[#ded9cf] sm:border-l sm:pl-6 first:sm:border-l-0 first:sm:pl-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#cfc6b7] text-[#8f7958]"><step.icon className="h-4 w-4" /></span>
              <div><h3 className="text-sm font-bold">{step.title}</h3><p className="mt-1 text-sm leading-6 text-[#6b675f]">{step.body}</p></div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[#e9e4da] py-20 sm:py-28">
        <div className="container-np">
          <Reveal className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8f7958]">Real businesses. Real feedback.</p><h2 className="mt-4 max-w-[14ch] font-display text-4xl font-black leading-[0.98] tracking-[-0.06em] sm:text-6xl">Built to earn more 5-star moments.</h2></div>
            <Link href="/how-it-works" className="inline-flex items-center text-sm font-bold text-[#171717]">See customer stories <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Reveal key={testimonial.name} delay={index * 0.08}>
                <article className="overflow-hidden rounded-sm border border-[#d5cdbf] bg-[#f6f3ed]">
                  <div className="relative aspect-[1.65] bg-[#ddd8ce]"><Image src={testimonial.image} alt="NFCPlate product in use" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-contain p-4" /></div>
                  <div className="p-6"><Stars /><blockquote className="mt-4 text-base font-semibold leading-7 tracking-[-0.02em] text-[#292824]">“{testimonial.quote}”</blockquote><div className="mt-6 border-t border-[#ddd5c8] pt-4"><p className="text-sm font-bold">{testimonial.name}</p><p className="mt-1 text-xs text-[#706b62]">{testimonial.business}</p></div></div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#171717] py-20 text-white sm:py-24">
        <div className="container-np flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b39b76]">Make it easy to be remembered</p><h2 className="mt-4 max-w-[13ch] font-display text-4xl font-black leading-[0.98] tracking-[-0.06em] sm:text-5xl">Put your next great review one tap away.</h2></div>
          <Link href="/shop" className="group inline-flex h-12 shrink-0 items-center justify-center rounded-md bg-[#f5f1e8] px-6 text-sm font-bold text-[#171717] transition hover:-translate-y-0.5 hover:bg-[#b39b76] hover:text-white">Shop NFCPlate <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
        </div>
      </section>
    </div>
  );
}
