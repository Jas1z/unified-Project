# CI/CD Integration Guide

This guide explains how to integrate the Appium testing framework into your CI/CD pipeline.

## Supported CI/CD Platforms

- ✅ GitHub Actions
- ✅ GitLab CI
- ✅ Azure Pipelines
- ✅ Jenkins
- ✅ CircleCI

## GitHub Actions Setup

### 1. Create Workflow File

Create `.github/workflows/appium-tests.yml`:

```yaml
name: Appium E2E Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install Appium
      run: npm install -g appium
    
    - name: Setup Android SDK
      uses: android-actions/setup-android@v2
      with:
        api-level: 33
        target: google_apis
        arch: x86_64
        ndk-version: 25.1.8937393
    
    - name: Start Emulator
      run: |
        echo "Starting emulator..."
        $ANDROID_HOME/emulator/emulator -avd test_emulator -no-window -no-audio &
        adb wait-for-device
    
    - name: Install Dependencies
      working-directory: ./appium-tests
      run: npm install
    
    - name: Setup Environment
      working-directory: ./appium-tests
      run: |
        cp .env.example .env
        sed -i 's/ANDROID_DEVICE_NAME=.*/ANDROID_DEVICE_NAME=emulator-5554/' .env
    
    - name: Start Appium Server
      run: appium &
    
    - name: Wait for Appium
      run: sleep 5
    
    - name: Run Tests
      working-directory: ./appium-tests
      run: npm run test
      continue-on-error: true
    
    - name: Upload Reports
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: appium-reports
        path: appium-tests/reports/
    
    - name: Comment PR with Results
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v6
      with:
        script: |
          const fs = require('fs');
          // Parse and comment with results
```

### 2. Required Secrets (Optional)

For cloud-based testing, add GitHub secrets:
- `BROWSERSTACK_USERNAME`
- `BROWSERSTACK_ACCESS_KEY`

## GitLab CI Setup

### Create `.gitlab-ci.yml`:

```yaml
stages:
  - test

appium_tests:
  stage: test
  image: ubuntu:latest
  
  services:
    - docker:dind
  
  before_script:
    - apt-get update
    - apt-get install -y curl gnupg
    - curl -fsSL https://nodejs.org/dist/v18.0.0/node-v18.0.0-linux-x64.tar.xz | tar xJ -C /usr/local --strip-components=1
    - npm install -g appium
  
  script:
    - cd appium-tests
    - npm install
    - cp .env.example .env
    - npm run test
  
  artifacts:
    when: always
    paths:
      - appium-tests/reports/
    expire_in: 30 days
  
  allow_failure: true
```

## Azure Pipelines Setup

### Create `azure-pipelines.yml`:

```yaml
trigger:
  - main
  - develop

pr:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'
  displayName: 'Install Node.js'

- script: npm install -g appium
  displayName: 'Install Appium'

- task: JavaToolInstaller@0
  inputs:
    versionSpec: '11'
    jdkArchitectureOption: 'x64'
  displayName: 'Setup JDK'

- bash: |
    cd appium-tests
    npm install
    cp .env.example .env
  displayName: 'Setup Project'

- bash: |
    appium &
    sleep 5
  displayName: 'Start Appium'

- bash: |
    cd appium-tests
    npm run test
  displayName: 'Run Tests'
  continueOnError: true

- task: PublishBuildArtifacts@1
  inputs:
    pathToPublish: 'appium-tests/reports'
    artifactName: 'appium-reports'
  condition: always()
```

## Jenkins Setup

### Jenkinsfile:

```groovy
pipeline {
    agent any
    
    stages {
        stage('Setup') {
            steps {
                script {
                    sh '''
                        npm install -g appium
                        cd appium-tests
                        npm install
                        cp .env.example .env
                    '''
                }
            }
        }
        
        stage('Appium Server') {
            steps {
                script {
                    sh 'appium &'
                    sleep(5)
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                script {
                    sh 'cd appium-tests && npm run test'
                }
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'appium-tests/reports/**', 
                           allowEmptyArchive: true
            
            publishHTML([
                reportDir: 'appium-tests/reports',
                reportFiles: '*.xlsx',
                reportName: 'Appium Test Report'
            ])
        }
    }
}
```

## CircleCI Setup

### Create `.circleci/config.yml`:

```yaml
version: 2.1

jobs:
  test:
    machine:
      image: ubuntu-2204:current
    
    steps:
      - checkout
      
      - run:
          name: Setup Node.js
          command: |
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
      
      - run:
          name: Install Appium
          command: npm install -g appium
      
      - run:
          name: Setup Project
          command: |
            cd appium-tests
            npm install
            cp .env.example .env
      
      - run:
          name: Start Appium
          command: appium &
          background: true
      
      - run:
          name: Wait for Appium
          command: sleep 5
      
      - run:
          name: Run Tests
          command: cd appium-tests && npm run test
          no_output_timeout: 60m
      
      - store_artifacts:
          path: appium-tests/reports
          destination: appium-reports

workflows:
  test:
    jobs:
      - test:
          filters:
            branches:
              only:
                - main
                - develop
```

