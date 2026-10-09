const isDebug = process.env.AI_DEBUG === "true";

const debug = (...args) => {
  if (isDebug) console.log(...args);
};

module.exports = { debug };
