import { OpenAI } from 'openai';

const PERPLEXITY_API_KEY = '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';

const client = new OpenAI({
  apiKey: PERPLEXITY_API_KEY,
  baseURL: 'https://api.perplexity.ai',
});

const SYSTEM_PROMPT = `You are an advanced agent with internet access. Your goal is to find and/or estimate the facility's name, size (ft²), EUI (kWh/ft²/year), local electricity rate ($/kWh), and demand charge ($/kW) for the location data the user provides. If peak demand is unknown, assume 200 kW. Then calculate annual cost using:
(Facility Size × EUI × Electricity Rate) + (Peak kW × Demand Charge × 12).
Output only a single numeric value with no text or explanation.`;

export interface LocationInfo {
  organization: string;
  city: string;
  country: string;
  state: string;
}

export async function getFacilityData(location: LocationInfo): Promise<number> {
  const userPrompt = `You have internet access and must find data for a facility located at:
Organization: ${location.organization}
City: ${location.city}
County: ${location.country}
State: ${location.state}

Steps:
1) Confirm or determine the facility name from the above details.
2) Find or approximate the facility size (ft²).
3) Find or approximate the EUI (kWh/ft²/year) for that facility/building type.
4) Find or approximate local commercial electricity rate ($/kWh).
5) Find or approximate local demand charges ($/kW).
6) Assume 200 kW peak demand if no actual data is available.
7) Calculate annual cost:
   (Facility Size × EUI × Electricity Rate)
   + (Peak kW × Demand Charge × 12).
8) Output a single dollar amount on one line, with no explanation or sources.`;

  try {
    const response = await client.chat.completions.create({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const result = response.choices[0].message.content;
    // Extract just the number from the response
    const cost = parseFloat(result.replace(/[^0-9.]/g, ''));
    return isNaN(cost) ? 0 : cost;
  } catch (error) {
    console.error('Error fetching facility data:', error);
    return 0;
  }
} 