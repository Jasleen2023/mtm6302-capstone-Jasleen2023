const pokemonList = document.getElementById('pokemon-list');
const caughtPokemonList = document.getElementById('caught-pokemon-list');
const loadMoreButton = document.getElementById('load-more');
let offset = 0;
const limit = 20;

document.addEventListener('DOMContentLoaded', () => {
    loadPokemon();
    loadCaughtPokemon();
});

loadMoreButton.addEventListener('click', () => {
    loadPokemon();
});

async function loadPokemon() {
    const response = await fetch (`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
    const data = await response.json();
    data.results.forEach(pokemon => {
        displayPokemon(pokemon);
    });
    offset += limit;
}

function displayPokemon(pokemon) {
    const pokemonCard = document.createElement('div');
    pokemonCard.classList.add('col-md-3', 'pokemon-card');
    pokemonCard.innerHTML = `
        <div class="card mb-4">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${extractIdFromUrl(pokemon.url)}.png" class="card-img-top pokemon-img" alt="${pokemon.name}">
            <div class="card-body">
                <h5 class="card-title text-center">${capitalizeFirstLetter(pokemon.name)}</h5>
            </div>
        </div>
    `;
    pokemonCard.addEventListener('click', () => {
        loadPokemonDetails(pokemon.url);
    });
    pokemonList.appendChild(pokemonCard);
}

function extractIdFromUrl(url) {
    const parts = url.split('/');
    return parts[parts.length - 2];
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase + string.slice(1);
}

async function loadPokemonDetails(url) {
    const response = await fetch(url);
    const pokemon = await response.json();
    const pokemonDetails = `
        <div class="modal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${capitalizeFirstLetter(pokemon.name)}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <img src="${pokemon.sprites.front_default}" class="img-fluid mb-3">
                        <p><strong>Height:</strong> ${pokemon.height}</p>
                        <p><strong>Weight:</strong> ${pokemon.weight}</p>
                        <p><strong>Base Experience:</strong> ${pokemon.base_experience}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" id="catch-pokemon">Catch</button>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', pokemonDetails);
    document.querySelector('.modal').addEventListener('hidden.bs.modal', () => {
        document.querySelector('.modal').remove();
    });
    document.getElementById('catch-pokemon').addEventListener('click', () => {
        catchPokemon(pokemon);
        document.querySelector('.modal').remove();
    });
    $('.modal').modal('show');
}

function catchPokemon(pokemon) {
    let caughtPokemon = JSON.parse(localStorage.getItem('caughtPokemon')) || [];
    if (!caughtPokemon.some(p => p.id === pokemon.id)) {
        caughtPokemon.push({
            id: pokemon.id,
            name: pokemon.name,
            sprite: pokemon.sprites.front_default
        });
        localStorage.setItem('caughtPokemon', JSON.stringify(caughtPokemon));
        displayCaughtPokemon();
    }
}

function loadCaughtPokemon() {
    const caughtPokemon = JSON.parse(localStorage.getItem('caughtPokemon')) || [];
    caughtPokemon.forEach(pokemon => {
        displayCaughtPokemon(pokemon);
    });
}

function displayCaughtPokemon(pokemon) {
    const pokemonCard = document.createElement('div');
    pokemonCard.classList.add('col-md-3', 'pokemon-card', 'caught');
    pokemonCard.innerHTML = `
        <div class="card mb-4">
            <img src="${pokemon.sprite}" class="card-img-top pokemon-img" alt="${pokemon.name}">
            <div class="card-body">
                <h5 class="card-title text-center">${capitalizeFirstLetter(pokemon.name)}</h5>
                <button class="btn btn-danger btn-block" onclick="releasePokemon(${pokemon.id})">Release</button>
            </div>
        </div>
    `;
    caughtPokemonList.appendChild(pokemonCard);
}

function releasePokemon(pokemonId) {
    let caughtPokemon = JSON.parse(localStorage.getItem('caughtPokemon')) || [];
    caughtPokemon = caughtPokemon.filter(p => p.id !== pokemonId);
    localStorage.setItem('caughtPokemon', JSON.stringify(caughtPokemon));
    caughtPokemonList.innerHTML = '';
    loadCaughtPokemon();
}