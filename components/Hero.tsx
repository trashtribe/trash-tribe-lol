import Image from "next/image";

export function Hero() {
  return (
    <section
      className="flex min-h-[56vh] w-full items-center justify-center border-b border-[#111111]/10 bg-[#ffffff] px-6 py-12 sm:min-h-[60vh] sm:py-16"
      aria-label="Featured"
    >
      <div className="mx-auto w-full max-w-[min(88vw,440px)] bg-[#ffffff] px-6 py-8 sm:max-w-[min(88vw,520px)] sm:px-10 sm:py-12">
        <Image
          src="/hero-logo.png"
          alt="Classic — retro pink bubble lettering with black shadow"
          width={636}
          height={567}
          className="h-auto w-full object-contain"
          priority
        />
      </div>
    </section>
  );
}
