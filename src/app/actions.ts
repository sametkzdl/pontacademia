"use server";

export async function submitBasvuruForm(formData: FormData) {
  try {
    const sheetsUrl = process.env.SHEETS_API_URL;
    const apiKey = process.env.SHEETS_API_KEY;

    if (!sheetsUrl) {
      console.warn("SHEETS_API_URL is missing. Simulating success in development mode.");
      return { 
        success: true, 
        message: "Simulation mode active. SHEETS_API_URL is not defined in env." 
      };
    }

    // Convert FormData to JSON payload for Google Sheets webhook (handles both FormData instances and plain JSON objects)
    let payload: Record<string, any> = {};
    if (formData && typeof (formData as any).entries === "function") {
      payload = Object.fromEntries((formData as any).entries());
    } else if (formData && typeof formData === "object") {
      payload = formData as any;
    }

    const response = await fetch(sheetsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { "x-api-key": apiKey } : {})
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Sheets endpoint error (${response.status}): ${errorText}`);
      return { 
        success: false, 
        error: `Google Sheets integration returned status ${response.status}` 
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error submitting form action:", error);
    return { success: false, error: "Failed to submit form" };
  }
}
