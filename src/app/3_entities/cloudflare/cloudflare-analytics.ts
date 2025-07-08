type ServiceSuccess = {
  status: "success";
};

type ServiceError = {
  status: "error";
  message?: string;
};

type ServiceResult = ServiceSuccess | ServiceError;

export class CloudflareAnalyticsService {
  private async callEndpoint(
    path: string,
    data?: Record<"email", string>,
  ): Promise<ServiceResult> {
    try {
      const res = await fetch(`/api/cloudflare-analytics/${path}`, {
        method: "POST",
        ...(data && { body: JSON.stringify(data) }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        return { status: "success" };
      }

      const json = await res.json().catch(() => ({}));
      return {
        status: "error",
        message: typeof json.error === "string" ? json.error : undefined,
      };
    } catch (e) {
      console.error(`[cloudflare.${path}] network error`, e);
      return { status: "error", message: "Network error" };
    }
  }

  payClick = (): Promise<ServiceResult> => {
    return this.callEndpoint("pay-click");
  };

  newUser = (): Promise<ServiceResult> => {
    return this.callEndpoint("new-user");
  };

  reachLastScene = (): Promise<ServiceResult> => {
    return this.callEndpoint("last-scene");
  };

  updateUser = (props: Record<"email", string>): Promise<ServiceResult> => {
    console.log(
      "%csrc/app/3_entities/cloudflare/cloudflare-analytics.ts:52 props",
      "color: #007acc;",
      props,
    );
    return this.callEndpoint("update-user", props);
  };
}
