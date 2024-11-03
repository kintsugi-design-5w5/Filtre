<?php
/**
* Package voyage
* Version 1.0.0
*/
/*
Plugin name: Voyage
Plugin uri: https://github.com/eddytuto
Version: 1.0.0
Description: Permet d'afficher les destinations qui répondent à certains critères
*/
function ec_voyage_enqueue()
{
// filemtime // retourne en milliseconde le temps de la dernière modification
// plugin_dir_path // retourne le chemin du répertoire du plugin
// __FILE__ // le fichier en train de s'exécuter
// wp_enqueue_style() // Intègre le link:css dans la page
// wp_enqueue_script() // intègre le script dans la page
// wp_enqueue_scripts // le hook
 
$version_css = filemtime(plugin_dir_path( __FILE__ ) . "style.css");
$version_js = filemtime(plugin_dir_path(__FILE__) . "js/voyage.js");
wp_enqueue_style(   'em_plugin_voyage_css',
                     plugin_dir_url(__FILE__) . "style.css",
                     array(),
                     $version_css);
 
wp_enqueue_script(  'em_plugin_voyage_js',
                    plugin_dir_url(__FILE__) ."js/voyage.js",
                    array(),
                    $version_js,
                    true);
}
add_action('wp_enqueue_scripts', 'ec_voyage_enqueue');

/* Création de la liste des destinations en HTML */
function creation_destinations(){
    //générer par php un bouton pour chaque catégorie (un bouton seulement pour les catégories qui ne sont pas parentes) avec cat_ + le num de la catégorie et le nom de la catégotie dans $contenu puis retourne $contenu

    $categories = get_categories();
    // enlever les catégories parentes
    foreach ($categories as $key => $categorie) {
        if ($categorie->parent == 0) {
            unset($categories[$key]);
        }
        if ($categorie->name == 'Non catégorisé') {
            unset($categories[$key]);
        }
    }
    //On met dans contenu le div type qui contient les catégories qui ne commencent pas par voyage
    $contenu = ' <div class="contenu__categories categories__type">
    <h6>Taille de voyages</h6>';
    foreach ($categories as $categorie) {
        $nom_categorie = $categorie->name;
        $id_categorie = $categorie->term_id;
        if (substr($nom_categorie, 0, 6) != 'Voyage') {
            $contenu .= '<button class="bouton__categorie" id="cat_' . $id_categorie . '">' . $nom_categorie . '</button>';
        }
        //$contenu .= '<button class="bouton__categorie" id="cat_' . $id_categorie . '">' . $nom_categorie . '</button>';
    }

    //On ajoute dans contenu le div taille qui contient les catégories qui ne commencent pas par voyage
    $contenu .= '</div>  <div class="contenu__categories categories__taille">
    <h6>Taille de voyages</h6>';
    foreach ($categories as $categorie) {
        $nom_categorie = $categorie->name;
        $id_categorie = $categorie->term_id;
        if (substr($nom_categorie, 0, 6) == 'Voyage') {
            $contenu .= '<button class="bouton__categorie" id="cat_' . $id_categorie . '">' . $nom_categorie . '</button>';
        }
    }
    //On ajoute dans contenu le div restapi
    $contenu .= '</div> 
    <div class="contenu__restapi section__destinations"></div>';
    return $contenu;


}
 
add_shortcode('em_destination', 'creation_destinations');