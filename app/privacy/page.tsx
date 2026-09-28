import type { Metadata } from "next";
import Link from "next/link";
import { siteInfo } from "@/data/site-info";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Enoteca Ombra handles the details you give us when you book a table. Plain language, no tracking.",
  alternates: { canonical: "/privacy" },
};

// PLACEHOLDER — legal name, KvK, address and retention period are test values; client to confirm.
const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "Who we are",
    body: (
      <p>
        {siteInfo.legalName} (KvK {siteInfo.kvk}), {siteInfo.address.street}, {siteInfo.address.postcode}{" "}
        {siteInfo.address.city}. We run Enoteca Ombra and this website.
      </p>
    ),
  },
  {
    title: "What the booking form collects",
    body: <p>Your name, email address, phone number (if you give it), the date, time and number of guests, and any notes you add, such as allergies.</p>,
  },
  {
    title: "Why",
    body: <p>Only to handle your reservation: to confirm it, to contact you if something changes, and to have your table ready.</p>,
  },
  {
    title: "Where it goes",
    body: (
      <p>
        Your booking is sent by email via Resend, our email provider, to our own inbox, with a confirmation to you. Our hosting provider keeps
        technical server logs, including a record of the booking, for about 30 days.
      </p>
    ),
  },
  {
    title: "How long we keep it",
    body: <p>As long as we need it to handle your booking. Booking emails are deleted within 12 months.</p>,
  },
  {
    title: "No tracking",
    body: (
      <p>
        This website uses no tracking cookies and no analytics. The map on our contact page only loads Google Maps after you click
        &ldquo;Show map&rdquo;; until then, nothing is sent to Google.
      </p>
    ),
  },
  {
    title: "Your rights",
    body: (
      <p>
        You can ask to see, correct or delete the details we hold about you. Email us at{" "}
        <a href={`mailto:${siteInfo.email}`} className="link">
          {siteInfo.email}
        </a>{" "}
        and we&rsquo;ll reply within a month. You can also complain to the Autoriteit Persoonsgegevens, the Dutch data protection authority.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-bg pb-24 pt-16 md:pb-36 md:pt-24">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <p className="eyebrow">Enoteca Ombra</p>
        <h1 className="h-hero mt-6 text-ink">Privacy</h1>
        <p className="mt-6 text-muted">Last updated: 28 September 2026</p>
        <div className="mt-14 max-w-[64ch] divide-y divide-line border-y border-line">
          {sections.map((s) => (
            <section key={s.title} className="py-8">
              <h2 className="font-display text-[28px] leading-tight text-ink">{s.title}</h2>
              <div className="mt-3 text-ink/90">{s.body}</div>
            </section>
          ))}
        </div>
        <p className="mt-10">
          <Link href="/book" className="link font-medium">
            Back to booking <span aria-hidden="true">→</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
