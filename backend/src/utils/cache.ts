import NodeCache from "node-cache";

// cache time in seconds, e.g., 60 seconds
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

export default cache;
