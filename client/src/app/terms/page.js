"use client";

import Footer from "../components/Footer";
import Header from "../components/Header";

export default function ArticlePage() {
    return (
        <>
            <Header />
            <div className="min-h-screen mt-[80px] bg-gray-100 flex justify-center px-6 py-10">
                <div className="max-w-7xl w-full bg-white rounded-lg shadow-lg p-6 md:p-10">
                    <h1 className="text-4xl font-bold text-gray-800 mb-6">Terms & Privacy Policy</h1>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                        Last Updated: December 17, 2024
                    </p>

                    {/* Terms and Conditions */}
                    <h2 className="text-2xl font-semibold text-gray-700 mt-8">TERMS AND CONDITIONS</h2>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        This website is operated by NY Elizabeth Holdings, Inc., a Wyoming corporation, (hereinafter, “NY Elizabeth Auction” “We”, or “Us”). These terms of service (the “Terms”) govern your access to the NY Elizabeth Auction website (https://nyelizabeth.com/), and any other services owned, controlled, or offered by NY Elizabeth Auction, now or in the future (all collectively referred to as, the “Services“). The term “You” or “Bidder” shall refer to any individual that views, uses, accesses, browses or submits any bids through the Services.
                    </p>
                    <p className="text-gray-600 mt-6 text-lg leading-relaxed">
                        These Terms are important and affect your legal rights, so please read them carefully. Note that these Terms contain a mandatory arbitration provision that requires the use of arbitration on an individual basis and limits the remedies available to you in the event of certain disputes.
                    </p>
                    <p className="text-gray-600 mt-6 text-lg leading-relaxed">
                        The Services are offered to you conditioned on your acceptance without modification of Terms contained herein. Certain features, services or tools of the Services may be subject to additional guidelines, terms, or rules, which will be posted with those features and are a part of these Terms. Your use of the Services constitutes your agreement to all such Terms. Please read these terms carefully.
                    </p>
                    <p className="text-gray-600 mt-6 font-bold text-lg leading-relaxed">
                        THESE TERMS ARE IMPORTANT AND AFFECT YOUR LEGAL RIGHTS, SO PLEASE READ THEM CAREFULLY. THE TERMS INCLUDE AN ARBITRATION AGREEMENT WHICH WILL, WITH LIMITED EXCEPTIONS, REQUIRE DISPUTES BETWEEN US TO BE SUBMITTED TO BINDING AND FINAL ARBITRATION. UNLESS YOU OPT OUT OF THE ARBITRATION AGREEMENT WITH WRITTEN SIGNED APPROVAL: (1) YOU WILL ONLY BE PERMITTED TO PURSUE CLAIMS AND SEEK RELIEF AGAINST US ON AN INDIVIDUAL BASIS, NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY CLASS OR REPRESENTATIVE ACTION OR PROCEEDING; AND (2) YOU ARE AGREEING TO MANDATORY INDIVIDUAL ARBITRATION FOR THE RESOLUTION OF DISPUTES AND WAIVING YOUR RIGHT TO A JURY TRIAL ON YOUR CLAIMS.
                    </p>

                    {/* Section 1: Use of the Services */}
                    <h2 className="text-2xl font-semibold text-gray-700 mt-8">1. USE OF THE SERVICES</h2>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        (a) Subject to your compliance with its obligations under these Terms, we will provide you with access to the Services. Access to the Services is permitted on a temporary basis, and we reserve the right to withdraw or amend the service we provide without notice. We will not be liable if for any reason our Services are unavailable at any time or for any period. We shall use commercially reasonable efforts to ensure the availability of the Services, except that we shall not be liable for: (a) scheduled downtime; or (b) any unavailability caused directly or indirectly by circumstances beyond our reasonable control, including without limitation, (i) a force majeure event; (ii) Internet host, webhosting, cloud computing platform, or public telecommunications network failures or delays, or denial of service attacks; (iii) a fault or failure of your computer systems or networks; or (iv) any breach by of these Terms by you.
                    </p>
                    <p className="text-gray-600 mt-6 text-lg leading-relaxed">
                        You must be eighteen (18) years or over in order to use the Services.
                    </p>

                    {/* Membership Program */}
                    <h3 className="text-xl font-semibold text-gray-700 mt-6">(b) Membership Program</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        (i) NY Elizabeth has an invitation-only program which includes annual membership to the Services (the “Membership”). The Membership tiers are as follows:
                        <br />
                        - Tier I annual membership is $120 per year and includes approval for auctions and discounted “buy it now” pricing.
                        <br />
                        - Tier II annual membership is $480 per year and includes instant approval to our upcoming auctions, discounted “buy it now” pricing, free certificate of authenticity from NY Elizabeth with any jewelry, watch or handbag purchase from auctions or “buy it now” items. The certificates may be verified on the NY Elizabeth website by performing a certificate search or via a QR code. The ownership of the certificate can also be amended to include a new owner for a nominal fee.
                    </p>
                    <p className="text-gray-600 mt-6 text-lg leading-relaxed">
                        (ii) The Membership fees are non-refundable. The Membership can be canceled at any time by email request to hello@nyelizabeth.com.
                    </p>

                    {/* Certificates of Authenticity and Appraisals */}
                    <h3 className="text-xl font-semibold text-gray-700 mt-6">(c) Certificates of Authenticity and Appraisals</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        NY Elizabeth Auction offers certificates of authenticity (“Certificates”) to customers that are members of our Membership program and for certain auctions for jewelry, watches, and handbags.
                        <br />
                        The certificates will include a serial number, a QR code, pictures of the product, and a description. Certificates can be ordered via cert.nyelizabeth.com.
                        <br />
                        Additionally, upon request, NY Elizabeth Auction may provide an appraisal via a PDF document to certain auction and private sale customers. Appraisals are conducted by independent third-party appraisal firms. Such firms may be certified gemologists or have education in the industry or alternative certifications. Appraisal value should not be considered for actual value, as price varies greatly from retail locations and other merchants in different geographic locations. All Items auctioned by NY Elizabeth should not be purchased with a view or expectation toward resale for appraisal price given, or to make a profit. The ultimate value for which an item can be resold may vary drastically from the appraisals provided by NY Elizabeth Auction.
                    </p>
                    <p className="text-gray-600 mt-6 text-lg leading-relaxed">
                        Any appraisals or evaluations provided are solely for the convenience of the purchaser and NY Elizabeth Auction makes no warranties of any kind relating to such appraisals. Appraisals may include valuations which reflect the full, highest retail price of the item in a specific geographic region. No appraisal value should be considered to represent the actual resale value, insurance replacement value, or cost of a similar good. No statement (oral or written) shall be deemed such a warranty or representation, or any assumption of responsibility. In no circumstance will a vastly different appraisal or estimate of any third-party given on behalf of a purchaser in a NY Elizabeth Auction be grounds for a return, cancellation, or refund.
                    </p>

                    {/* Section 2: Bidding */}
                    <h2 className="text-2xl font-semibold text-gray-700 mt-8">2. BIDDING</h2>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        (a) General. A bidder’s bid at all times represents an irrevocable offer by bidder to enter into a binding contract to purchase the auctioned lot in accordance with the specific provisions of the listing and these general terms and conditions, as applicable, even if a higher bid was received by NY Elizabeth Auction. In the placing of any bid the bidder understands and agrees that the bid, once accepted by NY Elizabeth Auction, will be the winning bid if there is no higher bid by another bidder and if any reserve or reduced reserve on the lot is exceeded by the bid.
                    </p>
                    <p className="text-gray-600 mt-6 text-lg leading-relaxed">
                        (i) Deposits. NY Elizabeth may require that first-time Bidders on more than one (1) lot place a bank wire deposit prior to having access to NY Elizabeth auction catalog bidding portal (a “Deposit”). The amount of the Deposit required will vary and will depend on the catalog for which the bid will be placed. If the Bidder does not place a winning bid, NY Elizabeth will charge a $150 monthly administrative fee. The Bidder shall be responsible for the cost of all incoming and outgoing wire fees. The bidder must provide their banking info for a refund and request via email to: hello@nyelizabeth.com within 30 days of the auction.
                    </p>
                    <p className="text-gray-600 mt-6 text-lg leading-relaxed">
                        All bids are binding, irrevocable and non-cancelable by bidder.
                        <br />
                        NY Elizabeth Auction has final discretion on sale of a lot. The decisions of NY Elizabeth Auction are final. In the unlikely event that we confront technical difficulties, NY Elizabeth Auction reserves the right in its sole and absolute discretion to cancel the remainder of the auction.
                    </p>

                    {/* Bidding Types */}
                    <h3 className="text-xl font-semibold text-gray-700 mt-6">(b) Bidding Types</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        NY Elizabeth offers several options for bidding. Bidding can be done in person at our gallery, over the telephone, via absentee bidding, and live on one of three live bidding platforms. When submitting bids via email or fax, please confirm that we have received them.
                    </p>
                    <p className="text-gray-600 mt-6 text-lg leading-relaxed">
                        (i) Telephone Bidding. To register for a telephone bid, complete an Absentee Bid Form and submit this to NY Elizabeth via email. In order to participate in telephone bidding, you must agree to an automatic minimum opening bid amount. This amount can change for each auction.
                        <br />
                        Please contact our gallery to confirm the minimum opening bid for the auction you would like to telephone bid on. When completing the absentee bid form, you do not need to enter an amount in the bid section of this form. That field is for absentee bids. In order to be sure your bid is received and entered on time we request that they be submitted at least 48 hours in advance of an auction. You may send a completed Bid Form by email to hello@nyelizabeth.com by submitting this form, you agree to all of our Conditions of Sale including minimum opening bid, and will be registered for the sale. A bank wire deposit is required for all phone bids. On the day of auction, a qualified member of our auction team will call you approximately three to five lots before your item is scheduled to be sold. They will confirm with you the item that you are bidding on and the minimum opening bid requirement. The team member will then relay the bidding activity to you and announce your bids to the auctioneer as you request. If you are successful, an invoice will be emailed to you the day of the auction.
                    </p>
                    <p className="text-gray-600 mt-6 text-lg leading-relaxed">
                        (ii) Absentee Bidding. There are several ways that you may submit an absentee bid (“Absentee Bid”). You may present a completed Absentee Bid Form to our staff during the auction preview online, you may place them on our website, or you can email us a completed Absentee Bid Form. By submitting an Absentee Bid, you agree to all of our Conditions of Sale and will be registered for the sale. You may send a completed Absentee Bid form by email to hello@nyelizabeth.com. By submitting this form, you agree to our Conditions of Sale and will be registered for the sale. When completing your Absentee Bid form be sure that your bid amount is the maximum amount that you are willing to bid and indicate if you would like to overbid by one increment. One of our experienced staff members will bid competitively for you up to that amount.
                    </p>
                    <p className="text-gray-600 mt-6 text-lg leading-relaxed">
                        (iii) Live Online Bidding.
                        <br />
                        For information on how to bid and buy using online bidding platforms such as LiveAuctioneers, Bidsquare, ATG, and Invaluable, please refer to the third-party websites. Any absentee bids placed with one of these online bidding platforms are released to NY Elizabeth during the time the lot is up for sale and not before. Bids placed in advance of the auction have no timed advantage over those made in real time. By registering to bid on one of our auctions through, LiveAuctioneers, Bidsquare, ATG, or Invaluable, you agree to all of our Conditions of Sale. This is a live auction and bids are accepted from the live audience (floor), absentee bids, telephone, and the internet. You may place an absentee bid online and still not prevail when the selling price is the same or, in some cases, lower than the winning bid. The auctioneer accepts bids from where he/she sees them first. Internet bids that were placed prior to the auction are transmitted to the auction gallery during live bidding and not before. The auctioneer is the final determination on who the winning bidder is. We are providing you with a service, we are not responsible for missed bids or mis-executed bids. The Auctioneer, at his sole discretion, reserves the right to reject any opening bid, which he feels is unacceptable or too low. The auctioneer also reserves the right to withdraw any property before the sale. Once the auctioneer announces ‘SOLD’, title to the property will immediately pass to the highest bidder acknowledged by the auctioneer. Once title to the property has passed to the highest bidder, such bidder (a) assumes all risks and responsibilities (b) will pay the full purchase price including buyer’s premium and applicable sales tax/VAT.
                    </p>

                    {/* Winning Bid */}
                    <h3 className="text-xl font-semibold text-gray-700 mt-6">(c) Winning Bid</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        The successful bidder is the highest bidder acknowledged by NY Elizabeth Auction. In the event of any dispute between bidders, or in the event of doubt on NY Elizabeth Auction part as to the validity of any bid, the NY Elizabeth Auction will have the final discretion either to determine the successful bidder or to re-offer and resell the article in dispute. If any dispute arises after the sale, NY Elizabeth Auction sale record shall be conclusive.
                    </p>

                    {/* Withdrawal of Items */}
                    <h3 className="text-xl font-semibold text-gray-700 mt-6">(d) Withdrawal of Items</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        NY Elizabeth Auction has the right to withdraw any article/goods from the auction during or after end of the sale. While NY Elizabeth Auction makes every effort to guarantee accuracy, in the event of a mistake on the part of auctioneer, and a lot is accidentally declared sold by mistake of the auctioneer, NY Elizabeth Auction reserves the right to cancel the sale and re-list the lot in its sole discretion. Bids may be received by NY Elizabeth Auction through the Internet or in certain cases, via e-mail.
                    </p>

                    {/* Email Bidding */}
                    <h3 className="text-xl font-semibold text-gray-700 mt-6">(e) Email Bidding</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        Bidding through an e-mail is only available to pre-qualified dealers or resellers that have paid a wire deposit in advance. If you desire to qualify as a qualified dealer, please contact us to receive an application. Approval as a qualified dealer is at the sole discretion of NY Elizabeth Auction and requires a bank approved line of credit that is reviewed and approved by a dealer development specialist at NY Elizabeth Auction.
                    </p>

                    {/* Mistaken Bids */}
                    <h3 className="text-xl font-semibold text-gray-700 mt-6">(f) Mistaken Bids</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        A bid entered by mistake on the part of a bidder is NOT grounds for a cancellation of the bid. Each bidder is responsible for his or her own account and bids. By allowing access to another who enters a bid without your knowledge will NOT be grounds for a rescission of the bid(s). Therefore, any bid made on your account will bind you to the bid in accordance with these terms. The bidder assumes full responsibility for items at the fall of the hammer (or expiration of time in an online auction). If an entity places a bid on a lot, then the person executing such bid on behalf of the entity hereby agrees to personally guarantee payment for any successful bid.
                    </p>

                    {/* Proxies */}
                    <h3 className="text-xl font-semibold text-gray-700 mt-6">(g) Proxies</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        Any bidder that represents a purchaser is personally and individually responsible for any obligations of the purchaser set forth in these terms and conditions. All purchasers purchasing pursuant to a valid resale license will need to provide appropriate documentation for removal of state sales tax (excludes motor vehicle sales).
                    </p>

                    {/* Reserve Price */}
                    <h3 className="text-xl font-semibold text-gray-700 mt-6">(h) Reserve Price</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        In the event that any reserve price of a lot is not exceeded by any bidder’s bid, NY Elizabeth Auction, in its sole discretion, with or without the knowledge of or notice to any bidder, may reduce any reserve price to an amount below the bid of bidder at any time during an auction and accept the bid made by bidder. Reserve prices are always the confidential information of NY Elizabeth Auction and are not disclosed to bidders unless specifically stated as such during bidding. Nothing contained in any listing shall be construed to disclose any reserve price. NY Elizabeth, and any consignors, reserve the right to bid on any lot(s). Unless explicitly stated otherwise, all lots are subject to a reserve price that shall be hidden from all bidders. NY Elizabeth shall act to protect the reserve by bidding in the auction process if needed. NY Elizabeth may open bidding on any lot below the reserve by placing its own bid. NY Elizabeth may continue to bid on behalf of itself up to the amount of the reserve, either by placing consecutive bids or by placing bids in response to other bidders.
                        <br />
                        Bid increments can change at any time.
                    </p>

                    {/* Fees */}
                    <h3 className="text-xl font-semibold text-gray-700 mt-6">(i) Fees</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        All bids are subject to (i) a non-refundable 25% buyer’s premium which shall be added to a successfully placed bid upon sale of each lot, (ii) any applicable local sales tax, and (iii) shipping and handling costs that are more fully described in the section entitled “Shipping and Handling” below (collectively, the “Purchase Price”). For all residents of United States an applicable sales tax will be added to your invoice. If a lot ships from our Europe location VAT fee will apply if you are part of European Union and your lot ships to a EU address.
                    </p>
                    <p className="text-gray-600 mt-6 text-lg leading-relaxed">
                        Internet Surcharge.
                        <br />
                        Clients that bid and win on Live auctioneers, Invaluable, Bidsquare, Lot-tissimo, The saleroom will incur a 4% surcharge. If you bid directly from NY Elizabeth there is no internet surcharge.
                    </p>

                    {/* Purchases After End of Auction */}
                    <h3 className="text-xl font-semibold text-gray-700 mt-6">(j) Purchases After End of Auction</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        If you purchase an item after the auction has ended, the same auction rules apply for cancelation fees.
                        <br />
                        All purchases are binding, irrevocable and non-cancelable by purchaser via live auction, buy it now, inquire, private sale, and offers.
                        <br />
                        If you are part of NY Elizabeth privates sales membership program all membership fees are non refundable and all sales are final.
                        <br />
                        Private sales members must provide written cancelation request 30 days prior to their annual renewal.
                    </p>

                    {/* Conclusion */}
                    {/* <h2 className="text-2xl font-semibold text-gray-700 mt-8">Conclusion</h2>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        Duis nec metus id lorem tempus faucibus. Vestibulum pharetra nisl et mi tincidunt, ac dapibus neque pellentesque.
                    </p> */}


                    <h2 className="text-2xl mt-6 text-gray-700 font-bold mb-4">3. PAYMENT</h2>

                    {/* Subsection: Catalog Descriptions */}
                    <div className="mb-6">
                        <h3 className="text-xl text-gray-700 font-semibold mb-2">(a) Catalog Descriptions</h3>
                        <p className="text-gray-700 leading-relaxed">
                            Each lot in the catalog is briefly described and given a low and high estimate. This estimate represents a conservative range which, in the opinion of NY Elizabeth, represents a fair and probable auction value. When possible, the estimate is based on previous auction records of comparable property, condition, rarity, quality, and provenances. Estimates are subject to change prior to an auction. Actual prices realized for items can fall below or above this range. An estimate of the selling price should not be relied on as a statement that this is the price at which the item will sell or its value for any other purpose. Estimates do not include the buyer’s premium.
                        </p>
                    </div>

                    {/* Subsection: Payment Methods */}
                    <div className="mb-6">
                        <h3 className="text-xl text-gray-700 font-semibold mb-2">(b) Payment Methods</h3>
                        <ul className="list-disc pl-5 text-gray-700 space-y-2">
                            <li>Payment for items can be made via credit card, Bank Wire Transfer, Zelle, or ACH. ACH payments must clear prior to shipment of Goods and are limited to up to $20,000 per month per customer.</li>
                            <li>If you like to use your credit card to send an ACH, you may do so using{' '}
                                <a href="https://wise.com/" className="text-blue-500 hover:underline">Wise</a> up to $2,000 USD per day (per 24 hours) using your Visa or MasterCard, up to $8,000 USD.</li>
                            <li>All other payments made via credit card or ACH are processed via Live Auctioneers (https://www.liveauctioneers.com/). All Payments must clear prior to shipment of Goods.</li>
                            <li>If you are a business entity located in the United States and purchasing inventory for your business from NY Elizabeth, you can use Melio (https://melio.me/nyelizabeth) to process your payment via credit card up to $10,000 USD per month.</li>
                            <li>Automotive, real estate, jewelry, and watch purchases only accept bank wire transfers or Zelle. In the event that payment for jewelry is not completed within a two-day period, NY Elizabeth reserves the right to substitute the items with ones of similar value and quality or provide a refund for the item minus 25% of hammer price and a $75 administrative fee.</li>
                            <li>For Art purchases, we accept bank wire or Zelle. Payments for art must be submitted within two (2) business days.</li>
                            <li>Bank wires must be submitted within two (2) business days from the end of the auction. You can email bank wire confirmation to hello@nyelizabeth.com together with your invoice number.</li>
                        </ul>
                    </div>

                    {/* Subsection: Invoicing and Payment */}
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">(c) Invoicing and Payment</h3>
                        <p className="text-gray-700 leading-relaxed">
                            All invoices are submitted the same day of the auction to your email on file. If you did not receive an email from us within 5 hours of the auction ending, check your spam folder or email us at hello@nyelizabeth.com and we will resend it to you. All payments are due within two (2) business days from the date of the auction.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            Payments that are not received within the allotted time shall incur a cancellation fee equal to 25% of the hammer price, plus a $75 administrative fee per lot.
                        </p>
                    </div>
                    <p className="text-gray-700 leading-relaxed mt-2">
                        All payments must be made to NY Elizabeth.
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-2">
                        All payments must be paid in full. If a client has sent partial payment of an invoice without NY Elizabeth written approval to pay in partial payments NY Elizabeth has the right to cancel the invoice and deduct the 25% cancelation fee and $75 administrative fee and refund if any balance to the client. All invoices must be paid on time.
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-2">
                        If you have won a lot on Live Auctioneers and pay via the Live Auctioneers platform, your delivery date can be delayed. Note that Live Auctioneers will not charge your credit card as we don’t accept credit card based on certain amounts.
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-2">
                        You may not initiate a chargeback with your credit card issuer or banking institution to avoid payments due to NY Elizabeth. If you have any dispute as to the total amount charged to you or any amounts due, you may contact hello@nyelizabeth.com. We reserve the right to provide all evidence of bids placed, IP addresses, and other necessary in order to challenge or dispute any chargebacks. There will be a non-refundable fee of $150 for each chargeback initiated by you with your credit card issuer or banking institution.
                    </p>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">(d) International Payments</h3>
                        <p className="text-gray-700 leading-relaxed">
                            International invoices over $500 require a bank wire transfer only.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">(e) Refunds; Returns</h3>
                        <p className="text-gray-700 leading-relaxed">
                            All auction and private sales are final. However, if for any reason we are prevented by fire, theft, or any other reason whatsoever from delivering any property to the purchaser, our liability shall be limited to the sum actually paid, by the purchaser for such property. All property is sold AS IS, WHERE IS, with all faults and ALL SALES ARE FINAL. Returns may only be made with written authorization of NY Elizabeth, in NY Elizabeth sole discretion. To request a return, you must provide a written request fully explaining the basis for the return no later than ten (10) days after the date of sale. Under no circumstances will any amounts other than the winning bid amount be refunded. A restocking fee of 25% of the full invoice amount may apply. All authorized returns must be received in exactly the same condition as when originally shipped to Buyer, or they will be returned to Buyer at Buyers expense. Any unauthorized returns will be refused. The Buyer is responsible for all shipping costs associated with returns of an item. The previously paid Buyer’s premium is not refundable. Please bid responsibly and direct any questions you may have prior to placing a bid 48 hours before end of an auction.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            In the event that payment for jewelry or handbags is not completed within a two-day period, NY Elizabeth reserves the right to substitute the items with ones of similar value and quality or provide a refund for the item minus 25% of hammer price and a $75 administrative fee.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">(f) Cancellations</h3>
                        <p className="text-gray-700 leading-relaxed">
                            If you wish to cancel a winning bid, please contact us to get approval for cancellation, NY Elizabeth charges a 25% cancellation fee, plus a $75 administrative fee per lot.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            We hereby reserve the right to report any non-payment to credit and collection agencies in our sole discretion. This can affect your credit score and you might get a judgement against you for the balance owed to NY Elizabeth, in addition to all legal fees incurred regarding your cancelation nonpayment invoice. We reserve the right to charge a non-refundable fee of $1,450 for attorney’s fees incurred in the collection of any unpaid cancellation fees. NY Elizabeth may proceed with legal action as to non-paid invoices in the jurisdiction, country and/or state of the winning bidder.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            IN THE EVENT THAT YOU BID AND ARE DEEMED THE WINNER OF AN ITEM BY NY ELIZABETH AUCTION BUT FAIL TO MAKE PAYMENT IN ACCORDANCE WITH THE INVOICE SENT TO YOU OR CLAIM A DISPUTE WITH ANY THIRD-PARTY PAYMENT INTERMEDIARY, SUCH AS A CREDIT CARD COMPANY, YOU WILL BE ASSESSED A CHARGE OF 25% OF THE HAMMER PRICE AS LIQUIDATED DAMAGES. BY BIDDING ON ANY SUCH LOT, YOU HEREBY AGREE TO THE PAYMENT OF SUCH LIQUIDATED DAMAGES AS A RESULT OF THE IRREPARABLE HARM THAT WILL BE SUSTAINED BY NY ELIZABETH AUCTION. FURTHERMORE, IN THE EVENT THAT A WINNING BIDDER FAILS TO MAKE ANY PAYMENTS UNDER THESE TERMS AND CONDITIONS, INCLUDING THE LIQUIDATED DAMAGES DESCRIBED HEREIN, WE RESERVE THE RIGHT TO REPORT SUCH NONPAYMENT TO CREDIT AND COLLECTION AGENCIES IN OUR SOLE DISCRETION. ITEMS NOT PICKED UP WITHIN 30 DAYS WILL BE RE-AUCTIONED TO COVER STORAGE FEES. STORAGE FEES ARE $25 PER DAY FOR ART, HANDBAGS, AND JEWELRY AND FOR VEHICLES $100 PER DAY.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">(g) Rejection of Bids</h3>
                        <p className="text-gray-700 leading-relaxed">
                            NY Elizabeth Auction reserves the right to reject any bid at any time and at his sole discretion. NY Elizabeth Auction additionally reserves the right in its sole and unlimited discretion at any time prior to, during, or even after the close of the auction to exclude any person or individual bid and to award any lot to the highest accepted bid. NY Elizabeth reserves the right to re-auction/sale any winning item within 14 days close of auction if left unpaid by winning bidder. NY Elizabeth Auction reserves the right to withdraw any lot at any time before, during, or after the auction without liability.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">(h) Late Fees</h3>
                        <p className="text-gray-700 leading-relaxed">
                            In addition to other remedies available to us by law, we reserve the right to impose a late charge of 1.5% per month of the total Purchase Price if payment is not made, or payment is not complete in accordance with the conditions set forth herein.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">(i) Partial Payments</h3>
                        <p className="text-gray-700 leading-relaxed">
                            In the event that a buyer pays a portion of the Purchase Price for any or all lots purchased, NY Elizabeth Auction shall apply the payment received to such lot or lots that NY Elizabeth Auction, in its sole discretion deems appropriate. Also If a buyer has submitted partial payment and does not complete full payment within ten (10) days from the end of the auction a $20 per day fee is applied per item ($100 per day for Automotive Goods).
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">(j) Sales Tax</h3>
                        <p className="text-gray-700 leading-relaxed">
                            A Buyer’s premium will be added to the hammer price of each lot. The buyer’s premium for live bidding (this includes floor, phone, and absentee) is 25%. There is a handling charge of $100.00 for dishonored checks. Any nonpayment or bounced checks will be prosecuted to the fullest extent of the law.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">(k) Non-Payment</h3>
                        <p className="text-gray-700 leading-relaxed">
                            If we do not receive payment in full, in good cleared funds, within three (3) business days following the sale, we are entitled in our absolute discretion to exercise one or more of the following measures, in addition to any additional actions available to us by law:
                        </p>
                        <ul className="list-disc pl-5 text-gray-700 space-y-2">
                            <li>to impose a late charge of one and a half percent (1.5%) per thirty (30) days of the total purchase price,</li>
                            <li>to hold the defaulting buyer liable for the total amount due and to begin legal proceedings for its recovery together with interest, legal fees and costs to the fullest extent permitted under applicable law,</li>
                            <li>to cancel the sale,</li>
                            <li>to resell the property publicly or privately with such terms as we find appropriate. Any invoices not paid in full within 7 days will be charged a clerical charge of $10/per week per lot plus an initial $75 administrative fee. NY Elizabeth shall have no liability for any damage to property left on its premises for more than seven (7) business days following the sale,</li>
                            <li>commence legal proceedings to recover the Purchase Price, together with interest and the costs of such proceedings,</li>
                            <li>set off the outstanding amount remaining unpaid by the buyer against any amounts which NY Elizabeth Auction, or our affiliated companies, may owe the buyer in any other transactions, or</li>
                            <li>take such other action as we deem necessary or appropriate.</li>
                        </ul>
                    </div>


                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">4. CONDITION OF ITEMS</h3>
                        <p className="text-gray-700 leading-relaxed">
                            (a) Condition Reports.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            The condition of an item may not be stated in the description of the item. The absence of a condition report does not mean that the item is free of damage or condition issues. Some items do show signs of age or wear. NY Elizabeth Auction strongly suggests that you do not bid or purchase an item without requesting a condition report. Condition reports are usually available on request, on lots with a low estimate of $300 and above. Condition reports are answered in the order that they were received. Please understand that regardless of when you request condition information, we will not respond to the request until the week prior to the auction date. Unfortunately, we cannot honor condition reports requested less than 48 hours prior to an auction. Any condition statements are given as a courtesy to prospective buyers. Condition reports are only an opinion and should not be treated as a statement of fact. NY Elizabeth Auctions shall have no responsibility for any error or omission. Any lot that has multiple pieces will not have a detailed condition report given, you may send a representative in for you. We are not responsible for any omissions in descriptions or in any condition reports, your only guarantee is to preview the items yourself, or have an agent preview for you.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            (b) AS IS.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            All items are sold AS IS, where is, with all faults, and all sales are final. There are no warranties expressed or implied. NY Elizabeth Auction is not responsible for the correctness, nor has NY Elizabeth Auction deemed to have made any representation or warranty on the description, quality, size, importance, genuineness, authorship, attribution, provenance, period, culture, source, origin, or condition of the property. All items are described briefly in our catalog, for detailed descriptions please send an email to hello@nyelizabeth.com. The absence of a condition statement does not imply that the lot is in perfect condition or completely free from wear and tear, imperfections, or the effects of aging. All mechanical items- such as clocks, watches and music boxes are sold as-is, please assume that they are not working.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            NY Elizabeth Auction does not guarantee authorship or signatures of paintings. Your registration and participation in bidding will signify that you have examined the items as fully as you desire via our online catalog. Written and oral descriptions are our opinions and should in no way be construed as a guarantee of any kind as to age, condition, materials, or any other feature of items being sold. Our goal is to provide prospective bidders with accurate and detailed information; however, we recommend that prospective bidders examine all items in which they have an interest. If you require absolute certainty as to the authenticity of an item, and you are still uncertain after your evaluation of such item, we recommend you not bid on the item in question. No statement written or oral made by the auctioneer or any employees shall be deemed a warranty or assumption of liability by NY Elizabeth Auction or by any seller represented by NY Elizabeth Auction. All sales are final. No refunds or exchanges.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            The buyer is responsible for paying all shipping fees. We and the consigner (as applicable disclaim any and all warranties). No warranties are made that any of the merchandise complies with any applicable governmental rules, regulations, or ordinances of any kind. All items are available for inquiries prior to bidding. Written and oral descriptions are the opinions of NY Elizabeth Auction and should in no way be construed as a guarantee of any kind as to authenticity, age, condition, materials or any other feature of items being sold.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            NY Elizabeth Auction believes to the best of its knowledge that the information presented in for any item available for sale has come from reliable sources. However, such information is presented solely for the convenience of the prospective purchasers.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            NY Elizabeth Auction attempts to catalog every lot correctly and will attempt to point out any defects but will not be responsible or liable for the correctness of the catalog or other descriptions of the lot. It is the responsibility of prospective bidders to examine all items in which they have an interest. By placing a bid, in any capacity, you acknowledge that you have examined the items as fully as you desire via our online catalog and have had the opportunity to ask questions and receive answers from NY Elizabeth Auction that you deem adequate. If you require absolute certainty in all areas of authenticity, and the results of your evaluation leave uncertainty in your mind, do not bid on the lot in question.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            Items may be located in multiple locations. The auctioned items are not owned by NY Elizabeth auction and are consigned for sale by a third party through the Services.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">5. SHIPPING AND HANDLING OF ITEMS</h3>
                        <p className="text-gray-700 leading-relaxed">
                            Our corporate address is in United States; however, this does not mean all items ship from United States. We do not ship any goods directly; all shipping is done by third party entities (FedEx, DHL, UPS, USPS, Royal mail, etc.) unless otherwise stated. Items sold by us are sourced from multiple channels and there are no assurances that any of the items being sold have been in estates.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            Shipment of Goods typically takes 7-10 business days after payment.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            If you do not receive the Goods items within 30 days from the date of shipment, promptly contact NY Elizabeth at hello@nyelizabeth.com.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            NY Elizabeth does not keep shipping records after sixty (60) days of an item’s shipment date.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            WE ARE UNABLE TO ALLOW ITEMS TO BE PICKED UP IN PERSON. THERE IS A $75 PICK-UP FEE PER LOT FROM A THIRD-PARTY SHIPPING COMPANY. ALL ITEMS WILL BE SHIPPED VIA THIRD PARTY OR YOU MAY OBTAIN YOUR OWN INSURED BONDED SHIPPING METHOD. WE ARE NOT RESPONSIBLE FOR ADDITIONAL FEES INCLUDING BUT NOT LIMITED TO VAT DUTIES, BROKER FEES, AND OTHER IMPORT FEES.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            (a) Insurance.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            If Buyer requires theft insurance prior to shipment, the Buyer will need to obtain independently as NY Elizabeth doesn’t obtain insurance on a Buyer’s behalf. Shipments processed through LiveAuctioneers will include insurance.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            (b) International Exports:
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            When you purchase any goods located outside of the United States you agree to designate NY Elizabeth as your shipment agent and designate NY Elizabeth as attorney-in-fact to sign all applicable customs documents to have the purchased Goods shipped to the United States.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">6. NOTICES & DISCLAIMERS</h3>
                        <p className="text-gray-700 leading-relaxed">
                            REGARDING SPECIFIC ITEM TYPES
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            (a) Vehicles (automobiles, aircraft, and watercraft).
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            For vehicle purchases, if purchased in the same state as the auction you must pay a license and registration in order to operate the vehicle, otherwise the item will be delivered on a truck and shipped via port outside the United States. The Final bidder is responsible for all shipping fees and import/export taxes. For all vehicle purchases payment must be paid via bank wire within 48 hours. If Wire is not received within 48 hours, we reserve the right to re-auction the vehicle or sell it privately. You will receive an email invoice with wire instructions within 24 hours after the auction has ended. Certain Vehicles require CHP inspection before leaving our lot, and this process can take 8 to 12 weeks. We encourage all bidders to ask all questions before placing a bid. You understand and agree that mileage provided for automotive purchases may be inaccurate. All vehicles are auctioned as-is.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            On the purchase of automotive, aircraft, and watercraft, you grant NY Elizabeth power of attorney to sign all purchase agreement documents between NY Elizabeth, the consignor and you (if the winning bidder). Please allow up to thirty (30) days from the date of delivery of the vehicle in order to you to receive the vehicle’s certificate of title (i.e. pink slip).
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            Our vehicle descriptions are accurate to the best of our knowledge at the time posted to our website and other auction platforms. All information provided is true to our best efforts, but not guaranteed, and we assume no liability for any omissions or errors. We sell classic cars in a variety of conditions and may not see every imperfection or issue per vehicle. Our cars are sold as-is and without warranty. Advertised prices exclude any government fees, dealer document preparation charges, or any emission testing charges. We always try to make cars available for inspection and test drives. Our low and high estimates are our opinions of our auction house and could reflect new, current, or future appraisals. If you have a resale permit, you must email us a copy of your permit before the auction date and receive approval from our team for your resale permit.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            (b) Jewelry, watches, and loose stones. NY Elizabeth Auction inspects all jewelry, watches, accessories, and loose stones for appraisals. All such lots are sold AS IS and may have been worn, been previously repaired, altered, customized (including having been modified with after-market stones or had the bezel changed in its entirety on certain jewelry or watches), or been embellished. For purposes of our actions, the terms custom, modified, or after-market may be used interchangeably. Such wear, repair or changes may display varying levels of evidence.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            The bidder hereby acknowledges that the absence of any reference to the condition of a lot does not imply the absence of wear, repairs, customization, or defects. While NY Elizabeth Auction makes every effort to call to the attention of bidders the use of after-market parts in jewelry and watches sold, the use of such parts or stones shall not constitute a warranty or representation that the items are original in their entirety. These modifications, customizations, and alterations may impair the ability of the original manufacturer to repair such item or certify the item as authentic All descriptions and statements related to such lots, including measurement, authorship, source or origin, or other aspects are qualified opines and do not constitute a warranty or representation and are provided for identification purposes only. Not all jewelry, watches or loose stones are appraised, and the appraisals are provided for bidders only in certain instances at the discretion of NY Elizabeth Auction.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            Our appraisals are conducted by independent third-party appraisal firms. Such firms may be certified GIA Gemologists or have education in the industry or alternative certifications. Appraisals should be used for verification of gemstone and/or metal weight, size, and grade only, not actual value for resale or insurance purposes. Appraisal value should be not considered for actual value, as price varies greatly from retail locations and other merchants in different geographic locations. All Items auctioned by NY Elizabeth Auction should not be purchased with a view or expectation toward resale for appraisal price given, or to make a profit. The ultimate value for which an item can be resold may vary drastically from the appraisals listed by NY Elizabeth Auction. All dimensions and weights of such lots are approximate and are consistent with standards and practices in the industry. Condition reports are provided as a service to prospective bidders. Bidders should note that such descriptions are not warranties and that watches may need general service, change of battery or further repair work for which the buyer is solely responsible. Certain art and watch bands from protected species of animals (i.e. alligator, crocodile) and items made of ivory and tortoise may be subject to restrictions in certain countries.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            (c) Memorabilia.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            NY Elizabeth Auction may have an interest in certain third-party authenticators and bidder hereby waives any potential conflicts therein related to NY Elizabeth Auction relationship with such authenticators. NY Elizabeth Auction is not responsible for the opinions of any of the third-party authenticators. You should in no way rely exclusively on such third-party opinions without conducting your own due diligence prior to bidding.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            (d) Coins and Currency.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            No material certified by third parties may be returned to NY Elizabeth Auction because of a possible difference of opinion with respect to the grade offered by such third-party organization, dealer, or service.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            No guarantee of grade is offered for uncertified lots sold and then subsequently submitted to a third-party grading service. There are absolutely no exceptions to this policy. Any coins sold referencing a third-party grading service as sold AS IS without any express or implied warranty. Notes sold referencing a third-party grading service are sold AS IS without any express or implied warranty. Grading, condition or other attributes of any lot may have a material effect on its value, and the opinion of others, including third-party grading services may differ with that of NY Elizabeth Auction. NY Elizabeth Auction shall not be bound by any prior or subsequent opinion, determination, or certification by any grading service. Bidder specifically waives any claim to right of return of any item because of the opinion, determination, or certification, or lack thereof, by any grading services.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            Third-party graded notes are not returnable for any reason whatsoever. Due to changing grading standards over time, differing interpretations and to possible mishandling of items by subsequent owners, NY Elizabeth Auction reserves the right to grade items differently than shown on certificates from any grading service that accompany the items. NY Elizabeth Auction also reserves the right to grade items differently than the grades shown in the prior catalog should such items be re-consigned or reoffered in any future auction. Although consensus grading is employed by most grading services, it should be noted as aforesaid that grading is not an exact science and various third-party grading services, or even different employees from the same grading service may grade the same lot differently. Bidder fully understands and is aware of such potential inconsistencies and is bidding with such knowledge.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            Certification does not guarantee protection against the normal risks associated with potentially volatile markets. The degree of liquidity for certified coins and collectibles will vary according to general market conditions and the particular lot involved. For some lots there may be no active market at all at certain points in time. Bidders are advised that certain types of plastic may react with a coin’s metal or transfer plasticizer to notes and may cause damage. Caution should be used to avoid storage in materials that are not inert.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            (e) Stamps and Philatelic Items.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            No stamps or philatelic items may be returned because of a possible difference of opinion with respect to the grade offered by any third-party organization, dealer, or service. No guarantee of grade is offered for ungraded items sold and subsequently submitted to a third-party grading service. There are absolutely no exceptions to this policy. Multiple stamp or philatelic lots, including sets, collections, large lots, and small group lots, whether certified or not, are sold AS IS without warranty of any kind. There are absolutely no exceptions to this policy. Any stamps and philatelic items referencing a third-party certification or grading service are sold AS IS. Bidder shall solely rely upon warranties of the authentication provider issuing the certificate or opinion. Grading, condition or other attributes of any lot may have a material effect on its value, and the opinion of others, including third-party grading services may differ with that of NY Elizabeth Auction.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            The grading of stamps and philatelic items is a matter of opinion, an art and not a science, and therefore the opinion rendered by NY Elizabeth Auction, or any third-party grading service may not agree with the opinion of others (including trained experts).
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            (f) Real Estate and Land.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            Bidder understands that NY Elizabeth is conveying the described property as-is, where-is and winning bidder agrees to purchase property as such. No verbal claims or promises have been made to winning bidders which do not appear in writing. Winning bidder understands NY Elizabeth has never occupied or visited the property personally and winning bidder is not relying on NY Elizabeth as to condition of the property. Winning bidder acknowledges that the property is acceptable to them in its presently existing condition. Please do your own due diligence. Some images may not represent actual property image.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            In the event NY Elizabeth Auction cannot deliver the lot or subsequently it is established that the lot lacks title, or other transfer or condition issues is claimed, NY Elizabeth Auction liability shall be limited to the rescission of sale and refund of the Purchase Price; in no case shall NY Elizabeth Auction maximum liability exceed the high bid on the lot, which shall be deemed for all purposes the value of the lot. After one year has elapsed from the close of the sale, NY Elizabeth Auction maximum liability shall be limited to any commissions and fees earned on the lot.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            (g) Art.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            The date provided for any paintings or any art auctioned is approximate and may be newer or older than the date provided. All dates and information about a painting are provided to the best of our knowledge. Written and oral descriptions of paintings or art are the opinions of NY Elizabeth Auction and should in no way be construed as a guarantee of any kind as to authenticity, age, condition, materials or any other feature of items being sold.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            All paintings are measured by sight size and all measurements are given with the height preceding the width. Unless otherwise stated in the description, all pictures are framed. All weights and measurements are approximate.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            The attributions included on the descriptions will follow the below examples:
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            “Attributed to Pablo Picasso” – In our opinion, on the basis of style, the work can be ascribed to the named artist but less certainty as to authorship is expressed than in the preceding category.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            “Studio of Pablo Picasso” – In our opinion, a work by an unknown hand in the studio of the artist, which may or may not have been executed under the artist’s direction.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            “Circle of Pablo Picasso” – In our opinion, a work by an as of yet unidentified but distinct hand closely associated with the named artist but not necessarily his pupil.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            “Style of or Follower of Pablo Picasso” – In our opinion, a work by a painter working in the artist’s style, contemporary or nearly contemporary, but not necessarily his pupil.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            “Manner of Pablo Picasso” – In our opinion, a work in the style of the artist and of a later date.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            “After Pablo Picasso” – In our opinion, a copy of a known work of the artist.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            Please note that the term “signed and/or dated and/or inscribed” means that, in our opinion, a signature and/or date and/or inscription are from the hand of the artist.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            The term “bears a signature and/or date and/or an inscription” means that, in our opinion, a signature and/or date and/or inscription have been added by another hand.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">7. CRYPTOCURRENCY DISCLAIMER</h3>
                        <p className="text-gray-700 leading-relaxed">
                            NY Elizabeth is not a broker, financial institution, or creditor. NY Elizabeth facilitates transaction between the buyer and the seller in the auction but not a party to any agreement between the buyer and the seller of crypto assets or between any users. “Crypto Assets” refers to unique non-fungible tokens, implemented on the Ethereum or Binance blockchain using smart contracts, including without limitation Ethmoji, CryptoKitties, CryptoCelebrities, and CryptoPunks. You may only participate in the Auction by linking your digital wallets on supported bridge extensions such as MetaMask (https://metamask.io/) MetaMask is an electronic wallet, which allows you to purchase, store, and engage in transactions using Ethereum cryptocurrency.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">8. DISCLAIMER OF WARRANTIES</h3>
                        <p className="text-gray-700 leading-relaxed">
                            Neither NY Elizabeth Auction nor the consignor, as applicable, make any warranties or representations of any kind or nature with respect to property or its value, and in no event shall be responsible for the correctness of description, genuineness, attribution, provenance, authenticity, authorship, and completeness, condition of property or estimate of value. Any appraisals, Estimates (as defined herein) or evaluations provided are solely for the convenience of the bidder and NY Elizabeth Auction makes no warranties of any kind relating to them. Appraisals may include valuations which reflect the full, highest retail price of the item in a specific geographic region. The terms Estimate or Estimated Value (collectively “Estimate”) as used herein may be an arbitrary value and may fail to represent an actual resale value, insurance replacement value, or cost of a similar good. Similarly, no appraisal value should be considered to represent the actual resale value, insurance replacement value, or cost of a similar good. No statement (oral or written) shall be deemed such a warranty or representation, or any assumption of responsibility. In no circumstance will a vastly different appraisal or estimate of any third-party given on behalf of a purchaser in a NY Elizabeth Auction be grounds for a return, cancellation or refund. All measurements given are approximate and within industry standards and customs.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">9. PROHIBITED USES</h3>
                        <p className="text-gray-700 leading-relaxed">
                            Use of the Services is limited to the permitted uses expressly authorized by us. Any violation of this Agreement by your user content, as determined by NY Elizabeth Auction in its sole discretion, may result in the termination of your access to the Services.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            The Services shall not be used to:
                        </p>
                        <ul className="list-disc pl-5 text-gray-700 space-y-2">
                            <li>Harass, abuse, stalk, threaten, defame, or otherwise infringe or violate the rights of any other party (including but not limited to rights of publicity or other proprietary rights);</li>
                            <li>Engage in any unlawful, fraudulent, or deceptive activities;</li>
                            <li>Misrepresent the source, identity, or content of information transmitted via the Services;</li>
                            <li>Use technology or other means to access unauthorized content or non-public spaces;</li>
                            <li>Use or launch any automated system or process, including without limitation, “bots,” “spiders,” or “crawlers,” to access unauthorized content or non-public spaces;</li>
                            <li>Attempt to introduce viruses or any other harmful computer code, files or programs that interrupt, destroy or limit the functionality of any computer software or hardware or telecommunications equipment;</li>
                            <li>Probe, scan, or test the vulnerability of the Services or any system or network; use any robot, spider, scraper or other automated means to access the Services for any purpose without our express written permission;</li>
                            <li>Use the Services in connection with hazardous environments requiring fail-safe performance or any application in which the failure or inaccuracy of that application or the Services could lead to death, personal injury, or physical or property damage;</li>
                            <li>Modify the Services in any manner or form; use or develop any application that interacts with the Services or provides access to other users’ content or information without our written permission; or use modified versions of the Services, including to obtain unauthorized access to the Services;</li>
                            <li>Attempt to damage, disable, overburden, or impair our servers or networks;</li>
                            <li>Attempt to gain unauthorized access to the Services, or any part of it, other accounts, computer systems or networks connected to NY Elizabeth Auction, or any part of it, through hacking, password mining or any other means, or interfere or attempt to interfere with the proper working of or any activities conducted on the Services;</li>
                            <li>Display the Services or profile data on any external display or monitor or in any public setting without obtaining the prior consent of all participants. Furthermore, you may not display the Services or profile data on any external display or monitor or in any public setting in a manner that infringes on the intended use of the Services;</li>
                            <li>Encourage the commission or encouragement of any illegal purpose, or in violation of any local, state, national, or international law, including laws governing criminal acts, prohibited or controlled substances, intellectual property and other proprietary rights, data protection and privacy, and import or export control; or</li>
                            <li>violate these Terms in any manner;</li>
                        </ul>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">10. INTELLECTUAL PROPERTY RIGHTS</h3>
                        <p className="text-gray-700 leading-relaxed">
                            You are granted a non-exclusive, non-transferable, revocable license to access and use the Services strictly in accordance with these Terms. As a condition of your use of the Services, you warrant to Us that you will not use the Services for any purpose that is unlawful or prohibited by these Terms. You may not use the Services in any manner which could damage, disable, overburden, or impair the Services or interfere with any other party’s use and enjoyment of the Services. You may not obtain or attempt to obtain any materials or information through any means not intentionally made available or provided for through the Services.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            All content included as part of the Services, such as text, graphics, videos, logos, images, as well as the compilation thereof, and any software used on the Services, is the property of NY Elizabeth Auction or its suppliers and protected by copyright and other laws that protect intellectual property and proprietary rights. You agree to observe and abide by all copyright and other proprietary notices, legends or other restrictions contained in any such content and will not make any changes thereto.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            You will not modify, publish, transmit, reverse engineer, participate in the transfer or sale, create derivative works, or in any way exploit any of the content, in whole or in part, found on the Services. Our content is not for resale. Your use of the Services does not entitle you to make any unauthorized use of any protected content, and in particular you will not delete or alter any proprietary rights or attribution notices in any content. You will use protected content solely for your personal use and will make no other use of the content without the express written permission of NY Elizabeth Auction and the copyright owner. You agree that you do not acquire any ownership rights in any protected content. We do not grant you any licenses, express or implied, to the intellectual property of NY Elizabeth Auction or our licensors except as expressly authorized by these Terms.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">11. DMCA NOTICE AND TAKEDOWN POLICY</h3>
                        <p className="text-gray-700 leading-relaxed">
                            NY Elizabeth Auction respects intellectual property rights and expects its users to do the same. If you are a copyright owner or an agent thereof, and you believe that any content hosted on any of the Services infringes Your copyrights, then you may submit a notification by providing NY Elizabeth Auction’ Designated Copyright Agent with the following information in writing:
                        </p>
                        <ul className="list-disc pl-5 text-gray-700 space-y-2">
                            <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed;</li>
                            <li>Identification of the copyrighted work claimed to have been infringed, or if multiple copyrighted works on the applicable Services are covered by a single notification, a representative list of such works on the applicable Services;</li>
                            <li>Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit NY Elizabeth Auction to locate the material; Information reasonably sufficient to permit NY Elizabeth Auction to contact the complaining party, such as an address, telephone number, and, if available, an electronic mail address at which the complaining party may be contacted;</li>
                            <li>A statement that the complaining party has a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law (for example, “I am under the good faith belief that the use of the copyrighted content that is identified herein is not authorized by the copyright owner, its agent, or the law.”); and</li>
                            <li>A statement that the information in the notification is accurate, and under penalty of perjury, that the complaining party is authorized to act on behalf of the owner of an exclusive right that is allegedly infringed (for example, “I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or authorized to act on behalf of the copyright owner, of the copyright(s) that is allegedly infringed by the aforementioned content.”).</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            NY Elizabeth Auction’s Designated Copyright Agent to receive notifications of claimed infringement can be reached as follows:
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            NY Elizabeth
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            hello@nyelizabeth.com
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            Attention: Copyright Claims
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            For clarity, only notices under this section should go to the NY Elizabeth Auction Designated Copyright Agent. You acknowledge that if you fail to comply with all of the requirements of this Section, your DMCA notice may not be valid. Please note that under Section 512(f) of the U.S. Copyright Act, any person who knowingly materially misrepresents that material or activity is infringing may be subject to liability.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">12. FEEDBACK</h3>
                        <p className="text-gray-700 leading-relaxed">
                            You can submit questions, comments, suggestions, ideas, original or creative materials or other information about NY Elizabeth Auction or the Services (collectively, “Feedback”). Feedback is non-confidential and shall become the sole property of NY Elizabeth Auction. We shall own exclusive rights, including, without limitation, all intellectual property rights, in and to such Feedback and shall be entitled to the unrestricted use and dissemination of this Feedback for any purpose, commercial or otherwise, without acknowledgment or compensation to you.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">13. LINKS TO THIRD PARTY WEBSITES/THIRD-PARTY SERVICES</h3>
                        <p className="text-gray-700 leading-relaxed">
                            The Services may contain links to other brands or services (“Linked Website“). The Linked Websites are not under our control, and We are not responsible for the contents of any Linked Websites, including without limitation any link contained in a Linked Website, products or merchandise sold through the Services, or any changes or updates to a Linked Website. We are providing these links to you only as a convenience, and the inclusion of any link does not imply our endorsement of the services or any association with its operators. Certain services made available through the Services are delivered by third parties and organizations and these Terms do not apply to any Linked Website. By using any product, service or functionality originating from the Services, you hereby acknowledge and consent that We may share such information and data with any third party with whom We have a contractual relationship to provide the requested product, service, or functionality on behalf of NY Elizabeth Auction and customers.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            To the fullest extent permitted by applicable law, you hereby release and forever discharge Us (and our officers, employees, agents, successors, and assigns) from, and hereby waive and relinquish, each and every past, present and future dispute, claim, controversy, demand, right, obligation, liability, action and cause of action of every kind and nature (Including personal injuries, emotional distress, identity theft, death, and property loss and damage), that has arisen or arises directly or indirectly out of, or relates directly or indirectly to, (a) any interactions with, or act or omission of, or user content provided by, other Users of the Services or (b) any third-party site, products, services, and links Included on or accessed through the NY Elizabeth Auction Services. If you are a California resident, you hereby waive California civil code section 1542 in connection with the foregoing, which states: “a general release does not extend to claims which the creditor does not know or suspect to exist in his or her favor at the time of executing the release, which if known by him or her must have materially affected his or her settlement with the debtor.” resolving any disputes.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">14. THIRD PARTY ACCOUNT LOGIN</h3>
                        <p className="text-gray-700 leading-relaxed">
                            If you register with the Services by using your Google, Facebook, Instagram, Apple, or other related accounts (individually, as a “Third Party Account”) login information, you authorize us to access and use certain Third-Party Account information, including, but not limited to, any of your Third-Party Account public profile and other information such as the profiles of Facebook friends or Instagram followers you might share in common with other Users. Please note that if your Third-Party Account or associated service becomes unavailable or if our access to such account is terminated by the third-party Host, the Third-Party Account content will no longer be available on or through the Services. You have the ability to disable the connection between your Account and your Third-Party Account, at any time. Your relationship with such Third-Party Hosts associated with your Third-Party Accounts is governed solely by your Agreement(s) with such Third-Party Hosts. We make no effort to review any Third-Party Account content for any purpose, including, but not limited to, for accuracy, legality or non-infringement, and We are not responsible for any Third-Party Account content.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">15. TERMINATION OR SUSPENSION OF SERVICES</h3>
                        <p className="text-gray-700 leading-relaxed">
                            NY Elizabeth Auction reserves the right to refuse or cancel a sale or suspend access to any user, for any reason or no reason, and without any notice. NY Elizabeth Auction may suspend your use of the NY Elizabeth Auction Services or any portion thereof if NY Elizabeth Auction believes that you have breached these Terms, or for any other reason, at its sole discretion. You agree that any termination of your access to the NY Elizabeth Auction Services may be without prior notice, and you agree that NY Elizabeth Auction will not be liable to you or any third party for any such termination. Where needed, we reserve the right to alert local law enforcement authorities about suspected fraudulent, abusive, or illegal activity that may be grounds for termination of your use of the Services.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">16. ERRORS, INACCURACIES AND OMISSIONS</h3>
                        <p className="text-gray-700 leading-relaxed">
                            Occasionally there may be information on the Services that may contain typographical errors, inaccuracies or omissions that may relate to product or service descriptions, pricing, promotions, offers, charges and availability. We reserve the right to correct any errors, inaccuracies or omissions, and to change or update information or cancel transactions if any information in the Services is inaccurate at any time without prior notice. We undertake no obligation to update, amend or clarify information on the Services, except as required by law. No specified update or refresh date applied in the Services, should be taken to indicate that all information in the Services has been modified or updated.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            WE DO NOT REPRESENT, WARRANT OR OTHERWISE ENDORSE THAT THE SERVICES OR ANY CONTENT, INFORMATION OR SERVICES THAT ARE AVAILABLE OR ADVERTISED OR SOLD THROUGH THE SERVICES ARE ACCURATE, COMPLETE, AVAILABLE, CURRENT. WE RESERVE THE RIGHT TO CORRECT ANY ERRORS OR OMISSIONS IN THE SERVICES.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">17. ELECTRONIC COMMUNICATIONS; TEXT MESSAGES</h3>
                        <p className="text-gray-700 leading-relaxed">
                            Using the Services or sending emails to us constitutes electronic communications. If you provide Us with your email address to our contact form, you consent to receive electronic communications from Us and you agree that all agreements, notices, disclosures and other communications that we provide to you electronically, via email and on the Services, satisfy any legal requirement that such communications be in writing.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            We may also contact you via SMS text message to verify your account, when you update your password and to provide bid and auction updates. By checking the box on our website, you acknowledge and agree that you are subscribing to NY Elizabeth’s mobile alerts and agree to text terms and receive recurring messages via automated system. Consent to texts at number provided not required to buy goods or services. Message and data rates may apply.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            You would receive, at your cost, electronic communications related to the Services, including without limitation, administrative messages, service announcements, and Service updates, from Us. If you do not have an unlimited wireless mobile data plan, you may incur additional charges from your wireless service provider in connection with your use of the Services. You are solely responsible for obtaining any additional subscription or connectivity services or equipment necessary to access the Services, including but not limited to payment of all third-party fees associated therewith, including fees for information sent to or through the Services.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            If you wish to opt-out of text messages, text STOP to the number from which you receive the NY Elizabeth messages. If you opt out, we intend to confirm you unsubscribed with a follow up text.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">18. INDEMNIFICATION</h3>
                        <p className="text-gray-700 leading-relaxed">
                            With the exception of NY ELIZABETH AUCTION’S gross negligence and willful misconduct, You agree to indemnify, defend and hold harmless NY ELIZABETH AUCTION, its officers, directors, SHAREHOLDERS, employees, agents, REPRESENTATIVES, and third parties, for any losses, costs, liabilities and expenses (including reasonable attorney’s fees) relating to or arising out of your use of, or inability to use, the SERVICES, your violation of these Terms or your violation of any rights of a third party, or your violation of any APPLICABLE laws, rules or regulations. We reserve the right to assume the exclusive defense and control of any matter otherwise subject to indemnification by you, in which event you will fully cooperate with us in asserting any available defenses.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">19. HARM FROM COMMERCIAL USE</h3>
                        <p className="text-gray-700 leading-relaxed">
                            You agree that the consequences of commercial use or re-publication of content or information from the Services may be so serious and incalculable, that monetary compensation may not be a sufficient or appropriate remedy and that We will be entitled to temporary and permanent injunctive relief to prohibit such use.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">20. NO WARRANTIES</h3>
                        <p className="text-gray-700 leading-relaxed">
                            EXCEPT AS EXPRESSLY PROVIDED TO THE CONTRARY IN WRITING BY NY ELIZABETH AUCTION, THE SERVICES AND THE INFORMATION CONTAINED ON SERVICES ARE PROVIDED ON AN “AS IS” AND “AS AVAILABLE” BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. NY ELIZABETH AUCTION DISCLAIMS ALL OTHER WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT AS TO THE SERVICES AND INFORMATION CONTAINED THEREIN. NY ELIZABETH AUCTION MAKES NO WARRANTIES, EXPRESS OR IMPLIED, WITH RESPECT TO ANY THIRD-PARTY PRODUCTS, AND EXPRESSLY DISCLAIMS ANY WARRANTY OR CONDITION OF MERCHANTABILITY, NON-INFRINGEMENT, OR FITNESS FOR A PARTICULAR PURPOSE.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            No advice or information, whether oral or written, obtained from NY Elizabeth Auction, its affiliates, or its service providers or through the Services or content, will create any warranty not expressly made herein. Reference to any products, services, processes or other information by trade name, trademark, manufacturer, supplier, vendor or otherwise does not constitute or imply endorsement, sponsorship, or recommendation thereof, or any affiliation therewith, by Us. Some jurisdictions do not allow the disclaimer of implied terms in contracts with consumers, so some or all of the disclaimers in this section may not apply to you.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">21. LIMITATION OF LIABILITY</h3>
                        <p className="text-gray-700 leading-relaxed">
                            TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL NY ELIZABETH AUCTION OR ANY OF ITS OWNERS, EMPLOYEES, OFFICERS, AGENTS, AFFILIATES, AND SUBSIDIARIES (“RELEASEES”) BE LIABLE FOR ANY DAMAGES OR LOSSES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICES. NEITHER NY ELIZABETH AUCTION NOR ANY OTHER PARTY INVOLVED IN CREATING, PRODUCING, OR DELIVERING SERVICES WILL BE LIABLE FOR ANY INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS, LOSS OF DATA, OR LOSS OF GOODWILL, SERVICE INTERRUPTION, COMPUTER DAMAGE OR SYSTEM FAILURE, OR THE COST OF SUBSTITUTE PRODUCTS OR SERVICES, FROM THE USE OF OR INABILITY TO USE THE SERVICES WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT PRODUCT LIABILITY, OR ANY OTHER LEGAL OR EQUITABLE THEORY (EVEN IF THE PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES AND REGARDLESS OF WHETHER SUCH DAMAGES WERE FORESEEABLE).
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            In no event will NY Elizabeth Auction’s or its subsidiaries or insurers aggregate liability arising out of or in connection with this Agreement or your use of the Services, exceed the greater of (i) the amounts you have paid for the Services, if applicable, in the twelve (12) month period prior to the event giving rise to the liability, or (ii) US $100. THE LIMITATIONS OF DAMAGES SET FORTH ABOVE ARE FUNDAMENTAL ELEMENTS OF THE BASIS OF THE BARGAIN BETWEEN NY ELIZABETH AUCTION AND YOU. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF LIABILITY FOR CONSEQUENTIAL OR INCIDENTAL DAMAGES, SO THE ABOVE LIMITATION MAY NOT APPLY TO YOU. YOU WAIVE CALIFORNIA CIVIL CODE §1542, OR ANY SIMILAR LAW, WHICH STATES: “A GENERAL RELEASE DOES NOT EXTEND TO CLAIMS WHICH THE CREDITOR DOES NOT KNOW OR SUSPECT TO EXIST IN HIS OR HER FAVOR AT THE TIME OF EXECUTING THE RELEASE, WHICH IF KNOWN BY HIM OR HER MUST HAVE MATERIALLY AFFECTED HIS OR HER SETTLEMENT WITH THE DEBTOR.”
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">22. INFORMAL DISPUTE RESOLUTION</h3>
                        <p className="text-gray-700 leading-relaxed">
                            You and NY Elizabeth Auction agree that any dispute that has arisen or may arise between Us relating in any way to Your use of or access to the Services, any validity, interpretation, breach, enforcement, or termination of this Agreement, or otherwise relating to NY Elizabeth Auction in any way (collectively, “Covered Dispute Matters“) will be resolved in accordance with the provisions set forth in this Section.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            If You have any dispute with Us, you and NY Elizabeth Auction agree that before taking any formal action, contact us at hello@nyelizabeth.com provide a brief, written description of the dispute and your contact information (including your email address) and allow sixty (60) days to pass, during which We will attempt to reach an amicable resolution of any issue with you.
                        </p>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">23. MANDATORY ARBITRATION</h3>
                        <p className="text-gray-700 leading-relaxed">
                            By agreeing to the Terms, you agree that you are required to resolve any claim that you may have against NY ELIZABETH AUCTION on an individual basis in arbitration, as set forth in this Arbitration AGREEMENT. This will preclude you from bringing any class, collective, or representative action against NY ELIZABETH AUCTION, and also preclude you from participating in or recovering relief under any current or future class, collective, consolidated, or representative action brought against NY ELIZABETH AUCTION by someone else.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            (a) Arbitration Procedure.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            You and NY Elizabeth Auction agree that any dispute, claim or controversy arising out of or relating to
                        </p>
                        <ul className="list-disc pl-5 text-gray-700 space-y-2">
                            <li>these Terms or the existence, breach, termination, enforcement, interpretation or validity thereof, or</li>
                            <li>your access to or use of the Services at any time, whether before or after the date you agreed to the Terms will be settled by binding arbitration between you and NY Elizabeth Auction, and not in a court of law. The arbitration shall be administered by the American Arbitration Association (“AAA“) in accordance with the AAA’s Consumer Arbitration Rules and the Supplementary Procedures for Consumer Related Disputes (the “AAA Rules“) then in effect, except as modified by this Arbitration Agreement. The parties agree that the arbitrator (“Arbitrator”), and not any federal, state, or local court or agency, shall have exclusive authority to resolve any disputes relating to the interpretation, applicability, enforceability or formation of this Arbitration Agreement, including any claim that all or any part of this Arbitration Agreement is void or voidable. Notwithstanding any choice of law or other provision in the Terms, the parties agree and acknowledge that this Arbitration Agreement evidences a transaction involving interstate commerce and that the Federal Arbitration Act, (“FAA”), will govern its interpretation and enforcement and proceedings pursuant thereto. It is the intent of the parties that the FAA and AAA Rules shall preempt all state laws to the fullest extent permitted by law. If the FAA and AAA Rules are found to not apply to any issue that arises under this Arbitration Agreement or the enforcement thereof, then that issue shall be resolved under the laws of the State of California. The Arbitrator’s award shall be final, and judgment may be entered upon it in any court having jurisdiction. In the event that any legal or equitable action, proceeding or arbitration arises out of or concerns these Terms, the prevailing party shall be entitled to recover its costs and reasonable attorney’s fees. The parties agree to arbitrate all disputes and claims in regard to these Terms or any disputes arising as a result of these Terms, whether directly or indirectly, including Tort claims that are a result of these Terms. The entire dispute, including the scope and enforceability of this arbitration provision shall be determined by the Arbitrator. YOU UNDERSTAND AND AGREE THAT YOU ARE GIVING UP THE RIGHT TO GO TO COURT AND HAVE A DISPUTE HEARD BY A JUDGE OR JURY. This Arbitration Agreement shall survive the termination of these Terms.</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            (b) Exceptions to Our Agreement to Arbitrate Disputes.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            There are only two exceptions to this Agreement to arbitrate: (i) if either party reasonably believes that the other party has in any manner violated or threatened to infringe the intellectual property rights of the other party, the party whose rights have been violated may seek injunctive or other appropriate interim relief without bond in any court of competent jurisdiction or (ii) each party will retain the right to seek relief in a small claims court for disputes or claims within the scope of the jurisdiction of such courts.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            (c) Small Claims.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            Notwithstanding anything set forth in this Arbitration Section, NY Elizabeth may bring against You any disputes, claims, or controversies, which arise out of or relate to these Terms with Ten Thousand Dollars ($10,000) or less in controversy in small claims court, and such claim shall be adjudicated in the Superior Court of California, County of Los Angeles, according to California law.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            (d) Who Bears the Costs of Arbitration?
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            You and NY Elizabeth Auction agree that payment of all filing, administration, and arbitrator fees will be governed by the AAA’s rules unless otherwise stated in this Agreement to arbitrate. In the event the arbitrator determines the claim(s) you assert in the arbitration to be frivolous or without merit, you agree that NY Elizabeth Auction is relieved of its obligation to reimburse you for any fees associated with the arbitration.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            (e) Future Amendments to the Agreement to Arbitrate.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            Notwithstanding any provision in this Agreement to the contrary, You and We agree that if We make any amendment to this Agreement to arbitrate in the future, that amendment shall not apply to any claim that was filed in a legal proceeding against NY Elizabeth Auction prior to the effective date of the amendment. However, the amendment shall apply to all other disputes or claims governed by the Agreement to arbitrate that have arisen or may arise between you and NY Elizabeth Auction If you do not agree to these amended terms, you shall not access or use the Services, and the revised terms will not bind you.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            (f) Judicial Forum for Legal Disputes.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            If the Agreement to arbitrate above is found not to apply to you or to a particular claim or dispute, either as a result of your decision to opt-out of the Agreement to arbitrate, as a result of a decision by the arbitrator or court order, you agree (except as otherwise provided by law) that any claim or dispute that has arisen or may arise between you and NY Elizabeth Auction must be resolved exclusively by a state or federal court located in Los Angeles County, California. You and NY Elizabeth Auction agree to submit to the exclusive personal jurisdiction of the courts situated in Los Angeles County, California, for the purpose of litigating all such claims or disputes.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            (g) Arbitration Opt-Out Procedure.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            If you are a new user, you can choose to reject the agreement to arbitrate provision by emailing us an opt-out notice to hello@nyelizabeth.com (“Opt-Out Notice“). The Opt-Out Notice must be received no later than thirty (30) days after the date you accept the terms of this Agreement for the first time. If you are not a new user, you have until thirty (30) days after the posting of the new terms to submit an arbitration opt-out notice. To opt-out, you must email your name, address (including street address, city, state, and zip code), email address to hello@nyelizabeth.com which the opt-out applies, and an unaltered digital image of your valid driver’s license to This procedure is the only way. You can Opt-Out of the Agreement to arbitrate. If you Opt-Out of the Agreement to arbitrate, all other parts of this Agreement and this Disputes Section will continue to apply to you. Opting out of this Agreement to arbitrate does not affect any previous, other, or future arbitration agreements that you may have with NY Elizabeth Auction you waive certain rights. By agreeing to this agreement, you now irrevocably waive any right you may have
                        </p>
                        <ul className="list-disc pl-5 text-gray-700 space-y-2">
                            <li>to a court trial (other than small claims court as provided above),</li>
                            <li>to serve as a representative, as a private attorney general, or in any other representative capacity, or to participate as a member of a class of claimants, in any lawsuit, arbitration or other proceeding filed against Us and/ or related third parties, and</li>
                            <li>to a trial by jury even if any arbitration is not required under this agreement. Statute of limitations for your claims. Regardless of any statute or law to the contrary, any claim or cause of action arising out of or related to use of the site, services, or this agreement must be filed within one (1) year after such claim or cause of action arises, or it will be forever barred.</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            (h) Applicable Law.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            You and We agree that United States federal law, including the Federal Arbitration Act, and (to the extent not Inconsistent with or pre-empted by federal law) the laws of the State of California, without regard to conflict of laws principles, will govern all Covered Dispute Matters. Such body of law will apply regardless of Your residence or the location of where You use the Services.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">24. CLASS ACTION WAIVER</h3>
                        <p className="text-gray-700 leading-relaxed">
                            Any arbitration or action under these Terms will take place on an individual basis; class arbitrations and class/representative/collective actions are not permitted. THE PARTIES AGREE THAT A PARTY MAY BRING CLAIMS AGAINST THE OTHER ONLY IN THEIR INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PUTATIVE CLASS, COLLECTIVE AND/ OR REPRESENTATIVE PROCEEDING, SUCH AS IN THE FORM OF A PRIVATE ATTORNEY GENERAL ACTION AGAINST THE OTHER. Further, the arbitrator or judge may not consolidate more than one person’s claims and may not otherwise preside over any form of a representative or class proceeding.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">25. ENTIRE AGREEMENT</h3>
                        <p className="text-gray-700 leading-relaxed">
                            Unless otherwise specified herein, this agreement constitutes the entire agreement between you and us with respect to the Services and it supersedes all prior or contemporaneous communications and proposals, whether electronic, oral, or written, between you and us.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">26. RELIANCE ON INFORMATION POSTED</h3>
                        <p className="text-gray-700 leading-relaxed">
                            Commentary and other materials posted on the Services is not intended to amount to advice on which reliance should be placed. We therefore disclaim all liability and responsibility arising from any reliance placed on such materials by any visitor of the Services, or by anyone who may be informed of any of its contents.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-2">
                            No information or content on the Services is a replacement for performing your own due diligence, exercising good judgment, and seeking financial, investment, tax, or legal advice from qualified and licensed professionals with knowledge of your personal circumstances. You agree that you shall not rely on content on the Services in making financial decisions or the potential legal, tax or financial consequences of such financial decisions. You are encouraged to seek personal professional advice from qualified and licensed professionals.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">27. CHANGES TO TERMS</h3>
                        <p className="text-gray-700 leading-relaxed">
                            We reserve the right, in our sole discretion, to change the Terms under which the Services is offered. The most current version of the Terms will supersede all previous versions. We encourage you to periodically review the Terms to stay informed of our updates. We may alter or amend our Terms by giving you reasonable notice. By continuing to use the Services after expiry of the notice period or accepting the amended Terms (as We may decide at our sole discretion), you will be deemed to have accepted any amendment to these Terms.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">28. RELATIONSHIP BETWEEN THE PARTIES</h3>
                        <p className="text-gray-700 leading-relaxed">
                            The parties are independent contractors and nothing in these Terms shall be construed as making either party the partner, joint venturer, agent, legal representative, employer, contractor, or employee of the other. Each Party has sole responsibility for its activities and its personnel and shall have no authority and shall not represent to any third party that it has the authority to bind or otherwise obligate the other party in any manner.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">29. SEVERABILITY</h3>
                        <p className="text-gray-700 leading-relaxed">
                            If any term, clause or provision of these Terms is held invalid or unenforceable, then that term, clause or provision will be severable from these Terms and will not affect the validity or enforceability of any remaining part of that term, clause or provision, or any other term, clause or provision of these Terms.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">30. FORCE MAJEURE</h3>
                        <p className="text-gray-700 leading-relaxed">
                            We shall be excused from performance under these Terms of Use, to the extent We are prevented or delayed from performing, in whole or in part, as a result of an event or series of events caused by or resulting from: (a) weather conditions or other elements of nature or acts of God; (b) acts of war, acts of terrorism, insurrection, riots, civil disorders, or rebellion; (c) quarantines or embargoes; (d) labor strikes; (e) error or disruption to major computer hardware or networks or software failures; or (g) other causes beyond the reasonable control of NY Elizabeth Auction.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">31. EXPORT CONTROLS</h3>
                        <p className="text-gray-700 leading-relaxed">
                            The Services originate in the United States and are subject to United States export laws and regulations. The Services may not be exported or re-exported by you to certain countries, or those persons or entities prohibited from receiving exports from the United States. In addition, the Services may be subject to the import and export laws of other countries. You agree to comply with all United States and foreign laws related to use of the Services.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">32. NOTICE TO CALIFORNIA RESIDENTS</h3>
                        <p className="text-gray-700 leading-relaxed">
                            If you are a California resident, under California Civil Code Section 1789.3, you may contact the Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs in writing at 1625 N. Market Blvd., Suite S-202, Sacramento, California 95834, or by telephone at (800) 952-5210 in order to resolve a complaint regarding the service or to receive further information regarding use of the service.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">33. MISCELLANEOUS</h3>
                        <p className="text-gray-700 leading-relaxed">
                            These Terms constitute the entire agreement between you and Us relating to your access to and use of the Services. When you purchase any services from NY Elizabeth Auction, The Services are controlled and operated from within the United States. Without limiting anything else, we make no representation that the Services, information or other materials available on, in, or through the Services are applicable or available for use in other locations, and access to them from territories where they are illegal is prohibited. Those who choose to access our Services from other locations do so on their own volition and are responsible for compliance with applicable laws. These Terms, and any rights and licenses granted hereunder, may not be transferred or assigned by you without our prior written consent. The waiver or failure of NY Elizabeth Auction to exercise in any respect any right provided hereunder shall not be deemed a waiver of such right in the future or a waiver of any of other rights established under these Terms. Headings used in these Terms are for reference only and shall not affect the interpretation of these Terms. No person or entity not party to this agreement will be deemed to be a third-party beneficiary of these Terms or any provision hereof. When used herein, the words “includes” and “including” and their syntactical variations shall be deemed followed by the words “without limitation.”
                        </p>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">34. COMMUNICATIONS</h3>
                        <p className="text-gray-700 leading-relaxed">
                        NY Elizabeth sends out newsletters for upcoming auctions via email and text messages. If you like to opt out of our newsletter and auction updates, please send us an email to <span className="text-blue-700 ">hello@nyelizabeth.com.</span></p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}