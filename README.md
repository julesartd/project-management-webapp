# Projet Gestion de projet WebApp

## Membres du groupe

- Jules
- Kilian
- Zakaria
- Bastien

## A. Contexte

Cette plateforme permet de gérer des projets, créer des tâches, affecter des personnes et suivre l’avancement. Deux rôles sont présents : **developer** (développeur) et **manager** (gestionnaire). Un utilisateur peut cumuler les deux rôles.

---

## B. Fonctionnalités

### Pour le rôle developer

- Voir la liste des projets où au moins une tâche lui est affectée
- Créer des tâches dans les projets visibles (statut initial : "Non validé")
- Voir toutes les tâches d’un projet visible (affectées ou non)
- Commenter chaque tâche visible
- Voir la liste des tâches qui lui sont affectées
- Marquer ses tâches comme complétées

### Pour le rôle manager

- Créer, modifier et supprimer des projets
- Voir la liste de tous les projets
- Se désigner comme gestionnaire d’un projet (plusieurs managers possibles)
- Pour les projets gérés :
  - Créer, modifier, supprimer toutes les tâches
  - Valider les tâches soumises par les développeurs
  - Affecter/désaffecter des personnes à une tâche
  - Afficher une vue synthétique des tâches et de l’avancement global, incluant les projets en retard ou à risque

---

## C. Stockage de l'information

- Stockage semi-persistant : `localStorage` côté client


## D. Bonus

- **Script de génération de donnée** disponible sur le formulaire de connexion (route /login)
- **Filtres sur les projets** (par nom, échéance, etc.)
- **Vue Kanban** dans le détail d’un projet avec drag & drop des tâches
- **Vue de statistiques** sur le détail d’un projet (icône flottante en bas à droite)

---

## E. Installation et lancement

1. **Cloner le dépôt :**
   ```sh
   git clone git@github.com:julesartd/project-management-webapp.git
   cd project-management-webapp
   ```

2. **Installer les dépendances :**
   ```sh
   npm install
   ```

3. **Lancer le serveur de développement :**
   ```sh
   npm run dev
   ```

4. **Accéder à l’application :**
   Ouvrir [http://localhost:5173](http://localhost:5173) dans un navigateur.

---
