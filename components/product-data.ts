import { formatEuro } from "@/lib/format-currency";
import type { StoreProduct } from "@/lib/products";

export type Product = StoreProduct;

type ProductSeed = Omit<StoreProduct, "slug" | "price" | "originalPrice">;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function euroStringToCents(euroLabel: string): number {
  const normalized = euroLabel.replace(/[^0-9.,]/g, "").replace(",", ".");
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

let VARIANT_ID_SEQ = 880_001;

function nextVariantIds(count: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    VARIANT_ID_SEQ += 1;
    out.push(VARIANT_ID_SEQ);
  }
  return out;
}

function apparelVariants(priceEur: string): StoreProduct["variants"] {
  const ids = nextVariantIds(4);
  const cents = euroStringToCents(priceEur);
  const sizes = ["S", "M", "L", "XL"];
  return sizes.map((size, idx) => ({
    id: ids[idx]!,
    title: size,
    isAvailable: true,
    price: cents,
  }));
}

function oneVariant(priceEur: string): StoreProduct["variants"] {
  const ids = nextVariantIds(1);
  return [
    {
      id: ids[0]!,
      title: "One size",
      isAvailable: true,
      price: euroStringToCents(priceEur),
    },
  ];
}

const productSeeds: ProductSeed[] = [
  {
    id: "p-1",
    name: "Heart character keychain",
    description:
      "Chrome heart charm set with a polished finish and chunky chain hardware. Small, loud accessory that clips onto keys, totes, and belt loops.",
    imageSrc: "/products/heart-keychain.png",
    imageAlt: "Red heart character keychain with silver chain and split ring",
    galleryImages: [
      "/products/heart-keychain.png",
      "/products/keychain-star.png",
      "/products/heart-keychain.png",
      "/products/keychain-star.png",
    ],
    category: "ACCESSORIES",
    variants: oneVariant("€22"),
    saleTag: "SALE",
  },
  {
    id: "p-2",
    name: "Vagitarian graphic tee",
    description:
      "Heavyweight cotton tee with a saturated front print and relaxed fit. Made for everyday wear with bold artwork that stays crisp after washes.",
    imageSrc: "/products/tee-vagitarian.png",
    imageAlt: "Black t-shirt with rainbow gradient Vagitarian graphic",
    galleryImages: [
      "/products/tee-vagitarian.png",
      "/products/tee-lesbians.png",
      "/products/tee-vagitarian.png",
      "/products/tee-lesbians.png",
    ],
    category: "APPAREL",
    variants: apparelVariants("€48"),
  },
  {
    id: "p-3",
    name: "Pop art print — collage",
    description:
      "Museum-style poster print on thick matte stock with rich contrast and punchy color. Designed to be framed or taped straight onto your wall.",
    imageSrc: "/products/art-collage.png",
    imageAlt: "Colorful pop art collage print with bold lettering",
    galleryImages: [
      "/products/art-collage.png",
      "/products/classic-type.png",
      "/products/art-collage.png",
      "/products/classic-type.png",
    ],
    category: "POSTERS",
    variants: oneVariant("€38"),
    saleTag: "NEW",
  },
  {
    id: "p-4",
    name: "Y2K star keychain",
    description:
      "Polished star charm inspired by early-2000s accessories. Lightweight metal build with secure clasp and enough edge for daily carry.",
    imageSrc: "/products/keychain-star.png",
    imageAlt: "Polished silver four-point star keychain with clasp",
    galleryImages: [
      "/products/keychain-star.png",
      "/products/heart-keychain.png",
      "/products/keychain-star.png",
      "/products/heart-keychain.png",
    ],
    category: "ACCESSORIES",
    variants: oneVariant("€18"),
  },
  {
    id: "p-5",
    name: "Lesbians eat what? tee",
    description:
      "Statement tee with front graphic print, soft touch fabric, and structured collar. Street-ready silhouette with an oversized attitude.",
    imageSrc: "/products/tee-lesbians.png",
    imageAlt: "Black tee with pink text and cartoon cats graphic",
    galleryImages: [
      "/products/tee-lesbians.png",
      "/products/tee-vagitarian.png",
      "/products/tee-lesbians.png",
      "/products/tee-vagitarian.png",
    ],
    category: "APPAREL",
    variants: apparelVariants("€48"),
  },
  {
    id: "p-6",
    name: "Pink embroidered cap",
    description:
      "Classic six-panel cap with curved brim and contrast embroidery. Adjustable back closure and broken-in fit from first wear.",
    imageSrc: "/products/cap-pink.png",
    imageAlt: "Bubblegum pink baseball cap with black embroidered text",
    galleryImages: [
      "/products/cap-pink.png",
      "/products/tee-lesbians.png",
      "/products/cap-pink.png",
      "/products/tee-vagitarian.png",
    ],
    category: "APPAREL",
    variants: apparelVariants("€36"),
    saleTag: "-20%",
  },
  {
    id: "p-7",
    name: "Classic type poster",
    description:
      "Bold typographic poster designed for minimal rooms and maximal attitude. Printed in high definition on durable matte poster paper.",
    imageSrc: "/products/classic-type.png",
    imageAlt: "Typography poster with bold centered lettering",
    galleryImages: [
      "/products/classic-type.png",
      "/products/art-collage.png",
      "/products/classic-type.png",
      "/products/art-collage.png",
    ],
    category: "POSTERS",
    variants: oneVariant("€34"),
  },
  {
    id: "p-8",
    name: "Collage print XL",
    description:
      "Large-format collage print for statement walls. Crisp detail and saturated tones keep artwork punchy from every corner of the room.",
    imageSrc: "/products/art-collage.png",
    imageAlt: "Large colorful collage print with layered shapes",
    galleryImages: [
      "/products/art-collage.png",
      "/products/classic-type.png",
      "/products/art-collage.png",
      "/products/classic-type.png",
    ],
    category: "POSTERS",
    variants: oneVariant("€44"),
    saleTag: "SALE",
  },
  {
    id: "p-9",
    name: "Classic type mini print",
    description:
      "Compact print for desks, shelves, and gallery walls. Same sharp type treatment as the full-size version in a small footprint.",
    imageSrc: "/products/classic-type.png",
    imageAlt: "Small format typography print",
    galleryImages: [
      "/products/classic-type.png",
      "/products/art-collage.png",
      "/products/classic-type.png",
      "/products/art-collage.png",
    ],
    category: "POSTERS",
    variants: oneVariant("€22"),
  },
  {
    id: "p-10",
    name: "Star chain charm",
    description:
      "Mini star charm with polished hardware and lightweight chain. Ideal add-on for keys, backpacks, and zipped pouches.",
    imageSrc: "/products/keychain-star.png",
    imageAlt: "Metal star keychain accessory",
    galleryImages: [
      "/products/keychain-star.png",
      "/products/heart-keychain.png",
      "/products/keychain-star.png",
      "/products/heart-keychain.png",
    ],
    category: "ACCESSORIES",
    variants: oneVariant("€16"),
    saleTag: "NEW",
  },
  {
    id: "p-11",
    name: "Heart charm duo",
    description:
      "Set of two matching charms built to stack together or split with a friend. Durable rings and polished surfaces keep them clean.",
    imageSrc: "/products/heart-keychain.png",
    imageAlt: "Double heart keychain set",
    galleryImages: [
      "/products/heart-keychain.png",
      "/products/keychain-star.png",
      "/products/heart-keychain.png",
      "/products/keychain-star.png",
    ],
    category: "ACCESSORIES",
    variants: oneVariant("€28"),
  },
  {
    id: "p-12",
    name: "Graphic tee mono",
    description:
      "Monochrome graphic tee with soft heavyweight cotton and dropped shoulders. Easy layering piece built for all-season rotation.",
    imageSrc: "/products/tee-vagitarian.png",
    imageAlt: "Graphic t-shirt with monochrome styling",
    galleryImages: [
      "/products/tee-vagitarian.png",
      "/products/tee-lesbians.png",
      "/products/tee-vagitarian.png",
      "/products/tee-lesbians.png",
    ],
    category: "APPAREL",
    variants: apparelVariants("€42"),
    saleTag: "SALE",
  },
];

export const products: StoreProduct[] = productSeeds.map((product) => {
  const slug = slugify(product.name);
  const prices = product.variants.map((v) => v.price);
  const avail = product.variants.filter((v) => v.isAvailable).map((v) => v.price);
  const pool = avail.length > 0 ? avail : prices;
  const min = Math.min(...pool);
  const max = Math.max(...prices);
  const price = formatEuro(min / 100);
  const originalPrice = max > min ? formatEuro(max / 100) : price;
  return { ...product, slug, price, originalPrice };
});
