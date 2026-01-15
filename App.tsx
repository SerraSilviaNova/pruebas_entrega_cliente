
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Car, FuelType } from './types';
import Navbar from './components/Navbar';
import CarCard from './components/CarCard';

// Initial Mock Data
const INITIAL_CARS: Car[] = [
  {
    id_coche: '1',
    marca: 'Toyota',
    modelo: 'Supra GR',
    combustible: FuelType.Gasolina,
    descripcion: 'El legendario deportivo japonés, perfeccionado para el siglo XXI con un motor de seis cilindros en línea.',
    precio: 65000,
    imagen: 'https://fotos.quecochemecompro.com/toyota-gr-supra/toyota-gr-supra-amarillo.jpeg?size=750x400'
  },
  {
    id_coche: '2',
    marca: 'Mazda',
    modelo: 'RX-7 FD Spirit R',
    combustible: FuelType.Gasolina,
    descripcion: 'Una pieza de coleccionista con motor rotativo Twin-Turbo. Pureza en la conducción y diseño atemporal.',
    precio: 85000,
    imagen: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/12/28/df/5a.jpg'
  },
  {
    id_coche: '3',
    marca: 'Nissan',
    modelo: 'GT-R Nismo',
    combustible: FuelType.Gasolina,
    descripcion: 'Apodado Godzilla, este monstruo de tracción total redefine lo que es posible en una pista de carreras.',
    precio: 195000,
    imagen: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id_coche: '4',
    marca: 'Honda',
    modelo: 'NSX Hybrid',
    combustible: FuelType.Hibrido,
    descripcion: 'Tecnología híbrida de vanguardia aplicada al rendimiento puro. El superdeportivo cotidiano por excelencia.',
    precio: 160000,
    imagen: 'https://images.unsplash.com/photo-1605515298946-d062f2e9da53?auto=format&fit=crop&q=80&w=800'
  },
  {
    id_coche: '5',
    marca: 'Subaru',
    modelo: 'WRX STI Final Edition',
    combustible: FuelType.Gasolina,
    descripcion: 'ADN de rally en cada curva. Sistema Symmetrical AWD y el icónico alerón trasero que domina las miradas.',
    precio: 52000,
    imagen: 'https://www.cochesyconcesionarios.com/media/cache/1170x780/uploads/subaru/wrx-sti/4/sa/subaru-wrx-sti-05-9ad9fdb8dba1635f5ad55f0fc8a195729a22e265.jpeg'
  },
  {
  id_coche: '6',
  marca: 'Lexus',
  modelo: 'LFA',
  combustible: FuelType.Gasolina,
  descripcion: 'Obra maestra de la ingeniería japonesa. Motor V10 atmosférico con un sonido considerado uno de los mejores de la historia del automóvil.',
  precio: 420000,
  imagen: 'https://blog.consumerguide.com/wp-content/uploads/sites/2/2020/03/3943499_orig.jpg'
}
];

const Home: React.FC<{ cars: Car[], onBuy: (c: Car) => void, onManage: (c: Car) => void }> = ({ cars, onBuy, onManage }) => (
  <div className="space-y-12 pb-20">
    {/* Hero Section */}
    <section className="relative h-[500px] flex items-center justify-center text-white overflow-hidden">
      <div className="absolute inset-0 bg-slate-900">
        <img 
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-40" 
            alt="Hero background" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
      </div>
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-bold font-outfit mb-6 tracking-tight">
          La Excelencia Japonesa en <span className="text-orange-500 underline decoration-orange-500/30">Cada Kilómetro</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          En Kitsune Cars no vendemos solo vehículos, entregamos ingeniería de precisión y alma mecánica. Descubre nuestra selección exclusiva.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-orange-900/20 transform hover:-translate-y-1">
            Ver Inventario
          </button>
          <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-xl font-bold transition-all border border-white/20">
            Sobre Nosotros
          </button>
        </div>
      </div>
    </section>

    {/* Featured Cars Grid */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-outfit">Selección Destacada</h2>
          <p className="text-slate-500 mt-2">Nuestros modelos más exclusivos actualmente en stock.</p>
        </div>
        <button className="text-orange-600 font-bold hover:underline transition-all">Ver todos los coches &rarr;</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cars.map(car => (
          <CarCard key={car.id_coche} car={car} onBuy={onBuy} onManage={onManage} />
        ))}
      </div>
    </div>
  </div>
);

