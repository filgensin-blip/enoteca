import type { Metadata } from "next";
import { copy } from "@/data/copy";
import { photos } from "@/data/photos";
import { siteInfo } from "@/data/site-info";
import { BookingForm } from "@/components/BookingForm";
import { HoursList } from "@/components/HoursList";
import { Photo } from "@/components/Photo";

export const metadata: Metadata = {
  title: "Book a table",
  description: "Reserve a table at Enoteca Ombra in Maastricht for 1 to 10 guests, up to 90 days ahead.",
  alternates: { canonical: "/book" },
};

export default function BookPage() {
  return (
    <div className="bg-bg pb-24 pt-16 md:pb-36 md:pt-24">
      <div className="mx-auto grid max-w-[1440px] gap-16 px-5 md:grid-cols-12 md:gap-10 md:px-10">
        <div className="md:col-span-7">
          <p className="eyebrow">Prenota</p>
          <h1 className="h-hero mt-6 text-ink">{copy.book.title}</h1>
          <p className="prose-width mt-6 text-lg text-ink/90">{copy.book.intro}</p>
          <div className="mt-12">
            <BookingForm />
          </div>
        </div>
        <aside className="md:col-span-4 md:col-start-9" aria-label="Opening hours and contact">
          <Photo photo={photos.book} ratio="4/5" sizes="(min-width: 768px) 30vw, 100vw" />
          <h2 className="mt-10 font-display text-3xl text-ink">Opening hours</h2>
          <HoursList compact className="mt-5" />
          <address className="mt-8 not-italic leading-7">
            <p>{siteInfo.address.street}</p>
            <p>
              {siteInfo.address.postcode} {siteInfo.address.city}
            </p>
            <p className="mt-2">
              <a href={`tel:${siteInfo.phone}`} className="link">
                {siteInfo.phoneDisplay}
              </a>
            </p>
          </address>
          <p className="mt-6 font-display text-xl italic text-muted">{copy.book.walkIn}</p>
        </aside>
      </div>
    </div>
  );
}
