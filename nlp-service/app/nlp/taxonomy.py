"""
Centralized Skill Taxonomy
Provides canonical skill definitions, version aliases, abbreviations,
categories, and relationship mappings across engineering and data domains.
"""

import re
import logging
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

# Complete centralized skill taxonomy
# Structure: canonical_name -> {category, aliases, related, description}
SKILL_TAXONOMY: Dict[str, Dict] = {
    # ==========================================
    # FRONTEND
    # ==========================================
    "HTML": {
        "category": "frontend",
        "aliases": [
            "html", "html5", "html 5", "hypertext markup language",
            "dhtml", "xhtml", "semantic html", "html/css"
        ],
        "related": ["CSS", "JavaScript"],
    },
    "CSS": {
        "category": "frontend",
        "aliases": [
            "css", "css3", "css 3", "cascading style sheets",
            "css modules", "flexbox", "css grid"
        ],
        "related": ["HTML", "Sass", "Tailwind", "Bootstrap"],
    },
    "Sass": {
        "category": "frontend",
        "aliases": ["sass", "scss"],
        "related": ["CSS"],
    },
    "Less": {
        "category": "frontend",
        "aliases": ["less", "less css"],
        "related": ["CSS"],
    },
    "JavaScript": {
        "category": "programming",
        "aliases": [
            "javascript", "js", "ecmascript", "es6", "es2015", "es2016",
            "es2017", "es2018", "es2019", "es2020", "es2021", "es2022",
            "es2023", "esnext", "vanilla js", "modern javascript"
        ],
        "related": ["TypeScript", "Node.js", "React"],
    },
    "TypeScript": {
        "category": "programming",
        "aliases": ["typescript", "ts"],
        "related": ["JavaScript"],
    },
    "React": {
        "category": "frontend",
        "aliases": [
            "react", "react.js", "reactjs", "react js",
            "react native", "react router", "react hooks"
        ],
        "related": ["JavaScript", "Next.js", "Redux"],
    },
    "Next.js": {
        "category": "frontend",
        "aliases": ["next.js", "nextjs", "next js", "next"],
        "related": ["React", "JavaScript"],
    },
    "Vue.js": {
        "category": "frontend",
        "aliases": ["vue", "vue.js", "vuejs", "vue js", "vue 3", "vue 2", "vuex", "pinia"],
        "related": ["JavaScript", "Nuxt.js"],
    },
    "Nuxt.js": {
        "category": "frontend",
        "aliases": ["nuxt", "nuxt.js", "nuxtjs", "nuxt js"],
        "related": ["Vue.js"],
    },
    "Angular": {
        "category": "frontend",
        "aliases": ["angular", "angular.js", "angularjs", "angular 2+", "angular 14", "angular 15", "angular 16", "angular 17"],
        "related": ["TypeScript", "RxJS"],
    },
    "Svelte": {
        "category": "frontend",
        "aliases": ["svelte", "sveltekit", "svelte.js"],
        "related": ["JavaScript"],
    },
    "Tailwind": {
        "category": "frontend",
        "aliases": ["tailwind", "tailwind css", "tailwindcss"],
        "related": ["CSS"],
    },
    "Bootstrap": {
        "category": "frontend",
        "aliases": ["bootstrap", "bootstrap 5", "bootstrap 4", "bootstrap 3"],
        "related": ["CSS", "HTML"],
    },
    "Material UI": {
        "category": "frontend",
        "aliases": ["material ui", "material-ui", "mui", "material design"],
        "related": ["React", "CSS"],
    },
    "Redux": {
        "category": "frontend",
        "aliases": ["redux", "redux toolkit", "rtk", "redux-thunk", "redux-saga"],
        "related": ["React"],
    },
    "Zustand": {
        "category": "frontend",
        "aliases": ["zustand"],
        "related": ["React"],
    },
    "jQuery": {
        "category": "frontend",
        "aliases": ["jquery"],
        "related": ["JavaScript"],
    },
    "Webpack": {
        "category": "tools",
        "aliases": ["webpack", "webpack 5"],
        "related": ["JavaScript", "Vite"],
    },
    "Vite": {
        "category": "tools",
        "aliases": ["vite", "vitejs"],
        "related": ["JavaScript", "Webpack"],
    },
    "UI Design": {
        "category": "frontend",
        "aliases": ["ui design", "user interface design", "ui/ux", "ui ux", "user interface"],
        "related": ["UX Research", "Figma"],
    },
    "Design Systems": {
        "category": "tools",
        "aliases": ["design systems", "design system", "component library"],
        "related": ["UI Design", "Figma"],
    },

    # ==========================================
    # BACKEND
    # ==========================================
    "Node.js": {
        "category": "backend",
        "aliases": ["node.js", "nodejs", "node js", "node"],
        "related": ["JavaScript", "Express", "NestJS"],
    },
    "Express": {
        "category": "backend",
        "aliases": ["express", "express.js", "expressjs", "express js"],
        "related": ["Node.js", "REST API"],
    },
    "NestJS": {
        "category": "backend",
        "aliases": ["nestjs", "nest.js", "nest js"],
        "related": ["Node.js", "TypeScript"],
    },
    "Django": {
        "category": "backend",
        "aliases": ["django", "django rest framework", "drf"],
        "related": ["Python"],
    },
    "Flask": {
        "category": "backend",
        "aliases": ["flask"],
        "related": ["Python"],
    },
    "FastAPI": {
        "category": "backend",
        "aliases": ["fastapi", "fast api"],
        "related": ["Python", "REST API"],
    },
    "Spring Boot": {
        "category": "backend",
        "aliases": ["spring boot", "springboot", "spring framework", "spring"],
        "related": ["Java"],
    },
    ".NET": {
        "category": "backend",
        "aliases": [".net", "dotnet", ".net core", "asp.net", "asp.net core", "c# .net"],
        "related": ["C#"],
    },
    "Ruby on Rails": {
        "category": "backend",
        "aliases": ["ruby on rails", "rails"],
        "related": ["Ruby"],
    },
    "Laravel": {
        "category": "backend",
        "aliases": ["laravel"],
        "related": ["PHP"],
    },
    "GraphQL": {
        "category": "backend",
        "aliases": ["graphql", "apollo graphql", "relay"],
        "related": ["REST API"],
    },
    "REST API": {
        "category": "tools",
        "aliases": [
            "rest api", "rest apis", "restful api", "restful apis",
            "restful web services", "restful services", "rest", "rest architecture"
        ],
        "related": ["GraphQL", "HTTP"],
    },
    "Microservices": {
        "category": "tools",
        "aliases": ["microservices", "microservice architecture", "micro-services", "service-oriented architecture", "soa"],
        "related": ["Docker", "Kubernetes"],
    },

    # ==========================================
    # PROGRAMMING LANGUAGES
    # ==========================================
    "Python": {
        "category": "programming",
        "aliases": ["python", "python3", "python 3", "py"],
        "related": ["Django", "Flask", "Pandas"],
    },
    "Java": {
        "category": "programming",
        "aliases": ["java", "core java", "java 8", "java 11", "java 17", "java 21", "jvm"],
        "related": ["Spring Boot"],
    },
    "C++": {
        "category": "programming",
        "aliases": ["c++", "cpp", "c/c++"],
        "related": ["C", "C#"],
    },
    "C#": {
        "category": "programming",
        "aliases": ["c#", "csharp", "c sharp"],
        "related": [".NET"],
    },
    "Go": {
        "category": "programming",
        "aliases": ["go", "golang"],
        "related": ["Docker", "Kubernetes"],
    },
    "Rust": {
        "category": "programming",
        "aliases": ["rust", "rustlang"],
        "related": ["C++"],
    },
    "PHP": {
        "category": "programming",
        "aliases": ["php", "php7", "php8"],
        "related": ["Laravel"],
    },
    "Ruby": {
        "category": "programming",
        "aliases": ["ruby"],
        "related": ["Ruby on Rails"],
    },
    "Kotlin": {
        "category": "programming",
        "aliases": ["kotlin"],
        "related": ["Java", "Android"],
    },
    "Swift": {
        "category": "programming",
        "aliases": ["swift"],
        "related": ["iOS"],
    },
    "R": {
        "category": "programming",
        "aliases": ["r language", "r programming"],
        "related": ["Statistics"],
    },
    "Scala": {
        "category": "programming",
        "aliases": ["scala"],
        "related": ["Java", "Spark"],
    },
    "Bash": {
        "category": "cloud_devops",
        "aliases": ["bash", "shell scripting", "shell script", "shell", "sh"],
        "related": ["Linux"],
    },

    # ==========================================
    # DATABASES
    # ==========================================
    "SQL": {
        "category": "database",
        "aliases": ["sql", "structured query language", "rdbms", "relational database", "relational databases"],
        "related": ["PostgreSQL", "MySQL", "SQL Server"],
    },
    "PostgreSQL": {
        "category": "database",
        "aliases": ["postgresql", "postgres", "psql"],
        "related": ["SQL"],
    },
    "MySQL": {
        "category": "database",
        "aliases": ["mysql"],
        "related": ["SQL"],
    },
    "MongoDB": {
        "category": "database",
        "aliases": ["mongodb", "mongo", "nosql", "documentdb"],
        "related": ["Node.js"],
    },
    "Redis": {
        "category": "database",
        "aliases": ["redis", "in-memory cache", "caching"],
        "related": ["Backend"],
    },
    "SQLite": {
        "category": "database",
        "aliases": ["sqlite", "sqlite3"],
        "related": ["SQL"],
    },
    "SQL Server": {
        "category": "database",
        "aliases": ["sql server", "mssql", "microsoft sql server", "ms sql server", "tsql", "t-sql"],
        "related": ["SQL", ".NET"],
    },
    "Oracle": {
        "category": "database",
        "aliases": ["oracle", "oracle database", "pl/sql", "plsql"],
        "related": ["SQL"],
    },
    "Elasticsearch": {
        "category": "database",
        "aliases": ["elasticsearch", "elastic search", "elk stack"],
        "related": ["Search"],
    },
    "Cassandra": {
        "category": "database",
        "aliases": ["cassandra", "apache cassandra"],
        "related": ["NoSQL"],
    },
    "DynamoDB": {
        "category": "database",
        "aliases": ["dynamodb", "dynamo db", "aws dynamodb"],
        "related": ["AWS", "NoSQL"],
    },
    "Firebase": {
        "category": "database",
        "aliases": ["firebase", "firestore", "cloud firestore"],
        "related": ["GCP"],
    },
    "Supabase": {
        "category": "database",
        "aliases": ["supabase"],
        "related": ["PostgreSQL"],
    },
    "Prisma": {
        "category": "database",
        "aliases": ["prisma", "prisma orm"],
        "related": ["TypeScript", "Node.js"],
    },

    # ==========================================
    # CLOUD & DEVOPS
    # ==========================================
    "AWS": {
        "category": "cloud_devops",
        "aliases": [
            "aws", "amazon web services", "amazon aws",
            "ec2", "s3", "lambda", "aws lambda", "cloudformation"
        ],
        "related": ["Cloud Architect", "Docker"],
    },
    "Azure": {
        "category": "cloud_devops",
        "aliases": ["azure", "microsoft azure", "ms azure"],
        "related": ["Cloud Architect", ".NET"],
    },
    "GCP": {
        "category": "cloud_devops",
        "aliases": ["gcp", "google cloud", "google cloud platform"],
        "related": ["Cloud Architect"],
    },
    "Docker": {
        "category": "cloud_devops",
        "aliases": ["docker", "docker container", "docker containers", "dockerfile", "docker compose"],
        "related": ["Kubernetes", "DevOps"],
    },
    "Kubernetes": {
        "category": "cloud_devops",
        "aliases": ["kubernetes", "k8s", "helm"],
        "related": ["Docker", "DevOps"],
    },
    "CI/CD": {
        "category": "cloud_devops",
        "aliases": [
            "ci/cd", "cicd", "ci cd", "ci / cd",
            "continuous integration", "continuous deployment", "continuous delivery"
        ],
        "related": ["Jenkins", "GitHub Actions"],
    },
    "Terraform": {
        "category": "cloud_devops",
        "aliases": ["terraform", "infrastructure as code", "iac"],
        "related": ["AWS", "DevOps"],
    },
    "Ansible": {
        "category": "cloud_devops",
        "aliases": ["ansible"],
        "related": ["Linux", "DevOps"],
    },
    "Jenkins": {
        "category": "cloud_devops",
        "aliases": ["jenkins"],
        "related": ["CI/CD"],
    },
    "GitHub Actions": {
        "category": "cloud_devops",
        "aliases": ["github actions", "gh actions"],
        "related": ["CI/CD", "GitHub"],
    },
    "GitLab CI": {
        "category": "cloud_devops",
        "aliases": ["gitlab ci", "gitlab-ci", "gitlab ci/cd"],
        "related": ["CI/CD"],
    },
    "Linux": {
        "category": "cloud_devops",
        "aliases": ["linux", "unix", "ubuntu", "centos", "debian", "redhat", "rhel"],
        "related": ["Bash"],
    },
    "Nginx": {
        "category": "cloud_devops",
        "aliases": ["nginx"],
        "related": ["DevOps"],
    },
    "Apache": {
        "category": "cloud_devops",
        "aliases": ["apache", "apache http server"],
        "related": ["DevOps"],
    },
    "Networking": {
        "category": "cloud_devops",
        "aliases": ["networking", "computer networks", "tcp/ip", "dns", "vpn", "vpc"],
        "related": ["Cloud Architect", "Linux"],
    },
    "Security": {
        "category": "cloud_devops",
        "aliases": ["security", "cybersecurity", "information security", "infosec", "appsec", "oauth", "jwt"],
        "related": ["DevOps"],
    },

    # ==========================================
    # DATA SCIENCE & ML & ANALYTICS
    # ==========================================
    "Machine Learning": {
        "category": "data_ml",
        "aliases": ["machine learning", "ml", "supervised learning", "unsupervised learning"],
        "related": ["Python", "Deep Learning"],
    },
    "Deep Learning": {
        "category": "data_ml",
        "aliases": ["deep learning", "dl", "artificial neural networks", "ann", "cnn", "rnn", "transformers"],
        "related": ["Machine Learning", "PyTorch", "TensorFlow"],
    },
    "Natural Language Processing": {
        "category": "data_ml",
        "aliases": ["natural language processing", "nlp", "text mining", "llm", "large language models"],
        "related": ["Machine Learning", "Python"],
    },
    "Computer Vision": {
        "category": "data_ml",
        "aliases": ["computer vision", "cv", "opencv"],
        "related": ["Machine Learning", "Deep Learning"],
    },
    "TensorFlow": {
        "category": "data_ml",
        "aliases": ["tensorflow", "tf"],
        "related": ["Python", "Deep Learning", "Keras"],
    },
    "PyTorch": {
        "category": "data_ml",
        "aliases": ["pytorch", "torch"],
        "related": ["Python", "Deep Learning"],
    },
    "Keras": {
        "category": "data_ml",
        "aliases": ["keras"],
        "related": ["TensorFlow"],
    },
    "Scikit-learn": {
        "category": "data_ml",
        "aliases": ["scikit-learn", "scikit learn", "sklearn"],
        "related": ["Python", "Machine Learning"],
    },
    "Pandas": {
        "category": "data_ml",
        "aliases": ["pandas"],
        "related": ["Python", "Data Analysis"],
    },
    "NumPy": {
        "category": "data_ml",
        "aliases": ["numpy"],
        "related": ["Python"],
    },
    "Matplotlib": {
        "category": "data_ml",
        "aliases": ["matplotlib"],
        "related": ["Python", "Data Visualization"],
    },
    "Seaborn": {
        "category": "data_ml",
        "aliases": ["seaborn"],
        "related": ["Python", "Data Visualization"],
    },
    "Statistics": {
        "category": "data_ml",
        "aliases": ["statistics", "statistical analysis", "stats", "biostatistics", "probability and statistics"],
        "related": ["Data Analysis", "Machine Learning"],
    },
    "Data Visualization": {
        "category": "data_ml",
        "aliases": ["data visualization", "data viz", "dataviz", "dashboarding", "visual analytics"],
        "related": ["Tableau", "Power BI"],
    },
    "Data Analysis": {
        "category": "data_ml",
        "aliases": ["data analysis", "data analytics", "exploratory data analysis", "eda"],
        "related": ["SQL", "Excel", "Python"],
    },
    "MLOps": {
        "category": "data_ml",
        "aliases": ["mlops", "ml ops", "machine learning operations"],
        "related": ["Machine Learning", "Docker"],
    },
    "Excel": {
        "category": "tools",
        "aliases": [
            "excel", "microsoft excel", "ms excel", "vba",
            "excel modeling", "pivot tables", "vlookup", "xlookup"
        ],
        "related": ["Data Analysis", "Power BI"],
    },
    "Power BI": {
        "category": "tools",
        "aliases": [
            "power bi", "microsoft power bi", "ms power bi",
            "powerbi", "dax", "power query"
        ],
        "related": ["Excel", "Data Visualization", "SQL"],
    },
    "Tableau": {
        "category": "tools",
        "aliases": ["tableau", "tableau desktop", "tableau server"],
        "related": ["Data Visualization", "SQL"],
    },

    # ==========================================
    # TOOLS & PRACTICES
    # ==========================================
    "Git": {
        "category": "tools",
        "aliases": ["git", "git version control", "version control (git)", "git vcs"],
        "related": ["GitHub", "GitLab"],
    },
    "GitHub": {
        "category": "tools",
        "aliases": ["github", "github platform"],
        "related": ["Git"],
    },
    "GitLab": {
        "category": "tools",
        "aliases": ["gitlab"],
        "related": ["Git"],
    },
    "Bitbucket": {
        "category": "tools",
        "aliases": ["bitbucket"],
        "related": ["Git"],
    },
    "Jira": {
        "category": "tools",
        "aliases": ["jira", "atlassian jira"],
        "related": ["Agile", "Scrum"],
    },
    "Confluence": {
        "category": "tools",
        "aliases": ["confluence"],
        "related": ["Jira"],
    },
    "Agile": {
        "category": "tools",
        "aliases": ["agile", "agile methodology", "agile development", "agile framework", "agile environment"],
        "related": ["Scrum"],
    },
    "Scrum": {
        "category": "tools",
        "aliases": ["scrum", "scrum master", "sprints", "daily standup"],
        "related": ["Agile"],
    },
    "Unit Testing": {
        "category": "tools",
        "aliases": ["unit testing", "unit test", "unit tests", "tdd", "test driven development"],
        "related": ["Jest", "Pytest"],
    },
    "Jest": {
        "category": "tools",
        "aliases": ["jest", "jestjs"],
        "related": ["JavaScript", "Unit Testing"],
    },
    "Pytest": {
        "category": "tools",
        "aliases": ["pytest"],
        "related": ["Python", "Unit Testing"],
    },
    "Mocha": {
        "category": "tools",
        "aliases": ["mocha", "chai"],
        "related": ["JavaScript", "Unit Testing"],
    },
    "Cypress": {
        "category": "tools",
        "aliases": ["cypress", "cypress.io", "e2e testing"],
        "related": ["JavaScript"],
    },
    "Figma": {
        "category": "tools",
        "aliases": ["figma"],
        "related": ["UI Design", "Prototyping"],
    },
    "Adobe XD": {
        "category": "tools",
        "aliases": ["adobe xd", "xd"],
        "related": ["UI Design", "Figma"],
    },
    "Prototyping": {
        "category": "tools",
        "aliases": ["prototyping", "wireframing", "mockups", "interactive prototypes"],
        "related": ["Figma", "UI Design"],
    },
    "UX Research": {
        "category": "tools",
        "aliases": ["ux research", "user research", "user experience research", "heuristic evaluation"],
        "related": ["User Testing", "UI Design"],
    },
    "User Testing": {
        "category": "tools",
        "aliases": ["user testing", "usability testing", "user interviews"],
        "related": ["UX Research"],
    },
    "A/B Testing": {
        "category": "tools",
        "aliases": ["a/b testing", "ab testing", "split testing", "multivariate testing"],
        "related": ["Product Strategy", "Data Analysis"],
    },
    "Product Strategy": {
        "category": "tools",
        "aliases": [
            "product strategy", "product roadmap", "roadmap planning",
            "product management", "feature prioritization", "product discovery"
        ],
        "related": ["Agile", "User Research"],
    },
}


