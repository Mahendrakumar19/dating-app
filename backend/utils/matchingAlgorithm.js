const User = require('../models/User');

const calculateCompatibilityScore = (user1, user2) => {
  let score = 0;

  // Major compatibility (30% weight)
  if (user1.major === user2.major) {
    score += 30;
  }

  // Year compatibility (20% weight)
  const yearValues = {
    'Integrated': 1,
    'PG 1st': 2,
    'PG 2nd': 3,
    'Graduate': 4,
    'PhD': 5
};
  const yearDiff = Math.abs(yearValues[user1.year] - yearValues[user2.year]);
  if (yearDiff === 0) score += 20;
  else if (yearDiff === 1) score += 15;
  else if (yearDiff === 2) score += 10;

  // Interests compatibility (30% weight)
  const commonInterests = user1.interests.filter(interest =>
    user2.interests.includes(interest)
  );
  const interestScore = Math.min(30, commonInterests.length * 10);
  score += interestScore;

  // Age compatibility (20% weight)
  const ageDiff = Math.abs(user1.age - user2.age);
  if (ageDiff <= 1) score += 20;
  else if (ageDiff <= 3) score += 15;
  else if (ageDiff <= 5) score += 10;

  return score;
};

module.exports = { calculateCompatibilityScore };
