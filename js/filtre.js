(function () {
  let bouton__categorie = document.querySelectorAll(".bouton__categorie");
  let url;
  let nb_requete = 0;

  // Fonction pour gérer l'affichage des projets en fonction de la catégorie
  function chargerProjets(categorie) {
    nb_requete++;
    // url = `http://localhost/5w5/wp-json/wp/v2/posts?categories=${categorie}&cat_relation=AND&_fields=link,title,content,terms,featured_media,_links,_embedded&_embed&per_page=30`;
    url = `https://gftnth00.mywhc.ca/tim43/wp-json/wp/v2/posts?categories=${categorie}&cat_relation=AND&_fields=link,title,content,terms,featured_media,_links,_embedded&_embed&per_page=30`;
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
      let image = article._embedded["wp:featuredmedia"]
        ? article._embedded["wp:featuredmedia"][0].source_url
        : "";
      carte.innerHTML = `
                <a data-icone="filter_list" href="${lien}" style="background-image: url('${image}');" class="thumbnail-projet">
                    <h2>${titre}</h2>
                </a>
            `;
    } else if (typePage === "cours") {
      const sessionId = titre.charAt(4); // Le 4e caractère (indice 3)
      carte.innerHTML = `
                <li">
                    <h3 class="cercle petit cours-btn" id="titre-cours-${article.id}">${titreModifie}</h3>
                    <div class="description-cours" style="display: none;" id="description-cours-${article.id}">
                        <p>${contenu}</p>
                    </div>
                </li>
            `;
      carte.dataset.sessionId = `session-${sessionId}`;
    }

    return carte;
  }

  // Ajouter la classe "actif" au bouton "TOUS" par défaut
  const boutonTous = document.getElementById("cat_tous");
  if (boutonTous) {
    boutonTous.classList.add("bouton__categorie__actif");
    if (typePage === "projets") {
      chargerProjets("3"); // Charger tous les projets par défaut
    } else if (typePage === "cours") {
      chargerProjets("2"); // Charger tous les projets par défaut
    }
  }

  // Gérer le clic sur les boutons de catégorie
  for (const elm of bouton__categorie) {
    elm.addEventListener("mousedown", function (e) {
      bouton__categorie.forEach((b) =>
        b.classList.remove("bouton__categorie__actif")
      );
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
    });
  }

  // Fonction pour effectuer la requête HTTP en utilisant fetch()
  function fetchUrl(url) {
    fetch(url)
      .then(function (response) {
        if (!response.ok) {
          throw new Error(
            "La requête a échoué avec le statut " + response.status
          );
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
          data.forEach(function (article) {
            let carte = afficherContenuSpecifique(article);
            const sessionId = carte.dataset.sessionId;
            const sessionElement = document.getElementById(sessionId);
            if (nb_requete > 1) {
              sessionElement.style.display = "block";
            }

            if (sessionElement) {
              sessionElement.appendChild(carte);
            } else {
              console.warn(`Session with id "${sessionId}" not found.`);
            }
          });
        }
        ajusterHauteurTimeline();
        mettreAJourBarreProgression();
      })
      .catch(function (error) {
        console.error("Erreur lors de la récupération des données :", error);
      });
  }

  function toggleCategories() {
    const categoriesContainer = document.getElementById("categories-container");
    categoriesContainer.classList.toggle("show");
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
        const elementsToMoveBack = Array.from(colonne1.children).filter(
          (_, index) => index % 2 !== 0
        );

        elementsToMoveBack.forEach((child) => {
          colonne2.appendChild(child);
        });

        // Affiche colonne-2
        colonne2.style.display = "block";

        // Marque qu'on est maintenant en mode desktop
        isMobileView = false;
      }
    }
    ajusterHauteurTimeline();
    mettreAJourBarreProgression();
  }

  // Exécute handleResize et reorganizeColumns au chargement de la page
  window.addEventListener("load", () => {
    handleResize();
    reorganizeColumns();
  });

  // Exécute handleResize et reorganizeColumns chaque fois que la fenêtre est redimensionnée
  window.addEventListener("resize", () => {
    handleResize();
    reorganizeColumns();
  });

  // Ajoute un écouteur de clic sur le bouton de filtre pour appeler toggleCategories
  document
    .querySelector(".filtre-header")
    .addEventListener("click", toggleCategories);
})();
