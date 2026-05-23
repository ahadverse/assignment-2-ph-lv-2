import "./src/config/env";
import app from "./src/app";
import { env } from "./src/config/env";

const PORT = Number(env.port) || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
