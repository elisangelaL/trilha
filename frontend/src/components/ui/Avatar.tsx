import Image from "next/image";

export function Avatar({ initials, src, size = 32 }: { initials: string; src?: string | null; size?: number }) {
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.36, position: "relative", overflow: "hidden" }}>
      {src ? <Image src={src} alt="" fill style={{ objectFit: "cover" }} unoptimized /> : initials}
    </div>
  );
}
