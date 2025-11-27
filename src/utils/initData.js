import { useAuthStore } from '@/stores/auth'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'

// --- CONFIGURATION ---
const CONFIG = {
    GENERATED_USER_COUNT: 12, // Nombre d'utilisateurs aléatoires en PLUS des fixes
    PROJECT_COUNT: 40,
    MIN_TASKS: 5,
    MAX_TASKS: 25,
}

// --- UTILITAIRES ---
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]

const addTime = (date, days = 0, hours = 0) => {
    const result = new Date(date)
    result.setTime(result.getTime() + (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000))
    result.setMinutes(result.getMinutes() + getRandomInt(0, 59))
    return result
}

// Données de génération de texte
const PROJECT_TYPES = ['Redesign', 'Migration', 'Audit', 'Integration', 'Development', 'Maintenance']
const DEPARTMENTS = ['Finance', 'Marketing', 'HR', 'Logistics', 'Sales', 'IT Security', 'Customer Support']
const TECH_STACKS = ['VueJS', 'React', 'NodeJS', 'Python', 'AWS', 'Docker', 'SQL', 'Mongo', 'TypeScript']
const TASK_VERBS = ['Fixer', 'Implémenter', 'Refactoriser', 'Tester', 'Déployer', 'Documenter', 'Concevoir', 'Optimiser', 'Analyser']
const TASK_NOUNS = ['le bug du login', 'la navbar', 'l\'API REST', 'le footer', 'la base de données', 'les tests E2E', 'le CI/CD', 'le profil utilisateur', 'le dashboard']

