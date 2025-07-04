import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  value: string;
  onChange: (type: string) => void;
  allTypes: string[];
}

export function TypeSelector({ value, onChange, allTypes }: Props) {
  const [input, setInput] = useState("");

  // Preenche o input quando muda o tipo externo
  useEffect(() => {
    setInput(value);
  }, [value]);

  const handleSelect = (selected: string) => {
    onChange(selected);
    setInput(selected);
  };

  return (
    <div className="flex flex-1 flex-col gap-2">
      <Label htmlFor="expense-type">Tipo de Gasto</Label>

      {/* Chips de tipos já usados */}
      <div className="flex flex-wrap gap-2 p-2 rounded-md border bg-muted max-h-32 overflow-y-auto">
        {allTypes && allTypes.length > 0 ? (
          allTypes.map((type) => (
            <div
              key={type}
              onClick={() => handleSelect(type)}
              className={`px-3 py-1 text-sm rounded-full cursor-pointer border ${
                value === type
                  ? "bg-primary text-white border-primary"
                  : "bg-background hover:border-muted-foreground"
              }`}
            >
              {type}
            </div>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">
            Sem tipos cadastrados
          </span>
        )}
      </div>

      {/* Input para novo tipo */}
      <div className="relative mt-2">
        <Input
          id="expense-type"
          placeholder="Novo tipo..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            onChange(e.target.value);
          }}
          autoComplete="off"
        />
      </div>
    </div>
  );
}
