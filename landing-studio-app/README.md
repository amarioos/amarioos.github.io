# Landing Studio

Application multi-utilisateur de création de landing pages produit. Interface hébergée : https://landing-studio.okmar49.chatgpt.site

## Parcours
1. Connexion avec ChatGPT, projets isolés par utilisateur.
2. Photo JPEG/PNG/WebP optimisée côté navigateur, nom, description, langue.
3. Styles Conversion / Éditorial / Premium, couleurs, prix, marque et contact.
4. Génération structurée immédiate et retouche manuelle ; amélioration facultative via une connexion API OpenAI configurée par l’administrateur.
5. Aperçu mobile/desktop ; les essais sont séparés des commandes réelles.
6. Publication publique explicite vers /generated/<UUID>/index.html sur GitHub Pages.
7. Commandes persistantes, statuts, CSV, visites, scroll, funnel, abandons et carte de clics.

## Architecture
- Vinext / React, Cloudflare D1 et R2 via Sites.
- Authentification ChatGPT native. Toutes les lectures et modifications de projets sont contrôlées côté serveur. Le compte propriétaire peut administrer tous les projets ; chaque client ne voit que ses données.
- GitHub Actions contrôle sa propre autorité de publication avec GITHUB_TOKEN, limité à ce dépôt. Aucune copie des identifiants du connecteur ChatGPT.
- Le worker prouve son identité avec un JWT GitHub OIDC signé. Vérifications : issuer, audience, expiration, repository_id, repository, branche et workflow_ref.
- Aucun token GitHub durable dans le navigateur ou le serveur Sites. Aucun code produit n'est exécuté par la CI.
- La file de publication n'est lisible que par le worker authentifié. Les images de brouillon restent privées, les photos approuvées pour publication deviennent publiques.

## Génération et langues
Français, anglais, darija et arabe saoudien. Le moteur immédiat structure les faits saisis et les titres localisés ; l'amélioration IA reformule et traduit les faits. Relire avant publication. Pas de fausses évaluations, de rareté ou de spécifications ajoutées automatiquement.

## Publication
.github/workflows/landing-studio.yml vérifie la file environ toutes les 5 minutes (délais GitHub possibles), traite jusqu'à 10 publications, commit les fichiers statiques et déploie l'artefact GitHub Pages. Les pages gardent une URL stable. Les autres sites statiques du compte sont conservés. Une page n'est marquée publiée qu'après la réussite du déploiement.

Le premier passage crée une page DogWalk de démonstration pour valider le flux. Une commande synthétique est ensuite enregistrée via le même endpoint public puis isolée dans les données de test.

## IA
La génération par modèles est immédiate et ne nécessite aucune API. La reformulation et la traduction avancées utilisent une connexion API OpenAI optionnelle : variables serveur OPENAI_API_KEY (secret) et OPENAI_MODEL. Aucune clé n’est fournie, aucun abonnement ni paiement n’est activé. La connexion doit être configurée via OpenAI Developers. Sans connexion, le bouton IA est désactivé avec un message clair.
La voie préparée utilise l’API Responses et un schéma JSON strict. Aucun appel réel à OpenAI n’a été effectué lors de la livraison faute de connexion API. GitHub Models a été retiré de l’implémentation, ce service étant arrêté depuis le 30 juillet 2026.

## Analytics et pixels
Mesures first-party sans valeurs de champs dans les clics. Sessions par onglet, visiteurs par identifiant navigateur. Abandon après 30 minutes sans activité. Pixels Meta/TikTok/GA4 via identifiants validés, chargés après consentement publicitaire. Envoi Lead/SubmitForm/generate_lead uniquement après succès du stockage. Les aperçus ne chargent pas les pixels.

## Validation
Tests TypeScript, génération HTML / script, SQL, isolation des comptes, OIDC, idempotence des commandes, validation téléphone, consentement de publication, données de test et versions IA. Contrôle visuel navigateur non disponible dans l'environnement de construction.
