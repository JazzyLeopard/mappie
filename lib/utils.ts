import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCaretCoordinates(element: HTMLTextAreaElement, position: number) {
  const div = document.createElement('div');
  const styles = getComputedStyle(element);
  
  div.style.position = 'absolute';
  div.style.top = '0';
  div.style.left = '0';
  div.style.visibility = 'hidden';
  div.style.whiteSpace = 'pre-wrap';
  div.style.font = styles.font;
  div.style.padding = styles.padding;
  
  const text = element.value.slice(0, position);
  div.textContent = text;
  
  document.body.appendChild(div);
  const coordinates = {
    top: div.offsetHeight,
    left: div.offsetWidth
  };
  document.body.removeChild(div);
  
  return coordinates;
}
