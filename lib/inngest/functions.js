import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world", retries: 2 },
  { event: "test/hello.world" },
  async ({ event, step, logger }) => {
    const email =
      typeof event?.data?.email === "string" ? event.data.email.trim() : "";

    if (!email) {
      logger.warn("hello-world called without email in event payload");
      return { message: "Hello there!" };
    }

    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${email}!` };
  }
);
