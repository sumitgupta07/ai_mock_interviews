import vapi from "@vapi-ai/web";

export const vapiClient = new vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!);
