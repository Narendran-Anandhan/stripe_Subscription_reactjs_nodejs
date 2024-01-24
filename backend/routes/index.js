var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
const stripe = require('stripe')('sk_test_51LrE87CxvG8uiRsosb41673W9idxFKYefj3lzbaNXaOlmsSiAnFQo8c3RYwyepd5DstXaOk3Em3ujQ7rcug6yXmN00ytxi8cyH');

router.post('/create-subscription', async (req, res) => {


  try {

    
  const customer = await stripe.customers.create({
    email: 'john@gmail.com',
    name: 'john',
   
  });

  // const product = await stripe.products.create({
  //   name: 'Montly Subscription',
  // });

  const price = await stripe.prices.create({
    currency: 'usd',
    unit_amount: 1000,
    recurring: {
      interval: 'month',
    },
    product_data: {
      name: 'Monthly Subscription',
    },
  });

  console.log(customer.id)
  console.log(price.id);

 // const customerId = req.cookies['customer'];
 const customerId = customer.id;
  const priceId = price.id;
  
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: priceId,
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
    });

    if (subscription.pending_setup_intent !== null) {
      res.send({
        type: 'setup',
        clientSecret: subscription.pending_setup_intent.client_secret,
      });
    } else {
      res.send({
        type: 'payment',
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      });
    }

  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});

module.exports = router;
