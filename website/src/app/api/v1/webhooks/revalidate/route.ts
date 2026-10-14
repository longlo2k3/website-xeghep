/**
 * Backend (webhookClient.ts) gửi tới `${REVALIDATE_URL}/api/v1/webhooks/revalidate`.
 * Path `api/v1/*` được proxy về frontend ở production (plan AD-6) nên có 2 alias.
 */
export const dynamic = "force-dynamic";

export { POST } from "../../../webhooks/revalidate/route";
