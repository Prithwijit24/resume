// ════════════════════════════════════════════════════════════════════
//  CONTENT  ·  everything visible as text
//  ────────────────────────────────────────────────────────────────────
//  Edit copy here. Headlines support <em>...</em> for accent-colored
//  emphasis. Three placeholder URLs in PROFILE need to be replaced.
// ════════════════════════════════════════════════════════════════════

export const PROFILE = {
  name:      'Prithwijit Ghosh',
  short:     'PG',
  role:      'Data Scientist Specialist',
  org:       'Accenture Global Technology',
  location:  'Bengaluru, India',
  email:     'ghoshprithwijit39@gmail.com',
  phone:     '+91-7595986858',
  github:    'https://github.com/',          // PLACEHOLDER → your handle
  linkedin:  'https://www.linkedin.com/',    // PLACEHOLDER → your handle
  resumeUrl: './resume.pdf',                 // file lives at public/resume.pdf
};

// Section copy. The keys (hero, exp, ...) must match data-jump links
// in index.html and the order in CAMERA_PATH (world.config.js).
export const SECTIONS = {
  hero: {
    eyebrow: 'DATA SCIENTIST · BENGALURU',
    title:   'Models that <em>decide</em>, not just predict.',
    lede:    "I build production forecasting systems at Accenture — sales, cash flow, receivables — that turn time series into operational decisions. IIT Kanpur statistics. Two years and change.",
    ctas: [
      { label: 'Request Access →', jump: 'contact', solid: true },
      { label: 'Explore Work',     jump: 'exp' },
    ],
    stats: [
      { v: '2.8 yrs', l: 'Accenture' },
      { v: '450+',    l: 'Models shipped' },
      { v: '99%',     l: 'Peak accuracy' },
    ],
  },
  exp: {
    num:     '01',
    eyebrow: 'EXPERIENCE',
    title:   'Four engagements <em>built from the metal up.</em>',
    lede:    'Production forecasting and risk modeling, end-to-end — from feature engineering through MLOps to AWS Fargate.',
  },
  proj: {
    num:     '02',
    eyebrow: 'LABS',
    title:   'What I build <em>at night.</em>',
    lede:    'Self-directed experiments in agents, embeddings, and the spaces in between.',
  },
  skill: {
    num:     '03',
    eyebrow: 'STACK',
    title:   'A working <em>vocabulary.</em>',
    lede:    'Tools I reach for daily, organized by where they sit in the stack.',
  },
  edu: {
    num:     '04',
    eyebrow: 'FOUNDATION',
    title:   'Statistics from <em>first principles.</em>',
    lede:    'Two institutions. Two decades of probability, inference, and the willingness to do the algebra.',
  },
  contact: {
    num:     '05',
    eyebrow: 'CONTACT',
    title:   'Ready to <em>deploy?</em>',
    lede:    'Open to forecasting roles, MLOps puzzles, and anything where statistics gets to make decisions, not just describe them.',
  },
};

// Experience: 4 Accenture projects
export const EXPERIENCE = [
  {
    name: 'Sales & Guest-Count Forecast',
    client: 'Global QSR Brand',
    tag: 'TIME SERIES · MLOPS',
    metrics: [
      { v: '97-99%', l: '24mo acc' },
      { v: '48mo',   l: 'horizon' },
      { v: '450+',   l: 'models' },
    ],
    details: [
      'Ensemble of Prophet · Theta · MSTL · LightGBM with macroeconomic indicators, across 6 countries.',
      'Horizon-aware MAPE evaluator and ensemble balancing strategy stabilizes long-range forecasts.',
      'Docker + GitHub Actions CI/CD with SonarQube/Snyk scans before deployment to JFrog Artifactory.',
      'Monthly DAGs run on Astronomer/Apache Airflow, deployed to AWS Fargate.',
    ],
    stack: ['Prophet', 'Theta', 'MSTL', 'LightGBM', 'Airflow', 'AWS Fargate', 'Docker'],
  },
  {
    name: 'Intelligent Collections 3.0',
    client: 'Water Treatment Brand',
    tag: 'RISK · CLASSIFICATION',
    metrics: [
      { v: '84%',  l: 'AUC due-date' },
      { v: '−38%', l: 'overdue' },
      { v: '+12%', l: 'collections' },
    ],
    details: [
      'XGBoost late-payment model: 50 features selected from 1000+ derived, for 10K+ monthly customers.',
      'Quantile-calibrated risk scoring cut overdue 38%, dropped open AR 15% over two years post go-live.',
      'Short-term AR forecasting (1–6 month horizons) via ARIMA/SARIMA + XGBoost/LightGBM/CatBoost/TCN.',
      '95–98% accuracy across Not Yet Due / Current Due / Over Due, surfaced via interactive Power BI dashboards.',
    ],
    stack: ['XGBoost', 'LightGBM', 'CatBoost', 'TCN', 'ARIMA', 'Power BI'],
  },
  {
    name: 'Cash Flow Forecasting',
    client: 'Power Utility · POC',
    tag: 'B2C · 6M+ CUSTOMERS',
    metrics: [
      { v: '98%', l: 'Cash-In' },
      { v: '93%', l: 'Cash-Out' },
      { v: '6M+', l: 'customers' },
    ],
    details: [
      'End-to-end B2C cash flow forecasting on a 6M+ customer base.',
      'Cash-In accuracy improved 70% → 98%. Cash-Out improved 64% → 93%.',
      'Business insights surfaced via interactive dashboards.',
    ],
    stack: ['Python', 'ML ensembles', 'Dashboards'],
  },
  {
    name: 'Marketing Data Analysis',
    client: 'Liquor Brand · POC',
    tag: 'RFM · ANALYTICS',
    metrics: [
      { v: 'RFM',    l: 'method' },
      { v: 'Churn',  l: 'propensity' },
      { v: 'X-sell', l: 'funnel' },
    ],
    details: [
      'Customer behavior across subscription patterns, marketing campaigns, conversion funnels.',
      'Up-sell, cross-sell, and churn propensity via RFM + advanced analytics.',
      'Drove data-informed growth and retention strategies.',
    ],
    stack: ['RFM', 'Segmentation', 'Analytics'],
  },
];

