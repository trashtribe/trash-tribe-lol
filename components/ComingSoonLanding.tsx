import Image from "next/image";

import { ComingSoonNotifyForm } from "@/components/ComingSoonNotifyForm";

export function ComingSoonLanding() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-white px-6">
      <div className="relative h-40 w-full max-w-md sm:h-48 md:h-56 md:max-w-xl">
        <Image
          src="/ttt.png"
          alt="Trash Tribe"
          fill
          className="object-contain"
          priority
          sizes="(max-width: 768px) 100vw, 36rem"
        />
      </div>
      <p className="text-center font-mono text-base tracking-[0.35em] text-black uppercase sm:text-lg">
        COMING SOON
      </p>
      <p className="text-center font-mono text-sm text-black">
        <a href="mailto:hello@trashtribe.lol">hello@trashtribe.lol</a>
      </p>
      <ComingSoonNotifyForm />
    </div>
  );
}
