'use strict';

const axios = require('axios');
const logger = require('../config/logger');

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const SERPAPI_BASE = 'https://serpapi.com/search.json';

/**
 * Search Google Jobs via SerpAPI
 * @param {string} query - Job search query built from user skills
 * @param {string} [location='United States'] - Location for search
 * @param {number} [start=0] - Pagination offset
 * @returns {Promise<Array>} Normalized job listings
 */
const searchGoogleJobs = async (query, location = 'India', start = 0) => {
  if (!SERPAPI_KEY) {
    logger.warn('SerpAPI key not configured, returning empty results');
    return { jobs: [], total: 0 };
  }

  try {
    const { data } = await axios.get(SERPAPI_BASE, {
      params: {
        engine: 'google_jobs',
        q: query,
        location,
        api_key: SERPAPI_KEY,
        start,
        hl: 'en',
      },
      timeout: 15000,
    });

    const rawJobs = data.jobs_results || [];
    const jobs = rawJobs.map((job, idx) => ({
      id: `serp-${Date.now()}-${idx}`,
      title: job.title || '',
      company: job.company_name || 'Unknown',
      location: job.location || 'Remote',
      description: job.description || '',
      salary: job.detected_extensions?.salary || job.extensions?.find(e => e.includes('$') || e.includes('₹')) || 'Not Specified',
      posted: job.detected_extensions?.posted_at || '',
      schedule: job.detected_extensions?.schedule_type || '',
      apply_url: job.apply_options?.[0]?.link || job.share_link || '',
      source: job.apply_options?.[0]?.title || 'Google Jobs',
      thumbnail: job.thumbnail || null,
      highlights: job.job_highlights || [],
      skills: extractSkillsFromDescription(job.description || ''),
    }));

    logger.info(`SerpAPI: Found ${jobs.length} jobs for query "${query}"`);
    return { jobs, total: jobs.length, hasMore: rawJobs.length >= 10 };
  } catch (err) {
    logger.error(`SerpAPI Error: ${err.message}`);
    return { jobs: [], total: 0, hasMore: false };
  }
};

const TECH_KEYWORDS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'rust', 'golang', 'ruby', 'php',
  'react', 'angular', 'vue', 'next.js', 'svelte', 'node.js', 'express', 'django',
  'flask', 'spring', 'mongodb', 'postgresql', 'mysql', 'redis', 'aws', 'azure', 'gcp',
  'docker', 'kubernetes', 'graphql', 'rest api', 'ci/cd', 'git', 'machine learning',
  'deep learning', 'tensorflow', 'pytorch', 'sql', 'nosql', 'html', 'css', 'sass',
];

const extractSkillsFromDescription = (desc) => {
  if (!desc) return [];
  const lower = desc.toLowerCase();
  return TECH_KEYWORDS.filter(skill => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?<!\\w)${escaped}(?!\\w)`, 'i').test(lower);
  });
};

/**
 * Build a search query from user skills for job matching
 * @param {string[]} skills - User's parsed skills
 * @returns {string} Optimized search query
 */
const buildQueryFromSkills = (skills) => {
  if (!skills || skills.length === 0) return 'software developer';
  // Take top 5 most relevant skills
  const topSkills = skills.slice(0, 5).join(' ');
  return `${topSkills} developer engineer`;
};

/**
 * Match user skills against SerpAPI job results and compute match scores
 */
const matchJobsWithSkills = (jobs, userSkills) => {
  const normSkills = userSkills.map(s => s.toLowerCase().trim());

  return jobs.map(job => {
    const jobSkills = job.skills || [];
    let matchScore = 0;

    if (jobSkills.length > 0) {
      const overlaps = jobSkills.filter(s => normSkills.includes(s));
      matchScore = Math.round((overlaps.length / Math.max(jobSkills.length, 1)) * 100);
    } else if (job.description) {
      const descLower = job.description.toLowerCase();
      let matchedCount = 0;
      for (const skill of normSkills) {
        if (descLower.includes(skill)) matchedCount++;
      }
      matchScore = Math.round((matchedCount / normSkills.length) * 100);
    }

    return { ...job, matchScore, matchedSkills: normSkills.filter(s => (job.description || '').toLowerCase().includes(s)) };
  })
    .filter(j => j.matchScore >= 30)
    .sort((a, b) => b.matchScore - a.matchScore);
};

module.exports = { searchGoogleJobs, buildQueryFromSkills, matchJobsWithSkills, extractSkillsFromDescription };
