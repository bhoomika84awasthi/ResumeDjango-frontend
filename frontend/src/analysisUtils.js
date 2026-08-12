export const SKILL_CATEGORY_MAP = {
  'Python': 'Programming',
  'JavaScript': 'Programming',
  'TypeScript': 'Programming',
  'Java': 'Programming',
  'C++': 'Programming',
  'C#': 'Programming',
  'Go': 'Programming',
  'PHP': 'Programming',
  'Ruby': 'Programming',
  'React.js': 'Frontend',
  'HTML': 'Frontend',
  'CSS': 'Frontend',
  'Next.js': 'Frontend',
  'Node.js': 'Backend',
  'Express.js': 'Backend',
  'Django': 'Backend',
  'Flask': 'Backend',
  'FastAPI': 'Backend',
  'Spring Boot': 'Backend',
  'REST API': 'Backend',
  'SQL': 'Database',
  'MongoDB': 'Database',
  'PostgreSQL': 'Database',
  'MySQL': 'Database',
  'Redis': 'Database',
  'Git': 'Tools',
  'Postman': 'Tools',
  'Docker': 'Tools',
  'AWS': 'Tools',
  'Kubernetes': 'Tools',
  'Linux': 'Tools',
  'Figma': 'Tools',
  'UI/UX': 'Frontend',
  'Machine Learning': 'AI/ML',
  'Pandas': 'AI/ML',
  'NumPy': 'AI/ML',
  'TensorFlow': 'AI/ML',
  'PyTorch': 'AI/ML',
  'Data Analysis': 'AI/ML',
  'Agile': 'General',
  'Scrum': 'General',
  'Leadership': 'General',
  'Communication': 'General',
  'Project Management': 'General',
  'Full Stack': 'General',
};

export const SKILL_ALIASES = {
  'Python': ['python', 'python3'],
  'JavaScript': ['javascript', 'js'],
  'TypeScript': ['typescript', 'ts'],
  'Java': ['java'],
  'C++': ['c++', 'cpp'],
  'C#': ['c#', 'csharp'],
  'Go': ['go', 'golang'],
  'PHP': ['php'],
  'Ruby': ['ruby'],
  'React.js': ['react', 'react.js', 'reactjs', 'react-js'],
  'HTML': ['html', 'html5'],
  'CSS': ['css', 'css3'],
  'Next.js': ['next.js', 'nextjs', 'next-js'],
  'Node.js': ['node', 'node.js', 'nodejs', 'node-js'],
  'Express.js': ['express', 'express.js', 'expressjs', 'express-js'],
  'Django': ['django'],
  'Flask': ['flask'],
  'FastAPI': ['fastapi'],
  'Spring Boot': ['spring boot', 'springboot'],
  'REST API': ['rest api', 'rest apis', 'restful api', 'restful apis'],
  'SQL': ['sql', 'structured query language'],
  'MongoDB': ['mongodb'],
  'PostgreSQL': ['postgresql', 'postgres'],
  'MySQL': ['mysql'],
  'Redis': ['redis'],
  'Git': ['git', 'github'],
  'Postman': ['postman'],
  'Docker': ['docker'],
  'AWS': ['aws', 'amazon web services'],
  'Kubernetes': ['kubernetes', 'k8s'],
  'Linux': ['linux'],
  'Figma': ['figma'],
  'UI/UX': ['ui ux', 'ui/ux', 'ux ui'],
  'Machine Learning': ['machine learning', 'ml'],
  'Pandas': ['pandas', 'panda'],
  'NumPy': ['numpy', 'np'],
  'TensorFlow': ['tensorflow', 'tf'],
  'PyTorch': ['pytorch', 'torch'],
  'Data Analysis': ['data analysis'],
  'Agile': ['agile'],
  'Scrum': ['scrum'],
  'Leadership': ['leadership'],
  'Communication': ['communication'],
  'Project Management': ['project management'],
  'Full Stack': ['full stack', 'full-stack'],
};

export function normalizeText(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getScoreBand(score) {
  if (score >= 90) return { label: 'Excellent Match', description: '90-100% = Excellent Match' };
  if (score >= 75) return { label: 'Strong Match', description: '75-89% = Strong Match' };
  if (score >= 60) return { label: 'Moderate Match', description: '60-74% = Moderate Match' };
  if (score >= 40) return { label: 'Low Match', description: '40-59% = Low Match' };
  return { label: 'Poor Match', description: '0-39% = Poor Match' };
}

export function calculateSkillBreakdown(jobSkills = [], resumeSkills = []) {
  const resumeSet = new Set(resumeSkills);
  const categories = {};

  jobSkills.forEach((skill) => {
    const category = SKILL_CATEGORY_MAP[skill] || 'General';
    if (!categories[category]) {
      categories[category] = { name: category, matched: 0, total: 0 };
    }
    categories[category].total += 1;
    if (resumeSet.has(skill)) {
      categories[category].matched += 1;
    }
  });

  return Object.values(categories).map((category) => ({
    ...category,
    percent: category.total ? Math.round((category.matched / category.total) * 100) : 0,
  }));
}

export function buildResumeStrengths(resumeSkills = [], jobSkills = []) {
  const matchedSkills = resumeSkills.filter((skill) => jobSkills.includes(skill));
  const strengthMap = {
    'Python': 'Strong Python experience',
    'JavaScript': 'Strong JavaScript experience',
    'TypeScript': 'Strong TypeScript experience',
    'React.js': 'React.js experience',
    'Node.js': 'Node.js experience',
    'Express.js': 'Express.js experience',
    'REST API': 'REST API experience',
    'SQL': 'SQL knowledge',
    'MongoDB': 'MongoDB experience',
    'Git': 'Git collaboration experience',
    'Docker': 'Docker experience',
    'AWS': 'Cloud deployment experience',
    'Machine Learning': 'Machine Learning experience',
    'Pandas': 'Data Analysis experience',
    'NumPy': 'Numerical analysis experience',
    'Data Analysis': 'Data Analysis experience',
  };

  const strengths = [];
  matchedSkills.forEach((skill) => {
    if (strengthMap[skill]) {
      strengths.push(`✓ ${strengthMap[skill]}`);
    }
  });

  return strengths.slice(0, 5);
}

export function buildKeywordFrequency(resumeText = '', jobSkills = []) {
  const normalizedText = normalizeText(resumeText);
  const frequency = [];

  jobSkills.forEach((skill) => {
    const aliasPatterns = (SKILL_ALIASES[skill] || [skill]).map((alias) => {
      const cleaned = alias
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\s+/g, '\\s+');
      return `\\b${cleaned}\\b`;
    });

    const total = aliasPatterns.reduce((count, pattern) => {
      const matches = normalizedText.match(new RegExp(pattern, 'gi')) || [];
      return count + matches.length;
    }, 0);

    if (total > 0) {
      frequency.push({ skill, count: total });
    }
  });

  return frequency.sort((a, b) => b.count - a.count).slice(0, 8);
}

