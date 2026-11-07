import { Cart } from "./cart";
import { Header } from "@/components/app/ui";
import { getCatalog } from "@/lib/data";

export default async function Catalog() {
  const items = await getCatalog();
  return (
    <>
      <Header title="Catalog & profit builder" subtitle={`Every plan, client module, add-on and enterprise build in one quote-ready workspace · ${items.length} sellable items.`} what="Offer catalog" why="Scope with real delivery cost before you promise work." start="Search, add items, set client prices, then create a dev ticket." />
      <Cart items={items} />
    </>
  );
}
