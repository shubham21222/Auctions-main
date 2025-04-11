  <Button
    onClick={handleAddCompetitorBid}
    disabled={isPlacingBid || role !== "clerk"}
    className={`px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 ${
      isPlacingBid || role !== "clerk" ? "opacity-50" : ""
    }`}
  >
    Competing Bid
  </Button> 