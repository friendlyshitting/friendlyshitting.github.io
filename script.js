var customIcon = L.icon({
    iconUrl: 'loc_icon.png', // Reemplaza esto con la ruta a tu archivo PNG
    iconSize: [64, 64], // Cambia esto por el tamaño de tu imagen PNG (ancho, alto)
    iconAnchor: [16, 32], // Cambia esto por el punto de anclaje de tu imagen PNG (ancho/2, alto)
    popupAnchor: [0, -32] // Cambia esto si es necesario para ajustar la posición del mensaje emergente
});

var pooicon = L.icon({
iconUrl: 'poo.png', // Reemplaza esto con la ruta a tu archivo PNG
iconSize: [64, 64], // Cambia esto por el tamaño de tu imagen PNG (ancho, alto)
iconAnchor: [16, 32], // Cambia esto por el punto de anclaje de tu imagen PNG (ancho/2, alto)
popupAnchor: [0, -32] // Cambia esto si es necesario para ajustar la posición del mensaje emergente
});

var modal = document.getElementById('myModal');


document.getElementById("searchBtn").addEventListener("click", function () {
    var searchString = document.getElementById("searchInput").value;
    if (searchString) {
        var geosearch = new GeoSearch.OpenStreetMapProvider();
        geosearch.search({ query: searchString }).then(function (results) {
            if (results && results.length > 0) {
                var bestResult = results[0];
                map.flyTo([bestResult.y, bestResult.x], 16);
            } else {
                alert("No se encontraron resultados.");
            }
        }).catch(function (error) {
            console.error("Error en la búsqueda: ", error);
            alert("Ocurrió un error al buscar. Por favor, inténtalo de nuevo.");
        });
    } else {
        alert("Por favor, ingresa un término de búsqueda.");
    }
});


    // Configuración de Firebase
    var firebaseConfig = {
        apiKey: "AIzaSyBb0idYpy6rc7x9tYcEhkyr6eUwG90ktQM",
        authDomain: "friendlypoop-a411b.firebaseapp.com",
        projectId: "friendlypoop-a411b",
        storageBucket: "friendlypoop-a411b.appspot.com",
        messagingSenderId: "677329695781",
        appId: "1:677329695781:web:50f95654cb9b813d973bcc",
        measurementId: "G-SJ1ZDYPQTP"
    };
    firebase.initializeApp(firebaseConfig);

    // Inicializa el mapa con Leaflet y OpenStreetMap
    var map = L.map('map').setView([40.416775, -3.703790], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
    }).addTo(map);

// Función para vincular eventos a un marcador
function bindMarkerEvents(marker) {
// Agrega el nombre del lugar y un botón "Borrar" al mensaje emergente del marcador
marker.bindPopup(function () {
    var popupContent = "<strong>Nombre del lugar:</strong> " + marker.options.name + "<br>";
    popupContent += "<strong>Limpieza:</strong> " + "★".repeat(marker.options.rating) + "☆".repeat(5 - marker.options.rating) + "<br>";
    popupContent += "<strong>Tipo de acceso:</strong> " + marker.options.accessType;
    popupContent += "<br><button class='btn btn-danger btn-sm mt-2 delete-marker' data-marker-id='" + marker.id + "'>Borrar</button>";
    return popupContent;
});

// Agrega un evento de escucha al botón "Borrar" del mensaje emergente del marcador
marker.on('popupopen', function (e) {
    var deleteBtns = document.getElementsByClassName('delete-marker');
    for (var i = 0; i < deleteBtns.length; i++) {
    deleteBtns[i].addEventListener('click', function () {
        var markerId = this.getAttribute('data-marker-id');
        deleteMarker(markerId);
    });
    }
});
}

function deleteMarker(markerId) {
if (markerId) {
    if (confirm("¿Estás seguro de que quieres eliminar este marcador?")) {
    // Busca el marcador en el mapa y lo elimina
    map.eachLayer(function (layer) {
        if (layer instanceof L.Marker && layer.id === markerId) {
        map.removeLayer(layer);
        }
    });

    // Elimina el marcador de Firebase
    var markersCollection = firebase.firestore().collection("markers");
    markersCollection.doc(markerId).delete().then(function () {
        console.log("Marcador eliminado con éxito");
    }).catch(function (error) {
        console.error("Error al eliminar el marcador: ", error);
    });
    }
}
}

