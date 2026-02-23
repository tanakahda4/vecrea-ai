import type { Config } from "@coinbase/cdp-core";

export const getConfig = (): Config => ({
  projectId: process.env.CDP_PROJECT_ID ?? "your-project-id",
  disableAnalytics: true,
  ethereum: {
    createOnLogin: "eoa",
  },
});
