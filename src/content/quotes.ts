import type { Quote } from "@/components/kit-client";

/*
 * Statements for the coral band. These are Deploier's own design principles,
 * attributed to the project. No outside person or firm is quoted.
 */
export const PRINCIPLES: Quote[] = [
  {
    text: "A market needs two things from a settlement: proof that it happened, and silence about what happened. We keep the first public and the second with the parties.",
    by: "Deploier design principle",
    role: "From the litepaper, section 3",
  },
  {
    text: "Disclosure should be a decision you make one record at a time, not a side effect of using the chain.",
    by: "Deploier design principle",
    role: "Per-record view keys",
  },
  {
    text: "Anyone who runs the infrastructure should be able to stall it at worst, never read it and never rewrite it.",
    by: "Deploier design principle",
    role: "The operator role",
  },
  {
    text: "Until audited contracts hold real assets, every screen says practice mode. Honesty about what is live is part of the product.",
    by: "Deploier design principle",
    role: "Status of the build",
  },
];
