
import moment from 'moment-timezone';

// export const formatAuctionDate = (date) => {
//     // If the input date is not already in ISO format, convert it to ISO format
//     return moment(date).tz("Asia/Kolkata").format("MMM D, YYYY h:mm A");
// };


export const formatAuctionDate = (date) => {
    return moment(date)
        .tz("America/Los_Angeles") // Specify the desired timezone (GMT-08:00 is Los Angeles time)
        .format('MMM D, YYYY h:mm A [GMT]Z'); // Format as per the required output
};



// Convert UTC to US Eastern Time (ET)
export const convertToUSTime = (date) => {
    return moment.utc(date).tz("America/New_York").format();
};

// Convert UTC to Indian Standard Time (IST)
export const convertToIndiaTime = (date) => {
    return moment.utc(date).tz("Asia/Kolkata").format();
};

