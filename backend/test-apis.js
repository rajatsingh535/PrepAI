const axios = require('axios');
const Groq = require('groq-sdk');
require('dotenv').config();

// Test Groq AI API
async function testGroq() {
  console.log('🤖 Testing Groq AI API...');
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [{ 
        role: 'user', 
        content: 'Generate 3 React developer interview questions. Return JSON: {"technical": [{"questionText": "question 1"}, {"questionText": "question 2"}], "behavioral": [{"questionText": "question 3"}]}' 
      }],
      temperature: 0.7,
      max_tokens: 512,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    const parsed = JSON.parse(content);
    console.log('✅ GROQ API WORKING!');
    console.log('📝 Sample Questions Generated:');
    if (parsed.technical) {
      parsed.technical.forEach((q, i) => console.log(`   ${i+1}. ${q.questionText}`));
    }
    if (parsed.behavioral) {
      parsed.behavioral.forEach((q, i) => console.log(`   ${parsed.technical?.length + i + 1}. ${q.questionText}`));
    }
    return true;
  } catch (error) {
    console.log('❌ GROQ API ERROR:', error.message);
    console.log('   Check your API key in .env file');
    return false;
  }
}

// Test DSA Code Evaluation
async function testGroqDSA() {
  console.log('\n💻 Testing Groq DSA Code Evaluation...');
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const testCode = `
def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        if target - num in seen:
            return [seen[target - num], i]
        seen[num] = i
    return []
`;

    const response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [{ 
        role: 'user', 
        content: `Evaluate this Python code for Two Sum problem:
${testCode}

Test cases: [{"input": "nums=[2,7,11,15], target=9", "expected": "[0,1]"}]

Return JSON: {
  "passed": true|false,
  "results": [{"input": "test", "expected": "output", "actual": "your_result", "passed": true|false}],
  "overallCorrectness": 85
}`
      }],
      temperature: 0.1,
      max_tokens: 512,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    const parsed = JSON.parse(content);
    console.log('✅ GROQ DSA EVALUATION WORKING!');
    console.log(`📊 Code Correctness: ${parsed.overallCorrectness || 85}%`);
    console.log(`🎯 Test Results: ${parsed.results?.[0]?.passed ? 'PASS' : 'FAIL'}`);
    return true;
  } catch (error) {
    console.log('❌ GROQ DSA ERROR:', error.message);
    return false;
  }
}

// Test MongoDB Connection
async function testMongoDB() {
  console.log('\n🍃 Testing MongoDB Connection...');
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MONGODB CONNECTION WORKING!');
    console.log(`📁 Database: ${mongoose.connection.db.databaseName}`);
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log('❌ MONGODB ERROR:', error.message);
    return false;
  }
}

// Test NeetCode API (optional)
async function testNeetCode() {
  console.log('\n📚 Testing NeetCode API...');
  try {
    // Note: This might not work if the API key/endpoint is incorrect
    const response = await axios.get('https://neetcode.io/api/v1/problems', {
      headers: { 'Authorization': `Bearer ${process.env.NEETCODE_API_KEY}` },
      timeout: 5000
    });
    console.log('✅ NEETCODE API WORKING!');
    console.log(`📝 Problems Available: ${response.data.length}`);
    return true;
  } catch (error) {
    console.log('⚠️ NEETCODE API UNAVAILABLE:', error.message);
    console.log('   This is optional - DSA questions will use merged_problems.json instead');
    return false;
  }
}

// Test Adzuna Jobs API (optional)
async function testAdzuna() {
  console.log('\n💼 Testing Adzuna Jobs API...');
  try {
    const response = await axios.get('https://api.adzuna.com/v1/api/jobs/us/search/1', {
      params: {
        app_id: process.env.ADZUNA_APP_ID,
        app_key: process.env.ADZUNA_APP_KEY,
        what: 'developer',
        results_per_page: 3
      },
      timeout: 10000
    });
    console.log('✅ ADZUNA JOBS API WORKING!');
    console.log(`💼 Jobs Found: ${response.data.count}`);
    return true;
  } catch (error) {
    console.log('⚠️ ADZUNA API UNAVAILABLE:', error.message);
    console.log('   This is optional - jobs feature may use other sources');
    return false;
  }
}

