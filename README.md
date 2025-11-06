# ft_transcendence

A full-stack real-time multiplayer web application — a modern reimagining of the classic **Pong** game — built as the final Common Core project at **42 Vienna**.  
The project demonstrates proficiency across web technologies, system design, DevOps, security, and accessibility.

---

## Overview

**ft_transcendence** is a Single Page Application (SPA) allowing players to:
- Play **Pong** online in real time.
- Compete in tournaments with matchmaking.
- Manage user profiles and authentication (including 42 OAuth).
- Experience accessibility, responsiveness, and localization across devices.

Everything runs through **Docker** with one command.

---

## Architecture

| Layer | Description | Technologies |
|-------|--------------|---------------|
| **Frontend** | SPA written in TypeScript with responsive design and accessibility support. | Vite, Tailwind CSS v4 |
| **Backend** | Fast, modular Node.js backend with API services. | Fastify, Prisma, SQLite |
| **Auth Service** | Authentication microservice with JWT and 2FA support. | Fastify, JWT |
| **Game Service** | Real-time Pong gameplay, Tournament system, 2vs2 Mode | Typescript |
| **Database** | Persistent user, match, and tournament data. | SQLite |
| **Containerization** | Multi-service deployment in isolated environments. | Docker Compose |
| **DevOps** |  Centralized log management and analytics for all microservices. | Elasticsearch, Logstash, Kibana

---

## 🧩 Implemented by me/with me Modules (per subject)

### Web
- **Frontend framework**: Tailwind CSS (Minor)

### User Management
- **Standard user management, authentication, and cross-tournament accounts** (Major)

### Accessibility
- **Support on all devices** (Minor)
- **Browser compatibility** (Minor)
- **Multi-language support (EN/DE/RU)** (Minor)
- **Accessibility features for visually impaired users** (Minor)

---

## Core Features

- **Real-time Pong gameplay** 1vs1 or 2vs2 modes.
- **Tournament system** with match scheduling and progression.
- **User registration, login, and 42 OAuth** integration.
- **Friend system** with online status.
- **2-Factor Authentication (2FA)** via email.
- **Multilingual interface** (English, German, Ukrainian).
- **Accessibility tools** (high contrast, ARIA labels, keyboard navigation).
- **Fully responsive layout** for desktop and mobile devices.

## Authors

@<a href="https://github.com/vaismand">vaismand</a> – Frontend, UI/UX, Accessibility, Localization<br>
@<a href="https://github.com/kmoragap">kmoragap</a> – Backend, Database, Auth<br>
@<a href="https://github.com/owa-geh">owa-geh</a> - Game<br>
@<a href="https://github.com/elcomzer0">elcomzer0</a> - DevOps<br>
@<a href="https://github.com/rybarska">rybarska</a> - Security, 2FA
