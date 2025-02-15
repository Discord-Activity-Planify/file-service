# Guide to Run the File Service

This guide provides step-by-step instructions to set up and run the service.

#### Prerequisites
1. Ensure you have [Node.js](https://nodejs.org/) installed (preferably the latest LTS version).
2. Install `npm` (comes bundled with Node.js).
3. Set up a PostgreSQL database.

---

## 1. Install Node.js and npm
Ensure you have Node.js and npm installed on your system. You can download and install them from [Node.js official website](https://nodejs.org/).

To verify the installation:
```bash
node -v
npm -v
```

---

## 2. Install Dependencies
Run the following command to install the required dependencies:

```bash
npm install
```

---

## 3. Update the Config File

Example `config.js`:
```javascript
export default {
    app: {
        host: localhost,
        port: 3000
    },
    database: {
        username: your_database_username,
        password: your_database_password,
        name: your_database_name,
        host: your_database_host,
        port: 5432
    }
};
```

---

## 4. Run the Service
Start the application using the compiled JavaScript files:

```bash
node index.js
```

---
