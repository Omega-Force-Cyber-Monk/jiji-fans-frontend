import Link from "next/link";
import Image from "@/components/ui/CImage";
import type { TChannel } from "@/redux/features/channel/channel.api";

interface ChannelCardProps {
  channel: TChannel;
}

const ChannelCard = ({ channel }: ChannelCardProps) => {
  return (
    <Link
      href={`/overview/channels/${channel._id}`}
      className="relative block aspect-[4/5] w-full overflow-hidden rounded-lg group border border-border-primary/20 bg-secondary-bg transition-all duration-300 hover:border-brand-primary/50 hover:shadow-lg hover:shadow-brand-primary/5 hover:-translate-y-1.5"
    >
      {/* 1. Full-Bleed Grayscale-to-Color Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={channel.avatar}
          alt={channel.name}
          fill
          className="object-cover transition-all duration-700 ease-out group-hover:scale-115 filter grayscale contrast-110 group-hover:grayscale-0 brightness-[0.8] group-hover:brightness-100"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 20vw"
        />
        {/* Premium Dark Gradient Mask overlaying bottom content */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10 opacity-90 group-hover:opacity-95 transition-opacity" />
      </div>

      {/* 2. Top-Right: Glassmorphic Quick-Action Arrow Badge */}
      <div className="absolute top-4 right-4 w-8 h-8 rounded-md bg-secondary-bg/30 backdrop-blur-md border border-white/10 text-white flex items-center justify-center opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-brand-primary">
          <path fillRule="evenodd" d="M8.25 3.75H19.5a.75.75 0 0 1 .75.75v11.25a.75.75 0 0 1-1.5 0V6.81L5.03 20.53a.75.75 0 0 1-1.06-1.06L17.69 5.25H8.25a.75.75 0 0 1 0-1.5Z" clipRule="evenodd" />
        </svg>
      </div>

      {/* 3. Bottom: Premium Overlay Typography */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-3 sm:p-4 flex flex-col justify-end transition-all duration-300 ease-out">
        {/* Tiny Rotating Active Diamond Accent */}
        <div className="w-4 h-1.5 rounded-sm bg-brand-primary/80 group-hover:bg-brand-primary transition-colors mb-2" />

        <div className="flex flex-col">
          <h4 className="text-base sm:text-xl font-semibold text-white tracking-wide line-clamp-1 group-hover:text-brand-primary transition-colors">
            {channel.name}
          </h4>

          {/* Sub-text that smoothly slides up and reveals details only on hover using grid animation */}
          <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out opacity-0 group-hover:opacity-100">
            <div className="overflow-hidden">
              <p className="text-xs sm:text-sm text-muted-text line-clamp-2 leading-relaxed pt-1 sm:pt-1.5">
                {channel.description || "View exclusive studio broadcasts and creator content."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ChannelCard;
