/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function categorizeItem(itemName: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return 'Outros';
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Categorize o seguinte item de supermercado: "${itemName}".
      Escolha apenas UMA das seguintes categorias:
      - Frutas e Vegetais
      - Laticínios e Ovos
      - Padaria
      - Carnes e Peixes
      - Bebidas
      - Limpeza
      - Higiene Pessoal
      - Congelados
      - Despensa
      - Outros
      
      Retorne APENAS o nome da categoria.`,
      config: {
        maxOutputTokens: 20,
        temperature: 0.1,
      },
    });

    const category = response.text?.trim() || 'Outros';
    
    // Validate if it's one of our expected categories
    const validCategories = [
      'Frutas e Vegetais', 
      'Laticínios e Ovos', 
      'Padaria', 
      'Carnes e Peixes', 
      'Bebidas', 
      'Limpeza', 
      'Higiene Pessoal', 
      'Congelados', 
      'Despensa', 
      'Outros'
    ];

    return validCategories.includes(category) ? category : 'Outros';
  } catch (error) {
    console.error("Erro ao categorizar item:", error);
    return 'Outros';
  }
}
