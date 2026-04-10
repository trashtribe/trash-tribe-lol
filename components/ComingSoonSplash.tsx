import Image from "next/image";

export function ComingSoonSplash() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-10 bg-black px-6">
      <div className="relative h-48 w-full max-w-lg md:h-64 md:max-w-2xl">
        <Image
          src="/ttt.png"
          alt="Trash Tribe"
          fill
          className="object-contain"
          priority
          sizes="(max-width: 768px) 100vw, 42rem"
        />
      </div>
      <p className="font-mono text-lg tracking-[0.35em] text-white uppercase md:text-xl">
        Coming soon
      </p>
    </div>
  );
}
