import "./style.css";

let marketData = [];
let filtredMarketData = [];
let selectedItem = null;

const getMarketData = async () => {
  return fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd",
  ).then((response) => response.json());
};

const displayListItems = () => {
  document.querySelector("ul").innerHTML = filtredMarketData
    .map((market) => {
      return `<li><img width="30px" src="${market.image}" alt="${market.symbol}" /> ${market.symbol.toUpperCase()} - $${market.current_price}</li>`;
    })
    .join("");
};

const displayListPage = () => {
  document.querySelector("#app").innerHTML = `
    <h1 class="text-3xl font-bold underline">Market data (${filtredMarketData.length}/${marketData.length})</h1>
    <input type="text" placeholder="BTC, ETH, USDC..." />
    <button class="rounded-2xl bg-blue-500 text-white pt-2 pb-2 pl-4 pr-4 uppercase cursor-pointer hover:bg-blue-300 dark:bg-amber-500 ">filter</button>
    <section>
      <ul></ul>
    </section>
  `;
}

const displayDetailPage = () => {
  if (!selectedItem) {
    alert('Pas de market trouvé');
    return;
  }
  document.querySelector("#app").innerHTML = `
    <button id="backToList">back to list</button>
    <h1>${selectedItem.symbol.toUpperCase()}</h1>
    <section>
      <ul>
        ${Object.entries(selectedItem).map(([key, value])=> {
          return `<li>${key.toUpperCase()}: ${value}</li>`
        }).join('')}
      </ul>
    </section>
  `;
}

const runApp = async () => {
  // step 1 : get data from API
  const marketData = await getMarketData();
  // step 2 filtrer les donnée avec la logic metier choisi...
  filtredMarketData = marketData.filter((market) => {
    return market.total_volume > 1_000_000;
  });
  // step 3 construire le html de base
  displayListPage();
  // event management with parent element
  document.querySelector('ul').addEventListener('click', (event) => {
    const target = event.target;
    const liElement = target.closest('li');
    const imgElement = liElement.querySelector('img');
    const altAttribute = imgElement.getAttribute('alt');
    const symbol = altAttribute.toUpperCase();
    selectedItem = filtredMarketData.find(market => market.symbol.toUpperCase() === symbol);
    if (!selectedItem) {
      alert('Pas de market trouvé');
      return;
    }
    console.log(selectedItem)
    displayDetailPage();
  });
  // manage back to list event
  document.querySelector('#app').addEventListener('click', (event)=> {
    const target = event.target;
    if (target.id != 'backToList') {
      return;
    }
    displayListPage();
    displayListItems();
  })
  // step 4 display real data
  displayListItems();
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
    displayListItems();
  });
};

runApp();
