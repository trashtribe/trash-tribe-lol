import Image from "next/image";

export function Hero() {
  return (
    <section
      className="flex min-h-[56vh] w-full items-center justify-center border-b border-[#111111]/10 bg-background px-6 py-12 sm:min-h-[60vh] sm:py-16"
      aria-label="Featured"
    >
      <div className="mx-auto w-full max-w-[min(92vw,900px)]">
        <Image
          src="/trashtribe%20logo%20final.png"
          alt="Trash Tribe"
          width={1400}
          height={900}
          className="h-auto w-full object-contain"
          priority
        />
      </div>
    </section>
  );
}
