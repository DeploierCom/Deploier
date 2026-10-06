/*
 * Tokenized equities that already live on Robinhood Chain. Each token address
 * is a Robinhood beacon proxy (symbol() matches, name() ends in "Robinhood
 * Token") and each feed is a Chainlink USD aggregator on Robinhood Chain; both
 * were read on-chain before being listed. The site reads prices live from the
 * feeds. Deploier does not issue or custody these tokens: they are the real
 * assets the practice desk lets you settle against.
 */
export type StockLine = {
  symbol: string;
  name: string;
  token: `0x${string}`;
  feed: `0x${string}`;
};

export const STOCKS: StockLine[] = [
  { symbol: "AAPL", name: "Apple", token: "0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9", feed: "0x6B22A786bAa607d76728168703a39Ea9C99f2cD0" },
  { symbol: "GOOGL", name: "Alphabet Class A", token: "0x2e0847E8910a9732eB3fb1bb4b70a580ADAD4FE3", feed: "0xF6f373a037c30F0e5010d854385cA89185AE638b" },
  { symbol: "NVDA", name: "NVIDIA", token: "0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC", feed: "0x379EC4f7C378F34a1B47E4F3cbeBCbAC3E8E9F15" },
  { symbol: "TSLA", name: "Tesla", token: "0x322F0929c4625eD5bAd873c95208D54E1c003b2d", feed: "0x4A1166a659A55625345e9515b32adECea5547C38" },
];

