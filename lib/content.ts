import type { FaqEntry, GuideEntry, Industry } from './types';

export const industries: Industry[] = [
  {
    slug: 'restaurants',
    name: 'Restaurants',
    description:
      'Place a stand at the host stand or the check holder so every happy guest can leave a review before they walk out.',
    iconName: 'utensils',
  },
  {
    slug: 'salons-barbers',
    name: 'Salons & Barbers',
    description:
      'Set a stand at the styling station or front desk so clients can review while they book their next visit.',
    iconName: 'scissors',
  },
  {
    slug: 'dental-offices',
    name: 'Dental Offices',
    description:
      'Leave a stand at checkout so patients can share their experience the moment their appointment ends.',
    iconName: 'stethoscope',
  },
  {
    slug: 'auto-services',
    name: 'Auto Services',
    description:
      'Hand a card to every customer when you hand back the keys — reviews start while the visit is fresh.',
    iconName: 'wrench',
  },
  {
    slug: 'fitness-studios',
    name: 'Fitness Studios',
    description:
      'Put a stand at the front desk so members can review right after class, when their energy is highest.',
    iconName: 'dumbbell',
  },
  {
    slug: 'retail-stores',
    name: 'Retail Stores',
    description:
      'Place a stand at the register so satisfied shoppers can leave a review while you wrap their purchase.',
    iconName: 'shopping-bag',
  },
  {
    slug: 'contractors',
    name: 'Contractors',
    description:
      'Leave a card with every finished job so homeowners can review the work the moment it is complete.',
    iconName: 'hammer',
  },
  {
    slug: 'medical-offices',
    name: 'Medical Offices',
    description:
      'Set a stand at checkout so patients can share their experience right after their visit.',
    iconName: 'heart-pulse',
  },
];

export function getIndustryBySlug(slug: string): Industry | undefined {
  return industries.find((i) => i.slug === slug);
}

export const guides: GuideEntry[] = [
  {
    slug: 'how-nfc-works',
    title: 'How NFC Works',
    description: 'A plain-language guide to how NFC delivers your review page.',
    category: 'NFC',
    readTime: '3 min',
  },
  {
    slug: 'set-your-review-link',
    title: 'Set Your Review Link',
    description: 'How to program your NFCPlate product with your Google review link.',
    category: 'Setup',
    readTime: '4 min',
  },
  {
    slug: 'nfc-compatibility-explained',
    title: 'NFC Compatibility Explained',
    description: 'Which phones tap, which scan, and what to do for older devices.',
    category: 'NFC',
    readTime: '5 min',
  },
  {
    slug: 'get-more-google-reviews',
    title: 'Get More Google Reviews the Right Way',
    description: 'Ethical, genuine ways to ask every happy customer for a review.',
    category: 'Platforms',
    readTime: '6 min',
  },
  {
    slug: 'place-your-product',
    title: 'Where to Place Your Product',
    description: 'The spots in your business that turn the most taps into reviews.',
    category: 'Getting started',
    readTime: '4 min',
  },
  {
    slug: 'use-the-qr-backup',
    title: 'Using the QR Backup',
    description: 'How the printed QR code keeps non-NFC phones covered.',
    category: 'Setup',
    readTime: '2 min',
  },
];

export function getGuideBySlug(slug: string): GuideEntry | undefined {
  return guides.find((g) => g.slug === slug);
}

export const faqs: FaqEntry[] = [
  {
    id: 'faq-1',
    question: 'Do customers need an app to leave a review?',
    answer:
      'No. When a customer taps your NFCPlate product with their phone, your review page opens directly in their browser. No app download is required for iPhone or Android.',
    category: 'Products',
  },
  {
    id: 'faq-2',
    question: 'What if a phone does not support NFC?',
    answer:
      'Every NFCPlate product includes a printed QR code backup. If a phone does not support NFC taps, the customer can scan the QR code with their camera to open the same review page.',
    category: 'NFC & Compatibility',
  },
  {
    id: 'faq-3',
    question: 'Which phones support NFC taps?',
    answer:
      'iPhone 7 and newer support NFC taps natively, as do most modern Android devices. For older devices, the printed QR code provides the same one-step experience.',
    category: 'NFC & Compatibility',
  },
  {
    id: 'faq-4',
    question: 'How do I set my review link?',
    answer:
      'Each NFCPlate product is programmable. You set your Google review link once and the product opens that page on every tap. See the Product Setup page for step-by-step instructions.',
    category: 'Setup',
  },
  {
    id: 'faq-5',
    question: 'Is NFCPlate affiliated with Google?',
    answer:
      'No. NFCPlate is not affiliated with or endorsed by Google. NFCPlate products simply open the review page you program them with.',
    category: 'Products',
  },
  {
    id: 'faq-6',
    question: 'Can I use the same product for a different platform later?',
    answer:
      'Yes. NFCPlate products are programmable, so you can update the link at any time to point to a Google review page, an Instagram profile, a Facebook page, or a multi-link page.',
    category: 'Products',
  },
  {
    id: 'faq-7',
    question: 'How fast is shipping?',
    answer:
      'Standard U.S. shipping is free on orders $35 and up during our launch offer. Orders typically ship within 1-2 business days.',
    category: 'Orders',
  },
  {
    id: 'faq-8',
    question: 'What is your return policy?',
    answer:
      'We accept returns on unprogrammed products within 30 days. See our Shipping & Returns page for full details.',
    category: 'Orders',
  },
];

export function getFaqsByCategory(category: string): FaqEntry[] {
  return faqs.filter((f) => f.category === category);
}
