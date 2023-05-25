const getEventSignature = (event) => {
  let signature = "";
  if (event.type === "event") {
    const inputs = event.inputs.map((input) => input.type);
    signature = `${event.name}(${inputs.join(",")})`;
  }
  console.log({ eventName: event.name, signature });
  return signature;
};

module.exports.getEventSignature = getEventSignature;
