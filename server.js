const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
 // Replace with your Stripe secret key

const app = express();

// Define a route to get the Stripe publishable key
app.get('/api/stripe-key', (req, res) => {
    const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    res.json({ stripePublishableKey });
});
const port = process.env.PORT || 3000; // You can choose any available port
const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

// app.get('/api/stripe-key', (req, res) => {
//     res.json({ stripePublishableKey: stripePublishableKey });
// });

  
app.use(bodyParser.json());

// Serve static files (e.g., HTML, CSS, JavaScript)
app.use(express.static('public')); // Assuming your client-side code is in a 'public' directory



// Create a Stripe Checkout session
app.post('/create-checkout-session', async (req, res) => {
    const { cart } = req.body;

    // Calculate the total amount from the cart items
    const lineItems = cart.map(item => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: item.item,
            },
            unit_amount: item.price * 100, // Stripe requires amounts in cents
        },
        quantity: item.quantity,
    }));

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: 'https://www.gurshaethiopian.com/thanks.html', // Redirect URL on successful payment
            cancel_url: 'http://www.gurshaethiopian.com/cancel.html',   // Redirect URL on canceled payment
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create session' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
