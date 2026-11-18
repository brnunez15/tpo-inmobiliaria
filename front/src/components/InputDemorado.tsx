import { useEffect, useState, type InputHTMLAttributes } from "react";
import { useDebounce } from "../hooks/useDebounce";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  value: string; // el valor "oficial" (el que vive en la URL)
  onConfirmar: (valor: string) => void; // se llama cuando el usuario dejó de escribir
  ms?: number;
};

export function InputDemorado({ value, onConfirmar, ms = 400, ...resto }: Props) {
  // Lo que se ve en el input, letra por letra
  const [texto, setTexto] = useState(value);
  // Lo mismo, pero recién cuando pasaron `ms` sin cambios
  const demorado = useDebounce(texto, ms);

  // Cuando el texto demorado cambia y es distinto del oficial, se avisa.
  // La comparación evita avisar de más (por ejemplo, en el primer render).
  useEffect(() => {
    if (demorado !== value) onConfirmar(demorado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demorado]);

  // Si el valor oficial cambia desde afuera (por ej. "Limpiar filtros"),
  // el input se actualiza.
  useEffect(() => {
    setTexto(value);
  }, [value]);

  return <input {...resto} value={texto} onChange={(e) => setTexto(e.target.value)} />;
}
