# Générateur de campagnes — version créative

Entrées : photo produit, nom, faits vérifiables, langue, marché, public cible, tranche d’âge adulte, prix et coordonnées. Le public féminin propose le rose ; le public masculin propose le bleu ; la cible mixte propose le corail. Toutes les couleurs restent modifiables, indépendamment du modèle de page.

Dans **Textes & visuels**, le bouton **Générer textes + 3 visuels** sauvegarde chaque résultat : rédaction adaptée au public, photo d’utilisation, photo de détail et seconde scène. Chaque image peut être régénérée ou remplacée par une photo importée. Les illustrations IA sont identifiées sur la page publiée.

Les sections affichées comprennent l’accroche, les bénéfices, la mise en situation, les usages, les détails produit, les instructions si confirmées, le parcours de commande, la FAQ et le formulaire. Le bouton flottant défile vers le formulaire. Les nouveaux blocs sont inclus dans la carte de clics.

## Configuration

Secrets côté serveur : `OPENAI_API_KEY`. Modèles : `OPENAI_MODEL=gpt-5.6-terra`, `OPENAI_IMAGE_MODEL=gpt-image-2.5-sunburst`. La génération nécessite du crédit API et l’accès au modèle. La facturation ChatGPT et la facturation API sont distinctes. Pour des essais de texte simples, `gpt-6-luna` est une option de modèle de départ ; changer de modèle ne résout pas un solde API épuisé. Le modèle de texte doit prendre en charge l’image en entrée, Responses, Structured Outputs et `reasoning.effort=low`.

Le test réel du 17 octobre 2026 a confirmé l’authentification et l’accès aux deux modèles via `/v1/models`. La requête Responses a été refusée avec `credit_balance_exhausted` / `insufficient_quota`. Aucun succès de génération API réelle n’est revendiqué. Ajouter du crédit dans https://platform.openai.com/settings/organization/billing avant les générations automatiques.

Les textes et images de la démo ont été préparés pendant la création : textes rédigés par l’assistant, trois images produites avec l’outil ImageGen intégré. La démo ne comporte ni faux avis ni prix inventé. La première mise à jour de la démo d’origine est appliquée par le worker uniquement si sa révision est encore 1 ; les projets utilisateur sont préservés.

## Contrôles

Consentement requis pour envoyer le produit à OpenAI ; authentification, propriété des images, révision optimiste, verrou pendant une génération, 12 images par compte et 60 au total par jour. Les générations sont synchrones par image et sauvegardées entre les étapes. Fermer la page peut interrompre la requête en cours ; recharger le projet permet de retrouver les résultats déjà sauvegardés.

Les images sont conservées en stockage privé jusqu’à la publication approuvée. Leur provenance IA est déterminée par le serveur. GitHub exporte l’instantané approuvé et toutes ses images dans le dossier de la page, avec staging préalable pour ne pas endommager une publication si une image manque.

Validation : `node tests/studio.test.mjs`, `python -m unittest discover -s tests -p '*_test.py'`, `tsc --noEmit`, build Sites. Les tests vérifient le ciblage, les accès, le stockage, les révisions, les erreurs de quota, les commandes, les statistiques et la publication de plusieurs images. Aucun test visuel dans un navigateur n’a été disponible dans cet environnement.
