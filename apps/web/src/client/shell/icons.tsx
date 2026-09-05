import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9.5h16" />
      <path d="M8 3.5v3M16 3.5v3" />
    </svg>
  );
}

export function InboxIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12h4l1.5 3h5L16 12h4" />
      <path d="M5.5 5h13L20 12v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6L5.5 5Z" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <circle cx="17.5" cy="9.5" r="2.3" />
      <path d="M15.8 13a4.3 4.3 0 0 1 4.7 4.3" />
    </svg>
  );
}

export function CircleUsersIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="10" r="5.2" />
      <circle cx="15" cy="14" r="5.2" />
    </svg>
  );
}

export function CompassIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M14.5 9.5 13 13l-3.5 1.5L11 11l3.5-1.5Z" />
    </svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 10a6 6 0 1 1 12 0v4.5l1.5 2.5h-15L6 14.5Z" />
      <path d="M10 19.5a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.2-1.6l2-1.4-1.5-2.6-2.3.8a7 7 0 0 0-2.8-1.6L14 3h-4l-.2 2.6a7 7 0 0 0-2.8 1.6l-2.3-.8-1.5 2.6 2 1.4A7 7 0 0 0 5 12c0 .5 0 1.1.2 1.6l-2 1.4 1.5 2.6 2.3-.8a7 7 0 0 0 2.8 1.6L10 21h4l.2-2.6a7 7 0 0 0 2.8-1.6l2.3.8 1.5-2.6-2-1.4c.1-.5.2-1 .2-1.6Z" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
