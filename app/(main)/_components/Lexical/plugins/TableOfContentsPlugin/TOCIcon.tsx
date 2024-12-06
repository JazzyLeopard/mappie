import { cn } from "@/lib/utils";

interface TOCIconProps {
  className?: string;
}

export function TOCIcon({ className }: TOCIconProps) {
  return (
    <div className={cn("w-5 h-auto flex flex-col justify-center gap-[10px] group", className)}>
      {/* Top rectangle */}
      <div className="w-full h-[2px] bg-gray-600 group-hover:bg-gray-800 transition-all duration-300" />
      
      {/* Upper middle rectangle */}
      <div className="w-[80%] h-[2px] bg-gray-600 group-hover:bg-gray-800 transition-all duration-300" />
      
      {/* Middle rectangle */}
      <div className="w-[60%] h-[2px] bg-gray-600 group-hover:bg-gray-800 transition-all duration-300" />
      
      {/* Lower middle rectangle */}
      <div className="w-[80%] h-[2px] bg-gray-600 group-hover:bg-gray-800 transition-all duration-300" />
      
      {/* Bottom rectangle */}
      <div className="w-full h-[2px] bg-gray-600 group-hover:bg-gray-800 transition-all duration-300" />
    </div>
  );
} 