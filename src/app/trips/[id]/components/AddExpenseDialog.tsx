"use client";

import { useState, useEffect } from "react";
import { X, DollarSign } from "lucide-react";

interface AddExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: {
    description: string;
    amount: number;
    paidBy: string;
  }) => void;
  collaborators: string[];
}

export default function AddExpenseDialog({
  isOpen,
  onClose,
  onAdd,
  collaborators,
}: AddExpenseDialogProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDescription("");
      setAmount("");
      setPaidBy(collaborators[0] || "");
    }
  }, [isOpen, collaborators]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim() || !amount || !paidBy) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Por favor, insira um valor válido");
      return;
    }

    onAdd({
      description: description.trim(),
      amount: numericAmount,
      paidBy,
    });

    setDescription("");
    setAmount("");
    setPaidBy(collaborators[0] || "");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Adicionar Gasto</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição do Gasto
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Jantar no restaurante"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A6FF] focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A6FF] focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Quem Pagou */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quem Pagou
            </label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A6FF] focus:border-transparent outline-none transition-all bg-white"
            >
              <option value="">Selecione...</option>
              {collaborators.map((collaborator) => (
                <option key={collaborator} value={collaborator}>
                  {collaborator}
                </option>
              ))}
            </select>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
            >
              Adicionar Gasto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
