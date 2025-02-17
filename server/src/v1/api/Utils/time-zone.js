export const formatAuctionDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
        timeZone: "America/Los_Angeles", // Adjust as needed
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZoneName: "short",
    });
};
