import Image from "next/image";

export const Logo = () => {
  return (
    <div className="hidden md:flex items-center gap-x-2">
      <Image src="/logolis.svg" alt="Logo" width="100" height="100" />
    </div>
  );
};
