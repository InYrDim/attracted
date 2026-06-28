export async function calculateShippingCost(
  courier: string,
  originId: string,
  destinationId: string,
  weightInGrams: number
): Promise<{ service: string; cost: number; etd: string }[]> {
  // In a real app, this would call RajaOngkir / BinderByte / BiteShip API.
  // We'll mock the response based on the courier for the prototype.
  console.log(`Calculating shipping for ${courier} from ${originId} to ${destinationId} (${weightInGrams}g)`);

  const mockRates = {
    jne: [
      { service: "REG", cost: 15000, etd: "2-3 days" },
      { service: "YES", cost: 25000, etd: "1 day" },
    ],
    sicepat: [
      { service: "REG", cost: 14000, etd: "2-3 days" },
      { service: "BEST", cost: 24000, etd: "1 day" },
    ],
    jnt: [
      { service: "EZ", cost: 15000, etd: "2-3 days" },
      { service: "SUPER", cost: 30000, etd: "1-2 days" },
    ],
    gojek: [
      { service: "Instant", cost: 45000, etd: "Same day" },
      { service: "SameDay", cost: 25000, etd: "Same day" },
    ],
    grab: [
      { service: "Instant", cost: 42000, etd: "Same day" },
      { service: "SameDay", cost: 23000, etd: "Same day" },
    ]
  };

  return mockRates[courier as keyof typeof mockRates] || [{ service: "REG", cost: 15000, etd: "2-3 days" }];
}

export async function generateTrackingNumber(courier: string, orderId: string): Promise<string> {
  // Mock API call to create shipping order & get resi (waybill)
  const prefix = {
    jne: "JNE",
    sicepat: "00",
    jnt: "JP",
    gojek: "GK",
    grab: "GB",
  }[courier] || "TRK";

  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestamp = Date.now().toString().substring(8);
  
  return `${prefix}${timestamp}${randomString}`;
}