"use client";

type Props = {
  onClick: () => void;
  disabled?: boolean;
};

export default function RunButton({ onClick, disabled }: Props) {
  return (
    <button
      className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      onClick={onClick}
      disabled={disabled}
    >
      Run
    </button>
  );
}
