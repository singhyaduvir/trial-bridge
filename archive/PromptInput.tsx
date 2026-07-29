"use client";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function PromptInput({ value, onChange }: Props) {
  return (
    <textarea
      className="w-full border p-2 rounded"
      placeholder="Enter text…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
