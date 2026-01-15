
export enum FuelType {
  Gasolina = 'Gasolina',
  Diesel = 'Diesel',
  Electrico = 'Eléctrico',
  Hibrido = 'Híbrido'
}

export interface Car {
  id_coche: string;
  marca: string;
  modelo: string;
  combustible: FuelType;
  descripcion: string;
  precio: number;
  imagen: string;
}

export interface AppState {
  cars: Car[];
  isLoading: boolean;
  error: string | null;
}
