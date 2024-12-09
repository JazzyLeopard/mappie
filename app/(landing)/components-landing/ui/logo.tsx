import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className="inline-flex" aria-label="Mappie">
      <Image src="/Mappie4x.png" alt="Logo" width={100} height={100} />
    </Link>
  );
}
