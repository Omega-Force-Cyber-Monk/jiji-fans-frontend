"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, FreeMode } from "swiper/modules";
import Container from "../Container";
import SectionHeading from "../ui/SectionHeading";
import Image from "@/components/ui/CImage";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/free-mode";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useGetPopularChannelsQuery } from "@/redux/features/channel/channel.api";
import { Spin, Empty } from "antd";
import { resolveChannelSlug } from "@/lib/helpers/channelSlug";
import SliderNavigation from "@/components/ui/SliderNavigation";
import type { Swiper as SwiperClass } from "swiper";

interface ChannelSlideProps {
  channel: {
    _id: string;
    name: string;
    avatar: string;
  };
}

const ChannelSlide = ({ channel }: ChannelSlideProps) => {
  const [imageError, setImageError] = useState(false);
  const slug = resolveChannelSlug(channel);
  const href = slug ? `/${slug}` : "/";

  return (
    <article className="group h-full">
      <div className="relative overflow-hidden rounded-xl aspect-square bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm transition-shadow hover:shadow-md">
        {channel?.avatar && !imageError ? (
          <Image
            src={channel?.avatar}
            alt={`${channel.name}'s profile image`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <span
              className="text-4xl font-bold text-gray-400"
              aria-hidden="true"
            >
              {channel.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80 p-5 flex items-end">
          <Link
            href={href}
            className="w-full"
            aria-label={`Visit ${channel.name}'s channel`}
          >
            <button className="flex justify-between items-center px-5 py-2.5 w-full bg-white/10 backdrop-blur-md border border-white/20 outline-none rounded-xl text-white font-medium shadow-lg transition-all hover:bg-white/20 active:scale-95 cursor-pointer">
              <span className="truncate flex-1 text-left">{channel.name}</span>
              <ArrowRightIcon className="size-4 shrink-0 ml-2" />
            </button>
          </Link>
        </div>
      </div>
    </article>
  );
};

const PopularChannels = () => {
  const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(null);

  const { data, isLoading } = useGetPopularChannelsQuery(
    { limit: 10 },
    {
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    },
  );
  const channels = data?.data || [];

  const demoChannels = [
    { _id: "demo-1", name: "Tech Insights", avatar: "/static/demo/channel_1.png" },
    { _id: "demo-2", name: "Culinary Secrets", avatar: "/static/demo/channel_2.png" },
    { _id: "demo-3", name: "Fitness Daily", avatar: "/static/demo/channel_3.png" },
    { _id: "demo-4", name: "Wanderlust Travels", avatar: "/static/demo/channel_4.png" },
    { _id: "demo-5", name: "Gaming Central", avatar: "/static/demo/channel_5.png" },
    { _id: "demo-6", name: "Artistic Vision", avatar: "/static/demo/cover_1.png" },
    { _id: "demo-7", name: "Life Vlogs", avatar: "/static/demo/cover_2.png" },
    { _id: "demo-8", name: "Music Hub", avatar: "/static/demo/video_1.png" },
  ];

  const displayChannels = channels.length > 0 ? channels : demoChannels;

  if (isLoading) {
    return (
      <Container mClassName="">
        <SectionHeading title="Popular Channels" />
        <div className="mt-6 xl:mt-10 flex justify-center items-center py-16">
          <Spin size="large" />
        </div>
      </Container>
    );
  }



  return (
    <Container mClassName="">
      <div className="flex justify-between items-end mb-6 xl:mb-10">
        <SectionHeading title="Popular Channels" />
        <SliderNavigation
          onPrev={() => swiperInstance?.slidePrev()}
          onNext={() => swiperInstance?.slideNext()}
          className="hidden md:flex"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 xl:gap-8">
        {/* Marked blank area on the left */}
        <div className="hidden lg:block lg:col-span-1" />

        <div className="lg:col-span-4 min-w-0">
          <Swiper
            onSwiper={setSwiperInstance}
            modules={[Navigation, Pagination, Autoplay, FreeMode]}
            spaceBetween={20}
            slidesPerView={1.3}
            loop={true}
            speed={800}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            freeMode={{
              enabled: true,
              sticky: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2.5,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 28,
              },
              1280: {
                slidesPerView: 3,
                spaceBetween: 32,
              },
            }}
            className="popular-channels-swiper"
          >
            {displayChannels.map((channel: any) => (
              <SwiperSlide key={channel._id}>
                <ChannelSlide channel={channel} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </Container>
  );
};

export default PopularChannels;
