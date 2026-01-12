import { GoogleGenAI } from "@google/genai";
import { DailyLog, WeeklySchedule } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateVillagerNudge = async (
  remainingMinutes: number, 
  isOverdraft: boolean, 
  isPlaying: boolean
): Promise<string> => {
  if (!apiKey) return "Hrmm. (API Key missing)";

  try {
    const model = 'gemini-3-flash-preview';
    const context = `
      User Status:
      - Playing: ${isPlaying}
      - Remaining Budget: ${remainingMinutes} minutes
      - In Overdraft: ${isOverdraft}
    `;

    const prompt = `
      You are a Minecraft Villager watching a kid play. 
      ${context}
      
      Give a VERY SHORT (max 15 words) comment to the kid. 
      - If they have lots of time, sound like a happy trader.
      - If they are low on time, warn them about "nightfall".
      - If they are in overdraft, sound worried about the cost (emeralds/debt).
      - Use Minecraft metaphors (Redstone, Creepers, Night, Diamonds).
      - Start with a villager noise like "Hrmm" or "Huh" sometimes.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Hrmm.";
  } catch (error) {
    console.error("Gemini Nudge Error:", error);
    return "Hrmm... something is wrong with my trade.";
  }
};

export const generateWeeklyRecap = async (logs: DailyLog[]): Promise<string> => {
  if (!apiKey) return "The archives are incomplete... (Missing API Key)";

  try {
    const model = 'gemini-3-flash-preview';
    const logSummary = logs.map(l => 
      `Date: ${l.date}, Played: ${l.minutesPlayed}m, Banked: ${l.bankedMinutes}m, Overdraft: ${l.overdraftMinutes}m`
    ).join('\n');

    const prompt = `
      Write a short Minecraft RPG Adventure Log (max 100 words) based on this player's weekly stats:
      ${logSummary}

      - Turn the data into a story.
      - "Banked minutes" = gathered resources/diamonds.
      - "Overdraft" = taking damage or owing emeralds to Illagers.
      - "Played" = time spent adventuring.
      - Be fun and encouraging, but strict about the debt.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "The pages of the book are blank.";
  } catch (error) {
    console.error("Gemini Recap Error:", error);
    return "The Librarian Villager refuses to speak right now.";
  }
};

export const generateForecasterInsight = async (
  bankBalance: number,
  todaySchedule: { day: string, limit: number },
  tomorrowSchedule: { day: string, limit: number }
): Promise<string> => {
  if (!apiKey) return "Predicting weather patterns...";

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `
      You are "The Forecaster", a wise Minecraft observer.
      Current Bank: ${bankBalance} minutes.
      Today (${todaySchedule.day}) Limit: ${todaySchedule.limit}m.
      Tomorrow (${tomorrowSchedule.day}) Limit: ${tomorrowSchedule.limit}m.

      Give 1 sentence of strategic advice to a child.
      - If bank is low (<15) and tomorrow is a weekend/high-limit day, suggest saving today.
      - If bank is high (>45), suggest they are ready for a marathon.
      - Use metaphors about farming, gathering, or preparing for a raid.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    
    return response.text || "The clouds are moving fast today.";
  } catch (error) {
    return "Cannot read the stars right now.";
  }
};