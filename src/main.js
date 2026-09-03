import { marketData } from "./market-data";

const filtredMarketData = marketData.filter((market) => {
  return market.total_volume > 1_000_000;
});
document.querySelector("#app").innerHTML = `
  <h1>Market data (${filtredMarketData.length}/${marketData.length})</h1>
  <section>
    <ul>
        ${filtredMarketData
          .map((market) => {
            return `<li><img width="30px" src="${market.image}" alt="${market.symbol}" /> ${market.symbol}</li>`;
          })
          .join("")}
    </ul>
  </section>
`;