class SkillTaxonomy:
    """
    Centralized skill taxonomy manager for normalizing, indexing,
    and pattern matching skills.
    """

    def __init__(self):
        self.taxonomy = SKILL_TAXONOMY
        self._build_index()

    def _build_index(self):
        """Build fast alias-to-canonical lookup and boundary-safe regex patterns."""
        self.alias_to_canonical: Dict[str, str] = {}
        self.canonical_lookup: Dict[str, str] = {}  # lowercase canonical -> canonical
        self.compiled_patterns: List[Tuple[re.Pattern, str, str, str]] = []

        # 1. Index canonical names
        for canonical, data in self.taxonomy.items():
            self.canonical_lookup[canonical.lower()] = canonical
            self.alias_to_canonical[canonical.lower()] = canonical

            for alias in data.get("aliases", []):
                self.alias_to_canonical[alias.lower()] = canonical

        # 2. Gather all patterns and sort by alias length descending
        # Longest match first prevents sub-components from eating compound names
        pattern_candidates = []
        for canonical, data in self.taxonomy.items():
            category = data.get("category", "other")
            all_terms = [canonical] + data.get("aliases", [])
            seen_terms = set()

            for term in all_terms:
                term_clean = term.strip()
                term_lower = term_clean.lower()
                if not term_clean or term_lower in seen_terms:
                    continue
                seen_terms.add(term_lower)

                pattern = self._build_boundary_pattern(term_clean)
                pattern_candidates.append((len(term_clean), pattern, canonical, term_clean, category))

        # Sort longest term first
        pattern_candidates.sort(key=lambda x: x[0], reverse=True)
        self.compiled_patterns = [
            (p, canon, raw, cat) for _, p, canon, raw, cat in pattern_candidates
        ]

        logger.info(
            f"Taxonomy initialized with {len(self.taxonomy)} canonical skills, "
            f"{len(self.alias_to_canonical)} aliases, and {len(self.compiled_patterns)} match patterns."
        )

    @staticmethod
    def _build_boundary_pattern(term: str) -> re.Pattern:
        """
        Build a robust boundary-aware regex pattern for a skill term.
        Handles alphanumeric boundaries as well as special characters
        (like C++, C#, .NET, Node.js, A/B Testing, CI/CD).
        Prevents .js and .ts from matching file/framework extensions (e.g. Node.js).
        """
        escaped = re.escape(term)
        lower_term = term.lower()

        # For terms that could be file extensions or short suffixes (.js, .ts, .py)
        if lower_term in ("js", "ts", "py"):
            prefix = r'(?<![\.a-zA-Z0-9])'
            suffix = r'(?![a-zA-Z0-9])'
            return re.compile(prefix + escaped + suffix, re.IGNORECASE)

        # For common single/short words like "go", avoid matching the common English verb
        if lower_term == "go":
            prefix = r'(?<![a-zA-Z0-9])'
            suffix = r'(?![a-zA-Z0-9])'
            # Must be exact case "Go" to avoid matching verb "go"
            return re.compile(prefix + r'Go' + suffix)

        # Left boundary
        if term[0].isalnum():
            prefix = r'(?<![a-zA-Z0-9])'
        else:
            # Fixed-width lookbehind for special leading characters
            prefix = r'(?:(?<=^)|(?<=[\s,;:()[\]{}`"\'•·\-\/\\|~<>]))'

        # Right boundary
        if term[-1].isalnum():
            suffix = r'(?![a-zA-Z0-9])'
        else:
            # Fixed-width lookahead for special trailing characters
            suffix = r'(?:(?=$)|(?=[\s,;:()[\]{}`"\'•·\-\/\\|~<>]))'

        return re.compile(prefix + escaped + suffix, re.IGNORECASE)


    def get_canonical(self, skill_name: str) -> str:
        """
        Convert any skill string or alias into its canonical form.
        Examples:
            'HTML5' -> 'HTML'
            'JS' -> 'JavaScript'
            'react.js' -> 'React'
            'node' -> 'Node.js'
            'PostgreSQL' -> 'PostgreSQL'
            'postgres' -> 'PostgreSQL'
            'RESTful APIs' -> 'REST API'
            'Microsoft Excel' -> 'Excel'
        If unknown, returns trimmed title-cased name.
        """
        if not skill_name:
            return ""

        cleaned = skill_name.strip()
        lower = cleaned.lower()

        # Direct alias/canonical lookup
        if lower in self.alias_to_canonical:
            return self.alias_to_canonical[lower]

        # Check punctuation variations (e.g. 'react-js' -> 'react.js')
        dash_to_dot = lower.replace('-', '.')
        if dash_to_dot in self.alias_to_canonical:
            return self.alias_to_canonical[dash_to_dot]

        # Remove trailing version numbers if standard pattern (e.g. 'python 3.9' -> 'python')
        version_stripped = re.sub(r'\s+v?\d+(\.\d+)*$', '', lower).strip()
        if version_stripped in self.alias_to_canonical:
            return self.alias_to_canonical[version_stripped]

        return cleaned

    def get_category(self, canonical_or_alias: str) -> str:
        """Get skill category (e.g., 'frontend', 'backend', 'tools')."""
        canonical = self.get_canonical(canonical_or_alias)
        if canonical in self.taxonomy:
            return self.taxonomy[canonical].get("category", "other")
        return "other"

    def get_aliases(self, canonical_name: str) -> List[str]:
        """Get all aliases for a canonical skill."""
        if canonical_name in self.taxonomy:
            return self.taxonomy[canonical_name].get("aliases", [])
        return []

    def is_equivalent(self, skill_a: str, skill_b: str) -> bool:
        """Check if two skill names represent the same underlying competency."""
        canonical_a = self.get_canonical(skill_a)
        canonical_b = self.get_canonical(skill_b)
        return canonical_a.lower() == canonical_b.lower()

    def is_related(self, skill_a: str, skill_b: str) -> bool:
        """
        Check if two skills are related technologies without being identical.
        For example: Python is related to Django, but Python != Django.
        """
        canonical_a = self.get_canonical(skill_a)
        canonical_b = self.get_canonical(skill_b)

        if canonical_a == canonical_b:
            return True

        data_a = self.taxonomy.get(canonical_a, {})
        data_b = self.taxonomy.get(canonical_b, {})

        related_a = [self.get_canonical(s) for s in data_a.get("related", [])]
        related_b = [self.get_canonical(s) for s in data_b.get("related", [])]

        return (canonical_b in related_a) or (canonical_a in related_b)

    def get_all_canonical_skills(self) -> List[str]:
        """Get list of all canonical skill names."""
        return list(self.taxonomy.keys())


# Global singleton instance
taxonomy = SkillTaxonomy()
