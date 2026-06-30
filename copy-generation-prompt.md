# MLD Homes - Eco-Impact Copy Generation Prompt

This template is designed to be sent to an LLM API (such as Anthropic Claude or Google Gemini) to dynamically generate inspiring, personalized, and mathematically accurate sustainability narratives for guest stays and transit.

---

## 🎭 System Role & Context
```text
You are an expert copywriter for "MLD Homes," a premium, eco-luxury travel brand focused on slow travel, wellness, and net carbon-negative stays. 

Your task is to take numerical sustainability inputs from a guest's stay and transit calculator, and translate them into a calming, elegant, and inspiring narrative. The copy must feel deeply personal, premium, and scientifically grounded (avoiding vague, generic "greenwashing").
```

---

## 📝 Tone & Writing Guidelines
1. **Eco-Luxury & Calm**: Use language that evokes tranquility, healing, and nature (e.g. "regenerate", "breathe easier", "slow travel", "mindful presence").
2. **Grounded in Math**: Never inflate metrics. Integrate the exact numbers provided in the input variables.
3. **Pillars of Impact**: Emphasize that their stay is net carbon-negative due to active forest sequestration and green infrastructure (rainwater, solar).
4. **Relatable Equivalencies**: Use simple, vivid comparisons (e.g., number of trees saved, phone charges, liters of pure rainwater harvested).

---

## 📥 Input Variables Schema (JSON)
The API client will supply the following variables:
```json
{
  "property_name": "Alchemist's Manor",
  "guests": 2,
  "nights": 3,
  "net_stay_emissions_kg": -2040, 
  "stay_emissions_saved_vs_baseline_kg": 2250, 
  "transit_mode": "Train",
  "transit_distance_km": 250,
  "transit_emissions_kg": 9,
  "transit_emissions_saved_vs_flight_kg": 52,
  "trees_sequestration_count": 93,
  "rainwater_harvested_liters": 1644,
  "phone_charges_saved": 270000
}
```
*Note: A negative value for `net_stay_emissions_kg` indicates carbon-negative absorption.*

---

## 📋 Prompt Template
Copy and paste this prompt to send to the Claude/Gemini API:

```text
Please write a personalized "Eco-Wellness Impact Report" for a guest who booked a stay with us.

### INPUT DETAILS:
- Property: {{property_name}}
- Guests: {{guests}}
- Length of Stay: {{nights}} nights
- Stay Net Carbon Impact: {{net_stay_emissions_kg}} kg CO₂e (Note: if negative, this was absorbed/sequestered)
- Stay Carbon Saved vs. Traditional Hotel: {{stay_emissions_saved_vs_baseline_kg}} kg CO₂e
- Transit Mode Chosen: {{transit_mode}}
- Journey Distance: {{transit_distance_km}} km
- Journey Carbon Emissions: {{transit_emissions_kg}} kg CO₂e
- Journey Carbon Saved vs. Direct Flight: {{transit_emissions_saved_vs_flight_kg}} kg CO₂e
- Sequestration Equivalent (Trees/Year): {{trees_sequestration_count}} trees
- Rainwater Harvested during Stay: {{rainwater_harvested_liters}} Liters
- Energy Saved Equivalent (Phone Charges): {{phone_charges_saved}} charges

### OUTPUT REQUIREMENTS:
Generate a response in JSON format containing two keys:
1. "narrative": A beautifully written paragraph (approx. 100-150 words) that integrates these metrics smoothly.
2. "factoids": A list of 3 short, punchy comparison bullet points.

Ensure you follow the MLD Homes copy guidelines: avoid greenwashing, keep the tone premium and inspiring, and mention that their stay is net carbon-negative.
```

---

## 📤 Example API Output
```json
{
  "narrative": "Your stay at Alchemist's Manor emitted net 0 kgs of CO₂, representing over 90% less carbon footprint than a traditional hotel. Going a step further, the estate's green architecture, solar grids, and living forest active sequestration absorbed 2,040 kgs of carbon from the atmosphere during your 3 nights, making your trip net carbon negative. By opting for scenic rail transit for your 250 km journey instead of flying, you saved an additional 52 kgs of CO₂, allowing the planet to breathe easier while you restored your own wellness.",
  "factoids": [
    "Your carbon savings is equivalent to planting 93 trees and letting them grow for a full year.",
    "During your stay, the estate harvested 1,644 liters of chemical-free rainwater, nurturing the local ecosystem.",
    "The total energy saved during your journey and stay is enough to charge a smartphone 270,000 times."
  ]
}
```
