import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const ref = {
  form: document.querySelector('.search-form'),
  gallary: document.querySelector('.gallery'),
  input: document.getElementById('search-query'),
  loadMore: document.querySelector('.load-more'),
};

ref.loadMore.addEventListener('click', handlerLoadMore);
ref.form.addEventListener('submit', handlerSearch);

let query = '';
let page = 0;
let totalHits = 0;
let changedQuery = false;
ref.loadMore.style.display = 'none';
const perPage = 40;
let simplelightbox;

async function handlerSearch(evt) {
  evt.preventDefault();
  if (!ref.input.value) {
    return Notiflix.Notify.failure(
      'The search string cannot be empty. Please specify your search query.'
    );
  }
  changedQuery = false;
  if (query === '' || query !== ref.input.value) {
    query = ref.input.value;
    changedQuery = true;
    page = 0;
    totalHits = 0;
  }
  ref.loadMore.style.display = 'none';
  page++;

  let response = await fetchImages(page);
  if (!response || response.data.hits.length === 0) {
    ref.gallary.innerHTML = '';
    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    insertCreatMarcup(response);
    simplelightbox = new SimpleLightbox('.gallery a').refresh();
    Notiflix.Notify.success(
      `Hooray! We found ${response.data.totalHits} images.`
    );
  }
  ref.loadMore.style.display = 'block';

  const totalPages = Math.ceil(response.data.totalHits / perPage);
  if (page > totalPages) {
    Notiflix.Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  }

  /*  плавне прокручування сторінки  */
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

async function fetchImages(page) {
  const BASE_URL = 'https://pixabay.com/api/';
  const API_KEY = '40367315-3c91d510b26c4724b33f253c9';
  const params = new URLSearchParams({
    key: API_KEY,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page,
    per_page: 40,
  });
  try {
    const response = await axios.get(`${BASE_URL}?${params}`);
    console.log(response);
    return response;
  } catch (error) {
    return null;
  }
}
function creatMarcup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
   <a class="gallery-link" href="${largeImageURL}">
    <div class="photo-card">
      <div class="gallery-item">
          <img class="gallery-item-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
          <div class="info">
            <p class="info-item"><b>Likes</b> ${likes}</p>
            <p class="info-item"><b>Views</b> ${views}</p>
            <p class="info-item"><b>Comments</b> ${comments}</p>
            <p class="info-item"><b>Downloads</b> ${downloads}</p>
          </div>
      </div>
    </div>
  </a>

  `
    )
    .join('');
}
function insertCreatMarcup(response) {
  if (changedQuery) {
    ref.gallary.innerHTML = creatMarcup(response.data.hits);
  } else {
    ref.gallary.insertAdjacentHTML(
      'beforeend',
      creatMarcup(response.data.hits)
    );
  }
}
async function handlerLoadMore() {
  page++;
  changedQuery = false;
  let response = await fetchImages(page);
  insertCreatMarcup(response);
  simplelightbox = new SimpleLightbox('.gallery a').refresh();
  Notiflix.Notify.success(
    `Hooray! We found ${response.data.totalHits} images.`
  );

  const totalPages = Math.ceil(response.data.totalHits / perPage);
  if (page > totalPages) {
    Notiflix.Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
    ref.loadMore.style.display = 'none';
  }
}
