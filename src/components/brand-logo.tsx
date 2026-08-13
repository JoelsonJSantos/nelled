import Image from "next/image";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand-logo" aria-label="Nelled Studio">
      <Image
        className="brand-logo-dark"
        src="/nelled-studio-logo-dark.png"
        alt="Nelled Studio"
        width={compact ? 52 : 140}
        height={compact ? 52 : 140}
        priority
      />

      <Image
        className="brand-logo-light"
        src="/nelled-studio-logo-light.png"
        alt=""
        aria-hidden="true"
        width={compact ? 52 : 140}
        height={compact ? 52 : 140}
        priority
      />
    </div>
  );
}