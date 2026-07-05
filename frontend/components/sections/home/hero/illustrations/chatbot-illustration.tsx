import Image from "next/image";

const ChatbotIllustration = () => {
  return (
    <div className="relative mx-auto h-[360px] w-full max-w-[640px] overflow-hidden rounded-[28px]">
      {/* Grid SVG background */}
      <Image
        src="/illustrations/template-grid-light.svg"
        alt=""
        fill
        sizes="(min-width: 640px) 640px, 100vw"
        className="object-cover dark:hidden"
      />

      <Image
        src="/illustrations/template-grid-dark.svg"
        alt=""
        fill
        sizes="(min-width: 640px) 640px, 100vw"
        className="hidden object-cover dark:block"
      />

      {/* Vercel-like fade/glow layer */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(30deg,rgba(255,255,255,0.1)_-20%,transparent_70%),linear-gradient(220deg,rgba(255,255,255,0.1)_-10%,transparent_40%)]" />

      {/* Center window */}
      <div className="absolute left-1/2 top-1/2 w-[min(86%,460px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.16)] dark:border-white/15 dark:bg-[#0a0a0a] dark:shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        {/* Browser bar */}
        <div className="flex h-9 items-center gap-1.5 border-b border-black/10 bg-[#fafafa] px-3 dark:border-white/10 dark:bg-[#111]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#d4d4d4] dark:bg-[#333]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#d4d4d4] dark:bg-[#333]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#d4d4d4] dark:bg-[#333]" />
        </div>

        {/* Inner UI */}
        <div className="bg-white p-3 dark:bg-[#0a0a0a]">
          <Image
            src="/illustrations/chatbot-visual-light.svg"
            alt=""
            width={920}
            height={560}
            sizes="(min-width: 640px) 430px, 74vw"
            className="block w-full dark:hidden"
          />

          <Image
            src="/illustrations/chatbot-visual-dark.svg"
            alt=""
            width={920}
            height={560}
            sizes="(min-width: 640px) 430px, 74vw"
            className="hidden w-full dark:block"
          />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};

export default ChatbotIllustration;
