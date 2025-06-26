type PaySuccess = {
  status: "success";
};
type PayDeposit = {
  status: "deposit";
  depositUrl: string;
};
type PayError = {
  status: "error";
  message?: string;
};

type PayResult = PaySuccess | PayDeposit | PayError;

const SWIPEY_PAY_ENDPOINT = "/api/swipey/pay";

export class SwipeyPayService {
  async pay(price: number): Promise<PayResult> {
    const params = new URLSearchParams({ price: price.toString() });
    let res: Response;

    try {
      res = await fetch(`${SWIPEY_PAY_ENDPOINT}?${params}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });
    } catch (e) {
      console.error("[swipey.pay] network error", e);
      return { status: "error", message: "Network error" };
    }

    if (res.ok) {
      return { status: "success" };
    }
    if (res.status === 402) {
      const json = await res.json().catch(() => ({}));

      return {
        status: "deposit",
        depositUrl: json.deposit_url || "",
      };
    }

    const json = await res.json().catch(() => ({}));
    return {
      status: "error",
      message: typeof json.message === "string" ? json.message : undefined,
    };
  }
}
