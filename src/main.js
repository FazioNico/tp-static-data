import "./style.css";

const API_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";

let marketData = [];
let filteredMarketData = [];
let selectedItem = null;
let searchTerm = "";

const appEl = () => document.querySelector("#app");

const formatPrice = (value) => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
};

const formatCompactCurrency = (value) => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
};

const formatCompactNumber = (value) => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("fr-FR", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return null;
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
};

const getMarketData = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`Erreur API (${response.status})`);
  }
  return response.json();
};

// -- templates --

const shellTemplate = (content) => `
  <div class="min-h-screen bg-linear-to-br from-slate-950 via-indigo-950 to-slate-950 text-slate-100 selection:bg-fuchsia-500/40">
    <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      ${content}
    </div>
  </div>
`;

const headerTemplate = (count, total) => `
  <header class="mb-8 flex flex-col gap-1">
    <h1 class="text-3xl font-extrabold tracking-tight sm:text-4xl">
      <span class="bg-linear-to-r from-cyan-400 via-fuchsia-500 to-lime-400 bg-clip-text text-transparent">Market Data</span>
    </h1>
    ${total !== undefined ? `<p class="text-sm text-slate-400">${count}/${total} actifs affichés</p>` : ""}
  </header>
`;

const searchBarTemplate = () => `
  <form id="filterForm" role="search" class="mb-8 flex flex-col gap-3 sm:flex-row">
    <label for="filterInput" class="sr-only">Filtrer par symbole</label>
    <input
      id="filterInput"
      type="text"
      placeholder="BTC, ETH, USDC..."
      value="${searchTerm}"
      class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 backdrop-blur-md outline-none transition focus-visible:border-fuchsia-400/60 focus-visible:ring-2 focus-visible:ring-fuchsia-500/60"
    />
    <button
      type="submit"
      class="shrink-0 cursor-pointer rounded-xl bg-linear-to-r from-cyan-500 to-fuchsia-500 px-6 py-2.5 font-semibold uppercase tracking-wide text-slate-950 shadow-lg shadow-fuchsia-500/20 transition hover:brightness-110 hover:shadow-fuchsia-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
    >
      Filtrer
    </button>
  </form>
`;

const marketCardTemplate = (market) => {
  const changePercent = market.price_change_percentage_24h;
  const changeLabel = formatPercent(changePercent);
  const isPositive = (changePercent ?? 0) >= 0;
  const changeClasses = isPositive ? "text-lime-400" : "text-fuchsia-400";
  return `
    <li>
      <button
        type="button"
        data-symbol="${market.symbol}"
        class="group flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-md transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-white/10 hover:shadow-lg hover:shadow-cyan-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      >
        <img src="${market.image}" alt="" class="h-10 w-10 shrink-0 rounded-full ring-1 ring-white/10" />
        <span class="flex min-w-0 flex-1 flex-col">
          <span class="truncate font-semibold uppercase tracking-wide text-slate-100">${market.symbol}</span>
          <span class="truncate text-xs text-slate-400">${market.name}</span>
        </span>
        <span class="flex flex-col items-end">
          <span class="font-mono text-sm font-semibold text-slate-100">${formatPrice(market.current_price)}</span>
          ${changeLabel ? `<span class="text-xs font-medium ${changeClasses}">${changeLabel}</span>` : ""}
        </span>
      </button>
    </li>
  `;
};

const listTemplate = () => {
  if (filteredMarketData.length === 0) {
    return `
      <p class="rounded-2xl border border-dashed border-white/10 bg-white/5 px-6 py-12 text-center text-slate-400">
        Aucun actif ne correspond à votre recherche.
      </p>
    `;
  }
  return `
    <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      ${filteredMarketData.map(marketCardTemplate).join("")}
    </ul>
  `;
};

const loadingTemplate = () => `
  <div role="status" aria-live="polite" class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-16 text-center">
    <span class="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400"></span>
    <p class="text-slate-300">Chargement des données de marché...</p>
  </div>
`;

const errorTemplate = (message) => `
  <div role="alert" class="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-8 text-center text-red-200">
    <p class="font-semibold">Impossible de charger les données</p>
    <p class="mt-1 text-sm text-red-300">${message}</p>
    <button id="retryBtn" type="button" class="mt-4 cursor-pointer rounded-xl bg-red-500/20 px-4 py-2 text-sm font-medium text-red-100 transition hover:bg-red-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400">
      Réessayer
    </button>
  </div>
`;

// -- pages --

