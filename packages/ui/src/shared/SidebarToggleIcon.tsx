import React from "react";

const SidebarToggleIcon = () => {
  return (
    <svg
      viewBox="0 0 22 18"
      className="w-[22px] h-[20px] text-black"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* outer rectangle */}
      <rect
        x="1.25"
        y="1.25"
        width="15.5"
        height="16.5"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* divider */}
      <line x1="6" y1="1.5" x2="6" y2="18.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
};

export default SidebarToggleIcon;
