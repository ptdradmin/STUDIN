'use server';
/**
 * @fileOverview A Genkit flow for creating a Stripe Checkout Session for subscriptions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const CreateCheckoutSessionInputSchema = z.object({
  userId: z.string().describe("The ID of the user subscribing."),
  email: z.string().email().describe("The email of the user for Stripe customer creation."),
});
export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionInputSchema>;

const CreateCheckoutSessionOutputSchema = z.object({
  sessionId: z.string().optional(),
  url: z.string().optional(),
});
export type CreateCheckoutSessionOutput = z.infer<typeof CreateCheckoutSessionOutputSchema>;


/**
 * Looks for an existing Stripe product or creates a new one.
 */
async function getOrCreateProduct(): Promise<Stripe.Product> {
  const products = await stripe.products.list({ limit: 1, active: true });
  const existingProduct = products.data.find(p => p.name === "Alice Pro");
  if (existingProduct) {
    return existingProduct;
  }
  return stripe.products.create({
    name: "Alice Pro",
    description: "Abonnement mensuel à Alice Pro sur STUD'IN",
  });
}

/**
 * Looks for an existing price for the product or creates a new one.
 */
async function getOrCreatePrice(productId: string): Promise<Stripe.Price> {
  const prices = await stripe.prices.list({ product: productId, active: true });
  const existingPrice = prices.data.find(p => p.unit_amount === 499 && p.currency === 'eur' && p.recurring?.interval === 'month');
  if (existingPrice) {
    return existingPrice;
  }
  return stripe.prices.create({
    product: productId,
    unit_amount: 499, // 4.99 EUR
    currency: 'eur',
    recurring: {
      interval: 'month',
    },
  });
}


export async function createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionOutput> {
  return createCheckoutSessionFlow(input);
}


const createCheckoutSessionFlow = ai.defineFlow(
  {
    name: 'createCheckoutSessionFlow',
    inputSchema: CreateCheckoutSessionInputSchema,
    outputSchema: CreateCheckoutSessionOutputSchema,
  },
  async ({ userId, email }) => {
    
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("Stripe secret key is not configured.");
    }
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    
    try {
        const customers = await stripe.customers.list({ email: email, limit: 1 });
        let customer = customers.data[0];

        if (!customer) {
            customer = await stripe.customers.create({
                email: email,
                metadata: {
                    userId: userId,
                }
            });
        }
        
        const product = await getOrCreateProduct();
        const price = await getOrCreatePrice(product.id);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: price.id,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            customer: customer.id,
            success_url: `${appUrl}/subscription?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/subscription`,
        });

        return { sessionId: session.id, url: session.url || undefined };

    } catch (e: any) {
        console.error("Stripe session creation failed:", e);
        throw new Error(`Failed to create Stripe session: ${e.message}`);
    }
  }
);
