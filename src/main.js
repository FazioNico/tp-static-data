import "./style.css";
import { marketData } from "./market-data";

let filtredMarketData = marketData.filter((market) => {
  return market.total_volume > 1_000_000;
});

document.querySelector("#app").innerHTML = `
<h1>Market data (${filtredMarketData.length}/${marketData.length})</h1>
<input type="text" placeholder="BTC, ETH, USDC..." />
<button>filter</button>
<section>
  <ul></ul>
</section>
`;

const display = () => {
  document.querySelector("ul").innerHTML = filtredMarketData
    .map((market) => {
      return `<li><img width="30px" src="${market.image}" alt="${market.symbol}" /> ${market.symbol.toUpperCase()} - $${market.current_price}</li>`;
    })
    .join("");
};

display();

// gestion du click sur le button de filtre
document.querySelector("button").addEventListener("click", () => {
  // récupérer la valeur de l'input
  const value = document.querySelector("input").value;
  // filtrer la liste de donnée de marché
  filtredMarketData = marketData.filter((market) => {
    return market.symbol.toLowerCase().includes(value.toLocaleLowerCase());
  });
  // afficher la liste dans le html
  // reset la valeur de l'input
  display();
});
