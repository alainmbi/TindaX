# TindaX - Link Shortener & QR Code Service 📦🚀

Ce module est un micro-service de l'écosystème **TindaX** dédié au marché de la RDC. Il permet de condenser les liens de la plateforme (boutiques partenaires, profils livreurs, suivis de colis) et de générer instantanément des QR codes dynamiques pour faciliter l'engagement hors-ligne et le partage sur les réseaux sociaux.

## 🎯 Objectifs & Vision (Écosystème TindaX)

Dans le cadre du déploiement de **TindaX**, ce service répond à trois besoins majeurs du marché congolais :
- **Optimisation de l'expérience utilisateur (UI/UX) :** Permettre aux commerçants d'afficher un QR code unique dans leur boutique physique pour renvoyer directement les clients vers leur catalogue TindaX.
- **Accessibilité :** Réduire la taille des liens de suivi de livraison pour un partage ultra-simple via SMS ou WhatsApp, essentiels pour la communication locale.
- **Performance :** Offrir une redirection instantanée et sécurisée grâce à une architecture backend robuste.

## 📋 Fonctionnalités à Implémenter

- [ ] **Dashboard Commerçant / Utilisateur :** Interface premium et minimaliste pour soumettre et gérer les URLs complexes.
- [ ] **Moteur de Shortening unique :** Génération d'identifiants courts, uniques et hautement optimisés.
- [ ] **Générateur de QR Codes Dynamiques :** Export des QR codes au format SVG/PNG pour l'impression (flyers, vitrines).
- [ ] **Analytics basiques (Optionnel) :** Suivi du nombre de scans et de clics sur les liens générés.
- [ ] **Routage de Redirection :** Système de redirection ultra-rapide vers les URLs originales des boutiques ou services TindaX.

## 🛠️ Stack Technique & Installation

Ce service est propulsé par une stack moderne, fluide et scalable :
- **Backend :** Node.js & AdonisJS 6 (Framework MVC robuste)
- **Base de données :** PostgreSQL (Modélisation stricte et intégrité des données)
- **Frontend :** Edge Templates & TailwindCSS (Pour une interface utilisateur premium, responsive et fluide)

### Initialisation du projet

```bash
# Création du projet AdonisJS 6
npm init adonisjs@latest tindax-shortener

cd tindax-shortener

# Installation des dépendances clés
npm install @adonisjs/view
npm install qrcode
npm install -D tailwindcss postcss autumn-ui
