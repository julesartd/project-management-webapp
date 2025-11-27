import { useAuthStore } from '@/stores/auth'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'

// --- CONFIGURATION ---
const CONFIG = {
    USER_COUNT: 15,
    PROJECT_COUNT: 50,
    MIN_TASKS: 8,
    MAX_TASKS: 30,
}

// --- UTILITAIRES DE TEMPS ET DE HASARD ---
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]

// Ajoute des heures/jours à une date et renvoie une NOUVELLE date (copie)
const addTime = (date, days = 0, hours = 0) => {
    const result = new Date(date)
    result.setTime(result.getTime() + (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000))
    // Ajout d'un bruit aléatoire de quelques minutes pour éviter que tout tombe à "10:00:00" pile
    result.setMinutes(result.getMinutes() + getRandomInt(0, 59))
    return result
}

// Générateur de textes
const PROJECT_TYPES = ['Redesign', 'Migration', 'Audit', 'Integration', 'Development', 'Maintenance']
const DEPARTMENTS = ['Finance', 'Marketing', 'HR', 'Logistics', 'Sales', 'IT Security', 'Customer Support']
const TECH_STACKS = ['VueJS', 'React', 'NodeJS', 'Python', 'AWS', 'Docker', 'SQL', 'Mongo']
const TASK_VERBS = ['Fixer', 'Implémenter', 'Refactoriser', 'Tester', 'Déployer', 'Documenter', 'Concevoir', 'Optimiser']
const TASK_NOUNS = ['le bug du login', 'la navbar', 'l\'API REST', 'le footer', 'la base de données', 'les tests E2E', 'le CI/CD', 'le profil utilisateur']

