import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const apiKey = '40367315-3c91d510b26c4724b33f253c9'; // Підстав свій унікальний ключ доступу

axios.defaults.params = {
  key: apiKey,
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
  per_page: 40, // Кількість зображень на сторінці
};

const searchForm = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
loadMoreBtn.style.display = 'none';

let page = 1; // Початкова сторінка для пагінації
gallery.innerHTML = '';

const fetchImages = async searchQuery => {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        q: searchQuery,
        page: page,
      },
    });
    return response.data.hits;
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
};

const displayImages = images => {
  const lightbox = new SimpleLightbox('.gallery a', {});

  images.forEach(image => {
    const card = document.createElement('div');
    card.classList.add('photo-card');

    card.innerHTML = `
      <a href="${image.largeImageURL}" data-lightbox="gallery-item">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item"><b>Likes:</b> ${image.likes}</p>
        <p class="info-item"><b>Views:</b> ${image.views}</p>
        <p class="info-item"><b>Comments:</b> ${image.comments}</p>
        <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
      </div>
    `;

    gallery.appendChild(card);
  });

  lightbox.refresh(); // Оновлюємо галерею після додавання нових зображень
  loadMoreBtn.style.display = 'block'; // Показуємо кнопку "Load more" після завантаження зображень
};
gallery.innerHTML = '';
searchForm.addEventListener('submit', async e => {
  e.preventDefault();
  const searchQuery = document.querySelector("input[name='searchQuery']").value;

  gallery.innerHTML = ''; // Очищаємо галерею перед новим пошуком

  const images = await fetchImages(searchQuery);

  if (images.length > 0) {
    displayImages(images);
    page = 2; // Переходимо на наступну сторінку для пагінації
    loadMoreBtn.style.display = 'block'; // Показуємо кнопку "Load more"
  } else {
    alert(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    loadMoreBtn.style.display = 'none';
    gallery.innerHTML = '';
  }
});

loadMoreBtn.addEventListener('click', async () => {
  const searchQuery = document.querySelector("input[name='searchQuery']").value;
  const images = await fetchImages(searchQuery);

  if (images.length > 0) {
    displayImages(images);
    page = 1; // Переходимо на наступну сторінку для пагінації
  } else {
    loadMoreBtn.style.display = 'none';
    alert("We're sorry, but you've reached the end of search results.");
    loadMoreBtn.style.display = 'none';
  }
});
// const cardHeight = document
//   .querySelector('.gallery')
//   .firstElementChild.getBoundingClientRect().height;

// window.addEventListener('scroll', () => {
//   const scrollY = window.scrollY;
//   const windowHeight = window.innerHeight;
//   const contentHeight = document.body.scrollHeight;

//   if (scrollY + windowHeight >= contentHeight - cardHeight) {
//     const searchQuery = document.querySelector(
//       "input[name='searchQuery']"
//     ).value;
//     fetchAndDisplayImages(searchQuery);
//   }
// });
