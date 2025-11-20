import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string, formatStr: string = "dd/MM/yyyy"): string {
  // Usa parseISO para garantir parsing consistente entre servidor e cliente
  return format(parseISO(date), formatStr, { locale: ptBR });
}

export function getTripDuration(startDate: string, endDate: string): number {
  return differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
}

export function formatCurrency(amount: number, currency: string = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(amount);
}

export function getStatusColor(status: string): string {
  const colors = {
    planning: "bg-blue-100 text-blue-700",
    ongoing: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-700",
  };
  return colors[status as keyof typeof colors] || colors.planning;
}

export function getStatusLabel(status: string): string {
  const labels = {
    planning: "Planejando",
    ongoing: "Em andamento",
    completed: "Concluída",
  };
  return labels[status as keyof typeof labels] || "Planejando";
}