function locateUser() {
map.locate({ setView: true, maxZoom: 16 });

function onLocationFound(e) {
    var radius = e.accuracy / 2;
    L.marker(e.latlng, {icon: customIcon}).addTo(map).bindPopup("Estás a " + radius + " metros de este punto");
    L.circle(e.latlng, radius).addTo(map);
}

map.on('locationfound', onLocationFound);

function onLocationError(e) {
    alert(e.message);
}

map.on('locationerror', onLocationError);
}




// Variable global para guardar las coordenadas del marcador
var markerCoords = null;

// Variable global para guardar el marcador seleccionado
var selectedMarker = null;

// Función para agregar un marcador
function addMarker() {
    if (!markerCoords) return;

    var markerName = document.getElementById("markerName").value;

    if (markerName) {
    // Agrega un marcador al mapa con la información completa y el icono personalizado
    var marker = L.marker(markerCoords, {
        icon: pooicon, // Añade el icono personalizado aquí
        name: markerName,
        rating: 6 - parseInt(document.querySelector("input[name='rating']:checked").value),
        accessType: document.getElementById("markerAccessType").value
    }).addTo(map);

    if (selectedMarker) {
        // Actualiza la información del marcador seleccionado
        selectedMarker.options.name = markerName;
        selectedMarker.options.rating = parseInt(document.querySelector("input[name='rating']:checked").value);
        selectedMarker.options.accessType = document.getElementById("markerAccessType").value;

        // Actualiza la información en Firebase
        var markersCollection = firebase.firestore().collection("markers");
        markersCollection.doc(selectedMarker.id).update({
        name: markerName,
        rating: selectedMarker.options.rating,
        accessType: selectedMarker.options.accessType
        });

        // Actualiza el mensaje emergente del marcador
        var popupContent = "<strong>Nombre del lugar:</strong> " + selectedMarker.options.name + "<br>";
        popupContent += "<strong>Limpieza:</strong> " + "★".repeat(selectedMarker.options.rating) + "☆".repeat(5 - selectedMarker.options.rating) + "<br>";
        popupContent += "<strong>Tipo de acceso:</strong> " + selectedMarker.options.accessType;
        selectedMarker.bindPopup(popupContent);

        // Restablece el marcador seleccionado
        selectedMarker = null;
    }

    // Guarda el marcador en Firebase
    var markersCollection = firebase.firestore().collection("markers");
    markersCollection.add({
    lat: markerCoords.lat,
    lng: markerCoords.lng,
    name: markerName,
    rating: parseInt(document.querySelector("input[name='rating']:checked").value),
    accessType: document.getElementById("markerAccessType").value
    }).then(function (docRef) {
    marker.id = docRef.id; // Asigna el ID del documento en Firestore al marcador
    bindMarkerEvents(marker); // Vincula los eventos al marcador
    });


    // Limpia y oculta el formulario
    document.getElementById("markerName").value = "";
} else {
    alert("Por favor, ingresa un nombre para el lugar.");
}
}

    document.getElementById("markerForm").addEventListener("submit", function (event) {
    event.preventDefault();
    document.getElementById("markerMenu").style.display = "none";
    addMarker();
    });

    //document.getElementById("cancelMarkerBtn").addEventListener("click", function () {
    // código para cancelar la acción, si es necesario
    //});

    document.addEventListener('DOMContentLoaded', function() {
    const cancelMarkerBtn = document.getElementById('cancelMarkerBtn');
    const markerMenu = document.getElementById('markerMenu');
    
    cancelMarkerBtn.addEventListener('click', function() {
        markerMenu.style.display = 'none';
    });
    });

    document.getElementById("locateUserBtn").addEventListener("click", function () {
    locateUser();
    });


    // Modifica la función loadMarkers para cargar el nombre del lugar
    function loadMarkers() {
    var markersCollection = firebase.firestore().collection("markers");
        markersCollection.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            var data = doc.data();
            var marker = L.marker([data.lat, data.lng], {
            icon: pooicon, // Añade el icono personalizado aquí
            name: data.name,
            rating: data.rating, // Añade la propiedad rating
            accessType: data.accessType // Añade la propiedad accessType
            }).addTo(map);          
            marker.id = doc.id; // Asigna el ID del documento en Firestore al marcador

        // Agrega la información adicional al mensaje emergente del marcador
        var popupContent = "<strong>Nombre del lugar:</strong> " + data.name + "<br>";
        popupContent += "<strong>Limpieza:</strong> " + "★".repeat(data.rating) + "☆".repeat(5 - data.rating) + "<br>";
        popupContent += "<strong>Tipo de acceso:</strong> " + data.accessType;
        marker.bindPopup(popupContent);
        bindMarkerEvents(marker); // Vincula los eventos al marcador
        });
    });
    }


    document.getElementById("deleteMarkerBtn").addEventListener("click", function () {
if (selectedMarker) {
    if (confirm("¿Estás seguro de que quieres eliminar este marcador?")) {
    map.removeLayer(selectedMarker);

    // Elimina el marcador de Firebase
    var markersCollection = firebase.firestore().collection("markers");
    markersCollection.doc(selectedMarker.id).delete();

    // Limpia y oculta el formulario
    document.getElementById("markerName").value = "";
    document.getElementById("markerMenu").style.display = "none";
    document.getElementById("deleteMarkerBtn").style.display = "none";

    // Restablece el marcador seleccionado
    selectedMarker = null;
    }
}
});


    loadMarkers();

    function populateForm(marker) {
    selectedMarker = marker;
    document.getElementById("markerName").value = marker.options.name;
    document.getElementById("rating-" + marker.options.rating).checked = true;
    document.getElementById("markerAccessType").value = marker.options.accessType;
    // Muestra el menú
    document.getElementById("markerMenu").style.display = "block";
    // Muestra el botón "Borrar marcador"
    document.getElementById("deleteMarkerBtn").style.display = "block";
    }

    function displayModalAndAddLocation() {
        // Muestra el modal
        modal.style.display = 'block';
    
        // Cierra el modal automáticamente después de 1 segundo (1000 milisegundos)
        setTimeout(function () {
            closeModalAndAddLocation();
        }, 2000);
    }
    
    document.getElementById('addLocationBtn').addEventListener('click', function () {
        displayModalAndAddLocation();
    });

    document.getElementById('addLocationBtn').addEventListener('click', function() {
        // Muestra el modal
        var modal = document.getElementById('myModal');
        modal.style.display = 'block';
    
        // Cierra el modal automáticamente después de 1 segundo (1000 milisegundos)
        setTimeout(function() {
            closeModalAndAddLocation();
        }, 2000);
    });
    
    function closeModalAndAddLocation() {
        // Cierra el modal
        modal.style.display = 'none';
    
        // Cambia el cursor del mapa a "crosshair" y habilita el modo de adición de marcadores
        map.getContainer().style.cursor = "crosshair";
        map.once("click", function (e) {
            markerCoords = e.latlng;
            document.getElementById("markerMenu").style.display = "block";
            // Restaura el cursor predeterminado después de agregar el marcador
            map.getContainer().style.cursor = "";
        });
    }
    
    // Cierra el modal cuando se hace clic en el botón de cierre (x)
    document.getElementById('closeModal').addEventListener('click', function() {
        closeModalAndAddLocation();
    });
    
    // Cierra el modal cuando se hace clic fuera del contenido del modal
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModalAndAddLocation();
        }
    });
    

    // Manejar el botón añadir lugar
    document.getElementById("addLocationBtn").addEventListener("click", function () {
    // Cambia el cursor del mapa a "crosshair" y habilita el modo de adición de marcadores
    map.getContainer().style.cursor = "crosshair";
    map.once("click", function (e) {
        markerCoords = e.latlng;
        document.getElementById("markerMenu").style.display = "block";
        // Restaura el cursor predeterminado después de agregar el marcador
        map.getContainer().style.cursor = "";
    });
    
    });

    function createStarRating() {
    var ratingContainer = document.getElementById("markerRating");

    for (var i = 5; i >= 1; i--) {
        var radioInput = document.createElement("input");
        radioInput.type = "radio";
        radioInput.name = "rating";
        radioInput.id = "rating-" + i;
        radioInput.value = i;
        radioInput.classList.add("rating");

        var label = document.createElement("label");
        label.htmlFor = "rating-" + i;
        label.classList.add("rating");

        ratingContainer.appendChild(radioInput);
        ratingContainer.appendChild(label);
    }
    }


    createStarRating();

