import { config } from "dotenv";
config();
import app from "./src/app.js";
import connectDB from "./src/db/db.js";

const PORT = 3000;
connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
