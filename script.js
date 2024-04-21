// Finding the element with the label Findkino
const findkino = document.getElementById('findkino');
const theaterLabel = document.getElementById('theater-label');
const theaterSelect = document.getElementById('theater-select');
const searchInput = document.getElementById('search-input');
const movieList = document.querySelector('.movie-list');

// Adding a mouse hover event handler for the hover effect on Findkino
findkino.addEventListener('mouseenter', () => {
  findkino.style.color = 'white'; // Changing the text color to white on hover
});

// Adding a mouse exit event handler to remove the hover effect from Findkino
findkino.addEventListener('mouseleave', () => {
  findkino.style.color = 'gold'; // Returning the original text color on mouse exit
});

// Adding a mouse click event handler for the home function when clicking on Findkino
findkino.addEventListener('click', () => {
  window.location.reload(); // Reloading the page when clicking on the Findkino label
});

// Fetch theater list from Finnkino API
fetch('http://www.finnkino.fi/xml/TheatreAreas/')
  .then(response => response.text())
  .then(data => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'text/xml');
    const theaters = xmlDoc.getElementsByTagName('TheatreArea');

    for (let i = 0; i < theaters.length; i++) {
      const theaterName = theaters[i].getElementsByTagName('Name')[0].childNodes[0].nodeValue;
      const theaterId = theaters[i].getElementsByTagName('ID')[0].childNodes[0].nodeValue;

      const option = document.createElement('option');
      option.textContent = theaterName;
      option.value = theaterId;
      theaterSelect.appendChild(option);
    }
  });

// Event listener for theater selection
theaterSelect.addEventListener('change', () => {
  theaterLabel.style.display = 'none'; // Hiding the label after selecting a theater
  fetchMovies();
});

// Event listener for search input
searchInput.addEventListener('input', () => {
  fetchMovies();
});

// Check if theater is selected on page load
window.addEventListener('load', () => {
  theaterLabel.style.display = 'block'; // Showing the label when the page loads
  if (theaterSelect.value !== '') {
    fetchMovies();
  }
});

function fetchMovies() {
  const selectedTheaterId = theaterSelect.value;
  const searchString = searchInput.value.trim();

  // Check if theater is selected
  if (selectedTheaterId === '') {
    return; // Exit the function if no theater is selected
  }

  let apiUrl = `http://www.finnkino.fi/xml/Schedule/?area=${selectedTheaterId}`;

  if (searchString !== '') {
    apiUrl += `&title=${encodeURIComponent(searchString)}`;
  }

  fetch(apiUrl)
    .then(response => response.text())
    .then(data => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, 'text/xml');
      const movies = xmlDoc.getElementsByTagName('Show');

      movieList.innerHTML = ''; // Clear previous movie list

      for (let i = 0; i < movies.length; i++) {
        const title = movies[i].getElementsByTagName('Title')[0].childNodes[0].nodeValue;
        const start = movies[i].getElementsByTagName('dttmShowStart')[0].childNodes[0].nodeValue;
        const end = movies[i].getElementsByTagName('dttmShowEnd')[0].childNodes[0].nodeValue;
        const imageUrl = movies[i].getElementsByTagName('EventSmallImagePortrait')[0].childNodes[0].nodeValue;
        const description = movies[i].getElementsByTagName('PresentationMethodAndLanguage')[0].childNodes[0].nodeValue;

        // Filtering movies based on the search query
        if (title.toLowerCase().includes(searchString.toLowerCase())) {
          const movieItem = document.createElement('div');
          movieItem.classList.add('movie-item');
          movieItem.innerHTML = `
            <img src="${imageUrl}" alt="${title}">
            <div>
              <p class="movie-title">${title}</p>
              <p>Showtime: ${formatShowtime(start, end)}</p>
              <p class="movie-description">${description}</p>
            </div>
          `;
          movieList.appendChild(movieItem);
        }
      }
    });
}

function formatShowtime(start, end) {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const duration = (endTime - startTime) / (1000 * 60); // Convert milliseconds to minutes
  const formattedDate = `${startTime.toLocaleDateString()} `;
  const formattedTime = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
  const formattedDuration = `${Math.floor(duration / 60)}h ${duration % 60}min`;

  return `${formattedDate}${formattedTime}  (${formattedDuration})`;
}
