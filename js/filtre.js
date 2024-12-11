(function () {
    let composant = document.querySelector(".composant-filtre");
    if (composant) {
        let bouton__categorie = document.querySelectorAll(".bouton__categorie");
        let url;
        let premiereRequeteTous = true;
        let selection = document.querySelector(".selection");
        let elementSelectionne;

        // Fonction pour gérer l'affichage des projets en fonction de la catégorie
        function chargerProjets(categorie) {
            // url = `http://localhost/5w5/wp-json/wp/v2/posts?categories=${categorie}&cat_relation=AND&_fields=link,title,content,terms,featured_media,_links,_embedded&_embed&per_page=30`;
            url = `https://gftnth00.mywhc.ca/tim43/wp-json/wp/v2/posts?categories=${categorie}&cat_relation=AND&_fields=id,link,title,content,terms,featured_media,_links,_embedded&_embed&per_page=100`;
            console.log(url);
            fetchUrl(url);
        }

        // Détecte le mot-clé dans l'URL
        const chemin = window.location.pathname;
        let typePage = null;
        if (chemin.includes("projets")) {
            typePage = "projets";
        } else if (chemin.includes("cours")) {
            typePage = "cours";
            let sectionProjets = document.querySelector(".projets-apercus");
            sectionProjets.style.display = "none";
        }

        // Fonction pour afficher le contenu en fonction de typePage
        function afficherContenuSpecifique(article) {
            let titre = article.title.rendered;
            let lien = article.link;
            let contenu = article.content.rendered;
            let titreModifie = titre.substring(7, titre.length - 6);

            let carte = document.createElement("div");

            // Différencier le HTML pour "projets" et "cours"
            if (typePage === "projets") {
                let image = article._embedded["wp:featuredmedia"] ? article._embedded["wp:featuredmedia"][0].source_url : "";

                // Récupérer les catégories
                let categories = article._embedded["wp:term"] ? article._embedded["wp:term"][0] : [];
                // Exclure "projet" et "populaire"
                let categoriesFiltrees = categories.filter((cat) => cat.name.toLowerCase() !== "projets" && cat.name.toLowerCase() !== "populaire");

                // Récupérer le premier nom de catégorie filtré (ou une valeur par défaut si aucune catégorie ne reste)
                let nomCategorie = categoriesFiltrees.length > 0 ? categoriesFiltrees[0].name : "Non classé";

                // Vérifier si une catégorie correspondante existe
                // let nomCategorie = categorieFiltre ? categorieFiltre.name : "Non classé";

                carte.innerHTML = `
                    <a data-icone="visibility" href="${lien}" class="thumbnail-projet">
                    <div style="background-image: url('${image}');"> </div>
                    <h2 class="titre-projet">${titre}</h2>
                    <h4 class="cours-projet">${nomCategorie}</h4>
                    </a>
            `;
            } else if (typePage === "cours") {
                const sessionId = titre.charAt(4); // Le 4e caractère (indice 3)
                carte.innerHTML = `
                <li>
                    <h3 data-icone="keyboard_arrow_down" class="cercle petit cours-btn" data-cours-id="${article.id}">${titreModifie}</h3>
                    <div class="description-cours" id="description-cours-${article.id}">
                        ${contenu}
                    </div>
                </li>
            `;
                carte.dataset.sessionId = `session-${sessionId}`;
            }

            return carte;
        }

        // Vérifie si le localStorage contient une catégorie pour "cours"
        if (localStorage.getItem("cours") !== null) {
            premiereRequeteTous = false;
            // Récupère les données de la catégorie depuis le localStorage
            let cours = JSON.parse(localStorage.getItem("cours"));

            // Désactive le bouton "TOUS" car une catégorie est présente
            const boutonTous = document.getElementById("cat_tous");
            if (boutonTous) {
                boutonTous.classList.remove("bouton__categorie__actif");
            }

            // Active le bouton correspondant à la catégorie récupérée
            const boutonCategorie = document.getElementById(`cat_${cours}`);
            console.log(boutonCategorie);
            if (boutonCategorie) {
                boutonCategorie.classList.add("bouton__categorie__actif");
                elementSelectionne = boutonCategorie;
                AnimerSelection();
                // selection.style.transform = `translateX(${boutonCategorie.offsetLeft - selection.offsetLeft}px)`;
                // selection.style.width = `${boutonCategorie.offsetWidth}px`;
                // selection.style.height = `${boutonCategorie.offsetHeight}px`;
            }

            // Charge les projets ou cours en fonction de la catégorie et du type de page
            if (typePage === "projets") {
                chargerProjets(cours + ",3");
            } else if (typePage === "cours") {
                chargerProjets(cours + ",2");
            }

            // Vide le localStorage pour "cours" après utilisation
            localStorage.removeItem("cours");
        } else {
            // Si aucune catégorie n'est stockée, active par défaut le bouton "TOUS"
            const boutonTous = document.getElementById("cat_tous");
            if (boutonTous) {
                boutonTous.classList.add("bouton__categorie__actif");

                // Charge tous les projets ou cours par défaut
                if (typePage === "projets") {
                    chargerProjets("3"); // Charger tous les projets par défaut
                } else if (typePage === "cours") {
                    chargerProjets("2"); // Charger tous les cours par défaut
                }
                elementSelectionne = boutonTous;
                AnimerSelection();
                // selection.style.transform = `translateX(${boutonTous.offsetLeft - selection.offsetLeft}px)`;
                // selection.style.width = `${boutonTous.offsetWidth}px`;
                // selection.style.height = `${boutonTous.offsetHeight}px`;
            }
        }

        // Gérer le clic sur les boutons de catégorie
        for (const elm of bouton__categorie) {
            elm.addEventListener("mousedown", function (e) {
                bouton__categorie.forEach((b) => b.classList.remove("bouton__categorie__actif"));
                elm.classList.add("bouton__categorie__actif");

                let categorie;
                if (typePage === "projets") {
                    categorie = "projets";
                    categorie = e.target.id.replace("cat_", "") + ",3";
                    if (elm.id === "cat_tous") {
                        categorie = "3";
                    }
                } else if (typePage === "cours") {
                    fermerToutesLesSessions();
                    let sessions = document.querySelectorAll(".cours");
                    sessions.forEach((session) => {
                        session.innerHTML = "";
                    });
                    categorie = e.target.id.replace("cat_", "") + ",2";
                    if (elm.id === "cat_tous") {
                        categorie = "2";
                    }
                }
                chargerProjets(categorie);

                //Animer le bouton
                elementSelectionne = elm;
                AnimerSelection();
                // selection.style.transform = `translateX(${elm.offsetLeft - selection.offsetLeft}px)`;
                // selection.style.width = `${elm.offsetWidth}px`;
                // selection.style.height = `${elm.offsetHeight}px`;
            });
        }

        // Fonction pour effectuer la requête HTTP en utilisant fetch()
        function fetchUrl(url) {
            fetch(url)
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error("La requête a échoué avec le statut " + response.status);
                    }
                    return response.json();
                })
                .then(function (data) {
                    console.log(data);

                    data.sort(function (a, b) {
                        return a.title.rendered.localeCompare(b.title.rendered);
                    });

                    let colonne1 = document.querySelector(".colonne-1");
                    let colonne2 = document.querySelector(".colonne-2");
                    colonne1.innerHTML = "";
                    colonne2.innerHTML = "";

                    localStorage.setItem("rest", true);

                    if (typePage === "projets") {
                        data.forEach(function (article, index) {
                            let carte = afficherContenuSpecifique(article);
                            if (index % 2 === 0) {
                                colonne1.appendChild(carte);
                            } else {
                                colonne2.appendChild(carte);
                            }
                        });
                    } else if (typePage === "cours") {
                        localStorage.setItem("rest-cours", true);
                        console.log(localStorage.getItem("rest-cours"));

                        if (premiereRequeteTous) {
                            // Lors de la première requête, cache tous les articles
                            data.forEach(function (article) {
                                let carte = afficherContenuSpecifique(article);
                                const sessionId = carte.dataset.sessionId;
                                const sessionElement = document.getElementById(sessionId);

                                if (sessionElement) {
                                    sessionElement.style.display = "none"; // Cache les articles
                                    sessionElement.appendChild(carte);
                                } else {
                                    console.warn(`Session with id "${sessionId}" not found.`);
                                }
                            });

                            // Marque que la première requête est terminée
                            premiereRequeteTous = false;
                        } else {
                            // Pour les requêtes suivantes, affiche les articles
                            data.forEach(function (article) {
                                let carte = afficherContenuSpecifique(article);
                                const sessionId = carte.dataset.sessionId;
                                const sessionElement = document.getElementById(sessionId);

                                if (sessionElement) {
                                    sessionElement.style.display = "block"; // Affiche les articles
                                    sessionElement.appendChild(carte);
                                } else {
                                    console.warn(`Session with id "${sessionId}" not found.`);
                                }
                            });
                        }
                    }
                })
                .catch(function (error) {
                    console.error("Erreur lors de la récupération des données :", error);
                });
        }
        function handleResize() {
            const categoriesContainer = document.getElementById("categories-container");

            // Si l'écran est de 768px ou moins, on cache les catégories
            if (window.innerWidth <= 768) {
                categoriesContainer.classList.remove("show");
            } else {
                // Au-dessus de 768px, on les affiche automatiquement
                categoriesContainer.classList.add("show");
            }
        }

        // Exécute handleResize et reorganizeColumns au chargement de la page
        window.addEventListener("load", () => {
            handleResize();
        });

        // Exécute handleResize et reorganizeColumns chaque fois que la fenêtre est redimensionnée
        window.addEventListener("resize", () => {
            handleResize();
            AnimerSelection();
        });

        // Ajoute un écouteur de clic sur le bouton de filtre pour appeler toggleCategories
        document.querySelector(".filtre-header").addEventListener("click", toggleCategories);

        // Ajoute un écouteur de clic sur le bouton de filtre pour appeler toggleCategories
        document.querySelector(".filtre-header").addEventListener("click", toggleCategories);

        function AnimerSelection() {
            if (window.innerWidth >= 768) {
                selection.style.transform = `translateX(${elementSelectionne.offsetLeft - selection.offsetLeft}px)`;
                selection.style.width = `${elementSelectionne.offsetWidth}px`;
                selection.style.height = `${elementSelectionne.offsetHeight}px`;
            }
        }
    }
    let composantColonne = document.querySelector(".colonne-proj");
    if (composantColonne) {
        console.log("colonne");
        function toggleCategories() {
            const categoriesContainer = document.getElementById("categories-container");
            categoriesContainer.classList.toggle("show");
        }

        let isMobileView = false; // Variable pour suivre l'état de l'affichage mobile

        function reorganizeColumns() {
            const colonne1 = document.querySelector(".colonne-1");
            const colonne2 = document.querySelector(".colonne-2");

            if (window.innerWidth <= 768) {
                if (!isMobileView) {
                    // Déplace les éléments de colonne-2 vers colonne-1 avec ordre alterné
                    Array.from(colonne2.children).forEach((child, index) => {
                        const position = index * 2 + 1; // Place à la 2e, 4e, 6e position, etc.
                        colonne1.insertBefore(child, colonne1.children[position] || null);
                    });
                    // Cache colonne-2
                    colonne2.style.display = "none";

                    // Marque qu'on est maintenant en mode mobile
                    isMobileView = true;
                }
            } else {
                if (isMobileView) {
                    // Réinitialise les éléments dans colonne-2 pour les écrans plus larges
                    const elementsToMoveBack = Array.from(colonne1.children).filter((_, index) => index % 2 !== 0);

                    elementsToMoveBack.forEach((child) => {
                        colonne2.appendChild(child);
                    });

                    // Affiche colonne-2
                    colonne2.style.display = "block";

                    // Marque qu'on est maintenant en mode desktop
                    isMobileView = false;
                }
            }
        }

        // Exécute handleResize et reorganizeColumns au chargement de la page
        window.addEventListener("load", () => {
            reorganizeColumns();
        });

        // Exécute handleResize et reorganizeColumns chaque fois que la fenêtre est redimensionnée
        window.addEventListener("resize", () => {
            reorganizeColumns();
        });
    }
})();
