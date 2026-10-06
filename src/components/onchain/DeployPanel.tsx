"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { CHAIN } from "@/config/brand";
import { CONTRACTS, type ContractKey } from "@/config/contracts";
import { useWallet } from "@/components/wallet/WalletProvider";
import { useWalletModal } from "@/components/wallet/WalletButton";
import { ALLOWLISTTOKENFACTORY_BYTECODE, COMMITMENTREGISTRY_BYTECODE, SETTLEMENTESCROW_BYTECODE } from "@/lib/onchain/bytecode";
import { simulate, txUrl, waitReceipt } from "@/lib/onchain/client";

/*
 * Owner tool: deploys the three Deploier contracts from the connected wallet
 * (no key ever touches the site), then prints the lines to paste into
 * src/config/contracts.ts. None of them takes constructor arguments, has an
 * owner or can be changed after deployment. Removed once all three are
 * deployed and verified.
 */

const ITEMS: { key: ContractKey; bytecode: string; what: string; gas: string; varName: string }[] = [
  {
    key: "escrow",
    bytecode: SETTLEMENTESCROW_BYTECODE,
    what: "Delivery versus payment between two wallets: propose escrows leg A, accept by the named taker settles both legs in one transaction, cancel before accept, refund by anyone after expiry.",
    gas: "about 1.07 million gas",
    varName: "ESCROW",
  },
  {
    key: "registry",
    bytecode: COMMITMENTREGISTRY_BYTECODE,
    what: "Public tape of commitments: anyone records a bytes32 commitment with a kind and status.",
    gas: "about 0.41 million gas",
    varName: "REGISTRY",
  },
  {
    key: "factory",
    bytecode: ALLOWLISTTOKENFACTORY_BYTECODE,
    what: "Issues allowlist tokens: the issuing wallet holds the supply and alone manages its holder allowlist; maturity stops transfers and opens redemption.",
    gas: "about 1.63 million gas",
    varName: "FACTORY",
  },
];

type Result = { address: string; block: number; hash: string };

export function DeployPanel() {
  const { address, onRobinhoodChain, switchNetwork, sendTransaction } = useWallet();
  const { open } = useWalletModal();
  const [stage, setStage] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Partial<Record<ContractKey, Result>>>({});

  const deploy = async (key: ContractKey, bytecode: string) => {
    if (!address) return;
    setErrors((e) => ({ ...e, [key]: "" }));
    try {
      setStage((s) => ({ ...s, [key]: "Checking…" }));
      await simulate({ from: address, data: bytecode });
      setStage((s) => ({ ...s, [key]: "Confirm in wallet…" }));
      const hash = await sendTransaction({ data: bytecode });
      setStage((s) => ({ ...s, [key]: "Waiting for the block…" }));
      const receipt = await waitReceipt(hash);
      if (!receipt.contractAddress) throw new Error("The receipt has no contract address.");
      setResults((r) => ({ ...r, [key]: { address: receipt.contractAddress!, block: Number(BigInt(receipt.blockNumber)), hash } }));
    } catch (cause) {
      setErrors((e) => ({ ...e, [key]: cause instanceof Error ? cause.message : "Deployment failed." }));
    } finally {
      setStage((s) => ({ ...s, [key]: "" }));
    }
  };

  const snippet = ITEMS.filter((i) => results[i.key])
    .map((i) => `const ${i.varName} = "${results[i.key]!.address}";\nconst ${i.varName}_BLOCK = ${results[i.key]!.block};`)
    .join("\n");

  return (
    <div className="max-w-[960px]">
      <p className="eyebrow">Owner tool · not linked from the site</p>
      <h1 className="d-h2 mt-2 text-black">Deploy the contracts</h1>
      <p className="mt-3 text-[15px] text-ink-2">
        Deploys to {CHAIN.name} (chain {CHAIN.id}) from your connected wallet. No constructor arguments, no owner, no admin key: once deployed, nothing about these
        contracts can be changed. Order does not matter; each one switches its part of the desk on by itself.
      </p>

      <div className="mt-6 space-y-4">
        {ITEMS.map((i) => {
          const live = CONTRACTS[i.key].address;
          const r = results[i.key];
          return (
            <section key={i.key} className="rounded-[16px] bg-card p-5" data-testid={`deploy-${i.key}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[17px] font-semibold">{CONTRACTS[i.key].name}</p>
                <span className="num text-[12.5px] text-ink-3">
                  {(i.bytecode.length / 2 - 1).toLocaleString("en-US")} bytes · {i.gas}
                </span>
              </div>
              <p className="mt-1 text-[14px] text-ink-2">{i.what}</p>
              {live ? (
                <p className="mt-2 text-[13.5px]">
                  Live at{" "}
                  <a href={`${CHAIN.explorer}/address/${live}`} target="_blank" rel="noreferrer" className="num underline">
                    {live}
                  </a>
                </p>
              ) : null}
              <div className="mt-3">
                {!address ? (
                  <button type="button" onClick={open} className="btn btn-ink min-h-0 py-2 text-[14px]">
                    Connect wallet
                  </button>
                ) : !onRobinhoodChain ? (
                  <button type="button" onClick={switchNetwork} className="btn btn-ink min-h-0 py-2 text-[14px]">
                    Switch to {CHAIN.name}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => deploy(i.key, i.bytecode)}
                    disabled={Boolean(stage[i.key])}
                    className="btn btn-accent min-h-0 py-2 text-[14px]"
                    data-testid={`deploy-${i.key}-submit`}
                  >
                    {stage[i.key] || `Deploy ${CONTRACTS[i.key].name}`}
                  </button>
                )}
              </div>
              {errors[i.key] ? <p className="mt-2 text-[13px] text-down">{errors[i.key]}</p> : null}
              {r ? (
                <p className="mt-2 text-[13.5px] text-up" data-testid={`deploy-${i.key}-result`}>
                  Deployed at <span className="num">{r.address}</span> in block {r.block.toLocaleString("en-US")}.{" "}
                  <a href={txUrl(r.hash)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
                    transaction <ExternalLink className="size-3" />
                  </a>
                </p>
              ) : null}
            </section>
          );
        })}
      </div>

      {snippet ? (
        <div className="mt-6 rounded-[16px] bg-card p-5">
          <p className="text-[14px] font-semibold">Paste into src/config/contracts.ts (replacing the empty lines), then push:</p>
          <pre className="mt-2 overflow-x-auto rounded-[8px] bg-board p-3 font-mono text-[12px] text-white" data-testid="deploy-snippet">
            {snippet}
          </pre>
          <p className="mt-2 text-[13px] text-ink-2">Then verify each address with its transaction: npm run verify-deployment -- &lt;address&gt; --tx &lt;hash&gt; (see the README).</p>
        </div>
      ) : null}
    </div>
  );
}
