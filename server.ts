import express from "express";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

let stripe: Stripe | null = null;

function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      console.warn("STRIPE_SECRET_KEY is not set. Stripe features will be disabled.");
      return null;
    }
    stripe = new Stripe(key);
  }
  return stripe;
}

app.use(express.json());

// API Routes
app.post("/api/create-checkout-session", async (req, res) => {
  const stripeInstance = getStripe();
  if (!stripeInstance) {
    return res.status(500).json({ error: "Stripe is not configured" });
  }

  const { itemType } = req.body; // 'colors' or 'video_fx'
  
  let priceData;
  if (itemType === 'colors') {
    priceData = {
      currency: 'usd',
      product_data: {
        name: 'Premium Color Pack',
        description: 'Unlock 8 exclusive premium colors for your Circle FXZ borders.',
      },
      unit_amount: 199, // $1.99
    };
  } else if (itemType === 'video_fx') {
    priceData = {
      currency: 'usd',
      product_data: {
        name: 'Video FX & GIF Maker',
        description: 'Unlock the ability to convert videos to circular GIFs with custom borders.',
      },
      unit_amount: 499, // $4.99
    };
  } else if (itemType === 'secondary_borders') {
    priceData = {
      currency: 'usd',
      product_data: {
        name: 'Secondary Effects Pack',
        description: 'Unlock 15+ exclusive secondary border effects for your Circle FXZ.',
      },
      unit_amount: 199, // $1.99
    };
  } else {
    return res.status(400).json({ error: "Invalid item type" });
  }

  try {
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/?unlocked=${itemType === 'colors' ? 'colors' : 'video'}`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/giphy/upload", async (req, res) => {
  const apiKey = process.env.GIPHY_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GIPHY API key is not configured" });
  }

  const { file, tags } = req.body;
  if (!file) {
    return res.status(400).json({ error: "No file provided" });
  }

  try {
    // GIPHY Upload API expects multipart/form-data or a source_image_url
    // Since we have base64, we can send it as source_image_url if it's a URL, 
    // but here it's a data URL. GIPHY's upload endpoint also accepts base64 in the 'file' parameter.
    
    const formData = new FormData();
    formData.append('api_key', apiKey);
    formData.append('file', file); // GIPHY accepts base64 strings here
    if (tags) formData.append('tags', tags);

    const response = await fetch('https://upload.giphy.com/v1/gifs', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.meta?.msg || "GIPHY upload failed");
    }

    res.json(data);
  } catch (error: any) {
    console.error('GIPHY Upload Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static("dist"));
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
