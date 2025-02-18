import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();


const stripe = new Stripe("sk_test_51PAs60SB7WwtOtybywUDUG9MdtdWGlWHMww0HcmcYxKH1Odx4US1PhizF5mrg5ihlNbE85KwgVv51SYYCXQU1NRU00zSlwYANZ", {
    apiVersion: "2023-10-16",
  });


export default stripe;