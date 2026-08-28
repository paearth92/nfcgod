export interface ProductMediaEntry {
  filename: string;
  productSlug: string;
  platform: string;
  variant: string;
  width: number;
  height: number;
  role: 'primary' | 'variant';
  alt: string;
}

const manifest: ProductMediaEntry[] = [
  {
    filename: 'nfcplate-google-review-stand-black-front.png',
    productSlug: 'google-review-stand',
    platform: 'google',
    variant: 'black',
    width: 1408,
    height: 768,
    role: 'primary',
    alt: 'Google Review Stand in black with NFC tap and QR code on a weighted base',
  },
  {
    filename: 'nfcplate-google-review-stand-white-front.png',
    productSlug: 'google-review-stand',
    platform: 'google',
    variant: 'white',
    width: 1408,
    height: 768,
    role: 'variant',
    alt: 'Google Review Stand in white with NFC tap and QR code on a weighted base',
  },
  {
    filename: 'nfcplate-facebook-nfc-stand-blue-front.png',
    productSlug: 'facebook-nfc-stand',
    platform: 'facebook',
    variant: 'blue',
    width: 1408,
    height: 768,
    role: 'primary',
    alt: 'Facebook NFC Stand in blue with NFC tap and QR code on a weighted base',
  },
  {
    filename: 'nfcplate-instagram-nfc-stand-gradient-front.png',
    productSlug: 'instagram-nfc-stand',
    platform: 'instagram',
    variant: 'gradient',
    width: 1408,
    height: 768,
    role: 'primary',
    alt: 'Instagram NFC Stand with gradient finish, NFC tap and QR code on a weighted base',
  },
  {
    filename: 'nfcplate-tripadvisor-review-stand-green-front.png',
    productSlug: 'tripadvisor-review-stand',
    platform: 'tripadvisor',
    variant: 'green',
    width: 1408,
    height: 768,
    role: 'primary',
    alt: 'Tripadvisor Review Stand in green with NFC tap and QR code on a weighted base',
  },
  {
    filename: 'nfcplate-trustpilot-review-stand-black-green-front.png',
    productSlug: 'trustpilot-review-stand',
    platform: 'trustpilot',
    variant: 'black-green',
    width: 1408,
    height: 768,
    role: 'primary',
    alt: 'Trustpilot Review Stand in black and green with NFC tap and QR code on a weighted base',
  },
  {
    filename: 'nfcplate-yelp-review-stand-red-front.png',
    productSlug: 'yelp-review-stand',
    platform: 'yelp',
    variant: 'red',
    width: 1408,
    height: 768,
    role: 'primary',
    alt: 'Yelp Review Stand in red with NFC tap and QR code on a weighted base',
  },
  {
    filename: 'nfcplate-tiktok-follow-stand-black-front.png',
    productSlug: 'tiktok-follow-stand',
    platform: 'tiktok',
    variant: 'black',
    width: 1408,
    height: 768,
    role: 'primary',
    alt: 'TikTok Follow Stand in black with NFC tap and QR code on a weighted base',
  },
  {
    filename: 'nfcplate-multi-link-nfc-stand-black-front.png',
    productSlug: 'multi-link-nfc-stand',
    platform: 'multi-link',
    variant: 'black',
    width: 1408,
    height: 768,
    role: 'primary',
    alt: 'Multi-Link NFC Stand in black with NFC tap and QR code on a weighted base',
  },
  {
    filename: 'nfcplate-social-growth-stand-bundle.png',
    productSlug: 'social-growth-stand-bundle',
    platform: 'multi-link',
    variant: 'bundle',
    width: 1408,
    height: 768,
    role: 'primary',
    alt: 'Social Growth Stand Bundle containing Facebook, Instagram, and TikTok NFC stands',
  },
  {
    filename: 'nfcplate-reputation-review-stand-bundle.png',
    productSlug: 'reputation-review-stand-bundle',
    platform: 'multi-link',
    variant: 'bundle',
    width: 1408,
    height: 768,
    role: 'primary',
    alt: 'Reputation Review Stand Bundle containing Google, Tripadvisor, and Yelp NFC review stands',
  },
];

const IMAGE_BASE = '/images/products';

export function getMediaForProduct(slug: string): ProductMediaEntry[] {
  return manifest.filter((m) => m.productSlug === slug);
}

export function getPrimaryImage(slug: string): ProductMediaEntry | null {
  return manifest.find((m) => m.productSlug === slug && m.role === 'primary') ?? null;
}

export function getVariantImage(slug: string, variant: string): ProductMediaEntry | null {
  return (
    manifest.find((m) => m.productSlug === slug && m.variant === variant) ??
    getPrimaryImage(slug)
  );
}

export function getImagePath(entry: ProductMediaEntry): string {
  return `${IMAGE_BASE}/${entry.filename}`;
}

export function getImagePathForSlug(slug: string, variant?: string): string {
  const entry = variant ? getVariantImage(slug, variant) : getPrimaryImage(slug);
  if (!entry) return `${IMAGE_BASE}/nfcplate-google-review-stand-black-front.png`;
  return getImagePath(entry);
}

export function getAltForSlug(slug: string, variant?: string): string {
  const entry = variant ? getVariantImage(slug, variant) : getPrimaryImage(slug);
  return entry?.alt ?? 'NFCPlate product';
}

export { manifest as productMediaManifest };
