# Customization Guide: Collections and Environments

## 🔄 Replacing Your Postman Collection

### Step 1: Export from Postman

1. **Open Postman Desktop App**
2. **Select your collection** in the sidebar
3. **Click the three dots (...)** next to collection name
4. **Choose "Export"**
5. **Select "Collection v2.1"** format
6. **Save as `Collection.json`**

### Step 2: Replace the Collection File

```bash
# Backup existing collection (optional)
cp Collection.json Collection_backup.json

# Replace with your new collection
# Copy your exported file and rename it to Collection.json
```

### Step 3: Validate Collection Structure

Your collection should include:
- **Authentication requests** (if needed)
- **Test scripts** with assertions
- **Pre-request scripts** for data setup
- **Proper error handling**

Example collection structure:
```json
{
  "info": {
    "name": "Your API Collection",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 200', function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "// Store auth token",
              "const response = pm.response.json();",
              "pm.environment.set('authToken', response.token);"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\"username\":\"{{username}}\",\"password\":\"{{password}}\"}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        }
      }
    }
  ]
}
```

## 🌍 Customizing Environment Variables

### Step 1: Export from Postman

1. **Click the environment dropdown** in Postman
2. **Select your environment**
3. **Click the eye icon** next to environment name
4. **Click "Download as JSON"**
5. **Save as `Environment.json`**

### Step 2: Replace Environment File

```bash
# Backup existing environment (optional)
cp Environment.json Environment_backup.json

# Replace with your new environment
# Copy your exported file and rename it to Environment.json
```

### Step 3: Environment Structure

Your environment should contain:
- **Base URLs** for different environments
- **Authentication credentials** (use variables, not hardcoded values)
- **API keys and tokens**
- **Test data variables**

Example environment structure:
```json
{
  "id": "your-environment-id",
  "name": "Your Environment",
  "values": [
    {
      "key": "baseUrl",
      "value": "https://api.yourcompany.com",
      "enabled": true
    },
    {
      "key": "username",
      "value": "test-user",
      "enabled": true
    },
    {
      "key": "password",
      "value": "test-password",
      "enabled": true
    },
    {
      "key": "authToken",
      "value": "",
      "enabled": true
    }
  ]
}
```

## 🔧 Advanced Customization

### Multiple Environment Support

Create different environment files for different stages:

```bash
# Development environment
Environment_dev.json

# Staging environment  
Environment_staging.json

# Production environment
Environment_prod.json
```

Update `config/config.js` to use different environments:

```javascript
// In config/config.js
development: {
  newman: {
    environment: path.join(__dirname, '..', 'Environment_dev.json')
  }
},
staging: {
  newman: {
    environment: path.join(__dirname, '..', 'Environment_staging.json')
  }
},
production: {
  newman: {
    environment: path.join(__dirname, '..', 'Environment_prod.json')
  }
}
```

### Custom Test Scripts

Add comprehensive test scripts to your collection:

```javascript
// Authentication test
pm.test("Authentication successful", function () {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    pm.expect(response).to.have.property('token');
    pm.environment.set('authToken', response.token);
});

// Response time test
pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

// Data validation test
pm.test("Response contains required fields", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('id');
    pm.expect(response).to.have.property('name');
    pm.expect(response.id).to.be.a('string');
});

// Status code validation
pm.test("Status code is 201 for creation", function () {
    pm.response.to.have.status(201);
});
```

### Pre-request Scripts for Dynamic Data

```javascript
// Generate random test data
const randomId = Math.floor(Math.random() * 1000000);
pm.environment.set('randomId', randomId);

const randomEmail = `test${randomId}@example.com`;
pm.environment.set('randomEmail', randomEmail);

// Generate timestamp
const timestamp = new Date().toISOString();
pm.environment.set('timestamp', timestamp);

// Generate UUID
const uuid = require('uuid');
pm.environment.set('requestId', uuid.v4());
```

## 🧪 Testing Your Customizations

### Step 1: Validate Collection

```bash
# Validate your setup
npm run validate
```

### Step 2: Test Individual Requests

```bash
# Test with development environment
npm run test:dev

# Test with staging environment
npm run test:staging
```

### Step 3: Debug Issues

```bash
# Run with verbose logging
DEBUG=* npm test

# Check specific collection issues
newman run Collection.json -e Environment.json --verbose
```

## 📋 Collection Best Practices

### 1. Proper Test Organization
- Group related requests in folders
- Use descriptive names for requests
- Add documentation to requests

### 2. Environment Variable Usage
- Never hardcode sensitive data
- Use variables for all URLs and credentials
- Keep environment-specific values separate

### 3. Comprehensive Testing
- Test both success and failure scenarios
- Validate response structure and data types
- Check response times and performance
- Test authentication and authorization

### 4. Error Handling
```javascript
// Robust error handling in tests
pm.test("API responds successfully or with expected error", function () {
    if (pm.response.code === 200) {
        // Success case validation
        const response = pm.response.json();
        pm.expect(response).to.have.property('data');
    } else if (pm.response.code === 400) {
        // Expected error case
        const error = pm.response.json();
        pm.expect(error).to.have.property('message');
    } else {
        // Unexpected error
        pm.expect.fail(`Unexpected status code: ${pm.response.code}`);
    }
});
```

### 5. Data Cleanup
```javascript
// Cleanup test data after tests
pm.test("Cleanup test data", function () {
    if (pm.environment.get('createdResourceId')) {
        // Add cleanup request or mark for cleanup
        pm.environment.set('needsCleanup', 'true');
    }
});
```
