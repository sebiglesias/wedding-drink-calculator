(() => {
  'use strict';

  let state = {
    drinkers: 85,
    nonDrinkers: 15,
    hours: 5,
    barType: 'full', // 'full' | 'beer-wine' | 'cocktail-only'
    includeChampagne: true,
    isSummer: true,
    bottleSize: 'handle' // 'handle' (1.75L) | 'fifth' (750ml)
  };

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  function calculate() {
    const drinkers = state.drinkers;
    const totalGuests = drinkers + state.nonDrinkers;

    // First hour is typically 2 drinks, subsequent hours 1 drink
    const totalDrinks = Math.round(drinkers * (state.hours + 0.5));

    // Distribution split based on bar type
    let winePct = 0.50;
    let beerPct = 0.30;
    let liquorPct = 0.20;

    if (state.barType === 'beer-wine') {
      winePct = 0.60;
      beerPct = 0.40;
      liquorPct = 0.0;
    } else if (state.barType === 'cocktail-only') {
      winePct = 0.30;
      beerPct = 0.20;
      liquorPct = 0.50;
    }

    if (state.isSummer) {
      beerPct *= 1.2;
      winePct *= 0.9;
    }

    // Normalize
    const totalPct = winePct + beerPct + liquorPct;
    winePct /= totalPct;
    beerPct /= totalPct;
    liquorPct /= totalPct;

    // 1. Wine: 5 glasses per 750ml bottle (divide 60% Red / 40% White/Rosé)
    const wineDrinks = totalDrinks * winePct;
    const totalWineBottles = Math.ceil(wineDrinks / 5);
    const redWineBottles = Math.ceil(totalWineBottles * 0.55);
    const whiteWineBottles = totalWineBottles - redWineBottles;

    // 2. Beer: 24 cans/bottles per case
    const beerDrinks = totalDrinks * beerPct;
    const totalBeerCans = Math.ceil(beerDrinks);
    const beerCases = Math.ceil(totalBeerCans / 24);

    // 3. Spirits: 1.75L handle = ~39 drinks; 750ml fifth = ~16 drinks
    const liquorDrinks = totalDrinks * liquorPct;
    const drinksPerBottle = state.bottleSize === 'handle' ? 39 : 16;
    const totalLiquorBottles = liquorPct > 0 ? Math.ceil(liquorDrinks / drinksPerBottle) : 0;

    // 4. Champagne Toast (6 flutes per 750ml bottle)
    const champagneBottles = state.includeChampagne ? Math.ceil(totalGuests / 6) : 0;

    // 5. Ice: 1.5 lbs per guest in summer, 1.0 lb in winter
    const iceLbsPerGuest = state.isSummer ? 1.5 : 1.0;
    const totalIceLbs = Math.round(totalGuests * iceLbsPerGuest);
    const iceBags20lb = Math.ceil(totalIceLbs / 20);

    // 6. Mixers & Non-Alcoholic
    const totalMixersLiters = Math.ceil((liquorDrinks * 0.15) + (state.nonDrinkers * state.hours * 0.4));
    const waterBottles = Math.ceil(totalGuests * 1.5);

    return {
      totalDrinks,
      totalGuests,
      totalWineBottles,
      redWineBottles,
      whiteWineBottles,
      beerCases,
      totalBeerCans,
      totalLiquorBottles,
      champagneBottles,
      totalIceLbs,
      iceBags20lb,
      totalMixersLiters,
      waterBottles
    };
  }

  function render() {
    const res = calculate();

    $('#metricTotalDrinks').textContent = res.totalDrinks;
    $('#metricTotalGuests').textContent = res.totalGuests;
    $('#metricGuestsBreakdown').textContent = `${state.drinkers} drinkers · ${state.nonDrinkers} non-drinkers · ${state.hours} hours`;

    const drinkList = $('#drinkList');
    drinkList.innerHTML = `
      <div class="material-card">
        <div class="mat-left">
          <span class="mat-title">🍷 Wine (750ml Bottles)</span>
          <span class="mat-sub">${res.redWineBottles} Red / Cabernet · ${res.whiteWineBottles} White / Sauvignon Blanc (~5 glasses/bottle)</span>
        </div>
        <span class="mat-qty">${res.totalWineBottles} bottles</span>
      </div>

      <div class="material-card">
        <div class="mat-left">
          <span class="mat-title">🍺 Beer (Cases of 24 Cans/Bottles)</span>
          <span class="mat-sub">~${res.totalBeerCans} individual 12oz beers (Mix light lagers & craft IPAs)</span>
        </div>
        <span class="mat-qty">${res.beerCases} cases</span>
      </div>

      ${res.totalLiquorBottles > 0 ? `
      <div class="material-card">
        <div class="mat-left">
          <span class="mat-title">🥃 Hard Spirits & Liquor (${state.bottleSize === 'handle' ? '1.75L Handles' : '750ml Fifths'})</span>
          <span class="mat-sub">Recommend: Vodka (35%), Bourbon/Whiskey (25%), Tequila (25%), Gin (15%)</span>
        </div>
        <span class="mat-qty">${res.totalLiquorBottles} bottles</span>
      </div>
      ` : ''}

      ${res.champagneBottles > 0 ? `
      <div class="material-card">
        <div class="mat-left">
          <span class="mat-title">🍾 Champagne / Sparkling Wine Toast</span>
          <span class="mat-sub">1 pour per guest for the toast (~6 flutes per 750ml bottle)</span>
        </div>
        <span class="mat-qty">${res.champagneBottles} bottles</span>
      </div>
      ` : ''}

      <div class="material-card">
        <div class="mat-left">
          <span class="mat-title">🧊 Ice for Tubs & Drinks (~${res.totalIceLbs} lbs)</span>
          <span class="mat-sub">${state.isSummer ? '1.5 lbs/guest (Chilling bottles & cocktails)' : '1.0 lb/guest'}</span>
        </div>
        <span class="mat-qty">${res.iceBags20lb} bags (20 lb)</span>
      </div>

      <div class="material-card">
        <div class="mat-left">
          <span class="mat-title">🥤 Mixers, Sodas & Water</span>
          <span class="mat-sub">Tonic, Club Soda, Cola, Cranberry Juice & ~${res.waterBottles} bottles of water</span>
        </div>
        <span class="mat-qty">~${res.totalMixersLiters} Liters</span>
      </div>
    `;
  }

  // Bind Events
  document.addEventListener('DOMContentLoaded', () => {
    $('#inputDrinkers').oninput = e => { state.drinkers = parseInt(e.target.value, 10) || 0; render(); };
    $('#inputNonDrinkers').oninput = e => { state.nonDrinkers = parseInt(e.target.value, 10) || 0; render(); };
    $('#inputHours').oninput = e => { state.hours = parseInt(e.target.value, 10) || 1; render(); };
    $('#selectBarType').onchange = e => { state.barType = e.target.value; render(); };
    $('#checkChampagne').onchange = e => { state.includeChampagne = e.target.checked; render(); };
    $('#checkSummer').onchange = e => { state.isSummer = e.target.checked; render(); };
    $('#selectBottleSize').onchange = e => { state.bottleSize = e.target.value; render(); };

    // Presets
    $$('.preset-btn').forEach(btn => {
      btn.onclick = () => {
        $$('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const p = btn.dataset.preset;
        if (p === 'wedding100') {
          state.drinkers = 85; state.nonDrinkers = 15; state.hours = 5; state.barType = 'full'; state.includeChampagne = true;
        } else if (p === 'cocktail50') {
          state.drinkers = 45; state.nonDrinkers = 5; state.hours = 4; state.barType = 'cocktail-only'; state.includeChampagne = false;
        } else if (p === 'dinner25') {
          state.drinkers = 22; state.nonDrinkers = 3; state.hours = 4; state.barType = 'beer-wine'; state.includeChampagne = true;
        }
        $('#inputDrinkers').value = state.drinkers;
        $('#inputNonDrinkers').value = state.nonDrinkers;
        $('#inputHours').value = state.hours;
        $('#selectBarType').value = state.barType;
        $('#checkChampagne').checked = state.includeChampagne;
        render();
      };
    });

    $('#btnCopyDrinks').onclick = () => {
      const res = calculate();
      const btn = $('#btnCopyDrinks');
      const text = `Wedding & Party Beverage Shopping List (${res.totalGuests} Guests, ${state.hours} Hours):
• Wine (750ml): ${res.totalWineBottles} bottles (${res.redWineBottles} Red, ${res.whiteWineBottles} White)
• Beer: ${res.beerCases} cases (~${res.totalBeerCans} cans/bottles)
${res.totalLiquorBottles > 0 ? `• Spirits (${state.bottleSize === 'handle' ? '1.75L' : '750ml'}): ${res.totalLiquorBottles} bottles\n` : ''}${res.champagneBottles > 0 ? `• Champagne Toast: ${res.champagneBottles} bottles\n` : ''}• Ice: ${res.iceBags20lb} bags (20 lbs) = ~${res.totalIceLbs} lbs
• Mixers & Non-Alcoholic: ~${res.totalMixersLiters}L mixers & ${res.waterBottles} water bottles
Total Estimated Drinks: ~${res.totalDrinks} servings

Calculated with: https://sebiglesias.com.ar/wedding-drink-calculator/`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          const orig = btn.innerHTML;
          btn.innerHTML = '<span>✅</span> Beverage Checklist Copied!';
          btn.style.background = '#059669';
          setTimeout(() => {
            btn.innerHTML = orig;
            btn.style.background = '';
          }, 2500);
        });
      }
    };

    render();
  });
})();
