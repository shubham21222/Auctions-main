async function finalizeAuction(auctionId, winnerPaymentIntentId, loserPaymentIntentIds) {
    try {
      const response = await fetch("/api/auction/finalize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auctionId,
          winnerPaymentIntentId,
          loserPaymentIntentIds,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to finalize auction");
      }
  
      const result = await response.json();
      console.log("Auction finalized:", result);
    } catch (error) {
      console.error("Error finalizing auction:", error);
    }
  }
  
  // Example usage
  finalizeAuction("123", "pi_xxx", ["pi_yyy", "pi_zzz"]);