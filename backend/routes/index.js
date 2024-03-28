var express = require('express');
var router = express.Router();
var fetch = require('node-fetch')
const stripe_load = require('stripe')
/* GET home page. */


router.post('/create-subscription', async (req, res) => {
  console.log(req.body);
  
//const stripe = await stripe_load(req.body.client_secret_key);
  const stripe = await require('stripe')(req.body.secret_key)
  //(api.stripe.client_secret_key);
  try {
    let customer = "";
    const existing_customer = await stripe.customers.list({
      email:req.body.email
    });
    if(existing_customer.data && existing_customer.data.length > 0) {
        customer = existing_customer.data[0];
    }
    else{
         customer = await stripe.customers.create({
          email: req.body.email,
          name: req.body.name,
        });
    }
   console.log (customer);
  // const product = await stripe.products.create({
  //   name: 'Montly Subscription',
  // });
    const price = await stripe.prices.create({
        currency: req.body.currency ? req.body.currency : "usd",

        unit_amount: req.body.amount,
        recurring: {
        interval: 'day',
        interval_count: 1,
        },
        product_data: {
        name: 'day Subscription',
        },
    });

    const current_date = new Date();
    current_date.setDate(current_date.getDate() + 1);
    // current_date.setFullYear(current_date.getFullYear() + 1);
    const datum = Date.parse(current_date);
    const future_date = datum/1000;

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price: price.id,
      }],
      cancel_at: future_date,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription',  "payment_method_types": req.body.payment_method_types ? req.body.payment_method_types : ['card']},
      expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
      metadata : {
        custom:req.body.metadata.custom
      },
    
  });
  //const invoice = await stripe.invoices.retrieve(subscription.latest_invoice);
  
    // const payment_intents_update = await stripe.paymentIntents.update(
    //     subscription.latest_invoice.payment_intent.id,{
    //     metadata : {
    //         custom:req.body.metadata.custom
    //     },
    // });
    res.send({
      body: JSON.stringify({
        type: 'payment',
       // clientSecret : payment_intents_update.client_secret 
        clientSecret: subscription.latest_invoice.payment_intent.client_secret })
    });
    } catch (error) {
      console.log(error);
        return res.status(400).send({ error: { message: error.message } });
    }
});

module.exports = router;
