const categoryList = document.querySelector('#categoryList'); // dropdown-item
const searchMonumentElement = document.querySelector('#searchMonument');
const currentYear = document.querySelector('#currentYear');

let map;
let allCategories = [];

currentYear.textContent = new Date().getFullYear() 

const initMap = () => {
  // create gray basemap
  let openStreetMapTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 8,
    maxZoom: 16,
  });
  // initialize the map on the "map" div with a given center and zoom
  return L.map('map', {
    center: [42.18, 9.20],
    zoom: 8,
    layers: [openStreetMapTiles],
  });
}

const addMakerToMap = (latitude, longitude, name, category = '') => {
  let myIcon = L.Icon.Default;
  if (category != '' && category != undefined) {
    category = category.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    category = category.replaceAll(' ', '_').replaceAll('\'', '_').toLowerCase();
    myIcon = L.icon({
      iconUrl: `../img/category_icon/${category}.png`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -40],
      shadowUrl: '../img/category_icon/marker-shadow.png',
      shadowSize: [40, 40],
      shadowAnchor: [20, 40],
    });
  }
  L.marker([latitude, longitude], { icon: myIcon }).addTo(map)
    .bindPopup(name)
}

const getMonuments = async (q = '') => {
  const monumentsList = document.querySelector('#monumentsList');
  monumentsList.innerHTML = '';
  // const apiURL = 'https://www.data.corsica/api/records/1.0/search/?dataset=liste-des-monuments-historiques-en-corse&rows=9999&q=' + q;
  // const response = await fetch(apiURL);
  // const data = await response.json();
  // récupère les données en local
  const data = await fetch('/data/data.json').then(response => response.json());
  console.log(data);


  const addElement = (name, category, lat, lon) => {
    category = category.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    category = category.replaceAll(' ', '_').replaceAll('\'', '_').toLowerCase();

    const new_element = document.createElement('li');
    new_element.addEventListener("click", (e) => {
      const elem = e.target;
      console.log(elem);
      map.setView([elem.dataset.lat, elem.dataset.lon], 13);
    });
    new_element.setAttribute('id', category);
    new_element.setAttribute('data-lat', lat);
    new_element.setAttribute('data-lon', lon);

    const span = document.createElement('span');
    span.style.pointerEvents = 'none';
    span.textContent = name;

    const img = document.createElement('img');
    img.style.pointerEvents = 'none';
    img.src = `img/category_icon/${category}.png`;
    img.style.width = '30px';
    img.style.height = '30px';

    new_element.appendChild(img);
    new_element.appendChild(span);
    monumentsList.appendChild(new_element);
  };

  const addCategory = (category) => {
    if(!allCategories.includes(category)) {
      allCategories.push(category);

      const new_category = document.createElement('option');
      new_category.textContent = category;

      category = category.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      category = category.replaceAll(' ', '_').replaceAll('\'', '_').toLowerCase();
      new_category.value = category;

      categoryList.appendChild(new_category);
    }
  }

  // liste les monuments
  data.records.forEach((element) => {
    const name = element.fields.appelation;
    const category = element.fields.categorie;
    const latitude = element.fields.point2d[0];
    const longitude = element.fields.point2d[1];
    addElement(name, category ?? 'autre', latitude, longitude);
    addMakerToMap(latitude, longitude, name, category ?? 'autre');
    addCategory(category ?? 'autre');
  });

}

searchMonumentElement.addEventListener('keyup', (e) => {
  const searchMonument = e.target.value.toLowerCase();
  map.remove();
  map = initMap();
  getMonuments(searchMonument);
});

categoryList.addEventListener('change', (e) => {
  console.log(e);
  const category = e.target.value;
  const option = categoryList.querySelector(`option[value=${category}]`);
  searchMonumentElement.value = option.textContent;
  const event = new Event('keyup');
  searchMonumentElement.dispatchEvent(event);
});


// MAIN //
map = initMap();
// getUserLocation();
await getMonuments();


