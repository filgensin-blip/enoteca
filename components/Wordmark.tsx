import Link from "next/link";
import clsx from "clsx";

export function Wordmark({ size = "header", className }: { size?: "header" | "footer"; className?: string }) {
  return (
    <Link href="/" aria-label="Enoteca Ombra, home" className={clsx("wordmark inline-flex flex-col leading-none", className)}>
      <span aria-hidden="true" className="font-body text-[10px] font-medium tracking-[0.32em] text-primary">
        ENOTECA
      </span>
      <span
        aria-hidden="true"
        className={clsx(
          "wordmark-ombra font-display italic font-medium text-ink",
          size === "header" ? "text-[30px] leading-[1]" : "text-[44px] leading-[1]",
        )}
      >
        Ombra
      </span>
    </Link>
  );
}