// Self-projects
export const PROJECTS = [
  {
    name: 'Demographic-Aware Recommender',
    tag: 'EMBEDDINGS · LANGCHAIN',
    dates: 'Jun 2025 — Mar 2026',
    metrics: [
      { v: '97%', l: 'demographic acc' },
      { v: 'HF',  l: 'deployed' },
    ],
    details: [
      'Facial-embedding recommendation engine predicts age, gender, and race with up to 97% accuracy.',
      'Bias-aware LangChain agent wraps the model for personalized, context-sensitive suggestions.',
      'Containerized as a Streamlit app, deployed on Hugging Face Spaces.',
    ],
    stack: ['LangChain', 'Streamlit', 'Docker', 'Hugging Face'],
  },
  {
    name: 'Multi-Agent Travel Planner',
    tag: 'LANGGRAPH · AGENTS',
    dates: 'Jan 2026 — Mar 2026',
    metrics: [
      { v: 'Multi', l: 'agents' },
      { v: 'Live',  l: 'web search' },
    ],
    details: [
      'LangChain + LangGraph orchestrate itinerary, search, and decision agents.',
      'Structured workflows deliver personalized, context-aware travel plans.',
      'Ollama-backed local inference loop.',
    ],
    stack: ['LangChain', 'LangGraph', 'Ollama', 'RAG'],
  },
];

export const SKILLS = {
  'Programming': ['Python', 'SQL', 'R', 'Git', 'GitHub Actions', 'LaTeX', 'Bash'],
  'Cloud':       ['Docker', 'Streamlit', 'Astronomer', 'Airflow', 'AWS Fargate', 'EMR', 'EC2', 'S3'],
  'Libraries':   ['Pandas', 'Polars', 'scikit-learn', 'TensorFlow', 'Keras', 'LangChain', 'LangGraph', 'spaCy', 'Ollama'],
  'Software':    ['Power BI', 'Excel', 'Copilot', 'Claude Code', 'Minitab', 'Maple'],
  'Domains':     ['Time Series', 'Predictive Modeling', 'Classification', 'NLP', 'LLM', 'AI Agents', 'RAG'],
};

export const EDUCATION = [
  {
    short:  'IIT Kanpur',
    degree: 'M.Sc. Statistics',
    dates:  'Aug 2021 — Jul 2023',
    badges: [
      { v: '8.9', l: 'CGPA' },
      { v: '7',   l: 'JAM AIR' },
      { v: '6',   l: 'Dept Rank' },
    ],
  },
  {
    short:  'Bidhannagar College',
    degree: 'B.Sc. Statistics',
    dates:  'Jun 2018 — Jul 2021',
    badges: [
      { v: '9.99', l: 'CGPA' },
      { v: '1',    l: 'Dept Rank' },
    ],
  },
];

// Nav links — order also defines section order
export const NAV_LINKS = [
  { jump: 'hero',  label: 'Overview' },
  { jump: 'exp',   label: 'Work' },
  { jump: 'proj',  label: 'Labs' },
  { jump: 'skill', label: 'Stack' },
  { jump: 'edu',   label: 'Origin' },
];
