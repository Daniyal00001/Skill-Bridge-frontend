# SkillBridge — Frontend

**AI-Powered Freelance Marketplace for Smarter Hiring & Project Management**

SkillBridge is an AI-powered freelance marketplace designed to help clients find suitable freelancers, define project requirements, manage projects, and complete the entire hiring lifecycle through a single platform.

This repository contains the frontend application built with React, providing role-based experiences for clients, freelancers, and administrators.

## 🚀 Core Features

### 🤖 AI-Powered Features

* AI-assisted project scoping
* Project requirement refinement
* Project complexity estimation
* Budget estimation assistance
* Required skills identification
* AI-powered freelancer matching
* Weighted freelancer recommendations
* AI-assisted cover letter generation
* AI-assisted negotiation

### 👤 Client Features

* Client profile management
* Project creation and posting
* AI-powered project scoping
* Freelancer recommendations
* Freelancer browsing and filtering
* Proposal management
* Freelancer comparison
* Real-time communication
* Project negotiation
* Agreement and contract management
* Escrow payment workflow
* Project management
* Revision management
* Project completion
* Blind reviews

### 💼 Freelancer Features

* Freelancer profile management
* Skills and experience management
* Portfolio management
* Browse available projects
* Intelligent job recommendations
* Proposal and bidding system
* AI-assisted cover letter generation
* Real-time communication
* Project negotiation
* Project management
* Work submission
* Revision handling
* Payment tracking
* Reputation and reviews

### 🛡️ Admin Features

* User management
* Project management
* Account verification
* Payment verification
* Dispute management
* Platform monitoring
* User reports
* Statistics and dashboards
* Marketplace moderation

## 🔄 Project Workflow

### Client

```text
Register
   ↓
Profile Onboarding
   ↓
Describe Project
   ↓
AI Project Scoping
   ↓
Budget & Requirements
   ↓
Recommended Freelancers
   ↓
Browse / Compare
   ↓
Chat
   ↓
Negotiate
   ↓
Agreement / Contract
   ↓
Escrow Payment
   ↓
Project Management
   ↓
Revisions
   ↓
Completion
   ↓
Blind Review
```

### Freelancer

```text
Register
   ↓
Profile Onboarding
   ↓
Skills & Experience
   ↓
Browse Jobs
   ↓
Intelligent Job Ranking
   ↓
Proposal / Bid
   ↓
AI Cover Letter Assistance
   ↓
Chat
   ↓
Negotiation
   ↓
Agreement
   ↓
Project
   ↓
Submit Work
   ↓
Revisions
   ↓
Completion
   ↓
Payment
   ↓
Review
```

## 🛠️ Tech Stack

* Next.js
* React.js
* TypeScript
* Tailwind CSS
* REST APIs
* Socket.IO
* JWT Authentication
* Stripe Integration

## 🔐 Authentication & Authorization

SkillBridge uses:

* JWT authentication
* Role-Based Access Control (RBAC)
* Protected routes
* Role-specific dashboards
* Authorization checks
* Account verification

The main platform roles are:

* Client
* Freelancer
* Admin

## 💬 Real-Time Communication

SkillBridge uses **Socket.IO** for real-time communication between clients and freelancers.

Chat supports:

* Requirement discussions
* Negotiation
* Project updates
* Revision requests
* General collaboration

## 💳 Payments

The frontend integrates with the SkillBridge payment workflow using **Stripe**.

The payment workflow supports the project's escrow-based model and connects payments with project agreements and lifecycle states.

## ⭐ Blind Review System

SkillBridge includes a blind review system designed to reduce potential bias between clients and freelancers.

Reviews and ratings contribute to the platform's reputation and freelancer recommendation system.

## ⚙️ Getting Started

### Clone the repository

```bash
git clone <your-repository-url>
cd <project-directory>
```

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

The application will be available at the local development URL provided by Next.js.

## 🏗️ Production Build

```bash
npm run build
```

Run the production build:

```bash
npm start
```

## 🤝 Collaboration

SkillBridge is a collaborative Final Year Project developed as a team.

The frontend was developed alongside the backend, database, AI functionality, real-time communication, and payment systems to create an end-to-end freelance marketplace.

## 📌 Project Purpose

SkillBridge aims to make freelance hiring more efficient by combining an AI-powered recommendation system with a complete marketplace and project management workflow.

Instead of forcing clients to manually review large numbers of proposals, SkillBridge helps transform their initial idea into structured requirements and recommends freelancers based on relevant project and profile factors.
