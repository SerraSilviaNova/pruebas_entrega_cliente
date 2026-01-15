
import { GoogleGenAI, Type } from "@google/genai";
import { Car } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getCarAdvice = async (car: Car) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Actúa como un experto vendedor de coches de lujo. Genera un breve "discurso de venta" (máximo 3 frases) para el siguiente vehículo: ${car.marca} ${car.modelo}. Combustible: ${car.combustible}. Precio: ${car.precio}€. Descripción: ${car.descripcion}. Hazlo sonar exclusivo y emocionante.`,
      config: {
        temperature: 0.8,
        topP: 0.95,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Este vehículo es una de nuestras joyas más exclusivas. ¡Ven a probarlo hoy mismo!";
  }
};

export const getSmartSearch = async (query: string, inventory: Car[]) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Basado en esta lista de coches: ${JSON.stringify(inventory)}, responde a la consulta del usuario: "${query}". Recomienda los mejores 2 coches que encajen. Responde en JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        recommendations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id_coche: { type: Type.STRING },
                                    reason: { type: Type.STRING }
                                },
                                required: ["id_coche", "reason"]
                            }
                        },
                        message: { type: Type.STRING }
                    },
                    required: ["recommendations", "message"]
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (error) {
        return { recommendations: [], message: "No pude procesar tu solicitud ahora mismo." };
    }
}
