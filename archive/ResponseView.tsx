type Props = {
  text: string;
};

export default function ResponseView({ text }: Props) {
  if (!text) return null;

  return (
    <pre className="whitespace-pre-wrap border p-3 rounded bg-gray-50">
      {text}
    </pre>
  );
}
