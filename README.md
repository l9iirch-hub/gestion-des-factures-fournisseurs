Description

Ce projet est une API backend permettant aux entreprises et freelances de gérer efficacement leurs fournisseurs, factures et paiements.

Elle offre :

Gestion des fournisseurs (CRUD)
Gestion des factures avec suivi des statuts
Gestion des paiements partiels et complets
Statistiques des dépenses
Authentification sécurisée avec JWT
🧱 Technologies utilisées
Node.js / Express (ou Laravel selon ton choix)
JWT Authentication
MySQL / MongoDB
PlantUML (pour les diagrammes)
📐 UML Diagrams
🔷 1. Use Case Diagram
@startuml
actor Client
actor Admin

Client --> (Register)
Client --> (Login)
Client --> (Gérer fournisseurs)
Client --> (Créer facture)
Client --> (Effectuer paiement)
Client --> (Voir statistiques)

Admin --> (Voir tous les clients)
Admin --> (Voir toutes les factures)
Admin --> (Monitoring système)
@enduml
