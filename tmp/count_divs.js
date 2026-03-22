const fs = require('fs');
const content = fs.readFileSync('d:/ERP-Zone/youtube-LMS/loomgrad/src/components/challenges/ChallengeSolver.tsx', 'utf8');
const opens = (content.match(/<div(?!\/)/g) || []).length;
const selfCloses = (content.match(/<div[^>]*\/>/g) || []).length;
const standardOpens = opens - selfCloses;
const closes = (content.match(/<\/div>/g) || []).length;
console.log('Standard Opens:', standardOpens, 'Closes:', closes, 'Self-Closes:', selfCloses);
if (standardOpens !== closes) console.log('Difference:', standardOpens - closes);
