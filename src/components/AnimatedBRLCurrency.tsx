import { SlidingNumber } from "./animate-ui/text/sliding-number";

type Props = {
  value: number | string;
  className?: string;
};

export function AnimatedBRLCurrency({ value, className = "" }: Props) {
  const number = typeof value === "string" ? Number(value) : value;

  if (isNaN(number)) return <span className={className}>Valor inválido</span>;

  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number); // Ex: "R$ 12.134,99"

  return (
    <span className={`inline-flex items-baseline gap-0.5 ${className}`}>
      {formatted}
    </span>
  );
}
