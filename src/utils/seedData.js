import bcrypt from 'bcryptjs'

export function seedData() {
    console.log('🌱 Starting data seeding...')

    // Clear existing data
    localStorage.removeItem('users')
    localStorage.removeItem('projects')
    localStorage.removeItem('tasks')
    localStorage.removeItem('currentUser')

    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync('Password123*', salt)

    // 1. Create users
    const users = [
        {
            id: 'user-manager-1',
            name: 'Manager Test',
            email: 'manager@test.com',
            password: hashedPassword,
            roles: ['manager'],
            avatar: 'https://ui-avatars.com/api/?name=Manager+Test&background=667eea'
        },
        {
            id: 'user-manager-2',
            name: 'Sophie Martin',
            email: 'manager2@test.com',
            password: hashedPassword,
            roles: ['manager'],
            avatar: 'https://ui-avatars.com/api/?name=Sophie+Martin&background=764ba2'
        },
        {
            id: 'user-dev-1',
            name: 'Thomas Dubois',
            email: 'dev@test.com',
            password: hashedPassword,
            roles: ['developer'],
            avatar: 'https://ui-avatars.com/api/?name=Thomas+Dubois&background=f093fb'
        },
        {
            id: 'user-dev-2',
            name: 'Julie Bernard',
            email: 'dev2@test.com',
            password: hashedPassword,
            roles: ['developer'],
            avatar: 'https://ui-avatars.com/api/?name=Julie+Bernard&background=4facfe'
        },
        {
            id: 'user-hybrid-1',
            name: 'Alexandre Leroy',
            email: 'hybrid@test.com',
            password: hashedPassword,
            roles: ['manager', 'developer'],
            avatar: 'https://ui-avatars.com/api/?name=Alexandre+Leroy&background=fa709a'
        }
    ]

    localStorage.setItem('users', JSON.stringify(users))
    console.log('✅ Users created:', users.length)

    // 2. Create projects
    const now = new Date()
    const projects = [
        {
            id: 'project-1',
            name: 'Refonte du Site E-commerce',
            description: 'Modernisation complète de la plateforme e-commerce avec un nouveau design responsive et des performances optimisées.',
            deadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            managers: ['user-manager-1', 'user-hybrid-1'],
            createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'project-2',
            name: 'Application Mobile de Gestion',
            description: 'Développement d\'une application mobile native pour iOS et Android permettant la gestion des tâches en déplacement.',
            deadline: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            managers: ['user-manager-1', 'user-manager-2'],
            createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'project-3',
            name: 'API REST v2.0',
            description: 'Création d\'une nouvelle version de l\'API avec authentification OAuth2, documentation Swagger et meilleure gestion des erreurs.',
            deadline: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            managers: ['user-manager-2', 'user-hybrid-1'],
            createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'project-4',
            name: 'Tableau de Bord Analytique',
            description: 'Interface de visualisation des données avec graphiques interactifs, export Excel et filtres avancés.',
            deadline: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
            managers: ['user-manager-1'],
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
    ]

    localStorage.setItem('projects', JSON.stringify(projects))
    console.log('✅ Projects created:', projects.length)

    const tasks = [
        // Project 1: Refonte du Site E-commerce
        {
            id: 'task-1',
            projectId: 'project-1',
            title: 'Maquettes des pages principales',
            description: 'Créer les maquettes Figma pour la page d\'accueil, listing produits et page produit.',
            status: 'completed',
            assignedTo: ['user-dev-1'],
            deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 'user-manager-1',
            validatedBy: 'user-manager-1',
            validatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            comments: [
                {
                    id: 'comment-1',
                    text: 'Super travail ! Les maquettes sont validées.',
                    authorId: 'user-manager-1',
                    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
                }
            ],
            createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'task-2',
            projectId: 'project-1',
            title: 'Intégration du design système',
            description: 'Implémenter les composants réutilisables : boutons, cartes, formulaires avec Tailwind CSS.',
            status: 'validé',
            assignedTo: ['user-dev-2', 'user-hybrid-1'],
            deadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 'user-hybrid-1',
            validatedBy: 'user-hybrid-1',
            validatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            comments: [],
            createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'task-3',
            projectId: 'project-1',
            title: 'Optimisation des images',
            description: 'Mettre en place le lazy loading et le format WebP pour toutes les images produits.',
            status: 'non_validé',
            assignedTo: ['user-dev-1'],
            deadline: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 'user-dev-1',
            validatedBy: null,
            validatedAt: null,
            comments: [
                {
                    id: 'comment-2',
                    text: 'J\'ai besoin d\'aide pour configurer le plugin Webpack.',
                    authorId: 'user-dev-1',
                    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
                }
            ],
            createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },

        // Project 2: Application Mobile
        {
            id: 'task-4',
            projectId: 'project-2',
            title: 'Configuration du projet React Native',
            description: 'Initialiser le projet avec Expo, configurer ESLint et Prettier.',
            status: 'completed',
            assignedTo: ['user-dev-2'],
            deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 'user-manager-2',
            validatedBy: 'user-manager-2',
            validatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            comments: [],
            createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'task-5',
            projectId: 'project-2',
            title: 'Écran de connexion',
            description: 'Créer l\'écran de connexion avec validation des champs et gestion des erreurs.',
            status: 'validé',
            assignedTo: ['user-dev-1', 'user-dev-2'],
            deadline: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 'user-manager-1',
            validatedBy: 'user-manager-1',
            validatedAt: new Date().toISOString(),
            comments: [
                {
                    id: 'comment-3',
                    text: 'N\'oubliez pas le mode sombre !',
                    authorId: 'user-manager-1',
                    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'comment-4',
                    text: 'C\'est fait, en attente de validation.',
                    authorId: 'user-dev-1',
                    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
                }
            ],
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'task-6',
            projectId: 'project-2',
            title: 'Notifications push',
            description: 'Intégrer Firebase Cloud Messaging pour les notifications push.',
            status: 'non_validé',
            assignedTo: ['user-dev-2'],
            deadline: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 'user-dev-2',
            validatedBy: null,
            validatedAt: null,
            comments: [],
            createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: null
        },

        // Project 3: API REST
        {
            id: 'task-7',
            projectId: 'project-3',
            title: 'Schéma de base de données',
            description: 'Concevoir le nouveau schéma avec relations, indexes et contraintes.',
            status: 'completed',
            assignedTo: ['user-hybrid-1'],
            deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 'user-hybrid-1',
            validatedBy: 'user-manager-2',
            validatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            comments: [],
            createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'task-8',
            projectId: 'project-3',
            title: 'Endpoints d\'authentification',
            description: 'Créer les routes /login, /register, /refresh-token avec JWT.',
            status: 'validé',
            assignedTo: ['user-dev-2', 'user-hybrid-1'],
            deadline: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 'user-manager-2',
            validatedBy: 'user-hybrid-1',
            validatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            comments: [
                {
                    id: 'comment-5',
                    text: 'Penser à ajouter le rate limiting.',
                    authorId: 'user-manager-2',
                    createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString()
                }
            ],
            createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },

        // Project 4: Tableau de Bord
        {
            id: 'task-9',
            projectId: 'project-4',
            title: 'Graphiques de ventes',
            description: 'Implémenter les graphiques avec Chart.js : courbes, barres et camemberts.',
            status: 'non_validé',
            assignedTo: ['user-dev-1'],
            deadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 'user-dev-1',
            validatedBy: null,
            validatedAt: null,
            comments: [],
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: null
        },
        {
            id: 'task-10',
            projectId: 'project-4',
            title: 'Export PDF des rapports',
            description: 'Ajouter la fonctionnalité d\'export en PDF avec jsPDF et logo entreprise.',
            status: 'non_validé',
            assignedTo: ['user-dev-2'],
            deadline: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 'user-dev-2',
            validatedBy: null,
            validatedAt: null,
            comments: [
                {
                    id: 'comment-6',
                    text: 'Quelle bibliothèque recommandez-vous ?',
                    authorId: 'user-dev-2',
                    createdAt: new Date().toISOString()
                }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ]

    localStorage.setItem('tasks', JSON.stringify(tasks))
    console.log('✅ Tasks created:', tasks.length)

    localStorage.setItem('seedJustCompleted', 'true')
    console.log('🎉 Seeding completed!')
    console.log('\n📋 Summary:')
    console.log(`- ${users.length} users`)
    console.log(`- ${projects.length} projects`)
    console.log(`- ${tasks.length} tasks`)
    console.log('\n🔑 Login credentials:')
    console.log('Email: manager@test.com | Password: Password123*')
    console.log('Email: manager2@test.com | Password: Password123*')
    console.log('Email: dev@test.com | Password: Password123*')
    console.log('Email: dev2@test.com | Password: Password123*')
    console.log('Email: hybrid@test.com | Password: Password123* (Manager + Dev)')

    return { users, projects, tasks }
}
