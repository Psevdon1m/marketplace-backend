const config = require(process.argv[2]);
const { getEventSignature } = require("../utils/helper");
const WebSocket = require("ws");

// Configure the WebSocket connection
const websocketUrl = config.NODE;
const websocket = new WebSocket(websocketUrl);

// Specify the contract address
const contractAddress = config.CONTRACT_ADDRESS;
const events = config.ABI;

// Handle WebSocket connection established
websocket.on("open", () => {
  console.log("WebSocket connection established");
  const subscriptions = [];
  // Build the subscription request for the NewListing event
  for (let event of events) {
    const eventSignature = getEventSignature(event);
    subscriptions.push({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_subscribe",
      params: [
        "logs",
        {
          address: contractAddress,
          topics: ["0x" + Buffer.from(eventSignature).toString("hex")],
        },
      ],
    });
  }
  for (let subscription of subscriptions) {
    // Send the subscription requests
    websocket.send(JSON.stringify(subscription));
  }
});

// Handle WebSocket data received
websocket.on("message", (data) => {
  const message = JSON.parse(data);

  // Check if the message is an event notification
  if (
    message.method === "eth_subscription" &&
    message.params &&
    message.params.result
  ) {
    const eventData = message.params.result;
    console.log("Received event:", eventData);

    // Parse the event data
    const eventTopic = eventData.topics[0];
    const eventArgs = eventData.data;

    // Check the event topic and handle accordingly
    if (
      eventTopic ===
      "0x" +
        Buffer.from("NewListing(address,uint256,address,uint256)").toString(
          "hex"
        )
    ) {
      // NewListing event
      const seller = "0x" + eventArgs.slice(24, 64);
      const price = parseInt("0x" + eventArgs.slice(64, 128));
      const nftAddress = "0x" + eventArgs.slice(128, 168);
      const tokenId = parseInt("0x" + eventArgs.slice(168));

      console.log("New Listing:");
      console.log("Seller:", seller);
      console.log("Price:", price);
      console.log("NFT Address:", nftAddress);
      console.log("Token ID:", tokenId);

      // TODO: Handle the NewListing event data
    } else if (
      eventTopic ===
      "0x" +
        Buffer.from("ItemBought(address,address,uint256,uint256)").toString(
          "hex"
        )
    ) {
      // ItemBought event
      const buyer = "0x" + eventArgs.slice(24, 64);
      const nftAddress = "0x" + eventArgs.slice(64, 104);
      const tokenId = parseInt("0x" + eventArgs.slice(104, 168));
      const price = parseInt("0x" + eventArgs.slice(168));

      console.log("Item Bought:");
      console.log("Buyer:", buyer);
      console.log("NFT Address:", nftAddress);
      console.log("Token ID:", tokenId);
      console.log("Price:", price);

      // TODO: Handle the ItemBought event data
    }
  }
});

// Handle WebSocket errors
websocket.on("error", (error) => {
  console.error("WebSocket error:", error);
});

// Handle WebSocket connection closed
websocket.on("close", () => {
  console.log("WebSocket connection closed");
});
