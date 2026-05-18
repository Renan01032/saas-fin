import { T } from "../constants";

export default function SnakeLogo({ size = 32, animate = false }) {
  const anim = (delay) =>
    animate ? { animation: `snakeDraw 1.5s ${delay} ease forwards` } : {};
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M12 48 C12 36,28 36,28 28 C28 20,44 20,44 12"
        stroke={T.green} strokeWidth="6" strokeLinecap="round"
        strokeDasharray="300" strokeDashoffset={animate ? "300" : "0"}
        style={anim("0s")} />
      <path d="M44 12 C44 4,56 4,56 12 C56 20,44 20,44 28 C44 36,56 36,56 44"
        stroke={T.green} strokeWidth="6" strokeLinecap="round"
        strokeDasharray="300" strokeDashoffset={animate ? "300" : "0"}
        style={anim(".2s")} />
      <ellipse cx="53" cy="48" rx="7" ry="5" fill={T.green} />
      <circle cx="56" cy="46" r="1.5" fill={T.bg} />
      <path d="M46 48 L42 47 M42 47 L40 45 M42 47 L40 49"
        stroke={T.green} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
