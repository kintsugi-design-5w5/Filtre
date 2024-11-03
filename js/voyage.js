(function () {
    console.log("rest API");
    // URL de l'API REST de WordPress
    let bouton__categorie = document.querySelectorAll(".bouton__categorie");
    let url;
    for (const elm of bouton__categorie) {
        elm.addEventListener("mousedown", function (e) {
            let categories = document.querySelectorAll(".bouton__categorie");
            for (const elm of categories) {
                elm.classList.remove("bouton__categorie__actif");
            }
            elm.classList.add("bouton__categorie__actif");
            categories = e.target.id;

            categories = categories.replace("cat_", "");
            // url = `https://gftnth00.mywhc.ca/tim41/wp-json/wp/v2/posts?categories=${categories}`;
            url = `https://gftnth00.mywhc.ca/tim41/wp-json/wp/v2/posts?categories=${categories}&_fields=link,title,featured_media,_links,_embedded,content,categories,terms&_embed
            `;
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
                console.log(response.json());
            })
            .then(function (data) {
                // La variable "data" contient la réponse JSON
                console.log(data);

                // Triez les données par titre en ordre alphabétique
                data.sort(function (a, b) {
                    return a.title.rendered.localeCompare(b.title.rendered);
                });

                let restapi = document.querySelector(".contenu__restapi");
                restapi.innerHTML = "";

                // Maintenant, vous pouvez traiter les données comme vous le souhaitez
                // Par exemple, extraire les titres des articles comme dans l'exemple précédent
                data.forEach(function (article) {
                    let titre = article.title.rendered;

                    let categories = article.categories;
                    let liens_cat = `https://gftnth00.mywhc.ca/tim41/category/${categories}`;
                    // peux tu faire le liens vers les catégories

                    // console.log(categories);
                    if (article.meta && article.meta.ville_avoisinante) {
                        // console.log("Ville : ", article.meta.ville_avoisinante);
                    } else {
                        // console.log(meta);
                    }

                    let lien = article.link;

                    let contenu = article.content.rendered;
                    // Coupé contenu après 10 mots
                    let mots = contenu.split(" ");
                    contenu = mots.slice(0, 10).join(" ") + "...";

                    let carte = document.createElement("div");
                    carte.classList.add("restapi__carte");
                    carte.classList.add("carte");

                    // console.log(article._embedded);
                    // console.log(article._embedded["wp:featuredmedia"][0].media_details.sizes.medium.source_url);

                    let image;
                    if (article._embedded["wp:featuredmedia"]) {
                        image = article._embedded["wp:featuredmedia"][0].media_details.sizes.medium.source_url;
                    }

                    carte.innerHTML = `
                    <img src="${image}" alt="${titre}">
                    <h4>${titre}</h4>
                    <ul class="post-categories"></ul>
                    <p>${contenu}</p>
                    <a href="${lien}">Voir plus</a>
                    `;

                    restapi.appendChild(carte);

                    let cat_actuelle = 0;
                    categories.forEach((cat) => {
                        let liste = document.getElementsByClassName("post-categories");
                        let elm_cat = document.createElement("li");
                        let nom_cat = article._embedded["wp:term"][0][cat_actuelle].name;
                        cat_actuelle++;
                        // console.log(cat);
                        elm_cat.innerHTML = `<a href="https://gftnth00.mywhc.ca/tim41/category/${cat}">${nom_cat}</a>`;
                        liste[liste.length - 1].appendChild(elm_cat);
                    });
                });
            })
            .catch(function (error) {
                // Gérer les erreurs
                console.error("Erreur lors de la récupération des données :", error);
            });
    }
})();
