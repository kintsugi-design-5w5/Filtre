<?php
/*
Plugin Name: Filtre
Plugin URI: https://github.com/eddytuto
Version: 1.0.0
Description: Permet d'afficher les projets qui répondent à certains critères.
*/

function ec_filtre_enqueue()
{
// filemtime // retourne en milliseconde le temps de la dernière modification
// plugin_dir_path // retourne le chemin du répertoire du plugin
// __FILE__ // le fichier en train de s'exécuter
// wp_enqueue_style() // Intègre le link:css dans la page
// wp_enqueue_script() // intègre le script dans la page
// wp_enqueue_scripts // le hook
 
$version_css = filemtime(plugin_dir_path( __FILE__ ) . "style.css");
$version_js = filemtime(plugin_dir_path(__FILE__) . "js/filtre.js");
wp_enqueue_style(   'em_plugin_filtre_css',
                     plugin_dir_url(__FILE__) . "style.css",
                     array(),
                     $version_css);
 
wp_enqueue_script(  'em_plugin_filtre_js',
                    plugin_dir_url(__FILE__) ."js/filtre.js",
                    array(),
                    $version_js,
                    true);
}
add_action('wp_enqueue_scripts', 'ec_filtre_enqueue');

add_filter(
    "rest_post_query",
    function ($args, $request) {
        if ($request["cat_relation"] == "AND") {
            $args["category__and"] = $request["categories"];
        }
        return $args;
    },
    10,
    2
);
function mon_filtre($query) {
    if (!is_admin() && $query->is_main_query()) {
        // Récupère la catégorie "Projets" avec le slug
        $categorie_projets = get_category_by_slug('projets');

        if ($categorie_projets) {
            // Filtre uniquement les articles de la catégorie "Projets"
            $query->set('cat', $categorie_projets->term_id);

            // Limite les articles par page, les ordonne par date
            $query->set('posts_per_page', 30);
            $query->set('orderby', 'date');
            $query->set('order', 'DESC');
        } else {
            // Si la catégorie "Projets" n'existe pas, retourne une requête vide
            $query->set('post__in', array(0));
        }
    }
}
add_action('pre_get_posts', 'mon_filtre');




function generer_boutons_filtre_categorie_shortcode() {
    $categorie_filtres = get_category_by_slug('filtres');

    // Initialise la variable de sortie
    $contenu = '
    <div class="composant-filtre">
        <button class="filtre-header" onclick="toggleCategories()">
            <h3>Filtre</h3>
            <i class="icone-filtre"><span class="material-symbols-outlined">filter_list</span></i>
        </button>
        <div class="categories" id="categories-container">
            <button data-icone="filter_list" class="bouton__categorie" id="cat_tous">TOUS</button>';

    if ($categorie_filtres) {
        $args = array(
            'child_of' => $categorie_filtres->term_id,
            'hide_empty' => false,
        );
        $categories_enfants = get_categories($args);

        if (!empty($categories_enfants)) {
            foreach ($categories_enfants as $categorie) {
                $nom_categorie = esc_html($categorie->name);
                $id_categorie = esc_attr($categorie->term_id);
                $contenu .= '<button data-icone="filter_list" class="bouton__categorie" id="cat_' . $id_categorie . '">' . $nom_categorie . '</button>';
            }
        } else {
            $contenu .= '<p>Aucune catégorie disponible.</p>';
        }
    } else {
        $contenu .= '<p>La catégorie "Filtres" n\'existe pas.</p>';
    }

    $contenu .= '</div> 
    </div>
    <section class="feed projets-apercus">
        <div class="contenu__restapi colonne-proj colonne-1"></div>
        <div class="contenu__restapi colonne-proj colonne-2"></div>
    </section>
    ';
    return $contenu;
}


// Enregistre le shortcode pour afficher les boutons
add_shortcode('boutons_filtre_categorie', 'generer_boutons_filtre_categorie_shortcode');