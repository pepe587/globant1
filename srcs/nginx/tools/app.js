const accessKey = "1limJC1oMa3Vy-zxff6k5sjYiGbFvqtdvoRoOjTnmAc";

const gallery = document.getElementById('gallery');

async function fetchPhotos(loggedIn) {
  let response;
  try {
    response = await fetch(`https://api.unsplash.com/photos?client_id=${accessKey}`);
    const photos = await response.json();
    gallery.innerHTML = "";
    photos.forEach(photo => {
      const photoElement = document.createElement('div');
      photoElement.className = 'photo';
      if (loggedIn) {
        photoElement.innerHTML = `<img src="${photo.urls.regular}" alt="${photo.alt_description}">
        <button class="favorite-btn" data-id="${photo.id}">❤️</button>`;
        listenPhoto(photoElement, photo.id);
        // Add event listener to the favorite button
        
      }
      else
        photoElement.innerHTML = `<img src="${photo.urls.regular}" alt="${photo.alt_description}">`;
      gallery.appendChild(photoElement);
    });
  }
  catch (error) {
    console.error(error);
    gallery.innerHTML = "<p>Something went wrong</p>";
  }
}
async function listenPhoto(photoElement, photoId) {
  photoElement.querySelector('.favorite-btn').addEventListener('click', async (event) => {
    json_body = JSON.stringify({ photoId });
    console.log('json_body:', json_body);
    /*Save the like local (this can be changed)*/
		const response = await fetch('http://localhost:3000/api/favorite',
      {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: json_body
    }
  )
    .then(response => {
      if (response.ok) {
        console.log('PhotoId added to favorites:', photoId);
      }
      else {
        console.error('An error occurred');
      }
    })
    .catch(error => console.error('Error adding photo to favorites:', error));
	});
}

document.addEventListener("DOMContentLoaded", () => {
  initialize();
});

async function initialize() {
  const loggedIn = await isUserLoggedIn();
  console.log("loggedIn:", loggedIn);
  
  // Hide the login button if logged in
  if (loggedIn) {
    document.getElementById('login').style.display = 'none';
    handlesButtons();
  }
  fetchPhotos(loggedIn);
  //renderButtons(loggedIn);
  //main();
}

function handlesButtons() {
  document.getElementById('login').style.display = 'none';
  document.getElementById('query').style.display = 'block';
  document.getElementById('search-button').style.display = 'block';
  document.getElementById('favorites').style.display = 'block';
}


async function isUserLoggedIn() {
  try {
    const response = await fetch('http://localhost:3000/api/check-auth'); // Use the correct URL
    console.log(response);
    if (response.ok) {
      const data = await response.json();
      loggedIn = data.loggedIn;
      return data.loggedIn;
    }
    else {
      console.error('An error occurred');
      return false;
    }
  }
  catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
}

// Logic to redirect users to Unsplah for authentication
document.getElementById('login').addEventListener('click', () => {
  window.location.href = "http://127.0.0.1:3000/auth/login";
});

// Logic to search for photos
document.getElementById('search-button').addEventListener('click', async (event) => {
  const query = document.getElementById('query').value;
  console.log('Query: ', query);
  const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}&client_id=${accessKey}`);
  const data = await response.json();
  gallery.innerHTML = "";
  data.results.forEach(photo => {
    const photoElement = document.createElement('div');
    photoElement.className = 'photo';
    photoElement.innerHTML = `<img src="${photo.urls.regular}" alt="${photo.alt_description}">
    <button class="favorite-btn" data-id="${photo.id}">❤️</button>`;
    listenPhoto(photoElement, photo.id);
    gallery.appendChild(photoElement);
    });
  }
);


document.getElementById('favorites').addEventListener('click', async () => {
  const response = await fetch('http://localhost:3000/api/favorites');
  const data = await response.json();
  gallery.innerHTML = "";
  console.log('favorites > data:', data);

  favorites = data.favorites;
  if (Array.isArray(favorites)) {
    favorites.forEach(async (photo) => {
      console.log('photo:', photo);
      const response_data = await fetch(`https://api.unsplash.com/photos/${photo}?client_id=${accessKey}`);
      const photoData = await response_data.json();
      console.log('photo.urls:', photoData.urls);

      renderPhotoWithUnlike(photoData);
    });

    gallery.addEventListener('click', async (event) => {
      if (event.target.classList.contains('unlike-btn')) {
        const photoId = event.target.getAttribute('data-photo-id');
        const response = await fetch(`http://localhost:3000/api/favorites/${photoId}`, {
          method: 'DELETE'
        });
        if (response.status === 200) {
          event.target.parentElement.remove();
        }
      }
    });
  } else {
    console.error('Data is not an array:', favorites);
  }
});

const renderPhotoWithUnlike = (photoData) => {
  const photoElement = document.createElement('div');
  photoElement.className = 'photo';
  photoElement.innerHTML = `
    <img src="${photoData.urls.regular}" alt="${photoData.alt_description}">
    <button class="unlike-btn favorite-btn" data-photo-id="${photoData.id}">
      ✖
    </button>`;
  gallery.appendChild(photoElement);
};

// Asegúrate de que los estilos para .favorite-btn estén definidos en tu CSS
const styles = `
  .favorite-btn {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background-color: rgba(255, 255, 255, 0.8);
    color: #e74c3c;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .favorite-btn:hover {
    transform: scale(1.2);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
`;

// Añadir los estilos al documento
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);