import { GoogleGenAI, Type } from "@google/genai";
import { Invoice, Product, LedgerEntry } from '../types';

// NOTE: In a real app, this key should come from a secure backend or environment variable.
// The user must provide their key in the runtime environment for this to work.
const apiKey = process.env.API_KEY || ''; 

// We initialize safely to avoid crashes if key is missing during render, 
// but calls will fail if key isn't present in environment.
let ai: GoogleGenAI | null = null;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
}

export const analyzeBusinessData = async (
  query: string, 
  invoices: Invoice[], 
  products: Product[],
  ledger: LedgerEntry[]
) => {
  if (!ai) {
    return { text: "API Key not found. Please set REACT_APP_GEMINI_API_KEY." };
  }

  // Prepare context
  const context = `
    You are an AI assistant for the CEO of an ERP system.
    Current Data:
    - Total Invoices: ${invoices.length}
    - Low Stock Items: ${products.filter(p => p.stock < p.reorderLevel).map(p => p.name).join(', ')}
    - Recent Revenue: ${ledger.filter(l => l.type === 'REVENUE').reduce((acc, curr) => acc + curr.credit, 0)}
    - Pending Approvals: ${invoices.filter(i => i.status !== 'FINALIZED').length}
    
    Data Schema context:
    Invoices have items, totalAmount, royaltyFee.
    Products have stock, reorderLevel.
    
    User Query: ${query}
    
    Please provide a concise strategic insight or answer based on this data. 
    If asking for a forecast, generate a plausible prediction based on typical business trends.
    If asking for anomalies, identify high value invoices or low stock.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: context,
    });
    return { text: response.text };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Unable to generate insight at this time." };
  }
};

export const detectAnomalies = async (invoices: Invoice[]) => {
     if (!ai) return [];
     
     const context = `
        Analyze these invoices for anomalies (e.g., unusually high amounts, odd patterns).
        Return a JSON array of objects with 'id' (invoice id) and 'reason' (string).
        Invoices: ${JSON.stringify(invoices.slice(0, 20))}
     `;

     try {
         const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: context,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            reason: { type: Type.STRING }
                        }
                    }
                }
            }
         });
         return JSON.parse(response.text || '[]');
     } catch (e) {
         console.error(e);
         return [];
     }
}