## Docker Setup

### Dockerfile for Testing:

```dockerfile
FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    openjdk-11-jdk \
    curl \
    git \
    unzip \
    wget

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Install Appium
RUN npm install -g appium

# Install Android SDK
ENV ANDROID_HOME=/opt/android-sdk
RUN mkdir -p $ANDROID_HOME && \
    wget https://dl.google.com/android/repository/sdk-tools-linux-*.zip && \
    unzip sdk-tools-linux-*.zip -d $ANDROID_HOME && \
    rm sdk-tools-linux-*.zip

# Copy test code
COPY appium-tests /app/appium-tests
WORKDIR /app/appium-tests

# Install dependencies
RUN npm install

# Setup environment
RUN cp .env.example .env

# Expose Appium port
EXPOSE 4723

# Start Appium and run tests
CMD ["bash", "-c", "appium & sleep 5 && npm run test"]
```

Build and run:
```bash
docker build -t ehr-appium-tests .
docker run -p 4723:4723 ehr-appium-tests
```

## Cloud Testing Services Integration

### BrowserStack Integration

```bash
# Install BrowserStack CLI
npm install -g browserstack-local

# Export credentials
export BROWSERSTACK_USERNAME=your_username
export BROWSERSTACK_ACCESS_KEY=your_key

# Update .env
APPIUM_HOST=hub.browserstack.com
APPIUM_PORT=4723
BROWSERSTACK_LOCAL=true
BROWSERSTACK_DEBUG=true
```

### Sauce Labs Integration

```bash
# Update .env
APPIUM_HOST=ondemand.saucelabs.com
APPIUM_PORT=443
SAUCE_USERNAME=your_username
SAUCE_ACCESS_KEY=your_key
```

## Test Report Integration

### Slack Notifications

```yaml
# GitHub Actions example
- name: Send Slack Notification
  if: always()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "Appium Tests: ${{ job.status }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Test Results*\nStatus: ${{ job.status }}"
            }
          }
        ]
      }
```

### Email Reports

```python
# Python script to send reports
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email import encoders

def send_report(recipient, report_path):
    msg = MIMEMultipart()
    msg['From'] = 'ci@example.com'
    msg['To'] = recipient
    msg['Subject'] = 'Appium Test Report'
    
    # Add message body
    msg.attach(MIMEText('Please find the test report attached.'))
    
    # Attach report
    with open(report_path, 'rb') as attachment:
        part = MIMEBase('application', 'octet-stream')
        part.set_payload(attachment.read())
        encoders.encode_base64(part)
        part.add_header(
            'Content-Disposition',
            f'attachment; filename= {report_path}'
        )
        msg.attach(part)
    
    # Send email
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login('your_email@gmail.com', 'your_password')
    server.send_message(msg)
    server.quit()

send_report('team@example.com', 'reports/test-report.xlsx')
```

## Best Practices for CI/CD

### 1. Test Isolation
```bash
# Clear app data before each test run
adb shell pm clear com.anonymous.ehrmobile

# Remove emulator snapshots
rm -rf ~/.android/avd/*/snapshots
```

### 2. Timeout Management
```yaml
# Set appropriate timeouts
timeout: 60m  # Sufficient for full test suite
  
# In .env for CI
TEST_TIMEOUT=45000
IMPLICIT_WAIT=15000
```

### 3. Artifact Management
```yaml
# Archive reports
artifacts:
  - appium-tests/reports/**
  - appium-tests/build/**
  
# Keep for X days
retention: 30 days
```

### 4. Conditional Execution
```yaml
# Only run tests on specific branches
if: |
  github.ref == 'refs/heads/main' ||
  github.ref == 'refs/heads/develop' ||
  github.event_name == 'pull_request'
```

### 5. Health Checks
```bash
# Before tests
appium-doctor --android

# Check device
adb devices

# Verify connectivity
adb shell pm path com.anonymous.ehrmobile
```

## Monitoring and Alerts

### Test Failure Alerts
- Slack: Notify channel on failures
- Email: Send reports to team
- Jira: Create tickets for failures
- PagerDuty: Alert on-call engineer

### Metrics to Track
- Test pass rate
- Execution time
- Device availability
- Error frequency
- Performance degradation

## Troubleshooting CI/CD

### Common Issues

**Emulator fails to start**
```bash
# Increase memory and disk
emulator -avd test_emulator -memory 4096 -partition-size 1024

# Use snapshot
emulator -avd test_emulator -snapshot-load default_boot
```

**Tests timeout in CI but not locally**
```bash
# Increase timeouts in CI environment
TEST_TIMEOUT=60000  # 60 seconds
IMPLICIT_WAIT=20000  # 20 seconds

# Add logging
export APPIUM_LOG_LEVEL=debug
```

**Artifact upload fails**
```bash
# Ensure reports directory exists
mkdir -p appium-tests/reports

# Check file permissions
chmod -R 755 appium-tests/reports
```

---

For more information, see README.md and SETUP_WINDOWS.md
