const config = require(process.argv[2]);
const ethers = require("ethers");
const { getEventSignature } = require("../utils/helper");
const WebSocket = require("ws");

// Configure the WebSocket connection
const websocketUrl = process.env.NODE;
const websocket = new WebSocket(websocketUrl);

// Specify the contract address
const contractAddress = config.CONTRACT_ADDRESS;
const events = config.ABI;
const eventInterface = new ethers.utils.Interface(events);
// Handle WebSocket connection established
websocket.on("open", () => {
  console.log("WebSocket connection established");
  const subscriptions = [];
  // Build the subscription request for the NewListing event
  for (let event of events) {
    // const eventSignature = getEventSignature(event);

    const eventTopic = eventInterface.getEventTopic(event.name);
    const eventSignatureHex = ethers.utils.hexDataSlice(eventTopic, 0, 32);
    console.log("Signature: ", eventSignatureHex);
    subscriptions.push({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_subscribe",
      params: [
        "logs",
        {
          address: contractAddress,
          topics: [eventSignatureHex],
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

    // Parse the event data
    const eventTopic = eventData.topics[0];
    const eventArgs = eventData.data;

    const eventResult = eventInterface.parseLog({
      data: eventArgs,
      topics: eventData.topics,
    });

    // Check the event topic and handle accordingly
    if (
      eventResult.signature === "NewListing(address,uint256,address,uint256)"
    ) {
      // NewListing event
      const seller = "0x" + eventResult.args[0];
      const price = ethers.utils.formatEther(eventResult.args[1]);
      const nftAddress = eventResult.args[2];
      const tokenId = parseInt(eventResult.args[3]);

      console.log("New Listing:");
      console.log("Seller:", seller);
      console.log("Price:", price);
      console.log("NFT Address:", nftAddress);
      console.log("Token ID:", tokenId);

      // TODO: Handle the NewListing event data
    } else if (
      eventResult.signature === "ItemBought(address,address,uint256,uint256)"
    ) {
      // ItemBought event
      const buyer = eventResult.args[0];
      const nftAddress = eventResult.args[1];
      const tokenId = parseInt(eventResult.args[2]);
      const price = ethers.utils.formatEther(eventResult.args[3]);

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
