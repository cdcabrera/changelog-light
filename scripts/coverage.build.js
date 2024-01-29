const fs = require('fs');
const path = require('path');

/**
 * Add release coverage totals to package.json for dynamic badge display.
 *
 * @param {object} options
 * @param {string} options.coverageJson
 * @param {string} options.packageJson
 */
const addCoverageTotals = ({
  coverageJson = path.join(process.cwd(), 'coverage/coverage-summary.json'),
  packageJson = path.join(process.cwd(), 'package.json')
} = {}) => {
  try {
    if (!fs.existsSync(coverageJson) || !fs.existsSync(packageJson)) {
      return;
    }
    const { total } = require(coverageJson);
    const resultJsonStr = fs.readFileSync(packageJson);
    const resultJson = { ...JSON.parse(resultJsonStr.toString()) };

    resultJson.coverage = { ...total?.lines };
    fs.writeFileSync(packageJson, JSON.stringify(resultJson, null, 2) + '\n');
  } catch (e) {
    console.error(new Error(`Add coverage totals: ${e.message}`));
  }
};

addCoverageTotals();
