const fs = require('fs');
const { SourceMapConsumer } = require('source-map');

(async () => {
  const mapPath = 'dist/assets/core-DG2aLj1V.js.map';
  if (!fs.existsSync(mapPath)) {
    console.log('Map file not found');
    return;
  }
  
  const rawSourceMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  
  await SourceMapConsumer.with(rawSourceMap, null, consumer => {
    const pos = consumer.originalPositionFor({
      line: 40,
      column: 234
    });
    
    console.log('ORIGINAL POSITION:');
    console.log(pos);
  });
})();
