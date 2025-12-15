import { GoogleGenAI, Type } from "@google/genai";
import { ScoreData, AIAnalysisResult, StatisticalSummary } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeScoresWithAI = async (
  history: ScoreData[],
  stats: StatisticalSummary,
  platformName: string,
  indicatorName: string
): Promise<AIAnalysisResult> => {
  try {
    const prompt = `
      你是一位精通制造业和质量管理的数据分析专家。请分析"${platformName}"平台下的指标"${indicatorName}"在过去12个月的分数历史数据。
      
      数据:
      ${JSON.stringify(history)}
      
      统计数据:
      平均值: ${stats.mean}
      标准差: ${stats.stdDev}
      最大值: ${stats.max}

      任务：
      1. 根据趋势（上升、下降、波动或稳定），为下个月（第13个月）推荐一个切合实际但具有挑战性的【目标达成值】。
      2. 结合正态分布统计学（如 -1σ 或 -2σ 处），设定一个【警戒值】(Warning Threshold)。如果低于此分数，说明过程出现异常，需要立即干预。
      3. 提供简短的推理分析，并给出3条可行的改进建议。
      4. 评估实现目标的难度。
      
      请直接以JSON格式返回，不要包含Markdown标记。
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedScore: { type: Type.NUMBER, description: "下个月的建议目标分数" },
            warningScore: { type: Type.NUMBER, description: "警戒值，低于此分数视为异常 (例如 Mean - 1.5 StdDev)" },
            difficulty: { type: Type.STRING, description: "难度等级 (例如: 容易, 中等, 困难)" },
            reasoning: { type: Type.STRING, description: "推荐该分数的理由分析" },
            advice: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3条可行的建议"
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResult;
    } else {
      throw new Error("AI未返回有效数据");
    }
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    // Fallback if AI fails
    const safeMean = stats.mean || 0;
    const safeStdDev = stats.stdDev || 0;
    return {
      recommendedScore: parseFloat((safeMean + (safeStdDev * 0.5)).toFixed(2)),
      warningScore: parseFloat((safeMean - safeStdDev).toFixed(2)),
      difficulty: "估算值",
      reasoning: "AI服务暂时不可用。基于统计学公式生成：目标为平均值+0.5σ，警戒线为平均值-1.0σ。",
      advice: ["保持当前势头", "回顾低分月份的原因", "确保持续改进"]
    };
  }
};