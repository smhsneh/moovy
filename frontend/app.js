//smhsneh
document.addEventListener("DOMContentLoaded", () => {

  const trendingContainer = document.getElementById('trending');
  const favContainer = document.getElementById('favourites-container');
  const recContainer = document.getElementById('recommendations');

  const BACKEND_URL = "https://moovyb.onrender.com";

  async function fetchMovies(search = "Avengers", type = "movie") {
    const spinner = document.getElementById('spinner');
    spinner.classList.remove('hidden');

    try {
      const res = await fetch(`${BACKEND_URL}/movies?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      spinner.classList.add('hidden');

      if (data.Response === "True") renderMovies(data.Search);
      else trendingContainer.innerHTML = `<p class="inter-500 text-gray-400">No movies found</p>`;
    } catch (err) {
      spinner.classList.add('hidden');
      console.error(err);
      trendingContainer.innerHTML = `<p class="inter-500 text-gray-400">Error fetching movies</p>`;
    }
  }

  async function fetchMovieDetails(imdbID) {
    try {
      const res = await fetch(`${BACKEND_URL}/movies?id=${imdbID}`);
      const data = await res.json();
      return data; // full movie details from backend
    } catch (err) {
      console.error('Error fetching movie details:', err);
      return {};
    }
  }

  async function renderMovies(movies) {
    trendingContainer.innerHTML = "";
    const favList = JSON.parse(localStorage.getItem('moovy.favs')) || [];

    for (const movie of movies) {
      const details = await fetchMovieDetails(movie.imdbID);
      const card = document.createElement('div');
      card.className = "relative min-w-[160px] w-[160px] rounded-lg overflow-hidden transform hover:scale-105 transition-shadow duration-200 shadow-md bg-white/3 poster-glow cursor-pointer";

      card.innerHTML = `
        <img src="${movie.Poster !== "N/A" ? movie.Poster : 'assets/images/featured.jpg'}" class="w-full h-36 object-cover" alt="${movie.Title}" />
        <div class="p-2 relative">
          <h3 class="inter-500 text-sm font-semibold text-white truncate">${movie.Title}</h3>
          <div class="flex items-center gap-1 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.954c.3.922-.755 1.688-1.538 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.783.57-1.838-.196-1.538-1.118l1.287-3.954a1 1 0 00-.364-1.118L2.037 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.955z"/>
            </svg>
            <span class="text-xs text-gray-300 inter-400">${details.imdbRating || 'N/A'}</span>
          </div>
          <p class="inter-400 text-xs text-gray-400">${movie.Year} · ${movie.Type}</p>
        </div>
      `;

      const favBtn = document.createElement('button');
      favBtn.innerHTML = '❤';
      favBtn.className = "absolute top-2 right-2 text-gray-300 hover:text-red-500";
      if(favList.find(f => f.imdbID === movie.imdbID)) favBtn.classList.add('text-red-500');

      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        let favList = JSON.parse(localStorage.getItem('moovy.favs')) || [];
        const index = favList.findIndex(f => f.imdbID === movie.imdbID);

        if(index === -1){
          favList.push(movie);
          favBtn.classList.add('text-red-500');
        } else {
          favList.splice(index, 1);
          favBtn.classList.remove('text-red-500');
        }

        localStorage.setItem('moovy.favs', JSON.stringify(favList));
        updateFavouritesPage();
      });

      card.appendChild(favBtn);

      card.addEventListener('click', () => {
        const rv = JSON.parse(localStorage.getItem('moovy.recent')) || [];
        rv.unshift({title: movie.Title, time: Date.now(), type: movie.Type});
        localStorage.setItem('moovy.recent', JSON.stringify(rv.slice(0,6)));
        card.classList.add('ring-2','ring-[var(--flux-primary)]','ring-opacity-30');
        setTimeout(()=> card.classList.remove('ring-2','ring-[var(--flux-primary)]','ring-opacity-30'),600);
        recommendMovies(movie.Type);
      });

      trendingContainer.appendChild(card);
    }
  }

  function recommendMovies(type) {
    if(!recContainer) return;
    const rv = JSON.parse(localStorage.getItem('moovy.recent')) || [];
    const filtered = rv.filter(m => m.type === type);
    recContainer.innerHTML = "";
    if(filtered.length === 0){
      recContainer.innerHTML = `<p class="inter-400 text-gray-400">No recommendations yet</p>`;
      return;
    }
    filtered.slice(0,6).forEach(m => {
      const div = document.createElement('div');
      div.className = "text-sm inter-500 text-gray-300 mb-1";
      div.textContent = m.title;
      recContainer.appendChild(div);
    });
  }

  function updateFavouritesPage() {
    if(!favContainer) return;
    const favList = JSON.parse(localStorage.getItem('moovy.favs')) || [];
    favContainer.innerHTML = "";

    if(favList.length === 0){
      favContainer.innerHTML = `<p class="inter-400 text-gray-400">No favourites added yet.</p>`;
      return;
    }

    favList.forEach(movie => {
      const div = document.createElement('div');
      div.className = "flex items-center gap-3 mb-3";
      div.innerHTML = `
        <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'assets/images/featured.jpg'}" class="w-12 h-16 object-cover rounded"/>
        <div class="flex-1 inter-500 text-white">${movie.Title}</div>
        <button class="text-red-500 hover:text-gray-300 remove-btn">Remove</button>
      `;

      div.querySelector('.remove-btn').addEventListener('click', () => {
        let favList = JSON.parse(localStorage.getItem('moovy.favs')) || [];
        favList = favList.filter(f => f.imdbID !== movie.imdbID);
        localStorage.setItem('moovy.favs', JSON.stringify(favList));
        updateFavouritesPage();

        document.querySelectorAll('.poster-glow').forEach(card => {
          const titleEl = card.querySelector('h3');
          if(titleEl && titleEl.textContent === movie.Title){
            const heart = card.querySelector('button');
            heart.classList.remove('text-red-500');
          }
        });
      });

      favContainer.appendChild(div);
    });
  }

  const searchForm = document.getElementById('search-form');
  if(searchForm){
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = document.getElementById('search-input').value;
      if(query) fetchMovies(query);
    });
  }

  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('bg-[var(--flux-primary)]'));
      btn.classList.add('bg-[var(--flux-primary)]');
      const type = btn.dataset.type;
      fetchMovies(document.getElementById('search-input').value || "Avengers", type);
    });
  });

  const menuBtn = document.getElementById('menu-btn');
  const closeBtn = document.getElementById('close-menu');
  const mobileMenu = document.getElementById('mobile-menu');
  if(menuBtn && closeBtn && mobileMenu){
    menuBtn.addEventListener('click', ()=> mobileMenu.classList.remove('menu-closed'));
    closeBtn.addEventListener('click', ()=> mobileMenu.classList.add('menu-closed'));
  }

  fetchMovies();
  updateFavouritesPage();
});
