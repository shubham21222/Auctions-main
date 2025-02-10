import React from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';

const MyInformation = () => {
    return (
        <>
            <Header />
            <div className="container mt-[80px] max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-4">California “Do Not Sell My Information” Notice</h1>
                <p className="text-gray-700 leading-relaxed">
                    Like many companies online, NY Elizabeth works with Google, Facebook and other companies that use information collected from cookies and similar technologies to try to make the ads you see online more relevant to your interests. This is called interest-based advertising. Our use of these services may constitute a “sale” of Personal Information as defined under the California Consumer Protection Act (CCPA). You can opt-out of the use of your information for interest-based advertising by:
                </p>
                <ul className="list-disc pl-5 text-gray-700 space-y-2 mt-2">
                    <li>Browser settings. Blocking third party cookies in your browser settings.</li>
                    <li>Privacy browsers/plug-ins. Using privacy browsers or ad-blocking browser plug-ins that let you block advertising trackers.</li>
                    <li>Platform settings. Using the opt-out settings offered by some of the advertising companies that we work with.</li>
                    <li>Ad industry tools. Opting out of interest-based ads from companies participating in the following industry opt-out programs:</li>
                    <ul className="list-disc pl-10 text-gray-700 space-y-2 mt-2">
                        <li>Network Advertising Initiative: <a href="https://optout.networkadvertising.org/?c=1" className="text-blue-500">https://optout.networkadvertising.org/?c=1</a></li>
                        <li>Digital Advertising Alliance: <a href="https://optout.aboutads.info" className="text-blue-500">optout.aboutads.info</a>, which will allow you to opt-out of interest-based ads served by on websites by participating members.</li>
                        <li>AppChoices mobile app, at <a href="https://www.youradchoices.com/appchoices" className="text-blue-500">https://www.youradchoices.com/appchoices</a>, which will allow you to opt-out of interest-based ads in mobile apps served by participating members.</li>
                    </ul>
                    <li>Mobile settings. Using your mobile device settings to limit use of the advertising ID associated with your mobile device for interest-based advertising purposes. You will need to apply these opt-out settings on each device from which you wish to opt-out. Not all companies that serve interest-based ads participate in these opt-out programs, so even after opting-out, you may still receive some cookies and interest-based ads from other companies. If you opt-out of interest-based advertisements, you will still see advertisements online, but they may be less relevant to you.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                    Our sharing of information with the data providers described above may also constitute “sales” as defined under the CCPA. You may submit a request to opt-out of this information sharing by sending an email to hello@nyelizabeth.com with “Privacy” in the subject line.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                    The above describes our practices currently and during the 12-month period preceding the date on which this Privacy Policy was last updated.
                </p>
                <h2 className="text-xl font-semibold text-gray-700 mt-6 mb-2">Your CCPA rights</h2>
                <p className="text-gray-700 leading-relaxed">
                    As a California resident, you have the following rights as of January 1, 2020:
                </p>
                <ul className="list-disc pl-5 text-gray-700 space-y-2 mt-2">
                    <li>Information. You can request the following information about how we have collected and used your Personal Information during the past 12 months:</li>
                    <ul className="list-disc pl-10 text-gray-700 space-y-2 mt-2">
                        <li>The categories of Personal Information that we have collected.</li>
                        <li>The categories of sources from which we collected Personal Information.</li>
                        <li>The business or commercial purpose for collecting and/or selling Personal Information.</li>
                        <li>The categories of third parties with whom we share Personal Information.</li>
                        <li>Whether we have disclosed your Personal Information for a business purpose, and if so, the categories of Personal Information disclosed to each category of third-party recipient.</li>
                        <li>Whether we’ve sold your Personal Information, and if so, the categories of Personal Information received by each category of third-party recipient.</li>
                    </ul>
                    <li>Access. You can request a copy of the Personal Information that we have collected about you during the past 12 months.</li>
                    <li>Deletion. You can ask us to delete the Personal Information that we have collected from you.</li>
                    <li>Opt-out. You can opt-out of any “sale” of your Personal Information as defined in the CCPA.</li>
                    <li>Non-discrimination. You are entitled to exercise the rights described above free from discrimination as prohibited by the CCPA.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                    You may submit a request to exercise your right to information, access, or deletion by emailing to hello@nyelizabeth.com with “Privacy” in the subject line. We reserve the right to confirm your California residency to process these requests and will need to confirm your identity. Government-issued identification may be required. You may designate an authorized agent to make a request on your behalf by providing a valid power of attorney or other proof of authority acceptable to us in our reasonable discretion, the requester’s valid government-issued identification, and the authorized agent’s valid government-issued identification. You can submit a request to opt-out of sales of your Personal Information as described above. We cannot process your request if you do not provide us with sufficient information to allow us to understand and respond to it. In certain cases, we may decline your request as permitted by law.
                </p>
            </div>
            <Footer />
        </>
    );
};

export default MyInformation;