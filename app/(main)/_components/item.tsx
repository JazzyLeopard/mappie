import { LucideIcon } from "lucide-react";
import React from "react";

interface ItemProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

const Item = ({ label, onClick, icon: Icon }: ItemProps) => {
  return (
    <div
      className="group min-h-[27px] mt-2 flex items-center text-muted-foregroundfont-medium text-sm py-1 pr-3 w-full hover:bg-primary/5"
      style={{ paddingLeft: "12px" }}
      onClick={onClick}
      role="button"
    >
      <Icon className="shrink-0 h-[18px] mr-2 text-muted-foreground" />
      <span className="truncate">{label}</span>
    </div>
  );
};

export default Item;
