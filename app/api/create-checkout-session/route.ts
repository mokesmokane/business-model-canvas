import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: Request) {
  try {
    const { priceId, userId } = await request.json();
    let stripe_price_id = priceId === "PRO" ? process.env.STRIPE_PRO_PLAN_PRICE_ID : process.env.STRIPE_ENTERPRISE_PLAN_PRICE_ID;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripe_price_id,
          quantity: 1,
        },
      ],
      success_url: `${request.headers.get('origin')}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/upgrade`,
      metadata: {
        userId: userId,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
} 