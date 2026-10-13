// Récupère le canvas HTML grâce à son id "c"
const canvas = document.getElementById('c');

// Récupère le contexte 2D.
// C'est cet objet qui permet de dessiner sur le canvas.
const ctx = canvas.getContext('2d');


// Variables qui vont contenir :
// w  = largeur de l'écran
// h  = hauteur de l'écran
// cx = position X du centre
// cy = position Y du centre
let w, h, cx, cy;


// Fonction qui adapte le canvas à la taille de la fenêtre
function resize() {

    // Donne au canvas la largeur de la fenêtre
    w = canvas.width = window.innerWidth;

    // Donne au canvas la hauteur de la fenêtre
    h = canvas.height = window.innerHeight;

    // Calcule le centre horizontal
    cx = w / 2;

    // Calcule le centre vertical
    cy = h / 2;
}


// Si la fenêtre est redimensionnée,
// on recalcule les dimensions du canvas.
window.addEventListener('resize', resize);

// Lance la fonction une première fois
// pour initialiser les dimensions.
resize();


// Tableau qui va contenir toutes les particules
const particles = [];


// Nombre total de particules
const total = 900;


// Crée les 900 particules
for (let i = 0; i < total; i++) {

    // Crée une particule et l'ajoute au tableau
    // "true" signifie qu'on veut une position Z aléatoire
    // au démarrage.
    particles.push(resetParticle(true));
}


// Fonction permettant de créer ou recréer une particule
function resetParticle(initial = false) {

    // Angle aléatoire entre 0 et 360°
    // Math.PI * 2 correspond à 360°.
    const angle = Math.random() * Math.PI * 2;


    // Distance aléatoire par rapport au centre
    // entre 20 et 420 pixels.
    const radius = Math.random() * 400 + 20;


    // Retourne toutes les informations nécessaires
    // pour représenter une particule.
    return {

        // Position horizontale.
        // cos(angle) permet de placer la particule
        // autour du cercle.
        x: Math.cos(angle) * radius,

        // Position verticale.
        // sin(angle) fait la même chose sur l'axe Y.
        y: Math.sin(angle) * radius,


        /*
            z représente la profondeur.

            Plus z est grand :
            → la particule est loin.

            Plus z devient petit :
            → la particule se rapproche de nous.
        */

        // Au démarrage, on place les particules
        // à différentes profondeurs.
        //
        // Quand une particule est recréée,
        // elle recommence tout au fond du tunnel.
        z: initial ? Math.random() * 2000 : 2000,


        // Taille de base aléatoire de la particule
        // entre 0.5 et 2.5.
        size: Math.random() * 2 + 0.5,


        // Couleur de départ aléatoire.
        // hue représente la teinte en degrés
        // sur une roue de couleurs.
        hue: Math.random() * 360
    };
}


// Variable qui sert à faire évoluer
// progressivement les animations.
let time = 0;


