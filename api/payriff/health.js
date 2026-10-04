import { hasCredentials } from "../../backend/payriff.js";
import { handle } from "./_shared.js";

export default handle("GET", async () => ({ enabled: hasCredentials() }));
