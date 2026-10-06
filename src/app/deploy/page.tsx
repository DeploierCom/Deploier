import type { Metadata } from "next";
import { DeployPanel } from "@/components/onchain/DeployPanel";

export const metadata: Metadata = {
  title: "Deploy contracts",
  description: "Deploy the Deploier contracts from your own wallet.",
  robots: { index: false, follow: false },
};

export default function DeployPage() {
  return (
    <div className="ctn py-[50px] max-md:py-[30px]">
      <DeployPanel />
    </div>
  );
}
