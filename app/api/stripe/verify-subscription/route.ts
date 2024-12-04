import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia',
});

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    const subscription = session.subscription as Stripe.Subscription;
    const customer = session.customer as Stripe.Customer;
    const plan = process.env.STRIPE_PRO_PLAN_PRICE_ID === subscription.items.data[0].price.id ? 'pro' : process.env.STRIPE_ENTERPRISE_PLAN_PRICE_ID === subscription.items.data[0].price.id ? 'enterprise' : 'free';
    return NextResponse.json({
      customerId: customer.id,
      subscriptionId: subscription.items.data[0].price.id,
      plan: plan,
      status: subscription?.status || 'unknown',
      currentPeriodEnd: subscription?.current_period_end 
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null
    });
  } catch (error) {
    console.error('Error verifying subscription:', error);
    return NextResponse.json(
      { error: 'Failed to verify subscription' },
      { status: 500 }
    );
  }
} 