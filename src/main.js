import "./style.css";

let marketData = [];
let filtredMarketData = [];

const getMarketData = async () => {
  return fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd",
  ).then((response) => response.json());
};

const display = () => {
  document.querySelector("ul").innerHTML = filtredMarketData
    .map((market) => {
      return `<li><img width="30px" src="${market.image}" alt="${market.symbol}" /> ${market.symbol.toUpperCase()} - $${market.current_price}</li>`;
    })
    .join("");
};

const runApp = async () => {
  // step 1 : get data from API
  const marketData = await getMarketData();
  // step 2 filtrer les donnée avec la logic metier choisi...
  filtredMarketData = marketData.filter((market) => {
    return market.total_volume > 1_000_000;
  });
  // step 3 construire le html de base
  document.querySelector("#app").innerHTML = `
    <h1>Market data (${filtredMarketData.length}/${marketData.length})</h1>
    <input type="text" placeholder="BTC, ETH, USDC..." />
    <button>filter</button>
    <section>
      <ul></ul>
    </section>
  `;
  // event management with parent element
  document.querySelector('ul').addEventListener('click', (event) => {
    const target = event.target;
    const liElement = target.closest('li');
    const imgElement = liElement.querySelector('img');
    const altAttribute = imgElement.getAttribute('alt');
    const symbol = altAttribute.toUpperCase();
    alert(symbol);
  });
  // step 4 display real data
  display();
  // step 5 event management
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
};

runApp();
