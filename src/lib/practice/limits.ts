import type { Store } from "@/lib/auth/store";
import { spend } from "@/lib/ratelimit";

/*
 * Rate limits for practice requests. Nothing is ever charged to an address
 * on its own before a signature proves the caller owns it: a pre-signature
 * limit is keyed on the caller's network (IPv4, or the IPv6 /64) together
 * with the address it claims, so one network cannot spend another person's
 * quota.
 */

/** Before the signature: per network (and its /24 or /48), and per (network, claimed address). */
export async function allowTicket(store: Store, network: string, claimed: string) {
  if (!(await spend(store, "ticket-net", network, 1, 40, 600, { aggregate: true }))) return false;
  // The claimed address is untrusted text: it only ever appears inside a key that starts with the network.
  return spend(store, "ticket-net-wallet", `t:${network}|${claimed.toLowerCase().slice(0, 42)}`, 1, 30, 600);
}

/** First practice action of a new wallet: a few per network (and per /24 or /48) a day. */
export const allowNewWallet = (store: Store, network: string) => spend(store, "new-wallet-net", network, 1, 5, 86_400, { aggregate: true });

/** New records (proposals and issuances) after the signature: per network and per proven wallet, each a day. */
export async function allowCreate(store: Store, network: string, wallet: string) {
  if (!(await spend(store, "create-net", network, 1, 30, 86_400, { aggregate: true }))) return false;
  return spend(store, "create-wallet", wallet.toLowerCase(), 1, 20, 86_400);
}
