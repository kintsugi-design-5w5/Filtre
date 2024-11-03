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


function mon_filtre($query) {
    if (!is_admin() && $query->is_main_query()) {
        // Vérifie le type de contenu (seulement pour les projets)
        $categorie_projets = get_category_by_slug('projets'); // Assure-toi que c'est le bon slug
        if ($query->get('post_type') === 'projets') {
            // Filtrer par la catégorie "Projets"
            if ($categorie_projets) {
                $query->set('cat', $categorie_projets->term_id);
                
                // Appliquer le filtre pour 'cours'
                if (!empty($valeur_filtre)) {
                    $query->set('meta_query', array(
                        array(
                            'key' => 'cours',
                            'value' => $valeur_filtre,
                            'compare' => '=' // Ou autre comparateur selon tes besoins
                        )
                    ));
                }
                
                // Autres réglages de la requête
                $query->set('posts_per_page', 10);
                $query->set('orderby', 'date');
                $query->set('order', 'DESC');
            } else {
                // Aucune catégorie trouvée
                $query->set('post__in', array(0));
            }
        }
        
    }
}

add_action('pre_get_posts', 'mon_filtre');

function generer_boutons_filtre_categorie_shortcode() {
    // Récupère l'ID de la catégorie "Filtres"
    $categorie_filtres = get_category_by_slug('filtres'); // Remplace 'filtres' par le slug correct de ta catégorie si nécessaire

    // Initialise la variable de sortie
    $contenu = '
    <div class="composant-filtre">';

    if ($categorie_filtres) {
        // Récupère les catégories enfants de la catégorie "Filtres"
        $args = array(
            'child_of' => $categorie_filtres->term_id,
            'hide_empty' => false, // Modifie à true si tu veux cacher les catégories vides
        );
        $categories_enfants = get_categories($args);

        // Vérifie si des catégories enfants sont disponibles
        if (!empty($categories_enfants)) {
            // Boucle sur chaque catégorie enfant pour générer un bouton
            foreach ($categories_enfants as $categorie) {
                $nom_categorie = esc_html($categorie->name);
                $id_categorie = esc_attr($categorie->term_id);

                // Génère un bouton avec l'attribut data-category
                $contenu .= '<button class="bouton__categorie" id="cat_' . $id_categorie . '">' . $nom_categorie . '</button>';
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