export function analyzeExperienceMatch(jobDescription = '', resumeText = '') {
  const requiredMatch = jobDescription.match(/(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)/i);
  const resumeMatch = resumeText.match(/(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)/i);

  if (!requiredMatch) {
    return {
      required: 'Experience requirement could not be reliably determined.',
      candidate: 'Experience could not be reliably determined.',
      status: 'Not enough evidence',
    };
  }

  const requiredValue = Number(requiredMatch[1]);
  const candidateValue = resumeMatch ? Number(resumeMatch[1]) : null;

  if (candidateValue === null) {
    return {
      required: `${requiredMatch[1]}+ years`,
      candidate: 'No experience value detected in the resume',
      status: 'Needs review',
    };
  }

  if (candidateValue >= requiredValue) {
    return {
      required: `${requiredMatch[1]}+ years`,
      candidate: `${candidateValue} years`,
      status: '✓ Match',
    };
  }

  return {
    required: `${requiredMatch[1]}+ years`,
    candidate: `${candidateValue} years`,
    status: '△ Needs improvement',
  };
}

export function analyzeEducationMatch(jobDescription = '', resumeEducation = []) {
  const requirementText = jobDescription.toLowerCase();
  const educationMatch = /(bachelor|master|degree|btech|mca|bca|mba|phd|diploma)/i.test(requirementText);

  if (!educationMatch) {
    return {
      required: 'Education requirement not explicitly stated.',
      candidate: resumeEducation.length ? resumeEducation.join(', ') : 'No education section detected.',
      status: 'No explicit requirement found',
    };
  }

  const resumeText = resumeEducation.join(' ');
  const hasEducation = /(bachelor|master|degree|btech|mca|bca|mba|phd|diploma)/i.test(resumeText);

  return {
    required: 'Bachelor\'s/Master\'s degree or equivalent',
    candidate: resumeEducation.length ? resumeEducation.join(', ') : 'No education section detected.',
    status: hasEducation ? '✓ Education requirement satisfied' : '⚠ Education requirement not clearly satisfied',
  };
}

export function buildResumeQualityChecklist(resume = {}) {
  const contactInfo = resume.contact_info || {};
  const education = resume.education || [];
  const experience = resume.experience || [];
  const skills = resume.skills || [];

  return [
    { label: 'Contact Information', present: Boolean(contactInfo.email || contactInfo.phone || contactInfo.linkedin || contactInfo.github) },
    { label: 'Email', present: Boolean(contactInfo.email) },
    { label: 'Phone', present: Boolean(contactInfo.phone) },
    { label: 'LinkedIn', present: Boolean(contactInfo.linkedin) },
    { label: 'GitHub', present: Boolean(contactInfo.github) },
    { label: 'Professional Summary', present: Boolean(resume.name || (resume.extracted_text || '').length > 0) },
    { label: 'Skills', present: skills.length > 0 },
    { label: 'Experience', present: experience.length > 0 },
    { label: 'Projects', present: (resume.extracted_text || '').toLowerCase().includes('project') },
    { label: 'Education', present: education.length > 0 },
  ];
}

export function buildAnalysisSummary(matchScore, matchedSkills = [], missingSkills = []) {
  const topSkills = matchedSkills.slice(0, 4).join(', ');
  const topMissing = missingSkills.slice(0, 2).join(', ');

  if (!matchedSkills.length && missingSkills.length) {
    return `Your resume has a ${matchScore}% match with this position. The main gaps are ${missingSkills.slice(0, 2).join(', ')}.`;
  }

  if (!missingSkills.length) {
    return `Your resume has a ${matchScore}% match with this position. You have strong experience in ${topSkills}.`;
  }

  return `Your resume has a ${matchScore}% match with this position. You have strong experience in ${topSkills}. The main gaps are ${topMissing}.`;
}

export function buildFallbackSuggestions(missingSkills = [], matchedSkills = []) {
  const suggestions = [];

  if (missingSkills.length) {
    missingSkills.slice(0, 2).forEach((skill) => {
      suggestions.push({
        title: `Add ${skill} experience if you genuinely have it.`,
        reason: `${skill} is mentioned as a requirement in the job description.`,
      });
    });
  }

  if (matchedSkills.length) {
    matchedSkills.slice(0, 2).forEach((skill) => {
      suggestions.push({
        title: `Highlight your ${skill} experience.`,
        reason: `${skill} is one of the core requirements for this position.`,
      });
    });
  }

  return suggestions.slice(0, 4);
}
