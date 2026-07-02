/**
 * Maps ISO3 country codes to their local currency codes for PawaPay-supported countries.
 * Source: SUBSCRIPTION_AND_PAYMENT_GATEWAYS_GUIDE.md
 */
export const PAWAPAY_ISO3_TO_CURRENCY: Record<string, string> = {
  BEN: "XOF", // Benin
  BFA: "XOF", // Burkina Faso
  CMR: "XAF", // Cameroon
  CIV: "XOF", // Cote d'Ivoire
  COD: "CDF", // DR Congo
  ETH: "ETB", // Ethiopia
  GAB: "XAF", // Gabon
  GHA: "GHS", // Ghana
  KEN: "KES", // Kenya
  LSO: "LSL", // Lesotho
  MWI: "MWK", // Malawi
  MOZ: "MZN", // Mozambique
  NGA: "NGN", // Nigeria
  COG: "XAF", // Republic of the Congo
  RWA: "RWF", // Rwanda
  SEN: "XOF", // Senegal
  SLE: "SLE", // Sierra Leone
  TZA: "TZS", // Tanzania
  UGA: "UGX", // Uganda
  ZMB: "ZMW", // Zambia
};

/**
 * Gets the local currency for a PawaPay country. Defaults to "USD" if not found.
 */
export function getPawaPayCurrency(iso3: string | undefined | null): string {
  if (!iso3) return "USD";
  return PAWAPAY_ISO3_TO_CURRENCY[iso3.toUpperCase()] ?? "USD";
}