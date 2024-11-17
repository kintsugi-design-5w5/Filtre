<?php
/*
Plugin Name: Filtre
Plugin URI: https://github.com/eddytuto
Version: 1.0.0
Description: Permet d'afficher les projets qui répondent à certains critères.
*/

// Fonction pour inclure les fichiers CSS et JS du plugin
function ec_filtre_enqueue()
{
    // filemtime : Retourne en millisecondes la date de la dernière modification d'un fichier
    // plugin_dir_path : Retourne le chemin du répertoire du plugin
    // __FILE__ : Fichier en cours d'exécution
    // wp_enqueue_style : Permet d'intégrer le CSS dans la page
    // wp_enqueue_script : Permet d'intégrer le JS dans la page
    // wp_enqueue_scripts : Hook pour enqueuer les styles et scripts

    // Récupère la version du CSS et du JS en utilisant leur dernière date de modification
    $version_css = filemtime(plugin_dir_path( __FILE__ ) . "style.css");
    $version_js = filemtime(plugin_dir_path(__FILE__) . "js/filtre.js");

    // Enqueuer le fichier CSS avec son numéro de version
    wp_enqueue_style(   
        'em_plugin_filtre_css',  // Identifiant unique pour le style
        plugin_dir_url(__FILE__) . "style.css",  // URL du fichier CSS
        array(),  // Dépendances, ici aucun
        $version_css  // Version basée sur la date de dernière modification
    );

    // Enqueuer le fichier JS avec son numéro de version
    wp_enqueue_script(  
        'em_plugin_filtre_js',  // Identifiant unique pour le script
        plugin_dir_url(__FILE__) ."js/filtre.js",  // URL du fichier JS
        array(),  // Dépendances, ici aucune
        $version_js,  // Version basée sur la date de dernière modification
        true  // Charger le script dans le pied de page (avant la balise </body>)
    );
}
add_action('wp_enqueue_scripts', 'ec_filtre_enqueue');  // Ajoute la fonction au hook 'wp_enqueue_scripts'

// Filtre la requête REST pour ajouter des catégories en fonction de la relation 'AND'
add_filter(
    "rest_post_query",
    function ($args, $request) {
        // Si la relation des catégories est "AND", ajoute un filtre sur les catégories
        if ($request["cat_relation"] == "AND") {
            $args["category__and"] = $request["categories"];
        }
        return $args;
    },
    10,
    2
);

// Filtre les requêtes principales pour afficher uniquement les articles de la catégorie "Projets"
function mon_filtre($query) {
    if (!is_admin() && $query->is_main_query()) {
        // Récupère la catégorie "Projets" via son slug
        $categorie_projets = get_category_by_slug('projets');

        if ($categorie_projets) {
            // Applique le filtre pour afficher uniquement les articles de la catégorie "Projets"
            $query->set('cat', $categorie_projets->term_id);

            // Limite le nombre d'articles par page à 50 et les ordonne par date décroissante
            $query->set('posts_per_page', 50);
            $query->set('orderby', 'date');
            $query->set('order', 'DESC');
        } else {
            // Si la catégorie "Projets" n'existe pas, retourne une requête vide
            $query->set('post__in', array(0));
        }
    }
}
add_action('pre_get_posts', 'mon_filtre');  // Applique le filtre avant l'exécution de la requête

// Fonction pour générer le shortcode des boutons de filtre
function generer_boutons_filtre_categorie_shortcode() {
    // Récupère la catégorie "Filtres" via son slug
    $categorie_filtres = get_category_by_slug('filtres');

    // Initialise le contenu HTML du shortcode
    $contenu = '
    <div class="composant-filtre">
        <button class="filtre-header" onclick="toggleCategories()">
            <h3>Filtre</h3>
            <i class="icone-filtre"><span class="material-symbols-outlined">filter_list</span></i>
        </button>
        <div class="categories" id="categories-container">
            <button data-icone="filter_list" class="bouton__categorie" id="cat_tous">TOUS</button>';

    // Si la catégorie "Filtres" existe, récupère ses sous-catégories
    if ($categorie_filtres) {
        $args = array(
            'child_of' => $categorie_filtres->term_id,  // Récupère les sous-catégories de "Filtres"
            'hide_empty' => false,  // Inclut les catégories vides
        );
        $categories_enfants = get_categories($args);

        if (!empty($categories_enfants)) {
            // Pour chaque sous-catégorie, crée un bouton de filtre
            foreach ($categories_enfants as $categorie) {
                $nom_categorie = esc_html($categorie->name);  // Échappe le nom de la catégorie
                $id_categorie = esc_attr($categorie->term_id);  // Échappe l'ID de la catégorie
                $contenu .= '<button data-icone="filter_list" class="bouton__categorie" id="cat_' . $id_categorie . '">' . $nom_categorie . '</button>';
            }
        } else {
            // Si aucune sous-catégorie n'existe, affiche un message d'absence de catégorie
            $contenu .= '<p>Aucune catégorie disponible.</p>';
        }
    } else {
        // Si la catégorie "Filtres" n'existe pas, affiche un message d'erreur
        $contenu .= '<p>La catégorie "Filtres" n\'existe pas.</p>';
    }

    // Ajoute la fin du contenu HTML du shortcode
    $contenu .= '</div> 
    </div>
    <section class="feed projets-apercus">
        <div class="contenu__restapi colonne-proj colonne-1"></div>
        <div class="contenu__restapi colonne-proj colonne-2"></div>
    </section>
    ';
    
    return $contenu;  // Retourne le contenu généré par le shortcode
}

// Enregistre le shortcode 'boutons_filtre_categorie' pour afficher les boutons
add_shortcode('boutons_filtre_categorie', 'generer_boutons_filtre_categorie_shortcode');
?>