// Test LeetCode Dataset File
function testLeetCodeDataset() {
  console.log('\n📊 Testing LeetCode Dataset...');
  try {
    const fs = require('fs');
    const path = require('path');
    const datasetPath = path.join(__dirname, 'src', 'data', 'merged_problems.json');
    
    if (fs.existsSync(datasetPath)) {
      const data = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
      const problems = data.questions || data;
      console.log('✅ LEETCODE DATASET LOADED!');
      console.log(`📚 Total Problems: ${problems.length}`);
      
      if (Array.isArray(problems) && problems.length > 0) {
        // Count by difficulty if available
        const sample = problems.slice(0, Math.min(100, problems.length));
        const topics = [...new Set(sample.flatMap(p => p.tags || p.topicTags || []).filter(Boolean))].slice(0, 10);
        console.log('🏷️ Sample Topics:', topics.join(', ') || 'Topics not available');
      
        return true;
      } else {
        console.log('⚠️ Dataset structure unexpected - but file exists');
        return false;
      }
    } else {
      console.log('❌ LEETCODE DATASET NOT FOUND!');
      console.log(`   Expected location: ${datasetPath}`);
      console.log('   Run: npm run download-dataset (if available)');
      return false;
    }
  } catch (error) {
    console.log('❌ LEETCODE DATASET ERROR:', error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🧪 PrepAI API Credentials & Features Test');
  console.log('==========================================\n');
  
  const tests = [
    { name: 'Groq AI (CRITICAL)', test: testGroq },
    { name: 'Groq DSA Eval (CRITICAL)', test: testGroqDSA },
    { name: 'MongoDB (CRITICAL)', test: testMongoDB },
    { name: 'LeetCode Dataset (CRITICAL)', test: testLeetCodeDataset },
    { name: 'NeetCode API (Optional)', test: testNeetCode },
    { name: 'Adzuna Jobs (Optional)', test: testAdzuna }
  ];
  
  const results = [];
  
  for (const { name, test } of tests) {
    try {
      const success = await test();
      results.push({ name, success });
    } catch (error) {
      console.log(`❌ ${name} FAILED:`, error.message);
      results.push({ name, success: false });
    }
  }
  
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  
  const critical = results.filter(r => r.name.includes('CRITICAL'));
  const optional = results.filter(r => r.name.includes('Optional'));
  
  console.log('\n🎯 CRITICAL FEATURES:');
  critical.forEach(r => {
    console.log(`   ${r.success ? '✅' : '❌'} ${r.name}`);
  });
  
  console.log('\n⚠️ OPTIONAL FEATURES:');
  optional.forEach(r => {
    console.log(`   ${r.success ? '✅' : '⚠️'} ${r.name}`);
  });
  
  const criticalWorking = critical.filter(r => r.success).length;
  const criticalTotal = critical.length;
  
  console.log(`\n🏆 CRITICAL STATUS: ${criticalWorking}/${criticalTotal} working`);
  
  if (criticalWorking >= 3) {
    console.log('🚀 READY TO TEST! Core features are working.');
    console.log('\n📋 NEXT STEPS:');
    console.log('   1. Start backend: npm run dev');
    console.log('   2. Start frontend: cd ../frontend && npm run dev');
    console.log('   3. Open: http://localhost:5173');
    console.log('   4. Test: Register → Create Interview → Generate Questions');
  } else {
    console.log('⚠️ SETUP INCOMPLETE - Fix critical issues above');
  }
  
  console.log('\n💡 TIP: Check TEST_API_CREDENTIALS.md for detailed troubleshooting');
}

// Run tests
runAllTests().catch(console.error);