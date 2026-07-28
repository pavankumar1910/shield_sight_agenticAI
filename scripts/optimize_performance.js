#!/usr/bin/env node
/**
 * Performance Testing & Optimization Script
 * Tests page load times, bundle sizes, and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);

class PerformanceOptimizer {
  constructor() {
    this.results = {
      bundleSize: {},
      lighthouse: {},
      recommendations: [],
    };
  }

  async analyzeBundleSize() {
    log('\n📦 Analyzing Bundle Size...', 'cyan');
    
    const distPath = path.join(process.cwd(), 'dist', 'assets');
    
    if (!fs.existsSync(distPath)) {
      log('⚠️  Build not found. Run "npm run build" first.', 'yellow');
      return;
    }

    const files = fs.readdirSync(distPath);
    let totalSize = 0;
    const fileDetails = [];

    files.forEach(file => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalSize += stats.size;

      fileDetails.push({
        name: file,
        size: sizeKB,
        type: file.endsWith('.js') ? 'JavaScript' : file.endsWith('.css') ? 'CSS' : 'Other'
      });
    });

    // Sort by size
    fileDetails.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));

    log('\n📊 Bundle Size Analysis:', 'blue');
    console.log('─'.repeat(80));
    console.log('File Name'.padEnd(50) + 'Size'.padEnd(15) + 'Type');
    console.log('─'.repeat(80));

    fileDetails.forEach(file => {
      const color = parseFloat(file.size) > 200 ? 'red' : parseFloat(file.size) > 100 ? 'yellow' : 'green';
      log(`${file.name.padEnd(50)}${file.size} KB`.padEnd(65) + file.type, color);
    });

    const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log('─'.repeat(80));
    log(`Total Bundle Size: ${totalMB} MB (${(totalSize / 1024).toFixed(2)} KB)`, 
        totalMB < 1 ? 'green' : totalMB < 2 ? 'yellow' : 'red');

    this.results.bundleSize = {
      totalMB,
      files: fileDetails,
    };

    // Recommendations
    if (totalMB > 1.5) {
      this.results.recommendations.push({
        level: 'high',
        message: 'Bundle size exceeds 1.5MB. Consider code splitting and lazy loading.',
      });
    }

    fileDetails.forEach(file => {
      if (parseFloat(file.size) > 200) {
        this.results.recommendations.push({
          level: 'medium',
          message: `Large file detected: ${file.name} (${file.size} KB). Consider splitting or optimizing.`,
        });
      }
    });
  }

  async checkImageOptimization() {
    log('\n🖼️  Checking Image Optimization...', 'cyan');
    
    const publicPath = path.join(process.cwd(), 'public');
    
    if (!fs.existsSync(publicPath)) {
      log('⚠️  Public folder not found.', 'yellow');
      return;
    }

    const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
    const images = this.findFiles(publicPath, imageExts);

    if (images.length === 0) {
      log('✓ No images found in public folder.', 'green');
      return;
    }

    log(`\nFound ${images.length} images:`, 'blue');
    
    images.forEach(img => {
      const stats = fs.statSync(img);
      const sizeKB = (stats.size / 1024).toFixed(2);
      const relativePath = path.relative(publicPath, img);
      
      const color = parseFloat(sizeKB) > 100 ? 'red' : parseFloat(sizeKB) > 50 ? 'yellow' : 'green';
      log(`  ${relativePath.padEnd(40)} ${sizeKB} KB`, color);

      if (parseFloat(sizeKB) > 100) {
        this.results.recommendations.push({
          level: 'medium',
          message: `Optimize image: ${relativePath} (${sizeKB} KB). Use WebP format or reduce quality.`,
        });
      }
    });
  }

  findFiles(dir, exts, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.findFiles(filePath, exts, fileList);
      } else if (exts.some(ext => file.endsWith(ext))) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  }

  async checkDependencies() {
    log('\n📚 Analyzing Dependencies...', 'cyan');
    
    const packagePath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packagePath)) {
      log('⚠️  package.json not found.', 'yellow');
      return;
    }

    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    // Check for heavy dependencies
    const heavyDeps = {
      'moment': 'Use date-fns or day.js instead (smaller)',
      'lodash': 'Use lodash-es or individual imports',
      'axios': 'Consider using native fetch API',
    };

    log('\n⚠️  Heavy Dependencies Check:', 'yellow');
    let foundHeavy = false;

    Object.keys(deps).forEach(dep => {
      if (heavyDeps[dep]) {
        foundHeavy = true;
        log(`  - ${dep}: ${heavyDeps[dep]}`, 'yellow');
        this.results.recommendations.push({
          level: 'low',
          message: `Consider replacing ${dep}: ${heavyDeps[dep]}`,
        });
      }
    });

    if (!foundHeavy) {
      log('  ✓ No known heavy dependencies found.', 'green');
    }
  }

  async testLighthouseScores() {
    log('\n🔍 Running Lighthouse Analysis...', 'cyan');
    log('  (This may take a few minutes)', 'blue');
    
    try {
      // Check if lighthouse is installed
      try {
        execSync('lighthouse --version', { stdio: 'ignore' });
      } catch (e) {
        log('  ⚠️  Lighthouse not installed. Install with: npm install -g lighthouse', 'yellow');
        log('  Skipping Lighthouse analysis...', 'yellow');
        return;
      }

      // Run lighthouse on localhost (assumes dev server is running)
      const url = 'http://localhost:5173';
      log(`  Testing: ${url}`, 'blue');
      
      try {
        const output = execSync(
          `lighthouse ${url} --only-categories=performance,accessibility,best-practices,seo --output=json --quiet`,
          { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
        );
        
        const report = JSON.parse(output);
        const scores = report.categories;

        log('\n📊 Lighthouse Scores:', 'blue');
        console.log('─'.repeat(50));
        
        Object.entries(scores).forEach(([category, data]) => {
          const score = Math.round(data.score * 100);
          const color = score >= 90 ? 'green' : score >= 50 ? 'yellow' : 'red';
          const emoji = score >= 90 ? '✅' : score >= 50 ? '⚠️' : '❌';
          
          log(`${emoji} ${data.title.padEnd(20)} ${score}/100`, color);
        });
        
        console.log('─'.repeat(50));

        this.results.lighthouse = scores;

        // Add recommendations based on scores
        Object.entries(scores).forEach(([category, data]) => {
          const score = Math.round(data.score * 100);
          if (score < 90) {
            this.results.recommendations.push({
              level: score < 50 ? 'high' : 'medium',
              message: `${data.title} score is ${score}/100. Review and optimize.`,
            });
          }
        });

      } catch (e) {
        log('  ⚠️  Could not run Lighthouse. Make sure dev server is running.', 'yellow');
        log('  Start dev server: npm run dev', 'yellow');
      }

    } catch (error) {
      log('  ⚠️  Lighthouse test failed: ' + error.message, 'yellow');
    }
  }

  async generateReport() {
    log('\n\n' + '═'.repeat(80), 'cyan');
    log('📋 OPTIMIZATION RECOMMENDATIONS', 'cyan');
    log('═'.repeat(80), 'cyan');

    if (this.results.recommendations.length === 0) {
      log('\n✅ Great! No major optimization issues found.', 'green');
      log('   Your application is well-optimized.', 'green');
      return;
    }

    // Group by priority
    const high = this.results.recommendations.filter(r => r.level === 'high');
    const medium = this.results.recommendations.filter(r => r.level === 'medium');
    const low = this.results.recommendations.filter(r => r.level === 'low');

    if (high.length > 0) {
      log('\n🔴 HIGH PRIORITY:', 'red');
      high.forEach((rec, i) => {
        log(`  ${i + 1}. ${rec.message}`, 'red');
      });
    }

    if (medium.length > 0) {
      log('\n🟡 MEDIUM PRIORITY:', 'yellow');
      medium.forEach((rec, i) => {
        log(`  ${i + 1}. ${rec.message}`, 'yellow');
      });
    }

    if (low.length > 0) {
      log('\n🟢 LOW PRIORITY (Nice to have):', 'green');
      low.forEach((rec, i) => {
        log(`  ${i + 1}. ${rec.message}`, 'green');
      });
    }

    log('\n' + '═'.repeat(80), 'cyan');
  }

  async saveReport() {
    const reportPath = path.join(process.cwd(), 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    log(`\n💾 Full report saved to: ${reportPath}`, 'blue');
  }

  async run() {
    log('\n' + '═'.repeat(80), 'cyan');
    log('🚀 SHIELDSIGHT PERFORMANCE OPTIMIZATION TOOL', 'cyan');
    log('═'.repeat(80), 'cyan');
    
    await this.analyzeBundleSize();
    await this.checkImageOptimization();
    await this.checkDependencies();
    await this.testLighthouseScores();
    await this.generateReport();
    await this.saveReport();
    
    log('\n✅ Performance analysis complete!\n', 'green');
  }
}

// Run the optimizer
const optimizer = new PerformanceOptimizer();
optimizer.run().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});
