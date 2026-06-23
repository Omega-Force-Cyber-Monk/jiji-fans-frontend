"use client";

import React from "react";
import Image from "next/image";

const creators = [
  { name: "DJ Rave", description: "Live DJ sets and electronic music mixes.", image: "/creator_dj.png" },
  { name: "Jane Cooper", description: "Live sessions and acoustic covers.", image: "/creator_female.png" },
  { name: "Wade Warren", description: "Music production tutorials and tips.", image: "/creator_podcaster.png" },
  { name: "Acoustic Guy", description: "Chill acoustic guitar covers and originals.", image: "/creator_guitarist.png" },
  { name: "Nick Johns", description: "Exclusive music videos and behind the scenes.", image: "/creator_male.png" },
  { name: "Dance Studio", description: "Dance tutorials and performance videos.", image: "/creator_dancer.png" },
  { name: "Open Mic Podcast", description: "In-depth interviews with top musicians.", image: "/creator_singer.png" },
  { name: "Esther Howard", description: "Vocal coaching and performance clips.", image: "/creator_producer.png" },
];

export default function CreatorGrid() {
  return (
    <section className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 w-full">
        {creators.map((creator, index) => (
          <div key={index} className="relative group overflow-hidden aspect-square">
            <Image
              src={creator.image}
              alt={creator.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
              <div>
                <h3 className="text-xl font-medium">{creator.name}</h3>
              </div>

              <div className="flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                <p className="text-sm font-normal text-gray-200">
                  {creator.description}
                </p>
                <button className="w-fit px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-md hover:bg-brand-secondary transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
