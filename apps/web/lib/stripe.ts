// apps/web/lib/stripe.ts
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error("Missing STRIPE_SECRET_KEY");

export const stripe = new Stripe(key);
// No apiVersion pin → uses account default; avoids TS literal mismatch

export default stripe;
