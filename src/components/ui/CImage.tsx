"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { getImageUrl } from "@/lib/helpers/getImageUrl";

interface CImageProps extends ImageProps {
  fallback?: string;
}

const CImage: React.FC<CImageProps> = ({
  src,
  alt,
  fallback = "/static/demo-image.jpg",
  onError,
  ...props
}) => {
  // Use the helper to format the initial src
  const formattedSrc = getImageUrl(src as string);
  const [imgSrc, setImgSrc] = useState(formattedSrc || fallback);

  // Sync state with src prop changes
  useEffect(() => {
    const updatedSrc = getImageUrl(src as string);
    setImgSrc(updatedSrc || fallback);
  }, [src, fallback]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={(e) => {
        setImgSrc(fallback);
        if (onError) {
          onError(e);
        }
      }}
    />
  );
};

export default CImage;
