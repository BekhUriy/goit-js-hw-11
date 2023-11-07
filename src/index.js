import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const element = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  input: document.getElementById('search-query'),
  loadMore: document.querySelector('.load-more'),
};

let query = '';
let page = 0;
let totalHits = 0;
let changedQuery = false;
let simplelightbox;

element.loadMore.style.display = 'none';

const perPage = 40;

element.loadMore.addEventListener('click', handlerLoadMore);
element.form.addEventListener('submit', handlerSearch);

async function handlerSearch(evt) {
  evt.preventDefault();

  const inputValue = element.input.value.trim();

  if (!inputValue) {
    return Notiflix.Notify.failure(
      'The search string cannot be empty. Please specify your search query.'
    );
  }

  if (query !== inputValue) {
    changedQuery = true;
    page = 0;
    totalHits = 0;
    query = inputValue;
  }

  element.loadMore.style.display = 'none';
  page++;

  try {
    const response = await fetchImages(page);

    if (!response || response.data.hits.length === 0) {
      element.gallery.innerHTML = '';
      throw new Error('No images found');
    }

    if (changedQuery) {
      element.gallery.innerHTML = creatMarkup(response.data.hits);
    } else {
      element.gallery.insertAdjacentHTML(
        'beforeend',
        creatMarkup(response.data.hits)
      );
    }

    simplelightbox = new SimpleLightbox('.gallery a').refresh();
    Notiflix.Notify.success(
      `Hooray! We found ${response.data.totalHits} images.`
    );

    const totalPages = Math.ceil(response.data.totalHits / perPage);
    if (page > totalPages) {
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }
    element.loadMore.style.display = 'block';

    const cardHeight = element.gallery.firstElementChild.clientHeight;
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  } catch (error) {
    Notiflix.Notify.failure(`Error: ${error.message}. Please try again.`);
  }
}

async function fetchImages(page) {
  const BASE_URL = 'https://pixabay.com/api/';
  const API_KEY = '40498232-0e7dac35b6ba9fe0d736e222d';
  const params = {
    key: API_KEY,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page,
    per_page: perPage,
  };

  try {
    const response = await axios.get(BASE_URL, { params });
    return response;
  } catch (error) {
    throw new Error(`Error fetching data: ${error.message}`);
  }
}

function creatMarkup(arr) {
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
      }) =>
        `
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

async function handlerLoadMore() {
  page++;
  changedQuery = false;

  try {
    const response = await fetchImages(page);
    insertCreatMarkup(response);

    simplelightbox = new SimpleLightbox('.gallery a').refresh();
    Notiflix.Notify.success(
      `Hooray! We found ${response.data.totalHits} images.`
    );

    const totalPages = Math.ceil(response.data.totalHits / perPage);
    if (page > totalPages) {
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      element.loadMore.style.display = 'none';
    }
  } catch (error) {
    Notiflix.Notify.failure(`Error: ${error.message}. Please try again.`);
  }
}

function insertCreatMarkup(response) {
  const markup = creatMarkup(response.data.hits);
  element.gallery.insertAdjacentHTML('beforeend', markup);
}
