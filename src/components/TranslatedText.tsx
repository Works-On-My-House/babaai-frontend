import { useTranslateText } from "@/lib/translation/useTranslateText";

interface TranslatedTextProps {
  text: string;
  className?: string;
  as?: "span" | "p" | "strong";
}

export function TranslatedText({ text, className, as: Tag = "span" }: TranslatedTextProps) {
  const { text: translated, isTranslating } = useTranslateText(text);

  return (
    <Tag className={className} data-translating={isTranslating || undefined}>
      {translated}
    </Tag>
  );
}
