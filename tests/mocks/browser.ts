// MSW browser for client-side testing (if needed)
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// Setup worker with handlers
export const worker = setupWorker(...handlers);
