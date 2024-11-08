(function () {
    console.log("rest API");
    // URL de l'API REST de WordPress
    let bouton__categorie = document.querySelectorAll(".bouton__categorie");
    let url;

    for (const elm of bouton__categorie) {
        elm.addEventListener("mousedown", function (e) {
            // Enlever la classe active de tous les boutons
            bouton__categorie.forEach((b) => b.classList.remove("bouton__categorie__actif"));
            // Ajouter la classe active au bouton cliqué
            elm.classList.add("bouton__categorie__actif");

            let categorie = e.target.id.replace("cat_", "");

            if (categorie === "tous") {
                // URL pour récupérer tous les projets
                url = `http://localhost/5w5/wp-json/wp/v2/posts?_fields=link,title,featured_media,_links,_embedded,content,terms&_embed`;
            } else {
                // URL pour récupérer les projets par catégorie
                url = `http://localhost/5w5/wp-json/wp/v2/posts?categories=${categorie}&_fields=link,title,featured_media,_links,_embedded,content,terms&_embed`;
            }

            console.log(url);
            fetchUrl(url);
        });
    }

    // Effectuer la requête HTTP en utilisant fetch()
    function fetchUrl(url) {
        fetch(url)
            .then(function (response) {
                // Vérifier si la réponse est OK (statut HTTP 200)
                if (!response.ok) {
                    throw new Error("La requête a échoué avec le statut " + response.status);
                }

                // Analyser la réponse JSON
                return response.json();
            })
            .then(function (data) {
                // La variable "data" contient la réponse JSON
                console.log(data);

                // Triez les données par titre en ordre alphabétique
                data.sort(function (a, b) {
                    return a.title.rendered.localeCompare(b.title.rendered);
                });

                // Récupérer les éléments des deux colonnes
                let colonne1 = document.querySelector(".colonne-1");
                let colonne2 = document.querySelector(".colonne-2");
                colonne1.innerHTML = ""; // Réinitialiser le contenu
                colonne2.innerHTML = ""; // Réinitialiser le contenu

                data.forEach(function (article, index) {
                    let titre = article.title.rendered;
                    let lien = article.link;
                    let image;
                    if (article._embedded["wp:featuredmedia"]) {
                        image = article._embedded["wp:featuredmedia"][0].link; // Utilise le bon chemin pour l'image
                    } else {
                        image = ""; // Fallback si aucune image n'est disponible
                    }

                    // Remplacer le innerHTML pour correspondre à la structure souhaitée
                    let carte = document.createElement("div");
                    carte.classList.add("thumbnail-projet"); // Ajouter la classe pour le style

                    carte.innerHTML = `
                        <a href="${lien}" style="background-image: url('${image}');" class="thumbnail-projet">
                            <h2>${titre}</h2>
                        </a>
                    `;

                    // Ajouter la carte à la colonne appropriée
                    if (index % 2 === 0) {
                        colonne1.appendChild(carte); // Ajouter à la colonne 1
                    } else {
                        colonne2.appendChild(carte); // Ajouter à la colonne 2
                    }
                });
            })
            .catch(function (error) {
                // Gérer les erreurs
                console.error("Erreur lors de la récupération des données :", error);
            });
    }
})();
