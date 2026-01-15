
import React, { useState } from 'react';
import { Car, FuelType } from '../types';
import { getCarAdvice } from '../services/geminiService';

interface CarCardProps {
  car: Car;
  onBuy: (car: Car) => void;
  onManage: (car: Car) => void;
}

const CarCard: React.FC<CarCardProps> = ({ car, onBuy, onManage }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [isConsulting, setIsConsulting] = useState(false);

  const handleConsultAI = async () => {
    setIsConsulting(true);
    const result = await getCarAdvice(car);
    setAdvice(result);
    setIsConsulting(false);
  };

  const getFuelBadge = (type: FuelType) => {
    const colors: Record<FuelType, string> = {
      [FuelType.Gasolina]: 'bg-red-100 text-red-700 border-red-200',
      [FuelType.Diesel]: 'bg-gray-100 text-gray-700 border-gray-200',
      [FuelType.Electrico]: 'bg-green-100 text-green-700 border-green-200',
      [FuelType.Hibrido]: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return colors[type];
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-slate-100 group">
      <div className="relative h-56 overflow-hidden">
        <img
          src={car.imagen}
          alt={`${car.marca} ${car.modelo}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getFuelBadge(car.combustible)}`}>
            {car.combustible.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-orange-600 text-sm font-semibold uppercase tracking-wider">{car.marca}</p>
            <h3 className="text-xl font-bold text-slate-800">{car.modelo}</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900">{car.precio.toLocaleString()}€</p>
        </div>

        <p className="text-slate-600 text-sm mb-6 line-clamp-2 h-10">
          {car.descripcion}
        </p>

        {advice && (
            <div className="mb-6 p-4 bg-orange-50 rounded-xl border border-orange-100 italic text-sm text-slate-700 relative animate-fade-in">
                <span className="absolute -top-3 left-4 bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">KITSUNE AI</span>
                "{advice}"
            </div>
        )}

        <div className="space-y-3">
          <div className="flex gap-3">
            <button
              onClick={() => onBuy(car)}
              className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
            >
              Comprar
            </button>
            <button
              onClick={() => onManage(car)}
              className="flex-1 bg-white border-2 border-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Administrar
            </button>
          </div>
          
          <button 
            onClick={handleConsultAI}
            disabled={isConsulting}
            className="w-full text-orange-600 text-sm font-medium py-2 hover:bg-orange-50 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isConsulting ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-orange-600" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Consultando experto...
                </span>
            ) : "Pedir opinión al experto (AI)"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
