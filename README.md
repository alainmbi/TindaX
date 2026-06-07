TindaX - Plateforme de Livraison & Multi-services 📦🚀

TindaX est une solution fullstack premium et moderne de livraison et de multi-services conçue spécifiquement pour le marché de la République Démocratique du Congo (RDC). La plateforme connecte de manière fluide et intuitive les clients, les coursiers et les vendeurs grâce à une architecture robuste et une expérience utilisateur de premier ordre.

🎯 Vision du Projet

Dans un marché en forte croissance comme la RDC, **TindaX** répond aux défis logistiques urbains en centralisant les services de livraison de repas, de colis et de courses du quotidien. L'objectif est d'offrir une plateforme ultra-rapide, fiable, et dotée d'une interface mobile-first hautement soignée.

📋 Fonctionnalités de la Plateforme

👥 Espace Client
- Catalogue & Boutiques : Navigation fluide parmi les restaurants et commerçants partenaires.
- Suivi en temps réel : Suivi précis de l'état des commandes et de la position du coursier.
- Multi-services : Commande de repas, livraison de colis de point à point et achats de produits divers.

🚴 Application Livreur (Coursier)
- Gestion des courses : Réception des demandes de livraison selon la géolocalisation.
- Optimisation des trajets : Système intelligent de navigation et d'itinéraires pour contourner les contraintes du trafic local.
- Suivi des revenus : Portefeuille intégré pour suivre les gains par course.

🏪 Portail Commerçant (Vendeur)
- Gestion de catalogue : Ajout de produits, mise à jour des prix et des stocks en temps réel.
- Gestion des commandes : Réception, préparation et assignation automatique des colis aux coursiers TindaX.


🛠️ Stack Technique

Le cœur de la plateforme repose sur des technologies modernes, scalables et performantes :

- Backend : Node.js & AdonisJS 6 (Framework MVC robuste et typé pour une sécurité maximale)
- Base de données : PostgreSQL (Modélisation stricte des données clients, commandes, et boutiques)
- Architecture : API REST structurée et scalable
- Frontend / UI : Interfaces épurées, responsive (Mobile-first) avec des transitions fluides


🏗️ Structure & Architecture Globale

Le dépôt est organisé selon les standards du framework AdonisJS 6 :

1. Modélisation de la Base de Données (`app/models/`)
* User : Gestion des profils (Clients, Livreurs, Commerçants) et authentification sécurisée.
* Order / Delivery : Suivi du flux complet d'une commande (Créée ➡️ Préparée ➡️ En cours de livraison ➡️ Livrée).
* Store / Product : Structure des boutiques partenaires et de leurs catalogues.

2. Contrôleurs & Logique Métier (`app/controllers/`)
* AuthController : Inscription, connexion et gestion des sessions ou tokens API.
* OrderController : Attribution automatique des livreurs et calcul des frais de livraison.
* VendorController : Gestion des flux commerciaux et des inventaires produits.

3. Système de Routage (`start/routes.ts`)
* Routes segmentées par espaces (API clients, API livreurs, API marchands).


🎨 Expérience Utilisateur (UI/UX)

Fidèle aux exigences visuelles de la marque, **TindaX** adopte une esthétique premium et minimaliste :
* Fluidité : Animations d'interface légères pour une navigation sans friction.
* Mobile-First : Conçu en priorité pour l'usage intensif sur smartphone.
* Robustesse : Gestion propre des états de chargement et des erreurs réseau.


💡 Directives de Développement

* Sécurité : Validation stricte de toutes les requêtes entrantes via les validateurs d'AdonisJS.
* Performance : Optimisation des requêtes SQL (PostgreSQL) pour minimiser l'impact sur la bande passante mobile.
* Clean Code : Respect des conventions de nommage et architecture découplée pour faciliter l'intégration future de nouveaux micro-services.
