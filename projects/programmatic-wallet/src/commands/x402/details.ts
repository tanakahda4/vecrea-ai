const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;

export type RunX402DetailsResult =
  | {
      method: string;
      status: number;
      body: unknown;
      headers: Record<string, string>;
      paymentRequired?: unknown;
    }
  | { error: "no_x402_requirements" };

/**
 * Inspect an endpoint's x402 payment requirements without paying.
 * Tries each HTTP method until it gets a 402 response.
 */
export const runX402Details = async (url: string): Promise<RunX402DetailsResult> => {
  for (const method of HTTP_METHODS) {
    const res = await fetch(url, {
      method,
      headers: { Accept: "application/json" },
      redirect: "follow",
    });
    if (res.status === 402) {
      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        headers[k] = v;
      });
      let body: unknown;
      try {
        body = await res.json();
      } catch {
        body = await res.text();
      }
      let paymentRequired: unknown;
      const pr = res.headers.get("payment-required");
      if (pr) {
        try {
          paymentRequired = JSON.parse(
            Buffer.from(pr, "base64").toString("utf8")
          );
        } catch {
          paymentRequired = undefined;
        }
      }
      return { method, status: 402, body, headers, paymentRequired };
    }
  }
  return { error: "no_x402_requirements" };
};
