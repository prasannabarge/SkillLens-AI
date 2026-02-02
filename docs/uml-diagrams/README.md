# UML Diagrams

This directory contains UML diagrams for the SkillLens application.

## Available Diagrams

### 1. Use Case Diagram
- Shows user interactions with the system
- Main actors: Guest, User, Admin

### 2. Class Diagram
- Shows data models and relationships
- User, Analysis, Roadmap entities

### 3. Sequence Diagrams
- Resume Analysis Flow
- Authentication Flow
- Roadmap Generation Flow

### 4. Component Diagram
- Shows system components and interactions
- Frontend, Backend, NLP Service, Database

## Creating Diagrams

You can use the following tools to create/edit diagrams:
- [draw.io](https://draw.io) - Free online diagramming
- [Mermaid](https://mermaid.js.org/) - Markdown-based diagrams
- [PlantUML](https://plantuml.com/) - Text-based UML

## Mermaid Examples

### Use Case (embed in markdown)

```mermaid
graph TD
    subgraph User Actions
        A[Upload Resume] --> B[Analyze Skills]
        B --> C[View Gap Analysis]
        C --> D[Generate Roadmap]
        D --> E[Track Progress]
    end
```

### Class Diagram

```mermaid
classDiagram
    class User {
        +String name
        +String email
        +String password
        +Analysis[] analyses
        +Roadmap[] savedRoadmaps
    }
    class Analysis {
        +User user
        +String resumeText
        +String targetRole
        +Skill[] extractedSkills
        +Skill[] gapSkills
        +Number matchScore
    }
    class Roadmap {
        +User user
        +Analysis analysis
        +Phase[] phases
        +Number progress
    }
    User "1" --> "*" Analysis
    User "1" --> "*" Roadmap
    Analysis "1" --> "1" Roadmap
```
