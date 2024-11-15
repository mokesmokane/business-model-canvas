import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')!

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const subscription = session.subscription as Stripe.Subscription
        if (userId) {
          await setDoc(doc(db, 'users', userId), {
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            subscriptionStatus: subscription.status,
            subscriptionPlan: subscription.items.data[0].price.id,
            subscriptionPeriodEnd: subscription.current_period_end,
            lastUpdated: new Date().toISOString()
          }, { merge: true });
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription
        const subscription = await stripe.subscriptions.retrieve(subscriptionId as string) as Stripe.Subscription
        const userId = subscription.metadata.userId
        const plan = process.env.STRIPE_PRO_PLAN_PRICE_ID === subscription.items.data[0].price.id ? 'pro' : process.env.STRIPE_ENTERPRISE_PLAN_PRICE_ID === subscription.items.data[0].price.id ? 'enterprise' : 'free';
        const customer = subscription.customer as Stripe.Customer
        if (userId) {
          await setDoc(doc(db, 'users', userId), {
            stripeCustomerId: customer.id,
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            subscriptionPlan:  plan,
            subscriptionPeriodEnd: subscription.current_period_end,
            lastUpdated: new Date().toISOString()
          }, { merge: true });
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.userId

        if (userId) {
          await setDoc(doc(db, 'users', userId), {
            stripeCustomerId: subscription.customer,
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            subscriptionPlan: subscription.items.data[0].price.id,
            subscriptionPeriodEnd: subscription.current_period_end,
            lastUpdated: new Date().toISOString()
          }, { merge: true });
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
} 