const renderListPage = () => {
  appEl().innerHTML = shellTemplate(`
    ${headerTemplate(filteredMarketData.length, marketData.length)}
    ${searchBarTemplate()}
    <section aria-live="polite">
      ${listTemplate()}
    </section>
  `);
  attachListPageEvents();
};

const renderDetailPage = () => {
  if (!selectedItem) {
    appEl().innerHTML = shellTemplate(errorTemplate("Aucun actif sélectionné."));
    return;
  }

  const m = selectedItem;
  const changeLabel = formatPercent(m.price_change_percentage_24h);
  const isPositive = (m.price_change_percentage_24h ?? 0) >= 0;
  const changeBadgeClasses = isPositive
    ? "bg-lime-400/10 text-lime-300"
    : "bg-fuchsia-400/10 text-fuchsia-300";

  const fields = [
    { label: "Rang", value: m.market_cap_rank ?? "—" },
    { label: "Capitalisation", value: formatCompactCurrency(m.market_cap) },
    { label: "Volume (24h)", value: formatCompactCurrency(m.total_volume) },
    { label: "Plus haut (24h)", value: formatPrice(m.high_24h) },
    { label: "Plus bas (24h)", value: formatPrice(m.low_24h) },
    { label: "Plus haut historique", value: formatPrice(m.ath) },
    { label: "Plus bas historique", value: formatPrice(m.atl) },
    { label: "Offre en circulation", value: formatCompactNumber(m.circulating_supply) },
    { label: "Offre maximale", value: formatCompactNumber(m.max_supply) },
    {
      label: "Dernière mise à jour",
      value: m.last_updated ? new Date(m.last_updated).toLocaleString("fr-FR") : "—",
    },
  ];

  appEl().innerHTML = shellTemplate(`
    <button
      id="backToList"
      type="button"
      class="-ml-2 mb-6 inline-flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-slate-300 transition hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
    >
      <span aria-hidden="true">←</span> Retour à la liste
    </button>

    <div class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8">
      <div class="mb-6 flex items-center gap-4">
        <img src="${m.image}" alt="" class="h-16 w-16 rounded-full ring-2 ring-white/10" />
        <div>
          <h1 class="text-2xl font-extrabold uppercase tracking-wide text-slate-100 sm:text-3xl">${m.symbol}</h1>
          <p class="text-slate-400">${m.name}</p>
        </div>
      </div>

      <div class="mb-8 flex flex-wrap items-baseline gap-3">
        <span class="bg-linear-to-r from-cyan-300 to-fuchsia-300 bg-clip-text font-mono text-4xl font-bold text-transparent">
          ${formatPrice(m.current_price)}
        </span>
        ${
          changeLabel
            ? `<span class="rounded-full px-3 py-1 text-sm font-semibold ${changeBadgeClasses}">${changeLabel}</span>`
            : ""
        }
      </div>

      <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        ${fields
          .map(
            ({ label, value }) => `
              <div class="rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                <dt class="text-xs uppercase tracking-wide text-slate-500">${label}</dt>
                <dd class="mt-1 font-mono text-sm text-slate-100">${value}</dd>
              </div>
            `,
          )
          .join("")}
      </dl>
    </div>
  `);
  attachDetailPageEvents();
};

const renderLoading = () => {
  appEl().innerHTML = shellTemplate(`
    ${headerTemplate()}
    ${loadingTemplate()}
  `);
};

const renderError = (message) => {
  appEl().innerHTML = shellTemplate(`
    ${headerTemplate()}
    ${errorTemplate(message)}
  `);
  document.querySelector("#retryBtn")?.addEventListener("click", runApp);
};

// -- events --

const attachListPageEvents = () => {
  document.querySelector("#filterForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    searchTerm = document.querySelector("#filterInput").value;
    const query = searchTerm.trim().toLowerCase();
    filteredMarketData = marketData.filter((market) =>
      market.symbol.toLowerCase().includes(query),
    );
    renderListPage();
    document.querySelector("#filterInput")?.focus();
  });

  document.querySelector("ul")?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-symbol]");
    if (!button) return;
    const symbol = button.dataset.symbol;
    selectedItem = marketData.find((market) => market.symbol === symbol);
    if (!selectedItem) return;
    renderDetailPage();
  });
};

const attachDetailPageEvents = () => {
  document.querySelector("#backToList")?.addEventListener("click", renderListPage);
};

// -- bootstrap --

const runApp = async () => {
  renderLoading();
  try {
    marketData = await getMarketData();
    filteredMarketData = marketData.filter((market) => market.total_volume > 1_000_000);
    renderListPage();
  } catch (error) {
    renderError(error.message ?? "Une erreur inattendue est survenue.");
  }
};

runApp();
