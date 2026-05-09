import Image from "next/image";

import { ComingSoonNotifyForm } from "@/components/ComingSoonNotifyForm";

export function ComingSoonLanding() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-white px-6">
      <div style={{ width: 300, height: 180, position: 'relative' }} className="sm:w-[380px] sm:h-[228px] md:w-[460px] md:h-[276px]">
        <Image
          src="/ttt.png"
          alt="Trash Tribe"
          fill
          className="object-contain"
          priority
          sizes="(max-width: 768px) 300px, (max-width: 1024px) 380px, 460px"
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
