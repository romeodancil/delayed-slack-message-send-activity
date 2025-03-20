import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";

// Load environment variables
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors()); // Allow frontend to call this backend

app.post("/send-message", async (req, res) => {
  console.log("sdfsdf req.body", req.body);
  debugger;
  try {
    const response = await fetch(req.body.webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: req.body.text }),
    });

    if (response.ok) {
      res.json({ success: true, message: "Message sent!" });
    } else {
      res.status(400).json({ success: false, error: response.statusText });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
