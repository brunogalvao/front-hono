import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

interface Props {
  value: string;
  onChange: (type: string) => void;
  allTypes: string[];
}

export function TypeSelector({ value, onChange, allTypes }: Props) {
  const [input, setInput] = useState('');

  // Preenche o input quando muda o tipo externo
  useEffect(() => {
    setInput(value);
  }, [value]);

  const handleSelect = (selected: string) => {
    onChange(selected);
    setInput(selected);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {/* Chips de tipos já usados */}
      <div
        className="bg-muted flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded-md border p-2"
        role="group"
        aria-label="Tipos de gasto disponíveis"
      >
        {allTypes && allTypes.length > 0 ? (
          allTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleSelect(type)}
              className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors ${
                value === type
                  ? 'bg-primary border-primary text-white'
                  : 'bg-background hover:border-muted-foreground hover:bg-muted'
              }`}
              aria-pressed={value === type}
            >
              {type}
            </button>
          ))
        ) : (
          <span className="text-muted-foreground text-sm">
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
          aria-describedby="expense-type-description"
        />
        <div id="expense-type-description" className="sr-only">
          Digite um novo tipo de gasto ou selecione um dos tipos disponíveis
          acima
        </div>
      </div>
    </div>
  );
}
