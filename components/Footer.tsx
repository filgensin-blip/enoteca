import Link from "next/link";
import { siteInfo } from "@/data/site-info";
import { aperitivo } from "@/data/hours";
import { copy } from "@/data/copy";
import { formatHoursCompact } from "@/lib/hours";
import { Wordmark } from "./Wordmark";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-bg-alt">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 md:grid-cols-3 md:gap-10 md:px-10 md:py-20">
        <div>
          <Wordmark size="footer" />
          <p className="mt-4 font-display text-xl italic text-muted">{siteInfo.tagline}</p>
        </div>
        <address className="not-italic text-[15px] leading-7">
          <p className="eyebrow mb-4">Find us</p>
          <p>{siteInfo.address.street}</p>
          <p>
            {siteInfo.address.postcode} {siteInfo.address.city}
          </p>
          <p className="mt-3">
            <a href={`tel:${siteInfo.phone}`} className="link">
              {siteInfo.phoneDisplay}
            </a>
          </p>
          <p>
            <a href={`mailto:${siteInfo.email}`} className="link">
              {siteInfo.email}
            </a>
          </p>
          {siteInfo.socials.map((s) => (
            <p key={s.url}>
              <a href={s.url} className="link" target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
            </p>
          ))}
        </address>
        <div className="text-[15px] leading-7">
          <p className="eyebrow mb-4">Opening hours</p>
          <p className="text-ink">{formatHoursCompact()}</p>
          <p className="mt-3 text-muted">{aperitivo.line}</p>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto flex max-w-[1440px] flex-wrap gap-x-3 gap-y-1 px-5 py-6 text-[13px] text-muted md:px-10">
          <span>
            © {year} {siteInfo.legalName} · KvK {siteInfo.kvk}
          </span>
          <span aria-hidden="true">·</span>
          <Link href="/privacy" className="link link-ink">
            Privacy
          </Link>
          <span aria-hidden="true">·</span>
          <span>{copy.footer.photography}</span>
          <span aria-hidden="true">·</span>
          <span>{copy.footer.ageNote}</span>
        </p>
      </div>
    </footer>
  );
}