export function generateMockData() {
    console.time("Génération des données")

    const authStore = useAuthStore()
    const projectsStore = useProjectsStore()
    const tasksStore = useTasksStore()

    // 1. NETTOYAGE
    localStorage.clear()
    authStore.users = []
    projectsStore.projects = []
    tasksStore.tasks = []

    // 2. CRÉATION DES UTILISATEURS
    console.log("Génération des utilisateurs...")

    // Admin user (date d'inscription ancienne)
    const adminJoinedAt = addTime(new Date(), -365)
    authStore.register({
        name: 'Admin System',
        email: 'admin@local.test',
        password: 'password',
        roles: ['manager', 'developer']
    })

    // Autres utilisateurs
    const generatedUsers = []
    for (let i = 0; i < CONFIG.USER_COUNT; i++) {
        const role = Math.random() > 0.7 ? 'manager' : 'developer'
        const firstName = ['Thomas', 'Sarah', 'Lucas', 'Emma', 'Julien', 'Marie', 'Alex', 'Lea', 'Nicolas', 'Camille'][i % 10]
        const lastName = ['Dubois', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Michel', 'Garcia', 'David'][i % 10]

        try {
            authStore.register({
                name: `${firstName} ${lastName}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@company.com`,
                password: 'password',
                roles: [role]
            })
            // Récupérer l'user avec son ID généré
            const user = authStore.users[authStore.users.length - 1]
            generatedUsers.push(user)
        } catch(e) {}
    }

    const managers = authStore.users.filter(u => u.roles.includes('manager'))
    const developers = authStore.users.filter(u => u.roles.includes('developer'))

    // 3. CRÉATION DES PROJETS ET TÂCHES AVEC CHRONOLOGIE
    console.log("Génération des projets et chronologies...")

    const now = new Date()

    for (let i = 0; i < CONFIG.PROJECT_COUNT; i++) {
        // --- A. CHRONOLOGIE DU PROJET ---
        // On détermine quand le projet a commencé (entre il y a 6 mois et il y a 1 semaine)
        const daysAgo = getRandomInt(7, 180)
        const projectStartDate = addTime(now, -daysAgo)

        // On détermine la durée totale prévue (deadline)
        const projectDuration = getRandomInt(14, 90) // Entre 2 semaines et 3 mois
        const projectDeadline = addTime(projectStartDate, projectDuration)

        // Est-ce un projet terminé, en retard ou en cours ?
        // Cette logique impactera les statuts des tâches
        const progressScenario = Math.random() // 0-0.2: retard, 0.2-0.5: terminé, 0.5-1: en cours

        const projectData = {
            name: `${getRandomItem(PROJECT_TYPES)} ${getRandomItem(DEPARTMENTS)} - ${getRandomItem(TECH_STACKS)}`,
            description: `Projet stratégique lancé le ${projectStartDate.toLocaleDateString()}. Objectif principal : modernisation de l'infrastructure ${getRandomItem(TECH_STACKS)}.`,
            deadline: projectDeadline.toISOString()
        }

        // On force la date de création dans le store (hack car createProject utilise new Date())
        const newProject = projectsStore.createProject(projectData)
        const projectRef = projectsStore.projects.find(p => p.id === newProject.id)
        if (projectRef) projectRef.createdAt = projectStartDate.toISOString()

        // Assignation Managers
        const pManagers = [getRandomItem(managers)]
        if(Math.random() > 0.8) pManagers.push(getRandomItem(managers)) // Parfois 2 managers
        pManagers.forEach(m => projectsStore.addManager(newProject.id, m.id))

        // --- B. GÉNÉRATION DES TÂCHES ---
        const numTasks = getRandomInt(CONFIG.MIN_TASKS, CONFIG.MAX_TASKS)

        for (let t = 0; t < numTasks; t++) {
            // 1. Date de création de la tâche
            // Elle doit être APRES le début du projet, mais AVANT maintenant (ou avant la deadline si projet fini)
            // On étale la création des tâches sur les premières semaines du projet
            const taskCreationOffset = getRandomInt(0, Math.min(daysAgo, projectDuration - 5))
            const taskCreatedAt = addTime(projectStartDate, taskCreationOffset, getRandomInt(9, 17)) // Entre 9h et 17h

            // 2. Détermination du statut et des dates de fin
            let status = 'non_validé'
            let assignedTo = []
            let validatedAt = null
            let validatedBy = null

            // Assignation aléatoire
            const nbDevs = getRandomInt(0, 2)
            for(let d=0; d<nbDevs; d++) assignedTo.push(getRandomItem(developers).id)

            // Logique de statut "Intelligente"
            const isCompleted = Math.random() > 0.4 // 60% de chance d'être finie/validée en général

            if (progressScenario < 0.2) {
                // Projet En retard : Beaucoup de tâches non validées malgré le temps passé
                status = Math.random() > 0.8 ? 'validé' : 'non_validé'
            } else if (progressScenario < 0.5) {
                // Projet Terminé : Presque tout est validé
                status = Math.random() > 0.1 ? 'validé' : 'completed'
            } else {
                // Projet Normal : Mixte
                if (isCompleted) status = Math.random() > 0.3 ? 'validé' : 'completed'
            }

            // Si la tâche est finie/validée, elle doit avoir une date de fin cohérente
            if (status !== 'non_validé') {
                // La tâche a pris entre 1 et 10 jours à faire après sa création
                const workDuration = getRandomInt(1, 10)
                const dateFinished = addTime(taskCreatedAt, workDuration)

                // On vérifie qu'on ne finit pas dans le futur
                if (dateFinished > now && progressScenario > 0.5) {
                    // Si la date théorique de fin est dans le futur pour un projet en cours,
                    // alors la tâche ne peut pas être finie. On rétrograde.
                    status = 'non_validé'
                    validatedAt = null
                } else {
                    validatedAt = dateFinished.toISOString()
                    validatedBy = getRandomItem(managers).id
                }
            }

            // 3. Création effective
            const creator = getRandomItem(managers)
            const newTask = tasksStore.createTask(newProject.id, {
                title: `${getRandomItem(TASK_VERBS)} ${getRandomItem(TASK_NOUNS)}`,
                description: `Tâche critique assignée le ${taskCreatedAt.toLocaleDateString()}.`,
                deadline: addTime(taskCreatedAt, 15).toISOString(), // Deadline tâche = création + 15j
                assignedTo: assignedTo,
                status: 'non_validé' // On set le statut final après pour contourner le store
            }, creator.id)

            // 4. Injection des dates (Hack direct dans l'objet car les méthodes du store reset souvent les dates)
            const taskRef = tasksStore.tasks.find(tk => tk.id === newTask.id)
            if (taskRef) {
                taskRef.createdAt = taskCreatedAt.toISOString()
                taskRef.status = status
                taskRef.validatedBy = validatedBy
                taskRef.validatedAt = validatedAt
                taskRef.updatedAt = validatedAt || taskCreatedAt.toISOString()
            }

            // 5. Ajout de commentaires COHÉRENTS (Entre création et validation/Now)
            if (Math.random() > 0.7) {
                const commentDate = addTime(taskCreatedAt, getRandomInt(1, 3)) // Commentaire 1-3 jours après création
                // On s'assure que le commentaire est avant la validation si elle existe
                const limitDate = validatedAt ? new Date(validatedAt) : now

                if (commentDate < limitDate) {
                    // On push manuellement pour contrôler la date createdAt du commentaire
                    if(!taskRef.comments) taskRef.comments = []
                    taskRef.comments.push({
                        id: crypto.randomUUID(),
                        text: "Avancement conforme, en attente de validation PR.",
                        authorId: getRandomItem(developers).id,
                        createdAt: commentDate.toISOString()
                    })
                }
            }
        }
    }

    // Sauvegarde finale explicite pour persister nos modifications manuelles
    localStorage.setItem('projects', JSON.stringify(projectsStore.projects))
    localStorage.setItem('tasks', JSON.stringify(tasksStore.tasks))
    localStorage.setItem('users', JSON.stringify(authStore.users))

    console.timeEnd("Génération des données")
    alert("Données générées avec succès ! Chronologie réaliste appliquée.")
    window.location.reload()
}