const AdminPanel: React.FC<{ cars: Car[], onUpdate: (cars: Car[]) => void }> = ({ cars, onUpdate }) => {
    const [editingCar, setEditingCar] = useState<Car | null>(null);

    const handleDelete = (id: string) => {
        if(confirm('¿Seguro que quieres eliminar este vehículo?')) {
            onUpdate(cars.filter(c => c.id_coche !== id));
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if(!editingCar) return;
        
        if(cars.find(c => c.id_coche === editingCar.id_coche)) {
            onUpdate(cars.map(c => c.id_coche === editingCar.id_coche ? editingCar : c));
        } else {
            onUpdate([...cars, editingCar]);
        }
        setEditingCar(null);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-bold font-outfit">Panel de Gestión</h1>
                <button 
                    onClick={() => setEditingCar({ id_coche: Date.now().toString(), marca: '', modelo: '', combustible: FuelType.Gasolina, descripcion: '', precio: 0, imagen: 'https://picsum.photos/800/600' })}
                    className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors"
                >
                    + Añadir Vehículo
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Vehículo</th>
                            <th className="px-6 py-4">Combustible</th>
                            <th className="px-6 py-4">Precio</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {cars.map(car => (
                            <tr key={car.id_coche} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-mono text-slate-400">#{car.id_coche}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={car.imagen} className="w-12 h-12 rounded-lg object-cover" alt="" />
                                        <div>
                                            <p className="font-bold text-slate-800">{car.marca} {car.modelo}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{car.combustible}</td>
                                <td className="px-6 py-4 font-semibold text-slate-900">{car.precio.toLocaleString()}€</td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button onClick={() => setEditingCar(car)} className="text-blue-600 font-medium hover:underline">Editar</button>
                                    <button onClick={() => handleDelete(car.id_coche)} className="text-red-600 font-medium hover:underline">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingCar && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 font-outfit">Configurar Vehículo</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-500">Marca</label>
                                    <input required value={editingCar.marca} onChange={e => setEditingCar({...editingCar, marca: e.target.value})} className="w-full bg-slate-100 border-none rounded-xl p-3" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-500">Modelo</label>
                                    <input required value={editingCar.modelo} onChange={e => setEditingCar({...editingCar, modelo: e.target.value})} className="w-full bg-slate-100 border-none rounded-xl p-3" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-500">Combustible</label>
                                    <select value={editingCar.combustible} onChange={e => setEditingCar({...editingCar, combustible: e.target.value as FuelType})} className="w-full bg-slate-100 border-none rounded-xl p-3">
                                        {Object.values(FuelType).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-500">Precio (€)</label>
                                    <input required type="number" value={editingCar.precio} onChange={e => setEditingCar({...editingCar, precio: parseInt(e.target.value)})} className="w-full bg-slate-100 border-none rounded-xl p-3" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-500">Descripción</label>
                                <textarea required rows={3} value={editingCar.descripcion} onChange={e => setEditingCar({...editingCar, descripcion: e.target.value})} className="w-full bg-slate-100 border-none rounded-xl p-3" />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setEditingCar(null)} className="flex-1 bg-slate-200 py-3 rounded-xl font-bold">Cancelar</button>
                                <button type="submit" className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const App: React.FC = () => {
  const [cars, setCars] = useState<Car[]>(INITIAL_CARS);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBuy = (car: Car) => {
    showNotification(`¡Felicidades! Procesando la compra de tu nuevo ${car.marca} ${car.modelo}.`);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home cars={cars} onBuy={handleBuy} onManage={(c) => window.location.hash = '#/admin'} />} />
            <Route path="/inventory" element={<Home cars={cars} onBuy={handleBuy} onManage={(c) => window.location.hash = '#/admin'} />} />
            <Route path="/admin" element={<AdminPanel cars={cars} onUpdate={setCars} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="font-bold text-white mb-2">KITSUNE CARS EXCLUSIVE</p>
            <p className="text-sm">&copy; 2024 Kitsune Cars. Todos los derechos reservados.</p>
            <p className="text-xs mt-4 opacity-50">Implementado con React & Gemini AI para pruebas de Artisan Unit Testing.</p>
          </div>
        </footer>

        {/* Floating Notification */}
        {notification && (
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[100] animate-bounce">
            <div className="bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              {notification}
            </div>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;
