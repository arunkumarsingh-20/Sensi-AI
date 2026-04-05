import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { helloWorld } from "@/lib/inngest/functions";

export const { GET, POST } = serve({
  client: inngest,
  functions: [helloWorld],
});
