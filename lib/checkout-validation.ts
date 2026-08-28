/**
 * Server-side checkout validation and order calculation.
 *
 * The browser sends only productId (variantId) and quantity.
 * The server re-fetches everything from the authoritative catalog,
 * validates, and computes the final payable amount.
 */

import {
  catalogProducts,
  getCatalogVariant,
  calculateShipping,
  CURRENCY,
  FREE_SHIPPING_THRESHOLD_CENTS,
  STANDARD_SHIPPING_CENTS,
  type CatalogProduct,
  type CatalogVariant,
} from '@/lib/catalog';
import { getMediaForProduct, getPrimaryImage } from '@/lib/product-media';

export interface CheckoutLineInput {
  variantId: string;
  quantity: number;
}

export interface ValidatedLineItem {
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  imagePath: string;
  requiredCodeCount: number;
  bundleComponents?: { productSlug: string; productName: string; quantity: number }[];
}

export interface ValidatedOrder {
  lineItems: ValidatedLineItem[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  itemCount: number;
}

export class CheckoutValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CheckoutValidationError';
  }
}

const MAX_QUANTITY_PER_LINE = 100;
const MAX_TOTAL_ITEMS = 200;

export function validateAndCalculateOrder(lines: CheckoutLineInput[]): ValidatedOrder {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new CheckoutValidationError('Your cart is empty.');
  }

  const validatedItems: ValidatedLineItem[] = [];
  let totalItems = 0;

  for (const line of lines) {
    if (typeof line.quantity !== 'number' || !Number.isFinite(line.quantity)) {
      throw new CheckoutValidationError('Invalid quantity detected.');
    }

    const quantity = Math.trunc(line.quantity);

    if (quantity < 1) {
      throw new CheckoutValidationError('Quantities must be at least 1.');
    }

    if (quantity > MAX_QUANTITY_PER_LINE) {
      throw new CheckoutValidationError(`Quantity for any item cannot exceed ${MAX_QUANTITY_PER_LINE}.`);
    }

    totalItems += quantity;

    if (totalItems > MAX_TOTAL_ITEMS) {
      throw new CheckoutValidationError(`Total items cannot exceed ${MAX_TOTAL_ITEMS}.`);
    }

    // Find variant across all products
    let foundProduct: CatalogProduct | undefined;
    let foundVariant: CatalogVariant | undefined;

    for (const product of catalogProducts) {
      const variant = product.variants.find((v) => v.id === line.variantId);
      if (variant) {
        foundProduct = product;
        foundVariant = variant;
        break;
      }
    }

    if (!foundProduct || !foundVariant) {
      throw new CheckoutValidationError('An item in your cart is no longer available.');
    }

    if (!foundVariant.inStock || !foundProduct.inStock) {
      throw new CheckoutValidationError(`${foundProduct.name} is currently out of stock.`);
    }

    if (foundVariant.priceCents <= 0) {
      throw new CheckoutValidationError(`${foundProduct.name} cannot be purchased at this time.`);
    }

    const imagePath = foundVariant.imageVariant
      ? `/images/products/${getImageFilename(foundProduct.slug, foundVariant.imageVariant)}`
      : `/images/products/${getImageFilename(foundProduct.slug, 'primary')}`;

    validatedItems.push({
      productId: foundProduct.id,
      productSlug: foundProduct.slug,
      productName: foundProduct.name,
      variantId: foundVariant.id,
      variantName: foundVariant.name,
      sku: foundVariant.sku,
      unitPriceCents: foundVariant.priceCents,
      quantity,
      lineTotalCents: foundVariant.priceCents * quantity,
      imagePath,
      requiredCodeCount: foundProduct.bundleComponents
        ? foundProduct.bundleComponents.reduce((sum, c) => sum + c.quantity, 0) * quantity
        : quantity,
      bundleComponents: foundProduct.bundleComponents,
    });
  }

  const subtotalCents = validatedItems.reduce((sum, item) => sum + item.lineTotalCents, 0);
  const shippingCents = calculateShipping(subtotalCents);
  const taxCents = 0;
  const totalCents = subtotalCents + shippingCents + taxCents;

  return {
    lineItems: validatedItems,
    subtotalCents,
    shippingCents,
    taxCents,
    totalCents,
    currency: CURRENCY,
    itemCount: totalItems,
  };
}

function getImageFilename(slug: string, variantKey: string): string {
  if (variantKey === 'primary') {
    const entry = getPrimaryImage(slug);
    return entry?.filename ?? 'nfcplate-google-review-stand-black-front.png';
  }
  const media = getMediaForProduct(slug);
  const entry = media.find((m) => m.variant === variantKey) ?? getPrimaryImage(slug);
  return entry?.filename ?? 'nfcplate-google-review-stand-black-front.png';
}

export { FREE_SHIPPING_THRESHOLD_CENTS, STANDARD_SHIPPING_CENTS };
