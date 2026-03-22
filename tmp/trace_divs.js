const fs = require('fs');
const content = fs.readFileSync('d:/ERP-Zone/youtube-LMS/loomgrad/src/components/challenges/ChallengeSolver.tsx', 'utf8');
const lines = content.split('\n');
let balance = 0;
lines.forEach((line, i) => {
    const opens = (line.match(/<div(?![^>]*\/>)(?![^>]*\/div>)/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    const selfCloses = (line.match(/<div[^>]*\/>/g) || []).length;
    balance += opens - closes;
    if (opens !== 0 || closes !== 0) {
        // console.log(`${i+1}: Balance ${balance} (+${opens} -${closes})`);
    }
});
console.log('Final Balance:', balance);