// Fonction principale de l'animation
function animate() {

    // Fait avancer le temps très légèrement
    // à chaque image.
    time += 0.01;


    // Couleur utilisée pour recouvrir l'écran.
    //
    // Le "0.15" correspond à la transparence.
    // Comme le fond n'est pas complètement opaque,
    // les anciennes images restent légèrement visibles.
    //
    // Cela crée les traînées derrière les particules.
    ctx.fillStyle = 'rgba(0,0,0,0.15)';


    // Recouvre tout le canvas avec ce noir transparent.
    ctx.fillRect(0, 0, w, h);


    // Parcourt toutes les particules
    particles.forEach((p, i) => {

        // Fait avancer la particule vers nous.
        //
        // Plus z diminue,
        // plus la particule semble proche.
        p.z -= 15;


        // Si la particule est arrivée tout près de nous,
        // on la recrée au fond du tunnel.
        if (p.z <= 1)
            Object.assign(p, resetParticle());


        /*
            Transforme la profondeur en effet de perspective.

            z grand  → scale petit  → particule petite
            z petit  → scale grand  → particule grande

            C'est ce qui donne l'impression de 3D.
        */
        const scale = 800 / p.z;


        // Position X réelle à l'écran.
        //
        // p.x * scale :
        // applique la perspective.
        //
        // + cx :
        // place le tunnel au centre de l'écran.
        //
        // + sin(...) * 10 :
        // ajoute un petit mouvement horizontal.
        const x =
            p.x * scale +
            cx +
            Math.sin(time + i) * 10;


        // Même principe pour la position verticale.
        const y =
            p.y * scale +
            cy +
            Math.cos(time + i) * 10;


        // Taille réelle de la particule.
        //
        // Plus elle se rapproche,
        // plus elle devient grande.
        const r = p.size * scale;


        /*
            Création d'un dégradé circulaire.

            Au centre :
            → couleur très lumineuse.

            Vers l'extérieur :
            → devient transparent.

            Cela donne l'impression que
            chaque particule est lumineuse.
        */
        const gradient = ctx.createRadialGradient(
            x, y, 0,
            x, y, r * 4
        );


        // Centre du dégradé :
        // couleur de la particule, complètement opaque.
        gradient.addColorStop(
            0,
            `hsla(
                ${(p.hue + time * 200) % 360},
                100%,
                70%,
                1
            )`
        );


        // Bord du dégradé :
        // complètement transparent.
        gradient.addColorStop(
            1,
            'transparent'
        );


        // Commence une nouvelle forme
        ctx.beginPath();


        // Utilise notre dégradé comme couleur
        ctx.fillStyle = gradient;


        // Dessine un cercle autour de la particule.
        //
        // r * 4 permet d'avoir un halo
        // beaucoup plus grand que le centre lumineux.
        ctx.arc(
            x,
            y,
            r * 4,
            0,
            Math.PI * 2
        );


        // Remplit le cercle avec le dégradé
        ctx.fill();
    });


    /*
        Cette deuxième boucle crée les anneaux
        qui donnent davantage l'impression
        d'être dans un tunnel.
    */

    // On crée 6 anneaux
    for (let i = 0; i < 6; i++) {


        /*
            depth représente la profondeur
            actuelle de l'anneau.

            Le "% 2000" permet de recommencer
            le mouvement lorsqu'il atteint 2000.
        */
        const depth =
            (time * 400 + i * 250) % 2000;


        /*
            Transforme la profondeur en perspective.

            Comme pour les particules :
            plus l'anneau se rapproche,
            plus il devient grand.
        */
        const scale =
            800 / (2000 - depth + 1);


        // Taille de base de l'anneau
        const radius = 220 * scale;


        // Commence une nouvelle forme
        ctx.beginPath();


        // Épaisseur de la ligne de l'anneau
        ctx.lineWidth = 2 * scale;


        // Couleur de l'anneau.
        //
        // La teinte change progressivement
        // avec le temps.
        ctx.strokeStyle =
            `hsla(
                ${(time * 100 + i * 60) % 360},
                100%,
                60%,
                0.7
            )`;


        // Dessine une ellipse au centre de l'écran.
        //
        // cx, cy = centre de l'écran
        // radius * 1.2 = largeur
        // radius = hauteur
        // time + i = rotation de l'ellipse
        ctx.ellipse(
            cx,
            cy,
            radius * 1.2,
            radius,
            time + i,
            0,
            Math.PI * 2
        );


        // Dessine réellement le contour de l'ellipse
        ctx.stroke();
    }


    /*
        Demande au navigateur de rappeler
        la fonction animate() à la prochaine image.

        Cela crée la boucle d'animation :
        
        animate()
          ↓
        dessiner
          ↓
        requestAnimationFrame()
          ↓
        animate()
          ↓
        ...
    */
    requestAnimationFrame(animate);
}


// Démarre l'animation
animate();