import Image from "next/image";
import clsx from "clsx";
import type { Photo as PhotoData } from "@/data/types";

type Props = {
  photo: PhotoData;
  sizes: string;
  /** Hero only. Next.js 16 replaced `priority` with `preload`. */
  priority?: boolean;
  /** Background mode: fills the nearest positioned parent. The parent provides `relative` and a height. */
  fill?: boolean;
  className?: string;
  ratio?: string;
  frame?: boolean;
  alt?: string;
};

export function Photo({ photo, sizes, priority, fill, className, ratio, frame, alt }: Props) {
  const img = (
    <Image
      src={photo.src}
      alt={alt ?? photo.alt}
      fill
      sizes={sizes}
      preload={priority}
      placeholder="blur"
      blurDataURL={photo.blurDataURL}
      className={clsx("object-cover", !fill && "photo-img")}
      style={{ objectPosition: photo.objectPosition ?? "center" }}
    />
  );

  if (fill) {
    // No `relative` here: that class collapsed the LØV hero to 0 height.
    return <div className={clsx("absolute inset-0 overflow-hidden", className)}>{img}</div>;
  }

  return (
    <div
      className={clsx("photo-zoom relative overflow-hidden bg-bg-alt", frame && "frame-inset", className)}
      style={{ aspectRatio: ratio ?? `${photo.width}/${photo.height}` }}
    >
      {img}
    </div>
  );
}
