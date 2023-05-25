const ethers = require("ethers");
const getEventSignature = (event) => {
  const interface = new ethers.utils.Interface([event]);
  event = interface.getEvent(event.name);
  const signature = event.format();
  console.log({ eventName: event.name, signature });
  return signature;
};

module.exports.getEventSignature = getEventSignature;