export function generateData() {
    console.time("Génération complète des données")
    console.log("🌱 Démarrage de l'initialisation hybride...")

    const authStore = useAuthStore()
    const projectsStore = useProjectsStore()
    const tasksStore = useTasksStore()

    // 1. NETTOYAGE COMPLET
    localStorage.clear()
    authStore.users = []
    projectsStore.projects = []
    tasksStore.tasks = []

    // 2. CRÉATION DES UTILISATEURS FIXES (VIP)
    // Ce sont ceux que vous utiliserez pour vous connecter
    console.log("Creation des comptes fixes...")

    const fixedUsers = [
        {
            name: 'Manager Test',
            email: 'manager@test.com',
            password: 'Password123*', // Mot de passe connu
            roles: ['manager'],
            avatar: 'https://ui-avatars.com/api/?name=Manager+Test&background=667eea&color=fff'
        },
        {
            name: 'Sophie Martin',
            email: 'manager2@test.com',
            password: 'Password123*',
            roles: ['manager'],
            avatar: 'https://ui-avatars.com/api/?name=Sophie+Martin&background=764ba2&color=fff'
        },
        {
            name: 'Thomas Dubois',
            email: 'dev@test.com',
            password: 'Password123*',
            roles: ['developer'],
            avatar: 'https://ui-avatars.com/api/?name=Thomas+Dubois&background=f093fb&color=fff'
        },
        {
            name: 'Julie Bernard',
            email: 'dev2@test.com',
            password: 'Password123*',
            roles: ['developer'],
            avatar: 'https://ui-avatars.com/api/?name=Julie+Bernard&background=4facfe&color=fff'
        },
        {
            name: 'Alexandre Leroy',
            email: 'hybrid@test.com',
            password: 'Password123*',
            roles: ['manager', 'developer'],
            avatar: 'https://ui-avatars.com/api/?name=Alexandre+Leroy&background=fa709a&color=fff'
        }
    ]

    fixedUsers.forEach(u => {
        authStore.register(u)
        // Petit hack pour s'assurer que l'avatar est bien pris si le register ne le fait pas par défaut
        // (dépend de votre implémentation de authStore.register)
        const userRef = authStore.users[authStore.users.length - 1]
        if(userRef && u.avatar) userRef.avatar = u.avatar
    })

    // 3. GÉNÉRATION DES UTILISATEURS ALÉATOIRES (Foule)
    console.log(`Génération de ${CONFIG.GENERATED_USER_COUNT} utilisateurs aléatoires...`)

    for (let i = 0; i < CONFIG.GENERATED_USER_COUNT; i++) {
        const role = Math.random() > 0.7 ? 'manager' : 'developer'
        const firstName = ['Lucas', 'Emma', 'Julien', 'Marie', 'Alex', 'Lea', 'Nicolas', 'Camille', 'Paul', 'Chloe'][i % 10]
        const lastName = ['Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Michel', 'Garcia', 'David', 'Bertrand'][i % 10]

        try {
            authStore.register({
                name: `${firstName} ${lastName}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@company.com`,
                password: 'password', // Mdp générique pour les bots
                roles: [role]
            })
        } catch(e) { console.warn("Erreur création user auto", e) }
    }

    // Récupération des pools pour assignation
    const allManagers = authStore.users.filter(u => u.roles.includes('manager'))
    const allDevelopers = authStore.users.filter(u => u.roles.includes('developer'))

    // 4. MOTEUR DE GÉNÉRATION DE PROJETS (Logique MockData)
    console.log("Génération des projets et de la chronologie...")

    const now = new Date()

    for (let i = 0; i < CONFIG.PROJECT_COUNT; i++) {
        // --- CHRONOLOGIE DU PROJET ---
        // Date de début aléatoire (entre -6 mois et -1 semaine)
        const daysAgo = getRandomInt(7, 180)
        const projectStartDate = addTime(now, -daysAgo)

        // Durée et Deadline
        const projectDuration = getRandomInt(14, 90)
        const projectDeadline = addTime(projectStartDate, projectDuration)

        // Scénario d'avancement (0-0.2: En retard, 0.2-0.5: Terminé, 0.5-1: En cours)
        const progressScenario = Math.random()

        // Création Projet
        const projectData = {
            name: `${getRandomItem(PROJECT_TYPES)} ${getRandomItem(DEPARTMENTS)} - ${getRandomItem(TECH_STACKS)}`,
            description: `Projet lancé le ${projectStartDate.toLocaleDateString()}. Objectif : refonte infrastructure ${getRandomItem(TECH_STACKS)}.`,
            deadline: projectDeadline.toISOString()
        }

        const newProject = projectsStore.createProject(projectData)

        // HACK: Force la date de création dans le passé
        const projectRef = projectsStore.projects.find(p => p.id === newProject.id)
        if (projectRef) {
            projectRef.createdAt = projectStartDate.toISOString()
            // Si le projet est censé être fini dans le passé, on peut ajuster son statut si le store le gère
            // Sinon la logique des tâches ci-dessous suffira à donner l'impression qu'il est fini
        }

        // Assignation Managers (Mélange de fixes et d'aléatoires)
        const pManagers = [getRandomItem(allManagers)]
        if(Math.random() > 0.7) pManagers.push(getRandomItem(allManagers))
        pManagers.forEach(m => projectsStore.addManager(newProject.id, m.id))

        // --- GÉNÉRATION DES TÂCHES ---
        const numTasks = getRandomInt(CONFIG.MIN_TASKS, CONFIG.MAX_TASKS)

        for (let t = 0; t < numTasks; t++) {
            // Chronologie de la tâche (créée après le début du projet)
            const taskCreationOffset = getRandomInt(0, Math.min(daysAgo, projectDuration - 2))
            const taskCreatedAt = addTime(projectStartDate, taskCreationOffset, getRandomInt(9, 17))

            // Détermination statut intelligent
            let status = 'non_validé'
            let validatedAt = null
            let validatedBy = null

            // Assignation développeurs
            const assignedTo = []
            const nbDevs = getRandomInt(0, 2)
            for(let d=0; d<nbDevs; d++) assignedTo.push(getRandomItem(allDevelopers).id)

            // Logique de statut
            const isCompleted = Math.random() > 0.4

            if (progressScenario < 0.2) {
                // Projet retard : peu de validation
                status = Math.random() > 0.8 ? 'validé' : 'non_validé'
            } else if (progressScenario < 0.5) {
                // Projet terminé : tout validé ou presque
                status = Math.random() > 0.1 ? 'validé' : 'completed'
            } else {
                // Projet normal
                if (isCompleted) status = Math.random() > 0.3 ? 'validé' : 'completed'
            }

            // Gestion validation et dates de fin
            if (status !== 'non_validé') {
                const workDuration = getRandomInt(1, 10)
                const dateFinished = addTime(taskCreatedAt, workDuration)

                // Vérification temporelle
                if (dateFinished > now && progressScenario > 0.5) {
                    status = 'non_validé' // On ne peut pas avoir fini dans le futur
                } else {
                    validatedAt = dateFinished.toISOString()
                    validatedBy = getRandomItem(allManagers).id
                }
            }

            // Création Tâche via Store
            const creator = getRandomItem(allManagers)
            const newTask = tasksStore.createTask(newProject.id, {
                title: `${getRandomItem(TASK_VERBS)} ${getRandomItem(TASK_NOUNS)}`,
                description: `Ticket prioritaire du ${taskCreatedAt.toLocaleDateString()}.`,
                deadline: addTime(taskCreatedAt, 15).toISOString(),
                assignedTo: assignedTo,
                status: 'non_validé' // Statut temporaire
            }, creator.id)

            // HACK: Injection des dates et statuts réels
            const taskRef = tasksStore.tasks.find(tk => tk.id === newTask.id)
            if (taskRef) {
                taskRef.createdAt = taskCreatedAt.toISOString()
                taskRef.status = status
                taskRef.validatedBy = validatedBy
                taskRef.validatedAt = validatedAt
                // La date de mise à jour est soit la validation, soit la création
                taskRef.updatedAt = validatedAt || taskCreatedAt.toISOString()

                // Ajout de commentaires réalistes
                if (Math.random() > 0.6) {
                    const commentDate = addTime(taskCreatedAt, getRandomInt(1, 4))
                    const limitDate = validatedAt ? new Date(validatedAt) : now

                    if (commentDate < limitDate) {
                        if(!taskRef.comments) taskRef.comments = []
                        taskRef.comments.push({
                            id: crypto.randomUUID(),
                            text: "Update: Tests unitaires passés, en attente de review.",
                            authorId: getRandomItem(allDevelopers).id,
                            createdAt: commentDate.toISOString()
                        })
                    }
                }
            }
        }
    }

    // 5. PERSISTANCE FINALE
    localStorage.setItem('projects', JSON.stringify(projectsStore.projects))
    localStorage.setItem('tasks', JSON.stringify(tasksStore.tasks))
    localStorage.setItem('users', JSON.stringify(authStore.users))

    console.timeEnd("Génération complète des données")

    // 6. RETOURNER LES DONNÉES (Au lieu de recharger la page)
    // On retourne les users fixes pour l'affichage dans la modale
    return fixedUsers
}