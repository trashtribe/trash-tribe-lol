export type Product = {
  id: string;
  name: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
};

export const products: Product[] = [
  {
    id: "p-1",
    name: "Heart character keychain",
    price: "€22",
    imageSrc: "/products/heart-keychain.png",
    imageAlt: "Red heart character keychain with silver chain and split ring",
  },
  {
    id: "p-2",
    name: "Vagitarian graphic tee",
    price: "€48",
    imageSrc: "/products/tee-vagitarian.png",
    imageAlt: "Black t-shirt with rainbow gradient Vagitarian graphic",
  },
  {
    id: "p-3",
    name: "Pop art print — collage",
    price: "€38",
    imageSrc: "/products/art-collage.png",
    imageAlt: "Colorful pop art collage print with bold lettering",
  },
  {
    id: "p-4",
    name: "Y2K star keychain",
    price: "€18",
    imageSrc: "/products/keychain-star.png",
    imageAlt: "Polished silver four-point star keychain with clasp",
  },
  {
    id: "p-5",
    name: "Lesbians eat what? tee",
    price: "€48",
    imageSrc: "/products/tee-lesbians.png",
    imageAlt: "Black tee with pink text and cartoon cats graphic",
  },
  {
    id: "p-6",
    name: "Pink embroidered cap",
    price: "€36",
    imageSrc: "/products/cap-pink.png",
    imageAlt: "Bubblegum pink baseball cap with black embroidered text",
  },
];
