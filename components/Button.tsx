import Link from "next/link";
import clsx from "clsx";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
  size?: "md" | "sm";
  className?: string;
  external?: boolean;
  onClick?: () => void;
};

export function Button({ href, children, variant = "primary", size = "md", className, external, onClick }: Props) {
  const classes = clsx("btn", variant === "primary" ? "btn-primary" : "btn-outline", size === "sm" && "btn-sm", className);
  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} onClick={onClick}>
      {children}
    </Link>
  );
}

export function Arrow() {
  return <span aria-hidden="true">→</span>;
}
