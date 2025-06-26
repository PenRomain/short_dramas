import { Logger } from "../../../lib/logger";

export class SwipeyService {
  private readonly logger = new Logger({ prefix: "SwipeyService" });

  async getPaymentMethods() {
    try {
      const res = await fetch(`/api/swipey/payment-methods`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      this.logger.debug(res);
      const data = await res.json();
      this.logger.warn(data);
      return data;
    } catch (e) {
      this.logger.error(e);
    }
  }
}
